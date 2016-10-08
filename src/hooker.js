// used for proxy in springboard
"use strict";

var logit = require('./logit.js');
var hoxy = require('hoxy');
var http = require('http');

var proxy;
var options;

var hooke = function() {
	this.init = function(opts) {
		options = opts;
	}

	this.proxy = function(url) {
		options.url = url;
		if (proxy && proxy.close) {
			proxy.close(function() {
				createNewProxy(url, options.dir);
			});
		} else {
			createNewProxy(url, options.dir);
		}
	}
};

function createNewProxy(url) {
	var proxy_host = url.replace(/\/$/, '');
	logit.log('Proxy Started', proxy_host, 'pass');

	proxy = hoxy.createServer({
		reverse: proxy_host
	}).listen(options.port);

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

		if(options.debug) logit.log('Request', '', 'none');
		if(options.debug) console.log(req);

		if(options.debug) logit.log('Original Response', '', 'none');
		if(options.debug) console.log(resp);

		resp.headers['cache-control'] = 'max-age=1';

		if (resp.statusCode == 301 || resp.statusCode == 302) {
			logit.log('Redirect', 'Encountered a redirect... ', 'red');

			resp.headers.location = 'badhooke?req=' + encodeURIComponent(options.url) + '&resp=' + encodeURIComponent(resp.headers.location);
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
		if(options.debug) logit.log('Modified Response', '', 'none');
		if(options.debug) console.log(resp);

	});

	// Serve up invalid.html
	proxy.intercept({
		phase: 'request',
		fullUrl: proxy_host + '/badhooke'
	}, function(req, resp, cycle) {
		if(options.debug) logit.log('Hooke', 'serving invalid.html (' + options.koa_path + '/resources/invalid.html)', 'green');
		return cycle.serve({
			path: options.koa_path + '/resources/invalid.html'
		});
	});

	// Serve up hooke.js
	proxy.intercept({
		phase: 'request',
		fullUrl: proxy_host + '/hooke/hooke.js'
	}, function(req, resp, cycle) {
		if(options.debug) logit.log('Hooke', 'serving hooke.js (' + options.loader_path + '/resources/hooke.js)', 'green');
		return cycle.serve({
			path: options.loader_path + '/resources/hooke.js'
		});
	});

	// Serve up hooke.css
	proxy.intercept({
		phase: 'request',
		fullUrl: proxy_host + '/hooke/hooke.css'
	}, function(req, resp, cycle) {
		if(options.debug) logit.log('Hooke', 'serving hooke.css', 'green');
		if(options.debug) console.log(rootdir + '/resources/hooke.css');
		return cycle.serve({
			path: rootdir + '/resources/hooke.css'
		});
	});
}

module.exports = new hooke;
