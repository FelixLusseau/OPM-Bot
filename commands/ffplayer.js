const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const functions = require('../utils/functions.js');

async function ffplayer(bot, api, interaction, channel, tag) {
    let details = false;
    if (interaction != null) {
        await interaction.deferReply({ ephemeral: false });
        tag = interaction.options.getString('tag');
        details = interaction.options.getBoolean('details');
    }

    const regex = /\#[a-zA-Z0-9]{8,9}\b/g
    if (tag.search(regex) < 0) { // Prevent the bot from crashing (not happening) if the tag is invalid
        functions.errorEmbed(bot, interaction, channel, "Invalid tag");
        return
    }

    const playerEmbed = new EmbedBuilder();
    let player_data = "";
    let player = {};
    try {
        player = await api.getPlayerByTag(tag);
    } catch (e) {
        functions.errorEmbed(bot, interaction, channel, e)
        return
    }

    player_data += `<:Hashtag:1186369411439923220> Tag: **${player.tag}**\n`
        + `:mechanic: Role: **${player.role}**\n`
        + `<a:Colored_arrow:1186367114190270516> Clan name: **${player.clan.name}**\n`
        + `<:Hashtag:1186369411439923220> Clan tag: **${player.clan.tag}**\n\n`
        + `:trophy: Trophies: **${player.trophies}**\n`
        + `:medal: Best trophies: ${player.bestTrophies}\n`
        + `<:Exp_level:1186623719897051176> Exp Level: **${player.expLevel}**\n`
        + `:old_man: Years played: **${player.badges[0].level}** year` + (player.badges[0].level > 1 ? `s` : ``) + `\n`;

    if (interaction && details) {
        player_data += `\nExp Points: ${player.expPoints}\n`
            + `Battle count: ${player.battleCount}\n`
            + `Wins: ${player.wins}\n`
            + `Losses: ${player.losses}\n`
            + `Three crown wins: ${player.threeCrownWins}\n`
            + `Tournament battle count: ${player.tournamentBattleCount}\n`
            + `Total donations: ${player.totalDonations}\n`
            + `Star points: ${player.starPoints}\n`
            + `Exp points:  ${player.expPoints}\n`
            + `Total exp points: ${player.totalExpPoints}\n\n`
            + `Path of legends: \n`
            + `Current path of legends league: ${player.currentPathOfLegendSeasonResult.leagueNumber}\n`
            + `Current path of legends trophies: ${player.currentPathOfLegendSeasonResult.trophies}\n`
            + `Current path of legends rank: ${player.currentPathOfLegendSeasonResult.rank}\n\n`
            + `Best path of legends league: ${player.bestPathOfLegendSeasonResult.leagueNumber}\n`
            + `Best path of legends trophies: ${player.bestPathOfLegendSeasonResult.trophies}\n`
            + `Best path of legends rank: ${player.bestPathOfLegendSeasonResult.rank}\n`;
    }

    player_data += `\nhttps://royaleapi.com/player/` + tag.substring(1);

    const rand = Math.random().toString(36).slice(2); // Generate a random string to avoid the image cache
    playerEmbed
        .setColor(0x0099FF)
        .setTitle(player.name)
        .setAuthor({ name: bot.user.tag, iconURL: 'https://cdn.discordapp.com/avatars/' + bot.user.id + '/' + bot.user.avatar + '.png' })
        .setDescription(player_data)
        .setThumbnail('https://cdn.discordapp.com/attachments/527820923114487830/1071116873321697300/png_20230203_181427_0000.png')
        .setTimestamp()
        .setFooter({ text: 'by OPM | Féfé ⚡', iconURL: 'https://avatars.githubusercontent.com/u/94113911?s=400&v=4?' + rand });

    // If the interaction is not null, edit the reply deferred before
    if (interaction != null)
        await interaction.editReply({ embeds: [playerEmbed] });
    else
        await channel.send({ embeds: [playerEmbed] });
}

module.exports = {
    ffplayer,
    data: new SlashCommandBuilder()
        .setName('ffplayer')
        .setDescription('Replies the player\'s profile !')
        .addStringOption(option =>
            option.setName('tag')
                .setDescription('Tag of the Player')
                .setRequired(true))
        .addBooleanOption(option =>
            option.setName('details')
                .setDescription('Display more details')),

    async execute(bot, api, interaction) {
        ffplayer(bot, api, interaction, null, null);
    }
};