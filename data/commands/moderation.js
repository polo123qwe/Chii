var CommandArray = [];
var utilsLoader = require('../../utils/utilsLoader.js');
var clog = utilsLoader.clog;
var utils = utilsLoader.generalUtils;
var db = utilsLoader.db;
var config = require('../../config.json');


CommandArray.member = {
    name: 'member',
    usage: "[@user/user/id]",
    help: "Gives membership to a user",
    cooldown: 5,
    levelReq: 2,
    clean: 0,
    exec: function(client, msg, suffix) {
        var user, guildUser;
        var guild = msg.channel.guild;
        if (!suffix) {
            msg.channel.sendMessage("No suffix supplied!");
            return;
        }
        user = msg.mentions[0];
        if (user) {
            guildUser = client.Users.getMember(guild, user);
        } else {
            guildUser = utils.getMemberFromGuild(client, guild, suffix);
        }
        if (!guildUser) {
            msg.channel.sendMessage("No user found");
            return;
        }
        var roleName = "member";
        var roleID;

        db.fetch.getData("serverConfig", [msg.channel.guild.id]).then(function(query) {
            if (query.rowCount > 0) {
                if (query.rows[0].memberrole) {
                    roleID = query.rows[0].memberrole;
                }
            }
            for (var role of guild.roles) {
                if (role.name.toLowerCase() == roleName || (roleID && role.id == roleID)) {
                    guildUser.assignRole(role).then(function() {
                        msg.channel.sendMessage(guildUser.name + " added successfully to " + roleName);
                    }).catch(function(err) {
                        clog.logError("COMMAND ERROR", err);
                    });
                }
            }
        });
    }
}

CommandArray.blacklist = {
    name: 'blacklist',
    usage: '[@user/id] role',
    help: 'removes user access to a specific channel',
    cooldown: 5,
    levelReq: 2,
    clean: 0,
    exec: function(client, msg, suffix) {
        var split = suffix.split(" ");

        //Check the amount of parameters supplied
        if (suffix.length < 2) {
            msg.channel.sendMessage("Not enough arguments").then(function(newMsg) {
                setTimeout(function() {
                    newMsg.delete();
                }, 2000);
            });
            return;
        }
        var roleName = split[1];
        if (config.userroles.blacklisted.includes(roleName)) {
            var guildUser;
            var user = msg.mentions[0];
            if (!user) {
                //Find the guildMember of the user
                var users = client.Users.membersForGuild(msg.guild);
                if (users) {
                    guildUser = users.find((u) => u.id == split[0]);
                }
            }
            if (!guildUser) {
                guildUser = client.Users.getMember(msg.guild, user);
            }

            if (guildUser) {
                var role = msg.guild.roles.find((r) => r.name == roleName);
                if (role) {
                    guildUser.assignRole(role).then(function() {
                        var channel = client.Channels.textForGuild(msg.guild).find((c) => c.name == "log" || c.name == "logs");
                        if (channel) {
                            channel.sendMessage(guildUser.username + "#" + guildUser.discriminator + " blacklisted from " + roleName);
                        }
                    });
                }
            } else {
                msg.channel.sendMessage("No user found!").then(function(newMsg) {
                    setTimeout(function() {
                        newMsg.delete();
                    }, 2000);
                });
            }

        } else {
            msg.channel.sendMessage("Role invalid!").then(function(newMsg) {
                setTimeout(function() {
                    newMsg.delete();
                }, 2000);
            });
        }
    }
}

CommandArray.warn = {
    name: 'warn',
    usage: "[@user/user/id]",
    help: "Warns a user",
    cooldown: 0,
    levelReq: 2,
    clean: 0,
    exec: function(client, msg, suffix) {
        utils.addUserToRole(client, msg.author, msg.channel, msg.mentions[0], msg.channel.guild, suffix, "warn").then(function() {

        }).catch(function(err) {
            msg.channel.sendMessage(output);
        });
    }
}

CommandArray.mute = {
    name: 'mute',
    usage: "[@user/user/id]",
    help: "Mutes a user",
    cooldown: 0,
    levelReq: 2,
    clean: 0,
    exec: function(client, msg, suffix) {
        utils.addUserToRole(client, msg.author, msg.channel, msg.mentions[0], msg.channel.guild, suffix, "mute").then(function() {

        }).catch(function(err) {
            msg.channel.sendMessage(output);
        });
    }
}

CommandArray.chill = {
    name: 'chill',
    usage: "[@user/user/id]",
    help: "Chills a user",
    cooldown: 0,
    levelReq: 2,
    clean: 0,
    exec: function(client, msg, suffix) {
        utils.addUserToRole(client, msg.author, msg.channel, msg.mentions[0], msg.channel.guild, suffix, "chill").then(function() {

        }).catch(function(err) {
            msg.channel.sendMessage(output);
        });

    }
}

exports.CommandArray = CommandArray;
