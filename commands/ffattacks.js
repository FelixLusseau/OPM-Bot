const { SlashCommandBuilder } = require('discord.js');
const Discord = require("discord.js");
const { EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ffattacks')
        .setDescription('Replies the remaining attacks !'),
    async execute(bot, api, interaction) {
        await interaction.deferReply({ ephemeral: false });
        const attacksEmbed = new EmbedBuilder();
        let Players4 = "";
        let Players3 = "";
        let Players2 = "";
        let Players1 = "";
        api.getClanCurrentRiverRace("#YRLJGL9")
            .then((response) => {
                return response
            })
            .catch((err) => {
                console.log("CR-API error : ", err)
            })
        let RiverRace = await api.getClanCurrentRiverRace("#YRLJGL9")
        let points = RiverRace.clan.periodPoints.toString()
        let decksRemaining = 200
        for (let i = 0; i < RiverRace.clan.participants.length; i++) {
            decksRemaining -= RiverRace.clan.participants[i].decksUsedToday
        }
        //console.log(decksRemaining)
        let ratio = (RiverRace.clan.periodPoints / (200 - decksRemaining)).toFixed(2).toString()
        let remainingPlayers = 0
        api.getClanMembers("#YRLJGL9")
            .then((members) => {
                //console.log(members)
                return members
            })
            .catch((err) => {
                console.log("CR-API error : ", err)
            })
        let members = await api.getClanMembers("#YRLJGL9")
        for (let i = 0; i < members.length; i++) {
            //console.log(RiverRace.clan.participants.length)
            for (let j = 0; j < RiverRace.clan.participants.length; j++) {
                if (RiverRace.clan.participants[j].name == members[i].name && RiverRace.clan.participants[j].decksUsedToday != 4) {
                    //console.log(members[i].name)
                    //console.log(RiverRace.clan.participants[j].decksUsedToday)
                    let decksUsedToday = 4 - RiverRace.clan.participants[j].decksUsedToday
                    switch (decksUsedToday) {
                        case 4:
                            Players4 += members[i].name + "\n";
                            break;
                        case 3:
                            Players3 += members[i].name + "\n";
                            break;
                        case 2:
                            Players2 += members[i].name + "\n";
                            break;
                        case 1:
                            Players1 += members[i].name + "\n";
                            break;
                    }
                    remainingPlayers++
                }
            }
        }
        //console.log(Players)
        if (Players4 != "" || Players3 != "" || Players2 != "" || Players1 != "") {
            let RoyaleAPI = "\n" + "https://royaleapi.com/clan/YRLJGL9" + "\n"
            attacksEmbed
                .setColor(0x0099FF)
                .setTitle('__Remaining attacks__ :')
                .setAuthor({ name: bot.user.tag, iconURL: bot.user.avatar /* , url: 'https://discord.js.org' */ })
                .setDescription('**Points** : ' + points + "\n" + '**Ratio** : ' + ratio + "\n" + '**Players** : ' + remainingPlayers.toString() + "\n" + '**Attacks** : ' + decksRemaining + '\n')
                .setThumbnail('https://cdn.discordapp.com/attachments/527820923114487830/1071116873321697300/png_20230203_181427_0000.png')
            if (Players4 != "") { attacksEmbed.addFields({ name: '__4 attacks :__', value: Players4 }) }
            if (Players3 != "") { attacksEmbed.addFields({ name: '__3 attacks :__', value: Players3 }) }
            if (Players2 != "") { attacksEmbed.addFields({ name: '__2 attacks :__', value: Players2 }) }
            if (Players1 != "") { attacksEmbed.addFields({ name: '__1 attack :__', value: Players1 }) }
            attacksEmbed
                .addFields({ name: '\u200B', value: RoyaleAPI })
                .setTimestamp()
                .setFooter({ text: 'by OPM | Féfé ⚡', iconURL: 'https://avatars.githubusercontent.com/u/94113911?s=400&v=4' });

            //message.channel.send("<@UserID>");
        }

        interaction.editReply({ embeds: [attacksEmbed] });
    },
};