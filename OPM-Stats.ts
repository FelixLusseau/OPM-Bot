import fs from 'node:fs';
import path from 'node:path';
import { Client, Collection, GatewayIntentBits } from 'discord.js';
import { ClashRoyaleAPI } from '@varandas/clash-royale-api';
import dotenv from 'dotenv';

dotenv.config();

const bot = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
}) as any;

bot.commands = new Collection();

// Initialize the CR api
const api = new ClashRoyaleAPI(process.env.CR_TOKEN || '');
(global as any).api = api;

// Connect the bot to Discord
if (process.env.BOT_TOKEN) {
    bot.login(process.env.BOT_TOKEN);
} else {
    console.error('BOT_TOKEN is not defined in environment variables');
    process.exit(1);
}

const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js') || file.endsWith('.ts'));
const eventsPath = path.join(__dirname, 'events');
const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js') || file.endsWith('.ts'));

// Load the commands
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

// Load the events
for (const file of eventFiles) {
    const filePath = path.join(eventsPath, file);
    const event = require(filePath);
    if (event.once) {
        bot.once(event.name, (...args: any[]) => event.execute(bot, api, ...args));
    } else {
        bot.on(event.name, (...args: any[]) => event.execute(bot, api, ...args));
    }
}
