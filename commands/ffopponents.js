const { SlashCommandBuilder } = require('discord.js');
const Discord = require("discord.js");
const { EmbedBuilder } = require('discord.js');
const functions = require('../utils/functions.js');


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
                .setRequired(true)),
    async execute(bot, api, interaction) {
        await interaction.deferReply({ ephemeral: false });
        const clan = interaction.options.getString('clan');
        const opponentsEmbed = new EmbedBuilder();
        let Opponents = "";
        api.getClanCurrentRiverRace(clan) // Get info about the River Race
            .then((response) => {
                return response
            })
            .catch((err) => {
                console.log("CR-API error : ", err)
            })
        let RiverRace = await api.getClanCurrentRiverRace(clan)

        for (let i = 0; i < RiverRace.clans.length; i++) {
            api.getClanByTag(RiverRace.clans[i].tag) // Get the clans' info from the Supercell API
                .then((clan) => {
                    return clan
                })
                .catch((err) => {
                    console.log("CR-API error : ", err)
                })
            let clan = await api.getClanByTag(RiverRace.clans[i].tag)
            /* for (let i = 0; i < badgesData.length; i++) {
                //console.log(badgesData[i].id)
                if (badgesData[i].id == clan.badgeId) {
                  Opponents += ":https://raw.githubusercontent.com/RoyaleAPI/cr-api-assets/master/badges/" + badgesData[i].name + ".png:"
                  break
                }
            } */
            // Make the string from the clans' names, tags, locations, trophies and numbers of members
            Opponents += "- __**" + RiverRace.clans[i].name + "**__ " + " :\n" + RiverRace.clans[i].tag + ", " + clan.location.name + ", " + clan.clanWarTrophies + " tr, " + clan.members + " members\n\n"
            let history = await functions.fetchHist(RiverRace.clans[i].tag.substring(1)); // Get the clans' history from the RoyaleAPI
            for (let h = 0; h < history.items.length; h++) {
                // Add the colosseum history on the last seasons
                for (let s = 0; s < history.items[h].standings.length; s++) {
                    if (history.items[h].standings[s].clan.tag == RiverRace.clans[i].tag && history.items[h].standings[s].clan.fame > 11000) {
                        Opponents += "Season " + history.items[h].seasonId + " : **" + history.items[h].standings[s].rank
                        switch (history.items[h].standings[s].rank) {
                            case 1:
                                Opponents += "st** with **"
                                break;
                            case 2:
                                Opponents += "nd** with **"
                                break;
                            case 3:
                                Opponents += "rd** with **"
                                break;
                            default:
                                Opponents += "th** with **"
                                break;
                        }
                        Opponents += history.items[h].standings[s].clan.fame + "**\n"
                    }
                }
            }
            Opponents += "\n\n"
        }
        // Add a blank character to the end of the string to avoid a bug with the embed (force an empty line)
        Opponents += "\u200b"
        try {
            opponentsEmbed
                .setColor(0x0099FF)
                .setTitle('__Current opponents__ :')
                .setAuthor({ name: bot.user.tag, iconURL: 'https://cdn.discordapp.com/avatars/' + bot.user.id + '/' + bot.user.avatar + '.png' })
                .setDescription(Opponents)
                .setThumbnail('https://cdn.discordapp.com/attachments/527820923114487830/1071116873321697300/png_20230203_181427_0000.png')
                .setTimestamp()
                .setFooter({ text: 'by OPM | Féfé ⚡', iconURL: 'https://avatars.githubusercontent.com/u/94113911?s=400&v=4' });
        } catch (e) {
            console.log(e);
        }

        interaction.editReply({ embeds: [opponentsEmbed] });
    },
};