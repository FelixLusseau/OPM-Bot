const { Events, ActivityType } = require('discord.js');
require("dotenv").config();
const fs = require('node:fs');
const schedule = require('../utils/schedule.js');

module.exports = {
    name: Events.ClientReady,
    once: true,
    execute(bot) {
        console.log(`Ready! Logged in as ${bot.user.tag}`);
        bot.user.setActivity('your stats', { type: ActivityType.Watching });

        // Load the report times from the reset-hours folder and schedule the reports
        const clansDict = {}
        clansDict['one punch man'] = '#YRLJGL9'
        clansDict['Netherfriends'] = '#L2L8V08'
        clansDict['The Deadly Sins'] = '#LVQ8P8YG'
        clansDict['100% Fr'] = '#LLUC90PP'
        clansDict['Two Punch Man'] = '#G2CY2PPL'
        global.reportTimes = {}
        fs.readdirSync('./reset-hours/').forEach(file => {
            reportTimes[file] = fs.readFileSync('./reset-hours/' + file, 'utf8', (err, data) => {
                if (err) {
                    return;
                }
                return data;
            });
        });
        const guildID = process.env.OPM_GUILD_ID;
        global.reportCron = {}
        for (const [key, value] of Object.entries(reportTimes)) {
            schedule.schedule(bot, key, value, clansDict[key], guildID)
        }
    },
};