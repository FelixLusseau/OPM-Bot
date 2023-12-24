const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const functions = require('../utils/functions.js');

async function ffrace(bot, api, interaction, channel, clan, report) {
    // Check if the command was run by an interaction or a scheduled message
    if (interaction != null) {
        await interaction.deferReply({ ephemeral: false });
        clan = interaction.options.getString('clan');
        if (interaction.options.getString('custom_tag') != null) { // For a custom tag clan
            let custom_tag = interaction.options.getString('custom_tag');
            const regex = /\#[a-zA-Z0-9]{8,9}\b/g
            if (custom_tag.search(regex) >= 0) {
                custom_tag = (custom_tag[0] == "#") ? custom_tag : "#" + custom_tag;
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
    }

    const raceEmbed = new EmbedBuilder();
    let Labels = [];
    let Datas = [];
    let Race = "";

    let RiverRace = null
    try {
        RiverRace = await api.getClanCurrentRiverRace(clan)
    } catch (error) {
        functions.errorEmbed(bot, interaction, channel, error)
        return
    }

    let clans = RiverRace.clans
    // Chart data processing
    for (let i = 0; i < clans.length; i++) {
        if (RiverRace.periodType != "colosseum" && clans[i].fame >= 10000) { // If the clan has already reached 10k fame in normal days, skip it
            continue
        }
        let labels = clans[i].name
        Labels.push(labels);
        let data = 0
        if (RiverRace.periodType == "colosseum")
            data = clans[i].fame
        else
            data = clans[i].periodPoints
        Datas.push(data);

        /* api.getClanByTag(clans[i].tag)
        .then((clan) => {
            //console.log(clan)
            return clan
        })
        .catch((err) => {
            console.log("CR-API error : ", err)
        })
        let clan = await api.getClanByTag(clans[i].tag) */

        /* for (let i = 0; i < badgesData.length; i++) {
            //console.log(badgesData[i].id)
            if (badgesData[i].id == clan.badgeId) {
                Race += ":https://raw.githubusercontent.com/RoyaleAPI/cr-api-assets/master/badges/" + badgesData[i].name + ".png:"
                break
            }
        } */
    }
    // Sort clans by fame or points depending on the period type
    if (RiverRace.periodType == "colosseum")
        clans.sort((a, b) => (a.fame < b.fame) ? 1 : -1)
    else
        clans.sort((a, b) => (a.periodPoints < b.periodPoints) ? 1 : -1)

    let clanPos = 0
    for (let i = 0; i < clans.length; i++) {
        let decksRemaining = 200
        let playersRemaining = 50
        for (let j = 0; i < clans[i].participants.length; j++) {
            if (clans[i].participants[j] == undefined) // strange bug to correct
                break
            decksRemaining -= clans[i].participants[j].decksUsedToday
            if (clans[i].participants[j].decksUsedToday != 0)
                playersRemaining -= 1
        }
        let points = 0
        if (RiverRace.periodType == "colosseum")
            points = clans[i].fame
        else
            points = clans[i].periodPoints
        let ratio = 0
        ratio = functions.ratio(RiverRace, decksRemaining, i) // Calculate the ratio of the clan
        const estimate = Math.floor(ratio) * ((RiverRace.periodType == "colosseum") ? 800 : 200)// Invert of ratio calculation where the points are the unknown value

        if (RiverRace.periodType != "colosseum" && clans[i].fame >= 10000) {
            Race += "- __" + (clans[i].tag == clan ? "**" + clans[i].name + "**" : clans[i].name) + "__ : War finished \n\n"
            continue
        }
        // Make the string with the clan name, tag, points, ratio, decks remaining and players remaining
        if (interaction != null) {
            let ratioEmote = functions.ratioEmote(ratio)

            Race += "- __" + (clans[i].tag == clan ? "**" + clans[i].name + "**" : clans[i].name) // Bold the clan name if it's the clan the user asked for
                + "__ :\n<:Hashtag:1186369411439923220> Tag : " + clans[i].tag
                + "\n<a:Colored_arrow:1186367114190270516> Pts : " + points
                + "\n" + ratioEmote + " Ratio : **" + ratio
                + "**\n<a:Valider:1186367102936952952> Estimate : **" + estimate
                + "**\n<:Mini_Pekka:1186367104962809947> Attacks : " + decksRemaining
                + "\n<a:Chevalier:1186367120083263594> Players : " + playersRemaining + "\n\n"
        }
        else
            Race += "- __" + (clans[i].tag == clan ? "**" + clans[i].name + "**" : clans[i].name) // Bold the clan name if it's the clan the user asked for
                + "__ :\n Tag : " + clans[i].tag
                + "\n Pts : " + points
                + "\n Ratio : **" + ratio
                + "**\n Estimate : **" + estimate
                + "**\n Attacks : " + decksRemaining
                + "\n Players : " + playersRemaining + "\n\n"
        if (clans[i].tag == clan)
            clanPos = i + 1
    }
    let max = 0
    // Set the max value of the chart depending on the period type
    if (RiverRace.periodType == "colosseum")
        max = 180000
    else
        max = 45000

    // Chart construction
    const chart = functions.barChart('horizontalBar', Labels, Datas, max);
    const encodedChart = encodeURIComponent(JSON.stringify(chart));
    const chartUrl = `https://quickchart.io/chart?c=${encodedChart}`;

    const rand = Math.random().toString(36).slice(2); // Generate a random string to avoid the image cache
    try {
        raceEmbed
            .setColor(0x0099FF)
            .setTitle("__Current war day" + ((RiverRace.periodType == "colosseum") ? " (Colosseum)__ " : "__ ") + ":")
            .setAuthor({ name: bot.user.tag, iconURL: 'https://cdn.discordapp.com/avatars/' + bot.user.id + '/' + bot.user.avatar + '.png' })
            .setDescription(Race)
            .setThumbnail('https://cdn.discordapp.com/attachments/527820923114487830/1071116873321697300/png_20230203_181427_0000.png')
            .setImage(chartUrl)
            .setTimestamp()
            .setFooter({ text: 'by OPM | Féfé ⚡', iconURL: 'https://avatars.githubusercontent.com/u/94113911?s=400&v=4?' + rand });
    } catch (e) {
        console.log(e);
    }

    // If the interaction is not null, edit the reply deferred before
    if (interaction != null)
        interaction.editReply({ embeds: [raceEmbed] });
    else if (report == false) {
        channel.send({ embeds: [raceEmbed] })
    }

    return clanPos
}

module.exports = {
    ffrace,
    data: new SlashCommandBuilder()
        .setName('ffrace')
        .setDescription('Replies the current race !')
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
        .addStringOption(option =>
            option.setName('custom_tag')
                .setDescription('Tag of the foreign clan to check (nothing happens if wrong)')),
    async execute(bot, api, interaction) {
        ffrace(bot, api, interaction, null, null, false)
    }
};