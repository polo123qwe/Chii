var pool;

function logging(p){
	//We pass the pool as a parameter
	pool = p;
}

module.exports = logging;

logging.prototype.storeUserDB = function (user) {
	return new Promise (function (resolve, reject) {
		pool.connect(function (err, dbClient, done) {
			if (err) {
				clog.logError("DATABASE", err);
				done();
				return;
			}

			dbClient.query('INSERT INTO users (user_id, username, discriminator, joined) VALUES ($1, $2, $3, $4)',
                    [user.id, user.username, user.discriminator, user.joined_at], function (err) {
				if (err) {
					done();
					return reject(err);
				}
				done();
				return resolve();
			});

		});
	});
}

logging.prototype.storeMessageDB = function (msgObject) {
	return new Promise (function (resolve, reject) {
		console.log(pool)
		pool.connect(function (err, dbClient, done) {
			if (err) {
				clog.logError("DATABASE", err);
				done();
				return;
			}

			dbClient.query('INSERT INTO logs (message_id, server_id, channel_id, user_id, content, timestamp) VALUES ($1, $2, $3, $4, $5, $6)',
                    [msgObject.id, msgObject.guild.id, msgObject.channel.id, msgObject.author.id, msgObject.content, msgObject.timestamp], function (err) {
				if (err) {
					done();
					return reject(err);
				}
				done();
				return resolve();
			});
		});
	});
}
