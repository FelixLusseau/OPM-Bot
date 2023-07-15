const { SlashCommandBuilder } = require('discord.js');
const { EmbedBuilder } = require('discord.js');
const sqlite3 = require('sqlite3').verbose();

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ffsetrotate')
        .setDescription('Set a rotate between clans !')
        .addStringOption(option =>
            option.setName('player')
                .setDescription('Player name')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('from')
                .setDescription('Origin clan')
                .addChoices(
                    { name: 'OPM', value: 'OPM' },
                    { name: 'NF', value: 'NF' },
                    { name: 'TDS', value: 'TDS' },
                    { name: '100pct', value: '100pct' },
                    { name: 'TPM', value: 'TPM' },
                )
                .setRequired(true))
        .addStringOption(option =>
            option.setName('to')
                .setDescription('Destination clan')
                .addChoices(
                    { name: 'OPM', value: 'OPM' },
                    { name: 'NF', value: 'NF' },
                    { name: 'TDS', value: 'TDS' },
                    { name: '100pct', value: '100pct' },
                    { name: 'TPM', value: 'TPM' },
                )
                .setRequired(true)),
    async execute(bot, api, interaction) {
        await interaction.deferReply({ ephemeral: false });
        const rotatesEmbed = new EmbedBuilder();
        const player = interaction.options.getString('player');
        const from = interaction.options.getString('from');
        const to = interaction.options.getString('to');
        let result = "";

        if (from != to) {
            const date = new Date().toLocaleDateString();

            // Open the database
            let db = new sqlite3.Database('./db/OPM.sqlite3', sqlite3.OPEN_READWRITE, (err) => {
                if (err) {
                    console.error(err.message);
                }
            });

            // Insert a new rotate into the database
            db.run(`INSERT INTO Rotates (Datetime, Player, Origin, Destination) VALUES ("${date}", "${player}", "${from}", "${to}")`, function (err) {
                if (err) {
                    return console.log(err.message);
                }
                // get the last insert id
                // console.log(`A row has been inserted with rowid ${this.lastID}`);
            });


            // Close the database
            db.close((err) => {
                if (err) {
                    console.error(err.message);
                }
            });

            result = "Rotate added for **" + player + "** !";
        } else {
            result = "You can't rotate to the same clan !";
        }

        try {
            rotatesEmbed
                .setColor(0x0099FF)
                .setTitle('__Set rotate__ :')
                .setAuthor({ name: bot.user.tag, iconURL: 'https://cdn.discordapp.com/avatars/' + bot.user.id + '/' + bot.user.avatar + '.png' })
                .setDescription(result)
                .setThumbnail('https://cdn.discordapp.com/attachments/527820923114487830/1071116873321697300/png_20230203_181427_0000.png')
                .setTimestamp()
                .setFooter({ text: 'by OPM | Féfé ⚡', iconURL: 'https://avatars.githubusercontent.com/u/94113911?s=400&v=4' });
        } catch (e) {
            console.log(e);
        }

        interaction.editReply({ embeds: [rotatesEmbed] });
    },
};