const { SlashCommandBuilder } = require('discord.js');
const { EmbedBuilder } = require('discord.js');
const functions = require('../utils/functions.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ffrace')
        .setDescription('Replies the current race !')
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
                .setRequired(true)),
    async execute(bot, api, interaction) {
        await interaction.deferReply({ ephemeral: false });
        const clan = interaction.options.getString('clan');
        const raceEmbed = new EmbedBuilder();
        let Labels = [];
        let Datas = [];
        let Race = "";
        api.getClanCurrentRiverRace(clan) // Get info about the River Race
            .then((response) => {
                return response
            })
            .catch((err) => {
                console.log("CR-API error : ", err)
            })
        let RiverRace = await api.getClanCurrentRiverRace(clan)

        let clans = RiverRace.clans
        // Chart data processing
        for (let i = 0; i < clans.length; i++) {
            if (RiverRace.periodType != "colosseum" && clans[i].fame >= 10000) { // If the clan has already reached 10k fame in normal days, skip it
                continue
            }
            let labels = clans[i].name
            Labels.push(labels);
            let data = 0
            if (RiverRace.periodType == "colosseum")
                data = clans[i].fame
            else
                data = clans[i].periodPoints
            Datas.push(data);

            /* api.getClanByTag(clans[i].tag)
            .then((clan) => {
                //console.log(clan)
                return clan
            })
            .catch((err) => {
                console.log("CR-API error : ", err)
            })
            let clan = await api.getClanByTag(clans[i].tag) */

            /* for (let i = 0; i < badgesData.length; i++) {
                //console.log(badgesData[i].id)
                if (badgesData[i].id == clan.badgeId) {
                    Race += ":https://raw.githubusercontent.com/RoyaleAPI/cr-api-assets/master/badges/" + badgesData[i].name + ".png:"
                    break
                }
            } */
        }
        // Sort clans by fame or points depending on the period type
        if (RiverRace.periodType == "colosseum")
            clans.sort((a, b) => (a.fame < b.fame) ? 1 : -1)
        else
            clans.sort((a, b) => (a.periodPoints < b.periodPoints) ? 1 : -1)

        for (let i = 0; i < clans.length; i++) {
            let decksRemaining = 200
            let playersRemaining = 50
            for (let j = 0; i < clans[i].participants.length; j++) {
                if (clans[i].participants[j] == undefined) // strange bug to correct
                    break
                decksRemaining -= clans[i].participants[j].decksUsedToday
                if (clans[i].participants[j].decksUsedToday != 0)
                    playersRemaining -= 1
            }
            let points = 0
            if (RiverRace.periodType == "colosseum")
                points = clans[i].fame
            else
                points = clans[i].periodPoints
            let ratio = 0
            ratio = functions.ratio(RiverRace, decksRemaining, i) // Calculate the ratio of the clan
            if (RiverRace.periodType != "colosseum" && clans[i].fame >= 10000) {
                Race += "- __" + (clans[i].tag == clan ? "**" + clans[i].name + "**" : clans[i].name) + "__ : War finished \n\n"
                continue
            }
            // Make the string with the clan name, tag, points, ratio, decks remaining and players remaining
            Race += "- __" + (clans[i].tag == clan ? "**" + clans[i].name + "**" : clans[i].name) // Bold the clan name if it's the clan the user asked for
                + "__ :\n<:Retro:1010557231214886933> Tag : " + clans[i].tag
                + "\n<:fame:876320149878235136> Pts : " + points
                + "\n<:fameAvg:946276069634375801> Ratio : **" + ratio
                + "**\n<:decksRemaining:946275903812546620> Decks : " + decksRemaining
                + "\n<:remainingSlots:951032915221950494> Players : " + playersRemaining + "\n\n"
        }
        let max = 0
        // Set the max value of the chart depending on the period type
        if (RiverRace.periodType == "colosseum")
            max = 180000
        else
            max = 45000

        // Chart construction
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
                },
                plugins: {
                    customCanvasBackgroundColor: {
                        color: '#FFFFFF',
                    }
                }
            },
            plugins:
                [
                    {
                        id: 'customCanvasBackgroundColor',
                        beforeDraw: (chart, args, options) => {
                            const { ctx } = chart;
                            ctx.save();
                            ctx.globalCompositeOperation = 'destination-over';
                            ctx.fillStyle = options.color || '#99ffff';
                            ctx.fillRect(0, 0, chart.width, chart.height);
                            ctx.restore();
                        },
                    },
                ]
        };
        const encodedChart = encodeURIComponent(JSON.stringify(chart));
        const chartUrl = `https://quickchart.io/chart?c=${encodedChart}`;
        try {
            raceEmbed
                .setColor(0x0099FF)
                .setTitle("__Current war day " + ((RiverRace.periodType == "colosseum") ? "(Colosseum)__ " : "__ ") + ":")
                .setAuthor({ name: bot.user.tag, iconURL: 'https://cdn.discordapp.com/avatars/' + bot.user.id + '/' + bot.user.avatar + '.png' })
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