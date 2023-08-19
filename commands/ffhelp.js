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
            + "- `/ffattacks` : Shows the remaining attacks of the day\n"
            + "- `/ffavg` : Shows the average war points of the players sending an Excel spreadsheet and the associated png\n"
            + "- `/ffgethours` : Shows the hours of the daily reports and resets\n"
            + "- `/ffgetrotates` : Shows the rotations of the players between the clans\n"
            + "- `/ffmembers` : Shows the members of the clan\n"
            + "- `/ffopponents` : Shows information about the war opponents\n"
            + "- `/ffrace` : Shows the current war day status (or Colosseum)\n"
            + "- `/ffresults` : Shows the points of all the war participants\n"
            + "- `/ffriver` : Shows the current river race (or Colosseum)\n"
            + "- `/ffreport` : Shows the war report\n"
            + "- `/ffrmrotate` : Removes an entry from the rotations\n"
            + "- `/ffsethours` : Sets the hours for the daily reports and resets\n"
            + "- `/ffsetrotates` : Sets the rotations of the players between the clans\n"
            + "\u200B"

        const rand = Math.random().toString(36).slice(2); // Generate a random string to avoid the image cache
        try {
            helpEmbed
                .setColor(0x0099FF)
                .setTitle('__Help menu__ :')
                .setAuthor({ name: bot.user.tag, iconURL: 'https://cdn.discordapp.com/avatars/' + bot.user.id + '/' + bot.user.avatar + '.png' })
                .setDescription(Help)
                .setThumbnail('https://cdn.discordapp.com/attachments/527820923114487830/1071116873321697300/png_20230203_181427_0000.png')
                .setTimestamp()
                .setFooter({ text: 'by OPM | Féfé ⚡', iconURL: 'https://avatars.githubusercontent.com/u/94113911?s=400&v=4?' + rand });
        } catch (e) {
            console.log(e);
        }

        interaction.reply({ embeds: [helpEmbed] });
    },
};