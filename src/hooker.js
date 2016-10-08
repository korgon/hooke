// used for proxy in springboard
"use strict";

var logit = require('./logit.js');
var hoxy = require('hoxy');
var http = require('http');

var proxy;

function createNewProxy(url, rootdir) {
	var proxy_host = url.replace(/\/$/, '');
	logit.log('Proxy', proxy_host, 'pass');
	console.log(rootdir);

	proxy = hoxy.createServer({
		reverse: proxy_host + '/'
	}).listen(9000);

	proxy.log('error warn', function(event) {
		logit.log('Error', '', 'fail');
		console.error(event.level + ': ' + event.message);
		if (event.error) console.error(event.error.stack);
	});

	// Intercept Request
	// proxy.intercept({
	//   phase: 'request'
	// }, function(req, resp) {
	//   return new Promise(function(resolve, reject) {
	//     logit.log('Request Intercept', '', 'pass');
	//     logit.log('Request', '', 'none');
	//     console.log(req);
	//     resolve();
	//   });
	// });

	// Intercept Response
	proxy.intercept({
		phase: 'response',
		mimeType: 'text/html',
		as: '$'
	}, function(req, resp, cycle) {

		logit.log('Response Intercept', '', 'warn');

		// view the request again
		logit.log('Request', '', 'none');
		console.log(req);

		if (resp.statusCode == 301) {
			logit.log('Redirect', 'Encountered a redirect... ', 'red');
			console.log(resp);
			if (resp.headers.location.match(/http/)) {
				return cycle.serve({
					path: rootdir + '/resources/invalid.html'
				});
			} else if (resp.headers && resp.headers.location) {
				logit.log('Redirect', resp.headers.location, 'fail');
			}
		}

		// modify things
		resp.$('title').text('SearchSpring Hooke');
		resp.$('head').prepend('<script type="text/javascript" src="/hooke/hooke.js">');
		// make hrefs proxy friendly
		resp.$('a').each(function(i, anchor) {
			let href = resp.$(anchor).attr('href');
			if (href) {
				let regex = new RegExp('^' + proxy_host, 'g');
				href = href.replace(regex, '');
				resp.$(anchor).attr('href', href);
			}
		});

		// view the response
		logit.log('Response', '', 'none');
		console.log(resp)

	});

	// Serve up hooke.js
	proxy.intercept({
		phase: 'request',
		fullUrl: proxy_host + '/hooke/hooke.js'
	}, function(req, resp, cycle) {
		logit.log('Hooke', 'serving hooke.js (' + rootdir + '/resources/hooke.js)', 'green');
		return cycle.serve({
			path: rootdir + '/resources/hooke.js'
		});
	});

	// Serve up hooke.css
	proxy.intercept({
		phase: 'request',
		fullUrl: proxy_host + '/hooke/hooke.css'
	}, function(req, resp, cycle) {
		logit.log('Hooke', 'serving hooke.css', 'green');
		console.log(rootdir + '/resources/hooke.css');
		return cycle.serve({
			path: rootdir + '/resources/hooke.css'
		});
	});
}


module.exports = {
	use: function(url, rootdir) {
		if (proxy && proxy.close) {
			proxy.close(function() {
				createNewProxy(url, rootdir);
			});
		} else {
			createNewProxy(url, rootdir);
		}
	}
}
