const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const schedule = require('../utils/schedule.js');
const sqlite3 = require('sqlite3').verbose();
const functions = require('../utils/functions.js');
const fs = require('fs');

function isValidTimeFormat(input) {
    // Regular expression pattern to match "hh:mm" format
    const regex = /^([01]\d|2[0-3]):([0-5]\d)$/;

    // Check if the input matches the pattern
    return regex.test(input);
}

// Function to define a report and reset hour for a registered clan
async function setHour(bot, api, interaction) {
    await interaction.deferReply({ ephemeral: false });
    const clan = interaction.options.getString('clan');
    if (functions.isRegisteredClan(bot, interaction, interaction.channel, clan) == false) // Check if the clan is registered
        return
    const hour = interaction.options.getString('hour');
    const channel = interaction.options.getChannel('channel')
    let valid = false;

    try { // Check if the channel is accessible by the bot to send messages without interaction commands
        await channel.sendTyping()
    }
    catch (error) {
        functions.errorEmbed(bot, interaction, interaction.channel, "The channel **" + channel.name + "** is not accessible by the bot !")
        return
    }

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
            db.run(`INSERT INTO Reports (Guild, Clan, Hour, Channel) VALUES ("${interaction.guildId}", "${clan}", "${hour}", "${channel.id}")`, function (err) {
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
        schedule.schedule(bot, hour, clan, interaction.guildId, channel.id)

    }
    else {
        valid = false;
    }

    const resultsEmbed = functions.generateEmbed(bot);
    try {
        resultsEmbed
            .setDescription((valid ? "`" + hour + "` is now the reset hour for **" + clansDict[clan] + "** !" : "**" + hour + "** is not a valid hour !") + "\nThe reports will be sent in the channel : **" + channel.name + "**")
    } catch (e) {
        console.log(e);
    }

    interaction.editReply({ embeds: [resultsEmbed] });
}

// Function to edit the report channel and / or hour
async function updateHour(bot, api, interaction) {
    await interaction.deferReply({ ephemeral: false });
    const clan = interaction.options.getString('clan');
    if (functions.isRegisteredClan(bot, interaction, interaction.channel, clan) == false) // Check if the clan is registered
        return
    const hour = interaction.options.getString('hour');
    let channel = interaction.options.getChannel('channel')
    let valid = false;
    let newChannel;

    if (channel) {
        try { // Check if the channel is accessible by the bot to send messages without interaction commands
            await channel.sendTyping()
        }
        catch (error) {
            functions.errorEmbed(bot, interaction, interaction.channel, "The channel **" + channel.name + "** is not accessible by the bot !")
            return
        }
    }

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

            if (channel) {
                // Update the hour and channel in the database
                sql = `UPDATE Reports SET Hour = ?, Channel = ? WHERE Guild = ? AND Clan = ?`;
                db.run(sql, [hour, channel.id, interaction.guildId, clan], function (err) {
                    if (err) {
                        return console.error(err.message);
                    }
                    // console.log(`Row(s) updated ${this.changes}`);
                });
            } else {
                // Update the hour in the database
                sql = `UPDATE Reports SET Hour = ? WHERE Guild = ? AND Clan = ?`;
                db.run(sql, [hour, interaction.guildId, clan], function (err) {
                    if (err) {
                        return console.error(err.message);
                    }
                    // console.log(`Row(s) updated ${this.changes}`);
                });
            }

            // Stop the previous cron job and start a new one with the new hour
            sql = `SELECT Channel FROM Reports WHERE Guild = ? AND Clan = ?`;
            db.get(sql, [interaction.guildId, clan], (err, row) => {
                if (err) {
                    return console.error(err.message);
                }
                channel = bot.channels.cache.get(row.Channel);
                try {
                    // console.log(clan + interaction.guildId)
                    reportCron[clan + interaction.guildId].stop();
                } catch (e) {
                    interaction.editReply({ content: "No cron job to stop !" });
                }
                schedule.schedule(bot, hour, clan, interaction.guildId, channel.id, true)
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
    }
    else {
        valid = false;
    }

    const resultsEmbed = functions.generateEmbed(bot);
    try {
        resultsEmbed
            .setDescription((valid ? "`" + hour + "` is now the reset hour for **" + clansDict[clan] + "** !" : "**" + hour + "** is not a valid hour !") + (channel ? "\nThe reports will be sent in the channel : **" + channel.name + "**" : ""))
    } catch (e) {
        console.log(e);
    }

    interaction.editReply({ embeds: [resultsEmbed] });
}

// Function display the report and reset hours
async function getHours(bot, api, interaction) {
    await interaction.deferReply({ ephemeral: false });
    let hours = "";

    try {
        // Open the database
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
                    hours += "<tr style='line-height: 10em;'>\n<td><span style='font-size: 2.5em;'>" + clansDict[row.Clan] + "</span></td>\n<td style='font-size: 4.5em;'>" + row.Hour + "</td>\n</tr>";
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
            html = html.replace(/{{Background}}/g, 'Background_small')

            fs.writeFile('./' + tmpFile, html, 'utf8', function (err) {
                if (err) return console.log(err);
            });
        });

    });

    await functions.renderCommand(interaction, tmpFile, 0)
}

// Function to remove a report and reset hour for a registered clan
async function rmHour(bot, api, interaction) {
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
            .setDescription("Report deleted for **" + clansDict[clan] + "** !")
    } catch (e) {
        console.log(e);
    }

    interaction.editReply({ embeds: [resultsEmbed] });
}

module.exports = {
    setHour,
    updateHour,
    getHours,
    rmHour,
    data: new SlashCommandBuilder()
        .setName('ffhour')
        .setDescription('Manage the hour for the reset and reports on the defined channel !')
        .addSubcommand(subcommand =>
            subcommand
                .setName('set')
                .setDescription('Configure the hour for the reset and reports !')
                .addStringOption(option =>
                    option.setName('clan')
                        .setDescription('The clan to add the hour to')
                        .setAutocomplete(true)
                        .setRequired(true))
                .addStringOption(option =>
                    option.setName('hour')
                        .setDescription('The hour to set at hh:mm format')
                        .setRequired(true))
                .addChannelOption(option =>
                    option.setName('channel')
                        .setDescription('The channel to send the report')
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('update')
                .setDescription('Update the hour for the reset and reports !')
                .addStringOption(option =>
                    option.setName('clan')
                        .setDescription('The clan to add the hour to')
                        .setAutocomplete(true)
                        .setRequired(true))
                .addStringOption(option =>
                    option.setName('hour')
                        .setDescription('The hour to set at hh:mm format')
                        .setRequired(true))
                .addChannelOption(option =>
                    option.setName('channel')
                        .setDescription('The channel to send the report')))
        .addSubcommand(subcommand =>
            subcommand.setName('get')
                .setDescription('Get the hours for the reset and reports !'))
        .addSubcommand(subcommand =>
            subcommand.setName('rm')
                .setDescription('Remove the hour for the reset and report !')
                .addStringOption(option =>
                    option.setName('clan')
                        .setDescription('The clan to remove the report from')
                        .setAutocomplete(true)
                        .setRequired(true))),
    async execute(bot, api, interaction) {
        switch (interaction.options.getSubcommand()) {
            case 'set':
                setHour(bot, api, interaction)
                break;
            case 'update':
                updateHour(bot, api, interaction)
                break;
            case 'get':
                getHours(bot, api, interaction)
                break;
            case 'rm':
                rmHour(bot, api, interaction)
                break;
        }
    },
};