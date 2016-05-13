module.exports = {
    process: function(message){
        var pMessage = {};
        pMessage.mentions = [];
        pMessage.mentions.push(message.mentions);

        if(message.channel.server){
            var members = message.channel.server.members;
                    
        }
    },
}
