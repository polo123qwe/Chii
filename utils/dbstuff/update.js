var clog = require('../clog.js');

var pool;

function update(p) {
    //We pass the pool as a parameter
    pool = p;
}

module.exports = update;

update.prototype.update = function(type, args) {
    var query = "";

    switch (type) {
        case "user":
            query = 'UPDATE users SET $1 = $2 WHERE user_id = $3';
            break;
        case "serverTrack": //Update Links column in servers
            query = 'UPDATE servers SET track = $1 WHERE server_id = $2';
            break;
        case "serverRole": //Update Links column in servers
            query = 'UPDATE servers SET memberrole = $1 WHERE server_id = $2';
            break;
        case "serverLinks": //Update Links column in servers
            query = 'UPDATE servers SET links = $1 WHERE server_id = $2';
            break;
    }
    return dbupdate(query, args);

};

function dbupdate(query, args) {
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
