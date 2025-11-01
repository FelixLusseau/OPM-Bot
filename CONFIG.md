# Bot Configuration

The `config.js` file at the project root centralizes all OPM bot configurations.

## 📋 Structure

The file is organized into thematic sections for easier maintenance:

### 🌍 TIMEZONE & LOCALE CONFIGURATION

Timezone and regional format configuration.

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `DEFAULT_TIMEZONE` | String | `'Europe/Paris'` | Default timezone (IANA format) |
| `LOCALE` | String | `'fr-FR'` | Locale for formatting (BCP 47) |
| `DATE_FORMAT` | String | `'dd/MM/yyyy'` | Date display format |
| `TIME_FORMAT` | String | `'HH:mm'` | Time display format |

**Usage example:**
```javascript
const { DEFAULT_TIMEZONE } = require('./config.js');
const localTime = DateTime.now().setZone(DEFAULT_TIMEZONE);
```

### ⏰ CRON & SCHEDULING CONFIGURATION

Configuration for scheduled tasks and automatic reminders.

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `WAR_DAYS` | Array | `[5, 6, 0, 1]` | War days (0=Sunday, 1=Monday, etc.) |
| `MORNING_REMINDER_HOUR` | Number | `9` | Morning reminder hour (local time) |
| `EVENING_REMINDER_HOUR` | Number | `21` | Evening reminder hour (local time) |
| `GUILD_REFRESH_HOUR` | Number | `20` | Guild members refresh hour |
| `GUILD_REFRESH_MINUTE` | Number | `55` | Guild members refresh minute |

**Note:** Reminder hours are in local time and automatically adapt to Daylight Saving Time changes.

### 💾 DATABASE CONFIGURATION

SQLite database configuration.

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `DB_PATH` | String | `'./db/OPM.sqlite3'` | Database file path |
| `DB_BACKUP_PATH` | String | `'./db/OPM-backup-{date}.sqlite3'` | Backup path pattern |

**Using the {date} placeholder:**
```javascript
const config = require('./config.js');
const backupPath = config.DB_BACKUP_PATH.replace('{date}', '20251101');
// Result: './db/OPM-backup-20251101.sqlite3'
```

### 🎨 DISPLAY CONFIGURATION

Display and rendering configuration.

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `HTML_BACKGROUND_SIZE` | String | `'Background_small'` | Background size for HTML renders |
| `EMBED_COLOR` | String | `'#0099ff'` | Default Discord embed color |

## 🔧 Modifying the Configuration

### Change the timezone

To adapt the bot to another country:

```javascript
DEFAULT_TIMEZONE: 'America/New_York',  // For United States (New York)
LOCALE: 'en-US',
DATE_FORMAT: 'MM/dd/yyyy',
```

### Modify reminder hours

To change automatic reminder times:

```javascript
MORNING_REMINDER_HOUR: 8,   // Reminder at 8am instead of 9am
EVENING_REMINDER_HOUR: 22,  // Reminder at 10pm instead of 9pm
```

### Change war days

To adapt to your clan's war schedule:

```javascript
WAR_DAYS: [2, 3, 4, 5],  // Tuesday, Wednesday, Thursday, Friday
```

## 📚 References

- **IANA Timezones**: https://en.wikipedia.org/wiki/List_of_tz_database_time_zones
- **BCP 47 Locales**: https://www.iana.org/assignments/language-subtag-registry/language-subtag-registry
- **Luxon date formats**: https://moment.github.io/luxon/#/formatting

## ⚠️ Important

- After modifying `config.js`, **restart the bot** to apply changes
- Reminder hours (`MORNING_REMINDER_HOUR`, `EVENING_REMINDER_HOUR`) are in **local time**
- Custom report hours are stored in **UTC** and displayed in local time
- **Never** commit sensitive data (tokens, API keys) to this file

## 🔒 Security

For sensitive data (Discord tokens, API keys), use the `.env` file:

```env
BOT_TOKEN=your_discord_token
CR_TOKEN=your_clash_royale_token
```

And load them with:
```javascript
require('dotenv').config();
const token = process.env.BOT_TOKEN;
```
