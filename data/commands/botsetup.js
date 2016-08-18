var CommandArray = [];
var utilsLoader = require('../../utils/utilsLoader.js');
var clog = utilsLoader.clog;
var utils = utilsLoader.generalUtils;
var db = utilsLoader.db;
var config = require('../../config.json');

var types = ['country', 'bday', 'name'];

CommandArray.setlevel = {
    name: 'setlevel',
    usage: "level @role/role",
    help: "Sets the permission level of a role. Role names are case-sensitive.",
    cooldown: 1,
    levelReq: 3,
    clean: 0,
    exec: function(client, msg, suffix) {
        var suffixArray = suffix.split(" ");
        if (isNaN(suffixArray[0]) || suffixArray[0] < -1 || suffixArray[0] > 3) {
            msg.channel.sendMessage(':warning: Your first parameter **has** to be a number between -1 and 3');
            return;
        }

        if (msg.mention_roles.length === 0) {
            var roleName = suffixArray[1];
            var roleObject = findKey(roleName, msg.guild.roles);

            if (!roleObject) {
                msg.channel.sendMessage(':warning: Role name is invalid!');
                return;
            }

            db.perms.adjustRoleLevel(msg, roleObject.id, suffixArray[0]).then(function() {
                msg.channel.sendMessage(':white_check_mark: Role `' + roleObject.name + '` was successfully set to level **' + suffixArray[0] + '**');
            }).catch(function(err) {
                msg.channel.sendMessage(':warning: Something went wrong! (check console)');
                clog.logError("UPDATE ROLE", err);
            });
        }
    }
}

CommandArray.disable = {
    name: 'disable',
    usage: "[channel]",
    help: "Disables the bot in channel",
    cooldown: 0,
    levelReq: 0,
    clean: 0,
    exec: function(client, msg, suffix) {

        var channel = msg.channel;
        if (suffix) {
            for (var chan of client.Channels.textForGuild(msg.channel.guild)) {
                if (chan.id == suffix || chan.name.toLowerCase() == suffix.toLowerCase()) {
                    channel = chan;
                    break;
                }
            }
        }
        db.fetch.getData("channelConfig", [channel.id]).then(function(query) {
            var disabled = false;
            if (query.rowCount > 0) {
                disabled = !query.rows[0].enabled;
            }

            db.logging.storeChannelDB(channel, disabled).then(function() {
                if (disabled) {
                    msg.channel.sendMessage('Messages enabled in <#' + channel.id + '> successfully');
                } else {
                    msg.channel.sendMessage('Messages disabled in <#' + channel.id + '> successfully');
                }
            }).catch(function(err) {
                console.log(err);
            });
        }).catch(function(err) {
            console.log(err);
        })

    }
}

CommandArray.refresh = {
    name: 'refresh',
    help: "Resets cooldown",
    cooldown: 5,
    levelReq: 2,
    clean: 1,
    exec: function(client, msg, suffix) {
        var lastTimeRan = require('../../utils/cooldowns.js').lastTimeRan;
        var lastTimeRan = {};
    }
}

exports.CommandArray = CommandArray;

/**
 * HELPER FUNCTIONS
 */
function findKey(nameKey, array) {
    for (var i = 0; i < array.length; i++) {
        if (array[i].name === nameKey) {
            return array[i];
        }
    }
}
