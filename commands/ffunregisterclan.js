const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const sqlite3 = require('sqlite3').verbose();
const functions = require('../utils/functions.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ffunregisterclan')
        .setDescription('Unregister a clan for this server (used in commands) !')
        .addStringOption(option =>
            option.setName('abbr')
                .setDescription('The clan abbreviation to remove')
                .setAutocomplete(true)
                .setRequired(true)),
    async execute(bot, api, interaction) {
        await interaction.deferReply({ ephemeral: false });
        const tag = interaction.options.getString('abbr');
        if (functions.isRegisteredClan(bot, interaction, interaction.channel, tag) == false) // Check if the clan is registered
            return
        const unregisterEmbed = new EmbedBuilder();
        const abbr = clansDict[tag]

        // Unregister the clan from the database
        try {
            // Open the database
            let db = new sqlite3.Database('./db/OPM.sqlite3', sqlite3.OPEN_READWRITE, (err) => {
                if (err) {
                    console.error(err.message);
                }
            });

            // Delete previous report entry from the database
            let sql = `DELETE FROM Clans WHERE Guild=? AND Tag=?`;
            db.run(sql, [interaction.guildId, tag], function (err) {
                if (err) {
                    return console.error(err.message);
                }
                // console.log(`Row(s) deleted ${this.changes}`);
                // Reload the registered clans cache
                functions.loadRegisteredClans()
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

        const rand = Math.random().toString(36).slice(2); // Generate a random string to avoid the image cache
        try {
            unregisterEmbed
                .setColor(0x7C0404)
                .setAuthor({ name: bot.user.tag, iconURL: 'https://cdn.discordapp.com/avatars/' + bot.user.id + '/' + bot.user.avatar + '.png' })
                .setDescription(("**" + abbr + "** is no longer registered on this server !"))
                .setThumbnail('https://cdn.discordapp.com/attachments/527820923114487830/1071116873321697300/png_20230203_181427_0000.png')
                .setTimestamp()
                .setFooter({ text: 'by OPM | Féfé ⚡', iconURL: 'https://avatars.githubusercontent.com/u/94113911?s=400&v=4?' + rand });
        } catch (e) {
            console.log(e);
        }

        interaction.editReply({ embeds: [unregisterEmbed] });
    },
};