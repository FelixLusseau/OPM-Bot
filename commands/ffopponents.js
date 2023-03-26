const { SlashCommandBuilder } = require('discord.js');
const Discord = require("discord.js");
const { EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ffopponents')
        .setDescription('Replies the current opponents !'),
    async execute(bot, api, interaction) {
        await interaction.deferReply({ ephemeral: false });
        const opponentsEmbed = new EmbedBuilder();
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
            api.getClanByTag(RiverRace.clans[i].tag)
                .then((clan) => {
                    //console.log(clan)
                    return clan
                })
                .catch((err) => {
                    console.log("CR-API error : ", err)
                })
            let clan = await api.getClanByTag(RiverRace.clans[i].tag)
            /* for (let i = 0; i < badgesData.length; i++) {
                //console.log(badgesData[i].id)
                if (badgesData[i].id == clan.badgeId) {
                  Race += ":https://raw.githubusercontent.com/RoyaleAPI/cr-api-assets/master/badges/" + badgesData[i].name + ".png:"
                  break
                }
            } */
            Race += "- __" + RiverRace.clans[i].name + "__ " + " :\n" + RiverRace.clans[i].tag + ", " + clan.location.name + ", " + clan.clanWarTrophies + " tr, " + clan.members + " members\n\n"
        }
        try {
            opponentsEmbed
                .setColor(0x0099FF)
                .setTitle('__Current opponents__ :')
                .setAuthor({ name: bot.user.tag, iconURL: bot.user.avatar /* , url: 'https://discord.js.org' */ })
                .setDescription(Race)
                .setThumbnail('https://cdn.discordapp.com/attachments/527820923114487830/1071116873321697300/png_20230203_181427_0000.png')
                .setTimestamp()
                .setFooter({ text: 'by OPM | Féfé ⚡', iconURL: 'https://avatars.githubusercontent.com/u/94113911?s=400&v=4' });
        } catch (e) {
            console.log(e);
        }

        interaction.editReply({ embeds: [opponentsEmbed] });
    },
};