var CommandArray = [];
var utilsLoader = require('../../utils/utilsLoader.js');
var clog = utilsLoader.clog;
var utils = utilsLoader.generalUtils;
var dUtils = utilsLoader.discordUtils;
var db = utilsLoader.db;
var config = require('../../config.json');


CommandArray.member = {
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
            guildUser = client.Users.getMember(guild, suffix);
        }
        if (!guildUser) {
            msg.channel.sendMessage("No user found");
            return;
        }
        var roleName = "member";
        var roleID;

        db.run("SELECT", "servers", [msg.channel.guild.id]).then(function(query) {
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
    usage: "[@user/user/id]",
    help: "Warns a user",
    cooldown: 0,
    levelReq: 2,
    clean: 0,
    exec: function(client, msg, suffix) {
        //client, channel, author, target, suffix, guild, type, moderationCommand, delay
        dUtils.addUserToRole(client, msg.channel, msg.author, msg.mentions[0], suffix, msg.guild, "warn", msg.timestamp, true).then(() => {

        }).catch(function(err) {
            msg.channel.sendMessage(err);
        });
    }
}

CommandArray.mute = {
    usage: "[@user/user/id]",
    help: "Mutes a user",
    cooldown: 0,
    levelReq: 2,
    clean: 0,
    exec: function(client, msg, suffix) {
        dUtils.addUserToRole(client, msg.channel, msg.author, msg.mentions[0], suffix, msg.guild, "mute", msg.timestamp, true).then(() => {

        }).catch(function(err) {
            msg.channel.sendMessage(err);
        });
    }
}

CommandArray.chill = {
    usage: "[@user/user/id]",
    help: "Chills a user",
    cooldown: 0,
    levelReq: 2,
    clean: 0,
    exec: function(client, msg, suffix) {
        dUtils.addUserToRole(client, msg.channel, msg.author, msg.mentions[0], suffix, msg.guild, "mute", msg.timestamp, true, 120000).then(() => {

        }).catch(function(err) {
            msg.channel.sendMessage(err);
        });
    }
}

CommandArray.prune = {
    usage: "amount [@user/id]",
    help: "prunes messages up to 50, if user specified, it will remove the messages of that user up to the last 100 messages",
    cooldown: 0,
    levelReq: 3,
    clean: 0,
    exec: function(client, msg, suffix) {
        var splittedMessage = suffix.split(" ");
        var amount = splittedMessage[0];
        var user = splittedMessage[1];

        if (!amount || amount < 1) {
            msg.channel.sendMessage("Not enough/Invalid arguments").then(function(newMsg) {
                setTimeout(function() {
                    newMsg.delete();
                }, 2000);
            });
        } else if (amount > 50) {
            amount = 50;
        }
        //if we don't filter by user,
        if (user) {
            //We check if the id is valid or if it was a mention
            if (msg.mentions) {
                user = msg.mentions[0].id;
            } else {
                //If no user was found with that id
                if (!client.Users.get(user)) {
                    fetchAndDelete();
                    return;
                }
            }
            var userMsgs = []; //Array to store the msgs of the desired user

            msg.channel.fetchMessages(100)
                .then(e => {
                    for (var message of e.messages) {
                        if (message.author.id == user) {
                            userMsgs.push(message);
                            //If we have the desired amount of msgs
                            if (userMsgs.length >= amount) {
                                client.Messages.deleteMessages(userMsgs).catch(console.err);
                                return;
                            }
                        }
                    }
                    if (userMsgs) {
                        client.Messages.deleteMessages(userMsgs).catch(console.err);
                    }
                });
        } else {
            fetchAndDelete();
        }

        function fetchAndDelete() {
            //Find the message we want to delete
            msg.channel.fetchMessages(Number(amount))
                .then((res) => {
                    //Try to delete messages
                    client.Messages.deleteMessages(res.messages).then(() => {

                    }).catch((err) => {
                        console.err(err);
                    });
                }).catch(console.err);
        }
    }
}

CommandArray.revokeinvite = {
    usage: "inviteCode",
    help: "revokes an invite link",
    cooldown: 0,
    levelReq: 3,
    clean: 0,
    exec: function(client, msg, suffix) {
        var inviteCode = suffix.split(" ")[0];

        //if no suffix supplied do nothing
        if (!inviteCode) return;
        else {
            //Find the invite code
            client.Invites.resolve(inviteCode).then((res) => {
                //If the invite is for the same server that the cmd was sent to
                if (res.guild.id == msg.guild.id) {
                    //Try to remove the invite
                    client.Invites.revoke(inviteCode).then(() => {
                        msg.channel.sendMessage("Successfully removed invite link " + inviteCode);
                    });
                }
            }).catch(() => {
                msg.channel.sendMessage("Invite not found").then(function(newMsg) {
                    setTimeout(function() {
                        newMsg.delete();
                    }, 2000);
                });
            });
        }
    }
}

exports.CommandArray = CommandArray;
