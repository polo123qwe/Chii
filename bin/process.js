var mCommands = require("./commands/mCommands.js");
var fCommands = require("./commands/fCommands.js");
var iCommands = require("./commands/iCommands.js");
var dCommands = require("./commands/dCommands.js");

var perm = require("./commands/permissions.js");
var mdb = require("./mongodb.js");

module.exports = Execution;

function Execution(message, bot){
}

Execution.prototype = {
	constructor: Execution,
    execute: function(message, bot){

		//Send the message to logging to log it
		//TODO

		// mdb.find(message.channel.server.id, "name");

        var cMessage = message.content;
		var command = cMessage.split(" ")[0];

		if(!command) return;

		if(command.slice(-1) != "!") return;
		//Remove suffix
		command = command.substring(0, command.length-1);
		command = command.toLowerCase();

		//Check if there is a command with that name
		if(mCommands.hasOwnProperty(command)){
			if(checkPerm(mCommands[command])){
				mCommands[command].run(message, bot);
			}
		} else if(fCommands.hasOwnProperty(command)){
			if(checkPerm(fCommands[command])){
				fCommands[command].run(message, bot);
			}
		} else if(iCommands.hasOwnProperty(command)){
			if(checkPerm(iCommands[command])){
				iCommands[command].run(message, bot);
			}
		} else if(dCommands.hasOwnProperty(command)){
			if(checkPerm(dCommands[command])){
				dCommands[command].run(message, bot);
			}
		}

		//Function to check the permission of a given command
		function checkPerm(cmd){
			if(message.channel.isPrivate) return true;
			else{
				//TODO Check BD

				//If the bot is allowed to execute it
				if(perm.isBotAllowed(cmd, bot, message.channel.server)){
					//If the user is
					if(perm.isUserAllowed(message.author, message.channel.server, cmd.permissions)){
						return true;
					}else{
						bot.sendMessage(message, "Access denied.");
						return false;
					}
				}else{
					bot.sendMessage(message, "Bot is not allowed to do that.");
					return false;
				}
			}
		}//EndFunct
    },
}
