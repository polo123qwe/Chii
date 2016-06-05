var sqlite3 = require('sqlite3').verbose();

var database;

module.exports = SQLite;

function SQLite(db){
    database = db;
}
SQLite.prototype = {
    constructor: SQLite,

    insertServer: function(serverID, name){
        database.run("INSERT INTO Servers VALUES (?, ?)", [serverID, name], function(err){});
    },

    insertLogs: function(message_id, user_id, content, timestamp, server_id, channel_id, channel_name){
        database.run("INSERT INTO Logs VALUES (?, ?, ?, ?, ?, ?, ?)", [message_id, user_id, content, timestamp, server_id, channel_id, channel_name], function(err){});
    },

    //TODO Do commands to fetch the data

}
