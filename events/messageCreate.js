const { Events } = require('discord.js');

module.exports = {
    name: Events.MessageCreate,
    async execute(bot, api, message) {
        if (message.author.tag == bot.user.tag) return; // Ignore messages from the bot itself

        // Check if the message contains a tag and send the RoyaleAPI Profile url into the channel
        const regex = /\#[a-zA-Z0-9]{8,9}\b/g
        if (message.content.search(regex) >= 0) {
            let url = "https://royaleapi.com/player/" + message.content.match(regex)[0].substring(1)
            message.channel.send(url);
        }
    }
};