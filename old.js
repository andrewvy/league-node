LolClient.prototype.getSummonerByName = function(name, cb) {
      var LookupPacket, cmd,
        _this = this;
      if (this.options.debug) {

        console.log("Finding player by name: " + name);
      }
      LookupPacket = lolPackets.LookupPacket;
      cmd = new RTMPCommand(0x11, null, null, null, [new LookupPacket(this.options).generate(name)]);
      return this.rtmp.send(cmd, function(err, result) {
        var _ref, _ref1;
        if (err) {
          return cb(err);
        }
        if ((result != null ? (_ref = result.args) != null ? (_ref1 = _ref[0]) != null ? _ref1.body : void 0 : void 0 : void 0) == null) {
          return cb(err, null);
        }
        return cb(err, result.args[0].body);
      });
    };
//Added method for getting current game by summoner name.
   LolClient.prototype.getCurrentGameByName = function(name, cb) {
      var GetCurrentGamePacket, cmd,
        _this = this;
      if (this.options.debug) {
        console.log("Getting Current Game By Name: " + name);
      }
      GetCurrentGamePacket = lolPackets.GetCurrentGamePacket;
      cmd = new RTMPCommand(0x11, null, null, null, [new GetCurrentGamePacket(this.options).generate(name)]);
      return this.rtmp.send(cmd, function(err, result) {
        var _ref, _ref1;
        if (err) {
          return cb(err);
        }
        if ((result != null ? (_ref = result.args) != null ? (_ref1 = _ref[0]) != null ? _ref1.body : void 0 : void 0 : void 0) == null) {
          return cb(err, null);
        }
        return cb(err, result.args[0].body);
      });
    };

    LolClient.prototype.getSummonerStats = function(acctId, cb) {
      var PlayerStatsPacket, cmd,
        _this = this;
      if (this.options.debug) {
        console.log("Fetching Summoner Stats for " + acctId);
      }
      PlayerStatsPacket = lolPackets.PlayerStatsPacket;
      cmd = new RTMPCommand(0x11, null, null, null, [new PlayerStatsPacket(this.options).generate(Number(acctId))]);
      return this.rtmp.send(cmd, function(err, result) {
        var _ref, _ref1;
        if (err) {
          return cb(err);
        }
        if ((result != null ? (_ref = result.args) != null ? (_ref1 = _ref[0]) != null ? _ref1.body : void 0 : void 0 : void 0) == null) {
          return cb(err, null);
        }
        return cb(err, result.args[0].body);
      });
    };

    LolClient.prototype.getMatchHistory = function(acctId, cb) {
      var RecentGames, cmd,
        _this = this;
      if (this.options.debug) {
        console.log("Fetching recent games for " + acctId);
      }
      RecentGames = lolPackets.RecentGames;
      cmd = new RTMPCommand(0x11, null, null, null, [new RecentGames(this.options).generate(Number(acctId))]);
      return this.rtmp.send(cmd, function(err, result) {
        var _ref, _ref1;
        if (err) {
          return cb(err);
        }
        if ((result != null ? (_ref = result.args) != null ? (_ref1 = _ref[0]) != null ? _ref1.body : void 0 : void 0 : void 0) == null) {
          return cb(err, null);
        }
        return cb(err, result.args[0].body);
      });
    };

    LolClient.prototype.getAggregatedStats = function(acctId, cb) {
      var AggregatedStatsPacket, cmd,
        _this = this;
      AggregatedStatsPacket = lolPackets.AggregatedStatsPacket;
      cmd = new RTMPCommand(0x11, null, null, null, [new AggregatedStatsPacket(this.options).generate(Number(acctId))]);
      return this.rtmp.send(cmd, function(err, result) {
        var _ref, _ref1;
        if (err) {
          return cb(err);
        }
        if ((result != null ? (_ref = result.args) != null ? (_ref1 = _ref[0]) != null ? _ref1.body : void 0 : void 0 : void 0) == null) {
          return cb(err, null);
        }
        return cb(err, result.args[0].body);
      });
    };

    LolClient.prototype.getTeamsForSummoner = function(summonerId, cb) {
      var GetTeamForSummoner, cmd,
        _this = this;
      GetTeamForSummoner = lolPackets.GetTeamForSummoner;
      cmd = new RTMPCommand(0x11, null, null, null, [new GetTeamForSummoner(this.options).generate(Number(summonerId))]);
      return this.rtmp.send(cmd, function(err, result) {
        var _ref, _ref1;
        if (err) {
          cb(err);
        }
        if ((result != null ? (_ref = result.args) != null ? (_ref1 = _ref[0]) != null ? _ref1.body : void 0 : void 0 : void 0) == null) {
          cb(err, null);
        }
        return cb(err, result.args[0].body);
      });
    };

    LolClient.prototype.getTeamById = function(teamId, cb) {
      var GetTeamById, cmd,
        _this = this;
      GetTeamById = lolPackets.GetTeamById;
      cmd = new RTMPCommand(0x11, null, null, null, [new GetTeamById(this.options).generate(teamId)]);
      return this.rtmp.send(cmd, function(err, result) {
        var _ref, _ref1;
        if (err) {
          return cb(err);
        }
        if (!(result != null ? (_ref = result.args) != null ? (_ref1 = _ref[0]) != null ? _ref1.body : void 0 : void 0 : void 0)) {
          return cb(err, null);
        }
        return cb(err, result.args[0].body);
      });
    };

    LolClient.prototype.getSummonerData = function(acctId, cb) {
      var GetSummonerDataPacket, cmd,
        _this = this;
      GetSummonerDataPacket = lolPackets.GetSummonerDataPacket;
      cmd = new RTMPCommand(0x11, null, null, null, [new GetSummonerDataPacket(this.options).generate(acctId)]);
      return this.rtmp.send(cmd, function(err, result) {
        var _ref, _ref1;
        if (err) {
          return cb(err);
        }
        if (!(result != null ? (_ref = result.args) != null ? (_ref1 = _ref[0]) != null ? _ref1.body : void 0 : void 0 : void 0)) {
          return cb(err, null);
        }
        return cb(err, result.args[0].body);
      });
    };