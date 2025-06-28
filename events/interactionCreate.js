const { Events } = require('discord.js');
const globals = require('../utils/globals');
const logger = require('../utils/logger');

module.exports = {
    name: Events.InteractionCreate,
    async execute(bot, api, interaction) {
        if (interaction.isAutocomplete()) {
            const clan = interaction.options.getString('clan');

            const clans = globals.registeredClans || [];

            // Map the clans to the format Discord expects
            const guildClans = clans.filter(clan => clan.guild === interaction.guild.id);
            const choices = guildClans.map(clan => ({ name: clan.abbr, value: clan.tag }));

            await interaction.respond(choices);
        } else if (interaction.isChatInputCommand()) {
            const command = interaction.client.commands.get(interaction.commandName);

            if (!command) {
                logger.error(`No command matching ${interaction.commandName} was found.`);
                return;
            }

            try {
                logger.command(interaction.commandName, interaction.user.id);
                await command.execute(bot, api, interaction);
            } catch (error) {
                logger.commandError(interaction.commandName, error, interaction.user.id);
                if (interaction.replied || interaction.deferred) {
                    await interaction.followUp({ content: 'There was an error while executing this command!', ephemeral: true });
                } else {
                    await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
                }
            }
        }
    },
};