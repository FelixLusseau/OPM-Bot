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
        global.clansDict = {}
        clansDict['one punch man'] = '#YRLJGL9'
        clansDict['Netherfriends'] = '#L2L8V08'
        clansDict['The Deadly Sins'] = '#LVQ8P8YG'
        clansDict['100% Fr'] = '#LLUC90PP'
        clansDict['Two Punch Man'] = '#G2CY2PPL'
        clansDict['#YRLJGL9'] = 'one punch man'
        clansDict['#L2L8V08'] = 'Netherfriends'
        clansDict['#LVQ8P8YG'] = 'The Deadly Sins'
        clansDict['#LLUC90PP'] = '100% Fr'
        clansDict['#G2CY2PPL'] = 'Two Punch Man'
        global.reportTimes = {}
        global.reportCron = {}

        schedule.loadSchedules(bot)
        const guildID = process.env.OPM_GUILD_ID;

        // Get the guild members at the bot startup
        const guild = bot.guilds.cache.find((g) => g.id === guildID);
        if (!guild)
            return console.log(`Can't find any guild with the ID "${guildID}"`);
        schedule.getGuildMembers(guild)
    },
};