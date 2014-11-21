var LolClient = require('./lol-client');
var util = require('util');

options = {
	region: 'na',
	username: 'username',
	password: 'password',
	version: '',
	debug: true
};

summoner = {
	name: 'HotshotGG',
	acctId: 434582,
	summonerId: 407750
};

var client = new LolClient(options);

client.on('connection', function() {
	console.log("Successfully connected!");
});

client.connect();