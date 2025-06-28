const { Events, ActivityType } = require('discord.js');
const config = require('../config/config');
const globals = require('../utils/globals');
const logger = require('../utils/logger');
const schedule = require('../utils/schedule.js');
const functions = require('../utils/functions.js');

module.exports = {
    name: Events.ClientReady,
    once: true,
    async execute(bot) {
        console.log("  ___  ____  __  __      ____  _        _       ")
        console.log(" / _ \\|  _ \\|  \\/  |    / ___|| |_ __ _| |_ ___")
        console.log("| | | | |_) | |\\/| |____\\___ \\| __/ _` | __/ __|")
        console.log("| |_| |  __/| |  | |_____|__) | || (_| | |_\\__ \\")
        console.log(" \\___/|_|   |_|  |_|    |____/ \\__\\__,_|\\__|___/")

        logger.startup(`Ready! Logged in as ${bot.user.tag}`);
        bot.user.setActivity(config.discord.activity.name, { type: ActivityType.Watching });

        // Initialize global state
        globals.reset();
        
        // Load schedules and other initialization
        try {
            await schedule.loadSchedules(bot);
            logger.success('Schedules loaded successfully');
        } catch (error) {
            logger.error('Failed to load schedules:', error.message);
        }

        // Log accessible guilds
        logger.info("Current Guilds:");
        bot.guilds.cache.forEach(guild => {
            logger.info(`- ${guild.id} : ${guild.name}`);
            globals.guildsDict[guild.id] = guild;
        });

        // Get guild members at startup
        try {
            await schedule.getGuildMembers(globals.guildsDict);
            logger.success('Guild members loaded successfully');
        } catch (error) {
            logger.error('Failed to load guild members:', error.message);
        }

        // Load registered clans
        try {
            await functions.loadRegisteredClans();
            logger.success('Registered clans loaded successfully');
        } catch (error) {
            logger.error('Failed to load registered clans:', error.message);
        }
    },
};