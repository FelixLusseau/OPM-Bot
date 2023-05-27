const { SlashCommandBuilder } = require('discord.js');
const { EmbedBuilder } = require('discord.js');
const fs = require('fs');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ffgethours')
        .setDescription('Get the hours for the reset and report !'),
    async execute(bot, api, interaction) {
        await interaction.deferReply({ ephemeral: false });
        const resultsEmbed = new EmbedBuilder();
        let clans = [];
        fs.readdirSync('./reset-hours/').forEach(file => { // Browse the reset-hours folder and add the files to the clans array
            clans.push(file);
        });
        let hours = "";
        // Make the brief
        clans.forEach(clan => {
            let hour = fs.readFileSync('./reset-hours/' + clan, 'utf8');
            hours += "- **" + clan + "** : `" + hour + "`\n";
        });
        try {
            resultsEmbed
                .setColor(0x0099FF)
                .setTitle('__Reset hours__')
                .setAuthor({ name: bot.user.tag, iconURL: 'https://cdn.discordapp.com/avatars/' + bot.user.id + '/' + bot.user.avatar + '.png' })
                .setDescription(hours)
                .setThumbnail('https://cdn.discordapp.com/attachments/527820923114487830/1071116873321697300/png_20230203_181427_0000.png')
                .setTimestamp()
                .setFooter({ text: 'by OPM | Féfé ⚡', iconURL: 'https://avatars.githubusercontent.com/u/94113911?s=400&v=4' });
        } catch (e) {
            console.log(e);
        }

        interaction.editReply({ embeds: [resultsEmbed] });
    },
};