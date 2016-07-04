/**
 * PROCESS
 */
var moderationCommands 		= require("./commands/moderationCommands.js");
var internetDataCommands 	= require("./commands/internetDataCommands.js");
var infoCommands					= require("./commands/infoCommands.js");
var serverDataCommands		= require("./commands/serverDataCommands.js");
var funCommands 					= require("./commands/funCommands.js");

/* Assign commands to a single Object, so we can more easily manage them */
AllCommands = {}
Object.assign(AllCommands, moderationCommands, internetDataCommands, infoCommands, serverDataCommands, funCommands);

/* Import some useful stuffs */
var suffix					= require("../config.json").suffix;
var permissionUtils = require("./commands/permissions.js");
var utils						= require("./utils.js");

/* Cooldown system - Reset each hour */
var lastTimeRan = {};
setInterval(function() {
  lastTimeRan = {};
}, 3600000);

/* Export */
module.exports = runCommand;

/* Database status check */
function runCommand(sqldb) {
	funCommands.getStatus(sqldb);
}

/* Prototype of runCommand */
runCommand.prototype = {
	constructor: runCommand,
	exec: function(msg, bot, commandText, sqldb) {

		/* Send the help to an external handler */
		if (commandText == "help") {
			helpHandler(msg, bot, commandText);
		}

    commandText = commandText.toLowerCase();
    /* Check the existence of the command */
		if (AllCommands.hasOwnProperty(commandText)) {
			/* Check if the bot has enough permissions to run it */
			if (permissionUtils.isBotAllowed(AllCommands[commandText], bot, msg.channel.server)) {
				/* Check if the User executing it has enough permissions to run it */
				if (permissionUtils.isUserAllowed(msg.author, msg.channel.server, AllCommands[commandText].permissions)) {

					var commandObject = AllCommands[commandText] /* A sort of Macro to not have to write all that shit all over */

					/* If, for some reason, the command is empty, we return an error. This is just to be sure, though */
					if (commandObject == null) { console.log("ERROR: Command " + commandText + " is NULL."); return; }
					else {
						if (commandObject.hasOwnProperty("cd") && commandObject.cd > 0) {
							if (!lastTimeRan.hasOwnProperty(commandText)) {
								lastTimeRan[commandText] = {};
							}

							if (!lastTimeRan[commandText].hasOwnProperty(msg.author.id)) {
								lastTimeRan[commandText][msg.author.id] = new Date().valueOf();
							} else {
								var now = Date.now();

								if (now < (lastTimeRan[commandText][msg.author.id] + (commandObject.cd))) {
				          bot.reply(msg, "that command is on cooldown for: ***" + Math.round(((lastTimeRan[commandText][msg.author.id] + commandObject.cd) - now) / 1000) + "*** seconds.", (err, bm) => {
										bot.deleteMessage(bm, {"wait": 6000});
									});
				          return;
				        }

								lastTimeRan[commandText][msg.author.id] = now;
							}
						}

						/* Log the use of commands in the console for safekeeping */
						/* NOTE - @Sergi if you want you can add a DB thingy */
						console.log(msg.channel.server.name + " > User [" + msg.author.username + "] ran command [" + commandText + "]");

						/* Standard try-catch */
						try {
							commandObject.run(msg, bot, sqldb);

							/* Clean triggering command message */
							if (commandObject.hasOwnProperty("clean")) {
								bot.deleteMessage(msg, {"wait": commandObject.clean});
							}
						} catch (error) {
							console.log(error);
						}

					}

				} else { /* If the user doesn't have enough permissions */
					bot.sendMessage(msg, ":warning: You do not have enough permissions to run this command.", (err, bm) => { bot.deleteMessage(bm, {"wait": 10000}) });
				}
			} else { /* If the bot doesn't have enough permissions */
				bot.sendMessage(msg, ":warning: The bot doesn't have enough permissions to run this command.", (err, bm) => { bot.deleteMessage(bm, {"wait": 10000}) })
			}
		} else { /* If no command was found with that name */
			return;
		}

	}
}

/* Help Handler */
function helpHandler(message, bot, command){
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
		if (AllCommands.hasOwnProperty(suffix)) {
			bot.sendMessage(message, AllCommands[suffix].help);
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

/* This method is to be invoked when the command doesn't execute, to reset the cooldown */
exports.resetCooldown = function(userID, commandText) {
    lastTimeRan[commandText][userID] = {};
}

exports.hardResetCooldown = function(){
    lastTimeRan = {};
}
