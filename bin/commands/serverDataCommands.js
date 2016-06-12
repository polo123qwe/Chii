var utils = require('../utils.js');

module.exports = {
    ava: {
        permissions: -1,
        run: function(message, bot){

            if(message.channel.isPrivate) return;
            var server = message.channel.server;
            if(message.channel == server.defaultChannel) { return; } //Ignore messages from #general to prevent spam

            var splitted = message.content.split(" ");
            var user;
            if(splitted[1] == null) user = message.author;
            else{
                var userID = splitted[1].replace(/<|@|>/ig,"");
                user = bot.users.get("id", userID);
            }
            if(user != null){
                bot.sendMessage(message, user.avatarURL);
            }
        },
        help: "`ava! <@user>` - returns avatar of @user",
    },

    id: {
        permissions: -1,
        run: function(message, bot){

            if(message.channel.isPrivate) return;
            var server = message.channel.server;
            if(message.channel == server.defaultChannel) { return; } //Ignore messages from #general to prevent spam

            var splitted = message.content.split(" ");
            var user;
            if(splitted[1] == null) user = message.author;
            else{
                var userID = splitted[1].replace(/<|@|>/ig,"");
                user = bot.users.get("id", userID);
            }
            if(user != null){
                bot.sendMessage(message, user.id);
            }
        },
        help: "`id! <@user>` - returns id of @user",
    },

    channelid: {
        permissions: -1,
        run: function(message, bot){
            bot.sendMessage(message, message.channel.id);
        },
        help: "`channelid!` - returns id of the current channel",
        cd: 1000
    },

    joined: {
        permissions: -1,
        run: function(message, bot){

            if(message.channel.isPrivate) return;
            var server = message.channel.server;
            if(message.channel == server.defaultChannel) { return; } //Ignore messages from #general to prevent spam

            var splitted = message.content.split(" ");
            var users = utils.getMentions(message, bot);
            if(users.length == 0) users = [message.author];

            for(var user of users){
                var join = server.detailsOfUser(user).joinedAt;
                join = utils.unixToTime(join);

                bot.sendMessage(message, user.name + ' joined ' + join);
            }
        },
        help: "`joined! [@user]` - returns date when the @user joined, if no user is provided it uses the author.",
    },

    mycolor: {
        permissions: -1,
        run: function(message, bot){

            if(message.channel.isPrivate) return;
            var server = message.channel.server;
            if(message.channel == server.defaultChannel) { return; } //Ignore messages from #general to prevent spam

            var userRoles = server.rolesOfUser(message.author);

            for(var role of userRoles){
                if(role.name == message.author.id){
                    bot.sendMessage(message, "Your color is " + role.colorAsHex());
                    return;
                }
            }
            bot.sendMessage(message, "You have no color.");
        },
        help: "`mycolor!` - returns your current color.",
    },

    randu: {
        permissions: -1,
        run: function(message, bot){

            if(message.channel.isPrivate) return;
            var server = message.channel.server;
            if(message.channel == server.defaultChannel) { return; } //Ignore messages from #general to prevent spam

            //Select a random user
            for(var user of server.members){
                var found = false;
                for(var role of server.rolesOfUser(user)){
                    if(role.name == "Member"){
                        found = true;
                        break;
                    }
                }
                if(!found){
                    server.members.remove(user);
                }
            }
            var randomUser = server.members.random();

            bot.sendMessage(message, randomUser.name + "!");
        },
        help: "`randu!` - returns a random user.",
        cd: 240000,
    },

    uptime: {
        permissions: -1,
        run: function(message, bot){

            if(message.channel.isPrivate) return;
            var server = message.channel.server;
            if(message.channel == server.defaultChannel) { return; } //Ignore messages from #general to prevent spam

            var time = utils.millisecondsConversion(bot.uptime);
            var output = "Bot has been running for " + time;

            bot.sendMessage(message, output);
        },
        help: "`uptime!` - returns bot uptime.",
    },

    getlog: {
        permissions: 2,
        run: function(message, bot, sqldb){

            if(message.channel.isPrivate) return;
            var server = message.channel.server;

            //If the database exists
            if(!sqldb) return;

            //Set the limit
            var limit = message.content.split(" ")[1];
            var user = utils.getMentions(message, bot)[0];

            if(!limit) return;
            if(user){
                sqldb.getFilteredChannelLog(message.channel.id, limit, user.id, message.author, bot);
            } else{
                sqldb.getChannelLog(message.channel.id, limit, message.author, bot);
            }
            bot.deleteMessage(message, function(err){
                if(err) console.log(err);
            });

        },
        help: "`getlog! <amount> [@user]` - returns the amount of msgs sent and filtered by user (optional).",
    },
}
