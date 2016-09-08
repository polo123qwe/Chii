var CommandArray = [];
var utilsLoader = require('../../utils/utilsLoader.js');
var clog = utilsLoader.clog;
var utils = utilsLoader.generalUtils;
var dUtils = utilsLoader.discordUtils;
var db = utilsLoader.db;
var config = require('../../config.json');

CommandArray.randu = {
    help: "Returns a random user",
    cooldown: 20,
    levelReq: 0,
    clean: 0,
    exec: function(client, msg, suffix) {
        if (msg.isPrivate) return;
        var guild = msg.guild;

        var guildUsers = guild.members;
        //Select a random user
        for (var user of guildUsers) {
            var found = false;
            var roles = user.roles;
            if (roles.find(r => {
                    r.name == "Member"
                })) {
                found = true;
            }
            if (!found) {
                var index = guildUsers.indexOf(user);
                guildUsers.splice(index, 1);
            }
        }
        var randomUser = guildUsers[utils.getRandom(0, guildUsers.length - 1)];

        msg.channel.sendMessage(randomUser.name + "!");
    }
}


exports.CommandArray = CommandArray;
