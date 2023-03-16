const Discord = require("discord.js");
const Chart = require("chart");
const { ClashRoyaleAPI } = require('@varandas/clash-royale-api')
require("dotenv").config();

const { sendAnswer } = require("./utils.js");

const intents = new Discord.IntentsBitField(3276799);
const bot = new Discord.Client({ intents });

// Initialize the CR api
const api = new ClashRoyaleAPI(process.env.CR_TOKEN)

bot.login(process.env.BOT_TOKEN);

bot.on("messageCreate", async (message) => {
  if (message.author.tag == bot.user.tag) return;
  var Labels = [];
  var Datas = [];
  //api.getClanMembers("#YRLJGL9")
  api.getClanCurrentRiverRace("#YRLJGL9")
    .then((response) => {
      for (let i = 0; i < response.clans.length; i++) {
        var labels = response.clans[i].name
        Labels.push(labels);
        var data = response.clans[i].periodPoints
        Datas.push(data);
        //console.log(response.clans[i].name)
        //console.log(response.clans[i].periodPoints)
        //console.log(response.clan.participants)
      }
      // console.log(Labels)
      // console.log(Datas)
      const chart = {
        type: 'horizontalBar',
        data: {
          labels: Labels,
          datasets: [
            {
              label: 'Medals',
              data: Datas,
              backgroundColor: ['rgba(255, 99, 132, 0.2)', 'rgba(255, 159, 64, 0.2)', 'rgba(255, 205, 86, 0.2)', 'rgba(75, 192, 192, 0.2)', 'rgba(54, 162, 235, 0.2)'],//'rgba(54,255,51,0.2)',
              borderColor: ['rgb(255, 99, 132)', 'rgb(255, 159, 64)', 'rgb(255, 205, 86)', 'rgb(75, 192, 192)', 'rgb(54, 162, 235)'], //'#33FF3F',
              borderWidth: 1,
            },
          ],
        },
        options: {
          'scales':
          {
            'xAxes': [
              {
                'ticks':
                {
                  'beginAtZero': true,
                  'max': 40000,
                }
              }
            ]
          }
        }
        /* options: {
          styling: {
          },
        } */
      };
      const encodedChart = encodeURIComponent(JSON.stringify(chart));
      const chartUrl = `https://quickchart.io/chart?c=${encodedChart}`;
      console.log(chart)
      try {
        message.channel.send(`${chartUrl}`);

      } catch (e) {
        console.log(e);
      }
    })
    .catch((err) => {
      console.log("cc", err)
    })
  /* River.forEach(element => {
    console.log(element)
  }); */
  /*
  try {
    sendAnswer(message, "cc");
    //console.log(message.content);
    //console.log(message.author.tag);

  } catch (e) {
    console.log(e);
  } */

});

bot.on("ready", async () => {
  console.log(`${bot.user.tag} est connecté`);
});
