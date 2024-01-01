# OPM Bot

<img src="OPM-Stats.png" alt="Fire punch logo" width="150" height="150"/> <br>

[![Author](https://img.shields.io/badge/author-@FelixLusseau-blue)](https://github.com/FelixLusseau)
![version](https://img.shields.io/github/package-json/v/FelixLusseau/OPM-Bot)
[![CodeQL](https://github.com/FelixLusseau/OPM-Bot/actions/workflows/codeql.yml/badge.svg)](https://github.com/FelixLusseau/OPM-Bot/actions/workflows/codeql.yml)

[![GitHub latest commit](https://img.shields.io/github/last-commit/FelixLusseau/OPM-Bot)](https://gitHub.com/FelixLusseau/OPM-Bot/commit/)
[![Maintenance](https://img.shields.io/badge/maintained%3F-yes-green.svg)](https://GitHub.com/FelixLusseau/OPM-Bot/graphs/commit-activity)

![Discord](https://img.shields.io/badge/Discord-%235865F2.svg?style=for-the-badge&logo=discord&logoColor=white)
![NodeJS](https://img.shields.io/badge/node.js-6DA55F?style=for-the-badge&logo=node.js&logoColor=white)
![SQLite](https://img.shields.io/badge/sqlite-%2307405e.svg?style=for-the-badge&logo=sqlite&logoColor=white)

<br>

### A Discord bot to manage the Clash Royale clans and clan wars of the One Punch Man Family.

<br>

## Features

- Commands list :
  - `/ffhelp` : Shows the help menu
  - `/ffattacks` : Shows the remaining attacks of the day and can ping remaining players
  - `/ffavg` : Shows the average war points of the players sending an Excel spreadsheet and the associated png
  - `/ffgethours` : Shows the hours of the daily reports and resets
  - `/ffgetrotates` : Shows the rotations of the players between the clans
  - `/ffmembers` : Shows the members of the clan
  - `/ffopponents` : Shows information about the war opponents and their Colosseum history the last 3 seasons
  - `/ffplayer` : Shows the player's profile
  - `/ffrace` : Shows the current war day status (or Colosseum)
  - `/ffresults` : Shows the points of all the war participants
  - `/ffriver` : Shows the current river race (or Colosseum)
  - `/ffreport` : Shows the war report
  - `/ffrmhours` : Removes the hours for the daily reports and resets
  - `/ffrmrotate` : Removes an entry from the rotations
  - `/ffsethours` : Sets the hours for the daily reports and resets on the calling channel
  - `/ffsetrotates` : Sets the rotations of the players between the clans

- Scheduled war report has been added to the bot ! It will be sent every day from friday to monday at the reset hour in the clan war channel.
- Scheduled `/ffrace` and `/ffattacks` with ping has been added to the bot ! It will be sent every day from friday to monday at 01h00 and from Thurday to Sunday at 23h00 in the clan war channels.

- Responds a link to the RoyaleAPI player profile when a player tag is sent in a room where the bot is present.
  Sends a screenshot of the player war history and the graph associated.

- Send an Excel spreadsheet with the war results and averages with colors.

- 31/08/2023 : New display is beginning its deployment !
Old version is still available with the option `text_version: True`.
