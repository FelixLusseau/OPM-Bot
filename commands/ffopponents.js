const { SlashCommandBuilder } = require('discord.js');
const Discord = require("discord.js");
const { EmbedBuilder } = require('discord.js');
const functions = require('../utils/functions.js');
const fs = require('fs');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ffopponents')
        .setDescription('Replies info about the current opponents !')
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
                .setRequired(true))
        .addBooleanOption(option =>
            option.setName('text_version')
                .setDescription('Show the text version of the command too')),
    async execute(bot, api, interaction) {
        await interaction.deferReply({ ephemeral: false });
        const clan = interaction.options.getString('clan');
        let text = interaction.options.getBoolean('text_version'); // For text version too
        const opponentsEmbed = new EmbedBuilder();
        let Opponents = "";
        let scores = [];
        let charts = "";
        api.getClanCurrentRiverRace(clan) // Get info about the River Race
            .then((response) => {
                return response
            })
            .catch((err) => {
                console.log("CR-API error : ", err)
            })
        let RiverRace = await api.getClanCurrentRiverRace(clan)

        let opponentsText = "<ul style='font-size: 2em; text-align: left;'>\n";
        let Labels = []
        let seasons = []

        for (let i = 0; i < RiverRace.clans.length; i++) {
            api.getClanByTag(RiverRace.clans[i].tag) // Get the clans' info from the Supercell API
                .then((clan) => {
                    return clan
                })
                .catch((err) => {
                    console.log("CR-API error : ", err)
                })
            let clan = await api.getClanByTag(RiverRace.clans[i].tag)
            Labels.push(RiverRace.clans[i].name)
            // console.log("clan : " + RiverRace.clans[i].name)

            // Get the badges' data from the RoyaleAPI
            const badgesData = require('../utils/badges.json');
            for (let i = 0; i < badgesData.length; i++) {
                if (badgesData[i].id == clan.badgeId) {
                    opponentsText += "<li style='margin-bottom: 20px;'><img src='https://royaleapi.github.io/cr-api-assets/badges/" + badgesData[i].name + ".png' height='50'>&nbsp;\n"
                    break
                }
            }
            // Make the string from the clans' names, tags, locations, trophies and numbers of members
            Opponents += "- __**" + RiverRace.clans[i].name + "**__ " + " :\n" + RiverRace.clans[i].tag + ", " + clan.location.name + ", " + clan.clanWarTrophies + " tr, " + clan.members + " members\n\n"
            opponentsText += "<b><u><span style='font-size: 2.1em;'>" + RiverRace.clans[i].name + "</span></u></b> : <br>" + RiverRace.clans[i].tag + ", " + clan.location.name + ", " + clan.clanWarTrophies + " tr, " + clan.members + " members\n\n<br><br>"
            let history = await functions.fetchHist(RiverRace.clans[i].tag.substring(1)); // Get the clans' history from RoyaleAPI
            let clanScores = []
            for (let h = 0; h < history.items.length; h++) {
                // Add the colosseum history on the last seasons
                for (let s = 0; s < history.items[h].standings.length; s++) {
                    if (history.items[h].standings[s].clan.tag == RiverRace.clans[i].tag && history.items[h].standings[s].clan.fame > 11000) {
                        Opponents += "Season " + history.items[h].seasonId + " : **" + history.items[h].standings[s].rank
                        opponentsText += "Season " + history.items[h].seasonId + " : <b>" + history.items[h].standings[s].rank
                        switch (history.items[h].standings[s].rank) {
                            case 1:
                                Opponents += "st** with **"
                                opponentsText += "st</b> with <b>"
                                break;
                            case 2:
                                Opponents += "nd** with **"
                                opponentsText += "nd</b> with <b>"
                                break;
                            case 3:
                                Opponents += "rd** with **"
                                opponentsText += "rd</b> with <b>"
                                break;
                            default:
                                Opponents += "th** with **"
                                opponentsText += "th</b> with <b>"
                                break;
                        }
                        Opponents += history.items[h].standings[s].clan.fame + "**\n"
                        opponentsText += history.items[h].standings[s].clan.fame + "</b><br>\n"
                        clanScores.push(history.items[h].standings[s].clan.fame)
                        seasons.push(history.items[h].seasonId)
                    }
                }
            }
            scores.push(clanScores)
            Opponents += "\n\n"
            opponentsText += "</li>\n"
        }
        opponentsText += "</ul>\n"
        max = 180000 // Max value for the charts at Colosseum
        // console.log(Labels)
        // console.log(scores)
        for (let i = 0; i < scores[0].length; i++) {
            let Datas = []
            for (let j = 0; j < scores.length; j++) {
                Datas.push(scores[j][i])
            }
            const chart = functions.barChart('bar', Labels, Datas, max);
            const encodedChart = encodeURIComponent(JSON.stringify(chart));
            const chartUrl = `https://quickchart.io/chart?c=${encodedChart}`;
            charts += "<tr style='background-color: white; border: 1px solid black'>\n<td>Season : " + seasons[i] + "</td>\n<td><img src='" + chartUrl + "'></td>\n</tr>\n"
        }
        // Add a blank character to the end of the string to avoid a bug with the embed (force an empty line)
        Opponents += "\u200b"

        const tmpFile = (Math.random() + 1).toString(36).substring(7) + '.html';
        fs.readFile('./html/layout.html', 'utf8', function (err, data) {
            if (err) {
                return console.log(err);
            }
            fs.readFile('./html/ffopponents.html', 'utf8', function (err, data2) {
                if (err) {
                    return console.log(err);
                }

                let result = data2.replace(/{{ Charts }}/g, charts);
                result = result.replace(/{{ clan }}/g, (clansDict[clan] != undefined) ? clansDict[clan] : clan);
                result = result.replace(/{{ Opponents }}/g, opponentsText);

                let html = data.replace(/{{ body }}/g, result);

                fs.writeFile('./' + tmpFile, html, 'utf8', function (err) {
                    if (err) return console.log(err);
                });
            });

        });

        await functions.renderCommand(interaction, tmpFile, 0, 300)

        if (text != null) {
            const rand = Math.random().toString(36).slice(2); // Generate a random string to avoid the image cache
            try {
                opponentsEmbed
                    .setColor(0x0099FF)
                    .setTitle('__Current opponents__ :')
                    .setAuthor({ name: bot.user.tag, iconURL: 'https://cdn.discordapp.com/avatars/' + bot.user.id + '/' + bot.user.avatar + '.png' })
                    .setDescription(Opponents)
                    .setThumbnail('https://cdn.discordapp.com/attachments/527820923114487830/1071116873321697300/png_20230203_181427_0000.png')
                    .setTimestamp()
                    .setFooter({ text: 'by OPM | Féfé ⚡', iconURL: 'https://avatars.githubusercontent.com/u/94113911?s=400&v=4?' + rand });
            } catch (e) {
                console.log(e);
            }

            interaction.editReply({ embeds: [opponentsEmbed] });
        }
    },
};