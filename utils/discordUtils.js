var unirest = require('unirest');
var db = require('./db.js');
var utils = require('./generalUtils.js');

exports.getMemberFromGuild = function(client, guild, suffix) {
    var members = client.Users.membersForGuild(guild);
    var suffix = suffix.toLowerCase();
    for (var member of members) {
        if (member.id == suffix ||
            member.username.toLowerCase().includes(suffix) ||
            (member.nick && member.nick.includes(suffix))) {
            return member;
        }
    }
}

//Returns an array with all the users mentioned
exports.getUsersFromMessage = function(client, msg, guild, suffix) {
    var members = msg.mentions;
    var segments = [];
    if (suffix.includes(",") || suffix.includes(";")) {
        segments = suffix.split(/, ?|; ?/g);
    } else {
        segments = suffix.split(" ");
    }
    var users = client.Users.membersForGuild(guild);

    //console.log(segments) //Try to find a match

    for (var segment of segments) {
        segment = segment.toLowerCase();
        console.log(segment)
        for (var user of users) {

            if (user.id == segment || user.username.toLowerCase().includes(segment) ||
                (user.username.toLowerCase() + "#" + user.discriminator) == segment ||
                user.nick == segment) {
                members.push(user);
                break;
            }
        }
    }
    return members;
}

//Adds user to a role
exports.addUserToRole = function(client, channel, author, target, suffix, guild, type, moderationCommand, delay) {
    return new Promise(function(resolve, reject) {

        var guildUser;
        var logChannel;
        var roleName = type; //The role we want to find

        var commands = {
            "warn": "warned",
            "mute": "muted"
        };

        if (suffix) {
            suffix = suffix.replace(/<@?\!?\d{17,}>/, "");
        }

        //Determine if the command has a different name than the role
        if (commands.hasOwnProperty(type)) {
            roleName = commands[type];
        }

        if (target) {
            //Retrieve user
            guildUser = client.Users.getMember(guild, target);
        }

        //Check if the user was found
        if (!guildUser) {
            if (moderationCommand) {
                return Promise.reject("Error, no user specified!");
            } else {
                //Use author instead if we find no user
                guildUser = client.Users.getMember(guild, author);
                if (!guildUser) {
                    return Promise.reject("Error, user not found!");
                }
            }
        }

        //Find the log channel if there is one
        if (moderationCommand) {
            var channels = client.Channels.textForGuild(guild);

            logChannel = channels.find(c => c.name == "log" || c.name == "logs");
        }

        //Find the role we are looking for
        var role = guild.roles.find(r => r.name.toLowerCase() == roleName);

        //If we don't find the role, reject the promise
        if (!role) {
            return Promise.reject("Error, role not found!");
        }

        guildUser.assignRole(role).then(() => {

            //If there is a delay specified
            if (delay) {

                var unassignTime = delay;

                //If the delay specified is -1, we geenrate a random delay
                if (unassignTime == -1) {
                    unassignTime = Math.round(utils.getRandom(60000, 180000));
                    channel.sendMessage("Got " + Math.round(unassignTime / 1000) + "s").then(m => {
                        setTimeout(m.delete, 2000);
                    });
                }

                setTimeout(() => {
                    //The role will be unassigned when the time runs out
                    guildUser.unassignRole(role).then(() => {
                        console.log(guild.name + " > " + guildUser.username + "#" +
                            guildUser.discriminator + " removed from " + role.name);
                    });
                }, unassignTime);
            }

            //If its a moderation command
            if (moderationCommand) {
                //If we found a channel to log it into
                if (logChannel) {
                    var logMessage = "";
                    logMessage += "[" + guildUser.username + "#" + guildUser.discriminator + "] > " + roleName + " by " + author.username;
                    //the user specified a suffix we log it
                    if (suffix) {
                        logMessage += ". Reason: " + suffix;
                    }
                    if (delay) {
                        logMessage += " [" + Math.round(delay) / 1000 + "s]";
                    }
                    logChannel.sendMessage(logMessage);
                }
                //Store in the db the command
                db.logging.log("warning", [guildUser.id, guild.id, new Date(), roleName, suffix]).catch(function(err) {
                    console.log(err);
                });
            }
            return Promise.resolve();
        }).catch(console.log);
    });
}
