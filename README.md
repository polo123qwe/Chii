# Chii
Chii is a Discord bot. Yup.

## List of commands
**Note**: The arguments of the commands between `<>` are mandatory, while the ones between `[]` are optional.

#### Internet search commands
* `time! <gmt+/-x>` - Displays current time in the timezone of your choosing.
* `weather! <city>` - Displays the current weather in the city that you typed.
* `urban! <word/s>` - Searches Urban Dictionary for the definition of the words.
* `mal! <user>` - Gives a link to a user's MAL profile.
* `osu! <username> [std, ctb, mania, taiko]` - Displays the osu profile info of the user that you typed.
* `anime! <name>` - Searches MAL and displays the information of the anime you typed.
* `manga! <name>` - Searches MAL and displays the information of the manga you typed.

#### Self-assignable roles
* `lood!` - Gives you access to the NSFW text channel.
* `food!` - Gives you access to the food text channel.
* `coder!` - Gives you access to coding-related text channels.
* `rp!` - Gives you access to the roleplaying text channel.
* `suicide!` - Mute yourself for 1 minute.
* `color! <#A-F0-9>` - Gives you a colored name. The color should be in hexadecimal.

#### Moderation commands
* `refresh!` - Restarts the bot.
* `member! <@user>` - Gives the user the member role.
* `chill! <@user>` - Chills the user (chill = mute for 1 minute).
* `warn! <@user> [reason]` - Warns the user, giving them a role and restricting their chat features.
* `mute! <@user> [reason]` - Mutes the user, preventing them from chatting in any channel.
* `kick! <@user> [reason]` - Kicks the user and logs the kick, reason and person that kicked.
* `clearroles!` - Removes the 'empty' roles.

#### Server data commands
* `ava! [@user]` - Shows the avatar of the user. If no user was mentioned, it shows your own avatar.
* `id! [@user]` - Shows the user ID of the user mentioned. If no user was mentioned, it shows your own user ID.
* `channelid!` - Shows the ID of the channel in which the message was sent.
* `joined! [@user]` - Displays the date the user joined. If no user was mentioned, it displays the date you joined.
* `mycolor!` - Displays your current role color.
* `randu!` - Returns a random user from the server.
* `uptime!` - Shows the bot's uptime.
* `getlog! [amount] [@user(opt)]` - returns the amount of msgs sent and filtered by user (optional).
* `ping!` - Returns a pong message with the latency to the server.

