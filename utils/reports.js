const ffattacks = require('../commands/ffattacks');
const ffresults = require('../commands/ffresults');
const { EmbedBuilder } = require('discord.js');

async function report(bot, api, interaction, pingBool, guildId, channel, clan) {
    // console.log('ccreport')
    const attacks = await ffattacks.ffattacks(bot, api, interaction, pingBool, guildId, channel, clan)
    const results = await ffresults.ffresults(bot, api, interaction, guildId, channel, clan)
    const reportEmbed = new EmbedBuilder();
    reportEmbed
        .setColor(0x0099FF)
        .setTitle('**__Daily War Report__ :**')
        .setAuthor({ name: bot.user.tag, iconURL: 'https://cdn.discordapp.com/avatars/' + bot.user.id + '/' + bot.user.avatar + '.png' })
        .setDescription(
            '**__Players\' attacks__ :**\n'
            + attacks
            + '\n--------------------------------------\n'
            + '\n**__Players\' war results__ :**\n'
            + results
        )
        .setThumbnail('https://cdn.discordapp.com/attachments/527820923114487830/1071116873321697300/png_20230203_181427_0000.png')
        .setTimestamp()
        .setFooter({ text: 'by OPM | Féfé ⚡', iconURL: 'https://avatars.githubusercontent.com/u/94113911?s=400&v=4' });
    channel.send({ embeds: [reportEmbed] });
    // console.log(clan)
}

module.exports = {
    report
}