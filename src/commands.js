'use strict';

const {
    SlashCommandBuilder,
    PermissionFlagsBits,
    ChannelType
} = require('discord.js');

const commands = [
    new SlashCommandBuilder()
        .setName('setvoice')
        .setDescription('Bot එකට රැඳී සිටිය යුතු Voice Channel එක තෝරන්න.')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
        .addChannelOption(option => option
            .setName('channel')
            .setDescription('Bot එකට සම්බන්ධ විය යුතු Voice Channel එක.')
            .addChannelTypes(ChannelType.GuildVoice)
            .setRequired(true)),

    new SlashCommandBuilder()
        .setName('setstream')
        .setDescription('Bot profile එකේ Streaming link එක සකසන්න (සියලු servers සඳහා).')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
        .addStringOption(option => option
            .setName('url')
            .setDescription('Twitch හෝ YouTube HTTPS link එක.')
            .setMaxLength(200)
            .setRequired(true)),

    new SlashCommandBuilder()
        .setName('timer')
        .setDescription('Bot එකේ 24/7 live streaming timer එක බලන්න.'),

    new SlashCommandBuilder()
        .setName('status')
        .setDescription('මේ server එකේ voice connection සහ bot status බලන්න.'),

    new SlashCommandBuilder()
        .setName('reset')
        .setDescription('Global streaming timer එක අලුත් අගයකින් නැවත පටන් ගන්න.')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
        .addIntegerOption(option => option
            .setName('hours')
            .setDescription('අලුත් ආරම්භක පැය ගණන (Default: 0).')
            .setMinValue(0)
            .setMaxValue(10_000_000)
            .setRequired(false))
].map(command => command.toJSON());

module.exports = { commands };
