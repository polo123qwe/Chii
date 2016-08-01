var CommandArray = [];
var utilsLoader	= require('../../utils/utilsLoader.js');
var clog = utilsLoader.clog;
var utils = utilsLoader.generalUtils;
var db = utilsLoader.db;
var config = require('../../config.json');


CommandArray.member = {
  name		: 'member',
  help		: "Adds a user to the member role",
  cooldown	: 5,
  levelReq	: 2,
  clean		: 1,
  exec: function (client, msg, suffix) {
	  var member;
	  var guild = msg.channel.guild;
	  if(!suffix){
		  msg.channel.sendMessage("No suffix supplied!");
	  }
	  member = msg.mentions[0];
	  if(member){
		  member = client.Users.getMember(guild, member);
	  }
	  if(!member){
		  member = utils.getMemberFromGuild(client, guild, suffix);
	  }
	  if(!member){
		  msg.channel.sendMessage("No user found");
		  return;
	  }
	  var roleName = "member";
	  var roleID;

	  db.fetch.getServerConfig(msg.channel.guild.id).then(function(query){
		  if(query.rowCount > 0){
			if(query.rows[0].memberrole){
			  	roleID = query.rows[0].memberrole;
			}
		}
		for(var role of guild.roles){
			if(role.name.toLowerCase() == roleName || (roleID && role.id == roleID)){
			  member.assignRole(role).then(function(){
				  msg.channel.sendMessage(member.name + " added successfully to " + roleName);
			  }).catch(function(err){
				  clog.logError("COMMAND ERROR", err);
			  });
			}
		}
	  });
  }
}

CommandArray.warn = {
	name		: 'warn',
    help		: "Warns a user",
    cooldown	: 5,
    levelReq	: 2,
    clean		: 0,
	exec: function (client, msg, suffix) {
		console.log(suffix); //TODO FIX
		//console.log(suffix.replace("\\<.*?\\>/g", ""));
		var output = addUserToRole(client, msg.author, msg.channel, msg.mentions[0], msg.channel.guild, suffix, "warn");
		if(output)
			msg.channel.sendMessage(output);
	}
}

exports.CommandArray = CommandArray;

function addUserToRole(client, author, originalChannel, user, guild, suffix, type){

	var guildUser;
	var moderationCommand = false;

	//We check if its a moderation command
	if(type == "chill" || type == "mute" || type == "warn"){
		switch (type) {
			case "chill":
				type = "chilling"; break;
			case "mute":
				type = "muted"; break;
			case "warn":
				type = "warned"; break;
		}
		moderationCommand = true;
		guildUser = client.Users.getMember(guild, user);
	} else {
		guildUser = client.Users.getMember(guild, author);
	}

	if(!guildUser){
		return "Error, user not found.";
	}

	var targetChannel, targetRole;

	//If its a moderation command
	if(moderationCommand){
		var channels = client.Channels.textForGuild(guild);
		//Search for the channel to log
		for(var channel of channels){
			if(channel.name == "log" || channel.name == "logs"){
				targetChannel = channel;
				break;
			}
		}
	}
	//Search for the role
	for(var role of guild.roles){
		if(role.name.toLowerCase() == type){
			targetRole = role;
			break;
		}
	}

	//If failed to find the role
	if(!targetRole)	return "Error, role not found";

	guildUser.assignRole(targetRole).then(function(){
		//If its a moderation command
		if(moderationCommand){
			if(targetChannel){

				if(suffix){
					var suffix = suffix.replace("\\<@.*?\\>", "");
					targetChannel.sendMessage(user.username + " " + type + " by: " + author.username + ", reason: " + suffix);
				} else {
					targetChannel.sendMessage(user.username + " " + type + " by: " + author.username);
				}
			}
			//Store the change in the db
			if(type == "chill" || type == "warn"){
				db.logging.updateUser(user, dbcolumn + "ed");
			} else {
				db.logging.updateUser(user, dbcolumn + "d");
			}
		} else {
			originalChannel.sendMessage(author.username)
		}
		return;
	});

}
