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
}
