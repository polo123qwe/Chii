var CommandArray = [];
var clog = require('../../utils/clog.js');
var config = require('../../config.json');
var db = require('../../utils/db.js');

CommandArray.setlevel = {
	name		: 'setlevel',
	usage		: "level @role/role",
    help		: "Sets the permission level of a role. Role names are case-sensitive.",
    module		: 'permsandcustom',
    cooldown	: 1,
    levelReq	: 3,
    clean		: 0,
    exec: function (client, msg, suffix) {
    	var suffixArray = suffix.split(" ");
		if (isNaN(suffixArray[0]) || suffixArray[0] < -1 || suffixArray[0] > 3) {
			msg.channel.sendMessage(':warning: Your first parameter **has** to be a number between -1 and 3');
			return;
		}

		if (msg.mention_roles.length === 0) {
			var roleName = suffixArray[1];
			var roleObject = findKey(roleName, msg.guild.roles);

			if (!roleObject) { msg.channel.sendMessage(':warning: Role name is invalid!'); return; }

			db.perms.adjustRoleLevel(msg, roleObject.id, suffixArray[0]).then(function () {
				msg.channel.sendMessage(':white_check_mark: Role `' + roleObject.name + '` was successfully set to level **' + suffixArray[0] + '**');
			}).catch(function (err) {
				msg.channel.sendMessage(':warning: Something went wrong! (check console)');
				clog.logError("UPDATE ROLE", err);
			});
		}
    }
}

exports.CommandArray = CommandArray;

/**
 * HELPER FUNCTIONS
 */
function findKey(nameKey, array) {
	for (var i = 0; i < array.length; i++) {
		if (array[i].name === nameKey) {
			return array[i];
		}
	}
}
