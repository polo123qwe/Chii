var moderationCommands = require("./commands/moderationCommands.js");
var internetDataCommands = require("./commands/internetDataCommands.js");
var infoCommands = require("./commands/infoCommands.js");
var serverDataCommands = require("./commands/serverDataCommands.js");

var perm = require("./commands/permissions.js");
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
		command = command.substring(0, command.length - 1).toLowerCase();

		//Check if there is a command with that name
		if(moderationCommands.hasOwnProperty(command)){
			if(checkPerm(moderationCommands[command], command)){
				moderationCommands[command].run(message, bot);
			}
		} else if(internetDataCommands.hasOwnProperty(command)){
			if(checkPerm(internetDataCommands[command], command)){
				internetDataCommands[command].run(message, bot);
			}
		} else if(infoCommands.hasOwnProperty(command)){
			if(checkPerm(infoCommands[command], command)){
				infoCommands[command].run(message, bot);
			}
		} else if(serverDataCommands.hasOwnProperty(command)){
			if(checkPerm(serverDataCommands[command], command)){
				serverDataCommands[command].run(message, bot);
			}
		}

		//Function to check the permission of a given command
		function checkPerm(cmd, commandText){
			if(message.channel.isPrivate) {
				return true;
			} else {
				//TODO Check BD

				//Check if the command has cooldown
				/* NOTE - This doesn't check if the command has a cooldown per say, that's handled by the method at
				hand, what this does is grab the return value from checkCooldown and store it in a variable ;) */
				var cooldown = utils.checkCooldown(cmd, message.author.id, commandText);

				//If the bot is allowed to execute it
				if(perm.isBotAllowed(cmd, bot, message.channel.server)){
					//If the user is
					if(perm.isUserAllowed(message.author, message.channel.server, cmd.permissions)){
						//If there is no cooldown
						if(cooldown == 0){
							return true;
						} else{
							bot.sendMessage(message, "Command `" + commandText + "` is on cooldown for you. (" + cooldown + " seconds left)");
							return false;
						}
					} else{
						bot.sendMessage(message, "You do not have permission to use this command.");
						return false;
					}
				} else{
					bot.sendMessage(message, "The bot doesn't have permission to use this command.");
					return false;
				}

			}
		}//EndFunct
    },
}
