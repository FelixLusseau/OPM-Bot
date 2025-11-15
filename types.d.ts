import { Client } from 'discord.js';

// Types pour l'API Clash Royale
export interface PlayerClan {
    name: string;
    tag: string;
}

export interface PlayerBadge {
    name?: string;
    level?: number;
    maxLevel?: number;
    progress?: number;
    target?: number;
}

export interface PathOfLegendResult {
    leagueNumber: number;
    trophies: number;
    rank: number | null;
}

export interface Card {
    name: string;
    level: number;
    maxLevel: number;
    iconUrls?: {
        medium: string;
    };
}

export interface Player {
    tag: string;
    name: string;
    role: string;
    clan?: PlayerClan;
    trophies: number;
    bestTrophies: number;
    expLevel: number;
    badges: PlayerBadge[];
    expPoints: number;
    battleCount: number;
    wins: number;
    losses: number;
    threeCrownWins: number;
    tournamentBattleCount: number;
    totalDonations: number;
    starPoints: number;
    totalExpPoints: number;
    currentPathOfLegendSeasonResult: PathOfLegendResult;
    bestPathOfLegendSeasonResult: PathOfLegendResult;
    currentFavouriteCard: Card;
    currentDeck: Card[];
}

export interface ClanMember {
    tag: string;
    name: string;
    role: string;
    lastSeen: string;
    expLevel: number;
    trophies: number;
    arena: {
        id: number;
        name: string;
    };
    clanRank: number;
    previousClanRank: number;
    donations: number;
    donationsReceived: number;
}

export interface Clan {
    tag: string;
    name: string;
    type: string;
    description: string;
    badgeId: number;
    clanScore: number;
    clanWarTrophies: number;
    location?: {
        id: number;
        name: string;
        isCountry: boolean;
        countryCode?: string;
    };
    requiredTrophies: number;
    donationsPerWeek: number;
    members: number;
    memberList: ClanMember[];
}

// Interface pour l'API Clash Royale - on utilise any pour être compatible avec la vraie API
export interface ClashRoyaleAPI {
    getPlayerByTag(tag: string): Promise<any>;
    getClanByTag(tag: string): Promise<any>;
    getClanMembers(tag: string): Promise<any>;
}

// Types pour les clans enregistrés
export interface RegisteredClan {
    guild: string;
    name: string;
    abbr: string;
    tag: string;
}

// Extension de l'interface Client de Discord.js
declare module 'discord.js' {
    export interface Client {
        commands: Collection<string, any>;
    }
}

// Variables globales
declare global {
    var api: ClashRoyaleAPI;
    var registeredClans: RegisteredClan[];
    var clansDict: { [key: string]: string };
}

export { };
