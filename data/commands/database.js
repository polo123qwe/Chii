var CommandArray = [];
var utilsLoader = require('../../utils/utilsLoader.js');
var clog = utilsLoader.clog;
var utils = utilsLoader.generalUtils;
var db = utilsLoader.db;
var config = require('../../config.json');

var types = ['country', 'bday', 'name'];

CommandArray.add = {
    name: 'add',
    usage: "[userID]",
    help: "Adds to db member",
    cooldown: 0,
    levelReq: 0,
    clean: 0,
    exec: function(client, msg, suffix) {
        if (suffix == null) return;
        var target;

        //If there is a suffix
        if (!suffix) {
            target = msg.author.id;
        } else {
            target = suffix;
        }
        for (var member of msg.channel.guild.members) {
            if (member.id == target) {
                db.logging.storeUserDB(member).then(function() {
                    msg.channel.sendMessage(member.name + "Added successfully!");
                }) /*.catch(function(err){console.log(err);});*/
                return;
            }
        }
    }
}

CommandArray.set = { //TODO
    name: 'set',
    usage: "[userID]",
    help: "Adds the setting to member of the db",
    cooldown: 0,
    levelReq: 0,
    clean: 0,
    exec: function(client, msg, suffix) {
        if (suffix == null) return;

        var splittedMessage = suffix.split(" ");
        var type = splittedMessage[0];
        if (type && types.indexOf(type) != -1) {
            //TODO
        }
    }
}

CommandArray.getlogs = {
    name: 'getlogs',
    usage: "[time in minutes]",
    help: "Gets the logs of the chat of the required time (Default 3hrs)",
    cooldown: 0,
    levelReq: 3,
    clean: 1,
    exec: function(client, msg, suffix) {

        var offset, output;
        if (!suffix || isNaN(suffix)) {
            offset = 7200;
        } else {
            offset = suffix * 60;
        }
        output = "Messages in the past " + (offset / 60) + " mins in [" + msg.channel.guild.name + " / " + msg.channel.name + "]\n";

        db.fetch.getLogs(msg.channel.guild.id, msg.channel.id, offset).then(function(query) {
            for (var row of query.rows) {
                var user = client.Users.get(row.user_id);
                if (!user) user.username = "#MissingUsername#";
                var time = utils.unixToTime(row.timestamp);
                output += "[" + time + "] [" + user.username + "] " + row.content + "\n";
            }
            //Create a hastebin with the data and send via dm
            utils.generateHasteBin(output, function(res) {
                msg.author.openDM().then(function(dmchannel) {
                    dmchannel.sendMessage("[" + utils.unixToTime(Date.now()) + "] [" + msg.channel.guild.name + " / " + msg.channel.name + "] Logs can be found: " + res);
                });
            })
        }).catch(function(err) {
            clog.logError("ERROR", err);
        });

    }
}

exports.CommandArray = CommandArray;
