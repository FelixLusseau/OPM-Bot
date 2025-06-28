const fs = require('node:fs');
const path = require('node:path');
const { Client, Collection, Events, GatewayIntentBits } = require('discord.js');
const { ClashRoyaleAPI } = require('@varandas/clash-royale-api')
const config = require('./config/config');
const globals = require('./utils/globals');
const logger = require('./utils/logger');

// Validate configuration
try {
    config.validate();
    logger.success('Configuration validated successfully');
} catch (error) {
    logger.error('Configuration validation failed:', error.message);
    process.exit(1);
}

const bot = new Client({ 
    intents: [
        GatewayIntentBits.Guilds, 
        GatewayIntentBits.GuildMembers, 
        GatewayIntentBits.GuildMessages, 
        GatewayIntentBits.MessageContent
    ] 
});
bot.commands = new Collection();

// Initialize the CR api with error handling
try {
    const api = new ClashRoyaleAPI(config.clashRoyale.token);
    globals.setApi(api);
    global.api = api; // Keep for backward compatibility
    logger.success('Clash Royale API initialized');
} catch (error) {
    logger.error('Failed to initialize Clash Royale API:', error.message);
    process.exit(1);
}

// Global error handlers
process.on('unhandledRejection', (reason, promise) => {
    logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
    logger.error('Uncaught Exception:', error);
    process.exit(1);
});

// Graceful shutdown
process.on('SIGINT', () => {
    logger.shutdown('Received SIGINT. Graceful shutdown...');
    bot.destroy();
    process.exit(0);
});

const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
const eventsPath = path.join(__dirname, 'events');
const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

// Load the commands with better error handling
logger.info(`Loading ${commandFiles.length} commands...`);
for (const file of commandFiles) {
  const filePath = path.join(commandsPath, file);
  try {
    const command = require(filePath);
    // Set a new item in the Collection with the key as the command name and the value as the exported module
    if ('data' in command && 'execute' in command) {
      bot.commands.set(command.data.name, command);
      logger.success(`Loaded command: ${command.data.name}`);
    } else {
      logger.warning(`The command at ${filePath} is missing a required "data" or "execute" property.`);
    }
  } catch (error) {
    logger.error(`Failed to load command ${file}:`, error.message);
  }
}

// Load the events with better error handling
logger.info(`Loading ${eventFiles.length} events...`);
for (const file of eventFiles) {
  const filePath = path.join(eventsPath, file);
  try {
    const event = require(filePath);
    if (event.once) {
      bot.once(event.name, (...args) => event.execute(bot, globals.getApi(), ...args));
    } else {
      bot.on(event.name, (...args) => event.execute(bot, globals.getApi(), ...args));
    }
    logger.success(`Loaded event: ${event.name}`);
  } catch (error) {
    logger.error(`Failed to load event ${file}:`, error.message);
  }
}

// Connect the bot to Discord with error handling
bot.login(config.discord.token).catch(error => {
    logger.error('Failed to login to Discord:', error.message);
    process.exit(1);
});

