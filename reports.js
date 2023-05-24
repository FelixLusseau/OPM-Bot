const ffattacks = require('./commands/ffattacks');
const ffresults = require('./commands/ffresults');

async function report(bot, api, interaction, pingBool, guildId, channel, clan) {
    ffattacks.ffattacks(bot, api, interaction, pingBool, guildId, channel, clan)
    ffresults.ffresults(bot, api, interaction, guildId, channel, clan)
}

module.exports = {
    report
}