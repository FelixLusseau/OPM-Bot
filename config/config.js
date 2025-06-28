/**
 * Configuration centrale pour le bot OPM
 */
require('dotenv').config();

const config = {
    // Discord Configuration
    discord: {
        token: process.env.BOT_TOKEN,
        intents: [
            'Guilds',
            'GuildMembers', 
            'GuildMessages',
            'MessageContent'
        ],
        activity: {
            name: 'your stats',
            type: 'WATCHING'
        }
    },

    // Clash Royale API Configuration
    clashRoyale: {
        token: process.env.CR_TOKEN,
        baseUrl: 'https://api.clashroyale.com/v1'
    },

    // Database Configuration
    database: {
        path: './db/OPM.sqlite3',
        backupPath: './db/OPM-prod-backup.sqlite3'
    },

    // Scheduling Configuration
    schedule: {
        guildMembersRefresh: '55 20 * * 4,5,6,7', // 20h55 on war days
        warDays: [4, 5, 6, 7], // Thu, Fri, Sat, Sun, Mon
        normalDays: [5, 6, 7, 1], // Fri, Sat, Sun, Mon
        defaultTimes: {
            morning: '0 9', // 9h00
            evening: '0 21' // 21h00
        }
    },

    // Chart and Rendering Configuration
    chart: {
        maxPoints: 10000, // Fame limit for normal days
        colosseum: {
            pointsPerDeck: 800
        },
        normal: {
            pointsPerDeck: 200
        }
    },

    // File Paths
    paths: {
        commands: './commands',
        events: './events',
        utils: './utils',
        html: './html',
        temp: './temp'
    },

    // Logging Configuration
    logging: {
        dateFormat: 'ISO', // ISO, UTC, or custom format
        colors: {
            info: '\x1b[36m',
            success: '\x1b[32m',
            warning: '\x1b[33m',
            error: '\x1b[31m',
            reset: '\x1b[0m'
        }
    },

    // Validation
    validate() {
        const required = [
            'discord.token',
            'clashRoyale.token'
        ];

        for (const path of required) {
            const value = this.getNestedValue(path);
            if (!value) {
                throw new Error(`Missing required configuration: ${path}`);
            }
        }
    },

    getNestedValue(path) {
        return path.split('.').reduce((obj, key) => obj?.[key], this);
    }
};

module.exports = config;
