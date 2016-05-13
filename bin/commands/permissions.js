var RANKS = ["Chancellor","Admin","Councillor","Moderator","Member"];
var PERMISSION_CONST = [
    /*DEFCON-1*/["managePermissions"],
    /*DEFCON-2*/[],
    /*DEFCON-3*/["kickMembers","banMembers","manageRoles"],
    /*DEFCON-4*/["mentionEveryone"],
    /*DEFCON-5*/["sendMessages","embedLinks","attachFiles"],
];

module.exports = {
    //Check if the bot is allowed to execute a command
    isBotAllowed: function(cmd, bot, server){
        var permLevel = cmd.permLevel;
        //Minimum permissions
        if(permLevel == -1) return true;
        var roles = server.rolesOfUser(bot.user); //Roles of bot

        //We check every role of the bot
        for(var role of roles){
            /*
                We iterate over the PERMISSION_CONST array from the permission
                that the command requires to the one that requieres the minimum
                to check if the bot can execute the command
            */
            for(var i = permLevel; i < PERMISSION_CONST.length; i++){
                for(var j = 0; j < PERMISSION_CONST[i].length; j++){
                    if(!role.hasPermission(PERMISSION_CONST[i][j])) return false;
                }
            }
        }
        return true;
    },

    isUserAllowed: function(author, server, permLevel){

        var roles = server.rolesOfUser(author); //Roles of bot
        //Minimum permissions
        if(permLevel == -1) return true;
        var requiredRank = RANKS[permLevel];
        for(var role of roles){
            /*
                Check if the user is in any of the roles needed to execute
                the command
            */
            for(var i = 0; i <= RANKS.indexOf(requiredRank); i++){
                if(role.name == requiredRank) return true;
            }
        }
        return false;


    },

}
