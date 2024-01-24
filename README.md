# Tibia Bosses Tracker API

This is a REST endpoint app written in Node, designed to track bosses in the MMORPG game, Tibia.

# Fundamentals

To reduce complexity, I created some crawlers that read from well-known Tibia Bosses trackers. The most reliable source at the moment is GuildStats, but there are also endpoints to gather data from other sources such as Tibia Bosses and Tibia-Statistics.

## Limitations

As this is a crawler and doesn't have a database, the crawler runs each time the endpoint is called. If the website is down, we cannot provide any probability data.

## Data Source

As mentioned above, the most reliable data source is Guild Stats. There is also Firebase integration to manage the bosses that this API can handle.

The only database used is Firebase. The process involves merging base data from Firebase with data returned from GuildStats.

## Available Endpoints

- `/guild-stats` - Current data source from GuildStats
- `/tibia-statistics` - Data source from Tibia-Statistics
- `/killed-yesterday` - Data on bosses killed yesterday from the official Tibia site
- `/duplicated-bosses` - WIP (Work In Progress) for bosses with multiple respawns
