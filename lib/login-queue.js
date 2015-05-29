var https = require('https');

var performQueueRequest = function(host, username, password, useGarena, cb) {
	var options = {
		host: host,
		port: 443,
		path: '/login-queue/rest/queue/authenticate',
		method: 'POST',
		requestCert: false,
		rejectUnauthorize: false
	}

              var data;
              if (!useGarena)
	    data = "payload=user%3D" + username + "%2Cpassword%3D" + password;
              else
                  data = "payload=8393%20" + garenaRetoken(password);

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

var garenaRetoken = function(token) {
    //Sync method because of convenience, only use when login
    var t = token.toString();
    t = t.replace('/', '%2F');
    t = t.replace('+', '%2B');
    t = t.replace('=', '%3D');
    return t;
}

module.exports = performQueueRequest;
