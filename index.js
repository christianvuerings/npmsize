var express = require('express');
var path = require('path');
var app = express();
var http = require('http');
var axios = require('axios');
var server = http.createServer(app);
var env = process.env.NODE_ENV || 'development';

const defaultPackages = ['main', 'style', 'module', 'sass'];

const cache = new Map();

getFromCache = (key) => {
	if (cache.has(key)) {
		return cache.get(key);
	}
	return null;
};

setToCache = (key, value) => {
	cache.set(key, value);
};


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

const getFilesizes = (repo, versions, path) => {
	return versions.slice(-40).map(version => {

		const url = 'https://unpkg.com/' + repo + '@' + version + '/' + path;

		const fromCache = getFromCache(url);
		if (fromCache) {
			return fromCache;
		} else {
			return axios.get(url)
				.then(response => {
					const output = [
						version, +((response.headers['content-length'] / 1000).toFixed(2))
					];
					setToCache(url, output);
					return output;
				})
				.catch(error => {
					const output = [version, null];
					setToCache(url, output);
					return output;
				});
		}
	});
}

// Put all API endpoints under '/api'
app.get('/api/repo/:repo/path/', (req, res) => {
	const repo = req.params.repo;
	const path = req.query.path;
	axios.get('https://registry.npmjs.org/' + repo).then(response => {
		// console.log(response);
		var fileSizes = getFilesizes(repo, Object.keys(response.data.versions), path);

		Promise.all(fileSizes).then(data => {
			res.send(data);
		})
	});
});

const getPaths = (arr, versions) => arr.reduce(function(filePaths, version) {
	var versionObj = versions[version];
	defaultPackages.forEach((package) => {
		const filePath = versionObj[package];
		if (filePath && !filePaths.includes(filePath)) {
			filePaths.push(filePath);
		}
	});

	return filePaths;
}, []).sort();

app.get('/api/repo/:repo/files', (req, res) => {
	const repo = req.params.repo;
	axios.get('https://registry.npmjs.org/' + repo).then(response => {

		const lastVersion = getPaths(Object.keys(response.data.versions).slice(-1), response.data.versions);
		const allVersions = getPaths(Object.keys(response.data.versions), response.data.versions);


		res.send({
			allVersions,
			lastVersion
		});
	});
});

// https://registry.npmjs.org/gestalt

// List public for the static assets
app.use(express.static(path.join(__dirname, 'client/build')));

var port = process.env.PORT || 5000;
server.listen(port);
server.on('listening', function() {
  console.log('Express server started on port %s at %s', server.address().port, server.address().address);
});
