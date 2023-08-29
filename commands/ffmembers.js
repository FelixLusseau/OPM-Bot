const { SlashCommandBuilder } = require('discord.js');
const Discord = require("discord.js");
const { EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');
const functions = require('../utils/functions.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ffmembers')
        .setDescription('Replies the current members of the clan !')
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
                .setRequired(true))
        .addStringOption(option =>
            option.setName('custom_tag')
                .setDescription('Tag of the foreign clan to check (nothing happens if wrong)'))
        .addBooleanOption(option =>
            option.setName('text_version')
                .setDescription('Show the text version of the command too')),
    async execute(bot, api, interaction) {
        await interaction.deferReply({ ephemeral: false });
        let clan = interaction.options.getString('clan');
        let text = interaction.options.getBoolean('text_version'); // For text version too
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
        const membersEmbed = new EmbedBuilder();
        api.getClanMembers(clan) // Get the clans' members from the Supercell API
            .then((response) => {
                return response
            })
            .catch((err) => {
                console.log("CR-API error : ", err)
            })
        let response = await api.getClanMembers(clan)
        let Members = "";
        let Members_text = "**" + response.length + " members**\n\n"
        // Make the string with the members' names, tags, roles, levels and trophies
        for (let i = 0; i < response.length; i++) {
            Members_text += "- **" + response[i].name + "** \n(" + response[i].tag + ", " + response[i].role + ", lvl" + response[i].expLevel + ", " + response[i].trophies + " tr)" + "\n\n"
            Members += "<tr>\n<td>" + response[i].name + "</td>\n<td>" + response[i].tag + "</td>\n<td>" + response[i].role + "</td>\n<td>" + response[i].expLevel + "</td>\n<td>" + response[i].trophies + " 🏆</td>\n</tr>\n"
        }
        // console.log(Members)

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

                fs.writeFile('./html/layout-tmp.html', html, 'utf8', function (err) {
                    if (err) return console.log(err);
                });
            });

        });

        await functions.renderCommand(interaction, 'ffmembers')

        if (text != null) {
            const rand = Math.random().toString(36).slice(2); // Generate a random string to avoid the image cache
            try {
                membersEmbed
                    .setColor(0x0099FF)
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
    },
};