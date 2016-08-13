var clog = require('../clog.js');

var pool;

function fetch(p) {
    //We pass the pool as a parameter
    pool = p;
}

module.exports = fetch;

fetch.prototype.getChannelConfig = function(channel) {
    return new Promise(function(resolve, reject) {
        pool.connect(function(err, dbClient, done) {
            if (err) {
                clog.logError("DATABASE", err);
                done();
                return;
            }

            dbClient.query('SELECT * FROM channels WHERE channel_id = $1', [channel], function(err, result) {
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

fetch.prototype.getServerConfig = function(server_id) {
        return new Promise(function(resolve, reject) {
            pool.connect(function(err, dbClient, done) {
                if (err) {
                    clog.logError("DATABASE", err);
                    done();
                    return;
                }

                dbClient.query('SELECT * FROM servers WHERE server_id = $1', [server_id], function(err, result) {
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
    //message_id, server_id, channel_id, user_id, content, timestamp
fetch.prototype.getLogs = function(server_id, channel_id, time) {
    var offset = Date.now() - time * 1000;
    return new Promise(function(resolve, reject) {
        pool.connect(function(err, dbClient, done) {
            if (err) {
                clog.logError("DATABASE", err);
                done();
                return;
            }

            dbClient.query('SELECT * FROM logs WHERE server_id = $1 and channel_id = $2 and timestamp > to_timestamp($3)', [server_id, channel_id, offset / 1000], function(err, result) {
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
