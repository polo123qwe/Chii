var fs = require("fs");
var clog = require("./clog.js");

module.exports = function(msg, commands, suffix) {
    if (!suffix) {
        var cmds = {};
        var output = "";
        for (var command in commands) {
            if (!cmds[commands[command].category]) {
                cmds[commands[command].category] = [];
            }
            var line = "`" + command + "!";
            if (commands[command].hasOwnProperty("usage")) {
                line += " " + commands[command].usage + "`";
            } else line += "`";
            if (commands[command].hasOwnProperty("help")) {
                line += " " + commands[command].help;
            }
            cmds[commands[command].category].push(line)
        }

        for (var category in cmds) {
            output += "**" + category + "**\n";
            for (var item of cmds[category]) {
                output += item + "\n";
            }
        }
        msg.author.openDM().then(function(dmchannel) {
            dmchannel.sendMessage("Here is a list of all the commands that are currently available:\n" + output);
        });
    } else {
        if (commands[suffix]) {
            var line = "`" + suffix + "!";
            if (commands[suffix].hasOwnProperty("usage")) {
                line += " " + commands[suffix].usage + "`";
            } else line += "`";
            if (commands[suffix].hasOwnProperty("help")) {
                line += " " + commands[suffix].help;
            }
            msg.channel.sendMessage(line);
            if(suffix == "color"){
                try{
                    msg.author.openDM().then(function(dmchannel){
                        dmchannel.uploadFile(fs.readFileSync("./colors.png"), "colors.png", "Colors available are:");
                    });
                } catch(e){
                    clog.logError("ERROR", e);
                }
            }
        } else {
            msg.channel.sendMessage("Command does not exist");
        }
    }
    clog.logCommand("DM " + msg.author.username, msg.author, "help", suffix);
    return;
}
