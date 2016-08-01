var pool;

function fetch(p){
	//We pass the pool as a parameter
	pool = p;
}

module.exports = fetch;

fetch.prototype.getChannelConfig = function (channel) {
	return new Promise (function (resolve, reject) {
		pool.connect(function (err, dbClient, done) {
			if (err) {
				clog.logError("DATABASE", err);
				done();
				return;
			}

			dbClient.query('SELECT * FROM channels WHERE channel_id = $1',
                    [channel], function (err, result) {
				if (err) {
					done();
					return reject(err);
				}
				done();
				return resolve(result);
			});

		});
	});
}

fetch.prototype.getServerConfig = function (server) {
	return new Promise (function (resolve, reject) {
		pool.connect(function (err, dbClient, done) {
			if (err) {
				clog.logError("DATABASE", err);
				done();
				return;
			}

			dbClient.query('SELECT * FROM servers WHERE server_id = $1',
                    [server], function (err, result) {
				if (err) {
					done();
					return reject(err);
				}
				done();
				return resolve(result);
			});

		});
	});
}
