module.exports = {
    //Return
    getMentions: function(message, bot){
        var splitted = message.content.split(" ");
        var mentions = [];
        for(var id of splitted){
            if(id[0] == "<" && id[id.length-1] == ">" && id.length){
                var user;
                if(id.length == 21){
                    user = bot.users.get("id", id.replace(/<|@|>/ig,""));
                } else if (id.length == 22){
                    user = bot.users.get("id", id.replace(/<|@!|>/ig,""));
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

  },
}
