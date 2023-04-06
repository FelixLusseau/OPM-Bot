const { Events } = require('discord.js');

module.exports = {
    name: Events.MessageCreate,
    async execute(bot, api, message) {
        //console.log('messageCreate event triggered.');
        if (message.author.tag == bot.user.tag) return;
        //console.log(message.content);
        const regex = /\#[a-zA-Z0-9]{8,9}\b/g
        //console.log(message.content.search(regex))
        if (message.content.search(regex) >= 0) {
            let url = "https://royaleapi.com/player/" + message.content.match(regex)[0].substring(1)
            message.channel.send(url);
        }
    }
};