var clog = require('../clog.js');

var pool;

function fetch(p) {
    //We pass the pool as a parameter
    pool = p;
}

module.exports = fetch;

fetch.prototype.getData = function(type, args) {
    var query = "";

    switch (type) {
        case "channelConfig":
            query = 'SELECT * FROM channels WHERE channel_id = $1';
            break;
        case "serverConfig":
            query = 'SELECT * FROM servers WHERE server_id = $1';
            break;
        case "logs":
            query = 'SELECT * FROM logs WHERE server_id = $1 and channel_id = $2 and timestamp > to_timestamp($3)';
            break;
        case "whitelist":
            query = 'SELECT * FROM whitelist WHERE server_id = $1 AND user_id = $2';
            break;
        case "events":
            query = 'SELECT * FROM events WHERE server_id = $1 AND user_id = $2';
            break;
        case "eventuser":
            if(args.length == 2)
                query = 'SELECT * FROM eventusers WHERE server_id = $1 AND user_id = $2';
            else query = 'SELECT * FROM eventusers WHERE server_id = $1 AND user_id = $2 AND event = $3';
            break;
    }
    return dbrequest(query, args);

};

function dbrequest(query, args){
    return new Promise(function(resolve, reject) {
        pool.connect(function(err, dbClient, done) {
            if (err) {
                clog.logError("DATABASE", err);
                done();
                return;
            }
            dbClient.query(query, args, function(err, result) {
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
