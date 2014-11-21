var https = require('https');

var performQueueRequest = function(host, username, password, cb) {
	var options = {
		host: host,
		port: 443,
		path: '/login-queue/rest/queue/authenticate',
		method: 'POST'
	}

	var data = "payload=user%3D" + username + "%2Cpassword%3D" + password;
	var req = https.request(options, function (res) {
		res.on('data', function(d) {
			var data = JSON.parse(d.toString('utf-8'));
			cb(null, data);
		});
	});

	req.on('error', function(err) {
		cb(err);
	});

	req.end(data);
};

module.exports = performQueueRequest;