
exports.getMemberFromGuild = function(client, guild, suffix){
	var members = client.Users.membersForGuild(guild);
	var suffix = suffix.toLowerCase();
	for(var member of members){
		if(member.id == suffix ||
		   member.username.toLowerCase().includes(suffix) ||
		   (member.nick && member.nick.includes(suffix))){
			return member;
		}
	}
}
//Function to convert a timespan into a readable time
exports.convertUnixToDate = function(t){
	var pad = function(n) {
		return n < 10 ? '0' + n : n;
	};
	var cd = 24 * 60 * 60 * 1000;
	var ch = 60 * 60 * 1000;
	var d = Math.floor(t / cd);
	var h = Math.floor((t - d * cd) / ch);
	var m = Math.round((t - d * cd - h * ch) / 60000);
	if (m === 60) {
		h++;
		m = 0;
	}
	if (h === 24) {
		d++;
		h = 0;
	}
	var mo = Math.floor(d / (365/12));
	d = d - Math.round(mo * (365/12));
	var output = "";
	if(mo != 0){
		output += mo + " Months ";
	}
	if(d != 0){
		output += d + " Days ";
	}
	if(h != 0){
		output += pad(h) + " Hours ";
	}
	output += pad(m) + " Minutes.";
	return (output);
}
//Function to convert a timestamp into a readable time
exports.unixToTime = function(UNIX_timestamp) {
	var a = new Date(UNIX_timestamp);
	var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
	var year = a.getFullYear();
	var month = months[a.getMonth()];
	var date = a.getDate();
	var hour = a.getHours();
	var min = a.getMinutes() < 10 ? '0' + a.getMinutes() : a.getMinutes();
	var sec = a.getSeconds() < 10 ? '0' + a.getSeconds() : a.getSeconds();
	var time = date + ' ' + month + ' ' + year + ' ' + hour + ':' + min + ':' + sec;
	return time;
}

exports.addUserToRole = function(client, author, originalChannel, user, guild, suffix, type){
	return new Promise (function (resolve, reject) {
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
			return reject("Error, user not found.");
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
		if(!targetRole)	return reject("Error, role not found");

		guildUser.assignRole(targetRole).then(function(){
			//If its a moderation command
			if(moderationCommand){
				if(targetChannel){
					if(suffix){
						var suffix = suffix.replace(/<@?\!?\d{17,}>/, "");
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
				if(type == "chill"){
					setTimeout(function(){
						guildUser.unassignRole(targetRole);
					}, 60000);
				}
			} else {
				originalChannel.sendMessage(author.username);
			}
			return resolve();
		}).catch(reject(err));
	});
}
