'use strict';

let http = require('http');
let https = require('https');
let connect = require('connect');
let httpProxy = require('http-proxy');
let harmon = require('harmon');
let fs = require('fs');

let logit = require('./logit.js');

let ssl = {
	key: fs.readFileSync('./ssl/server.key'),
	cert: fs.readFileSync('./ssl/server.crt')
}


var hooke = function() {
	var self = this;
	self.resource_dir = __dirname + '/resources';

	var selects = [];
	var simpleselect = {};

	simpleselect.query = '.b';
	simpleselect.func = function(node) {
			node.createWriteStream().end('<div>+ Trumpet</div>');
	}

	selects.push(simpleselect);

	selects.push({
		query: '.a',
		func: function(node) {

		}
	});

	//
	// Basic Connect App
	//
	var app = connect();

	var proxy = httpProxy.createServer({
		ssl,
		target: 'https://www.google.com',
		changeOrigin: true,
		secure: true
	});

	// Listen for the `error` event on `proxy`.
	proxy.on('error', function (err, req, res) {
		res.writeHead(500, {
			'Content-Type': 'text/plain'
		});
		console.log(err);

		res.end('Something went wrong. And we are reporting a custom error message.');
	});

	//app.use(harmon([], selects, true));

	app.use(function(req, res) {
			proxy.web(req, res);
	});

	http.createServer(app).listen(8000);

	https.createServer({
		key: fs.readFileSync('./ssl/server.key'),
		cert: fs.readFileSync('./ssl/server.crt'),
		ca: fs.readFileSync('./ssl/ca.crt')
	},function(req, res) {
			res.writeHead(200, {
					'Content-Type': 'text/html'
			});
			res.write('<html><head></head><body><div class="a">Nodejitsu Http Proxy</div><div class="b">&amp; Frames</div></body></html>');
			res.end();
	}).listen(9000);

	self.init = function(opts) {
	}

	self.start = function(site) {
	}

	self.create = function(settings) {
	}

	self.stop = function() {
	}
};

module.exports = new hooke;
