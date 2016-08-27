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

        /*if (result && typeof result !== 'object') {
            msg.channel.sendMessage("```" + result + "```")
        } else if (result && typeof result === 'object') {
            msg.channel.sendMessage("```xl\n" + result + "```")
        }*/
        msg.channel.sendMessage(result);
    }
}

function addServers(guilds) {
    console.log(guilds.length)
    add(guilds.pop(), guilds, "server");
}

/*function addEveryone(guild) {
    var membs = guild.members;
    console.log(membs.length)
    add(membs.pop(), membs, "user");
}*/

function add(guild, guilds, type) {
    if (guilds.length == 0) {
        return;
    }
    console.log(guilds.length + " left. Adding: " + guilds.name);
    db.logging.log(type, [guild.id]).then(function() {
        add(guilds.pop(), guilds, type);
    }).catch(function (err) {
        console.log(err.detail);
        add(guilds.pop(), guilds, type);
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
