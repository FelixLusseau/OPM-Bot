const { SlashCommandBuilder } = require('discord.js');
const Discord = require("discord.js");
const { EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ffmembers')
        .setDescription('Replies the current members of the clan !')
        .addStringOption(option =>
            option.setName('clan')
                .setDescription('The clan to check')
                .addChoices(
                    { name: 'OPM', value: '#YRLJGL9' },
                    { name: 'NF', value: '#L2L8V08' },
                    { name: 'TDS', value: '#LVQ8P8YG' },
                    { name: '100pct', value: '#LLUC90PP' },
                    { name: 'TPM', value: '#G2CY2PPL' },
                )
                .setRequired(true)),
    async execute(bot, api, interaction) {
        await interaction.deferReply({ ephemeral: false });
        const clan = interaction.options.getString('clan');
        const membersEmbed = new EmbedBuilder();
        api.getClanMembers(clan) // Get the clans' members from the Supercell API
            .then((response) => {
                return response
            })
            .catch((err) => {
                console.log("CR-API error : ", err)
            })
        let response = await api.getClanMembers(clan)
        let Members = "";
        Members += "**" + response.length + " members**\n\n"
        // Make the string with the members' names, tags, roles, levels and trophies
        for (let i = 0; i < response.length; i++) {
            Members += "- **" + response[i].name + "** \n(" + response[i].tag + ", " + response[i].role + ", lvl" + response[i].expLevel + ", " + response[i].trophies + " tr)" + "\n\n"
        }
        try {
            membersEmbed
                .setColor(0x0099FF)
                .setTitle('__Current clan members__ :')
                .setAuthor({ name: bot.user.tag, iconURL: 'https://cdn.discordapp.com/avatars/' + bot.user.id + '/' + bot.user.avatar + '.png' })
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