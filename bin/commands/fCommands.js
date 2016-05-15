var osuapi = require('osu-api');
api_key = 'dc812256092ebf90b7031d3ea96f061a6dd64504';
var osu_a = new osuapi.Api(api_key);

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

    osu: {
        permissions: -1,
        run: function(message, bot){

            var splitted = message.content.split(" ");
            if(splitted[1] == null) bot.sendMessage(message, "Not enough parameters `osu! username <std, ctb, mania, taiko>`.");

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
    }
}
