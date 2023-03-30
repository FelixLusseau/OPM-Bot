const { SlashCommandBuilder } = require('discord.js');
const Discord = require("discord.js");
const { EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ffhelp')
        .setDescription('Shows the help menu !'),
    async execute(bot, api, interaction) {
        const helpEmbed = new EmbedBuilder();
        const Help = "\u200B\n__Commands list__ :\n\n"
            + "- `/ffhelp` : Shows this help menu\n"
            + "- `/ffmembers` : Shows the members of the clan\n"
            + "- `/ffopponents` : Shows information about the war opponents\n"
            + "- `/ffrace` : Shows the current war day status (or Colosseum)\n"
            + "- `/ffresults` : Shows the points of all the war participants\n"
            + "- `/ffriver` : Shows the current river race (or Colosseum)\n"
            + "\u200B"
        try {
            helpEmbed
                .setColor(0x0099FF)
                .setTitle('__Help menu__ :')
                .setAuthor({ name: bot.user.tag, iconURL: bot.user.avatar /* , url: 'https://discord.js.org' */ })
                .setDescription(Help)
                .setThumbnail('https://cdn.discordapp.com/attachments/527820923114487830/1071116873321697300/png_20230203_181427_0000.png')
                .setTimestamp()
                .setFooter({ text: 'by OPM | Féfé ⚡', iconURL: 'https://avatars.githubusercontent.com/u/94113911?s=400&v=4' });
        } catch (e) {
            console.log(e);
        }

        interaction.reply({ embeds: [helpEmbed] });
    },
};