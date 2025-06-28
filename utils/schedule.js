const cron = require('node-cron');
const reports = require('./reports.js');
const ffattacks = require('../commands/ffattacks.js');
const ffrace = require('../commands/ffrace.js');
const sqlite3 = require('sqlite3').verbose();
const config = require('../config/config');
const globals = require('./globals');
const logger = require('./logger');

// Function to get the guild members
async function getGuildMembers(guildsDict) {
    for (const [key, guild] of Object.entries(guildsDict)) {
        try {
            await guild.members
                .fetch()
                .then((memberss) => {
                    globals.setGuildMembers(key, memberss);
                    global.guildMembers[key] = memberss; // Keep for backward compatibility
                })
        }
        catch (error) {
            logger.error("Guild members fetch error for guild " + key + ":", error);
        }
    }
}

// Function to schedule the reports and evening reminders
function schedule(bot, value, tag, guildID, chanID) {
    const channel = bot.channels.cache.get(chanID);
    const clanKey = tag + guildID;

    // Schedule the reports and save them in the global clanCronJobs structure
    globals.addCronJob(clanKey, 'report', cron.schedule(value.substring(3, 5) + ' ' + value.substring(0, 2) + ' * * 5,6,7,1', () => {
        reports.report(bot, globals.getApi(), null, null, channel, tag, guildID)
    }));

    // Schedule ffrace and ffattacks with ping at 9h00 and 21h00 on the war days
    globals.addCronJob(clanKey, 'morning', cron.schedule(config.schedule.defaultTimes.morning + ' * * 5,6,7,1', () => {
        ffrace.ffrace(bot, globals.getApi(), null, channel, tag, false)
        ffattacks.ffattacks(bot, globals.getApi(), null, true, channel, tag, guildID)
    }));

    globals.addCronJob(clanKey, 'evening', cron.schedule(config.schedule.defaultTimes.evening + ' * * 4,5,6,7', () => {
        ffrace.ffrace(bot, globals.getApi(), null, channel, tag, false)
        ffattacks.ffattacks(bot, globals.getApi(), null, true, channel, tag, guildID)
    }));

    // Keep backward compatibility
    global.reportCron = globals.reportCron;
    
    logger.schedule('created', `for clan ${tag} in guild ${guildID} at ${value}`);
}

// Function to stop all cron jobs for a specific clan
function stopAllCronJobs(tag, guildID) {
    const clanKey = tag + guildID;
    
    try {
        globals.removeCronJobs(clanKey);
        logger.schedule('stopped', `all jobs for clan ${tag} in guild ${guildID}`);
    } catch (e) {
        logger.warning('No cron jobs to stop for ' + clanKey);
    }
}

async function loadSchedules(bot) {
    // Schedule guild members refresh
    cron.schedule(config.schedule.guildMembersRefresh, () => {
        getGuildMembers(globals.guildsDict);
        logger.schedule('executed', 'guild members refresh');
    });

    try {
        let db = new sqlite3.Database(config.database.path, sqlite3.OPEN_READWRITE, (err) => {
            if (err) {
                logger.error('Database connection error:', err.message);
                return;
            }
        });

        await new Promise((resolve, reject) => {
            db.each(`SELECT * FROM Reports`, (err, row) => {
                if (err) {
                    reject(err);
                } else {
                    schedule(bot, row.Hour, row.Clan, row.Guild, row.Channel);
                }
            }, (err, count) => {
                if (err) {
                    reject(err);
                } else {
                    logger.info(`Loaded ${count} scheduled reports`);
                    resolve();
                }
            });
        });

        // Close the database
        db.close((err) => {
            if (err) {
                logger.error('Database close error:', err.message);
            }
        });
    } catch (err) {
        logger.error('Error loading schedules:', err);
    }
}

module.exports = {
    getGuildMembers,
    schedule,
    loadSchedules,
    stopAllCronJobs
}
