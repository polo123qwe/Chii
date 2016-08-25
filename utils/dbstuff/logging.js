var clog = require('../clog.js');

var pool;

function logging(p) {
    //We pass the pool as a parameter
    pool = p;
}

module.exports = logging;

logging.prototype.log = function(type, args) {
    var query = "";
    switch (type) {
        case "user":
            query = 'INSERT INTO users (user_id, username, discriminator, joined) VALUES ($1, $2, $3, $4)';
            break;
        case "message":
            query = 'INSERT INTO logs (message_id, server_id, channel_id, user_id, content, timestamp) VALUES ($1, $2, $3, $4, $5, $6)';
            break;
        case "whitelist":
            query = 'INSERT INTO whitelist (server_id, user_id) VALUES ($1, $2)';
            break;
        case "server":
            query = 'INSERT INTO servers (server_id) VALUES ($1)';
            break;
        case "warning":
            if(args.length == 4)
                query = 'INSERT INTO warnings (user_id, server_id, timestamp, type) VALUES ($1, $2, $3, $4)';
            else query = 'INSERT INTO warnings (user_id, server_id, timestamp, type, reason) VALUES ($1, $2, $3, $4, $5)';
            break;
        case "events":
            if(args.length == 3)
                query = 'INSERT INTO events (name, server_id, timestamp) VALUES ($1,$2,$3)';
            else query = 'INSERT INTO events (name, server_id, timestamp, desc) VALUES ($1,$2,$3,$4)';
            break;
        case "eventuser":
            query = 'INSERT INTO eventusers (user_id, event, server_id, timestamp) VALUES ($1,$2,$3,$4)';
            break;
    }
    return dbinsert(query, args);

};

function dbinsert(query, args) {
    return new Promise(function(resolve, reject) {
        pool.connect(function(err, dbClient, done) {
            if (err) {
                clog.logError("DATABASE", err);
                done();
                return;
            }
            dbClient.query(query, args, function(err) {
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
