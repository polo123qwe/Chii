'use strict'
/**
 *	Discord Maid
 */
process.title	= 'Discord Maid'

var Discordie		= require('discordie');
var config			= require('./config.json');
var utilsLoader		= require('./utils/utilsLoader.js');
var commandLoader	= require('./data/commandLoader.js');
var clog			= utilsLoader.clog;
var dbCustom		= utilsLoader.dbstuff.custom;
var dbPerms			= utilsLoader.dbstuff.perms;
var commands		= commandLoader.commandController.Commands;

var Events = Discordie.Events;

var client = new Discordie();

/* Event: Ready */
client.Dispatcher.on(Events.GATEWAY_READY, e => {
	console.log(clog.c.colorGBG(" CHIIBOT is ready to operate ")); /* NOTE - Green is not a creative color */
	var game = {name: "with your feelings"}
	client.User.setStatus("online", game);
});

/* Event: Message */
client.Dispatcher.on(Events.MESSAGE_CREATE, e => {
	/* Suf = message trigger suffix */
	var Suf = config.bot.suffix;

	/* Ignore messages without the suffix */
	if (!(e.message.content.split(" ")[0].slice(-1) == Suf)) {
      return;
    }

	var cmd = e.message.content.split(" ")[0].substring(0, e.message.content.split(" ")[0].length - Suf.length);
	var suffix = e.message.content.substr(cmd.length + Suf.length + 1);

	/* Prevent the bot from responding to itself (infite loops suck) */
	if (e.message.author.client || e.message.author.id === client.User.id) { return }

	/* Help is handled in a different file */
	if (cmd == "help") { /* TODO - helpHandler */ }

	/* Check if the command is valid */
	if (commands[cmd]) {
		if (typeof commands[cmd] !== 'object') { return }

		/* Log command execution to the console */
		clog.logCommand(e.message.guild.name, e.message.author, cmd, suffix);

		/* Owner-only command processing */
		if (commands[cmd].levelReq === 'owner') {
			if (config.permissions.owner.indexOf(e.message.author.id) > -1) {
				try {
					commands[cmd].exec(client, e.message, suffix);
				} catch (er) {
					e.message.channel.sendMessage(':interrobang: There was an error processing the command... \n```' + er + '```');
					clog.logError("COMMAND", er);
				}
			} else {
				e.message.reply(':no_entry_sign: This command is for the bot owner only.').then(function(botMsg, error) {
					setTimeout(() => { botMsg.delete() }, 8000);
				});
			}
		} else if (!e.message.isPrivate) { /* This is only for non-DMs */
			if (utilsLoader.cooldowns.checkCD(client, cmd, e.message.guild.id, e.message) == true) {
				dbPerms.checkPerms(e.message, e.message.author.id, e.message.member.roles).then(function (lvl) {
					if (lvl >= commands[cmd].levelReq) {
						try {
							commands[cmd].exec(client, e.message, suffix);

							/* Check for clean property on commands */
							if (commands[cmd].hasOwnProperty("clean")) {
								if (commands[cmd].clean > 0) {
									setTimeout(() => { e.message.delete() }, (commands[cmd].clean * 1000));
								}
							}
						} catch (cmder) {
							e.message.channel.sendMessage(':warning: An error ocurred while running that command!\n```' + cmder + '```');
							clog.logError("COMMAND", cmder);
						}
					} else {
						e.message.channel.sendMessage(':disappointed: You do not have enough permission to run this command.').then(function (botMsg, error) {
							setTimeout(() => { botMsg.delete() }, 8000);
						});
					}
				}).catch(function (errrr) {
					console.log("Error!\n" + errrr);
				});
			} else {
				return;
			}
		} else { /* This is for commands that are allowed in DMs */
			if (commands[cmd].hasOwnProperty("DM")) {
				if (commands[cmd].DM) {
					try {
						commands[cmd].exec(client, e.message, suffix);
					} catch (cmderr) {
						e.message.channel.sendMessage(':warning: An error ocurred while running that command!\n```' + cmder + '```');
						clog.logError("COMMAND", cmder);
					}
				} else {
					e.message.channel.sendMessage(':warning: This command cannot be used in DMs.');
				}
			} else {
				e.message.channel.sendMessage(':warning: This command cannot be used in DMs.');
			}
		}
	}
});

/* Client Login */
if (config.bot.selfbot && config.bot.email != "" && config.bot.password != "") {
	client.connect({ email: config.bot.email, password: config.bot.password });
} else {
	client.connect({ token: config.bot.token });
}
