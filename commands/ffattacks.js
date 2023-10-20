const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const functions = require('../utils/functions.js');
const fs = require('fs');

async function ffattacks(bot, api, interaction, pingBool, guildId, channel, clan) {
    let text = null
    // Check if the command was run by an interaction or a scheduled message
    if (interaction != null) {
        await interaction.deferReply({ ephemeral: false });
        pingBool = interaction.options.getBoolean('ping');
        clan = interaction.options.getString('clan');
        text = interaction.options.getBoolean('text_version'); // For text version too
        if (interaction.options.getString('custom_tag') != null) { // For a custom tag clan
            let custom_tag = interaction.options.getString('custom_tag');
            const regex = /\#[a-zA-Z0-9]{8,9}\b/g
            if (custom_tag.search(regex) >= 0) {
                custom_tag = (custom_tag[0] == "#") ? custom_tag : "#" + custom_tag;
                clan = (interaction.options.getString('custom_tag')[0] == "#") ? interaction.options.getString('custom_tag') : "#" + interaction.options.getString('custom_tag');
                try {
                    const statusCode = await functions.http_head("/clan/" + custom_tag.substring(1));
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

    let Players4 = "";
    let Players3 = "";
    let Players2 = "";
    let Players1 = "";
    let Players4HTML = "<span style='font-size: 1.5em;'><u><b>4 attacks</u> : </b></span>\n<ul>\n";
    let Players3HTML = "<span style='font-size: 1.5em;'><u><b>3 attacks</u> : </b></span>\n<ul>\n";
    let Players2HTML = "<span style='font-size: 1.5em;'><u><b>2 attacks</u> : </b></span>\n<ul>\n";
    let Players1HTML = "<span style='font-size: 1.5em;'><u><b>1 attack</u> : </b></span>\n<ul>\n";
    let ping = "";

    let RiverRace = null
    try {
        RiverRace = await api.getClanCurrentRiverRace(clan)
    } catch (error) {
        functions.errorEmbed(bot, interaction, channel, error)
        return
    }
    let points = 0
    if (RiverRace.periodType == "colosseum") { points = RiverRace.clan.fame.toString() } // Check if the war is the colosseum or not
    else { points = RiverRace.clan.periodPoints.toString() }
    let decksRemaining = 200
    for (let i = 0; i < RiverRace.clan.participants.length; i++) { // Calculate the number of decks remaining
        decksRemaining -= RiverRace.clan.participants[i].decksUsedToday
    }
    let ratio = 0
    ratio = functions.ratio(RiverRace, decksRemaining, -1) // Calculate the ratio
    const estimate = Math.floor(ratio) * 200 // Invert of ratio calculation where the points are the unknown value

    if (pingBool && interaction == null && points == 0) // When war is finished when the scheduled message is sent
        return channel.send("The clan has finished the war !")

    let remainingPlayers = 50
    let members = null
    try {
        members = await api.getClanMembers(clan)// Retrieve the clan's members from the Supercell API
    } catch (error) {
        functions.errorEmbed(bot, interaction, channel, error)
        return
    }

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
                        Players4HTML += "<li style='margin-bottom: 20px;'>" + members[i].name + "</li>\n"
                        break;
                    case 3:
                        Players3 += members[i].name + "\n";
                        Players3HTML += "<li style='margin-bottom: 20px;'>" + members[i].name + "</li>\n"
                        remainingPlayers--
                        break;
                    case 2:
                        Players2 += members[i].name + "\n";
                        Players2HTML += "<li style='margin-bottom: 20px;'>" + members[i].name + "</li>\n"
                        remainingPlayers--
                        break;
                    case 1:
                        Players1 += members[i].name + "\n";
                        Players1HTML += "<li style='margin-bottom: 20px;'>" + members[i].name + "</li>\n"
                        remainingPlayers--
                        break;
                }
                inclan = true
                // If the ping option is enabled, find the Discord users with the same name as the players
                if (pingBool) {
                    try {
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
                    } catch (error) {
                        console.error('Error:', error);
                    }
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
                    Players3HTML += "<li style='margin-bottom: 20px;'>" + player.name + " <b>(out of the clan !!)</b></li>\n"
                    break;
                case 2:
                    Players2 += player.name + " **(out of the clan !!)**\n";
                    Players2HTML += "<li style='margin-bottom: 20px;'>" + player.name + " <b>(out of the clan !!)</b></li>\n"
                    break;
                case 1:
                    Players1 += player.name + " **(out of the clan !!)**\n";
                    Players1HTML += "<li style='margin-bottom: 20px;'>" + player.name + " <b>(out of the clan !!)</b></li>\n"
                    break;
            }
            remainingPlayers--
            // If the ping option is enabled, find the Discord users with the same name as the players
            if (pingBool) {
                try {
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
                } catch (error) {
                    console.error('Error:', error);
                }
            }
        }
    }

    Players4HTML += "</ul>\n"
    Players3HTML += "</ul>\n"
    Players2HTML += "</ul>\n"
    Players1HTML += "</ul>\n"

    if (interaction != null) {
        let remainingPlayersColor = "#30B32D"
        if (remainingPlayers > 10)
            remainingPlayersColor = "#F03E3E"
        else if (remainingPlayers > 5)
            remainingPlayersColor = "#FF8000"

        let decksRemainingColor = "#30B32D"
        if (decksRemaining > 40)
            decksRemainingColor = "#F03E3E"
        else if (decksRemaining > 20)
            decksRemainingColor = "#FF8000"

        let numbersHTML = ""
        let attacksHTML = ""
        const regex = /<li/g
        if (Players4HTML.search(regex) >= 0 || Players3HTML.search(regex) >= 0 || Players2HTML.search(regex) >= 0 || Players1HTML.search(regex) >= 0) // Check if the strings are not empty
        {
            numbersHTML = "<p>\n<b>🏅 Points</b> : "
                + points
                + "</p>\n"
                + "<p>\n<b>📟 Ratio</b> : "
                + ratio
                + "</p>\n"
                + "<canvas id='ratio' height=200 width=350 style='position: absolute; left: 15em; top: 6em;'></canvas>\n"
                + "<p>\n<b>📈 Estimate</b> : "
                + estimate
                + "</p>\n"
                + "<div style='display: flex; justify-content: space-between; align-items: center; padding-right: 3em;'>"
                + "<p>\n<b>🚸 Players</b> : "
                + remainingPlayers.toString()
                + "</p>\n"
                + "<div id='myProgress'>\n<div id='myBarPlayers'>\n" + remainingPlayers + "</div>\n</div>\n"
                + "</div>\n"
                + "<div style='display: flex; justify-content: space-between; align-items: center; padding-right: 3em;'>"
                + "<p style='display: inline-block;'>\n<b>⚔️ Attacks</b> : "
                + decksRemaining
                + "</p>\n"
                + "<div id='myProgress'>\n<div id='myBarAttacks'>\n" + decksRemaining + "</div>\n</div>\n"
                + "</div>\n"

            if (Players4HTML.search(regex) >= 0)
                attacksHTML += Players4HTML + "<br>"
            if (Players3HTML.search(regex) >= 0)
                attacksHTML += Players3HTML + "<br>"
            if (Players2HTML.search(regex) >= 0)
                attacksHTML += Players2HTML + "<br>"
            if (Players1HTML.search(regex) >= 0)
                attacksHTML += Players1HTML + "<br>"
        }

        const tmpFile = (Math.random() + 1).toString(36).substring(7) + '.html';
        fs.readFile('./html/layout.html', 'utf8', function (err, data) {
            if (err) {
                return console.log(err);
            }
            fs.readFile('./html/ffattacks.html', 'utf8', function (err, data2) {
                if (err) {
                    return console.log(err);
                }

                let result = data2.replace(/{{ Attacks }}/g, attacksHTML);
                result = result.replace(/{{ clan }}/g, (clansDict[clan] != undefined) ? clansDict[clan] : clan);
                result = result.replace(/{{ Numbers }}/g, numbersHTML);
                result = result.replace(/{{ ratio }}/g, ratio);
                result = result.replace(/900%/g, (100 - remainingPlayers * 2).toString() + "%");
                result = result.replace(/#000009/g, remainingPlayersColor);
                result = result.replace(/800%/g, (100 - decksRemaining / 2).toString() + "%");
                result = result.replace(/#000008/g, decksRemainingColor);

                let html = data.replace(/{{ body }}/g, result);

                fs.writeFile('./' + tmpFile, html, 'utf8', function (err) {
                    if (err) return console.log(err);
                });
            });

        });

        await functions.renderCommand(interaction, tmpFile, 0, 250)
    }

    let attacks = "" // String for the report
    const attacksEmbed = new EmbedBuilder();
    if (Players4 != "" || Players3 != "" || Players2 != "" || Players1 != "") { // Check it the strings are not empty
        if (interaction) { // If the command is an interaction
            let ratioEmote = "<a:battery_charging:1107789260934885396>"
            if (ratio < 175)
                ratioEmote = "<:battery_yellow:1107789257512341604>"
            if (ratio < 160)
                ratioEmote = "<a:battery_low:1107789267696095232>"

            attacks = '<a:Flchecolore:795356920110252083> **Points** : '
                + points
                + "\n"
                + ratioEmote + ' **Ratio** : '
                + ratio
                + "\n"
                + "<a:Valider:795353928761737267> **Estimate** : "
                + estimate
                + "\n"
                + '<a:achevalier:706450748124299304> **Players** : '
                + remainingPlayers.toString()
                + "\n"
                + '<:Sword_Mini_PEKKA:1156914308706471996> **Attacks** : '
                + decksRemaining
                + '\n'
        } else { // If the command is a message
            attacks = '**Points** : '
                + points
                + "\n"
                + '**Ratio** : '
                + ratio
                + "\n"
                + '**Estimate** : '
                + estimate
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
            .setTitle("__Remaining attacks" + ((RiverRace.periodType == "colosseum") ? " (Colosseum)__ " : "__ ") + ":")
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
    if (text != null || (pingBool && interaction == null)) { // If the text option is enabled
        // If the interaction is not null, edit the reply deferred before
        if (interaction != null) {
            interaction.editReply({ embeds: [attacksEmbed] });
        } else if (pingBool) {
            try {
                await guild.members.fetch();
            } catch (error) {
                console.error('Error:', error);
            }
            channel.send({ embeds: [attacksEmbed] })
        }
    }

    if (interaction != null) {
        if (pingBool) {
            await guild.members.fetch();
            if (ping != "")
                interaction.channel.send(ping);
        }
    } else if (pingBool) {
        await guild.members.fetch();
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
        .addBooleanOption(option =>
            option.setName('text_version')
                .setDescription('Show the text version of the command too'))
        .addStringOption(option =>
            option.setName('custom_tag')
                .setDescription('Tag of the foreign clan to check (nothing happens if wrong)')),
    async execute(bot, api, interaction) {
        ffattacks(bot, api, interaction, false, null, null, null)
    },
};
