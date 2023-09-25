const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const functions = require('../utils/functions.js');

async function ffresults(bot, api, interaction, guildId, clan) {
    // Check if the command was run by an interaction or a scheduled message
    if (interaction != null) {
        await interaction.deferReply({ ephemeral: false });
        clan = interaction.options.getString('clan');
        guildId = interaction.guildId;
    }
    const guild = bot.guilds.cache.find((g) => g.id === guildId);
    if (!guild)
        return console.log(`Can't find any guild with the ID "${guildId}"`);

    const resultsEmbed = new EmbedBuilder();
    let Players = "";
    let RiverRace = null
    try {
        RiverRace = await api.getClanCurrentRiverRace(clan)// Get info about the River Race
    } catch (error) {
        functions.errorEmbed(bot, interaction, channel, error)
        return
    }

    // Sort the players by fame
    RiverRace.clan.participants.sort((a, b) => (a.fame < b.fame) ? 1 : -1)
    for (let j = 0; j < RiverRace.clan.participants.length; j++) {
        if (RiverRace.clan.participants[j].decksUsed > 0 && RiverRace.clan.participants[j].fame > 0)
            // Make a list of the players who have attacked and their fame
            Players += "- " + RiverRace.clan.participants[j].name + " : **" + RiverRace.clan.participants[j].fame + " pts**\n"
    }

    const rand = Math.random().toString(36).slice(2); // Generate a random string to avoid the image cache
    try {
        if (interaction) {
            resultsEmbed
                .setColor(0x0099FF)
                .setTitle('__Players\' war results__ :')
                .setDescription((Players.length > 0) ? Players : "No players have attacked yet !")
                .setAuthor({ name: bot.user.tag, iconURL: 'https://cdn.discordapp.com/avatars/' + bot.user.id + '/' + bot.user.avatar + '.png' })
                .setThumbnail('https://cdn.discordapp.com/attachments/527820923114487830/1071116873321697300/png_20230203_181427_0000.png')
                .setTimestamp()
                .setFooter({ text: 'by OPM | Féfé ⚡', iconURL: 'https://avatars.githubusercontent.com/u/94113911?s=400&v=4?' + rand });
        }
    } catch (e) {
        console.log(e);
    }

    if (interaction != null) { interaction.editReply({ embeds: [resultsEmbed] }); }
    return Players // Return the list of players and their fame for the report
}

module.exports = {
    ffresults,
    data: new SlashCommandBuilder()
        .setName('ffresults')
        .setDescription('Replies the current war points of the players !')
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
        ffresults(bot, api, interaction, null, null)
    },
};