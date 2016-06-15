var moderationCommands = require("./commands/moderationCommands.js");
var internetDataCommands = require("./commands/internetDataCommands.js");
var infoCommands = require("./commands/infoCommands.js");
var serverDataCommands = require("./commands/serverDataCommands.js");

var perm = require("./commands/permissions.js");
var utils = require("./utils.js");

module.exports = Execution;

function Execution(){
}

Execution.prototype = {
	constructor: Execution,
    execute: function(message, bot, sqldb){

    var cMessage = message.content;
		var command = cMessage.split(" ")[0];

		if(!command) return;

		if(command.slice(-1) != "!") return;
		//Remove suffix
		command = command.substring(0, command.length - 1).toLowerCase();

		/* Help */
		if (command.startsWith("help")) {

			var suffix = message.content.substring(command.length + 2, message.content.length).toLowerCase();

			/* If there's no suffix, just send a DM with the mo'fucking GitHub */
			if (!suffix) {
				bot.sendMessage(message.author, "***Chii Bot*** - Help\n" +
			"To get the full list of commands, please visit: **https://github.com/polo123qwe/Chii**\n" +
			"If you want help on a specific command, please use `help! [command]` in a text channel to view it.\n" +
			"`Note:` The `help!` command won't work in DMs.");
			return;
			}

			if (!message.channel.isPrivate) {
				if (moderationCommands.hasOwnProperty(suffix)) {
					bot.sendMessage(message, moderationCommands[suffix].help);
					return;
				} else if (internetDataCommands.hasOwnProperty(suffix)) {
					bot.sendMessage(message, internetDataCommands[suffix].help);
					return;
				} else if (infoCommands.hasOwnProperty(suffix)) {
					bot.sendMessage(message, infoCommands[suffix].help);
					return;
				} else if (serverDataCommands.hasOwnProperty(suffix)) {
					bot.sendMessage(message, serverDataCommands[suffix].help);
					return;
				} else {
					bot.sendMessage(message, ":warning: The command `" + suffix + "` was not found, or it doesn't have a help property.");
					return;
				}
			} else {
				bot.sendMessage(message, ":warning: The `help! [command]` does not work in DMs. Sorry :(");
				return;
			}


		}

		//Check if there is a command with that name
		if(moderationCommands.hasOwnProperty(command)){
			if(checkPerm(moderationCommands[command], command)){
				moderationCommands[command].run(message, bot);
				/* Clean - It cleans the message that triggered the command */
				if (moderationCommands[command].hasOwnProperty(clean)) {
					bot.deleteMessage(message, {"wait": moderationCommands[command].clean * 1000}); // NOTE - Please specify the clean time in SECONDS!!!
				}
			}
		} else if(internetDataCommands.hasOwnProperty(command)){
			if(checkPerm(internetDataCommands[command], command)){
				internetDataCommands[command].run(message, bot);
				/* Clean - It cleans the message that triggered the command */
				if (internetDataCommands[command].hasOwnProperty(clean)) {
					bot.deleteMessage(message, {"wait": internetDataCommands[command].clean * 1000}); // NOTE - Please specify the clean time in SECONDS!!!
				}
			}
		} else if(infoCommands.hasOwnProperty(command)){
			if(checkPerm(infoCommands[command], command)){
				infoCommands[command].run(message, bot);
				/* Clean - It cleans the message that triggered the command */
				if (infoCommands[command].hasOwnProperty(clean)) {
					bot.deleteMessage(message, {"wait": infoCommands[command].clean * 1000}); // NOTE - Please specify the clean time in SECONDS!!!
				}
			}
		} else if(serverDataCommands.hasOwnProperty(command)){
			if(checkPerm(serverDataCommands[command], command)){
				serverDataCommands[command].run(message, bot, sqldb);
				/* Clean - It cleans the message that triggered the command */
				if (serverDataCommands[command].hasOwnProperty(clean)) {
					bot.deleteMessage(message, {"wait": serverDataCommands[command].clean * 1000}); // NOTE - Please specify the clean time in SECONDS!!!
				}
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
