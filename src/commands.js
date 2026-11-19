'use strict';

const {
    SlashCommandBuilder,
    PermissionFlagsBits,
    ChannelType
} = require('discord.js');

const commands = [
    new SlashCommandBuilder()
        .setName('setvoice')
        .setDescription('Select the target voice channel for the bot to join and stay 24/7.')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
        .addChannelOption(option => option
            .setName('channel')
            .setDescription('The voice channel for the bot to connect to.')
            .addChannelTypes(ChannelType.GuildVoice)
            .setRequired(true)),

    new SlashCommandBuilder()
        .setName('setstream')
        .setDescription('Set the streaming presence URL on the bot profile (global across all servers).')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
        .addStringOption(option => option
            .setName('url')
            .setDescription('A valid Twitch or YouTube HTTPS streaming link.')
            .setMaxLength(200)
            .setRequired(true)),

    new SlashCommandBuilder()
        .setName('timer')
        .setDescription('Display the bot 24/7 live streaming timer and connection telemetry.'),

    new SlashCommandBuilder()
        .setName('status')
        .setDescription('Check voice connection and bot status in this server.'),

    new SlashCommandBuilder()
        .setName('reset')
        .setDescription('Reset or reseed the global streaming timer with a new start hour.')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
        .addIntegerOption(option => option
            .setName('hours')
            .setDescription('New starting hour offset (Default: 0).')
            .setMinValue(0)
            .setMaxValue(10_000_000)
            .setRequired(false))
].map(command => command.toJSON());

module.exports = { commands };
