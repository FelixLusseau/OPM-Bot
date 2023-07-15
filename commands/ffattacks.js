const { SlashCommandBuilder } = require('discord.js');
const { EmbedBuilder } = require('discord.js');
const functions = require('../utils/functions.js');

async function ffattacks(bot, api, interaction, pingBool, guildId, channel, clan) {
    // Check if the command was run by an interaction or a scheduled message
    if (interaction != null) {
        await interaction.deferReply({ ephemeral: false });
        pingBool = interaction.options.getBoolean('ping');
        clan = interaction.options.getString('clan');
        if (interaction.options.getString('custom_tag') != null) { // For a custom tag clan
            let custom_tag = interaction.options.getString('custom_tag');
            const regex = /\#[a-zA-Z0-9]{8,9}\b/g
            if (custom_tag.search(regex) >= 0) {
                custom_tag = (custom_tag[0] == "#") ? custom_tag : "#" + custom_tag;
                clan = (interaction.options.getString('custom_tag')[0] == "#") ? interaction.options.getString('custom_tag') : "#" + interaction.options.getString('custom_tag');
                try {
                    const statusCode = await functions.http_head(custom_tag.substring(1));
                    // console.log('Status Code:', statusCode);
                    if (statusCode == 200)
                        clan = custom_tag;
                } catch (error) {
                    console.error('Error:', error);
                }
            }
        }
        guildId = interaction.guildId;
    }
    const guild = bot.guilds.cache.find((g) => g.id === guildId);
    if (!guild)
        return console.log(`Can't find any guild with the ID "${guildId}"`);

    const attacksEmbed = new EmbedBuilder();
    let Players4 = "";
    let Players3 = "";
    let Players2 = "";
    let Players1 = "";
    let ping = "";

    api.getClanCurrentRiverRace(clan) // Retrieve the clan's information from the Supercell API
        .then((response) => {
            return response
        })
        .catch((err) => {
            console.log("CR-API error : ", err)
        })
    let RiverRace = await api.getClanCurrentRiverRace(clan)
    let points = 0
    if (RiverRace.periodType == "colosseum") { points = RiverRace.clan.fame.toString() } // Check if the war is the colosseum or not
    else { points = RiverRace.clan.periodPoints.toString() }
    let decksRemaining = 200
    for (let i = 0; i < RiverRace.clan.participants.length; i++) { // Calculate the number of decks remaining
        decksRemaining -= RiverRace.clan.participants[i].decksUsedToday
    }
    let ratio = 0
    ratio = functions.ratio(RiverRace, decksRemaining, -1) // Calculate the ratio
    let remainingPlayers = 50
    api.getClanMembers(clan) // Retrieve the clan's members from the Supercell API
        .then((members) => {
            return members
        })
        .catch((err) => {
            console.log("CR-API error : ", err)
        })
    let members = await api.getClanMembers(clan)

    for (let j = 0; j < RiverRace.clan.participants.length; j++) {
        let inclan = false
        const player = RiverRace.clan.participants[j]
        for (let i = 0; i < members.length; i++) {
            // If the player is in the clan and has used all his decks
            if (player.name == members[i].name && player.decksUsedToday == 4) {
                remainingPlayers--
                inclan = true
            }
            // If the player is in the clan and has not used all his decks
            if (player.name == members[i].name && player.decksUsedToday != 4) {
                let decksRemainingToday = 4 - player.decksUsedToday
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
                // If the ping option is enabled, find the Discord users with the same name as the players
                if (pingBool) {
                    guild.members
                        .fetch()
                        .then((memberss) => {
                            memberss.forEach((member) => {
                                members[i].name = members[i].name.replace('\ufe0f', "").replace(/<[^>]+>/g, '')
                                if (member.user.username == members[i].name || member.nickname == members[i].name) {
                                    ping += "<@" + member.user.id + "> "
                                }
                            }
                            )
                        });
                }
                break
            }
        }
        // If the player is not in the clan and has used all his decks
        if (!inclan && player.decksUsedToday == 4) {
            remainingPlayers--
        }
        // If the player is not in the clan and has used some of his decks
        if (!inclan && player.decksUsedToday != 0 && player.decksUsedToday != 4) {
            let decksRemainingToday = 4 - player.decksUsedToday
            switch (decksRemainingToday) {
                case 3:
                    Players3 += player.name + " **(out of the clan !!)**\n";
                    break;
                case 2:
                    Players2 += player.name + " **(out of the clan !!)**\n";
                    break;
                case 1:
                    Players1 += player.name + " **(out of the clan !!)**\n";
                    break;
            }
            remainingPlayers--
            // If the ping option is enabled, find the Discord users with the same name as the players
            if (pingBool) {
                guild.members
                    .fetch()
                    .then((memberss) => {
                        memberss.forEach((member) => {
                            player.name = player.name.replace('\ufe0f', "").replace(/<[^>]+>/g, '')
                            if (member.user.username == player.name || member.nickname == player.name) {
                                ping += "<@" + member.user.id + "> "
                            }
                        }
                        )
                    });
            }
        }
    }
    let attacks = "" // String for the report
    if (Players4 != "" || Players3 != "" || Players2 != "" || Players1 != "") { // Check it the strings are not empty
        if (interaction) { // If the command is an interaction
            attacks = '<:fame:876320149878235136> **Points** : '
                + points
                + "\n"
                + '<:fameAvg:946276069634375801> **Ratio** : '
                + ratio
                + "\n"
                + '<:remainingSlots:951032915221950494> **Players** : '
                + remainingPlayers.toString()
                + "\n"
                + '<:decksRemaining:946275903812546620> **Attacks** : '
                + decksRemaining
                + '\n'
        } else { // If the command is a message
            attacks = '**Points** : '
                + points
                + "\n"
                + '**Ratio** : '
                + ratio
                + "\n"
                + '**Players** : '
                + remainingPlayers.toString()
                + "\n"
                + '**Attacks** : '
                + decksRemaining
                + '\n'
        }
        const rand = Math.random().toString(36).slice(2); // Generate a random string to avoid the image cache
        attacksEmbed
            .setColor(0x0099FF)
            .setTitle("__Remaining attacks " + ((RiverRace.periodType == "colosseum") ? "(Colosseum)__ " : "__ ") + ":")
            .setAuthor({ name: bot.user.tag, iconURL: 'https://cdn.discordapp.com/avatars/' + bot.user.id + '/' + bot.user.avatar + '.png' })
            .setDescription(attacks)
            .setThumbnail('https://cdn.discordapp.com/attachments/527820923114487830/1071116873321697300/png_20230203_181427_0000.png')
            .setTimestamp()
            .setFooter({ text: 'by OPM | Féfé ⚡', iconURL: 'https://avatars.githubusercontent.com/u/94113911?s=400&v=4?' + rand });
        if (Players4 != "") {
            attacksEmbed.addFields({ name: '__4 attacks__ :', value: Players4 })
            attacks += '\n__**4 attacks**__ :\n' + Players4
        }
        if (Players3 != "") {
            attacksEmbed.addFields({ name: '__3 attacks__ :', value: Players3 })
            attacks += '\n__**3 attacks**__ :\n' + Players3
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
    // If the interaction is not null, edit the reply deferred before
    if (interaction != null) {
        interaction.editReply({ embeds: [attacksEmbed] });
        if (pingBool) {
            await guild.members.fetch();
            if (ping != "")
                interaction.channel.send(ping);
        }
    } else if (pingBool) {
        await guild.members.fetch();
        channel.send({ embeds: [attacksEmbed] })
        if (ping != "")
            channel.send(ping);
    }
    return attacks // Return the string for the report
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
                .setDescription('Ping the players who don\'t have attacked left'))
        .addStringOption(option =>
            option.setName('custom_tag')
                .setDescription('Tag of the foreign clan to check (nothing happens if wrong)')),
    async execute(bot, api, interaction) {
        ffattacks(bot, api, interaction, false, null, null, null)
    },
};
