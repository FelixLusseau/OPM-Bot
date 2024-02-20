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

        const unregisterEmbed = functions.generateEmbed(bot);
        try {
            unregisterEmbed
                .setAuthor({ name: bot.user.tag, iconURL: 'https://cdn.discordapp.com/avatars/' + bot.user.id + '/' + bot.user.avatar + '.png' })
                .setDescription(("**" + abbr + "** is no longer registered on this server !"))
        } catch (e) {
            console.log(e);
        }

        interaction.editReply({ embeds: [unregisterEmbed] });
    },
};