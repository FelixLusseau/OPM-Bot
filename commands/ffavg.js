const { SlashCommandBuilder } = require('discord.js');
const Discord = require("discord.js");
const { EmbedBuilder } = require('discord.js');

async function fetchPlayersHist(tag) {
    const response = await fetch("https://api.clashroyale.com/v1/clans/%23" + tag + "/riverracelog", {
        headers: {
            authorization: `Bearer ${process.env.CR_TOKEN}`,
        },
    });
    const jsonData = await response.json();
    //console.log(jsonData);
    return jsonData;
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ffavg')
        .setDescription('Replies the players\' averages !')
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
        .addIntegerOption(option =>
            option.setName('limit')
                .setDescription('Max weeks to check')),

    async execute(bot, api, interaction) {
        await interaction.deferReply({ ephemeral: false });
        const clan = interaction.options.getString('clan');
        const limit = interaction.options.getInteger('limit');
        let avg = await fetchPlayersHist(clan.substring(1));
        let avgArray = {};
        let seasonId = avg.items[0].seasonId;
        if (avg.items[0].sectionIndex < 3)
            seasonId = avg.items[0].seasonId - 1;
        for (let h = 0; h < avg.items[0].standings.length; h++) {
            if (!limit)
                break;
            if (avg.items[0].standings[h].clan.tag == clan) {
                for (let p = 0; p < avg.items[0].standings[h].clan.participants.length; p++) {
                    //console.log(avg.items[0].standings[h].clan.participants[p].name);
                    avgArray[avg.items[0].standings[h].clan.participants[p].name] = {};
                    avgArray[avg.items[0].standings[h].clan.participants[p].name]['fame'] = avg.items[0].standings[h].clan.participants[p].fame;
                    //console.log(avgArray[avg.items[0].standings[h].clan.participants[p].name]);
                    avgArray[avg.items[0].standings[h].clan.participants[p].name]['string'] = avg.items[0].standings[h].clan.participants[p].fame.toString() + " ";
                    avgArray[avg.items[0].standings[h].clan.participants[p].name]['count'] = 1;
                }
            }
        }
        for (let p = 1; p < avg.items.length; p++) {
            if (limit && p >= limit) {
                break;
            }
            if (!limit && avg.items[p].seasonId != seasonId) {
                break;
            }
            for (let h = 0; h < avg.items[p].standings.length; h++) {
                if (avg.items[p].standings[h].clan.tag == clan) {
                    for (let q = 0; q < avg.items[p].standings[h].clan.participants.length; q++) {
                        if (!(avg.items[p].standings[h].clan.participants[q].name in avgArray)) {
                            avgArray[avg.items[p].standings[h].clan.participants[q].name] = {};
                        }
                        //console.log(avg.items[p].standings[h].clan.participants[q].name)
                        if (avgArray[avg.items[p].standings[h].clan.participants[q].name]['fame'] > 0) {
                            avgArray[avg.items[p].standings[h].clan.participants[q].name]['fame'] += avg.items[p].standings[h].clan.participants[q].fame;
                            avgArray[avg.items[p].standings[h].clan.participants[q].name]['string'] += avg.items[p].standings[h].clan.participants[q].fame.toString() + " ";
                            avgArray[avg.items[p].standings[h].clan.participants[q].name]['count'] += 1;
                        }
                        else {
                            avgArray[avg.items[p].standings[h].clan.participants[q].name]['fame'] = avg.items[p].standings[h].clan.participants[q].fame;
                            avgArray[avg.items[p].standings[h].clan.participants[q].name]['string'] = avg.items[p].standings[h].clan.participants[q].fame.toString() + " ";
                            avgArray[avg.items[p].standings[h].clan.participants[q].name]['count'] = 1;
                        }
                    }
                }
            }
        }
        const sortedAvgArray = Object.entries(avgArray).sort((a, b) => {
            return b[1].fame / b[1].count - a[1].fame / a[1].count;
        });

        const sortedAvgObject = Object.fromEntries(sortedAvgArray);
        //console.log(sortedAvgObject)

        let Averages = "";
        let counter = 0;
        for (const [key, value] of Object.entries(sortedAvgObject)) {
            if (value['fame'] > 0 && ((value['count'] > 2 && !limit) || limit)) {
                counter++;
                Averages += `- __${key}__ :\n`
                    + `    Avg : **${(value['fame'] / value['count']).toFixed(0)}**\n`
                    + `    Scores : ${value['string']}\n`
                    + `    Count = ${value['count']}`
                    + `\n\n`;
            }
            if (counter > 10) {
                interaction.channel.send(Averages);
                Averages = "";
                counter = 0;
            }
        }
        // console.log(Averages)
        interaction.editReply('__**Players\' averages**__ :');
    },
};