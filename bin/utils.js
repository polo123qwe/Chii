var unirest = require('unirest');
var request = require('request');

var lastExecutionTime = {}
//setInterval(() => {
//    lastExecutionTime = {}
//}, 3600000);

module.exports = {
    //Return
    getMentions: function(message, bot) {
        var splitted = message.content.split(" ");
        var mentions = [];
        for (var id of splitted) {
            if (id[0] == "<" && id[id.length - 1] == ">" && id.length) {
                var user;
                if (id.includes("@!")) {
                    user = bot.users.get("id", id.replace(/<|@!|>/ig, ""));
                } else if (id.includes("@")) {
                    user = bot.users.get("id", id.replace(/<|@|>/ig, ""));
                }
                if (user)
                    mentions.push(user);
            }
        }
        return mentions;
    },

    //Convert a timestamp to unix
    unixToTime: function(UNIX_timestamp) {
        var a = new Date(UNIX_timestamp);
        var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        var year = a.getFullYear();
        var month = months[a.getMonth()];
        var date = a.getDate();
        var hour = a.getHours();
        var min = a.getMinutes() < 10 ? '0' + a.getMinutes() : a.getMinutes();
        var sec = a.getSeconds() < 10 ? '0' + a.getSeconds() : a.getSeconds();
        var time = date + ' ' + month + ' ' + year + ' ' + hour + ':' + min + ':' + sec;
        return time;
    },

    checkCooldown: function(command, userID, commandText) {
        if (!command.hasOwnProperty("cd")) return 0;
        if (!lastExecutionTime.hasOwnProperty(commandText)) {
            lastExecutionTime[commandText] = {};
        }
        if (!lastExecutionTime[commandText].hasOwnProperty(userID)) {
            lastExecutionTime[commandText][userID] = new Date().valueOf();
            return 0;
        } else {
            var thisMoment = Date.now();

            /* If the user is still on cooldown return the time left until the next execution */
            if (thisMoment < lastExecutionTime[commandText][userID] + (command.cd)) {
                var timeLeftUntilNextExecution = Math.round(((lastExecutionTime[commandText][userID] + command.cd) - thisMoment) / 1000);

                return timeLeftUntilNextExecution;
            }

            /* Set the last execution time for the command and the user to now, and return 0 to confirm */
            lastExecutionTime[commandText][userID] = thisMoment;
            return command.cd/1000;
        }
    },





    millisecondsConversion(t) {
        var cd = 24 * 60 * 60 * 1000,
            ch = 60 * 60 * 1000,
            d = Math.floor(t / cd),
            h = Math.floor((t - d * cd) / ch),
            m = Math.round((t - d * cd - h * ch) / 60000),

        if (m === 60) {
            h++;
            m = 0;
        }
        if (h === 24) {
            d++;
            h = 0;
        }
        return ("```xl\n" + d + " Days, " + h + " Hours, " + m + " Minutes.\n```");
    },

    generateHasteBin: function(data, callback) {

        unirest.post('http://hastebin.com/documents')
            .send(data)
            .end(function(response) {
                if (typeof callback === "function")
                    return callback("http://hastebin.com/"+response.body.key+".txt");
            });
    },

    getRandom: function(min, max) {
      return Math.floor(Math.random() * (max - min)) + min;
    }
}
