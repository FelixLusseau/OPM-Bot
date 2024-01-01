const { SlashCommandBuilder } = require('discord.js');
const fs = require('fs');
const functions = require('../utils/functions.js');
const sqlite3 = require('sqlite3').verbose();

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ffgethours')
        .setDescription('Get the hours for the reset and report !'),
    async execute(bot, api, interaction) {
        await interaction.deferReply({ ephemeral: false });
        let hours = "";

        // Open the database
        try {
            let db = new sqlite3.Database('./db/OPM.sqlite3', sqlite3.OPEN_READONLY, (err) => {
                if (err) {
                    console.error(err.message);
                }
            });

            await new Promise((resolve, reject) => {
                db.each(`SELECT * FROM Reports WHERE Guild = "${interaction.guildId}"`, (err, row) => {
                    if (err) {
                        reject(err);
                    } else {
                        // console.log(row);
                        hours += "<tr style='line-height: 10em;'>\n<td><span style='font-size: 3em;'>" + clansDict[row.Clan] + "</span></td>\n<td style='font-size: 5em;'>" + row.Hour + "</td>\n</tr>";
                    }
                }, (err, count) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve();
                    }
                });
            });

            // Close the database
            db.close((err) => {
                if (err) {
                    console.error(err.message);
                }
            });
        } catch (err) {
            console.error(err);
        }

        const tmpFile = (Math.random() + 1).toString(36).substring(7) + '.html';
        fs.readFile('./html/layout.html', 'utf8', function (err, data) {
            if (err) {
                return console.log(err);
            }
            fs.readFile('./html/ffgethours.html', 'utf8', function (err, data2) {
                if (err) {
                    return console.log(err);
                }

                let result = data2.replace(/{{ Hours }}/g, hours);

                let html = data.replace(/{{ body }}/g, result);

                fs.writeFile('./' + tmpFile, html, 'utf8', function (err) {
                    if (err) return console.log(err);
                });
            });

        });

        await functions.renderCommand(interaction, tmpFile, 0, 150)
    },
};