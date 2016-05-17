var Discord = require('discord.js');
var config = require("../config.json");
require('console-stamp')(console, '[dd/mm/yyyy HH:MM:ss]');

var MongoClient = require('mongodb').MongoClient;
var exec = require("./process.js");

var db;

var Execution = new exec();

var bot = new Discord.Client();
var delay = Date.now();

bot.on("message", function(message){

    if(message.author == bot.user) return;

    if(config.logs == "true"){
        //TODO
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
    db.collection('servers').insert({name: server.name, _id: server.id});
});
////////////////////
///////LOGIN////////
function login(){
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
    console.log("Initializing...");
    //Connect to the database
    MongoClient.connect(config.mongodb, function(err, database){
        if(err){
            console.log(err);
        } else {
            console.log("Connection to DB sucessful");
            db = database;
        }
        //Start the bot
        login();
    });
}
////////////////////
connectDB();
// login();
