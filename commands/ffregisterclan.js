const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const sqlite3 = require('sqlite3').verbose();
const functions = require('../utils/functions.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ffregisterclan')
        .setDescription('Register a clan for this server (used in commands) !')
        .addStringOption(option =>
            option.setName('abbr')
                .setDescription('The clan abbreviation to add')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('tag')
                .setDescription('The tag with # of the clan')
                .setRequired(true)),
    async execute(bot, api, interaction) {
        await interaction.deferReply({ ephemeral: false });
        const abbr = interaction.options.getString('abbr');
        const tag = interaction.options.getString('tag');
        const registerEmbed = new EmbedBuilder();
        let clan = null

        valid = false
        // Check if the hour given is valid
        if (functions.isValidTag(tag)) {
            valid = true;

            // Get the real name of the clan
            try {
                clan = await api.getClanByTag(tag)// Get the clans' info from the Supercell API
            } catch (error) {
                functions.errorEmbed(bot, interaction, channel, error)
                return
            }

            // Register the clan into the database
            try {
                // Open the database
                let db = new sqlite3.Database('./db/OPM.sqlite3', sqlite3.OPEN_READWRITE, (err) => {
                    if (err) {
                        console.error(err.message);
                    }
                });

                // Delete previous report entry from the database
                let sql = `DELETE FROM Clans WHERE Guild=? AND Tag=?`;
                db.run(sql, [interaction.guildId, tag], function (err) {
                    if (err) {
                        return console.error(err.message);
                    }
                    // console.log(`Row(s) deleted ${this.changes}`);
                });
                // Insert a new report entry into the database
                db.run(`INSERT INTO Clans (Guild, Name, Abbr, Tag) VALUES ("${interaction.guildId}", "${clan.name}", "${abbr}", "${tag}")`, function (err) {
                    if (err) {
                        return console.log(err.message);
                    }
                    // get the last insert id
                    // console.log(`A row has been inserted with rowid ${this.lastID}`);
                    // Reload the registered clans cache
                    functions.loadRegisteredClans()
                });

                // Close the database
                db.close((err) => {
                    if (err) {
                        console.error(err.message);
                    }
                });
            } catch (err) {
                console.error(err);
            }
        }
        else {
            valid = false;
        }

        const rand = Math.random().toString(36).slice(2); // Generate a random string to avoid the image cache
        try {
            registerEmbed
                .setColor(0x7C0404)
                .setAuthor({ name: bot.user.tag, iconURL: 'https://cdn.discordapp.com/avatars/' + bot.user.id + '/' + bot.user.avatar + '.png' })
                .setDescription((valid ? tag + " (" + clan.name + ") registered as **" + abbr + "** on this server !" : "**" + tag + "** is not a valid tag !"))
                .setThumbnail('https://cdn.discordapp.com/attachments/527820923114487830/1071116873321697300/png_20230203_181427_0000.png')
                .setTimestamp()
                .setFooter({ text: 'by OPM | Féfé ⚡', iconURL: 'https://avatars.githubusercontent.com/u/94113911?s=400&v=4?' + rand });
        } catch (e) {
            console.log(e);
        }

        interaction.editReply({ embeds: [registerEmbed] });
    },
};