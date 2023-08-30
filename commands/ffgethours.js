const { SlashCommandBuilder } = require('discord.js');
const fs = require('fs');
const functions = require('../utils/functions.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ffgethours')
        .setDescription('Get the hours for the reset and report !'),
    async execute(bot, api, interaction) {
        await interaction.deferReply({ ephemeral: false });
        let clans = [];
        fs.readdirSync('./reset-hours/').forEach(file => { // Browse the reset-hours folder and add the files to the clans array
            clans.push(file);
        });
        let hours = "";
        // Make the brief
        clans.forEach(clan => {
            let hour = fs.readFileSync('./reset-hours/' + clan, 'utf8');
            hours += "<tr style='line-height: 10em;'>\n<td><span style='font-size: 3em;'>" + clan + "</span></td>\n<td style='font-size: 5em; background-image: linear-gradient(to left, violet, indigo, blue, green, orange, red);   -webkit-background-clip: text; color: transparent;'>" + hour + "</td>\n</tr>";
        });

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

                fs.writeFile('./html/layout-tmp.html', html, 'utf8', function (err) {
                    if (err) return console.log(err);
                });
            });

        });

        await functions.renderCommand(interaction, 'ffgethours', 0)
    },
};