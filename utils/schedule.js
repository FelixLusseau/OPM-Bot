const cron = require('node-cron');
const reports = require('./reports.js');
const ffattacks = require('../commands/ffattacks.js');
const ffrace = require('../commands/ffrace.js');
const sqlite3 = require('sqlite3').verbose();

// Function to get the guild members
async function getGuildMembers(guildsDict) {
    for (const [key, guild] of Object.entries(guildsDict)) {
        try {
            await guild.members
                .fetch()
                .then((memberss) => {
                    guildMembers[key] = memberss
                })
        }
        catch (error) {
            console.error("Guild members fetch error :" + error)
        }
    }
    // console.log(guildMembers)
    // try {
    //     await guild.members
    //         .fetch()
    //         .then((memberss) => {
    //             guildMembers = memberss
    //         })
    // }
    // catch (error) {
    //     console.error("Guild members fetch error :" + error)
    // }
}

// Function to schedule the reports and evening reminders
function schedule(bot, value, tag, guildID, chanID, update = false) {
    const channel = bot.channels.cache.get(chanID);

    // Schedule the reports and save them in the global reportCron dictionary
    reportCron[tag + guildID] = cron.schedule(value.substring(3, 5) + ' ' + value.substring(0, 2) + ' * * 5,6,7,1', () => {
        reports.report(bot, api, null, null, channel, tag, guildID)
    });

    if (!update) {
        // Schedule ffrace and ffattacks with ping at 01h00, 21h00 and 23h00 on the war days
        // cron.schedule('0 1 * * 5,6,7,1', () => {
        //     ffrace.ffrace(bot, api, null, channel, tag, false)
        //     ffattacks.ffattacks(bot, api, null, true, channel, tag, guildID)
        // });
        cron.schedule('0 9 * * 5,6,7,1', () => {
            ffrace.ffrace(bot, api, null, channel, tag, false)
            ffattacks.ffattacks(bot, api, null, true, channel, tag, guildID)
        });
        cron.schedule('0 21 * * 4,5,6,7', () => {
            ffrace.ffrace(bot, api, null, channel, tag, false)
            ffattacks.ffattacks(bot, api, null, true, channel, tag, guildID)
        });
        // cron.schedule('0 23 * * 4,5,6,7', () => {
        //     ffrace.ffrace(bot, api, null, channel, tag, false)
        //     ffattacks.ffattacks(bot, api, null, true, channel, tag, guildID)
        // });
        // console.log('Scheduled ' + key + ' for ' + value.substring(3, 5) + ' ' + value.substring(0, 2) + ' * * 5,6,7,1')
    }
}

async function loadSchedules(bot) {
    cron.schedule('55 20 * * 4,5,6,7', () => { // Refresh the guild members list at 20h55 on war days
        getGuildMembers(guildsDict)
    })
    try {
        let db = new sqlite3.Database('./db/OPM.sqlite3', sqlite3.OPEN_READWRITE, (err) => {
            if (err) {
                console.error(err.message);
            }
        });

        await new Promise((resolve, reject) => {
            db.each(`SELECT * FROM Reports`, (err, row) => {
                if (err) {
                    reject(err);
                } else {
                    // console.log(row);
                    // console.log(row.Clan, row.Hour, clansDict[row.Clan], row.Guild, row.Channel)
                    schedule(bot, row.Hour, row.Clan, row.Guild, row.Channel)
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
}

module.exports = {
    getGuildMembers,
    schedule,
    loadSchedules
}
