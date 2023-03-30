const { SlashCommandBuilder } = require('discord.js');
const Discord = require("discord.js");
const { EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ffriver')
        .setDescription('Replies the current river !')
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
        const riverEmbed = new EmbedBuilder();
        let Labels = [];
        let Datas = [];
        let Race = "";
        api.getClanCurrentRiverRace(clan)
            .then((response) => {
                return response
            })
            .catch((err) => {
                console.log("CR-API error : ", err)
            })
        let RiverRace = await api.getClanCurrentRiverRace(clan)
        for (let i = 0; i < RiverRace.clans.length; i++) {
            let labels = RiverRace.clans[i].name
            Labels.push(labels);
            let data = RiverRace.clans[i].fame
            Datas.push(data);
        }
        RiverRace.clans.sort((a, b) => (a.fame < b.fame) ? 1 : -1)
        for (let i = 0; i < RiverRace.clans.length; i++) {
            let decksRemaining = 200
            let playersRemaining = 50
            if (RiverRace.periodType != "colosseum" && RiverRace.clans[i].fame >= 10000) {
                Race += "- __" + RiverRace.clans[i].name + "__ : **War finished**\n<:Retro:1010557231214886933> Tag : " + RiverRace.clans[i].tag + "\n\n"
                continue
            }
            Race += "- __" + RiverRace.clans[i].name + "__ :\n<:Retro:1010557231214886933> Tag : " + RiverRace.clans[i].tag + "\n<:fame:876320149878235136> Pts : " + RiverRace.clans[i].fame + "\n\n"
        }
        let max = 0
        if (RiverRace.periodType == "colosseum") max = 135000
        else max = 10000
        const chart = {
            type: 'bar',
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
                    'yAxes': [
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
            riverEmbed
                .setColor(0x0099FF)
                .setTitle((RiverRace.periodType == "colosseum") ? "__Colosseum__ :" : "__Current river race__ :")
                .setAuthor({ name: bot.user.tag, iconURL: bot.user.avatar /* , url: 'https://discord.js.org' */ })
                .setDescription(Race)
                .setThumbnail('https://cdn.discordapp.com/attachments/527820923114487830/1071116873321697300/png_20230203_181427_0000.png')
                .setImage(chartUrl)
                .setTimestamp()
                .setFooter({ text: 'by OPM | Féfé ⚡', iconURL: 'https://avatars.githubusercontent.com/u/94113911?s=400&v=4' });
        } catch (e) {
            console.log(e);
        }

        interaction.editReply({ embeds: [riverEmbed] });
    },
};