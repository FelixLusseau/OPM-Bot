const fs = require('fs');

// Function to calculate the ratio of fame over decks remaining
function ratio(RiverRace, decksRemaining, i) {
    let clan
    if (i > -1) clan = RiverRace.clans[i]
    else clan = RiverRace.clan
    const d = new Date();
    const weekday = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const day = weekday[d.getDay()]
    const hour = (('0' + d.getHours()).slice(-2) + ':' + ('0' + d.getMinutes()).slice(-2))
    // Read the war hour from the file
    const warHour = fs.readFileSync('./reset-hours/' + RiverRace.clan.name, 'utf8', (err, data) => {
        if (err) {
            return;
        }
        return data;
    });
    // Calculate the ratio depending on the day and hour during Colosseum
    if (RiverRace.periodType == "colosseum") {
        if ((day == "Thursday" && hour > warHour) || (day == "Friday" && hour < warHour))
            ratio = (clan.fame / (200 - decksRemaining)).toFixed(2).toString()
        if ((day == "Friday" && hour > warHour) || (day == "Saturday" && hour < warHour))
            ratio = (clan.fame / (400 - decksRemaining)).toFixed(2).toString()
        if ((day == "Saturday" && hour > warHour) || (day == "Sunday" && hour < warHour))
            ratio = (clan.fame / (600 - decksRemaining)).toFixed(2).toString()
        if ((day == "Sunday" && hour > warHour) || (day == "Monday" && hour < warHour))
            ratio = (clan.fame / (800 - decksRemaining)).toFixed(2).toString()
    }
    else { ratio = (clan.periodPoints / (200 - decksRemaining)).toFixed(2).toString() }
    return ratio
}

// Function to fetch the clan's war history directly from the Supercell API not using the @varandas/clash-royale-api package (not available in it)
async function fetchHist(tag) {
    const response = await fetch("https://api.clashroyale.com/v1/clans/%23" + tag + "/riverracelog", {
        headers: {
            authorization: `Bearer ${process.env.CR_TOKEN}`,
        },
    });
    const jsonData = await response.json();
    return jsonData;
}

module.exports = {
    ratio,
    fetchHist
}