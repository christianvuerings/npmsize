var express = require('express');
var path = require('path');
var app = express();
var http = require('http');
var axios = require('axios');
var server = http.createServer(app);
var env = process.env.NODE_ENV || 'development';

const defaultPackages = ['main', 'style'];

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

const getFilesizes = (repo, versions, file) => {
	return versions.map(version => {
		return axios.get('https://unpkg.com/' + repo + '@' + version + '/dist/gestalt.css')
		.then(response => {
			return {
				version: version,
				size: response.headers['content-length']
			}
		})
		.catch(error => {
			return {
				version: version,
				size: null
			}
		});
	});
}

// Put all API endpoints under '/api'
app.get('/api/repo/:repo', (req, res) => {
	const repo = req.params.repo;
	axios.get('https://registry.npmjs.org/' + repo).then(response => {
		console.log(response);
		var fileSizes = getFilesizes(repo, Object.keys(response.data.versions), repo.style);

		axios.all(fileSizes).then(data => {
			res.send(data);
		})
	});
});

// List public for the static assets
// app.use(express.static(path.join(__dirname, 'client/build')));

// https://registry.npmjs.org/gestalt

var port = process.env.PORT || 5000;
server.listen(port);
server.on('listening', function() {
  console.log('Express server started on port %s at %s', server.address().port, server.address().address);
});
