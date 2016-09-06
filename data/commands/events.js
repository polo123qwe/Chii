var CommandArray = [];
var utilsLoader = require('../../utils/utilsLoader.js');
var clog = utilsLoader.clog;
var utils = utilsLoader.generalUtils;
var db = utilsLoader.db;
var config = require('../../config.json');

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
            if(splitted.length > 1){
                description = splitted.splice(1, splitted.length).join(" ");
            }
            db.logging.log("event", [eventName, msg.guild.id, msg.timestamp, description]).then(() => {
                //Notify of success
            }).catch(e => {
                //Notify user that event with that name exsists
            });
        }
    }
}*/

//TODO listEvents, registerEvent, deleteEvent, notifyUSersInEvent,


exports.CommandArray = CommandArray;
