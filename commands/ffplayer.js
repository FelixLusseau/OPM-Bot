const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const functions = require('../utils/functions.js');

async function ffplayer(bot, api, interaction, channel, tag) {
    let details = false;
    if (interaction != null) {
        await interaction.deferReply({ ephemeral: false });
        tag = interaction.options.getString('tag').toUpperCase();
        details = interaction.options.getBoolean('details');
    }

    const regex = /\#[a-zA-Z0-9]{6,9}\b/g
    if (tag.search(regex) < 0) { // Prevent the bot from crashing (not happening) if the tag is invalid
        functions.errorEmbed(bot, interaction, channel, "Invalid tag");
        return
    }

    const playerEmbed = functions.generateEmbed(bot);
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
        + `<a:Colored_arrow:1186367114190270516> Clan name: **${player.clan?.name}**\n`
        + `<:Hashtag:1186369411439923220> Clan tag: **${player.clan?.tag}**\n\n`
        + `:trophy: Trophies: **${player.trophies}**\n`
        + `:medal: Best trophies: ${player.bestTrophies}\n`
        + `<:Exp_level:1186623719897051176> Exp Level: **${player.expLevel}**\n`
        + `:old_man: Years played: **${(player.badges[0]?.level != undefined ? player.badges[0].level : 0)}** year` + (player.badges[0]?.level > 1 ? `s` : ``) + `\n`;

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

    player_data += `\n\n**RoyaleAPI player link :** \nhttps://royaleapi.com/player/` + tag.substring(1);
    player_data += (player.clan ? `\n\n**RoyaleAPI clan link :** \nhttps://royaleapi.com/clan/${player.clan.tag.substring(1)}` : ``);

    playerEmbed
        .setTitle(player.name)
        .setDescription(player_data)

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
