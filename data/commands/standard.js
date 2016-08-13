var CommandArray = [];
var utilsLoader = require('../../utils/utilsLoader.js');
var clog = utilsLoader.clog;
var utils = utilsLoader.generalUtils;
var db = utilsLoader.db;
var config = require('../../config.json');

CommandArray.ping = {
    name: 'ping',
    help: "Replies with pong!",
    cooldown: 5,
    levelReq: 0,
    clean: 0,
    exec: function(client, msg, suffix) {
        var actual = Date.now();
        msg.channel.sendMessage("Pong!").then(function(message) {
            var newMessage = "Pong! (" + (Date.now() - actual) + "ms)";
            message.edit(newMessage);
        });
    }
}

CommandArray.eval = {
    name: 'eval',
    usage: "code",
    help: "Runs arbitrary JS code and gives back the results.",
    cooldown: 0,
    levelReq: 'owner',
    clean: 0,
    exec: function(client, msg, suffix) {
        var result;

        try {
            result = eval("try{" + suffix + "} catch (error) { clog.logError(\"EVAL\", error); msg.channel.sendMessage(\"```\" + error + \"```\") }");
        } catch (err) {
            clog.logError("EVAL CATCH", err);
            msg.channel.sendMessage("```" + err + "```");
        }

        if (result && typeof result !== 'object') {
            msg.channel.sendMessage("```" + result + "```")
        } else if (result && typeof result === 'object') {
            msg.channel.sendMessage("```xl\n" + result + "```")
        }
    }
}

function addEveryone(guild) {
    var membs = guild.members;
    console.log(membs.length)
    add(membs.pop(), membs);
}

function add(member, members) {
    if (members.length == 0) {
        return;
    }
    console.log(members.length + " left. Adding: " + member.name);
    db.logging.storeUserDB(member).then(function() {
        add(members.pop(), members);
    });
}

CommandArray.uptime = {
    name: 'uptime',
    help: "Return for how long the bot has been running",
    cooldown: 5,
    levelReq: 0,
    clean: 0,
    exec: function(client, msg, suffix) {
        var time = utils.convertUnixToDate(Date.now() - client.uptime);
        var output = "Bot has been running for " + time;
        msg.channel.sendMessage(output);
    }
}

exports.CommandArray = CommandArray;
