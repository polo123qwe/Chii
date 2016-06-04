var osuapi = require('osu-api');
api_key = require("../../config.json").osuKey;
var malUser = require("../../config.json").malUser;
var malPass = require("../../config.json").malPass;
var osu_a = new osuapi.Api(api_key);
var request = require("request");
var xml2js = require("xml2js");
var ent = require("entities");

module.exports = {
    urban: {
        permissions: -1,

    	run: function(message, bot){
            var splitted = message.content.split(" ");

    		if (splitted[1] == null){
    			bot.sendMessage(message, "Not enough arguments.");
    		} else {
    			var result = splitted.splice(1, splitted.length);
    			result = result.toString().split(",").join("+");
    			bot.sendMessage(message, "http://www.urbandictionary.com/define.php?term="+result);
    		}
    	},

    	help: "urban! word - Searches Urban Dictionary for a definition",
    },

    mal: {
        permissions: -1,

        run: function(message, bot){
            var splitted = message.content.split(" ");

            if (splitted[1] == null){
                bot.sendMessage(message, "Not enough arguments.");
            } else {
                var result = splitted.splice(1, splitted.length);
                result = result.toString().split(",").join("+");
                bot.sendMessage(message, "http://myanimelist.net/profile/"+result);
            }
        },

        help: "mal! username - Links the MAL account of a given username",
    },

    osu: {
        permissions: -1,
        run: function(message, bot){

            var splitted = message.content.split(" ");
            if(splitted[1] == null) return;

            var username;
            var mode = splitted[2];
            var mode_string;

            if(splitted[2] == null){
                username = splitted.splice(1, splitted.length-1).join(" ");
            }   else username = splitted.splice(1, splitted.length-2).join(" ");

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

            osu_a.getUser(username, function(err, out){
                if(err != null){
                    console.log("Error "+err);
                }
                if(out == null) out = "No user found";
                else out = stringify(out, mode_string);
                bot.sendMessage(message, out);
            });

            return;

            function stringify(out, mode_string){
                var str = '';
                str =   'User '+out.username+' at '+mode_string+' is rank #'+out.pp_rank+
                        ' ('+out.pp_raw+'pp) '+(Math.round(out.accuracy*100)/100)+"% acc"+
                        '\n'+'https://osu.ppy.sh/u/'+out.user_id;
                return str;
            }

        },
        help: "osu! username <std, ctb, mania, taiko> - returns the profile info",
    },

    /* Anime - Gets anime from MAL */
    anime: {
      permissions: -1,
      run: function(msg, bot) {
        var msgSplit = msg.content.split(" ");
        var suffix = msg.content.substring(msgSplit[0].length + 1, msg.content.length);

        bot.sendMessage(msg, suffix);

        if(msgSplit[1] == null) {
          bot.sendMessage(msg, "**Error**: No anime title found.", function(err, bm) {bot.deleteMessage(bm, {"wait": 8000});});
          return;
        }

        if (!malUser || !malPass || malUser == "" || malPass == "") {
          bot.sendMessage(msg, "**Error**: MAL username and password are not set up correctly.", function(err, bm) {bot.deleteMessage(bm, {"wait": 8000});});
          return;
        }

        if (/[\uD000-\uF8FF]/g.test(suffix)) {
          bot.sendMessage(msg, "**Error**: Your search contains illegal characters.", function(err, bm) {bot.deleteMessage(bm, {"wait": 8000});});
          return;
        }

        bot.startTyping(msg.channel);

        var animeURL = `http://myanimelist.net/api/anime/search.xml?q=${suffix}`;

        request(animeURL, {"auth": {"user": malUser, "pass": malPass, "sendImmediately": false}}, function(error, response, body) {
          if (error) console.log(error);
          if (response.statusCode == 200) {
            xml2js.parseString(body, (err, result) => {
              var title = result.anime.entry[0].title;
              var english = result.anime.entry[0].english;
              var ep = result.anime.entry[0].episodes;
              var score = result.anime.entry[0].score;
              var type = result.anime.entry[0].type;
              var status = result.anime.entry[0].status;
              var syno = result.anime.entry[0].synopsis.toString();
              var id = result.anime.entry[0].id;

              syno = ent.decodeHTML(syno.replace(/<br \/>/g, " ").replace(/\[(.{1,10})\]/g, "").replace(/\r?\n|\r/g, " ").replace(/\[(i|\/i)\]/g, "*").replace(/\[(b|\/b)\]/g, "**"));

              if (!msg.channel.isPrivate && syno.length > 340) {
								syno = syno.substring(0, 340) + '...';
              }

              if(english == "") {
                english = "-";
              }

              bot.sendMessage(msg, "**" + title + " / " + english + "**\n**Type:** " + type + " **| Episodes:** " + ep + " **| Status:** " + status + " **| Mean Score:** " + score + "\n" + syno + "\n**<http://www.myanimelist.net/anime/" + id + ">**");
            });
          }
        });
        bot.stopTyping(msg.channel);
      },
      help: "`anime! <anime name>` - Gets the details of an anime from MAL."
    }
}
