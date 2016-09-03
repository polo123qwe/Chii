var CommandArray = [];
var utilsLoader = require('../../utils/utilsLoader.js');
var clog = utilsLoader.clog;
var utils = utilsLoader.generalUtils;
var db = utilsLoader.db;
//Array with all colors
var colors = require('../../colors.json').colors;
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
    levelReq: 2,
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

CommandArray.rolesetup = {
    name: 'roleSetup',
    help: "Set the roles",
    cooldown: 5,
    levelReq: 3,
    clean: 1,
    exec: function(client, msg, suffix) {
        var guild = msg.channel.guild;
        var user = msg.author;
        var counterA = 0,
            counterB = 0;

        var rolesToRemove = [];

        for (var role of guild.roles) {
            if (role.name.startsWith("#") && role.name.length == 7 &&
                !colors.includes(role.name.toLowerCase())) {
                rolesToRemove.push(role);
            }
        }

        msg.channel.sendMessage("Starting role creation/update...").then(updmsg => {
            //Check roles we have to delete

            //Add the roles needed
            processColor(0, colors, updmsg);
        });

        function processColor(i, arr, updmsg) {
            if (i >= arr.length) {
                updmsg.edit(counterA + " roles created! Deleting roles...").then((m) => {
                    setTimeout(() => {
                        deleteColors(0, rolesToRemove, updmsg);
                    }, 1000)
                }).catch(e => console.log(e));
            } else {
                for (var role of guild.roles) {
                    if (role.name == arr[i]) {
                        return processColor(i + 1, arr, updmsg);
                    }
                }
                setTimeout(() => {
                    guild.createRole().then(role => {
                        counterA++;
                        //Make the role empty
                        var perms = role.permissions;
                        for (var x in perms.General) {
                            perms.General[x] = false;
                        }
                        for (var x in perms.Text) {
                            perms.Text[x] = false;
                        }
                        for (var x in perms.Voice) {
                            perms.Voice[x] = false;
                        }

                        var newRoleName = arr[i];

                        var color = arr[i].substr(1, arr[i].length);
                        var hexColor = parseInt("0x" + color);

                        role.commit(newRoleName, hexColor, false, false).then(() => {
                            updmsg.edit(newRoleName + " created successfully! " + counterA + " roles created.");
                            processColor(i + 1, arr, updmsg);
                        });
                    }).catch(err => console.log("Failed to create role: ", err));
                }, 1000);
            }
        }

        function deleteColors(i, arr, updmsg) {
            if (i >= arr.length) {
                updmsg.edit("Finished! " + counterB + " roles deleted.").then((m) => {
                    setTimeout(() => m.delete(), 3000)
                });
            } else {
                setTimeout(() => {
                    arr[i].delete().then(() => {
                        counterB++;
                        updmsg.edit(counterB + " roles deleted.");
                        deleteColors(i + 1, arr, updmsg);
                    }).catch(err => console.log("Failed to remove role: ", err));
                }, 1000);
            }
        }
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

/*SAVED FOR LATER USER(?)
if (e.message.content == "chii.removeids") {
    var guild = e.message.channel.guild;
    var user = e.message.author;
    var roles = guild.roles;
    removeRole(0);

    function removeRole(i) {
        if (i >= roles.length) {
            console.log("Finished!");
        } else {
            var role = roles[i].name;
            if (!isNaN(role)) {
                setTimeout(function() {
                    roles[i].delete().then(function() {
                        console.log(i + " " + role + " role deleted");
                        removeRole(i + 1);
                    }).catch(function(err) {
                        //console.log(err);
                        removeRole(i + 1);
                    })
                }, 1000);
            } else {
                removeRole(i + 1);
            }
        }
    }
}*/
