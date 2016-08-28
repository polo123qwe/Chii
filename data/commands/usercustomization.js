var CommandArray = [];
var utilsLoader = require('../../utils/utilsLoader.js');
var clog = utilsLoader.clog;
var utils = utilsLoader.generalUtils;
var db = utilsLoader.db;
var config = require('../../config.json');
var colors = require('../../colors.json').colors;

CommandArray.join = {
    name: 'join',
    usage: "role [role2] [role3]",
    help: "Allows user to join a role/multiple roles",
    cooldown: 0,
    levelReq: 0,
    clean: 2,
    exec: function(client, msg, suffix) {

        //Array where the roles will be saved
        var rolesToAdd = [];
        var input = suffix.split(" ");

        var allRoles = msg.channel.guild.roles;
        //Check every role the user typed
        for (var role of input) {
            //If its one of the optional roles
            for (var r of config.userroles.optroles) {
                if (role.toLowerCase() == r) {
                    //If its not already added
                    if (rolesToAdd.indexOf(r) == -1) {
                        //Add to the array of roles to add
                        rolesToAdd.push(r);
                    }
                    break;
                }
            }
        }
        //We add the roles we found
        var guildUser = client.Users.getMember(msg.channel.guild, msg.author);
        if (!guildUser) {
            msg.channel.sendMessage("Error, cannot find user.");
        } else {
            addRole(0);
        }

        function addRole(index) {
            if (index > allRoles.length - 1) return;

            var role = allRoles[index];
            if (rolesToAdd.indexOf(role.name.toLowerCase()) != -1) {
                guildUser.assignRole(role).then(function() {
                    msg.channel.sendMessage(msg.author.username + " added to " + role.name).then(function(msg) {
                        setTimeout(function(){
                            addRole(index + 1);
                        }, 1000);
                    });
                }).catch(function(err) {
                    clog.logError("ERROR", err);
                });
            } else {
                return addRole(index + 1);
            }
        }
    }
}

CommandArray.leave = {
    name: 'leave',
    usage: "role [role2] [role3]",
    help: "Allows user to leave a role",
    cooldown: 5,
    levelReq: 0,
    clean: 1,
    exec: function(client, msg, suffix) {

        //Array where the roles will be saved
        var found = false;
        var roleToRemove = suffix.toLowerCase();

        //Check every role the user typed
        var guildUser = client.Users.getMember(msg.channel.guild, msg.author);
        //If its one of the optional roles
        if (config.userroles.optroles.indexOf(roleToRemove.toLowerCase()) != -1) {
            found = true;
        }
        if (!found) {
            msg.channel.sendMessage(msg, ':warning: Not allowed to modify that role.').then(function(botMsg, error) {
                setTimeout(() => {
                    botMsg.delete()
                }, 5000);
            });
            return;
        }
        if (!guildUser) {
            msg.channel.sendMessage("Error, cannot find user.");
            return;
        }
        var allRoles = guildUser.roles;
        //We add the roles we found
        for (var role of allRoles) {
            if (role.name.toLowerCase() == roleToRemove) {
                guildUser.unassignRole(role).then(reply(msg.channel, msg.author.username + " removed from " + role.name)).catch(function(err) {
                    clog.logError("ERROR", err);
                });
                return;
            }
        }
    }
}

CommandArray.suicide = {
    name: 'suicide',
    help: "Mutes user from 1 to 10 mins",
    cooldown: 0,
    levelReq: 2,
    clean: 0,
    exec: function(client, msg, suffix) {
        utils.addUserToRole(client, msg.author, msg.channel, null, msg.channel.guild, suffix, "chill").then(function() {

        }).catch(function(err) {
            msg.channel.sendMessage(output);
        });
    }
}

CommandArray.color = {
    name: 'suicide',
    usage: "<HEX / Number in the picture>",
    help: "Allow user to set a color",
    cooldown: 30,
    levelReq: 1,
    clean: 1,
    exec: function(client, msg, suffix) {

        var color;

        //Check if its a valid hex value
        if(!suffix){
            try{
                msg.author.openDM().then(function(dmchannel){
                    dmchannel.uploadFile(fs.readFileSync("../../colors.png"), "colors.png", "Colors available are:");
                });
                return;
            } catch(e){
                clog.logError("ERROR", e);
            }
        } else if(suffix.length == 6){
            color = "#" + suffix;
        } else if(suffix.length == 7 && suffix.startsWith("#")){
            color = suffix;
        } else if(!isNaN(suffix)){
            var number = parseInt(suffix, 10);
            if(colors[number-1]){
                color = colors[number-1];
            } else {
                msg.channel.sendMessage("Parameter incorrect use help! color for more information");
                return;
            }
        } else {
            msg.channel.sendMessage("Parameter incorrect use help! color for more information");
            return;
        }

        var guildUser = client.Users.getMember(msg.guild, msg.author);

        //Find the role for that color
        var role = msg.guild.roles.find(k => k.name.toLowerCase() == color);

        if(!role){
            msg.channel.sendMessage("Color " + suffix + " not found!");
            return;
        }

        var toRemove = [];
        //Find the color roles the user has
        for(var r of guildUser.roles){
            if(r.name.startsWith("#")){
                toRemove.push(r);
            }
        }
        removeRole(0);

        function removeRole(i){
            if(i >= toRemove.length){
                addRole(role);
                return;
            }
            guildUser.unassignRole(toRemove[i]).then(function(){
                setTimeout(function(){
                    removeRole(i+1);
                }, 1000);
            }).catch(function(err){
                clog.logError("ERROR", err);
                removeRole(i+1);
            });
        }

        function addRole(role){
            guildUser.assignRole(role).then(function(){
                msg.channel.sendMessage(msg.author.username + " added to " + role.name);
            }).catch(function(err){
                clog.logError("ERROR", err);
            })
        }

    }
}

function reply(channel, message) {
    channel.sendMessage(message);
}

exports.CommandArray = CommandArray;
