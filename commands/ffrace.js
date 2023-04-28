const { SlashCommandBuilder } = require('discord.js');
const Discord = require("discord.js");
const { EmbedBuilder } = require('discord.js');

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
        api.getClanCurrentRiverRace(clan)
            .then((response) => {
                //console.log(response.clans.periodLogs)
                return response
            })
            .catch((err) => {
                console.log("CR-API error : ", err)
            })
        let RiverRace = await api.getClanCurrentRiverRace(clan)
        for (let i = 0; i < RiverRace.clans.length; i++) {
            if (RiverRace.periodType != "colosseum" && RiverRace.clans[i].fame >= 10000) {
                continue
            }
            let labels = RiverRace.clans[i].name
            Labels.push(labels);
            let data = 0
            if (RiverRace.periodType == "colosseum")
                data = RiverRace.clans[i].fame
            else
                data = RiverRace.clans[i].periodPoints
            Datas.push(data);
            //console.log(RiverRace.clans[i].name)
            //console.log(RiverRace.clans[i].periodPoints)

            /* api.getClanByTag(RiverRace.clans[i].tag)
            .then((clan) => {
                //console.log(clan)
                return clan
            })
            .catch((err) => {
                console.log("CR-API error : ", err)
            })
            let clan = await api.getClanByTag(RiverRace.clans[i].tag) */
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
            //console.log(RiverRace)
            //console.log(RiverRace.clans[i])
            //console.log(RiverRace.clans[i].participants.length)
        }
        if (RiverRace.periodType == "colosseum")
            RiverRace.clans.sort((a, b) => (a.fame < b.fame) ? 1 : -1)
        else
            RiverRace.clans.sort((a, b) => (a.periodPoints < b.periodPoints) ? 1 : -1)
        //console.log(sortedClans)
        for (let i = 0; i < RiverRace.clans.length; i++) {
            let decksRemaining = 200
            let playersRemaining = 50
            for (let j = 0; i < RiverRace.clans[i].participants.length; j++) {
                //console.log(RiverRace.clans[i].participants[j])
                if (RiverRace.clans[i].participants[j] == undefined) // strange bug to correct
                    break
                decksRemaining -= RiverRace.clans[i].participants[j].decksUsedToday
                if (RiverRace.clans[i].participants[j].decksUsedToday != 0)
                    playersRemaining -= 1
            }
            //console.log(playersRemaining)
            //console.log(decksRemaining)
            let points = 0
            if (RiverRace.periodType == "colosseum")
                points = RiverRace.clans[i].fame
            else
                points = RiverRace.clans[i].periodPoints
            let ratio = 0
            const d = new Date();
            const weekday = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
            const day = weekday[d.getDay()]
            const hour = (('0' + d.getHours()).slice(-2) + ':' + ('0' + d.getMinutes()).slice(-2))
            const warHour = "11:35"
            if (RiverRace.periodType == "colosseum") {
                if ((day == "Thursday" && hour > warHour) || (day == "Friday" && hour < warHour))
                    ratio = (RiverRace.clans[i].fame / (200 - decksRemaining)).toFixed(2).toString()
                if ((day == "Friday" && hour > warHour) || (day == "Saturday" && hour < warHour))
                    ratio = (RiverRace.clans[i].fame / (400 - decksRemaining)).toFixed(2).toString()
                if ((day == "Saturday" && hour > warHour) || (day == "Sunday" && hour < warHour))
                    ratio = (RiverRace.clans[i].fame / (600 - decksRemaining)).toFixed(2).toString()
                if ((day == "Sunday" && hour > warHour) || (day == "Monday" && hour < warHour))
                    ratio = (RiverRace.clans[i].fame / (800 - decksRemaining)).toFixed(2).toString()
            }
            else { ratio = (RiverRace.clans[i].periodPoints / (200 - decksRemaining)).toFixed(2).toString() }
            if (RiverRace.periodType != "colosseum" && RiverRace.clans[i].fame >= 10000) {
                Race += "- __" + RiverRace.clans[i].name + "__ : War finished \n\n"
                continue
            }
            Race += "- __" + RiverRace.clans[i].name
                + "__ :\n<:Retro:1010557231214886933> Tag : " + RiverRace.clans[i].tag
                + "\n<:fame:876320149878235136> Pts : " + points
                + "\n<:fameAvg:946276069634375801> Ratio : **" + ratio
                + "**\n<:decksRemaining:946275903812546620> Decks : " + decksRemaining
                + "\n<:remainingSlots:951032915221950494> Players : " + playersRemaining + "\n\n"
        }
        // console.log(RiverRace.clan)
        // console.log(Labels)
        // console.log(Datas)
        let max = 0
        if (RiverRace.periodType == "colosseum")
            max = 135000
        else
            max = 45000
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
        //console.log(chart)
        try {
            raceEmbed
                .setColor(0x0099FF)
                .setTitle("__Current war day " + ((RiverRace.periodType == "colosseum") ? "(Colosseum)__ " : "__ ") + ":")
                .setAuthor({ name: bot.user.tag, iconURL: 'https://cdn.discordapp.com/avatars/' + bot.user.id + '/' + bot.user.avatar + '.png' /* , url: 'https://discord.js.org' */ })
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