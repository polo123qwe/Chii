"use strict";
var lastTimeRan = {};
var config = require('../config.json');

exports.checkCooldown = function (cmd, serverID, userID) {
	return new Promise ((resolve, reject) => {
		if (cmd === null) {
			console.log("ERROR: Invalid command passed as argument for checkCooldown.");
			return reject("INVALID COMMAND");
		}

		if (config.permissions.owner.indexOf(userID) > -1) {
			return resolve(true);
		}

		let result = true;

		if (cmd.hasOwnProperty("cooldown") && cmd.cooldown > 0) {
			if (lastTimeRan.hasOwnProperty(serverID) && lastTimeRan[serverID].hasOwnProperty(cmd.name)) {
				if (lastTimeRan[serverID][cmd.name].hasOwnProperty(userID)) {
					let timeNow = new Date();
					let lastExec = new Date(lastTimeRan[serverID][cmd.name][userID]);

					lastExec.setSeconds(lastExec.getSeconds() + cmd.cooldown);

					if (timeNow < lastExec) {
						result = (lastExec - timeNow) / 1000;
					} else {
						lastTimeRan[serverID][cmd.name][userID] = new Date();
					}
				} else {
					lastTimeRan[serverID][cmd.name][userID] = new Date();
				}
			} else {
				lastTimeRan[serverID] = {};
				lastTimeRan[serverID][cmd.name] = {};
				lastTimeRan[serverID][cmd.name][userID] = new Date();
			}
		}
		return resolve(result);
	});
}

exports.checkCD = function(client, cmd, server, msg) {
    if (cmd == null) {
        msg.channel.sendMessage(msg, ':warning: There was an error processing the command. Try again.').then(function(botMsg, error) {
            setTimeout(() => {
                botMsg.delete()
            }, 5000);
        });
        return;
    } else {
        /* If user is master, he can run the command */
        if (config.permissions.owner.indexOf(msg.author.id) > -1) {
            return true
        }

        if (cmd.hasOwnProperty("cooldown") && cmd.cooldown > 0) {

            if (!lastTimeRan.hasOwnProperty(server)) {
                lastTimeRan[server] = {};
            }

            if (!lastTimeRan.hasOwnProperty(cmd)) {
                lastTimeRan[server][cmd] = {};
            }

            if (!lastTimeRan[server][cmd].hasOwnProperty(msg.author.id)) {
                lastTimeRan[server][cmd][msg.author.id] = new Date().valueOf();
            } else {
                var now = Date.now();
                if (now < (lastTimeRan[server][cmd][msg.author.id] + (cmd.cooldown * 1000))) {
                    msg.reply('That command is on cooldown for: ***' + Math.round(((lastTimeRan[server][cmd][msg.author.id] + cmd.cooldown * 1000) - now) / 1000) + '*** seconds.');
                    return false;
                }
                lastTimeRan[server][cmd][msg.author.id] = now;
            }
        }
        return true;
    }
}
