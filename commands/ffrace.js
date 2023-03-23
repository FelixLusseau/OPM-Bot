const { SlashCommandBuilder } = require('discord.js');
const Discord = require("discord.js");
const { EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ffrace')
        .setDescription('Replies the current race !'),
    async execute(bot, api, interaction) {
        await interaction.deferReply({ ephemeral: false });
        const raceEmbed = new EmbedBuilder();
        let Labels = [];
        let Datas = [];
        let Race = "";
        api.getClanCurrentRiverRace("#YRLJGL9")
            .then((response) => {
                //console.log(response.clans.periodLogs)
                return response
            })
            .catch((err) => {
                console.log("CR-API error : ", err)
            })
        let RiverRace = await api.getClanCurrentRiverRace("#YRLJGL9")
        for (let i = 0; i < RiverRace.clans.length; i++) {
            let labels = RiverRace.clans[i].name
            Labels.push(labels);
            let data = RiverRace.clans[i].periodPoints
            Datas.push(data);
            //console.log(RiverRace.clans[i].name)
            //console.log(RiverRace.clans[i].periodPoints)

            api.getClanByTag(RiverRace.clans[i].tag)
                .then((clan) => {
                    //console.log(clan)
                    return clan
                })
                .catch((err) => {
                    console.log("CR-API error : ", err)
                })
            let clan = await api.getClanByTag(RiverRace.clans[i].tag)
            //console.log(clan)
            // console.log(clan.name)
            // console.log(clan.tag)
            // console.log(clan.badgeId)
            // console.log(clan.members)
            // console.log(clan.clanWarTrophies)
            // console.log(clan.location.name)

            /* for (let i = 0; i < badgesData.length; i++) {
                //console.log(badgesData[i].id)
                if (badgesData[i].id == clan.badgeId) {
                  Race += ":https://raw.githubusercontent.com/RoyaleAPI/cr-api-assets/master/badges/" + badgesData[i].name + ".png:"
                  break
                }
            } */
            //console.log(RiverRace.clans[i])
            //console.log(RiverRace.clans[i].participants.length)
            let decksRemaining = 200
            for (let j = 0; i < RiverRace.clans[i].participants.length; j++) {
                //console.log(RiverRace.clans[i].participants[j])
                if (RiverRace.clans[i].participants[j] == undefined) // strange bug to correct
                    break
                decksRemaining -= RiverRace.clans[i].participants[j].decksUsedToday
            }
            //console.log(decksRemaining)
            let ratio = (RiverRace.clans[i].periodPoints / (200 - decksRemaining)).toFixed(2).toString()
            Race += "- __" + RiverRace.clans[i].name + "__ " + " :" + "\n(" + RiverRace.clans[i].tag + ", " + clan.location.name + ", " + clan.clanWarTrophies + " tr, " + clan.members + " members)\n**Pts : " + RiverRace.clans[i].periodPoints + "\nRatio : " + ratio + "\nDecks : " + decksRemaining + "**\n\n"
        }
        // console.log(RiverRace.clan)
        // console.log(Labels)
        // console.log(Datas)
        let max = 45000;
        if (RiverRace.clan.periodPoints > max) { // Collosseum
            max = 135000;
        }
        const chart = {
            type: 'horizontalBar',
            data: {
                labels: Labels,
                datasets: [
                    {
                        label: 'Medals',
                        data: Datas,
                        backgroundColor: ['rgba(255, 99, 132, 0.2)', 'rgba(255, 159, 64, 0.2)', 'rgba(255, 205, 86, 0.2)', 'rgba(75, 192, 192, 0.2)', 'rgba(54, 162, 235, 0.2)'],//'rgba(54,255,51,0.2)',
                        borderColor: ['rgb(255, 99, 132)', 'rgb(255, 159, 64)', 'rgb(255, 205, 86)', 'rgb(75, 192, 192)', 'rgb(54, 162, 235)'], //'#33FF3F',
                        borderWidth: 1,
                    },
                ],
            },
            options: {
                'scales':
                {
                    'xAxes': [
                        {
                            'ticks':
                            {
                                'beginAtZero': true,
                                'max': max,
                            }
                        }
                    ]
                }
            }
        };
        const encodedChart = encodeURIComponent(JSON.stringify(chart));
        const chartUrl = `https://quickchart.io/chart?c=${encodedChart}`;
        //console.log(chart)
        try {
            raceEmbed
                .setColor(0x0099FF)
                .setTitle('__Current river race__ :')
                .setAuthor({ name: bot.user.tag, iconURL: bot.user.avatar /* , url: 'https://discord.js.org' */ })
                .setDescription(Race)
                .setThumbnail('https://cdn.discordapp.com/attachments/527820923114487830/1071116873321697300/png_20230203_181427_0000.png')
                .setImage(chartUrl)
                .setTimestamp()
                .setFooter({ text: 'by OPM | Féfé ⚡', iconURL: 'https://avatars.githubusercontent.com/u/94113911?s=400&v=4' });
        } catch (e) {
            console.log(e);
        }

        interaction.editReply({ embeds: [raceEmbed] });
    },
};