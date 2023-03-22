const Discord = require("discord.js");
const { EmbedBuilder } = require('discord.js');
const Chart = require("chart");
const { ClashRoyaleAPI } = require('@varandas/clash-royale-api')
require("dotenv").config();
const fetch = require("node-fetch");

// const { sendAnswer } = require("./utils.js");

const intents = new Discord.IntentsBitField(3276799);
const bot = new Discord.Client({ intents });

// Initialize the CR api
const api = new ClashRoyaleAPI(process.env.CR_TOKEN)

bot.login(process.env.BOT_TOKEN);


bot.on("messageCreate", async (message) => {
  if (message.author.tag == bot.user.tag) return;

  if (message.content === "!medals") {
    let Labels = [];
    let Datas = [];
    let Race = "";
    api.getClanCurrentRiverRace("#YRLJGL9")
      .then((response) => {
        //console.log(response.clans.periodLogs)
        return response
      })
      .catch((err) => {
        console.log("CR-API error : ", err)
      })
    let RiverRace = await api.getClanCurrentRiverRace("#YRLJGL9")
    for (let i = 0; i < RiverRace.clans.length; i++) {
      let labels = RiverRace.clans[i].name
      Labels.push(labels);
      let data = RiverRace.clans[i].periodPoints
      Datas.push(data);
      //console.log(RiverRace.clans[i].name)
      //console.log(RiverRace.clans[i].periodPoints)

      api.getClanByTag(RiverRace.clans[i].tag)
        .then((clan) => {
          //console.log(clan)
          return clan
        })
        .catch((err) => {
          console.log("CR-API error : ", err)
        })
      let clan = await api.getClanByTag(RiverRace.clans[i].tag)
      Race += "- __" + RiverRace.clans[i].name + "__ " + " : **" + RiverRace.clans[i].periodPoints + " medal" + (RiverRace.clans[i].periodPoints > 1 ? "s" : "") + "**\n(" + RiverRace.clans[i].tag + ", " + clan.location.name + ", " + clan.clanWarTrophies + " tr, " + clan.members + " members)" + "\n\n"
    }
    // console.log(RiverRace.clan)
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
                'max': 45000,
              }
            }
          ]
        }
      }
    };
    const encodedChart = encodeURIComponent(JSON.stringify(chart));
    const chartUrl = `https://quickchart.io/chart?c=${encodedChart}`;
    //console.log(chart)
    try {
      const medalsEmbed = new EmbedBuilder()
        .setColor(0x0099FF)
        .setTitle('__Current river race__ :')
        //.setURL('https://discord.js.org/')
        .setAuthor({ name: bot.user.tag, iconURL: bot.user.avatar /* , url: 'https://discord.js.org' */ })
        .setDescription(Race)
        .setThumbnail('https://cdn.discordapp.com/attachments/527820923114487830/1071116873321697300/png_20230203_181427_0000.png')
        /* .addFields(
          { name: 'Regular field title', value: 'Some value here' },
          { name: '\u200B', value: '\u200B' },
          { name: 'Inline field title', value: 'Some value here', inline: true },
          { name: 'Inline field title', value: 'Some value here', inline: true },
        ) */
        //.addFields({ name: 'Inline field title', value: 'Some value here', inline: true })
        .setImage(chartUrl)
        .setTimestamp()
        .setFooter({ text: 'by OPM | Féfé ⚡', iconURL: 'https://avatars.githubusercontent.com/u/94113911?s=400&v=4' });

      message.channel.send({ embeds: [medalsEmbed] });
      //message.channel.send(`${chartUrl}`);
    } catch (e) {
      console.log(e);
    }
  }
  else if (message.content === "!attacks") {
    let Players = "";
    api.getClanCurrentRiverRace("#YRLJGL9")
      .then((response) => {
        return response
      })
      .catch((err) => {
        console.log("CR-API error : ", err)
      })
    let RiverRace = await api.getClanCurrentRiverRace("#YRLJGL9")
    //console.log(RiverRace)
    api.getClanMembers("#YRLJGL9")
      .then((members) => {
        //console.log(members)
        return members
      })
      .catch((err) => {
        console.log("CR-API error : ", err)
      })
    let members = await api.getClanMembers("#YRLJGL9")
    for (let i = 0; i < members.length; i++) {
      //console.log(RiverRace.clan.participants.length)
      for (let j = 0; j < RiverRace.clan.participants.length; j++) {
        if (RiverRace.clan.participants[j].name == members[i].name && RiverRace.clan.participants[j].decksUsedToday != 4) {
          //console.log(members[i].name)
          //console.log(RiverRace.clan.participants[j].decksUsedToday)
          let decksUsedToday = 4 - RiverRace.clan.participants[j].decksUsedToday
          Players += members[i].name + " : " + decksUsedToday + " remaining" + /* (decksUsedToday > 1 ? "s" : "") + */ "\n";
        }
      }
    }
    //console.log(Players)
    if (Players != "") {
      Players += "\n" + "https://royaleapi.com/clan/YRLJGL9" + "\n"
      const attacksEmbed = new EmbedBuilder()
        .setColor(0x0099FF)
        .setTitle('Attacks remaining')
        //.setURL('https://discord.js.org/')
        .setAuthor({ name: bot.user.tag, iconURL: bot.user.avatar /* , url: 'https://discord.js.org' */ })
        .setDescription(Players)
        .setThumbnail('https://cdn.discordapp.com/attachments/527820923114487830/1071116873321697300/png_20230203_181427_0000.png')
        /* .addFields(
          { name: 'Regular field title', value: 'Some value here' },
          { name: '\u200B', value: '\u200B' },
          { name: 'Inline field title', value: 'Some value here', inline: true },
          { name: 'Inline field title', value: 'Some value here', inline: true },
        )
        .addFields({ name: 'Inline field title', value: 'Some value here', inline: true })
        .setImage('https://i.imgur.com/AfFp7pu.png') */
        .setTimestamp()
        .setFooter({ text: 'by OPM | Féfé ⚡', iconURL: 'https://avatars.githubusercontent.com/u/94113911?s=400&v=4' });

      message.channel.send({ embeds: [attacksEmbed] });
      //message.channel.send(Players);
      //message.channel.send("<@UserID>");
    }
  }
});

bot.on("ready", async () => {
  console.log(`${bot.user.tag} est connecté`);
});
