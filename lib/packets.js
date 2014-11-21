var uuid = require('node-uuid');
var Encoder = require('namf/amf0').Encoder;
var Decoder = require('namf/amf0').Decoder;
var ASObject = require('namf/messaging').ASObject;


var Packet = function (options) {
	this.options = options;
}

var ConnectPacket = function() {
	Packet.apply(this, arguments);
};

ConnectPacket.prototype = Packet.prototype;
ConnectPacket.prototype.constructor = Packet;

ConnectPacket.prototype.appObject = function() {
	var object = {
		app: '',
		flashVer: 'WIN 10,1,85,3',
		swfUrl: 'app:/mod_ser.dat',
		tcUrl: 'rtmps://beta.lol.riotgames.com:2099',
		fpad: false,
		capabilities: 239,
		audioCodecs: 3191,
		videoCodecs: 252,
		videoFunction: 1,
		pageUrl: undefined,
		objectEncoding: 3
	};

	return object;
};

ConnectPacket.prototype.commandObject = function() {
	var object = new ASObject();
	object.name = 'flex.messaging.messages.CommandMessage';
	object.object = {
		operation: 5,
		correlationId: '',
		timestamp: 0,
		clientId: null,
		timeToLive: 0,
		// TODO: Generate message UUID here
		messageId: '9DC6600E-8F54-604F-AB39-1515B4CBE8AA',
		destination: '',
		headers: { DSMessagingVersion: 1, DSId: 'my-rtmps' },
		body: {}
	}

	return object;
};

var LoginPacket = function() {
	Packet.apply(this, arguments);
};

LoginPacket.prototype.constructor = Packet;

LoginPacket.prototype.generate = function(clientVersion) {
	if (clientVersion === null) {
		clientVersion = '1.48.11_11_14_04_20';
	}
	var object = new ASObject();
	object.name = 'flex.messaging.messages.RemotingMessage';
	object.keys = ['operation', 'source', 'timestamp', 'clientId', 'timeToLive', 'messageId', 'destination', 'headers', 'body'];
	object.object = {
		operation: 'login',
		source: null,
		timestamp: 0,
		clientId: null,
		timeToLive: null,
		messageId: uuid().toUpperCase(),
		destination: 'loginService',
		headers: this.generateHeaders(),
		body: [this.generateBody(clientVersion)]
	};
	object.encoding = 0;

	return object;
};

LoginPacket.prototype.generateHeaders = function(clientVersion) {
	if (clientVersion === null) {
		clientVersion = '1.48.11_11_14_04_20';
	}
	var headers = new ASObject();
	headers.name = '';
	headers.object = {
		DSId: this.options.dsid,
		DSRequestTimeout: 60,
		DSEndpoint: 'my-rtmps'
	};
	headers.encoding = 2;

	return headers;
};

LoginPacket.prototype.generateBody = function(clientVersion) {
	if (clientVersion === null) {
		clientVersion = '1.48.11_11_14_04_20';
	}
	var body = new ASObject();
	body.name = 'com.riotgames.platform.login.AuthenticationCredentials'
	body.keys = ['oldPassword', 'password', 'authToken', 'locale', 'partnerCredentials', 'ipAddress', 'ipAddress', 'domain', 'username', 'clientVersion', 'securityAnswer'];
	body.object = {
		oldPassword: null,
		password: this.options.password,
		authToken: this.options.queueToken,
		locale: 'en_US',
		partnerCredentials: null,
		ipAddress: '203.59.95.218',
		domain: 'lolclient.lol.riotgames.com',
		username: this.options.username,
		clientVersion: clientVersion,
		securityAnswer: null
	};
	body.encoding = 0;

	return body;
};

var AuthPacket = function() {
	Packet.apply(this, arguments);
};

AuthPacket.prototype.constructor = Packet;

AuthPacket.prototype.generate = function() {
	var str = this.options.username + ':' + this.options.authToken;
	var objectBody = new Buffer(str, 'utf8').toString('base64');
	var object = new ASObject();
	object.name = 'flex.messaging.messages.CommandMessage'
	object.keys = ['operation', 'correlationId', 'timestamp', 'clientId', 'timeToLive', 'messageId', 'destination', 'headers', 'body'];
	object.object = {
		operation: 8,
		correlationId: '',
		timestamp: 0,
		clientId: null,
		timeToLive: 0,
		messageId: uuid().toUpperCase(),
		destination: 'auth',
		headers: this.generateHeaders(),
		body: objectBody
	};
	object.encoding = 0;

	return object;
};

var GNPacket = function() {
	Packet.apply(this, arguments);
};

GNPacket.prototype.constructor = Packet;

GNPacket.prototype.generate = function(acctId) {
	var object = new ASObject();
	object.name = 'flex.messaging.messages.CommandMessage';
	object.keys = ['operation', 'correlationId', 'timestamp', 'clientId', 'timeToLive', 'messageId', 'destination', 'headers', 'body'];
	object.object = {
		operation: 8,
		correlationId: '',
		timestamp: 0,
		clientId: 'gn-' + acctId,
		timeToLive: 0,
		messageId: uuid().toUpperCase(),
		destination: 'messagingDestination',
		headers: this.generateHeaders(acctId),
		body: null
	};
	object.encoding = 0;

	return object;
}

GNPacket.prototype.generateHeaders = function(acctId) {
	var headers = new ASObject();
	headers.name = '';
	headers.object = {
		DSId: this.options.dsid,
		DSSSubtopic: 'gn-' + acctId,
		DSEndpoint: 'my-rtmps'
	};
	headers.encoding = 2;

	return headers;
};

var CNPacket = function() {
	Packet.apply(this, arguments);
};

CNPacket.prototype.constructor = Packet;

CNPacket.prototype.generate = function(acctId) {
	var object = new ASObject();
	object.name = 'flex.messaging.messages.CommandMessage';
	object.keys = ['operation', 'correlationId', 'timestamp', 'clientId', 'timeToLive', 'messageId', 'destination', 'headers', 'body'];
	object.object = {
		operation: 8,
		correlationId: '',
		timestamp: 0,
		clientId: 'cn-' + acctId,
		timeToLive: 0,
		messageId: uuid().toUpperCase(),
		destination: 'messagingDestination',
		headers: this.generateHeaders(acctId),
		body: null
	};
	object.encoding = 0;

	return object;
};

CNPacket.prototype.generateHeaders = function(acctId) {
	var headers = new ASObject();
	headers.name = '';
	headers.object = {
		DSId: this.options.dsid,
		DSSSubtopic: 'cn-' + acctId,
		DSEndpoint: 'my-rtmps'
	};
	headers.encoding = 2;

	return headers;
};

var BCPacket = function() {
	Packet.apply(this, arguments);
};

BCPacket.prototype.constructor = Packet;

BCPacket.prototype.generate = function(acctId) {
	var object = new ASObject();
	object.name = 'flex.messaging.messages.CommandMessage';
	object.keys = ['operation', 'correlationId', 'timestamp', 'clientId', 'timeToLive', 'messageId', 'destination', 'headers', 'body'];
	object.object = {
		operation: 8,
		correlationId: '',
		timestamp: 0,
		clientId: 'bc-' + acctId,
		timeToLive: 0,
		messageId: uuid().toUpperCase(),
		destination: 'messagingDestination',
		headers: this.generateHeaders(),
		body: null
	};
	object.encoding = 0;

	return object;
};

BCPacket.prototype.generateHeaders = function() {
	var headers = new ASObject();
	headers.name = '';
	headers.object = {
		DSId: this.options.dsid,
		DSSSubtopic: 'bc',
		DSEndpoint: 'my-rtmps'
	};
	headers.encoding = 2;

	return headers;
};

var HeartbeatPacket = function() {
	Packet.apply(this, arguments);
	this.counter = 1;
};

HeartbeatPacket.prototype.constructor = Packet;

HeartbeatPacket.prototype.generate = function() {
	var object = new ASObject();
	object.name = 'flex.messaging.messages.RemotingMessage';
	object.keys = ['operation', 'source', 'timestamp', 'clientId', 'timeToLive', 'messageId', 'destination', 'headers', 'body']
	object.object = {
		operation: 'performLCDSHeartBeat',
		source: null,
		timestamp: 0,
		clientId: this.options.clientId,
		timeToLive: 0,
		messageId: uuid().toUpperCase(),
		destination: 'loginService',
		headers: this.generateHeaders(),
		body: [this.options.acctId, this.options.authToken, this.counter, new Date().toString().slice(0, -6)]
	};
	object.encoding = 0;
	this.counter += 1;

	return object;
};

HeartbeatPacket.prototype.generateHeaders = function() {
	var headers = new ASObject();
	headers.name = '';
	headers.object = {
		DSId: this.options.dsid,
		DSRequestTimeout: 60,
		DSEndpoint: 'my-rtmps'
	};
	headers.encoding = 2;

	return headers;
};

var LookupPacket = function() {
	Packet.apply(this, arguments);
};

LookupPacket.prototype.constructor = Packet;

LookupPacket.prototype.generate = function(name) {
	var object = new ASObject();
	object.name = 'flex.messaging.messages.RemotingMessage';
	object.keys = ['source', 'operation', 'timestamp', 'messageId', 'clientId', 'timeToLive', 'body', 'destination', 'headers'];
	object.object = {
		operation: 'getSummonerByName',
		source: null,
		timestamp: 0,
		clientId: this.options.clientId,
		timeToLive: 0,
		messageId: uuid().toUpperCase(),
		destination: 'summonerService',
		headers: this.generateHeaders(),
		body: [name]
	};
	object.encoding = 0;

	return object;
};

LookupPacket.prototype.generateHeaders = function() {
	var headers = new ASObject();
	headers.name = '';
	headers.object = {
		DSId: this.options.dsid,
		DSRequestTimeout: 60,
		DSEndpoint: 'my-rtmps'
	};
	headers.encoding = 2;

	return headers;
}

var GetSummonerDataPacket = function() {
	Packet.apply(this, arguments);
};

GetSummonerDataPacket.prototype.constructor = Packet;

GetSummonerDataPacket.prototype.generate = function(acctId) {
	var object = new ASObject();
	object.name= 'flex.messaging.messages.RemotingMessage';
	object.keys = ['source', 'operation', 'timestamp', 'messageId', 'clientId', 'timeToLive', 'body', 'destination', 'headers'];
	object.object = {
		operation: 'getAllPublicSummonerDataByAccount',
		source: null,
		timestamp: 0,
		clientId: this.options.clientId,
		timeToLive: 0,
		messageId: uuid().toUpperCase(),
		destination: 'summonerService',
		headers: this.generateHeaders(),
		body: [acctId]
	};
	object.encoding = 0;

	return object;
};

GetSummonerDataPacket.generateHeaders = function() {
	var headers = new ASObject();
	headers.name = '';
	headers.object = {
		DSId: this.options.dsid,
		DSRequestTimeout: 60,
		DSEndpoint: 'my-rtmps'
	};
	headers.encoding = 2;

	return headers;
};

var AggregatedStatsPacket = function() {
	Packet.apply(this, arguments);
};

AggregatedStatsPacket.prototype.constructor = Packet;

AggregatedStatsPacket.prototype.generate = function(acctId) {
	var object = new ASObject();
	object.name = 'flex.messaging.messages.RemotingMessage';
	object.keys = ['source', 'operation', 'timestamp', 'messageId', 'clientId', 'timeToLive', 'body', 'destination', 'headers'];
	object.object = {
		operation: 'getAggregatedStats',
		source: null,
		timestamp: 0,
		clientId: this.options.clientId,
		timeToLive: 0,
		messageId: uuid().toUpperCase(),
		destination: 'playerStatsService',
		headers: this.generateHeaders(),
		body: [acctId, 'CLASSIC', 2]
	};
	object.encoding = 0;

	return object;
};

AggregatedStatsPacket.prototype.generateHeaders = function() {
	var headers = new ASObject();
	headers.name = '';
	headers.object = {
		DSId: this.options.dsid,
		DSRequestTimeout: 60,
		DSEndpoint: 'my-rtmps'
	};
	headers.encoding = 2;

	return headers;
};

var PlayerStatsPacket = function() {
	Packet.apply(this, arguments);
};

PlayerStatsPacket.prototype.constructor = Packet;

PlayerStatsPacket.prototype.generate = function(acctId) {
	var object = new ASObject();
	object.name = 'flex.messaging.messages.RemotingMessage';
	object.keys = ['source', 'operation', 'timestamp', 'messageId', 'clientId', 'timeToLive', 'body', 'destination', 'headers'];
	object.object = {
		operation: 'retrievePlayerStatsByAccountId',
		source: null,
		timestamp: 0,
		clientId: this.options.clientId,
		timeToLive: 0,
		messageId: uuid().toUpperCase(),
		destination: 'playerStatsService',
		headers: this.generateHeaders(),
		body: [acctId, 'CURRENT']
	};
	object.encoding = 0;

	return object;
};

PlayerStatsPacket.prototype.generateHeaders = function() {
	var headers = new ASObject();
	headers.name = '';
	headers.object = {
		DSId: this.options.dsid,
		DSRequestTimeout: 60,
		DSEndpoint: 'my-rtmps'
	};
	headers.encoding = 2;

	return headers;
};

var RecentGamesPacket = function() {
	Packet.apply(this, arguments);
};

RecentGamesPacket.prototype.constructor = Packet;

RecentGamesPacket.prototype.generate = function(acctId) {
	var object = new ASObject();
	object.name = 'flex.messaging.messages.RemotingMessage';
	object.keys = ['source', 'operation', 'timestamp', 'messageId', 'clientId', 'timeToLive', 'body', 'destination', 'headers'];
	object.object = {
		operation: 'getRecentGames',
		source: null,
		timestamp: 0,
		clientId: this.options.clientId,
		timeToLive: 0,
		messageId: uuid().toUpperCase(),
		destination: 'playerStatsService',
		headers: this.generateHeaders(),
		body: [acctId]
	};
	object.encoding = 0;

	return object;
};

RecentGamesPacket.generateHeaders = function() {
	var headers = new ASObject();
	headers.name = '';
	headers.object = {
		DSId: this.options.dsid,
		DSRequestTimeout: 60,
		DSEndpoint: 'my-rtmps'
	};
	headers.encoding = 2;

	return headers;
};

var GetTeamForSummonerPacket = function() {
	Packet.apply(this, arguments);
};

GetTeamForSummonerPacket.prototype.constructor = Packet;

GetTeamForSummonerPacket.prototype.generate = function(summonerId) {
	var object = new ASObject();
	object.name = 'flex.messaging.messages.RemotingMessage';
	object.keys = ['source', 'operation', 'timestamp', 'messageId', 'clientId', 'timeToLive', 'body', 'destination', 'headers'];
	object.object = {
		operation: 'findPlayer',
		source: null,
		timestamp: 0,
		clientId: this.options.clientId,
		timeToLive: 0,
		messageId: uuid().toUpperCase(),
		destination: 'summonerTeamService',
		headers: this.generateHeaders(),
		body: [summonerId]
	};
	object.encoding = 0;

	return object;
};

GetTeamForSummonerPacket.prototype.generateHeaders = function() {
	var headers = new ASObject();
	headers.name = '';
	headers.object = {
		DSId: this.options.dsid,
		DSRequestTimeout: 60,
		DSEndpoint: 'my-rtmps'
	};
	headers.encoding = 2;

	return headers;
};

var GetTeamByIdPacket = function() {
	Packet.apply(this, arguments);
};

GetTeamByIdPacket.prototype.constructor = Packet;

GetTeamByIdPacket.prototype.generate = function(teamId) {
	var object = new ASObject();
	object.name = 'flex.messaging.messages.RemotingMessage';
	object.keys = ['source', 'operation', 'timestamp', 'messageId', 'clientId', 'timeToLive', 'body', 'destination', 'headers'];
	object.object = {
		operation: 'findTeamById',
		source: null,
		timestamp: 0,
		clientId: this.options.clientId,
		timeToLive: 0,
		messageId: uuid().toUpperCase(),
		destination: 'summonerTeamService',
		headers: this.generateHeaders(),
		body: [this.generateBody(teamId)]
	};
	object.encoding = 0;

	return object;
};

GetTeamByIdPacket.prototype.generateBody = function(teamId) {
	var body = new ASObject();
	body.name = 'com.riotgames.team.TeamId'
	body.keys = ['dataVersion', 'fullId', 'futureData']
	body.object = {
		dataVersion: null,
		fullId: teamId,
		futureData: null
	};
	body.encoding = 0;

	return body;
};

GetTeamByIdPacket.prototype.generateHeaders = function() {
	var headers = new ASObject();
	headers.name = '';
	headers.object = {
		DSId: this.options.dsid,
		DSRequestTimeout: 60,
		DSEndpoint: 'my-rtmps'
	};
	headers.encoding = 2;

	return headers;
};

var GetCurrentGamePacket = function() {
	Packet.apply(this, arguments);
};

GetCurrentGamePacket.prototype.constructor = Packet;

GetCurrentGamePacket.prototype.generate = function(name) {
	var object = new ASObject();
	object.name = 'flex.messaging.messages.RemotingMessage';
	object.keys = ['source', 'operation', 'timestamp', 'messageId', 'clientId', 'timeToLive', 'body', 'destination', 'headers'];
	object.object = {
		operation: 'retrieveInProgressSpectatorGameInfo',
		source: null,
		timestamp: 0,
		clientId: this.options.clientId,
		timeToLive: 0,
		messageId: uuid().toUpperCase(),
		destination: 'gameService',
		headers: this.generateHeaders(),
		body: [name]
	};
	object.encoding = 0;

	return object;
};

GetCurrentGamePacket.prototype.generateHeaders = function() {
	var headers = new ASObject();
	headers.name = '';
	headers.object = {
		DSId: this.options.dsid,
		DSRequestTimeout: 60,
		DSEndpoint: 'my-rtmps'
	};
	headers.encoding = 2;

	return headers;
}

  exports.ConnectPacket = ConnectPacket;
  exports.LoginPacket = LoginPacket;
  exports.AuthPacket = AuthPacket;
  exports.HeartbeatPacket = HeartbeatPacket;
  exports.LookupPacket = LookupPacket;

  exports.GetSummonerDataPacket = GetSummonerDataPacket;
  exports.AggregatedStatsPacket = AggregatedStatsPacket;
  exports.PlayerStatsPacket = PlayerStatsPacket;
  exports.RecentGamesPacket = RecentGamesPacket;
  exports.GetTeamForSummonerPacket = GetTeamForSummonerPacket;
  exports.GetTeamByIdPacket = GetTeamByIdPacket;
  exports.GetCurrentGamePacket = GetCurrentGamePacket;

  exports.BCPacket = BCPacket;
  exports.CNPacket = CNPacket;
  exports.GNPacket = GNPacket;

  exports.HeartbeatPacket = HeartbeatPacket;