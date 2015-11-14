"use strict";

let hoxy = require('hoxy');

var proxy = hoxy.createServer({
  reverse: 'http://www.searchspring.com'
}).listen(9000);

proxy.intercept('request', req => console.log(req.url));

proxy.intercept({
  phase: 'response',
  mimeType: 'text/html',
  as: '$'
}, function(req, resp) {
  console.log('intercepted!');
  resp.$('title').text('Unicorns!');
});
