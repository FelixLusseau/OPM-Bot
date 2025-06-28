/**
 * Centralized global state management
 */
class GlobalState {
    constructor() {
        this.clansDict = {};
        this.guildMembers = {};
        this.guildsDict = {};
        this.registeredClans = [];
        this.reportCron = {};
        this.clanCronJobs = {};
        this.api = null;
    }

    // Getters and setters for better control
    setApi(api) {
        this.api = api;
    }

    getApi() {
        return this.api;
    }

    // Clan management
    addClan(tag, name) {
        this.clansDict[tag] = name;
        this.clansDict[name] = tag;
    }

    removeClan(tag, name) {
        delete this.clansDict[tag];
        delete this.clansDict[name];
    }

    // Guild management
    setGuildMembers(guildId, members) {
        this.guildMembers[guildId] = members;
    }

    // Cron job management
    addCronJob(clanKey, jobType, job) {
        if (!this.clanCronJobs[clanKey]) {
            this.clanCronJobs[clanKey] = {};
        }
        this.clanCronJobs[clanKey][jobType] = job;
    }

    removeCronJobs(clanKey) {
        if (this.clanCronJobs[clanKey]) {
            Object.values(this.clanCronJobs[clanKey]).forEach(job => {
                if (job && typeof job.stop === 'function') {
                    job.stop();
                }
            });
            delete this.clanCronJobs[clanKey];
        }
        // Clean up reportCron for backward compatibility
        if (this.reportCron[clanKey]) {
            delete this.reportCron[clanKey];
        }
    }

    reset() {
        this.clansDict = {};
        this.guildMembers = {};
        this.guildsDict = {};
        this.registeredClans = [];
        // Don't reset cron jobs as they should persist
    }
}

// Export singleton instance
module.exports = new GlobalState();
