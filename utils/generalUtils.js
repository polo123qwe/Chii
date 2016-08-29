var unirest = require('unirest');
var db = require('./db.js');

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

    console.log(segments) //Try to find a match

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

//Function to convert a timespan into a readable time
exports.convertUnixToDate = function(t) {
    var pad = function(n) {
        return n < 10 ? '0' + n : n;
    };
    var cd = 24 * 60 * 60 * 1000;
    var ch = 60 * 60 * 1000;
    var d = Math.floor(t / cd);
    var h = Math.floor((t - d * cd) / ch);
    var m = Math.round((t - d * cd - h * ch) / 60000);
    if (m === 60) {
        h++;
        m = 0;
    }
    if (h === 24) {
        d++;
        h = 0;
    }
    var mo = Math.floor(d / (365 / 12));
    d = d - Math.round(mo * (365 / 12));
    var output = "";
    if (mo != 0) {
        output += mo + " Months ";
    }
    if (d != 0) {
        output += d + " Days ";
    }
    if (h != 0) {
        output += pad(h) + " Hours ";
    }
    output += pad(m) + " Minutes.";
    return (output);
}

//Function to convert a timestamp into a readable time
exports.unixToTime = function(UNIX_timestamp) {
    var a = new Date(UNIX_timestamp);
    var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    var year = a.getFullYear();
    var month = months[a.getMonth()];
    var date = a.getDate();
    var hour = a.getHours();
    var min = a.getMinutes() < 10 ? '0' + a.getMinutes() : a.getMinutes();
    var sec = a.getSeconds() < 10 ? '0' + a.getSeconds() : a.getSeconds();
    var time = date + ' ' + month + ' ' + year + ' ' + hour + ':' + min + ':' + sec;
    return time;
}

//Generates a hastebin document
exports.generateHasteBin = function(data, callback) {
    unirest.post('http://hastebin.com/documents')
        .send(data)
        .end(function(response) {
            if (typeof callback === "function")
                return callback("http://hastebin.com/" + response.body.key + ".txt");
        });
}

exports.getRandom = function(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
}

//Adds user to a role
/*exports.addUserToRole = function(client, channel, author, target, suffix, guild, type, moderation) {
    return new Promise(function(resolve, reject) {
        var guildUser;
        var moderationCommand = false;

        if(suffix){
            suffix = suffix.replace(/<@?\!?\d{17,}>/, "");
        }

        guildUser = client.Users.getMember(guild, user)

    });
}*/
exports.addUserToRole = function(client, author, originalChannel, user, guild, suffix, type) {
    return new Promise(function(resolve, reject) {
        var guildUser;
        var moderationCommand = false;

        if (suffix) {
            suffix = suffix.replace(/<@?\!?\d{17,}>/, "");
        }
        //We check if its a moderation command
        if (type == "chill" || type == "mute" || type == "warn") {
            switch (type) {
                case "chill":
                    type = "chilling";
                    break;
                case "mute":
                    type = "muted";
                    break;
                case "warn":
                    type = "warned";
                    break;
            }
            moderationCommand = true;
            guildUser = client.Users.getMember(guild, user);
        } else {
            guildUser = client.Users.getMember(guild, author);
        }
        if (!guildUser) {
            return reject("Error, user not found.");
        }
        if (type == "suicide") {
            type = "dead";
        }

        var targetChannel, targetRole;

        //If its a moderation command
        if (moderationCommand) {
            var channels = client.Channels.textForGuild(guild);
            //Search for the channel to log
            for (var channel of channels) {
                if (channel.name == "log" || channel.name == "logs") {
                    targetChannel = channel;
                    break;
                }
            }
        }

        //Search for the role
        for (var role of guild.roles) {
            if (role.name.toLowerCase() == type) {
                targetRole = role;
                break;
            }
        }

        //If failed to find the role
        if (!targetRole) return reject("Error, role not found");

        guildUser.assignRole(targetRole).then(function(role) {
            //If its a moderation command
            if (moderationCommand) {
                if (targetChannel) {
                    if (suffix) {
                        targetChannel.sendMessage(user.username + "#" + user.discriminator + " " + type + " by " + author.username + ". Reason: " + suffix);
                    } else {
                        targetChannel.sendMessage(user.username + "#" + user.discriminator + " " + type + " by " + author.username);
                    }
                }
                //Store the change in the db
                db.logging.log("warning", [user.id, guild.id, new Date(), type, suffix]).catch(function(err) {
                    console.log(err);
                });

                if (type == "chilling") {
                    setTimeout(function() {
                        guildUser.unassignRole(targetRole).then(function() {
                            console.log(guild.name + " > " + user.username + " unchilled");
                        });
                    }, 60000);
                }
            } else {
                if (type == "dead") {
                    var time = exports.getRandom(60000, 1800000);
                    setTimeout(function() {
                        guildUser.unassignRole(targetRole);
                        author.openDM().then(function(dmchannel) {
                            dmchannel.sendMessage("You've been muted for: " + utils.millisecondsConversion(time));
                        })
                    }, time);
                } else {
                    originalChannel.sendMessage(author.username);
                }
            }
            return resolve();
        }).catch(reject(err));
    });
}
