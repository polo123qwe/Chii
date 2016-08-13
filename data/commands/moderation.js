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
    clean: 1,
    exec: function(client, msg, suffix) {
        var member;
        var guild = msg.channel.guild;
        if (!suffix) {
            msg.channel.sendMessage("No suffix supplied!");
        }
        member = msg.mentions[0];
        if (member) {
            member = client.Users.getMember(guild, member);
        }
        if (!member) {
            member = utils.getMemberFromGuild(client, guild, suffix);
        }
        if (!member) {
            msg.channel.sendMessage("No user found");
            return;
        }
        var roleName = "member";
        var roleID;

        db.fetch.getServerConfig(msg.channel.guild.id).then(function(query) {
            if (query.rowCount > 0) {
                if (query.rows[0].memberrole) {
                    roleID = query.rows[0].memberrole;
                }
            }
            for (var role of guild.roles) {
                if (role.name.toLowerCase() == roleName || (roleID && role.id == roleID)) {
                    member.assignRole(role).then(function() {
                        msg.channel.sendMessage(member.name + " added successfully to " + roleName);
                    }).catch(function(err) {
                        clog.logError("COMMAND ERROR", err);
                    });
                }
            }
        });
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
