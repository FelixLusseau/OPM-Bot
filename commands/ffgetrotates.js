const { SlashCommandBuilder } = require('discord.js');
const { EmbedBuilder } = require('discord.js');
const sqlite3 = require('sqlite3').verbose();

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ffgetrotates')
        .setDescription('Get the rotates between clans !')
        .addStringOption(option =>
            option.setName('player')
                .setDescription('Player name'))
        .addStringOption(option =>
            option.setName('from')
                .setDescription('Origin clan')
                .addChoices(
                    { name: 'OPM', value: 'OPM' },
                    { name: 'NF', value: 'NF' },
                    { name: 'TDS', value: 'TDS' },
                    { name: '100pct', value: '100pct' },
                    { name: 'TPM', value: 'TPM' },
                ))
        .addStringOption(option =>
            option.setName('to')
                .setDescription('Destination clan')
                .addChoices(
                    { name: 'OPM', value: 'OPM' },
                    { name: 'NF', value: 'NF' },
                    { name: 'TDS', value: 'TDS' },
                    { name: '100pct', value: '100pct' },
                    { name: 'TPM', value: 'TPM' },
                )),
    async execute(bot, api, interaction) {
        await interaction.deferReply({ ephemeral: false });
        const rotatesEmbed = new EmbedBuilder();
        const player = interaction.options.getString('player');
        const from = interaction.options.getString('from');
        const to = interaction.options.getString('to');

        // Open the database
        let db = new sqlite3.Database('./db/OPM.sqlite3', sqlite3.OPEN_READWRITE, (err) => {
            if (err) {
                console.error(err.message);
            }
        });

        const clans = ["OPM", "NF", "TDS", "100pct", "TPM"];
        const clanResults = {};

        try {
            for (const clan of clans) {
                // console.log(clan);
                clanResults[clan] = ""; // Initialize result for the current clan

                await new Promise((resolve, reject) => {
                    db.each(`SELECT * FROM Rotates WHERE Destination = "${clan}"`, (err, row) => {
                        if (err) {
                            reject(err);
                        } else {
                            // console.log(row.Player + "\t" + row.Datetime + " from " + row.Origin);
                            if ((from == null || from == row.Origin) && (player == null || player == row.Player))
                                clanResults[clan] += "- " + row.Id + " : " + row.Player + "\t" + row.Datetime + " from " + row.Origin + "\n";
                        }
                    }, (err, count) => {
                        if (err) {
                            reject(err);
                        } else {
                            resolve();
                        }
                    });
                });
            }
        } catch (e) {
            console.log(e);
        }

        // console.log(clanResults); // Access the results object outside the loop

        // Close the database
        db.close((err) => {
            if (err) {
                console.error(err.message);
            }
        });

        let result = "";
        for (const clan of clans) {
            if (clanResults[clan] != "")
                if (to == null || to == clan)
                    result += "__**" + clan + "**__ :\n" + clanResults[clan] + "\n";
        }

        try {
            rotatesEmbed
                .setColor(0x0099FF)
                .setTitle('__Rotates__ :')
                .setAuthor({ name: bot.user.tag, iconURL: 'https://cdn.discordapp.com/avatars/' + bot.user.id + '/' + bot.user.avatar + '.png' })
                .setThumbnail('https://cdn.discordapp.com/attachments/527820923114487830/1071116873321697300/png_20230203_181427_0000.png')
                .setTimestamp()
                .setFooter({ text: 'by OPM | Féfé ⚡', iconURL: 'https://avatars.githubusercontent.com/u/94113911?s=400&v=4' });
            if (result != "")
                rotatesEmbed
                    .setDescription(result)
            else
                rotatesEmbed
                    .setDescription("No rotates found !");
        } catch (e) {
            console.log(e);
        }

        interaction.editReply({ embeds: [rotatesEmbed] });
    },
};