var utils = require("../utils.js");
var helpCommand = require("./help.js");
var exec = require('child_process').exec;

var whitelistedRoles = ["Chilled", "Muted", "Chancellor", "Councillor", "Bot", "Member"];
var selfAssignableRoles = ["lood", "food", "rp", "coder"];

module.exports = {
    ping: {
        permissions: -1,
        run: function(message, bot){

            var outputMessage = "Pong! ("+(Date.now()-message.timestamp)+"ms)";
            bot.sendMessage(message, outputMessage);
        },
        help: "`ping!` - returns pong!",
    },

    refresh: {
        permissions: 2,
        run: function (message, bot){
            process.exit(1);
        },
        help: "`refresh!` - Restarts the bot",
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
        help: "`member!` - Gives user membership.",
    },

    /* Unified all the self-assigned roles so that we can save some space and time, plus add an option to
     * leave roles */
    joinrole: {
      permissions: -1,
      run: function(msg, bot) {

        if (msg.channel.isPrivate) return;                            /* Ignore DMs */
        if (msg.channel == msg.channel.server.defaultChannel) return; /* Ignore messages from default channel to prevent spam */

        var cmd = msg.content.split(" ")[0];
        var suffix = msg.content.substring(cmd.length + 1, msg.content.length).toLowerCase();
        var rolesToJoin = suffix.split(" ");

        /* Error handling - Display the help if user is a dum-dum */
        if (!suffix) {
          bot.sendMessage(msg, ":warning: Incorrect usage.\n" + this.help, (err, bm) => {bot.deleteMessage(bm, {"wait": 5000})});
          return;
        }

        for (var i = 0; i < rolesToJoin.length; i++) {
          if (arrContains(selfAssignableRoles, rolesToJoin[i])) {
            setUserToCustomRoles(msg, bot, rolesToJoin[i]);
            bot.sendMessage(msg, ":ok: User " + msg.author.username + " added to role `" + rolesToJoin[i] + "`.", (err, bm) => {bot.deleteMessage(bm, {"wait": 5000})});
          } else {
            bot.sendMessage(msg, ":warning: Role `" + rolesToJoin[i] + "` does not exist or you are unable to join it.", (err, bm) => {bot.deleteMessage(bm, {"wait": 5000})});
            return;
          }
        }

      },
      help: "`joinrole! <role1> [role2] [role3]...` - Joins specified self-assignable roles. Separate roles with spaces.",
      cd: 100000
    },

    /* Leaverole - Leaves specified role */
    leaverole: {
      permissions: -1,
      run: function(msg, bot) {

        if (msg.channel.isPrivate) return;                            /* Ignore DMs */
        if (msg.channel == msg.channel.server.defaultChannel) return; /* Ignore messages from default channel to prevent spam */

        var cmd = msg.content.split(" ")[0];
        var suffix = msg.content.substring(cmd.length + 1, msg.content.length).toLowerCase();
        var rolesToLeave = suffix.split(" ");
        var curRole;

        /* Error handling - Display the help if user is a dum-dum */
        if (!suffix) {
          bot.sendMessage(msg, ":warning: Incorrect usage.\n" + this.help, (err, bm) => {bot.deleteMessage(bm, {"wait": 5000})});
          return;
        }

        for (var i = 0; i < rolesToLeave.length; i++) {
          if (arrContains(selfAssignableRoles, rolesToLeave[i])) {
            curRole = msg.channel.server.roles.get("name", rolesToLeave[i]);
            bot.removeMemberFromRole(msg.author, curRole);
            bot.sendMessage(msg, ":ok: User " + msg.author.username + " removed from role `" + rolesToLeave[i] + "`.", (err, bm) => {bot.deleteMessage(bm, {"wait": 5000})});
          } else {
            bot.sendMessage(msg, ":warning: Role `" + rolesToLeave[i] + "` does not exist or you are unable to leave it.", (err, bm) => {bot.deleteMessage(bm, {"wait": 5000})});
            return;
          }
        }

      },
      help: "`leaverole! <role1> [role2] [role3]...` - Leaves specified self-assignable roles. Separate roles with spaces.",
      cd: 100000
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
        help: "`chill! <@user>` - Mute a user for 1 minute.",
    },

    suicide: {
        permissions: -1,
        run: function(message, bot){

            if(message.channel.isPrivate) return;
            var server = message.channel.server;

            var chillRole = server.roles.get("name", "Chilling");

            bot.addMemberToRole(message.author, chillRole, function(err){
                if(err) console.log(err);
                bot.sendMessage(message, "RIP");
            });
            setTimeout(function(){
                bot.removeMemberFromRole(message.author, chillRole);
            }, 120000);
        },
        help: "`suicide!` - Mute yourself for 1 minute.",
    },

    warn: {
        permissions: 2,
        run: function(message, bot){
            userToMuteWarn(message, bot, "warn");
        },
        help: "`warn! <@user> [reason]` - Warns a user.",
    },

    mute: {
        permissions: 2,
        run: function(message, bot){
            userToMuteWarn(message, bot, "mute");
        },
        help: "`mute! <@user> [reason]` - Mutes a user.",
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
        help: "`kick! <@user> [reason]` - Kicks a user",
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
                    if(whitelistedRoles.indexOf(role.name) == -1) continue;
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
        help: "`clearRoles!` - Removes empty roles",
    },

    color: {
        permissions: 4,
        run: function(message, bot){
            //Do nothing if it was invoked in a Private Message
            if(message.channel.isPrivate) return;
            var server = message.channel.server;
            if(message.channel == server.defaultChannel) { return; } //Ignore messages from #general to prevent spam

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
                utils.resetCooldown(message.author.id, "color");
                return errorInput();
            }

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
                bot.sendMessage(message, "Incorrect usage, type color! `<color number in hexadecimal>`.\nFor more information on how to obtain a hexadecimal number "
              + "for your color, you can visit http://color-hex.com and copy the number from there.");
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
        help: "`color! <color in hexadecimal>` - Assigns you a color for your name. For more information on how to obtain a hexadecimal number for your color, you can visit **http://color-hex.com** and copy the number from there.",
        cd: 600000,
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
                bot.sendMessage(log, user.name + " " + type + "ed by "+ message.author.name + ". Reason: " + reason);
                //Log
                console.log(user.name + " " + type + "ed by "+ message.author.name + ". Reason: " + reason);
            } else {
                bot.sendMessage(log, user.name + " " + type + "ed by "+ message.author.name);
                //Log
                console.log(user.name + " " + type + "ed by "+ message.author.name);
            }
        }
    });
}

/* Array contains - Helper */
function arrContains(array, key) {
  for (var k = 0; k < array.length; k++) {
    if (key === array[k]) {
      return true;
    }
  }

  return false;
}
