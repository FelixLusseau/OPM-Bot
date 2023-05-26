const { SlashCommandBuilder } = require('discord.js');
const Discord = require("discord.js");
const { EmbedBuilder } = require('discord.js');
const fs = require('fs');
const schedule = require('../utils/schedule.js');

function isValidTimeFormat(input) {
    // Regular expression pattern to match "hh:mm" format
    const regex = /^([01]\d|2[0-3]):([0-5]\d)$/;

    // Check if the input matches the pattern
    return regex.test(input);
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ffsethour')
        .setDescription('Set the hour for the reset and report !')
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
                .setRequired(true))
        .addStringOption(option =>
            option.setName('hour')
                .setDescription('The hour to set at hh:mm format')
                .setRequired(true)
        ),
    async execute(bot, api, interaction) {
        await interaction.deferReply({ ephemeral: false });
        const clan = interaction.options.getString('clan');
        const hour = interaction.options.getString('hour');
        const resultsEmbed = new EmbedBuilder();
        let valid = false;
        api.getClanByTag(clan)
            .then((clan) => {
                return clan
            })
            .catch((err) => {
                console.log("CR-API error : ", err)
            })
        let APIClan = await api.getClanByTag(clan)

        if (isValidTimeFormat(hour)) {
            valid = true;
            try {
                fs.writeFileSync('./reset-hours/' + APIClan.name, hour);
            } catch (err) {
                console.error(err);
            }
            reportCron[APIClan.name].stop
            reportTimes[APIClan.name] = hour;
            schedule.schedule(bot, APIClan.name, hour, clan, process.env.OPM_GUILD_ID)
            // console.log(reportTimes)
        }
        else {
            valid = false;
        }
        try {
            resultsEmbed
                .setColor(0x0099FF)
                .setAuthor({ name: bot.user.tag, iconURL: 'https://cdn.discordapp.com/avatars/' + bot.user.id + '/' + bot.user.avatar + '.png' /* , url: 'https://discord.js.org' */ })
                .setDescription((valid ? "`" + hour + "` is now the reset hour for **" + APIClan.name + "** !" : "**" + hour + "** is not a valid hour !"))
                .setThumbnail('https://cdn.discordapp.com/attachments/527820923114487830/1071116873321697300/png_20230203_181427_0000.png')
                .setTimestamp()
                .setFooter({ text: 'by OPM | Féfé ⚡', iconURL: 'https://avatars.githubusercontent.com/u/94113911?s=400&v=4' });
        } catch (e) {
            console.log(e);
        }

        interaction.editReply({ embeds: [resultsEmbed] });
    },
};