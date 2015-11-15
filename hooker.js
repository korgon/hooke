"use strict";

const proxy_host = 'http://searchspring.com/';

var logit = require('./src/logit.js');

let hoxy = require('hoxy');

var proxy = hoxy.createServer({
  reverse: proxy_host
}).listen(9013);

// Intercept Request
proxy.intercept({
  phase: 'request'
}, function(req, resp) {
  return new Promise(function(resolve, reject) {
    logit.log('Request Intercept', '', 'pass');
    logit.log('Request', '', 'none');
    console.log(req);
    resolve();
  });
});

// Intercept Response
proxy.intercept({
  phase: 'response',
  mimeType: 'text/html',
  as: '$'
}, function(req, resp, cycle) {

  logit.log('Response Intercept', '', 'warn');

  if (resp.statusCode == 301) {
    logit.log('Redirect', 'Encountered a redirect... ', 'red');
    return cycle.serve({
      path: './resources/invalid.html',
      docroot: __dirname + '/'
    });
  }

  // view the request again
  logit.log('Request', '', 'none');
  console.log(req);

  // modify things
  resp.$('title').text('SearchSpring Hooke');
  resp.$('head').prepend('<script type="text/javascript" src="/hooke/hooke.js">');

  // view the response
  logit.log('Response', '', 'none');
  console.log(resp)

});

// Serve up hooke.js
proxy.intercept({
  phase: 'request',
  fullUrl: proxy_host + 'hooke/hooke.js'
}, function(req, resp, cycle) {
  logit.log('Hooke.js', 'Sending hook.js', 'red');
  return cycle.serve({
    path: './resources/hooke.js',
    docroot: __dirname + '/'
  });
});
