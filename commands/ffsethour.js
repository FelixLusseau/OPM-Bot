const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const schedule = require('../utils/schedule.js');
const sqlite3 = require('sqlite3').verbose();

function isValidTimeFormat(input) {
    // Regular expression pattern to match "hh:mm" format
    const regex = /^([01]\d|2[0-3]):([0-5]\d)$/;

    // Check if the input matches the pattern
    return regex.test(input);
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ffsethour')
        .setDescription('Set the hour for the reset and report on this channel !')
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
            option.setName('hour')
                .setDescription('The hour to set at hh:mm format')
                .setRequired(true)
        ),
    async execute(bot, api, interaction) {
        await interaction.deferReply({ ephemeral: false });
        const clan = interaction.options.getString('clan');
        const hour = interaction.options.getString('hour');
        const resultsEmbed = new EmbedBuilder();
        let valid = false;

        // Check if the hour given is valid
        if (isValidTimeFormat(hour)) {
            valid = true;
            try {
                // Open the database
                let db = new sqlite3.Database('./db/OPM.sqlite3', sqlite3.OPEN_READWRITE, (err) => {
                    if (err) {
                        console.error(err.message);
                    }
                });

                // Delete previous report entry from the database
                let sql = `DELETE FROM Reports WHERE Guild=? AND Clan=?`;
                db.run(sql, [interaction.guildId, clan], function (err) {
                    if (err) {
                        return console.error(err.message);
                    }
                    // console.log(`Row(s) deleted ${this.changes}`);
                });
                // Insert a new report entry into the database
                db.run(`INSERT INTO Reports (Guild, Clan, Hour, Channel) VALUES ("${interaction.guildId}", "${clan}", "${hour}", "${interaction.channel.id}")`, function (err) {
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

            } catch (err) {
                console.error(err);
            }
            // Stop the previous cron job and start a new one with the new hour
            try {
                // console.log(clan + interaction.guildId)
                reportCron[clan + interaction.guildId].stop();
            } catch (e) {
                interaction.editReply({ content: "No cron job to stop !" });
            }
            // schedule.schedule(bot, clan, hour, clan, process.env.OPM_GUILD_ID)
            schedule.schedule(bot, hour, clan, interaction.guildId, interaction.channel.id)

        }
        else {
            valid = false;
        }

        const rand = Math.random().toString(36).slice(2); // Generate a random string to avoid the image cache
        try {
            resultsEmbed
                .setColor(0x7C0404)
                .setAuthor({ name: bot.user.tag, iconURL: 'https://cdn.discordapp.com/avatars/' + bot.user.id + '/' + bot.user.avatar + '.png' })
                .setDescription((valid ? "`" + hour + "` is now the reset hour for **" + clansDict[clan] + "** !" : "**" + hour + "** is not a valid hour !"))
                .setThumbnail('https://cdn.discordapp.com/attachments/527820923114487830/1071116873321697300/png_20230203_181427_0000.png')
                .setTimestamp()
                .setFooter({ text: 'by OPM | Féfé ⚡', iconURL: 'https://avatars.githubusercontent.com/u/94113911?s=400&v=4?' + rand });
        } catch (e) {
            console.log(e);
        }

        interaction.editReply({ embeds: [resultsEmbed] });
    },
};