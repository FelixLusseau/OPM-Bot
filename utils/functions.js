const fs = require('fs');
const Excel = require('exceljs');
const path = require('node:path');

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

async function excel(scores) {
    const workbook = new Excel.Workbook();
    const worksheet = workbook.addWorksheet('Averages');
    const avgColumns = [
        { key: 'player', header: 'Player name' },
        { key: 'fame', header: 'Average' },
        { key: 'week1', header: 'Week -1' },
        { key: 'week2', header: 'Week -2' },
        { key: 'week3', header: 'Week -3' },
        { key: 'week4', header: 'Week -4' },
        { key: 'week5', header: 'Week -5' },
        { key: 'week6', header: 'Week -6' },
        { key: 'week7', header: 'Week -7' },
        { key: 'week8', header: 'Week -8' },
        { key: 'week9', header: 'Week -9' },
        { key: 'week10', header: 'Week -10' },
    ];

    worksheet.columns = avgColumns;

    for (const key in scores) {
        if (scores[key]['fame'] == 0) continue;
        worksheet.addRow({ player: key, fame: scores[key]['fame'].toFixed(), week1: scores[key]['array'][0], week2: scores[key]['array'][1], week3: scores[key]['array'][2], week4: scores[key]['array'][3], week5: scores[key]['array'][4], week6: scores[key]['array'][5], week7: scores[key]['array'][6], week8: scores[key]['array'][7], week9: scores[key]['array'][8], week10: scores[key]['array'][9] });
    }

    worksheet.columns.forEach((sheetColumn) => {
        sheetColumn.font = {
            size: 12,
        };
        sheetColumn.alignment = {
            vertical: 'middle',
            horizontal: 'center'
        };
        if (sheetColumn.key == 'player') {
            sheetColumn.width = 30;
            sheetColumn.font = {
                bold: true,
            };
        }
        else {
            sheetColumn.width = 15;
        }
    });

    worksheet.getRow(1).font = {
        bold: true,
        size: 13,
    };
    for (let i = 1; i <= 12; i++) {
        const cellToColor = worksheet.getCell(1, i);
        cellToColor.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FF949494' } // Gray color
        };
    }

    worksheet.getColumn('B').eachCell({ includeEmpty: false }, (cell, rowNumber) => {
        cell.border = {
            left: { style: 'medium' },
            right: { style: 'medium' }
        };
        if (rowNumber > 1) {
            const value = cell.value;

            for (let i = 1; i <= 12; i++) {
                const cellToColor = worksheet.getCell(rowNumber, i);
                if (cellToColor.value == null) continue;
                if (i <= 2) {
                    if (value < 2400) {
                        cellToColor.fill = {
                            type: 'pattern',
                            pattern: 'solid',
                            fgColor: { argb: 'FFD61E1E' } // Red color
                        };
                    } else if (value >= 2400 && value <= 2700) {
                        cellToColor.fill = {
                            type: 'pattern',
                            pattern: 'solid',
                            fgColor: { argb: 'FFE79A2B' } // Orange color
                        };
                    } else {
                        cellToColor.fill = {
                            type: 'pattern',
                            pattern: 'solid',
                            fgColor: { argb: 'FF18B815' } // Green color
                        };
                    }
                }
                else {
                    if (cellToColor.value < 2400) {
                        cellToColor.fill = {
                            type: 'pattern',
                            pattern: 'solid',
                            fgColor: { argb: 'FFD61E1E' } // Red color
                        };
                    } else if (cellToColor.value >= 2400 && cellToColor.value <= 2700) {
                        cellToColor.fill = {
                            type: 'pattern',
                            pattern: 'solid',
                            fgColor: { argb: 'FFE79A2B' } // Orange color
                        };
                    } else {
                        cellToColor.fill = {
                            type: 'pattern',
                            pattern: 'solid',
                            fgColor: { argb: 'FF18B815' } // Green color
                        };
                    }
                };
            }
        }
    });

    const exportPath = path.resolve(__dirname, '../averages.xlsx');

    await workbook.xlsx.writeFile(exportPath)
        .then(() => {
            console.log('File saved successfully.');
        })
        .catch((error) => {
            console.error('An error occurred while saving the file:', error);
        });
}

module.exports = {
    ratio,
    fetchHist,
    excel
}