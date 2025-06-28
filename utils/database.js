/**
 * Database utility for centralized database operations
 */
const sqlite3 = require('sqlite3').verbose();
const config = require('../config/config');
const logger = require('./logger');

class DatabaseManager {
    constructor() {
        this.dbPath = config.database.path;
    }

    // Create a new database connection
    connect(mode = sqlite3.OPEN_READWRITE) {
        return new Promise((resolve, reject) => {
            const db = new sqlite3.Database(this.dbPath, mode, (err) => {
                if (err) {
                    logger.error('Database connection error:', err.message);
                    reject(err);
                } else {
                    resolve(db);
                }
            });
        });
    }

    // Execute a query with parameters
    async executeQuery(query, params = []) {
        return new Promise(async (resolve, reject) => {
            try {
                const db = await this.connect();
                
                db.run(query, params, function(err) {
                    if (err) {
                        logger.error('Database query error:', err.message);
                        reject(err);
                    } else {
                        resolve(this);
                    }
                });

                db.close((err) => {
                    if (err) {
                        logger.error('Database close error:', err.message);
                    }
                });
            } catch (error) {
                reject(error);
            }
        });
    }

    // Get single row
    async getRow(query, params = []) {
        return new Promise(async (resolve, reject) => {
            try {
                const db = await this.connect(sqlite3.OPEN_READONLY);
                
                db.get(query, params, (err, row) => {
                    if (err) {
                        logger.error('Database query error:', err.message);
                        reject(err);
                    } else {
                        resolve(row);
                    }
                });

                db.close((err) => {
                    if (err) {
                        logger.error('Database close error:', err.message);
                    }
                });
            } catch (error) {
                reject(error);
            }
        });
    }

    // Get all rows
    async getAllRows(query, params = []) {
        return new Promise(async (resolve, reject) => {
            try {
                const db = await this.connect(sqlite3.OPEN_READONLY);
                
                db.all(query, params, (err, rows) => {
                    if (err) {
                        logger.error('Database query error:', err.message);
                        reject(err);
                    } else {
                        resolve(rows);
                    }
                });

                db.close((err) => {
                    if (err) {
                        logger.error('Database close error:', err.message);
                    }
                });
            } catch (error) {
                reject(error);
            }
        });
    }

    // Execute each row with callback
    async eachRow(query, params = [], callback) {
        return new Promise(async (resolve, reject) => {
            try {
                const db = await this.connect(sqlite3.OPEN_READONLY);
                let count = 0;
                
                db.each(query, params, (err, row) => {
                    if (err) {
                        logger.error('Database query error:', err.message);
                        reject(err);
                    } else {
                        callback(row);
                        count++;
                    }
                }, (err) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(count);
                    }
                });

                db.close((err) => {
                    if (err) {
                        logger.error('Database close error:', err.message);
                    }
                });
            } catch (error) {
                reject(error);
            }
        });
    }

    // Backup database
    async backup() {
        try {
            const fs = require('fs');
            const backupPath = config.database.backupPath;
            
            fs.copyFileSync(this.dbPath, backupPath);
            logger.info(`Database backed up to ${backupPath}`);
            
            return true;
        } catch (error) {
            logger.error('Database backup failed:', error.message);
            return false;
        }
    }
}

// Export singleton instance
module.exports = new DatabaseManager();
