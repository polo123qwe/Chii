var cooldowns = {}

module.exports = {
    //Return
    getMentions: function(message, bot){
        var splitted = message.content.split(" ");
        var mentions = [];
        for(var id of splitted){
            if(id[0] == "<" && id[id.length-1] == ">" && id.length){
                var user;
                if(id.includes("@!")){
                    user = bot.users.get("id", id.replace(/<|@!|>/ig,""));
                } else if (id.includes("@")){
                    user = bot.users.get("id", id.replace(/<|@|>/ig,""));
                }
                if(user)
                    mentions.push(user);
            }
        }
        return mentions;
    },

    //Convert a timestamp to unix
    unixToTime: function(UNIX_timestamp){
      var a = new Date(UNIX_timestamp);
      var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
      var year = a.getFullYear();
      var month = months[a.getMonth()];
      var date = a.getDate();
      var hour = a.getHours();
      var min = a.getMinutes() < 10 ? '0' + a.getMinutes() : a.getMinutes();
      var sec = a.getSeconds() < 10 ? '0' + a.getSeconds() : a.getSeconds();
      var time = date + ' ' + month + ' ' + year + ' ' + hour + ':' + min + ':' + sec;
      return time;
  },

  checkCooldown: function(command, userID){

      if(!command.hasOwnProperty("cd")) return -1;

      if(command.cd == 0) return -1;
      if(!cooldowns[command]){
          cooldowns[command] = {};
      }
      if(!cooldowns[command][userID]){
          cooldowns[command][userID] = Date.now();
          return -1;
      } else {
          var timeSpan = Date.now() - (cooldowns[command][userID]);
          if(command.cd <= timeSpan){
              cooldowns[command][userID] = Date.now();
              return -1;
          }
          return (command.cd - timeSpan)/1000;
      }
  },

  millisecondsConversion(t){
      var cd = 24 * 60 * 60 * 1000,
      ch = 60 * 60 * 1000,
      d = Math.floor(t / cd),
      h = Math.floor( (t - d * cd) / ch),
      m = Math.round( (t - d * cd - h * ch) / 60000),
      pad = function(n){ return n < 10 ? '0' + n : n; };
      if( m === 60 ){
          h++;
          m = 0;
      }
      if( h === 24 ){
          d++;
          h = 0;
      }
      return (d + " days " + pad(h) + " hours and " +  pad(m) + " minutes.");
  },
}
