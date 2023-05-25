const { SlashCommandBuilder } = require('discord.js');
const Discord = require("discord.js");
const reports = require('../utils/reports.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ffreport')
        .setDescription('Manually trigger the report !')
        .addStringOption(option =>
            option.setName('clan')
                .setDescription('Clan to check')
                .addChoices(
                    { name: 'OPM', value: '#YRLJGL9' },
                    { name: 'NF', value: '#L2L8V08' },
                    { name: 'TDS', value: '#LVQ8P8YG' },
                    { name: '100pct', value: '#LLUC90PP' },
                    { name: 'TPM', value: '#G2CY2PPL' },
                )
                .setRequired(true)),
    async execute(bot, api, interaction) {
        await interaction.reply({ ephemeral: true, content: "War Report" });
        const clan = interaction.options.getString('clan');
        const channel = interaction.channel;
        const guild = interaction.guildId;
        reports.report(bot, api, null, false, guild, channel, clan)
    },
};