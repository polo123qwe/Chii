var CommandArray = [];
var utilsLoader = require('../../utils/utilsLoader.js');
var clog = utilsLoader.clog;
var utils = utilsLoader.generalUtils;
var dUtils = utilsLoader.discordUtils;
var db = utilsLoader.db;
var config = require('../../config.json');

//UPDATE DB TOO
/*CommandArray.addevent = {
    usage: 'name [description]',
    help: "Creates an event",
    cooldown: 5,
    levelReq: 0,
    clean: 0,
    exec: function(client, msg, suffix) {
        //name, server_id, timestamp, desc
        if(!suffix){
            //ERROR No suffix provided
        } else {
            var splitted = suffix.split(" ");
            var eventName = splitted[0];
            var description;
            var data = [eventName, msg.guild.id, msg.timestamp];
            if(splitted.length > 1){
                description = splitted.splice(1, splitted.length).join(" ");
                data.push(description);
            }
            db.logging.log("event", data).then(() => {
                //Notify of success
            }).catch(e => {
                if(e.code == "23505"){
                    msg.channel.sendMessage("Event with that name alrady exists!");
                } else {
                        console.log(e);
                }
                //Notify user that event with that name exsists
            });
        }
    }
}

CommandArray.delevent = {
    usage: 'name',
    help: "Deletes an event",
    cooldown: 5,
    levelReq: 0,
    clean: 0,
    exec: function(client, msg, suffix) {

    }
}*/


//TODO listEvents, registerEvent, unregisterEvent, deleteEvent, notifyUSersInEvent,


exports.CommandArray = CommandArray;
