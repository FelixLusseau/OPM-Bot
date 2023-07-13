const cron = require('node-cron');
const reports = require('./reports.js');
const ffattacks = require('../commands/ffattacks.js');
const ffrace = require('../commands/ffrace.js');

function schedule(bot, key, value, tag, guildID) {
    let chanID = 0
    switch (key) {
        case 'one punch man':
            chanID = process.env.OPM_CHANNEL_ID;
            break;
        case 'Netherfriends':
            chanID = process.env.NF_CHANNEL_ID;
            break;
        case 'The Deadly Sins':
            chanID = process.env.TDS_CHANNEL_ID;
            break;
        case '100% Fr':
            chanID = process.env.CPCT_CHANNEL_ID;
            break;
        case 'Two Punch Man':
            chanID = process.env.TPM_CHANNEL_ID;
            break;
        default:
            break;
    }
    // Uncomment these lines to test the report in the dev channel
    // guildID = process.env.DEV_GUILD_ID
    // chanID = process.env.DEV_CHANNEL_ID

    // Schedule the reports and save them in the global reportCron dictionary
    reportCron[key] = cron.schedule(value.substring(3, 5) + ' ' + value.substring(0, 2) + ' * * 5,6,7,1', () => {
        const channel = bot.channels.cache.get(chanID);
        reports.report(bot, api, null, null, guildID, channel, tag)
    });
    cron.schedule('0 1 * * 5,6,7,1', () => {
        const channel = bot.channels.cache.get(chanID);
        ffattacks.ffattacks(bot, api, null, true, guildID, channel, tag)
        ffrace.ffrace(bot, api, null, guildID, channel, tag)
    });
    // console.log('Scheduled ' + key + ' for ' + value.substring(3, 5) + ' ' + value.substring(0, 2) + ' * * 5,6,7,1')
}

module.exports = {
    schedule
}
