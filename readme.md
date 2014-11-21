league-node
===============

Forked from https://github.com/nagash/node-lol-client, credits for his work on most of the base code, and especially the AMF RTMP library, crucial for communication with Riot's servers.

This fork aims to fix the bugs left behind in the original project, and expand the features for developmental purposes.

We've got some RTMP Queries working!

[Getting Started](https://github.com/andrewvy/league-node/wiki)
-------------------

# [API Functions](https://github.com/andrewvy/league-node/wiki/API-Documentation)

	LolClient.getSummonerByName(name, cb)

	LolClient.getCurrentGameByName(name, cb)

	LolClient.getSummonerStats(acctId, cb)

	LolClient.getMatchHistory(acctId, cb)

	LolClient.getAggregatedStats(acctId, cb)

	LolClient.getTeamsForSummoner(summonerId, cb)

	LolClient.getTeamById(teamId, cb)

	LolClient.getSummonerData(acctId, cb)
