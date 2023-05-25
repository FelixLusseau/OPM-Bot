const cron = require('node-cron');
const reports = require('./reports.js');

function schedule(bot, key, value, tag, guildID) {
    // console.log('schedule')
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
    // chanID = process.env.DEV_CHANNEL_ID
    // console.log(chanID)
    reportCron[key] = cron.schedule(value.substring(3, 5) + ' ' + value.substring(0, 2) + ' * * 5-7,1', () => {
        const channel = bot.channels.cache.get(chanID);
        reports.report(bot, api, null, null, guildID, channel, tag)
    });
}

module.exports = {
    schedule
}