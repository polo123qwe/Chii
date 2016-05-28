var moderationCommands = require("./commands/moderationCommands.js");
var internetDataCommands = require("./commands/internetDataCommands.js");
var infoCommands = require("./commands/infoCommands.js");
var serverDataCommands = require("./commands/serverDataCommands.js");

var perm = require("./commands/permissions.js");
var mdb = require("./mongodb.js");
var utils = require("./utils.js");

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
		if(moderationCommands.hasOwnProperty(command)){
			if(checkPerm(moderationCommands[command])){
				moderationCommands[command].run(message, bot);
			}
		} else if(internetDataCommands.hasOwnProperty(command)){
			if(checkPerm(internetDataCommands[command])){
				internetDataCommands[command].run(message, bot);
			}
		} else if(infoCommands.hasOwnProperty(command)){
			if(checkPerm(infoCommands[command])){
				infoCommands[command].run(message, bot);
			}
		} else if(serverDataCommands.hasOwnProperty(command)){
			if(checkPerm(serverDataCommands[command])){
				serverDataCommands[command].run(message, bot);
			}
		}

		//Function to check the permission of a given command
		function checkPerm(cmd){
			if(message.channel.isPrivate) return true;
			else{
				//TODO Check BD

				//Check if the command has cooldown
				var cooldown = utils.checkCooldown(cmd, message.author.id);
					//If the bot is allowed to execute it
					if(perm.isBotAllowed(cmd, bot, message.channel.server)){
						//If the user is
						if(perm.isUserAllowed(message.author, message.channel.server, cmd.permissions)){
							//If there is no cooldown
							if(cooldown == -1){
								return true;
							} else{
								bot.sendMessage(message, "You are on cooldown. (" + cooldown + "s)");
								return false;
							}
						} else{
							bot.sendMessage(message, "Access denied.");
							return false;
						}
					} else{
						bot.sendMessage(message, "Bot is not allowed to do that.");
						return false;
					}

			}
		}//EndFunct
    },
}
