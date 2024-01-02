const fs = require('fs');
const Excel = require('exceljs');
const path = require('node:path');
const https = require('node:https');
const puppeteer = require('puppeteer');
const { AttachmentBuilder, EmbedBuilder } = require('discord.js');
const { promises } = require('dns');
const { time } = require('console');

// Function to send an error embed
function errorEmbed(bot, interaction, channel, error) {
    let myError = ""
    if (typeof (error) == "string")
        myError = error
    else
        myError = '[' + error.response.headers.date + ']: Error: ' + error.response.status + ' ' + error.response.statusText
    console.error(myError);
    console.log("CR-API error : ", error)
    const errorEmbed = new EmbedBuilder()
    errorEmbed
        .setColor(0x0099FF)
        .setTitle("CR-API error")
        .setDescription(myError)
        .setAuthor({ name: bot.user.tag, iconURL: 'https://cdn.discordapp.com/avatars/' + bot.user.id + '/' + bot.user.avatar + '.png' })
        .setThumbnail('https://cdn.discordapp.com/attachments/527820923114487830/1071116873321697300/png_20230203_181427_0000.png')
        .setTimestamp()
        .setImage('https://media.tenor.com/xEfTylb0-A4AAAAM/sad.gif')
        .setFooter({ text: 'by OPM | Féfé ⚡', iconURL: 'https://avatars.githubusercontent.com/u/94113911?s=400&v=4' });
    if (interaction != null)
        interaction.editReply({ embeds: [errorEmbed] });
    else
        channel.send({ embeds: [errorEmbed] });
}

// Function to calculate the ratio of fame over decks remaining
function ratio(RiverRace, decksRemaining, i) {
    let clan
    if (i > -1) clan = RiverRace.clans[i]
    else clan = RiverRace.clan
    // Calculate the ratio depending on the day and hour during Colosseum
    if (RiverRace.periodType == "colosseum") {
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
        if ((day == "Thursday" && hour > warHour) || (day == "Friday" && hour < warHour))
            ratio = (clan.fame / (200 - decksRemaining)).toFixed(2).toString()
        if ((day == "Friday" && hour > warHour) || (day == "Saturday" && hour < warHour))
            ratio = (clan.fame / (400 - decksRemaining)).toFixed(2).toString()
        if ((day == "Saturday" && hour > warHour) || (day == "Sunday" && hour < warHour))
            ratio = (clan.fame / (600 - decksRemaining)).toFixed(2).toString()
        if ((day == "Sunday" && hour > warHour) || (day == "Monday" && hour < warHour))
            ratio = (clan.fame / (800 - decksRemaining)).toFixed(2).toString()
    }
    else {
        if (decksRemaining == 200)
            ratio = 0.00.toFixed(2).toString()
        else
            ratio = (clan.periodPoints / (200 - decksRemaining)).toFixed(2).toString()
    }
    return ratio
}

// Function to choose the emote depending on the ratio
function ratioEmote(ratio) {
    let ratioEmote = "<a:Green_battery:1186367109073227837>"
    if (ratio < 170)
        ratioEmote = "<:Battery_yellow:1186367121966506116>"
    if (ratio < 160)
        ratioEmote = "<a:Battery_low:1186367126756393042>"
    return ratioEmote
}

// Function to fetch the clan's war history directly from the Supercell API not using the @varandas/clash-royale-api package (not available in it)
async function fetchHist(tag) {
    try {
        const response = await fetch("https://api.clashroyale.com/v1/clans/%23" + tag + "/riverracelog", {
            headers: {
                authorization: `Bearer ${process.env.CR_TOKEN}`,
            },
        });
        const jsonData = await response.json();
        return jsonData;
    } catch (error) {
        console.log("CR-API error : ", error)
        return error;
    }
}

function generateHtmlTableFromWorksheet(worksheet) {
    let html = '<table>\n';

    worksheet.eachRow((row, rowNumber) => {
        html += '<tr>\n';
        row.eachCell({ includeEmpty: true }, (cell) => {
            if (cell.type == 0) { // Empty cell -> add an empty cell in the HTML table
                html += `<td> </td>\n`;
            }
            else {
                const cellColor = cell.fill.fgColor.argb.substring(2);
                const cellValue = cell.text || '';
                html += `<td style="background-color:#${cellColor}; text-align: center">${cellValue}</td>\n`;
            }
        });
        html += '</tr>\n';
    });

    html += '</table>\n';

    return html;
}

// Function to read the Excel file and convert the first sheet to a PNG image
async function exportSheetToPNG(inputFilePath, pngPath) {
    const workbook = new Excel.Workbook();
    await workbook.xlsx.readFile(inputFilePath);
    const worksheet = workbook.worksheets[0];

    // Convert the worksheet to an HTML table
    const table = generateHtmlTableFromWorksheet(worksheet);

    const browser = await puppeteer.launch({ headless: 'new' });
    const page = await browser.newPage();

    // Navigate to a blank HTML page
    await page.goto('about:blank');

    // Inject the HTML content into the page
    await page.evaluate((content) => {
        document.body.innerHTML = content;
    }, table);

    // Get the dimensions of the rendered table
    const { width, height } = await page.evaluate(() => {
        const table = document.querySelector('table');
        return {
            width: table.offsetWidth,
            height: table.offsetHeight + 50,
        };
    });

    // Set the viewport size based on the width and height
    await page.setViewport({ width, height });

    // Capture a screenshot of the rendered content
    await page.screenshot({ path: pngPath });

    await browser.close();

    // console.log('Image exported successfully.');
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

    const xlsxPath = path.resolve(__dirname, '../averages.xlsx');

    await workbook.xlsx.writeFile(xlsxPath)
        .then(() => {
            // console.log('File saved successfully.');
        })
        .catch((error) => {
            console.error('An error occurred while saving the file:', error);
        });

    const pngPath = 'averages.png'; // Replace with the desired output image path
    await exportSheetToPNG(xlsxPath, pngPath).catch((error) => {
        console.error('An error occurred:', error);
    });
}

async function http_head(tag) {
    const url = 'https://www.cwstats.com' + tag;
    return new Promise((resolve, reject) => {
        const req = https.request(url, { method: 'HEAD' }, (res) => {
            resolve(res.statusCode);
        });

        req.on('error', (err) => {
            console.error(err);
            reject(err);
        });

        req.end();
    });
}

function base64ToArrayBuffer(base64) {
    var binary_string = Buffer.from(base64, 'base64').toString('binary');
    var len = binary_string.length;
    var bytes = new Uint8Array(len);
    for (var i = 0; i < len; i++) {
        bytes[i] = binary_string.charCodeAt(i);
    }
    return bytes.buffer;
}

async function playerHistory(url) {
    // console.log('Launching Puppeteer...');
    // Launch the browser and open a new blank page
    const browser = await puppeteer.launch({ headless: 'new' });
    const page = await browser.newPage();

    // Navigate the page to a URL
    await page.goto(url);

    // Accept cookies
    try {
        await Promise.all([
            page.waitForSelector("button.css-47sehv"),
        ]);
        await Promise.all([
            page.click("button.css-47sehv"),
        ]);
    } catch (error) {
        console.log('No cookies to accept');
    }

    // Show the player history
    await Promise.all([
        page.click("button.ui.primary.button.cw2_history_button"),
    ]);

    // Wait for the chart to be rendered
    await new Promise(resolve => setTimeout(resolve, 2000));

    const elem = await page.$('#page_content');
    const boundingBox = await elem.boundingBox();
    // console.log('boundingBox', boundingBox)

    // Set the viewport size based on the width and height
    // await page.setViewport({ width: 1080, height: parseInt(boundingBox.height) - 3300 });

    // // Set screen size
    await page.setViewport({ width: 1080, height: 2048 });

    // Get the base64-encoded image data
    const imageData = await page.$eval("canvas#cw2-history-chart", el => el.toDataURL().substring(22));

    // Convert the base64-encoded data to an ArrayBuffer
    const buffer = base64ToArrayBuffer(imageData);

    // Create a new Uint8Array from the ArrayBuffer
    const uint8Array = new Uint8Array(buffer);

    // Create a new file and write the data to it
    fs.writeFileSync('playerHistoryCanvas.png', uint8Array);

    // Scroll to the canvas element
    await page.evaluate(() => {
        const canvas = document.querySelector("canvas#cw2-history-chart");
        canvas.scrollIntoView();
    });

    // Capture a screenshot of the rendered content
    const pngPath = 'playerHistory.png';
    await page.screenshot({ path: pngPath });

    await browser.close();
}

async function renderCommand(interaction, tmpFile, wait, screenReduce) {
    const browser = await puppeteer.launch({ headless: 'new' });
    const page = await browser.newPage();

    // Navigate to a blank HTML page
    await page.goto(`file:${path.join(__dirname, '../' + tmpFile)}`);

    // Get the bounding box of the body
    const elem = await page.$('body');
    const boundingBox = await elem.boundingBox();
    // console.log('boundingBox', boundingBox)

    // Set the viewport size based on the width and height of the body
    await page.setViewport({ width: 1920, height: parseInt(boundingBox.height) + 20 - screenReduce });

    // Wait for the chart to be rendered
    await new Promise(resolve => setTimeout(resolve, wait));

    // Capture a screenshot of the rendered content
    await page.screenshot({ path: tmpFile + ".png" });

    await browser.close();

    // Send the image to the channel
    const attachment = new AttachmentBuilder(tmpFile + ".png");
    await interaction.editReply({ files: [attachment] });

    // Delete the temporary files
    fs.unlinkSync('./' + tmpFile);
    fs.unlinkSync('./' + tmpFile + '.png');
}

function barChart(type, Labels, Datas, max) {
    let scales = {}
    if (type == 'bar')
        scales = {
            yAxes: [{
                ticks: {
                    beginAtZero: true,
                    max: max,
                },
            }],
        };
    else if (type == 'horizontalBar')
        scales = {
            xAxes: [{
                ticks: {
                    beginAtZero: true,
                    max: max,
                },
            }],
        };
    const chart = {
        type: type,
        data: {
            labels: Labels,
            datasets: [
                {
                    label: 'Medals',
                    data: Datas,
                    backgroundColor: ['rgba(255, 99, 132, 0.2)', 'rgba(255, 159, 64, 0.2)', 'rgba(255, 205, 86, 0.2)', 'rgba(75, 192, 192, 0.2)', 'rgba(54, 162, 235, 0.2)'],
                    borderColor: ['rgb(255, 99, 132)', 'rgb(255, 159, 64)', 'rgb(255, 205, 86)', 'rgb(75, 192, 192)', 'rgb(54, 162, 235)'],
                    borderWidth: 1,
                },
            ],
        },
        options: {
            'scales': scales,
            plugins:
                [
                    {
                        datalabels: {
                            anchor: 'end',
                            align: 'top',
                            formatter: Math.round,
                            font: {
                                weight: 'bold',
                                size: 16
                            }
                        }
                    },
                    // {
                    //     legend: {
                    //         display: false,
                    //     }
                    // }
                ]
        },
    };
    return chart;
}

module.exports = {
    errorEmbed,
    ratio,
    ratioEmote,
    fetchHist,
    excel,
    http_head,
    playerHistory,
    renderCommand,
    barChart
}
