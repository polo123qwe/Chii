var clog = require('../clog.js');
var squel = require("squel");

var dbtables = require('./dbtables.json');

var pool;

function dbaccess(p) {
    //We pass the pool as a parameter
    pool = p;
}

module.exports = dbaccess;

//Import the exising tables in the DB from the json
var tables = dbtables;

//method <string>, table <string>, params <number or array>, args <array>,
//setKV set with key, value (Always send params when using setKV)
dbaccess.prototype.run = function(method, table, args, params, setKV) {
    //Query builder
    var q;
    method = method.toUpperCase();
    table = table.toLowerCase();

    //Check if the table exists
    if (!tables.hasOwnProperty(table)) {
        //ERROR table with that name does not exist
        return Promise.reject("ERROR table with that name does not exist");
    }

    //Choose the appropiate sql query
    if (method == "SELECT") {
        q = squel.select().from(table);
        //Add the where clause
        buildWhere();
        if (tables[table].columns.includes("timestamp")) {
            q.order("timestamp", false);
        }
    } else if (method == "INSERT") {
        q = squel.insert().into(table);

        var colArray = getColArray();

        for (var i = 0; i < colArray.length; i++) {
            //Add the query conditions
            q.set(colArray[i], args[i]);
        }
    } else if (method == "UPDATE") {
        q = squel.update().table(table);
        if (setKV && setKV.length == 2) {
            //Check that the Key(column) we want
            if (tables[table].columns.includes(setKV[0].toLowerCase())) {
                q.set(setKV[0], setKV[1]);
            } else {
                //ERROR not a column
                return Promise.reject("ERROR not a column");
            }
        } else {
            //ERROR setKV is wrong
            return Promise.reject("ERROR setKV is wrong");
        }
        buildWhere();
    } else if (method == "DELETE") {
        q = squel.delete().from(table);

        buildWhere();
    } else {
        //ERROR not a sql query
        return Promise.reject("ERROR not a sql query");
    }

    function buildWhere() {
        //Params either contains a number or array of strings
        var colArray = getColArray();
        for (var i = 0; i < colArray.length; i++) {
            if(colArray[i] == "timestamp"){
                q.where(colArray[i] + " > to_timestamp(" + args[i] + ")");
            } else {
                //Add the query conditions
                q.where(colArray[i] + " = '" + args[i] + "'");
            }

        }
    }

    //Function to get the array of parameters
    function getColArray() {
        if (params) {
            return params;
        } else {
            if (args) {
                if (tables[table].argsAllowed.includes(args.length)) {
                    return tables[table].columns.splice(0, args.length);
                } else {
                    console.log(tables[table].argsAllowed + " " + args);
                    //ERROR you cant do that query with those args
                    return Promise.reject("ERROR you cant do that query with those args");
                }
            } else {
                //Empty array if there is no args supplied
                return [];
            }
        }

    }

    //Stringify the query and process it in the db
    var query = q.toString();
    //console.log(query);
    return dbquery(query);
};

function dbquery(query) {
    return new Promise(function(resolve, reject) {
        pool.connect(function(err, dbClient, done) {
            if (err) {
                clog.logError("DATABASE", err);
                done();
                return;
            }
            dbClient.query(query, function(err, res) {
                if (err) {
                    done();
                    return reject(err);
                }
                done();
                return resolve(res);
            });
        });
    });
}

/*
 * DATA STRUCTURE FOR EACH TABLE:
 *
 * channels:
 * - "channel_id" TEXT
 * - "server_id" TEXT
 * - "enabled" BOOLEAN NULL (Default true)
 *
 * events:
 * - "name" TEXT
 * - "server_id" TEXT
 * - "timestamp" TIMESTAMP NULL
 * - "desc" TEXT NULL
 *
 * eventusers:
 * - "user_id" TEXT
 * - "event" TEXT
 * - "server_id" TEXT NULL
 * - "timestamp" TIMESTAMP NULL
 *
 * logs:
 * - "message_id" TEXT
 * - "server_id" TEXT NULL
 * - "channel_id" TEXT
 * - "user_id" TEXT
 * - "content" TEXT
 * - "timestamp" TIMESTAMP
 *
 * permissions:
 * - "server_id" TEXT
 * - "role_id" TEXT
 * - "perm_level" INTEGER
 *
 * servers:
 * - "server_id" TEXT
 * - "track" BOOLEAN
 * - "memberrole" TEXT NULL (Default "member")
 * - "links" BOOLEAN (Default true)
 *
 * users:
 * - "user_id" TEXT
 * - "username" TEXT
 * - "discriminator" TEXT
 * - "joined" TIMESTAMP
 * - "server_id" TEXT
 *
 * usersdata:
 * - "user_id" TEXT
 * - "country" TEXT NULL
 * - "bday" TEXT NULL
 * - "description" TEXT NULL
 * - "name" TEXT NULL
 *
 * warnings:
 * - "user_id" TEXT
 * - "server_id" TEXT
 * - "timestamp" TIMESTAMP
 * - "type" TEXT
 * - "reason" TEXT NULL
 *
 * whitelist:
 * - "server_id" TEXT
 * - "user_id" TEXT
 */
