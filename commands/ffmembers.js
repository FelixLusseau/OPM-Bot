const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const fs = require('fs');
const functions = require('../utils/functions.js');

async function ffmembers(bot, api, interaction, clan) {
    await interaction.deferReply({ ephemeral: false });
    if (interaction.options.getString('clan')) {
        clan = interaction.options.getString('clan');
        if (functions.isRegisteredClan(bot, interaction, interaction.channel, clan) == false) // Check if the clan is registered
            return
    }
    let text = interaction.options.getBoolean('text_version'); // For text version too

    let response = null
    try {
        response = await api.getClanMembers(clan)
    } catch (error) {
        functions.errorEmbed(bot, interaction, interaction.channel, error)
        return
    }

    let Members = "";
    let Members_text = "**" + response.length + " members**\n\n"
    // Make the string with the members' names, tags, roles, levels and trophies
    for (let i = 0; i < response.length; i++) {
        Members_text += "- **" + response[i].name + "** \n(" + response[i].tag + ", " + response[i].role + ", lvl " + response[i].expLevel + ", " + response[i].trophies + " tr)" + "\n\n"
        Members += "<tr>\n<td>" + response[i].name + "</td>\n<td>" + response[i].tag + "</td>\n<td>" + response[i].role + "</td>\n<td>" + response[i].expLevel + "</td>\n<td>" + response[i].trophies + " 🏆</td>\n</tr>\n"
    }
    // console.log(Members)

    const tmpFile = (Math.random() + 1).toString(36).substring(7) + '.html';
    fs.readFile('./html/layout.html', 'utf8', function (err, data) {
        if (err) {
            return console.log(err);
        }
        fs.readFile('./html/ffmembers.html', 'utf8', function (err, data2) {
            if (err) {
                return console.log(err);
            }

            let result = data2.replace(/{{ Players }}/g, Members);
            result = result.replace(/{{ nb }}/g, response.length);
            result = result.replace(/{{ clan }}/g, (clansDict[clan] != undefined) ? clansDict[clan] : clan);

            let html = data.replace(/{{ body }}/g, result);
            html = html.replace(/{{Background}}/g, 'Background_normal')

            fs.writeFile('./' + tmpFile, html, 'utf8', function (err) {
                if (err) return console.log(err);
            });
        });

    });

    await functions.renderCommand(interaction, tmpFile, 0)

    if (text != null) {
        const membersEmbed = new EmbedBuilder();
        const rand = Math.random().toString(36).slice(2); // Generate a random string to avoid the image cache
        try {
            membersEmbed
                .setColor(0x7C0404)
                .setTitle('__Current clan members__ :')
                .setAuthor({ name: bot.user.tag, iconURL: 'https://cdn.discordapp.com/avatars/' + bot.user.id + '/' + bot.user.avatar + '.png' })
                .setDescription(Members_text)
                .setThumbnail('https://cdn.discordapp.com/attachments/527820923114487830/1071116873321697300/png_20230203_181427_0000.png')
                .setTimestamp()
                .setFooter({ text: 'by OPM | Féfé ⚡', iconURL: 'https://avatars.githubusercontent.com/u/94113911?s=400&v=4?' + rand });
        } catch (e) {
            console.log(e);
        }

        interaction.editReply({ embeds: [membersEmbed] });
    }
}

module.exports = {
    ffmembers,
    data: new SlashCommandBuilder()
        .setName('ffmembers')
        .setDescription('Replies the current members of the clan !')
        .addStringOption(option =>
            option.setName('clan')
                .setDescription('The clan to check')
                .setAutocomplete(true)
                .setRequired(true))
        .addBooleanOption(option =>
            option.setName('text_version')
                .setDescription('Show the text version of the command too')),
    async execute(bot, api, interaction) {
        ffmembers(bot, api, interaction, null)
    },
};