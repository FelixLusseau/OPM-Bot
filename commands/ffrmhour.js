const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const sqlite3 = require('sqlite3').verbose();
const functions = require('../utils/functions.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ffrmhour')
        .setDescription('Remove the hour for the reset and report !')
        .addStringOption(option =>
            option.setName('clan')
                .setDescription('The clan to check')
                .setAutocomplete(true)
                .setRequired(true)),
    async execute(bot, api, interaction) {
        await interaction.deferReply({ ephemeral: false });
        const clan = interaction.options.getString('clan');
        if (functions.isRegisteredClan(bot, interaction, interaction.channel, clan) == false) // Check if the clan is registered
            return

        try {
            // Open the database
            let db = new sqlite3.Database('./db/OPM.sqlite3', sqlite3.OPEN_READWRITE, (err) => {
                if (err) {
                    console.error(err.message);
                }
            });

            // Delete a report entry from the database
            let sql = `DELETE FROM Reports WHERE Guild=? AND Clan=?`;
            db.run(sql, [interaction.guildId, clan], function (err) {
                if (err) {
                    return console.error(err.message);
                }
                // console.log(`Row(s) deleted ${this.changes}`);
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
        // Stop the previous cron job and start a new one with the new hour
        try {
            reportCron[clan + interaction.guildId].stop();
        } catch (e) {
            interaction.editReply({ content: "No cron job to stop !" });
        }

        const resultsEmbed = functions.generateEmbed(bot);
        try {
            resultsEmbed
                .setAuthor({ name: bot.user.tag, iconURL: 'https://cdn.discordapp.com/avatars/' + bot.user.id + '/' + bot.user.avatar + '.png' })
                .setDescription("Report deleted for **" + clansDict[clan] + "** !")
        } catch (e) {
            console.log(e);
        }

        interaction.editReply({ embeds: [resultsEmbed] });
    },
};