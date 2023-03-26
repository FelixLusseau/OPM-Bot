const { SlashCommandBuilder } = require('discord.js');
const Discord = require("discord.js");
const { EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ffattacks')
        .setDescription('Replies the remaining attacks !')
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
        const attacksEmbed = new EmbedBuilder();
        let Players4 = "";
        let Players3 = "";
        let Players2 = "";
        let Players1 = "";
        api.getClanCurrentRiverRace(clan)
            .then((response) => {
                return response
            })
            .catch((err) => {
                console.log("CR-API error : ", err)
            })
        let RiverRace = await api.getClanCurrentRiverRace(clan)
        let points = RiverRace.clan.periodPoints.toString()
        let decksRemaining = 200
        for (let i = 0; i < RiverRace.clan.participants.length; i++) {
            decksRemaining -= RiverRace.clan.participants[i].decksUsedToday
        }
        //console.log(decksRemaining)
        let ratio = (RiverRace.clan.periodPoints / (200 - decksRemaining)).toFixed(2).toString()
        let remainingPlayers = 0
        api.getClanMembers(clan)
            .then((members) => {
                //console.log(members)
                return members
            })
            .catch((err) => {
                console.log("CR-API error : ", err)
            })
        let members = await api.getClanMembers(clan)
        for (let i = 0; i < members.length; i++) {
            //console.log(RiverRace.clan.participants.length)
            for (let j = 0; j < RiverRace.clan.participants.length; j++) {
                if (RiverRace.clan.participants[j].name == members[i].name && RiverRace.clan.participants[j].decksUsedToday != 4) {
                    //console.log(members[i].name)
                    //console.log(RiverRace.clan.participants[j].decksUsedToday)
                    let decksRemainingToday = 4 - RiverRace.clan.participants[j].decksUsedToday
                    switch (decksRemainingToday) {
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
                /* else if (RiverRace.clan.participants[j].decksUsedToday != 4 && RiverRace.clan.participants[j].decksUsedToday != 4) {
                    let decksRemainingToday = 4 - RiverRace.clan.participants[j].decksUsedToday
                    switch (decksRemainingToday) {
                        case 3:
                            Players3 += members[i].name + "(out of the clan)\n";
                            break;
                        case 2:
                            Players2 += members[i].name + "(out of the clan)\n";
                            break;
                        case 1:
                            Players1 += members[i].name + "(out of the clan)\n";
                            break;
                    }
                } */
            }
        }
        //console.log(Players)
        if (Players4 != "" || Players3 != "" || Players2 != "" || Players1 != "") {
            //let RoyaleAPI = "\n" + "https://royaleapi.com/clan/YRLJGL9" + "\n"
            attacksEmbed
                .setColor(0x0099FF)
                .setTitle('__Remaining attacks__ :')
                .setAuthor({ name: bot.user.tag, iconURL: bot.user.avatar /* , url: 'https://discord.js.org' */ })
                .setDescription('<:fame:876320149878235136> **Points** : ' + points + "\n" + '<:fameAvg:946276069634375801> **Ratio** : ' + ratio + "\n" + '<:remainingSlots:951032915221950494> **Players** : ' + remainingPlayers.toString() + "\n" + '<:decksRemaining:946275903812546620> **Attacks** : ' + decksRemaining + '\n')
                .setThumbnail('https://cdn.discordapp.com/attachments/527820923114487830/1071116873321697300/png_20230203_181427_0000.png')
            if (Players4 != "") { attacksEmbed.addFields({ name: '__4 attacks :__', value: Players4 }) }
            if (Players3 != "") { attacksEmbed.addFields({ name: '__3 attacks :__', value: Players3 }) }
            if (Players2 != "") { attacksEmbed.addFields({ name: '__2 attacks :__', value: Players2 }) }
            if (Players1 != "") { attacksEmbed.addFields({ name: '__1 attack :__', value: Players1 }) }
            attacksEmbed
                //.addFields({ name: '\u200B', value: RoyaleAPI })
                .setTimestamp()
                .setFooter({ text: 'by OPM | Féfé ⚡', iconURL: 'https://avatars.githubusercontent.com/u/94113911?s=400&v=4' });

        }

        interaction.editReply({ embeds: [attacksEmbed] });
    },
};