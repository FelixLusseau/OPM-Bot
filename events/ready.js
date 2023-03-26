const { Events, ActivityType } = require('discord.js');
require("dotenv").config();

module.exports = {
    name: Events.ClientReady,
    once: true,
    execute(bot) {
        console.log(`Ready! Logged in as ${bot.user.tag}`);
        bot.user.setActivity('your stats', { type: ActivityType.Watching });

        /* const id = process.env.GUILD_ID;
        const guild = bot.guilds.cache.find((g) => g.id === id);
        //console.log(guild)
        //console.log(guild.members)

        if (!guild)
            return console.log(`Can't find any guild with the ID "${id}"`);

        //console.log(guild.members)

        guild.members
            .fetch()
            .then((members) => {
                //console.log(members)
                members.forEach((member) => {
                    console.log(member.user.username)
                    console.log(member.user.id)
                    console.log(member.user.tag)
                    console.log(member.nickname)
                })
            }
            ); */
    },
};