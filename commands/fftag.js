const { SlashCommandBuilder } = require('discord.js');
const ffattacks = require('./ffattacks');
const ffresults = require('./ffresults');
const ffrace = require('./ffrace');
const ffriver = require('./ffriver');
const ffreport = require('./ffreport');
const ffmembers = require('./ffmembers');
const ffopponents = require('./ffopponents.js');
const functions = require('../utils/functions.js');
const logger = require('../utils/logger');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('fftag')
        .setDescription('Replies to a custom tag !')
        .addSubcommand(subcommand =>
            subcommand
                .setName('attacks')
                .setDescription('Get the attacks of the foreign clan')
                .addStringOption(option =>
                    option.setName('custom_tag')
                        .setRequired(true)
                        .setDescription('Tag of the foreign clan to check')))
        .addSubcommand(subcommand =>
            subcommand
                .setName('results')
                .setDescription('Get the results of the foreign clan')
                .addStringOption(option =>
                    option.setName('custom_tag')
                        .setRequired(true)
                        .setDescription('Tag of the foreign clan to check')))
        .addSubcommand(subcommand =>
            subcommand
                .setName('race')
                .setDescription('Get the race of the foreign clan')
                .addStringOption(option =>
                    option.setName('custom_tag')
                        .setRequired(true)
                        .setDescription('Tag of the foreign clan to check')))
        .addSubcommand(subcommand =>
            subcommand
                .setName('river')
                .setDescription('Get the river of the foreign clan')
                .addStringOption(option =>
                    option.setName('custom_tag')
                        .setRequired(true)
                        .setDescription('Tag of the foreign clan to check')))
        .addSubcommand(subcommand =>
            subcommand
                .setName('report')
                .setDescription('Get the report of the foreign clan')
                .addStringOption(option =>
                    option.setName('custom_tag')
                        .setRequired(true)
                        .setDescription('Tag of the foreign clan to check')))
        .addSubcommand(subcommand =>
            subcommand
                .setName('members')
                .setDescription('Get the members of the foreign clan')
                .addStringOption(option =>
                    option.setName('custom_tag')
                        .setRequired(true)
                        .setDescription('Tag of the foreign clan to check')))
        .addSubcommand(subcommand =>
            subcommand
                .setName('opponents')
                .setDescription('Get the opponents of the foreign clan')
                .addStringOption(option =>
                    option.setName('custom_tag')
                        .setRequired(true)
                        .setDescription('Tag of the foreign clan to check')))
    ,
    async execute(bot, api, interaction) {
        clan = interaction.options.getString('custom_tag')
        if (functions.isValidTag(clan))
            switch (interaction.options.getSubcommand()) {
                case 'attacks':
                    ffattacks.ffattacks(bot, api, interaction, false, null, clan, null)
                    break;
                case 'results':
                    ffresults.ffresults(bot, api, interaction, null, clan)
                    break;
                case 'race':
                    ffrace.ffrace(bot, api, interaction, null, clan, false)
                    break;
                case 'river':
                    ffriver.ffriver(bot, api, interaction, clan)
                    break;
                case 'report':
                    ffreport.ffreport(bot, api, interaction, clan)
                    break;
                case 'members':
                    ffmembers.ffmembers(bot, api, interaction, clan)
                    break;
                case 'opponents':
                    ffopponents.ffopponents(bot, api, interaction, clan)
                    break;
            }
    }
};