const cron = require('node-cron');
const reports = require('./reports.js');
const ffattacks = require('../commands/ffattacks.js');
const ffrace = require('../commands/ffrace.js');
const sqlite3 = require('sqlite3').verbose();

// Function to get the guild members
async function getGuildMembers(guild) {
    try {
        await guild.members
            .fetch()
            .then((memberss) => {
                guildMembers = memberss
            })
    }
    catch (error) {
        console.error("Guild members fetch error :" + error)
    }
}

// Function to schedule the reports and evening reminders
function schedule(bot, key, value, tag, guildID, chanID) {
    // let chanID = 0
    // switch (key) {
    //     case 'one punch man':
    //         chanID = process.env.OPM_CHANNEL_ID;
    //         break;
    //     case 'Netherfriends':
    //         chanID = process.env.NF_CHANNEL_ID;
    //         break;
    //     case 'The Deadly Sins':
    //         chanID = process.env.TDS_CHANNEL_ID;
    //         break;
    //     case '100% Fr':
    //         chanID = process.env.CPCT_CHANNEL_ID;
    //         break;
    //     case 'Two Punch Man':
    //         chanID = process.env.TPM_CHANNEL_ID;
    //         break;
    //     default:
    //         break;
    // }
    // Uncomment these lines to test the report in the dev channel
    // guildID = process.env.DEV_GUILD_ID
    // chanID = process.env.DEV_CHANNEL_ID

    // Schedule the reports and save them in the global reportCron dictionary
    reportCron[key] = cron.schedule(value.substring(3, 5) + ' ' + value.substring(0, 2) + ' * * 5,6,7,1', () => {
        const channel = bot.channels.cache.get(chanID);
        reports.report(bot, api, null, null, guildID, channel, tag)
    });
    // Schedule ffrace and ffattacks with ping at 01h00 and 23h00 on the war days
    cron.schedule('0 1 * * 5,6,7,1', () => {
        const channel = bot.channels.cache.get(chanID);
        ffrace.ffrace(bot, api, null, guildID, channel, tag, false)
        ffattacks.ffattacks(bot, api, null, true, guildID, channel, tag)
    });
    cron.schedule('0 23 * * 4,5,6,7', () => {
        const channel = bot.channels.cache.get(chanID);
        ffrace.ffrace(bot, api, null, guildID, channel, tag, false)
        ffattacks.ffattacks(bot, api, null, true, guildID, channel, tag)
    });
    // console.log('Scheduled ' + key + ' for ' + value.substring(3, 5) + ' ' + value.substring(0, 2) + ' * * 5,6,7,1')

    const guild = bot.guilds.cache.find((g) => g.id === guildID);
    if (!guild)
        return console.log(`Can't find any guild with the ID "${guildID}"`);

    global.guildMembers = {}
    cron.schedule('55 22 * * 4,5,6,7', () => { // Refresh the guild members list at 22h55 on war days
        getGuildMembers(guild)
    })

}

async function loadSchedules(bot) {
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
                    reportTimes[row.Clan] = row.Hour;
                    // console.log(row.Clan, row.Hour, clansDict[row.Clan], row.Guild, row.Channel)
                    schedule(bot, row.Clan, row.Hour, clansDict[row.Clan], row.Guild, row.Channel)
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
