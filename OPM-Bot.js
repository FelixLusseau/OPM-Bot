const fs = require('node:fs');
const path = require('node:path');
const { Client, Collection, Events, GatewayIntentBits } = require('discord.js');
const { ClashRoyaleAPI } = require('@varandas/clash-royale-api')
const Discord = require("discord.js");
const cron = require('node-cron');
require("dotenv").config();
const ffattacks = require('./commands/ffattacks.js');
const reports = require('./reports.js');

const bot = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });
bot.commands = new Collection();

// Initialize the CR api
const api = new ClashRoyaleAPI(process.env.CR_TOKEN)

bot.login(process.env.BOT_TOKEN);

cron.schedule('*/1 * * * *', () => {
  const channel = bot.channels.cache.get(process.env.DEV_CHANNEL_ID);
  const guildID = process.env.DEV_GUILD_ID;
  //ffattacks.ffattacks(bot, api, null, true, guildID, channel, '#YRLJGL9')
  reports.report(bot, api, null, null, guildID, channel, '#YRLJGL9')
});

const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
const eventsPath = path.join(__dirname, 'events');
const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
  const filePath = path.join(commandsPath, file);
  const command = require(filePath);
  // Set a new item in the Collection with the key as the command name and the value as the exported module
  if ('data' in command && 'execute' in command) {
    bot.commands.set(command.data.name, command);
  } else {
    console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
  }
}

for (const file of eventFiles) {
  const filePath = path.join(eventsPath, file);
  const event = require(filePath);
  if (event.once) {
    bot.once(event.name, (...args) => event.execute(bot, api, ...args));
  } else {
    bot.on(event.name, (...args) => event.execute(bot, api, ...args));
  }
}

