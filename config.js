/**
 * Configuration file for the OPM-Stats Bot
 * 
 * This file centralizes all configuration parameters for the bot.
 * Modify these values to customize the bot's behavior.
 */

module.exports = {
    // ===========================================
    // TIMEZONE & LOCALE CONFIGURATION
    // ===========================================

    /**
     * Default timezone for the bot
     * Used for all time conversions throughout the application
     * Format: IANA timezone identifier
     * Examples: 'Europe/Paris', 'America/New_York', 'Asia/Tokyo'
     * Full list: https://en.wikipedia.org/wiki/List_of_tz_database_time_zones
     */
    DEFAULT_TIMEZONE: 'Europe/Paris',

    // ===========================================
    // Configurations examples
    // ===========================================

    /**
     * Locale for date/time formatting
     * Used for displaying dates and times to users
     * Format: BCP 47 language tag
     * Examples: 'fr-FR', 'en-US', 'en-GB'
     */
    // LOCALE: 'fr-FR',

    /**
     * Date format for display
     * Used when formatting dates for user display
     * Format: Luxon date format tokens
     * Examples: 'dd/MM/yyyy', 'MM-dd-yyyy', 'yyyy-MM-dd'
     */
    // DATE_FORMAT: 'dd/MM/yyyy',

    /**
     * Time format for display
     * Used when formatting times for user display
     * Format: Luxon time format tokens
     * Examples: 'HH:mm', 'hh:mm a', 'HH:mm:ss'
     */
    // TIME_FORMAT: 'HH:mm',

    // ===========================================
    // CRON & SCHEDULING CONFIGURATION
    // ===========================================

    /**
     * War days for Clash Royale
     * Days of the week when wars are active (0 = Sunday, 1 = Monday, etc.)
     */
    // WAR_DAYS: [5, 6, 0, 1], // Friday, Saturday, Sunday, Monday

    /**
     * Morning reminder hour (local time)
     * Time when morning reminders are sent during war days
     */
    // MORNING_REMINDER_HOUR: 9,

    /**
     * Evening reminder hour (local time)
     * Time when evening reminders are sent during war days
     */
    // EVENING_REMINDER_HOUR: 21,

    /**
     * Guild members refresh hour (local time)
     * Time when the bot refreshes the guild members list
     */
    // GUILD_REFRESH_HOUR: 20,
    // GUILD_REFRESH_MINUTE: 55,

    // ===========================================
    // DATABASE CONFIGURATION
    // ===========================================

    /**
     * Database file path
     * Path to the SQLite database file (relative to project root)
     */
    // DB_PATH: './db/OPM.sqlite3',

    /**
     * Database backup path pattern
     * Path pattern for database backups (use {date} placeholder)
     */
    // DB_BACKUP_PATH: './db/OPM-backup-{date}.sqlite3',

    // ===========================================
    // DISPLAY CONFIGURATION
    // ===========================================

    /**
     * HTML rendering background size
     * Size variant for background images in rendered HTML
     * Options: 'Background_small', 'Background_normal', 'Background_high'
     */
    // HTML_BACKGROUND_SIZE: 'Background_small',

    /**
     * Embed color
     * Default color for Discord embeds (hex color code)
     */
    // EMBED_COLOR: '#0099ff',
};
