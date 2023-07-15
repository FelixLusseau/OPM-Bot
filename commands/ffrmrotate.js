const { SlashCommandBuilder } = require('discord.js');
const { EmbedBuilder } = require('discord.js');
const sqlite3 = require('sqlite3').verbose();

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ffrmrotate')
        .setDescription('Remove a rotate !')
        .addIntegerOption(option =>
            option.setName('id')
                .setDescription('Rotate ID to remove')
                .setRequired(true)),
    async execute(bot, api, interaction) {
        await interaction.deferReply({ ephemeral: false });
        const rotatesEmbed = new EmbedBuilder();
        const id = interaction.options.getInteger('id');
        let result = "";

        // Open the database
        let db = new sqlite3.Database('./db/OPM.sqlite3', sqlite3.OPEN_READWRITE, (err) => {
            if (err) {
                console.error(err.message);
            }
        });

        // Delete a rotate into the database
        await new Promise((resolve, reject) => {
            db.run(`DELETE from Rotates WHERE Id=${id}`, function (err) {
                if (err) {
                    result = "Rotate not found !";
                    return reject(err.message);
                } else {
                    if (this.changes === 0) { // No row affected
                        result = "Invalid id or rotate not found !";
                    } else {
                        result = "Rotate removed !";
                    }
                    resolve();
                }
            });
        });

        // Close the database
        db.close((err) => {
            if (err) {
                console.error(err.message);
            }
        });

        const rand = Math.random().toString(36).slice(2); // Generate a random string to avoid the image cache
        try {
            rotatesEmbed
                .setColor(0x0099FF)
                .setTitle('__Remove rotate__ :')
                .setAuthor({ name: bot.user.tag, iconURL: 'https://cdn.discordapp.com/avatars/' + bot.user.id + '/' + bot.user.avatar + '.png' })
                .setDescription(result)
                .setThumbnail('https://cdn.discordapp.com/attachments/527820923114487830/1071116873321697300/png_20230203_181427_0000.png')
                .setTimestamp()
                .setFooter({ text: 'by OPM | Féfé ⚡', iconURL: 'https://avatars.githubusercontent.com/u/94113911?s=400&v=4?' + rand });
        } catch (e) {
            console.log(e);
        }

        interaction.editReply({ embeds: [rotatesEmbed] });
    },
};