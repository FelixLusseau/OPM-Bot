const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const functions = require('../utils/functions.js');
const fs = require('fs');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ffriver')
        .setDescription('Replies the current river scores and positions !')
        .addStringOption(option =>
            option.setName('clan')
                .setDescription('Clan to check')
                .setAutocomplete(true)
                .setRequired(true))
        .addStringOption(option =>
            option.setName('custom_tag')
                .setDescription('Tag of the foreign clan to check (nothing happens if wrong)'))
        .addBooleanOption(option =>
            option.setName('text_version')
                .setDescription('Show the text version of the command too')),
    async execute(bot, api, interaction) {
        await interaction.deferReply({ ephemeral: false });
        let clan = interaction.options.getString('clan');
        if (functions.isRegisteredClan(bot, interaction, interaction.channel, clan) == false) // Check if the clan is registered
            return
        let text = interaction.options.getBoolean('text_version'); // For text version too
        if (interaction.options.getString('custom_tag') != null) { // For a custom tag clan
            let custom_tag = interaction.options.getString('custom_tag');
            const regex = /\#[a-zA-Z0-9]{8,9}\b/g
            if (custom_tag.search(regex) >= 0) {
                custom_tag = (custom_tag[0] == "#") ? custom_tag : "#" + custom_tag;
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
        let Labels = [];
        let Datas = [];
        let Race = "";

        let RiverRace = null
        try {
            RiverRace = await api.getClanCurrentRiverRace(clan)// Get info about the River Race
        } catch (error) {
            functions.errorEmbed(bot, interaction, channel, error)
            return
        }

        // Chart data processing
        for (let i = 0; i < RiverRace.clans.length; i++) {
            let labels = RiverRace.clans[i].name
            Labels.push(labels);
            let data = RiverRace.clans[i].fame
            Datas.push(data);
        }

        RiverRace.clans.sort((a, b) => (a.fame < b.fame) ? 1 : -1) // Sort clans by fame
        for (let i = 0; i < RiverRace.clans.length; i++) {
            // If the clan has already reached 10k fame in normal days, show it as finished
            if (RiverRace.periodType != "colosseum" && RiverRace.clans[i].fame >= 10000) {
                if (interaction != null)
                    Race += "- __"
                        + (RiverRace.clans[i].tag == clan ? "**" + RiverRace.clans[i].name + "**" : RiverRace.clans[i].name)
                        + "__ : **War finished**\n<:Retro:1010557231214886933> Tag : "
                        + RiverRace.clans[i].tag + "\n\n"
                else
                    Race += "- __"
                        + (RiverRace.clans[i].tag == clan ? "**" + RiverRace.clans[i].name + "**" : RiverRace.clans[i].name)
                        + "__ : **War finished**\n Tag : "
                        + RiverRace.clans[i].tag + "\n\n"
                continue
            }
            // Else show the current name, tag and fame
            if (interaction != null)
                Race += "- __"
                    + (RiverRace.clans[i].tag == clan ? "**" + RiverRace.clans[i].name + "**" : RiverRace.clans[i].name)
                    + "__ :\n<:Retro:1010557231214886933> Tag : "
                    + RiverRace.clans[i].tag
                    + "\n<:fame:876320149878235136> Pts : **"
                    + RiverRace.clans[i].fame
                    + "**\n\n"
            else
                Race += "- __"
                    + (RiverRace.clans[i].tag == clan ? "**" + RiverRace.clans[i].name + "**" : RiverRace.clans[i].name)
                    + "__ :\n Tag : "
                    + RiverRace.clans[i].tag
                    + "\n Pts : **"
                    + RiverRace.clans[i].fame
                    + "**\n\n"
        }

        // Define the max value of the chart depending on the periode type
        let max = 0
        if (RiverRace.periodType == "colosseum") max = 180000
        else max = 10000

        // Chart creation
        const chart = functions.barChart('bar', Labels, Datas, max);
        const encodedChart = encodeURIComponent(JSON.stringify(chart));
        const chartUrl = `https://quickchart.io/chart?c=${encodedChart}`;
        // console.log(chartUrl);

        const tmpFile = (Math.random() + 1).toString(36).substring(7) + '.html';
        fs.readFile('./html/layout.html', 'utf8', function (err, data) {
            if (err) {
                return console.log(err);
            }
            fs.readFile('./html/ffriver.html', 'utf8', function (err, data2) {
                if (err) {
                    return console.log(err);
                }

                let result = data2.replace(/{{ Chart }}/g, chartUrl);
                result = result.replace(/{{ clan }}/g, (clansDict[clan] != undefined) ? clansDict[clan] : clan);

                let html = data.replace(/{{ body }}/g, result);

                fs.writeFile('./' + tmpFile, html, 'utf8', function (err) {
                    if (err) return console.log(err);
                });
            });

        });

        await functions.renderCommand(interaction, tmpFile, 0, 0)

        if (text != null) {
            const riverEmbed = new EmbedBuilder();
            const rand = Math.random().toString(36).slice(2); // Generate a random string to avoid the image cache
            try {
                riverEmbed
                    .setColor(0x7C0404)
                    .setTitle((RiverRace.periodType == "colosseum") ? "__Colosseum__ :" : "__Current river race__ :")
                    .setAuthor({ name: bot.user.tag, iconURL: 'https://cdn.discordapp.com/avatars/' + bot.user.id + '/' + bot.user.avatar + '.png' })
                    .setDescription(Race)
                    .setThumbnail('https://cdn.discordapp.com/attachments/527820923114487830/1071116873321697300/png_20230203_181427_0000.png')
                    .setImage(chartUrl)
                    .setTimestamp()
                    .setFooter({ text: 'by OPM | Féfé ⚡', iconURL: 'https://avatars.githubusercontent.com/u/94113911?s=400&v=4?' + rand });
            } catch (e) {
                console.log(e);
            }

            interaction.editReply({ embeds: [riverEmbed] });
        }
    },
};