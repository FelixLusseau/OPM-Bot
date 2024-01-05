const { Events, ActivityType } = require('discord.js');
require("dotenv").config();
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
        global.reportCron = {}
        global.guildMembers = {}

        schedule.loadSchedules(bot)

        console.log("\nAccessible Channels :")
        bot.channels.cache.filter(channel => channel.type === 0).forEach(channel => {
            console.log("- " + channel.id, channel.name, "(" + channel.guild.name + ")");
        });

        console.log("\nCurrent Guilds :")
        bot.guilds.cache.forEach(guild => {
            console.log("- " + guild.id, guild.name);
        });

        // Get the guild members at the bot startup
        global.guildsDict = {};
        bot.guilds.cache.forEach((guild) => {
            guildsDict[guild.id] = guild;
        });
        // console.log(guildsDict);
        schedule.getGuildMembers(guildsDict)
    },
};