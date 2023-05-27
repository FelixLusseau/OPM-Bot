const { SlashCommandBuilder } = require('discord.js');
const { EmbedBuilder } = require('discord.js');
const functions = require('../utils/functions.js');

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
                .setDescription('Max weeks to check (from 1 to 10)')),

    async execute(bot, api, interaction) {
        await interaction.deferReply({ ephemeral: false });
        const clan = interaction.options.getString('clan');
        const limit = interaction.options.getInteger('limit');

        let avg = await functions.fetchHist(clan.substring(1)); // Get the clans' score history
        let avgArray = {};
        let seasonId = avg.items[0].seasonId;
        // if (avg.items[0].sectionIndex < 3)
        //     seasonId = avg.items[0].seasonId - 1;
        // Initialize the dictionary with the last week
        for (let h = 0; h < avg.items[0].standings.length; h++) {
            // if (!limit)
            //     break;
            if (avg.items[0].standings[h].clan.tag == clan) {
                for (let p = 0; p < avg.items[0].standings[h].clan.participants.length; p++) {
                    let participant = avg.items[0].standings[h].clan.participants[p];
                    avgArray[participant.name] = {};
                    avgArray[participant.name]['fame'] = participant.fame;
                    avgArray[participant.name]['array'] = [participant.fame, null, null, null, null, null, null, null, null, null];
                    avgArray[participant.name]['count'] = 1;
                }
            }
        }
        // Update the dictionary with the other weeks and calculate the average
        for (let p = 1; p < avg.items.length; p++) {
            if (limit && p >= limit) { // Choose the number of weeks to check
                break;
            }
            if (!limit && avg.items[p].seasonId != seasonId) { // Check only the last season
                break;
            }
            for (let h = 0; h < avg.items[p].standings.length; h++) {
                if (avg.items[p].standings[h].clan.tag == clan) {
                    for (let q = 0; q < avg.items[p].standings[h].clan.participants.length; q++) {
                        let participant = avg.items[p].standings[h].clan.participants[q];
                        if (!(participant.name in avgArray)) {
                            avgArray[participant.name] = {};
                        }
                        if (avgArray[participant.name]['fame'] > 0) {
                            avgArray[participant.name]['fame'] += participant.fame;
                            avgArray[participant.name]['array'][p] = participant.fame;
                            avgArray[participant.name]['count'] += 1;
                        }
                        else {
                            avgArray[participant.name]['fame'] = participant.fame;
                            avgArray[participant.name]['array'] = [null, null, null, null, null, null, null, null, null, null];
                            avgArray[participant.name]['array'][p] = participant.fame;
                            avgArray[participant.name]['count'] = 1;
                        }
                    }
                }
            }
        }
        // Sort the dictionary by average
        const sortedAvgArray = Object.entries(avgArray).sort((a, b) => {
            return b[1].fame / b[1].count - a[1].fame / a[1].count;
        });

        const sortedAvgObject = Object.fromEntries(sortedAvgArray);

        let Averages = "";
        let counter = 0;
        // Make the message
        for (const [key, value] of Object.entries(sortedAvgObject)) {
            // if (value['fame'] > 0 && ((value['count'] > 2 && !limit) || limit)) {
            //     counter++;
            //     Averages += `- __${key}__ :\n`
            //         + `    Avg : **${(value['fame'] / value['count']).toFixed(0)}**\n`
            //         + `    Scores : ${value['string']}\n`
            //         + `    Count = ${value['count']}`
            //         + `\n\n`;
            // }
            avgArray[key]['fame'] = value['fame'] / value['count'];
            // if (counter > 10) { // Cut the message if it's too long
            //     //interaction.channel.send(Averages);
            //     Averages = "";
            //     counter = 0;
            // }
        }
        functions.excel(sortedAvgObject)
        interaction.editReply('__**Players\' averages**__ :');
    },
};