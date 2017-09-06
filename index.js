var express = require('express');
var path = require('path');
var app = express();
var http = require('http');
var axios = require('axios');
var server = http.createServer(app);
var env = process.env.NODE_ENV || 'development';

const defaultPackages = ['main', 'style', 'module', 'sass'];

function cachingGet (get) {
  const cache = new Map()

  return function cachedGet (url) {
    const key = url

    if (cache.has(key)) {
      return cache.get(key)
    } else {
      const request = get(...arguments)
      cache.set(key, request)
      return request
    }
  }
}

const cachingAxios = axios.create()
cachingAxios.get = cachingGet(cachingAxios.get)

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
	return versions.slice(-20).map(version => {
		return cachingAxios.get('https://unpkg.com/' + repo + '@' + version + '/' + path)
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
app.get('/api/repo/:repo/path/', (req, res) => {
	const repo = req.params.repo;
	const path = req.query.path;
	axios.get('https://registry.npmjs.org/' + repo).then(response => {
		console.log(response);
		var fileSizes = getFilesizes(repo, Object.keys(response.data.versions), path);

		axios.all(fileSizes).then(data => {
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

var port = process.env.PORT || 5000;
server.listen(port);
server.on('listening', function() {
  console.log('Express server started on port %s at %s', server.address().port, server.address().address);
});
