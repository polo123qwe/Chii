var CommandArray = [];
var utilsLoader = require('../../utils/utilsLoader.js');
var clog = utilsLoader.clog;
var utils = utilsLoader.generalUtils;
var db = utilsLoader.db;
var config = require('../../config.json');
api_key = require("../../config.json").apis.osu;
var osuapi = require('osu-api');
var osu_a = new osuapi.Api(api_key);

CommandArray.osu = {
    name: 'osu',
    usage: 'username [std, ctb, mania, taiko]',
    help: "Returns data for that player in osu",
    cooldown: 5,
    levelReq: 0,
    clean: 0,
    exec: function(client, msg, suffix) {

        var splitted = suffix.split(" ");
        if (splitted[0] == null) return;

        var username;
        var mode = splitted[1];
        var mode_string;

        //Separate the suffix into 2 parts
        if (splitted[1] == null) {
            username = splitted.splice(0, splitted.length).join(" ");
        } else username = splitted.splice(0, splitted.length - 1).join(" ");

        switch (mode) {
            case "std":
                mode = osuapi.Modes.osu;
                mode_string = "Osu!";
                break;
            case "ctb":
                mode = osuapi.Modes.CtB;
                mode_string = "CatchTheBeat";
                break;
            case "mania":
                mode = osuapi.Modes.osumania;
                mode_string = "Osu!Mania";
                break;
            case "taiko":
                mode = osuapi.Modes.taiko;
                mode_string = "Taiko";
                break;
            default:
                mode = osuapi.Modes.osu;
                mode_string = "Standard";
        }

        osu_a = new osuapi.Api(api_key, mode);

        osu_a.getUser(username, function(err, out) {
            if (err != null) {
                console.log("Error " + err);
            }
            if (out == null) out = "No user found";
            else out = stringify(out, mode_string);
            msg.channel.sendMessage(out);
        });

        return;

        function stringify(out, mode_string) {
            var str = '';
            str = 'User ' + out.username + ' at ' + mode_string + ' is rank #' + out.pp_rank +
                ' (' + out.pp_raw + 'pp) ' + (Math.round(out.accuracy * 100) / 100) + "% acc" +
                '\n' + 'https://osu.ppy.sh/u/' + out.user_id;
            return str;
        }
    }
}

CommandArray.urban = {
    name: 'urban',
    usage: 'keyword',
    help: "Searches in Urban Dictionary for a definition",
    cooldown: 5,
    levelReq: 0,
    clean: 0,
    exec: function(client, msg, suffix) {
        var splitted = suffix.split(" ");

        if (splitted[0] == null) {
            msg.channel.sendMessage("Not enough arguments.");
        } else {
            var result = suffix.toString().split(",").join("+");
            msg.channel.sendMessage("http://www.urbandictionary.com/define.php?term=" + result);
        }
    }
}

exports.CommandArray = CommandArray;
