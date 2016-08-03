var CommandArray = [];
var utilsLoader	= require('../../utils/utilsLoader.js');
var clog = utilsLoader.clog;
var utils = utilsLoader.generalUtils;
var db = utilsLoader.db;
var config = require('../../config.json');

CommandArray.join = {
  name		: 'join',
  help		: "Allows user to join a role",
  cooldown	: 5,
  levelReq	: 0,
  clean		: 1,
  exec: function (client, msg, suffix) {

	  //Array where the roles will be saved
	  var rolesToAdd = [];
	  var input = suffix.split(" ");

	  var allRoles = msg.channel.guild.roles;
	  //Check every role the user typed
	  for(var role of input){
		  //If its one of the optional roles
		  for(var r of config.userroles.roles){
		  	  if (role.toLowerCase() == r[0]){
				  //If its not already added
				  if(rolesToAdd.indexOf(r[1]) == -1){
					  //Add to the array of roles to add
					  rolesToAdd.push(r[1]);
				  }
				  break;
			  }
		  }
	  }
	  //We add the roles we found
	  for(var role of allRoles){
		  if(rolesToAdd.indexOf(role.name) != -1){
			  var guildUser = client.Users.getMember(msg.channel.guild, msg.author);
			  if(!guildUser){
				  msg.channel.sendMessage("Error, cannot find user.");
			  }
			  guildUser.assignRole(role).then(reply(msg.channel, msg.author.username + " added to " + role.name)).catch(function(err){
				  clog.logError("ERROR", err);
			  });
		  }
	  }
  }
}

CommandArray.member = {
	name		: 'member',
	help		: "Gives membership to a user",
	cooldown	: 5,
	levelReq	: 2,
	clean		: 1,
	exec: function (client, msg, suffix) {
		utils.addUserToRole(client, msg.author, msg.originalChannel, msg.mentions[0], msg.channel.guild, suffix, "member").then(function(){
			msg.channel.sendMessage(msg.mentions[0].username + " added to member successfully")
		});
	}
 }

function reply(channel, message){
	channel.sendMessage(message);
}

exports.CommandArray = CommandArray;
