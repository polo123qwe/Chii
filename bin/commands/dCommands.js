var utils = require('../utils.js');

module.exports = {
    ava: {
        permissions: -1,
        run: function(message, bot){
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
        help: "ava! <@user> - returns avatar of @user",
    },

    id: {
        permissions: -1,
        run: function(message, bot){
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
        help: "id! <@user> - returns id of @user",
    },

    channelid: {
        permissions: -1,
        run: function(message, bot){
            bot.sendMessage(message, message.channel.id);
        },
        help: "id! <@user> - returns id of @user",
    },

    joined: {
        permissions: -1,
        run: function(message, bot){
            var splitted = message.content.split(" ");
            var users = message.mentions;
            if(users.length == 0) users = [message.author];

            if(message.channel.isPrivate) return;
            var server = message.channel.server;

            for(var user of users){
                var join = server.detailsOfUser(user).joinedAt;
                join = utils.unixToTime(join);

                bot.sendMessage(message, user.name + ' joined ' + join);
            }
        },
        help: "joined! <@user>(opt) - returns date when the @user joined, if no user is provided it uses the author.",
    },
}
