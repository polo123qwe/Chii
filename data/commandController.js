/**
 * Command controller
 *
 * This file bundles all the commands together and exports them for ease of
 * access. The process is automated, so adding new command modules is as
 * simple as following the structure of the files.
 */
var clog = require('../utils/clog.js');
var directory = require('require-directory');
var cmds = directory(module, './commands/');
var commands = [];
var counter = 0;

for (var f in cmds) {
    for (var o in cmds[f].CommandArray) {
        commands[o] = cmds[f].CommandArray[o];
        commands[o].category = f;
        if(!commands[o].name){
            commands[o].name = o;
        }
        counter++;
    }
}

console.log(clog.c.colorGreen("Successfully constructed ") + counter + clog.c.colorGreen(" commands."));

exports.Commands = commands;
