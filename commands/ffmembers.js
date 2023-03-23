const { SlashCommandBuilder } = require('discord.js');
const Discord = require("discord.js");
const { EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ffmembers')
        .setDescription('Replies the current members of the clan !'),
    async execute(bot, api, interaction) {
        await interaction.deferReply({ ephemeral: false });
        const membersEmbed = new EmbedBuilder();
        api.getClanMembers("#YRLJGL9")
            .then((response) => {
                //console.log(response)
                return response
            })
            .catch((err) => {
                console.log("CR-API error : ", err)
            })
        let response = await api.getClanMembers("#YRLJGL9")
        let Members = "";
        //console.log(response.length)
        Members += "**" + response.length + " members**\n\n"
        for (let i = 0; i < response.length; i++) {
            Members += "- **" + response[i].name + "** \n(" + response[i].tag + ", " + response[i].role + ", " + response[i].expLevel + " lvl, " + response[i].trophies + " tr)" + "\n\n"
        }
        //console.log(Members)
        try {
            membersEmbed
                .setColor(0x0099FF)
                .setTitle('__Current clan members__ :')
                .setAuthor({ name: bot.user.tag, iconURL: bot.user.avatar /* , url: 'https://discord.js.org' */ })
                .setDescription(Members)
                .setThumbnail('https://cdn.discordapp.com/attachments/527820923114487830/1071116873321697300/png_20230203_181427_0000.png')
                .setTimestamp()
                .setFooter({ text: 'by OPM | Féfé ⚡', iconURL: 'https://avatars.githubusercontent.com/u/94113911?s=400&v=4' });
        } catch (e) {
            console.log(e);
        }

        interaction.editReply({ embeds: [membersEmbed] });
    },
};