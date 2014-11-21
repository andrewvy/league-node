var tls = require('tls');
var loginQueue = require('./lib/login-queue');
var lolPackets = require('./lib/packets');
var rtmp = require('namf/rtmp');
var util = require('util');
var RTMPClient = rtmp.RTMPClient;
var RTMPCommand = rtmp.RTMPCommand;
var EventEmitter = require('events').EventEmitter;
var Decoder = require('namf/amf3').Decoder;

var LolClient = function(options) {
	EventEmitter.apply(this, arguments);
	this.options = options;

	this._rtmpHosts = {
		na: 'prod.na2.lol.riotgames.com',
		euw: 'prod.eu.lol.riotgames.com',
		eune: 'prod.eun1.lol.riotgames.com'
	};

	this._loginQueueHosts = {
		na: 'lq.na2.lol.riotgames.com',
		euw: 'lq.eu.lol.riotgames.com',
		eune: 'lq.eun1.lol.riotgames.com'
	};

	if (this.options.region) {
		this.options.host = this._rtmpHosts[this.options.region];
		this.options.lqHost = this._loginQueueHosts[this.options.region];
	} else {
		this.options.host = this.options.host;
		this.options.lqHost = this.options.lqHost;
	}

	this.options.port = this.options.port || 2099;
	this.options.username = this.options.username;
	this.options.password = this.options.password;

	this.options.version = this.options.version || '1.55.12_02_27_22_54';
	this.options.debug = this.options.debug || false;

	if (this.options.debug) {
		console.log(this.options);
	}
};

LolClient.prototype = EventEmitter.prototype;

LolClient.prototype.connect = function(cb) {
	var _this = this;
	this.checkLoginQueue( function(err, token) {
		if (err) {
			console.log(err);
		}
		_this.sslConnect( function(err, stream) {
			console.log('stream connected');
			_this.stream = stream;

			_this.setupRTMP();
		});
	});
};

LolClient.prototype.checkLoginQueue = function(cb) {
	var _this = this;
	if (this.options.debug) {
		console.log("Checking Login Queue");
	}

	loginQueue(this.options.lqHost, this.options.username, this.options.password, function(err, response) {
		if(err && _this.options.debug) {
			console.log("Login Queue Failed");
			console.log("Error: " + err);
		} else {
			if(!response.token) {
				var champ = response.champ;
				var rate = response.rate;
				var delay = response.delay;
				var node = response.node;
				var id = 0;
				var cur = 0;

				for (var i=0; i<response.tickers.length; i++){
					if (response.tickers[i].node == node) {
						id = response.tickers[i].id;
						cur = response.tickers[i].current;
					}
				}

				console.log("In login queue. #" + (id - cur) + " in line.");

				setTimeout( function() {
					_this.checkLoginQueue(function(err, token) {
						if (err) {
							console.log(err);
						}
						_this.sslConnect(function(err, stream) {
							console.log('stream connected');
							_this.stream = stream;
							_this.setupRTMP();
						});
					});
				}, delay);
			} else {
				if (_this.options.debug) {
					console.log("Login Queue Response: ", response);
				}
				console.log("Token", response.token);
				_this.options.queueToken = response.token;
				cb(null, _this.options.queueToken);
			}
		}
	});
};

LolClient.prototype.sslConnect = function(cb) {
	if (this.options.debug) {
		console.log("Connecting to SSL");
	}

	var stream = tls.connect(this.options.port, this.options.host, function() {
		cb(null, stream);
	});

	stream.on('error', function() {
		stream.destroySoon();
	});
};

LolClient.prototype.setupRTMP = function() {
	var _this = this;

	if (this.options.debug) { console.log("Setting up RTMP Client"); }
	this.rtmp = new RTMPClient(this.stream);
	if (this.options.debug) { console.log("Handshaking RTMP"); }

	console.log(this.rtmp);
	this.rtmp.handshake(function(err) {
		if (err) {
			_this.stream.destroy();
		} else {
			_this.performNetConnect();
		}
	});
};

LolClient.prototype.performNetConnect = function() {
	var _this = this;

	if (this.options.debug) { console.log('Performing RTMP NetConnect'); }
	var ConnectPacket = lolPackets.ConnectPacket;
	var pkt = new ConnectPacket(this.options);
	var cmd = new RTMPCommand(0x14, 'connect', null, pkt.appObject(), [false, 'nil', '', pkt.commandObject()]);
	this.rtmp.send(cmd, function(err, result) {
		if (err) {
			if (_this.options.debug) { console.log('NetConnect failed'); }
			_this.stream.destroy();
		} else {
			if (_this.options.debug) { console.log('NetConnect success'); }
			_this.performLogin(result);
		}
	});
};

LolClient.prototype.performLogin = function(result) {
	var _this = this;

	if (this.options.debug) { console.log("Performing RTMP Login..."); }
	var LoginPacket = lolPackets.LoginPacket;
	this.options.dsid = result.args[0].id;

	var cmd = new RTMPCommand(0x11, null, null, null, [new LoginPacket(this.options).generate(this.options.version)]);
	this.rtmp.send(cmd, function(err, result) {
		if (err) {
			if (_this.options.debug) { console.log('RTMP Login Failed'); }
			_this.stream.destroy();
		} else {
			_this.options.clientId = result.args[0].clientId.toString('hex');

			if (_this.options.debug) { console.log('RTMP Login Success'); }
			_this.performAuthentication(result);
		}
	});
};

LolClient.prototype.performAuthentication = function(result) {
	var _this = this;
	this.options.authToken = result.args[0].body.object.token;
	if (this.options.debug) { console.log("Performing Session Authentication") }

	var AuthPacket = lolPackets.AuthPacket;
	var cmd = new RTMPCommand(0x11, null, null, null, [new AuthPacket(this.options).generate()]);

	this.rtmp.send(cmd, function(err, result) {
		if (err) {
			if (_this.options.debug) { console.log("Session Authentication Failed"); }
			_this.stream.destroy();
		} else {
			if (_this.options.debug) { console.log("Session Authentication Success"); }
			_this.subscribeGN(result);
		}
	});
};

LolClient.prototype.subscribeGN = function(result) {
	var _this = this;

	if (this.options.debug) { console.log("Performing GN Subscription"); }
	var GNPacket = lolPackets.GNPacket;
	var cmd = new RTMPCommand(0x11, null, null, null, [new GNPacket(this.options).generate(this.options.acctId)]);

	this.rtmp.send(cmd, function(err, result) {
		if (err) {
			if (_this.options.debug) { console.log("GN Subscription Failed"); }
			_this.stream.destroy();
		} else {
			if (_this.options.debug) { console.log("GN Subscription Success"); }
			_this.subscribeCN(result);
		}
	})
};

LolClient.prototype.subscribeCN = function(result) {
	var _this = this;

	if (this.options.debug) { console.log("Performing CN Subscription"); }
	var CNPacket = lolPackets.CNPacket;
	var cmd = new RTMPCommand(0x11, null, null, null, [new CNPacket(this.options).generate(this.options.acctId)]);

	this.rtmp.send(cmd, function(err, result) {
		if (err) {
			if (_this.options.debug) { console.log("CN Subscription Failed"); }
			_this.stream.destroy();
		} else {
			if (_this.options.debug) { console.log("CN Subscription Success"); }
			_this.subscribeBC(result);
		}
	})
};

LolClient.prototype.subscribeBC = function(result) {
	var _this = this;

	if (this.options.debug) { console.log("Performing BC Subscription"); }
	var BCPacket = lolPackets.GNPacket;
	var cmd = new RTMPCommand(0x11, null, null, null, [new BCPacket(this.options).generate(this.options.acctId)]);

	this.rtmp.send(cmd, function(err, result) {
		if (err) {
			if (_this.options.debug) { console.log("BC Subscription Failed"); }
			_this.stream.destroy();
		} else {
			if (_this.options.debug) { console.log("Connect Proceess Completed"); }
			_this.emit('connection');
		}
	})
};

LolClient.prototype.heartbeat = function() {
	var _this = this;

	if (this.options.debug) { console.log("Performing Heartbeat"); }

	var Heartbeat = lolPackets.HeartbeatPacket;
	var cmd = new RTMPCommand(0x11, null, null, null, [new Heartbeat(this.options).generate()]);

	this.rtmp.send(cmd, function(err, result) {
		if (err && _this.options.debug) {
			console.log("Heartbeat failed")
		} else if (_this.options.debug) {
			console.log("Heartbeat success")
		}
	});
}

LolClient.prototype.getSummonerByName = function(name, cb) {
	var _this = this;

	if ( this.options.debug) { console.log("Finding player by name: " + name); }
	var LookupPacket = lolPackets.LookupPacket;
	var cmd = new RTMPCommand(0x11, null, null, null, [new LookupPacket(this.options).generate(name)]);

	this.rtmp.send(cmd, function(err, result) {
		if (err) { return cb(err); }
		if (result != null) {
			return cb(null, result.args[0].body);
		}
	});
};

LolClient.prototype.getCurrentGameByName = function(name, cb) {
	var _this = this;

	if ( this.options.debug) { console.log("Getting current game by name: " + name); }
	var GetCurrentGamePacket = lolPackets.GetCurrentGamePacket;
	var cmd = new RTMPCommand(0x11, null, null, null, [new GetCurrentGamePacket(this.options).generate(name)]);

	this.rtmp.send(cmd, function(err, result) {
		if (err) { return cb(err); }
		if (result != null) {
			return cb(null, result.args[0].body);
		}
	});
};

LolClient.prototype.getSummonerStats = function(acctId, cb) {
	var _this = this;

	if ( this.options.debug) { console.log("Fetching summoner stats for account id: " + acctId); }
	var PlayerStatsPacket = lolPackets.PlayerStatsPacket;
	var cmd = new RTMPCommand(0x11, null, null, null, [new PlayerStatsPacket(this.options).generate(Number(acctId))]);

	this.rtmp.send(cmd, function(err, result) {
		if (err) { return cb(err); }
		if (result != null) {
			return cb(null, result.args[0].body);
		}
	});
};

LolClient.prototype.getMatchHistory= function(acctId, cb) {
	var _this = this;

	if ( this.options.debug) { console.log("Fetching Match History for account id: " + acctId); }
	var RecentGamesPacket = lolPackets.RecentGamesPacket;
	var cmd = new RTMPCommand(0x11, null, null, null, [new RecentGamesPacket(this.options).generate(Number(acctId))]);

	this.rtmp.send(cmd, function(err, result) {
		if (err) { return cb(err); }
		if (result != null) {
			return cb(null, result.args[0].body);
		}
	});
};

LolClient.prototype.getAggregatedStats = function(acctId, cb) {
	var _this = this;

	if ( this.options.debug) { console.log("Getting aggregated stats for account id: " + acctId); }
	var AggregatedStatsPacket = lolPackets.AggregatedStatsPacket;
	var cmd = new RTMPCommand(0x11, null, null, null, [new AggregatedStatsPacket(this.options).generate(Number(acctId))]);

	this.rtmp.send(cmd, function(err, result) {
		if (err) { return cb(err); }
		if (result != null) {
			return cb(null, result.args[0].body);
		}
	});
};

LolClient.prototype.getTeamsForSummoner = function(summonerId, cb) {
	var _this = this;

	if ( this.options.debug) { console.log("Finding teams for summoner id: " + summonerId); }
	var GetTeamsForSummonerPacket = lolPackets.GetTeamsForSummonerPacket;
	var cmd = new RTMPCommand(0x11, null, null, null, [new GetTeamsForSummonerPacket(this.options).generate(Number(summonerId))]);

	this.rtmp.send(cmd, function(err, result) {
		if (err) { return cb(err); }
		if (result != null) {
			return cb(null, result.args[0].body);
		}
	});
};

LolClient.prototype.getTeamById = function(teamId, cb) {
	var _this = this;

	if ( this.options.debug) { console.log("Finding team by team id: " + teamId); }
	var GetTeamByIdPacket = lolPackets.GetTeamByIdPacket;
	var cmd = new RTMPCommand(0x11, null, null, null, [new GetTeamByIdPacket(this.options).generate(Number(teamId))]);

	this.rtmp.send(cmd, function(err, result) {
		if (err) { return cb(err); }
		if (result != null) {
			return cb(null, result.args[0].body);
		}
	});
};

LolClient.prototype.getSummonerData = function(acctId, cb) {
	var _this = this;

	if ( this.options.debug) { console.log("Finding summoner data for account id: " + acctId); }
	var GetSummonerDataPacket = lolPackets.GetSummonerDataPacket;
	var cmd = new RTMPCommand(0x11, null, null, null, [new GetSummonerDataPacket(this.options).generate(Number(acctId))]);

	this.rtmp.send(cmd, function(err, result) {
		if (err) { return cb(err); }
		if (result != null) {
			return cb(null, result.args[0].body);
		}
	});
};

module.exports  = LolClient;
