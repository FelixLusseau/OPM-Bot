/**
 * Example showing how to use the new modules in commands
 * This is a template/example, not meant to be used directly
 */

const { SlashCommandBuilder } = require('discord.js');
const config = require('../config/config');
const globals = require('../utils/globals');
const logger = require('../utils/logger');
const database = require('../utils/database');
const functions = require('../utils/functions.js');

// Example command using the new architecture
async function exampleCommand(bot, api, interaction) {
    try {
        await interaction.deferReply({ ephemeral: false });
        
        // Use logger instead of console.log
        logger.info(`Executing example command for user ${interaction.user.id}`);
        
        // Use globals instead of direct global variables
        const clans = globals.registeredClans;
        const guildMembers = globals.guildMembers[interaction.guildId];
        
        // Use database manager instead of direct sqlite3
        const reports = await database.getAllRows(
            'SELECT * FROM Reports WHERE Guild = ?', 
            [interaction.guildId]
        );
        
        // Use config instead of hardcoded values
        const dbPath = config.database.path;
        const warDays = config.schedule.warDays;
        
        // Create response
        const embed = functions.generateEmbed(bot)
            .setTitle('Example Command')
            .setDescription(`Found ${clans.length} clans and ${reports.length} reports`);
            
        await interaction.editReply({ embeds: [embed] });
        
    } catch (error) {
        // Use logger for errors
        logger.commandError('example', error, interaction.user.id);
        
        if (interaction.deferred) {
            await interaction.editReply({ 
                content: 'An error occurred while executing this command!' 
            });
        }
    }
}

// Updated functions.js example
async function loadRegisteredClansExample() {
    try {
        const rows = await database.getAllRows('SELECT Guild, Name, Abbr, Tag FROM Clans');
        
        globals.clansDict = {};
        globals.registeredClans = rows.map(row => {
            globals.addClan(row.Tag, row.Name);
            return { guild: row.Guild, name: row.Name, abbr: row.Abbr, tag: row.Tag };
        });

        logger.info(`Loaded ${globals.registeredClans.length} registered clans`);
        
        // Keep global variables for backward compatibility
        global.clansDict = globals.clansDict;
        global.registeredClans = globals.registeredClans;
        
    } catch (error) {
        logger.error('Error loading registered clans:', error);
    }
}

// Updated schedule.js example
async function loadSchedulesExample(bot) {
    try {
        // Use config for cron schedule
        const guildMembersRefreshSchedule = config.schedule.guildMembersRefresh;
        
        cron.schedule(guildMembersRefreshSchedule, () => {
            getGuildMembers(globals.guildsDict);
            logger.schedule('executed', 'guild members refresh');
        });

        // Use database manager
        const count = await database.eachRow(
            'SELECT * FROM Reports',
            [],
            (row) => {
                schedule(bot, row.Hour, row.Clan, row.Guild, row.Channel);
            }
        );
        
        logger.info(`Loaded ${count} scheduled reports`);
        
    } catch (error) {
        logger.error('Error loading schedules:', error);
    }
}

module.exports = {
    exampleCommand,
    loadRegisteredClansExample,
    loadSchedulesExample
};
