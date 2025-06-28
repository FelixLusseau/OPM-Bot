/**
 * Centralized logging utility
 */
const config = require('../config/config');

class Logger {
    constructor() {
        this.colors = config.logging.colors;
    }

    formatMessage(level, message, ...args) {
        const timestamp = new Date().toISOString();
        const colorCode = this.colors[level] || '';
        const resetCode = this.colors.reset;

        return `${colorCode}[${timestamp}]${resetCode} ${level.toUpperCase()}: ${message}`;
    }

    info(message, ...args) {
        console.log(this.formatMessage('info', message), ...args);
    }

    success(message, ...args) {
        console.log(this.formatMessage('success', message), ...args);
    }

    warning(message, ...args) {
        console.warn(this.formatMessage('warning', message), ...args);
    }

    error(message, ...args) {
        console.error(this.formatMessage('error', message), ...args);
    }

    command(commandName, userId = null) {
        const userInfo = userId ? ` (User: ${userId})` : '';
        this.info(`Executing command: ${commandName}${userInfo}`);
    }

    commandError(commandName, error, userId = null) {
        const userInfo = userId ? ` (User: ${userId})` : '';
        this.error(`Error executing command: ${commandName}${userInfo}`, error);
    }

    startup(message) {
        console.log(`🚀 ${message}`);
    }

    shutdown(message) {
        console.log(`🛑 ${message}`);
    }

    database(operation, details = '') {
        this.info(`Database ${operation}${details ? ': ' + details : ''}`);
    }

    schedule(action, details = '') {
        this.info(`Schedule ${action}${details ? ': ' + details : ''}`);
    }
}

module.exports = new Logger();
