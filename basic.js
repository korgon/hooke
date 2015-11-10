var http = require('http');
var request = require('request');
var destination = "http://www.google.com";

http.createServer(function (req, res) {
  for (var header in req.headers) {
    res.setHeader(header, req.headers[header]);
  }
  req.pipe(res);
}).listen(8000);

http.createServer(function (req, res) {
  var options = {
    headers: req.headers,
    url: destination
  }
  req.pipe(request(options)).pipe(res);
}).listen(9000);
