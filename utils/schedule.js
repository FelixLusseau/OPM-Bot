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
function schedule(bot, value, tag, guildID, chanID) {
    const channel = bot.channels.cache.get(chanID);
    const clanKey = tag + guildID;

    // Initialize clan cron jobs storage if it doesn't exist
    if (!global.clanCronJobs) {
        global.clanCronJobs = {};
    }
    if (!global.clanCronJobs[clanKey]) {
        global.clanCronJobs[clanKey] = {};
    }

    // Value is in UTC format (HH:mmZ or HH:mm for backward compatibility)
    // Remove 'Z' suffix if present
    const cleanValue = value.endsWith('Z') ? value.slice(0, -1) : value;
    const hourUTC = cleanValue.substring(0, 2);
    const minuteUTC = cleanValue.substring(3, 5);

    // Schedule the reports using UTC time (stored value is already UTC)
    // Using timezone: 'UTC' ensures execution at UTC time regardless of system timezone
    global.clanCronJobs[clanKey].report = cron.schedule(minuteUTC + ' ' + hourUTC + ' * * 5,6,7,1', () => {
        reports.report(bot, api, null, null, channel, tag, guildID)
    }, {
        timezone: 'UTC'
    });

    // Schedule ffrace and ffattacks with ping at 9h00 and 21h00 LOCAL TIME on the war days
    global.clanCronJobs[clanKey].morning = cron.schedule('0 9 * * 5,6,7,1', () => {
        ffrace.ffrace(bot, api, null, channel, tag, false)
        ffattacks.ffattacks(bot, api, null, true, channel, tag, guildID)
    });

    global.clanCronJobs[clanKey].evening = cron.schedule('0 21 * * 4,5,6,7', () => {
        ffrace.ffrace(bot, api, null, channel, tag, false)
        ffattacks.ffattacks(bot, api, null, true, channel, tag, guildID)
    });
    // console.log('Scheduled ' + clanKey + ' for ' + minuteUTC + ' ' + hourUTC + ' * * 5,6,7,1 (UTC)')
}

// Function to stop all cron jobs for a specific clan
function stopAllCronJobs(tag, guildID) {
    const clanKey = tag + guildID;

    // Stop all cron jobs from the centralized structure
    try {
        if (global.clanCronJobs && global.clanCronJobs[clanKey]) {
            if (global.clanCronJobs[clanKey].report) {
                global.clanCronJobs[clanKey].report.stop();
            }
            if (global.clanCronJobs[clanKey].morning) {
                global.clanCronJobs[clanKey].morning.stop();
            }
            if (global.clanCronJobs[clanKey].evening) {
                global.clanCronJobs[clanKey].evening.stop();
            }
            delete global.clanCronJobs[clanKey];
        }
    } catch (e) {
        console.log('No cron jobs to stop for ' + clanKey);
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
    loadSchedules,
    stopAllCronJobs
}
