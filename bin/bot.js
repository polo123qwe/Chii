/* Imports */
var Discord = require('discord.js');
var config = require("../config.json");

var exec = require("./process.js");

var utils = require("./utils.js");
var sql = require('./sqliteClass.js');
var sqlite3 = require('sqlite3').verbose();
require('console-stamp')(console, '[dd/mm/yyyy HH:MM:ss]');

var path = require('path');

/* Objects */
var execution;
var options = {
    autoReconnect: true
}
var bot = new Discord.Client(options);
var delay = Date.now();
/* Variables */
var dbPath = path.resolve(__dirname, '../sqlite/sqldb.db');

var sqldb;
var db;

bot.on("message", function(message){

    if(config.logs == "true" && sql && sqldb){
        // sqldb.insertUser(message.author.id);
        // sqldb.insertMessage(message);
        if(message.channel.isPrivate) {
            sqldb.insertLogs(message.id, message.author.id, message.cleanContent, message.timestamp);
        } else{
            sqldb.insertLogs(message.id, message.author.id, message.cleanContent, message.timestamp, message.channel.server.id, message.channel.id, message.channel.name);
        }
    }

    /* Ignore the bot's own messages */
    if(message.author == bot.user) return;

    //Try to execute the command
    if(execution){
        execution.execute(message, bot, sqldb);
    }
});

//When the bot is ready to operate
bot.on("ready", function(){
	console.log('Online! ('+(Date.now()-delay)+'ms)');
    execution = new exec(sqldb);
});

//JOIN-LEFT EVENTS//
bot.on("serverNewMember", function(server, user){
    console.log(user.username + " joined.")
    var rules = server.channels.get("name", "readme");
    if(!rules) rules = server.channels.get("name", "rules");
    if(!rules) {
        bot.sendMessage(server.defaultChannel, "Welcome to "+server.name+", "+user.mention()+"! Don't forget to read the rules.");
    } else {
        bot.sendMessage(server.defaultChannel, "Welcome to "+server.name+", "+user.mention()+"! Don't forget to read the rules." + "<#" + rules.id + ">");
    }

});

bot.on("serverMemberRemoved", function(server, user){
    console.log(user.username + " left.")
    bot.sendMessage(server.defaultChannel, "**" + user.username + "** is now gone.");
});

bot.on("userBanned", function(server, user){
    console.log(user.username + " has been banned.")
    bot.sendMessage(server.defaultChannel, "**" + user.username + "** has been banned.");
});

bot.on("serverCreated", function(server){
    //Insert server into DB
    if(config.logs == "true" && sql && sqldb){
        sqldb.insertServer(server.id, server.name);
        // for(var channel of server.channels){
        //     console.log("Adding " + channel.name);
        //     sqldb.insertChannel(channel.id, channel.name, server.id, channel.type);
        // }
    }
});

bot.on("serverMemberUpdated", function(server, userOld, userNew){
    //TODO log nickname changes
});

bot.on("error", function(err){
    console.err(err);
});

////////////////////
///////LOGIN////////
function login(){
    console.log("Initializing...");
    try{
        bot.loginWithToken(config.token, function(err){
            if(err){
                console.log(err);
            }
        });
    } catch (err){
    	console.log("No token");
    }
}

////////////////////
////////DB//////////
function connectDB(){
    console.log("Connecting to DB...");
    //Connect to the database
    db = new sqlite3.Database(dbPath, function(err, database){
        if(err){
            console.log("Error connecting to the DB "+err.message);
        } else {
            // console.log("Connection to DB sucessful");
            sqldb = new sql(db);
        }
        //Start the bot
        login();
    });
}

////////////////////
connectDB();
// login();
