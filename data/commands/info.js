var CommandArray = [];
var utilsLoader = require('../../utils/utilsLoader.js');
var clog = utilsLoader.clog;
var utils = utilsLoader.generalUtils;
var db = utilsLoader.db;
var config = require('../../config.json');

CommandArray.joined = {
    name: 'joined',
    usage: "[@user/user/id]",
    help: "Prints the date the user joined",
    cooldown: 5,
    levelReq: 0,
    clean: 1,
    exec: function(client, msg, suffix) {
        var user, guildUser;
        var guild = msg.channel.guild;
        if (!suffix) {
            member = msg.author;
        } else {
            member = msg.mentions[0];
        }
        if (member) {
            guildUser = client.Users.getMember(guild, member);
        }
        if (!member) {
            guildUser = utils.getMemberFromGuild(client, guild, suffix);
        }
        if (!guildUser) {
            guildUser = client.Users.getMember(guild, message.author);
        }
        var joined = new Date(guildUser.joined_at).getTime()
        var time = utils.convertUnixToDate(Date.now() - joined);
        //Create the output string
        var output = "```xl\n" + guildUser.username + "#" + guildUser.discriminator + ": " + utils.unixToTime(guildUser.joined_at);
        output += "\n" + time + "\n```";
        msg.channel.sendMessage(output);
    }
}

CommandArray.ava = {
    name: 'ava',
    usage: "[@user/user/id]",
    help: "Returns avatar of the person",
    cooldown: 5,
    levelReq: 0,
    clean: 1,
    exec: function(client, msg, suffix) {
        var members = [];
        //var output = "";
        if (!suffix) {
            members.push(msg.author);
        } else {
            members = utils.getUsersFromMessage(client, msg, msg.channel.guild, suffix);
        }
        for (var member of members) {
            msg.channel.sendMessage("[" + member.username + "] https://discordapp.com/api/users/" + member.id + "/avatars/" + member.avatar + ".jpg \n");
        }
        //msg.channel.sendMessage(output);
    }
}

CommandArray.mycolor = {
    name: 'mycolor',
    help: "Returns the current color of the user",
    cooldown: 5,
    levelReq: 0,
    clean: 1,
    exec: function(client, msg, suffix) {

        var guildUser = client.Users.getMemberFromGuild(msg.guild, msg.author);
        if(guildUser){
            var role = guildUser.roles.find(k => k.name.startsWith("#"));
            if (role) {
                msg.channel.sendMessage("Your current color is " + role.name);
            } else {
                msg.channel.sendMessage("You have no color.");
            }
        } else {
            msg.channel.sendMessage("User not found");
        }

    }

}

exports.CommandArray = CommandArray;
