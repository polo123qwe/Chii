var CommandArray  = [];
var clog          = require('../../utils/clog.js');
var config        = require('../../config.json');
var db          = require('../../utils/db.js');

var types = ['country', 'bday', 'name'];

CommandArray.add = {
  name		: 'add',
  help		: "Adds to db member",
  cooldown	: 0,
  levelReq	: 0,
  clean		: 0,
  exec: function (client, msg, suffix) {
    if(suffix == null) return;
    var target;

	//If there is a suffix
	if(!suffix){
      target = msg.author.id;
    } else {
      target = suffix;
    }
    for(var member of msg.channel.guild.members){
      if(member.id == target){
        db.logging.storeUserDB(member).then(function(){
          msg.channel.sendMessage(member.name + "Added successfully!");
        })/*.catch(function(err){console.log(err);});*/
        return;
      }
    }
  }
}

CommandArray.set = {
  name		: 'set',
  help		: "Adds the setting to member of the db",
  cooldown	: 0,
  levelReq	: 0,
  clean		: 0,
  exec: function (client, msg, suffix) {
    if(suffix == null) return;

    var splittedMessage = suffix.split(" ");
    var type = splittedMessage[0];
    if(type && types.indexOf(type) != -1){
        //TODO
    }
  }
}

exports.CommandArray = CommandArray;
