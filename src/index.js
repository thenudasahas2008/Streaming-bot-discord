'use strict';

const http = require('node:http');
const {
    Client,
    GatewayIntentBits,
    Events,
    PermissionFlagsBits,
    MessageFlags,
    REST,
    Routes,
    EmbedBuilder
} = require('discord.js');

const CONFIG = require('./config');
const { JsonStore } = require('./storage');
const { commands } = require('./commands');
const { SettingsService } = require('./services/settings-service');
const { TimerService } = require('./services/timer-service');
const { PresenceManager } = require('./services/presence-manager');
const { VoiceManager } = require('./services/voice-manager');
const { validateStreamUrl } = require('./lib/stream-url');

const logger = {
    info: (...args) => console.log(new Date().toISOString(), '[INFO]', ...args),
    warn: (...args) => console.warn(new Date().toISOString(), '[WARN]', ...args),
    error: (...args) => console.error(new Date().toISOString(), '[ERROR]', ...args)
};

if (!CONFIG.token || CONFIG.token === 'PASTE_YOUR_BOT_TOKEN_HERE') {
    throw new Error('Please configure BOT_TOKEN in your environment variables or .env file.');
}

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildVoiceStates
    ],
    allowedMentions: {
        parse: [],
        repliedUser: false
    }
});

const store = new JsonStore();
const settingsService = new SettingsService({
    store,
    filePath: CONFIG.settingsFile,
    defaultStreamUrl: CONFIG.defaultStreamUrl,
    legacyVoiceTargets: CONFIG.legacyVoiceTargets
});
const timerService = new TimerService({
    store,
    filePath: CONFIG.timerFile,
    initialHours: CONFIG.baseElapsedHours
});

const presenceManager = new PresenceManager({
    client,
    timerService,
    settingsService,
    intervalMs: CONFIG.presenceIntervalMs,
    logger
});

const voiceManager = new VoiceManager({
    client,
    settingsService,
    reconnectDelayMs: CONFIG.reconnectDelayMs,
    maxReconnectDelayMs: CONFIG.reconnectMaxDelayMs,
    logger
});

let bootstrapComplete = false;
let shuttingDown = false;
let persistenceInterval = null;

function createStatusEmbed(interaction) {
    const elapsed = timerService.getElapsed();
    const voice = voiceManager.getStatus(interaction.guildId);
    const streamUrl = settingsService.getStreamUrl();
    const configuredGuildCount = settingsService.getConfiguredGuildIds().length;

    const embed = new EmbedBuilder()
        .setColor(voice.connected ? 0x22c55e : 0xf59e0b)
        .setTitle('ZYRO Streaming System')
        .addFields(
            {
                name: 'Timer',
                value: `**${elapsed.formatted}**`,
                inline: true
            },
            {
                name: 'Voice Connection',
                value: voice.connected ? '🟢 Connected' : `🟠 ${voice.state}`,
                inline: true
            },
            {
                name: 'Pinned Channel',
                value: voice.targetChannelId
                    ? `<#${voice.targetChannelId}>`
                    : 'Not configured — Use /setvoice',
                inline: true
            },
            {
                name: 'Streaming URL',
                value: streamUrl ? [Configured]() : 'Not configured — Use /setstream',
                inline: false
            },
            {
                name: 'Configured Servers',
                value: String(configuredGuildCount),
                inline: true
            }
        )
        .setFooter({ text: 'Streaming timer increments continuously across restarts.' })
        .setTimestamp();

    return embed;
}

async function registerCommands() {
    const rest = new REST({ version: '10' }).setToken(CONFIG.token);
    const route = CONFIG.devGuildId
        ? Routes.applicationGuildCommands(client.application.id, CONFIG.devGuildId)
        : Routes.applicationCommands(client.application.id);

    await rest.put(route, { body: commands });
    logger.info(
        CONFIG.devGuildId
            ? `Slash commands registered for test guild ${CONFIG.devGuildId}.`
            : 'Global slash commands registered.'
    );
}

async function bootstrap() {
    try {
        await settingsService.initialize();
        await timerService.initialize();

        try {
            await registerCommands();
        } catch (error) {
            logger.error('Slash command registration failed:', error.message);
        }

        presenceManager.start();
        await voiceManager.connectConfiguredGuilds();

        persistenceInterval = setInterval(() => {
            timerService.persist().catch(error => {
                logger.error('Timer persistence failed:', error.message);
            });
        }, 5 * 60 * 1000);
        persistenceInterval.unref?.();

        bootstrapComplete = true;
        logger.info(`Ready as ${client.user.tag}.`);
        logger.info(`Timer restored: ${timerService.getElapsed().formatted}.`);
    } catch (error) {
        logger.error('Startup failed:', error);
        await shutdown('BOOTSTRAP_ERROR');
        process.exitCode = 1;
    }
}

async function executeCommand(interaction) {
    const commandName = interaction.commandName;
    const isAdminCommand = ['setvoice', 'setstream', 'reset'].includes(commandName);

    if (['setvoice', 'status'].includes(commandName) && !interaction.inGuild()) {
        await interaction.reply({
            content: 'This command can only be used inside a Discord server (guild).',
            flags: MessageFlags.Ephemeral
        });
        return;
    }

    if (isAdminCommand && !interaction.memberPermissions?.has(PermissionFlagsBits.ManageGuild)) {
        await interaction.reply({
            content: 'You need the **Manage Server** permission to execute this command.',
            flags: MessageFlags.Ephemeral
        });
        return;
    }

    await interaction.deferReply({ flags: MessageFlags.Ephemeral });

    try {
        switch (commandName) {
            case 'setvoice': {
                const channel = interaction.options.getChannel('channel', true);
                const botMember = interaction.guild.members.me || await interaction.guild.members.fetchMe();
                const permissions = channel.permissionsFor(botMember);

                if (!permissions?.has(PermissionFlagsBits.ViewChannel) ||
                    !permissions?.has(PermissionFlagsBits.Connect)) {
                    await interaction.editReply(
                        'Please grant the bot **View Channel** and **Connect** permissions in this channel.'
                    );
                    return;
                }

                await settingsService.setVoiceChannel(interaction.guildId, channel.id);

                try {
                    await voiceManager.connectGuild(interaction.guildId);
                    await interaction.editReply(
                        `✅ Bot connected to <#>. Target voice channel saved and will auto-reconnect on restart.`
                    );
                } catch (error) {
                    await interaction.editReply(
                        `Channel saved, but failed to connect immediately. Automatic reconnection will retry.
**Reason:** `
                    );
                }
                return;
            }

            case 'setstream': {
                const url = interaction.options.getString('url', true);
                const validation = validateStreamUrl(url);

                if (!validation.valid) {
                    await interaction.editReply(`❌ ${validation.reason}`);
                    return;
                }

                await settingsService.setStreamUrl(validation.url);
                presenceManager.update();

                await interaction.editReply(
                    `✅ Streaming presence URL updated successfully.


This applies globally to the bot presence across all servers.`
                );
                return;
            }

            case 'timer': {
                const elapsed = timerService.getElapsed();
                await interaction.editReply(
                    `⏱️ ****
Seconds: 

Timer increments continuously even across bot restarts.`
                );
                return;
            }

            case 'status': {
                await interaction.editReply({ embeds: [createStatusEmbed(interaction)] });
                return;
            }

            case 'reset': {
                const hours = interaction.options.getInteger('hours') ?? 0;
                const elapsed = await timerService.reset(hours);
                presenceManager.update();

                await interaction.editReply(
                    `✅ Global streaming timer re-initialized from ****.
This applies globally to the bot presence across all servers.`
                );
                return;
            }

            default:
                await interaction.editReply('Unrecognized slash command.');
        }
    } catch (error) {
        logger.error(`Command /${commandName} failed:`, error);
        const message = ❌ Failed to execute command: ;

        if (interaction.deferred || interaction.replied) {
            await interaction.editReply(message).catch(() => {});
        } else {
            await interaction.reply({
                content: message,
                flags: MessageFlags.Ephemeral
            }).catch(() => {});
        }
    }
}

client.once(Events.ClientReady, readyClient => {
    logger.info(`Discord login successful: ${readyClient.user.tag}`);
    bootstrap().catch(error => {
        logger.error('Unhandled bootstrap failure:', error);
    });
});

client.on(Events.InteractionCreate, interaction => {
    if (!interaction.isChatInputCommand()) return;
    executeCommand(interaction).catch(error => {
        logger.error('Interaction handler failed:', error);
    });
});

client.on(Events.VoiceStateUpdate, (oldState, newState) => {
    voiceManager.handleVoiceStateUpdate(oldState, newState);
});

client.on(Events.GuildCreate, guild => {
    if (settingsService.getGuild(guild.id)?.voiceChannelId) {
        voiceManager.scheduleReconnect(guild.id, 2_000);
    }
});

client.on(Events.GuildDelete, guild => {
    const connection = voiceManager.getConnection(guild.id);
    connection?.destroy();
});

client.on(Events.Error, error => {
    logger.error('Discord client error:', error);
});

process.on('unhandledRejection', error => {
    logger.error('Unhandled promise rejection:', error);
});

async function shutdown(signal) {
    if (shuttingDown) return;
    shuttingDown = true;

    logger.warn(`Shutting down (${signal})...`);
    presenceManager.stop();

    if (persistenceInterval) clearInterval(persistenceInterval);
    voiceManager.shutdown();

    if (bootstrapComplete || timerService.initialized) {
        await timerService.persist().catch(error => {
            logger.error('Final timer save failed:', error.message);
        });
    }

    server.close();
    client.destroy();
}

process.once('SIGINT', () => shutdown('SIGINT'));
process.once('SIGTERM', () => shutdown('SIGTERM'));

const PORT = process.env.PORT || 3000;
const server = http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    let timerInfo = 'initializing';
    try {
        if (timerService.initialized) {
            timerInfo = timerService.getElapsed();
        }
    } catch {}

    const payload = {
        status: 'online',
        service: 'ZYRO 24/7 Discord Streaming Bot',
        bot: client.user?.tag || 'connecting',
        timer: timerInfo?.formatted || timerInfo,
        detailed_timer: timerInfo?.detailed || '0h 00m 00s',
        uptime_seconds: Math.floor(process.uptime()),
        timestamp: new Date().toISOString()
    };

    res.end(JSON.stringify(payload, null, 2));
});

server.listen(PORT, () => {
    logger.info(`[HTTP SERVER] Health check listening on port ${PORT} (Render 24/7 Ready)`);
});

client.login(CONFIG.token).catch(error => {
    logger.error('Discord login failed:', error.message);
    process.exitCode = 1;
});
