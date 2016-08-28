var clog = require('../clog.js');

var del;

function del(p) {
    //We pass the pool as a parameter
    pool = p;
}

module.exports = del;

del.prototype.rows = function(type, args) {
    var query = "";

    switch (type) {
        case "event":
            query = 'DELETE FROM events WHERE name = $1 AND server_id = $2';
            break;
        case "eventuser":
            query = 'DELETE FROM eventusers WHERE user_id = $1 AND event = $2 AND server_id = $3';
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
