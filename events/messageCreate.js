const { Events, AttachmentBuilder } = require('discord.js');
const functions = require('../utils/functions.js');
const fs = require('fs');
const ffplayer = require('../commands/ffplayer.js');

module.exports = {
    name: Events.MessageCreate,
    async execute(bot, api, message) {
        if (message.author.tag == bot.user.tag) return; // Ignore messages from the bot itself
        let placeholder = null

        // Check if the message contains a tag and send the RoyaleAPI Profile url into the channel
        const regex = /\#[a-zA-Z0-9]{6,9}\b/g
        if (message.content.search(regex) >= 0) {
            console.log(`\x1b[36m[${new Date().toISOString()}]\x1b[0m Tag received:`, message.content.match(regex)[0]);
            placeholder = await message.channel.send("Tag received !\nSearching... <a:Mag:1186624382982963290>") // Send a placeholder message to show that the bot is working
            await message.channel.sendTyping();
            const tag = message.content.match(regex)[0].substring(1).toUpperCase();
            try {
                const statusCode = await functions.http_head("/player/" + tag);
                // console.log('Status Code:', statusCode);
                if (statusCode == 200) {
                    let url = "https://royaleapi.com/player/" + tag
                    await functions.playerHistory(url);
                    const playerHistory = new AttachmentBuilder('playerHistory.png');
                    const playerHistoryCanvas = new AttachmentBuilder('playerHistoryCanvas.png');
                    await ffplayer.ffplayer(bot, api, null, message.channel, '#' + tag);
                    await message.channel.send({ content: url, files: [playerHistory, playerHistoryCanvas] });
                    // Remove files
                    fs.unlinkSync('./playerHistory.png')
                    fs.unlinkSync('./playerHistoryCanvas.png')
                }
                else
                    functions.errorEmbed(bot, null, message.channel, "Invalid tag");
            } catch (error) {
                console.error('Error:', error);
            }
            try {
                placeholder.delete(); // Delete the placeholder message
            }
            catch (error) {
                console.error(error);
            }
        }
    }
};
