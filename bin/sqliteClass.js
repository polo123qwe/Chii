var sqlite3 = require('sqlite3').verbose();
var utils = require('./utils.js');

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
    getChannelLog: function(channel_id, amount, author, bot){
        var result = [];
        if (amount > 5000) amount = 5000;
        database.all("SELECT * FROM Logs WHERE channel_id = ? ORDER BY timestamp DESC LIMIT ?", [channel_id, amount], function(err, rows){
            if(!err){
                //Generate the string
                if(!rows.length) return;
                result.push("Last " + amount + " messages in " + rows[0].channel_name);
                for(var row of rows){
                    //Get the current username of the user who sent the message
                    var username;
                    var user = bot.users.get("id", row.user_id);
                    //if the user is no longer available to retrieve
                    if(!user) username = "#MISSINGNAME#";
                    else username = user.name;

                    result.push("["+utils.unixToTime(Math.floor(row.timestamp)) + "] [" + username + "] " + row.content);
                }

                utils.generateHasteBin(result.join("\n"), function(hastebinLink){
                    var output = "The log can be found at: \n" + hastebinLink;
                    bot.sendMessage(author, output);
                });
            }
        })
    },

    getFilteredChannelLog: function(channel_id, amount, user_id, author, bot){
        var result = [];
        if (amount > 5000) amount = 5000;
        database.all("SELECT * FROM Logs WHERE channel_id = ? AND user_id = ? ORDER BY timestamp DESC LIMIT ?", [channel_id, user_id, amount], function(err, rows){
            if(!err){
                //Generate the string
                if(!rows.length) return;
                result.push("Last " + amount + " messages in " + rows[0].channel_name);
                for(var row of rows){
                    //Get the current username of the user who sent the message
                    var username;
                    var user = bot.users.get("id", row.user_id);
                    //if the user is no longer available to retrieve
                    if(!user) username = "#MISSINGNAME#";
                    else username = user.name;

                    result.push("["+utils.unixToTime(Math.floor(row.timestamp)) + "] [" + username + "] " + row.content);
                }

                utils.generateHasteBin(result.join("\n"), function(hastebinLink){
                    var output = "The log can be found at: \n" + hastebinLink;
                    bot.sendMessage(author, output);
                });
            }
        });
    },

    getStatsChannels(amount, server, author, bot){
        var result = [];
        if(!amount) amount = 24;
        var time = Date.now() - amount*3600*1000;
        var channels = server.channels;
        result.push("```Usage of channels:");
        database.all("SELECT count(*) as num, channel_id FROM Logs WHERE server_id = ? AND timestamp > ? GROUP BY channel_id ORDER BY timestamp DESC", [server.id, time], function(err, rows){
            if(!err){
                if(!rows.length) return;
                var total = 0;
                for(var row of rows){
                    total += row.num;
                }
                result.push(total + " messages in the last" + amount + "hrs");
                for(var row of rows){
                    var chan = channels.get("id", row.channel_id);
                    var channel_name = "#MISSINGCHANNEL#";
                    if(chan) channel_name = chan.name;
                    result.push(((row.num/total)*100).toFixed(2) + "% in " + channel_name);
                }
                bot.sendMessage(author, result.join("\n") + "```");
            }
        });
    },

}
