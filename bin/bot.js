/* Imports */
var Discord = require('discord.js');
var config = require("../config.json");

var exec = require("./process.js");

var utils = require("./utils.js");
var sql = require('./sqliteClass.js');
var sqlite3 = require('sqlite3').verbose();
require('console-stamp')(console, '[dd/mm/yyyy HH:MM:ss]');

/* Objects */
var Execution = new exec();
var bot = new Discord.Client();
var delay = Date.now();

/* Variables */
var sqldb;
var db;

bot.on("message", function(message){

    /* Ignore the bot's own messages */
    if(message.author == bot.user) return;

    if(config.logs == "true" && sqldb){
        // sqldb.insertUser(message.author.id);
        // sqldb.insertMessage(message);
        if(message.channel.isPrivate) {
            sqldb.insertLogs(message.id, message.author.id, message.content, message.timestamp);
        } else{
            sqldb.insertLogs(message.id, message.author.id, message.content, message.timestamp, message.channel.server.id, message.channel.id, message.channel.name);
        }
    }

    //Try to execute the command
    Execution.execute(message, bot);
});

//When the bot is ready to operate
bot.on("ready", function(){
	console.log('Online! ('+(Date.now()-delay)+'ms)');
});

//JOIN-LEFT EVENTS//
bot.on("serverNewMember", function(server, user){
    console.log(user.username + " joined.")
	bot.sendMessage(server.defaultChannel, "Welcome to "+server.name+", "+user.mention()+"! Don't forget to read the rules.");
});

bot.on("serverMemberRemoved", function(server, user){
    console.log(user.username + " left.")
    bot.sendMessage(server.defaultChannel, "**" + user.username + "** is now gone.");
});

bot.on("serverCreated", function(server){
    //Insert server into DB
    if(config.logs == "true" && sqldb){
        sqldb.insertServer(server.id, server.name);
    }
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
    db = new sqlite3.Database("sqldb.db", function(err, database){
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
