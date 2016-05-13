var usersInCD = {};

module.exports = {
    help: {
        permissions: -1,
        run:function(message, bot){
            bot.sendMessage(message, "No help yet :p");
        },
        help: "help! returns help",
    },

    ping: {
        permissions: -1,
        run: function(message, bot){
            var outputMessage = "Pong! ("+(Date.now()-message.timestamp)+"ms)";
            bot.sendMessage(message, outputMessage);
        },
        help: "ping! - returns pong!",
    },

    // warn: {
    //
    // },

    color: {
        permissions: 4,
        run: function(message, bot){

            //TEMPORARY THING PLS TODO BETTER
            if(message.channel.id != "143976784545841161") return;

            var usersMentioned = message.mentions;
            var inputHexValue = message.content.split(" ")[1];
            var authorID = message.author.id;
            //RemoveColors

            //Check if the user has typed the command correctly
            if(!inputHexValue){
                return errorInput();
            }

            //Check the value is a hex-length value
            var hexValue = inputHexValue;
            if(hexValue.length == 6){
                hexValue = "0x"+hexValue;
            } else if(hexValue.length == 7 && hexValue[0] == "#"){
                hexValue = "0x"+hexValue.splice(1, hexValue.length);
            } else {
                return errorInput();
            }

            //Do nothing if it was invoked in a Private Message
            if(message.channel.isPrivate) return;
            var server = message.channel.server;

            //Check last time the author used the command
            if(usersInCD.hasOwnProperty(authorID)){
                if(usersInCD[authorID] == null){
                    usersInCD[authorID] = Date.now();
                }
                var timeSpan = Date.now() - usersInCD[authorID];
                console.log(Date.now() - usersInCD[authorID]);
                if(timeSpan < 3600000){
                    bot.sendMessage(message, "On cooldown, "+((360000-timeSpan)/1000)+"s");
                }
            }
            usersInCD[authorID] = Date.now();
            //Search any role containing Hex in the roles of the user
            //Get first user mentioned
            var userRoles = server.rolesOfUser(message.author);
            var found = false;

            for(var role of userRoles){
                if(role.name == authorID){
                    found = true;
                    bot.updateRole(role, {color : parseInt(hexValue)}, function(err, role){
                        if(err) console.dir(err);
                        // bot.sendMessage(channel, "Color changed sucessfully.");
                    });
                }
            }
            if(!found) updateColor(message.author, hexValue);

            //Function to display an error
            function errorInput(){
                bot.sendMessage(message, "Incorrect usage, type color! hexValue");
                return;
            }
            //Function to add a memeber to a role
            function updateColor(user, hexValue){
                var roleToAddUserTo = null;
                IterateRoles:
                for(var role of server.roles){
                    if(role.name == authorID){
                        roleToAddUserTo = role;
                        break IterateRoles;
                    }
                }
                //If no role found
                if(roleToAddUserTo == null){
                    bot.createRole(server, {name : authorID, color : parseInt(hexValue)}, function(err, role){
                        console.log(role.name+" at "+role.position);
                        if(err) console.dir(err);
                        addMemberToRole(bot, user, role, message.channel);
                    });
                    return;
                }
                addMemberToRole(bot, user, roleToAddUserTo, message.channel);
            }
        },
        help: "color! HexValue - Gives user a color",
    },
}

//Add a user to a role
function addMemberToRole(bot, user, role, channel){
    bot.addMemberToRole(user, role, function(err){
        if(err) console.dir(err);
        // else if(channel)
            // bot.sendMessage(channel, "Color changed sucessfully.");
    });
}
