var CommandArray = [];
var utilsLoader	= require('../../utils/utilsLoader.js');
var clog = utilsLoader.clog;
var utils = utilsLoader.generalUtils;
var db = utilsLoader.db;
var config = require('../../config.json');

CommandArray.joined = {
  name		: 'joined',
  help		: "Prints the date the user joined",
  cooldown	: 5,
  levelReq	: 0,
  clean		: 1,
  exec: function (client, msg, suffix) {
	  var user, guildUser;
	  var guild = msg.channel.guild;
	  if(!suffix){
		  member = msg.author;
	  } else {
		  member = msg.mentions[0];
	  }
	  if(member){
		  guildUser = client.Users.getMember(guild, member);
	  }
	  if(!member){
		  guildUser = utils.getMemberFromGuild(client, guild, suffix);
	  }
	  if(!guildUser){
		  guildUser = client.Users.getMember(guild, message.author);
	  }
	  var joined = new Date(guildUser.joined_at).getTime()
	  var time = utils.convertUnixToDate(Date.now() - joined);
	  //Create the output string
	  var output = "```xl\n" + guildUser.username + "#" + guildUser.discriminator + ": " + utils.unixToTime(guildUser.joined_at);
	  output += "\n" + time + "\n```";
	  msg.channel.sendMessage(output);
  }
}

exports.CommandArray = CommandArray;
