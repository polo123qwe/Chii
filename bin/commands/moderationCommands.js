var utils = require("../utils.js");
var helpCommand = require("./help.js");
// var usersInCD = {};

module.exports = {
    help: {
        permissions: -1,
        run: function(message, bot){
            // for (var comm in module.exports){
			// 	if (module.exports[comm].hasOwnProperty('help')){
            // 		str+= ">" + module.exports[comm].help+"\n";
            // 	}
			// }
            // var str = helpCommand();
            // bot.sendMessage(message.author, str);

            bot.sendMessage(message, "No help yet :p");
        },
        help: "help! returns help",
    },

    ping: {
        permissions: -1,
        run: function(message, bot){
            var outputMessage = "Pong! ("+(Date.now()-message.timestamp)+"ms)";
            bot.sendMessage(message, outputMessage);
        },
        help: "ping! - returns pong!",
    },

    member: {
        permissions: 2,
        run: function(message, bot){

            //Ignore command if channel is private
            if(message.channel.isPrivate) return;
            var server = message.channel.server;

            var role = server.roles.get("name", "Member");
            var users = utils.getMentions(message, bot);
            for(var user of users){
                addMemberToRole(bot, user, role, message.channel);
            }
        },
        help: "member! - Gives user membership.",
    },

    lood: {
        permissions: -1,
        run: function(message, bot){
            setUserToCustomRoles(message, bot, "Lood");
        },
        help: "lood! - Assigns you to the nsfw channel.",
    },

    coder: {
        permissions: -1,
        run: function(message, bot){
            setUserToCustomRoles(message, bot, "Coder");
        },
        help: "coder! - Assigns you to the coder channel.",
    },
    //
    // food: {
    //     permissions: -1,
    //     run: function(message, bot){
    //         setUserToCustomRoles(message, bot, "Food");
    //     },
    //     help: "food! - Assigns you to the food channel.",
    // },

    rp: {
        permissions: -1,
        run: function(message, bot){
            setUserToCustomRoles(message, bot, "Rp");
        },
        help: "rp! - Assigns you to the roleplay channel.",
    },

    chill: {
        permissions: 2,
        run: function(message, bot){

            if(message.channel.isPrivate) return;
            var server = message.channel.server;

            var users = utils.getMentions(message, bot);

            userToMuteWarn(message, bot, "chill");

            var chillRole = server.roles.get("name", "Chilling");

            setTimeout(function(){
                for(var user of users){
                    bot.removeMemberFromRole(user, chillRole);
                }
            }, 60000);
        },
        help: "chill! <@user> - Chill a user.",
    },

    warn: {
        permissions: 2,
        run: function(message, bot){
            userToMuteWarn(message, bot, "warn");
        },
        help: "warn! <@user> Reason - Warns a user.",
    },

    mute: {
        permissions: 2,
        run: function(message, bot){
            userToMuteWarn(message, bot, "mute");
        },
        help: "mute! <@user> Reason - Mutes a user.",
    },

    kick: {
        permissions: 2,
        run: function(message, bot){
            var splitted = message.content.split(" ");

            if(message.channel.isPrivate) return;
            var server = message.channel.server;

            var log = server.channels.get("name", "log");

            var users = utils.getMentions(message, bot);
            //Remove the command and the users from the message
            var reason = splitted.slice(users.length+1, splitted.length).join(" ");

            for(var user of users){
                bot.kickMember(user, server, function(err){
                    if(err) console.log(err);
                    if(log != null){
                        if(reason.length > 0){
                            reason = reason.join(" ");
                            bot.sendMessage(log, user.name + " kicked by " + message.author.name + ". Reason: " + reason);
                            //Log
                            console.log(user.name + " kicked by " + message.author.name + ". Reason: " + reason);
                        } else {
                            bot.sendMessage(log, user.name + " kicked by " + message.author.name);
                            //Log
                            console.log(user.name + " kicked by " + message.author.name);
                        }
                    }
                });

            }

        },
        help: "kick! <@user> Reason - Kicks a user",
    },


    clearroles: {
        permissions: 0,
        run: function(message, bot){
            //Ignore command if channel is private
            if(message.channel.isPrivate) return;
            var server = message.channel.server;

            var rolesToRemove = [];
            //Check roles that are empty and add them to an array
            for(var role of server.roles){
                if(role.name != "@everyone"){
                    if(server.usersWithRole(role).length < 1){
                        rolesToRemove.push(role);
                    }
                }
            }
            var rolesToBeRemoved = rolesToRemove.length;
            if(rolesToBeRemoved == 0){
                bot.sendMessage(message, "There are no empty roles.");
                return;
            }
            removeRoles(rolesToRemove, function(){
                bot.sendMessage(message, rolesToBeRemoved + " roles deleted.");
            })

            //Remove all the roles in an array
            function removeRoles(rolesToRemove, callback){
                if(rolesToRemove.length == 0) return callback();
                bot.deleteRole(rolesToRemove.pop(), function(err){
                    if(err) console.log(err);
                    return removeRoles(rolesToRemove, callback);
                });
            }
        },
        help: "clearRoles! - Removes empty roles",
    },

    color: {
        permissions: 4,
        run: function(message, bot){

            //TEMPORARY THING PLS TODO BETTER
            // if(message.channel.id != "143976784545841161") return;

            var usersMentioned = message.mentions;
            var inputHexValue = message.content.split(" ")[1];
            var authorID = message.author.id;
            //RemoveColors

            //Check if the user has typed the command correctly
            if(!inputHexValue){
                return errorInput();
            }

            //Check the value is a hex-length value
            var hexValue = inputHexValue;
            if(hexValue.length == 6){
                hexValue = "0x"+hexValue;
            } else if(hexValue.length == 7 && hexValue.startsWith("#")){
                hexValue = "0x"+hexValue.substring(1, hexValue.length);
            } else {
                return errorInput();
            }

            //Do nothing if it was invoked in a Private Message
            if(message.channel.isPrivate) return;
            var server = message.channel.server;

            //Check last time the author used the command
            // if(usersInCD.hasOwnProperty(authorID)){
            //     if(usersInCD[authorID] == null){
            //         usersInCD[authorID] = Date.now();
            //     }
            //     var timeSpan = Date.now() - usersInCD[authorID];
            //     if(timeSpan < 3600000){
            //         //FIX THIS TODO
            //         bot.sendMessage(message, "On cooldown, "+(Math.round((3600000-timeSpan)/1000/60))+" mins");
            //         return;
            //     }
            // }
            // usersInCD[authorID] = Date.now();

            //Search any role containing Hex in the roles of the user
            //Get first user mentioned
            var userRoles = server.rolesOfUser(message.author);
            var found = false;

            for(var role of userRoles){
                if(role.name == authorID){
                    found = true;
                    bot.updateRole(role, {color : parseInt(hexValue)}, function(err, role){
                        if(err) console.dir(err);
                        // bot.sendMessage(channel, "Color changed sucessfully.");
                    });
                }
            }
            if(!found) updateColor(message.author, hexValue);

            //Function to display an error
            function errorInput(){
                bot.sendMessage(message, "Incorrect usage, type color! hexValue");
                return;
            }
            //Function to add a memeber to a role
            function updateColor(user, hexValue){
                var roleToAddUserTo = null;
                IterateRoles:
                for(var role of server.roles){
                    if(role.name == authorID){
                        roleToAddUserTo = role;
                        break IterateRoles;
                    }
                }
                //If no role found
                if(roleToAddUserTo == null){
                    bot.createRole(server, {name : authorID, color : parseInt(hexValue)}, function(err, role){
                        if(err) console.dir(err);
                        addMemberToRole(bot, user, role);
                    });
                    return;
                }
                addMemberToRole(bot, user, roleToAddUserTo);
            }
        },
        help: "color! HexValue - Gives user a color (1hr cooldown)",
        cd: 3600000,
    },
}

function setUserToCustomRoles(message, bot, type, channel){

    //Do nothing if its private channel
    if(message.channel.isPrivate) return;
    var server = message.channel.server;

    var role;
    role = server.roles.get("name", type);

    if(role == null){
        bot.sendMessage(message, "This role does not exist");
        return;
    }

    //Check if the user is already in the role
    var userRoles = server.rolesOfUser(message.author);

    for(var roleToCheck of userRoles){
        if(roleToCheck.name == type) return;
    }

    addMemberToRole(bot, message.author, role);

}

//Add a user to a role
function addMemberToRole(bot, user, role, channel){
    bot.addMemberToRole(user, role, function(err){
        if(err) console.dir(err);
        if(channel)
            bot.sendMessage(channel, user.name+" added to "+role.name+" sucessfully.");
    });
}

function userToMuteWarn(message, bot, type){
    var user = utils.getMentions(message, bot)[0];
    //Ignore command if channel is private
    if(message.channel.isPrivate) return;
    if(user == null){
        bot.sendMessage(message, "Error, type `" + type + "! <@user> Reason`");
        return;
    }
    var server = message.channel.server;

    //TODO Change this to store this channel in the DB
    var log = server.channels.get("name", "log");
    var warn;
    if(type == "mute"){
        warn = server.roles.get("name", "Muted");
    } else if (type == "warn"){
        warn = server.roles.get("name", "Warned");
    } else {
        warn = server.roles.get("name", "Chilling");
    }

    //TODO Change this to store this role in the DB
    if(warn == null){
        //TODO Inform the user to setChannel
        return;
    }

    var reason = message.content.split(" ");

    reason.shift();
    reason.shift();
    //Add user to warned role
    bot.addMemberToRole(user, warn, function(err){
        if(err) console.dir(err);

        //TODO Change this to store this channel in the DB
        if(log != null){
            if(reason.length > 0){
                reason = reason.join(" ");
                bot.sendMessage(log, user.name + " " + type + "d by "+ message.author.name + ". Reason: " + reason);
                //Log
                console.log(user.name + " " + type + "d by "+ message.author.name + ". Reason: " + reason);
            } else {
                bot.sendMessage(log, user.name + " " + type + "d by "+ message.author.name);
                //Log
                console.log(user.name + " " + type + "d by "+ message.author.name);
            }
        }
    });
}
