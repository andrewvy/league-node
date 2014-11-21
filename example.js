var LolClient = require('./lol-client');

var options = {
	region: 'na',
	username: 'username',
	password: 'password',
	version: '4.20.0.315',
	debug: true
};

var client = new LolClient(options);

client.on('connection', function() {
	console.log("Successfully connected!");
	// Put other code in here, once the client has successfully connected. Queries, etc.
});

client.connect();