var options = {
	port: 9000,
	loader_path: __dirname,
	koa_path: __dirname,
	script_location: '/hooke/hooke.js',
	debug: false
}

var hooker = require('./src/hooker.js');
hooker.init(options);

// Testing
var url = 'https://www.google.com';

hooker.proxy(url);
