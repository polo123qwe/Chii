var CommandArray  = [];
var clog          = require('../../utils/clog.js');
var config        = require('../../config.json');
var db          = require('../../utils/db.js');

var types = ['country', 'bday', 'name'];

CommandArray.disable = {
  name		: 'disable',
  help		: "Disables the bot in channel",
  module	: 'database',
  cooldown	: 0,
  levelReq	: 0,
  clean		: 0,
  exec: function (client, msg, suffix) {

	  var channel = msg.channel;
	  if(suffix){
		  for(var chan of client.Channels.textForGuild(msg.channel.guild)){
			  if(chan.id == suffix || chan.name.toLowerCase() == suffix.toLowerCase()){
				  channel = chan;
				  break;
			  }
		  }
	  }
	  db.fetch.getChannelConfig(channel.id).then(function(query){
		  var disabled = false;
		  if(query.rowCount > 0){
			  disabled = !query.rows[0].enabled;
		  }

		  db.logging.storeChannelDB(channel, disabled).then(function(){
			if(disabled){
				msg.channel.sendMessage('Messages enabled in <#'+ channel.id +'> successfully');
			} else {
				msg.channel.sendMessage('Messages disabled in <#'+ channel.id +'> successfully');
		    }
		  }).catch(function(err){
			console.log(err);
		 });
	  }).catch(function(err){
		  console.log(err);
	  })

  }
}

exports.CommandArray = CommandArray;
