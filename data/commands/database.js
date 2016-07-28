var CommandArray  = [];
var clog          = require('../../utils/clog.js');
var config        = require('../../config.json');
var db          = require('../../utils/db.js');

CommandArray.add = {
  name		: 'add',
  help		: "Adds to db member",
  module	: 'database',
  cooldown	: 0,
  levelReq	: 0,
  clean		: 0,
  exec: function (client, msg, suffix) {

    if(suffix == null) return;

    var target;

    /*if(isNaN(suffix)){
      target = msg.author.id;
    } else {*/
      target = suffix;
    /*}*/
    for(var member of msg.channel.guild.members){
      if(member.id == target){
        console.log("found " + member.name);
        db.storeUserDB(member).then(function(){
          msg.channel.sendMessage("Added successfully!");
        })/*.catch(function(err){
          console.log(err);
        });*/
        return;
      }
    }
  }
}

exports.CommandArray = CommandArray;
