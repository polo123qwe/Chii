var Discordie = require('discordie');
var config = require('../config.json');
var colors = require('fs').readFileSync('hex.txt').toString().split('\r\n');
colors = colors.splice(0, colors.length - 1);

var Events = Discordie.Events;

var client = new Discordie({
    autoReconnect: true,
});

client.Dispatcher.on(Events.GATEWAY_READY, e => {
    console.log("Loader Ready!");

});

client.Dispatcher.on(Events.MESSAGE_CREATE, e => {

    if (e.message.content == "chii.createroles") {
        var guild = e.message.channel.guild;
        var user = e.message.author;
        processColor(0);

        function processColor(i) {
            if (i >= colors.length) {
                console.log("Finished!");
            } else {
                for (var role of guild.roles) {
                    if (role.name == colors[i]) {
                        return processColor(i + 1);
                    }
                }
                setTimeout(function() {
                    guild.createRole().then(role => {
                        var perms = role.permissions;
                        for (var x in perms.General) {
                            perms.General[x] = false;
                        }
                        for (var x in perms.Text) {
                            perms.Text[x] = false;
                        }
                        for (var x in perms.Voice) {
                            perms.Voice[x] = false;
                        }

                        var newRoleName = colors[i];

                        var color = colors[i].substr(1, colors[i].length);
                        var hexColor = parseInt("0x" + color);

                        role.commit(newRoleName, hexColor, false, false).then(() => {
                            console.log(i + ". Role " + newRoleName + " created successfully");
                            processColor(i + 1);
                        });
                    }).catch(err => console.log("Failed to create role:", err));
                }, 1000);
            }
        }
    } else if (e.message.content == "chii.removeroles") {
        var guild = e.message.channel.guild;
        var user = e.message.author;
        var roles = guild.roles;
        removeRole(0);

        function removeRole(i) {
            if (i >= roles.length) {
                console.log("Finished!");
            } else {
                var role = roles[i].name;
                if (colors.includes(role)) {
                    setTimeout(function() {
                        roles[i].delete().then(function() {
                            console.log(i + " " + role + " role deleted");
                            removeRole(i + 1);
                        }).catch(function(err) {
                            console.log(err);
                            removeRole(i + 1);
                        })
                    }, 1000);
                } else {
                    removeRole(i + 1);
                }
            }
        }
    } else if (e.message.content == "chii.removeids") {
        var guild = e.message.channel.guild;
        var user = e.message.author;
        var roles = guild.roles;
        removeRole(0);

        function removeRole(i) {
            if (i >= roles.length) {
                console.log("Finished!");
            } else {
                var role = roles[i].name;
                if (!isNaN(role)) {
                    setTimeout(function() {
                        roles[i].delete().then(function() {
                            console.log(i + " " + role + " role deleted");
                            removeRole(i + 1);
                        }).catch(function(err) {
                            //console.log(err);
                            removeRole(i + 1);
                        })
                    }, 1000);
                } else {
                    removeRole(i + 1);
                }
            }
        }
    }

});

/* Client Login */
if (config.bot.selfbot && config.bot.email != "" && config.bot.password != "") {
    client.connect({
        email: config.bot.email,
        password: config.bot.password
    });
} else {
    client.connect({
        token: config.bot.token
    });
}
