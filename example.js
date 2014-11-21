var LolClient = require('./lol-client');

var options = {
	region: 'na',
	username: 'username',
	password: 'password',
	version: '4.20.0.315',
	debug: true
};

var client = new LolClient(options);

var heartbeat = function() {
	client.heartbeat();
};

client.on('connection', function() {
	setInterval(heartbeat, 5000);

	console.log("Successfully connected!");
	// Put other code in here, once the client has successfully connected. Queries, etc.
});

client.connect();