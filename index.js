var express = require('express');
var path = require('path');
var app = express();
var http = require('http');
var server = http.createServer(app);
var env = process.env.NODE_ENV || 'development';

/**
 * Make sure we only pass data over https
 */
var forceSSL = function(req, res, next) {
  if (req.headers['x-forwarded-proto'] !== 'https') {
    return res.redirect(['https://', req.get('Host'), req.url].join(''));
  }
  return next();
};

// When in production, force SSL
if (env === 'production') {
  app.use(forceSSL);
}

// List public for the static assets
app.use(express.static(path.join(__dirname, 'client/build')));

// Put all API endpoints under '/api'
app.get('/api/test', (req, res) => {
  const count = 5;

  // Return them as json
  res.json({
		count: count
	});
});

var port = process.env.PORT || 5000;
server.listen(port);
server.on('listening', function() {
  console.log('Express server started on port %s at %s', server.address().port, server.address().address);
});
