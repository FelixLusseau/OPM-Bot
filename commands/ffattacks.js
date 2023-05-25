const { SlashCommandBuilder } = require('discord.js');
const Discord = require("discord.js");
const { EmbedBuilder } = require('discord.js');
const functions = require('../utils/functions.js');

async function ffattacks(bot, api, interaction, pingBool, guildId, channel, clan) {
    // console.log(interaction)
    // console.log(pingBool)
    if (interaction != null) {
        await interaction.deferReply({ ephemeral: false });
        pingBool = interaction.options.getBoolean('ping');
        clan = interaction.options.getString('clan');
        guildId = interaction.guildId;
    }
    const guild = bot.guilds.cache.find((g) => g.id === guildId);

    if (!guild)
        return console.log(`Can't find any guild with the ID "${guildId}"`);

    //console.log(guild.members)
    const attacksEmbed = new EmbedBuilder();
    let Players4 = "";
    let Players3 = "";
    let Players2 = "";
    let Players1 = "";
    let ping = "";
    api.getClanCurrentRiverRace(clan)
        .then((response) => {
            return response
        })
        .catch((err) => {
            console.log("CR-API error : ", err)
        })
    let RiverRace = await api.getClanCurrentRiverRace(clan)
    let points = 0
    if (RiverRace.periodType == "colosseum") { points = RiverRace.clan.fame.toString() }
    else { points = RiverRace.clan.periodPoints.toString() }
    let decksRemaining = 200
    for (let i = 0; i < RiverRace.clan.participants.length; i++) {
        decksRemaining -= RiverRace.clan.participants[i].decksUsedToday
    }
    //console.log(decksRemaining)
    let ratio = 0
    ratio = functions.ratio(RiverRace, decksRemaining, -1)
    let remainingPlayers = 50
    api.getClanMembers(clan)
        .then((members) => {
            //console.log(members)
            return members
        })
        .catch((err) => {
            console.log("CR-API error : ", err)
        })
    let members = await api.getClanMembers(clan)
    for (let j = 0; j < RiverRace.clan.participants.length; j++) {
        //console.log(RiverRace.clan.participants[j])
        let inclan = false
        for (let i = 0; i < members.length; i++) {
            if (RiverRace.clan.participants[j].name == members[i].name && RiverRace.clan.participants[j].decksUsedToday == 4) {
                remainingPlayers--
                inclan = true
            }
            //console.log(RiverRace.clan.participants.length)
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
                        remainingPlayers--
                        break;
                    case 2:
                        Players2 += members[i].name + "\n";
                        remainingPlayers--
                        break;
                    case 1:
                        Players1 += members[i].name + "\n";
                        remainingPlayers--
                        break;
                }
                inclan = true
                if (pingBool) {
                    guild.members
                        .fetch()
                        .then((memberss) => {
                            //console.log(members)
                            //console.log(members[i].name)
                            memberss.forEach((member) => {
                                //console.log(member.nickname)
                                members[i].name = members[i].name.replace('\ufe0f', "")
                                if (member.user.username == members[i].name || member.nickname == members[i].name) {
                                    //console.log(member.user.username)
                                    ping += "<@" + member.user.id + "> "
                                }
                            }
                            )
                        });
                }
                break
            }
        }
        if (!inclan && RiverRace.clan.participants[j].decksUsedToday == 4) {
            remainingPlayers--
            // console.log(RiverRace.clan.participants[j].name)
            // console.log(inclan)
        }
        if (!inclan && RiverRace.clan.participants[j].decksUsedToday != 0 && RiverRace.clan.participants[j].decksUsedToday != 4) {
            let decksRemainingToday = 4 - RiverRace.clan.participants[j].decksUsedToday
            switch (decksRemainingToday) {
                case 3:
                    Players3 += RiverRace.clan.participants[j].name + " **(out of the clan !!)**\n";
                    break;
                case 2:
                    Players2 += RiverRace.clan.participants[j].name + " **(out of the clan !!)**\n";
                    break;
                case 1:
                    Players1 += RiverRace.clan.participants[j].name + " **(out of the clan !!)**\n";
                    break;
            }
            remainingPlayers--
            if (pingBool) {
                guild.members
                    .fetch()
                    .then((memberss) => {
                        //console.log(members)
                        //console.log(members[i].name)
                        memberss.forEach((member) => {
                            //console.log(member.nickname)
                            RiverRace.clan.participants[j].name = RiverRace.clan.participants[j].name.replace('\ufe0f', "")
                            if (member.user.username == RiverRace.clan.participants[j].name || member.nickname == RiverRace.clan.participants[j].name) {
                                //console.log(member.user.username)
                                ping += "<@" + member.user.id + "> "
                            }
                        }
                        )
                    });
            }
        }
    }
    //console.log(Players)
    let attacks = ""
    if (Players4 != "" || Players3 != "" || Players2 != "" || Players1 != "") {
        //let RoyaleAPI = "\n" + "https://royaleapi.com/clan/YRLJGL9" + "\n"
        attacks = '<:fame:876320149878235136> **Points** : ' + points + "\n" + '<:fameAvg:946276069634375801> **Ratio** : ' + ratio + "\n" + '<:remainingSlots:951032915221950494> **Players** : ' + remainingPlayers.toString() + "\n" + '<:decksRemaining:946275903812546620> **Attacks** : ' + decksRemaining + '\n'
        attacksEmbed
            .setColor(0x0099FF)
            .setTitle("__Remaining attacks " + ((RiverRace.periodType == "colosseum") ? "(Colosseum)__ " : "__ ") + ":")
            .setAuthor({ name: bot.user.tag, iconURL: 'https://cdn.discordapp.com/avatars/' + bot.user.id + '/' + bot.user.avatar + '.png' /* , url: 'https://discord.js.org' */ })
            .setDescription(attacks)
            .setThumbnail('https://cdn.discordapp.com/attachments/527820923114487830/1071116873321697300/png_20230203_181427_0000.png')
            .setTimestamp()
            .setFooter({ text: 'by OPM | Féfé ⚡', iconURL: 'https://avatars.githubusercontent.com/u/94113911?s=400&v=4' });
        if (Players4 != "") {
            attacksEmbed.addFields({ name: '__4 attacks__ :', value: Players4 })
            attacks += '\n__**4 attacks**__ :\n' + Players4
        }
        if (Players3 != "") {
            attacksEmbed.addFields({ name: '__3 attacks__ :', value: Players3 })
            attacks += '\n__**3 attacks**__\n :' + Players3
        }
        if (Players2 != "") {
            attacksEmbed.addFields({ name: '__2 attacks__ :', value: Players2 })
            attacks += '\n__**2 attacks**__ :\n' + Players2
        }
        if (Players1 != "") {
            attacksEmbed.addFields({ name: '__1 attack__ :', value: Players1 })
            attacks += '\n__**1 attack**__ :\n' + Players1
        }

    }
    if (interaction != null) {
        interaction.editReply({ embeds: [attacksEmbed] });
        if (pingBool) {
            await guild.members.fetch();
            if (ping != "")
                interaction.channel.send(ping);
        }
    }
    // else {
    //     channel.send({ embeds: [attacksEmbed] });
    //     await guild.members.fetch();
    //     if (ping != "") {
    //         channel.send(ping);
    //     }
    // }
    return attacks
};

module.exports = {
    ffattacks,
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
                .setRequired(true))
        .addBooleanOption(option =>
            option.setName('ping')
                .setDescription('Ping the players who don\'t have attacked left')),
    async execute(bot, api, interaction) {
        ffattacks(bot, api, interaction, false, null, null, null)
    },
};