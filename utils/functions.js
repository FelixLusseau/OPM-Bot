const fs = require('fs');

function ratio(RiverRace, decksRemaining, i) {
    let clan
    if (i > -1) clan = RiverRace.clans[i]
    else clan = RiverRace.clan
    const d = new Date();
    const weekday = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    //console.log(d)
    const day = weekday[d.getDay()]
    const hour = (('0' + d.getHours()).slice(-2) + ':' + ('0' + d.getMinutes()).slice(-2))
    const warHour = fs.readFileSync('./reset-hours/' + RiverRace.clan.name, 'utf8', (err, data) => {
        if (err) {
            return;
        }
        return data;
    });
    /* console.log(day == "Thursday")
    console.log(hour > warHour)
    console.log((day == "Thursday" && hour > warHour) || (day == "Friday" && hour < warHour)) */
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

async function fetchHist(tag) {
    const response = await fetch("https://api.clashroyale.com/v1/clans/%23" + tag + "/riverracelog", {
        headers: {
            authorization: `Bearer ${process.env.CR_TOKEN}`,
        },
    });
    const jsonData = await response.json();
    //console.log(jsonData);
    return jsonData;
}

module.exports = {
    ratio,
    fetchHist
}