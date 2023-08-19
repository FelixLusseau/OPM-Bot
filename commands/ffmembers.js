const { SlashCommandBuilder, AttachmentBuilder } = require('discord.js');
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
                .setDescription('Tag of the foreign clan to check (nothing happens if wrong)')),
    async execute(bot, api, interaction) {
        await interaction.deferReply({ ephemeral: false });
        let clan = interaction.options.getString('clan');
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
        //Members += "**" + response.length + " members**\n\n"
        // Make the string with the members' names, tags, roles, levels and trophies
        for (let i = 0; i < response.length; i++) {
            //Members += "- **" + response[i].name + "** \n(" + response[i].tag + ", " + response[i].role + ", lvl" + response[i].expLevel + ", " + response[i].trophies + " tr)" + "\n\n"
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

        const browser = await puppeteer.launch({ headless: 'new' });
        const page = await browser.newPage();

        // Navigate to a blank HTML page
        await page.goto(`file:${path.join(__dirname, '../html/layout-tmp.html')}`);

        // Get the bounding box of the body
        const elem = await page.$('body');
        const boundingBox = await elem.boundingBox();
        // console.log('boundingBox', boundingBox)

        // Set the viewport size based on the width and height of the body
        await page.setViewport({ width: 1920, height: parseInt(boundingBox.height) + 20 });

        // Capture a screenshot of the rendered content
        await page.screenshot({ path: "ffmember.png" });

        await browser.close();

        // Send the image to the channel
        const attachment = new AttachmentBuilder("ffmember.png");
        await interaction.editReply({ files: [attachment] });

        // Delete the temporary files
        fs.unlinkSync('./html/layout-tmp.html');
        fs.unlinkSync('./ffmember.png');
    },
};