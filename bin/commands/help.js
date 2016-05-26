var allCommands = []
allCommands.push(require("./moderationCommands.js"));
allCommands.push(require("./internetDataCommands.js"));
allCommands.push(require("./infoCommands.js"));
allCommands.push(require("./serverDataCommands.js"));

//NOT WORKING
module.exports = function(){
    var str = "** List of commands:\n";

    for(var commands of allCommands){
        console.log(commands);
        // for(var command of commands){
        //     str += command.help;
        // }
    }
    return str;
}
