'use strict'
/**
 *	ChiiBot
 */
process.title = 'ChiiBot'

var Discordie = require('discordie');
var config = require('./config.json');
var utilsLoader = require('./utils/utilsLoader.js');
var commandLoader = require('./data/commandLoader.js');
var help = utilsLoader.help;
var db = utilsLoader.db;
var utils = utilsLoader.generalUtils;
var clog = utilsLoader.clog;
var commands = commandLoader.commandController.Commands;
require('console-stamp')(console, '[dd/mm/yyyy HH:MM:ss]');

var Events = Discordie.Events;

//Constants
const DELAY = 5000;

var setupTime = Date.now();

var client = new Discordie({
    autoReconnect: true,
});

/* Event: Ready */
client.Dispatcher.on(Events.GATEWAY_READY, e => {

    console.log(clog.c.colorYellow("Connected, loading users..."));
    client.Users.fetchMembers().then(() => {
        console.log(clog.c.colorYellow("..everything ready! " + (Date.now() - setupTime) + "ms"));
    });
    var game = {
        name: "with the world"
    };
    client.User.setStatus("online", game);
    client.uptime = Date.now();

});

/* Event: Message */
client.Dispatcher.on(Events.MESSAGE_CREATE, e => {
    /* Suf = message trigger suffix */
    var suf = config.bot.suffix;
    var m = e.message;

    /* Ignore messages without the suffix */
    if (!(m.content.split(" ")[0].slice(-1) == suf)) {
        return;
    }

    var cmd = m.content.split(" ")[0].substring(0, m.content.split(" ")[0].length - suf.length);
    cmd = cmd.toLowerCase();
    var suffix = m.content.substr(cmd.length + suf.length + 1);

    /* Prevent the bot from responding to itself (infite loops suck) */
    if (m.author.client || m.author.id === client.User.id) {
        return;
    }

    /* Help is handled in a different file */
    if (cmd == "help") {
        help(m, commands, suffix);
    }

    /* Check if the command is valid */
    if (!commands[cmd] || typeof commands[cmd] !== 'object') {
        return;
    }


    if (!m.isPrivate) { /* This is only for non-DMs */
        deleteInviteLinks(m, e);

        db.logging.log("message", [m.id, m.guild.id, m.channel.id, m.author.id, m.content, m.timestamp]).catch(function(err) {
            //console.log(err);
        });

        /*if (!utilsLoader.cooldowns.checkCD(client, cmd, m.guild.id, m)) {
            return;
        }*/

        db.fetch.getData("channelConfig", [m.channel.id]).then(function(query) {
            if (query.rowCount > 0 && !query.rows[0].enabled) return;
			utilsLoader.cooldowns.checkCooldown(commands[cmd], m.guild.id, m.author.id).then(r => {
				if (r === true) {
					db.perms.checkPerms(m, m.author.id, m.member.roles).then(function(lvl) {

		                //Owner skips
		                if (commands[cmd].levelReq === 'owner' && config.permissions.owner.indexOf(m.author.id) == -1) {
		                    m.reply(':no_entry_sign: This command is for the bot owner only.').then(function(botMsg, error) {
		                        setTimeout(() => {
		                            botMsg.delete()
		                        }, DELAY);
		                    });
		                } else if (commands[cmd].levelReq !== 'owner' && lvl < commands[cmd].levelReq) {
		                    m.channel.sendMessage(':disappointed: You do not have enough permission to run this command.').then(function(botMsg, error) {
		                        setTimeout(() => {
		                            botMsg.delete()
		                        }, DELAY);
		                    });
		                } else {
		                    try {
		                        /* Log command execution to the console */
		                        clog.logCommand(m.guild.name, m.author, cmd, suffix);

		                        commands[cmd].exec(client, m, suffix);

		                        /* Check for clean property on commands */
		                        if (commands[cmd].hasOwnProperty("clean")) {
		                            if (commands[cmd].clean > 0) {
		                                setTimeout(() => {
		                                    m.delete()
		                                }, (commands[cmd].clean * 1000));
		                            }
		                        }
		                    } catch (cmder) {
		                        m.channel.sendMessage(':warning: An error ocurred while running that command!\n```' + cmder + '```');
		                        clog.logError("COMMAND", cmder);
		                    }

		                }
		            }).catch(function(errrr) {
		                console.log("Error!\n" + errrr);
		            });
				} else {
					m.channel.sendMessage("This command is on cooldown for **" + parseInt(r) + "** seconds.");
				}
			}).catch(e => console.ere(e));
        });
    } else { /* This is for commands that are allowed in DMs */
        db.logging.log("message", [m.id, null, m.channel.id, m.author.id, m.content, m.timestamp]).catch(function(err) {
            //console.log(err);
        });

        if (!commands[cmd].hasOwnProperty("DM") || !commands[cmd].DM) {
            m.channel.sendMessage(':warning: This command cannot be used in DMs.');
        }
        try {
            clog.logCommand("DM " + m.author.username, m.author, cmd, suffix);

            commands[cmd].exec(client, m, suffix);
        } catch (cmderr) {
            m.channel.sendMessage(':warning: An error ocurred while running that command!\n```' + cmder + '```');
            clog.logError("COMMAND", cmder);
        }
    }
});

//Joined and left events
client.Dispatcher.on(Events.GUILD_MEMBER_ADD, e => {
    db.logging.log("user", [e.member.id, e.member.username, e.member.discriminator, e.member.joined_at, e.guild.id]);

    var rules;
    for (var channel of e.guild.channels) {
        if (channel.name.toLowerCase() == "rules" || channel.name.toLowerCase() == "readme") {
            rules = channel;
            break;
        }
    }
    if (!rules) {
        e.guild.generalChannel.sendMessage("Welcome to " + e.guild.name + ", " + e.member.mention + "! Don't forget to read the rules.");
    } else {
        e.guild.generalChannel.sendMessage("Welcome to " + e.guild.name + ", " + e.member.mention +
            "! Don't forget to read the rules." + " <#" + rules.id + ">");
    }
});

client.Dispatcher.on(Events.GUILD_MEMBER_REMOVE, e => {
    e.guild.generalChannel.sendMessage("**" + e.user.username + "#" + e.user.discriminator + "** is now gone.")
});

client.Dispatcher.on(Events.GUILD_BAN_ADD, e => {});
/////////////////////////////
//Register name changes
client.Dispatcher.on(Events.PRESENCE_MEMBER_INFO_UPDATE, e => {
    if (e.old.username != e.new.username) {
        for (var guild of client.Guilds.toArray()) {
            var channel = client.Channels.find((c) => c.guild == guild && c.name == "log-names");
            if (channel) {
                var user = guild.members.find((m) => m.id == e.old.id);
                if (user) {
                    channel.sendMessage("[" + utils.unixToTime(new Date().getTime()) + "] [Username] " + e.old.username + " -> " + e.new.username);
                }
            }
        }
    }
});

client.Dispatcher.on(Events.GUILD_MEMBER_UPDATE, e => {
    var channel = client.Channels.find((c) => c.guild == e.guild && c.name == "log-names");
    if (channel) {
        if (e.previousNick != e.member.nick) {
            channel.sendMessage("[" + utils.unixToTime(new Date().getTime()) + "] [Nick] " + e.previousNick + " -> " + e.member.nick);
        }
    }
});


/* Client Login */
if (config.bot.selfbot && config.bot.email != "" && config.bot.password != "") {
    client.connect({
        email: config.bot.email,
        password: config.bot.password
    });
} else {
    client.connect({
        token: config.bot.token
    });
}

//Other functions
function deleteInviteLinks(m, e) {
    if (m.content.toLowerCase().includes("discord.gg/")) {
        //Check if the server blocks links
        db.fetch.getData("serverConfig", [m.guild.id]).then(function(query) {
            if (query.rowCount != 0) {
                if (!query.rows[0].links) {
                    //Try to find if the user can post links
                    db.fetch.getData("whitelist", [m.guild.id, m.author.id]).then(function(query2) {
                        if (query2.rowCount == 0) {
                            m.delete().then(function() {
                                console.log("Deleted [" + m.guild.name + "/" + m.channel.name + "] " + m.content);
                            });
                        }
                    });
                }
            }
        });
    }
}
