var CommandArray = [];
var utilsLoader = require('../../utils/utilsLoader.js');
var clog = utilsLoader.clog;
var utils = utilsLoader.generalUtils;
var dUtils = utilsLoader.discordUtils;
var db = utilsLoader.db;
var config = require('../../config.json');

var types = ['country', 'bday', 'name'];

CommandArray.addUser = {
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
                db.logging.log("user", [member]).then(function() {
                    msg.channel.sendMessage(member.name + "Added successfully!");
                }) /*.catch(function(err){console.log(err);});*/
                return;
            }
        }
    }
}

CommandArray.whitelist = {
    usage: "[@user/user/id]",
    help: "Adds user to the whitelist",
    cooldown: 5,
    levelReq: 2,
    clean: 1,
    exec: function(client, msg, suffix) {
        var user;
        if(!suffix){
            user = msg.author;
        } else {
            user = client.Users.get(suffix);
            if(!user){
                user = msg.author;
            }
        }

        db.logging.log("whitelist", [msg.guild.id, user.id]).then(function(){
            msg.channel.sendMessage(user.username + " whitelisted");
        }).catch(function(err){
        })
    }
}

CommandArray.togglewhitelist = {
    help: "Toggles whitelist serverwide",
    cooldown: 5,
    levelReq: 2,
    clean: 1,
    exec: function(client, msg, suffix) {
        db.fetch.getData("serverConfig", [msg.guild.id]).then(function(query){
            if(query.rowCount == 0) return;
            var status = query.rows[0].links;
            status = !status;
            db.update.update("server", [status.toString(), msg.guild.id]).then(function(query){
                msg.channel.sendMessage("Blocking invites status: " + status);
            }).catch(function(err){
                console.log(err);
            });
        }).catch(function(err){

        });

    }
}

/*CommandArray.set = { //TODO
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
}*/

CommandArray.getlogs = {
    usage: "[time in minutes]",
    help: "Gets the logs of the chat of the required time (Default 3hrs)",
    cooldown: 0,
    levelReq: 3,
    clean: 1,
    exec: function(client, msg, suffix) {

        var time, output;
        if (!suffix || isNaN(suffix)) {
            time = 7200;
        } else {
            time = suffix * 60;
        }
        output = "Messages in the past " + (time / 60) + " mins in [" + msg.channel.guild.name + " / " + msg.channel.name + "]\n";

        var offset = (Date.now() - time * 1000)/1000;

        db.fetch.getData("logs", [msg.channel.guild.id, msg.channel.id, offset]).then(function(query) {
            for (var row of query.rows) {
                var user = client.Users.get(row.user_id);
                if (!user){
                    user = {};
                    user.username = "#MissingUsername#";
                }
                var date = utils.unixToTime(row.timestamp);
                output += "[" + date + "] [" + user.username + "] " + row.content + "\n";
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
