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
        if (interaction.options.getString('custom_tag') != null) { // For a custom tag clan
            let custom_tag = interaction.options.getString('custom_tag');
            const regex = /\#[a-zA-Z0-9]{8,9}\b/g
            if (custom_tag.search(regex) >= 0) {
                custom_tag = (custom_tag[0] == "#") ? custom_tag : "#" + custom_tag;
                clan = (interaction.options.getString('custom_tag')[0] == "#") ? interaction.options.getString('custom_tag') : "#" + interaction.options.getString('custom_tag');
                try {
                    const statusCode = await functions.http_head("/clan/" + custom_tag.substring(1));
                    // console.log('Status Code:', statusCode);
                    if (statusCode == 200)
                        clan = custom_tag;
                } catch (error) {
                    console.error('Error:', error);
                }
            }
        }
        const channel = interaction.channel; // Get the channel where the command was executed from the interaction
        const guildID = interaction.guildId; // Get the guild ID where the command was executed from the interaction
        reports.report(bot, api, null, false, channel, clan, guildID)
    },
};