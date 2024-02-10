# Tibia HTML to JSON API

This is a NodeJS with Express project, designed to run crawlers on Famous Tibia Webpages to transform HTML into GET endpoints.

## Base URL

https://checkboss-api.netlify.app/.netlify/functions

## Available Endpoints

- `GET /tibiawiki-creatures` - Get all Tibia Creatures from TibiaWiki with Name, Image, HP, XP, Charms, Difficulty;
- `GET /guild-stats` - Get Nemesis Bosses chances for Today from GuildStats for Venebra World;
- `GET /tibia-statistics` - Same as above but using TibiaStatistics as data source;
- `GET /killed-yesterday` - Bosses killed yesterday from the official Tibia website;
- `GET /duplicated-bosses` - WIP (Work In Progress) for bosses with multiple respawns;

## Limitations

If the Data Source Website is down, we cannot provide any bosses probability data. The only Endpoint that will work in case of Source if OFF is `GET /tibiawiki-creatures`

## Data Source for bosses

The most reliable data source for bosses is Guild Stats, prefer to use it instead of TibiaStatistics.



