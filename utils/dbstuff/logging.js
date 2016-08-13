var clog = require('../clog.js');

var pool;

function logging(p) {
    //We pass the pool as a parameter
    pool = p;
}

module.exports = logging;

logging.prototype.storeUserDB = function(user) {
    return new Promise(function(resolve, reject) {
        pool.connect(function(err, dbClient, done) {
            if (err) {
                clog.logError("DATABASE", err);
                done();
                return;
            }

            dbClient.query('INSERT INTO users (user_id, username, discriminator, joined) VALUES ($1, $2, $3, $4)', [user.id, user.username, user.discriminator, user.joined_at], function(err) {
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

logging.prototype.storeMessageDB = function(msgObject) {
    return new Promise(function(resolve, reject) {
        pool.connect(function(err, dbClient, done) {
            if (err) {
                clog.logError("DATABASE", err);
                done();
                return;
            }
            var guild = null;
            if(msgObject.guild){
                guild = msgObject.guild.id;
            }
            dbClient.query('INSERT INTO logs (message_id, server_id, channel_id, user_id, content, timestamp) VALUES ($1, $2, $3, $4, $5, $6)',
                            [msgObject.id, guild, msgObject.channel.id, msgObject.author.id, msgObject.content, msgObject.timestamp], function(err) {
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

logging.prototype.storeChannelDB = function(channel, status) {
        return new Promise(function(resolve, reject) {
            pool.connect(function(err, dbClient, done) {
                if (err) {
                    clog.logError("DATABASE", err);
                    done();
                    return;
                }
                dbClient.query('INSERT INTO channels (channel_id, server_id, enabled) VALUES ($1, $2, $3)', [channel.id, channel.guild.id, status], function(err) {
                    if (err) {
                        done();
                        dbClient.query('UPDATE channels SET enabled = $1 WHERE channel_id = $2', [status, channel.id], function(er) {
                            if (er) {
                                done();
                                return reject(er);
                            } else {
                                done();
                                return resolve();
                            }
                        });
                    } else {
                        done();
                        return resolve();
                    }
                });
            });
        });
    }
    //Update the current data of a user
logging.prototype.updateUser = function(user, column, value) {
    //If the value is null it means we will increase the current one
}
