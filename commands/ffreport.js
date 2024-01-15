const { SlashCommandBuilder } = require('discord.js');
const reports = require('../utils/reports.js');
const functions = require('../utils/functions.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ffreport')
        .setDescription('Manually trigger the report !')
        .addStringOption(option =>
            option.setName('clan')
                .setDescription('Clan to check')
                .setAutocomplete(true)
                .setRequired(true))
        .addStringOption(option =>
            option.setName('custom_tag')
                .setDescription('Tag of the foreign clan to check (nothing happens if wrong)')),
    async execute(bot, api, interaction) {
        await interaction.reply({ ephemeral: false, content: "War Report" });
        let clan = interaction.options.getString('clan');
        if (functions.isRegisteredClan(bot, interaction, interaction.channel, clan) == false) // Check if the clan is registered
            return
        if (interaction.options.getString('custom_tag') && functions.isValidTag(interaction.options.getString('custom_tag'))) { // For a custom tag clan
            clan = interaction.options.getString('custom_tag');
        }
        const channel = interaction.channel; // Get the channel where the command was executed from the interaction
        const guildID = interaction.guildId; // Get the guild ID where the command was executed from the interaction
        reports.report(bot, api, null, false, channel, clan, guildID)
    },
};