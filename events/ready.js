const { Events, ActivityType } = require('discord.js');
require("dotenv").config();

module.exports = {
    name: Events.ClientReady,
    once: true,
    execute(bot) {
        console.log(`Ready! Logged in as ${bot.user.tag}`);
        bot.user.setActivity('your stats', { type: ActivityType.Watching });
    },
};