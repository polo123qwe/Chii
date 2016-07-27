var chlk      = require("chalk"),
    chalk     = new chlk.constructor({enabled: true});

var cWarning  = chalk.bgYellow.black,
    cError    = chalk.bgRed.black,
    cGreen    = chalk.bold.green,
	cGBG      = chalk.bgGreen.black,
    cRed      = chalk.bold.red,
    cBlue     = chalk.bold.blue,
    cGrey     = chalk.bold.grey,
    cYellow   = chalk.bold.yellow,
	cCyan     = chalk.bold.cyan;

exports.c = {
	colorWarning	: chalk.bgYellow.black,
    colorError		: chalk.bgRed.black,
	colorGBG		: chalk.bgGreen.black,
    colorGreen		: chalk.bold.green,
    colorRed		: chalk.bold.red,
    colorBlue		: chalk.bold.blue,
    colorGrey		: chalk.bold.grey,
    colorYellow		: chalk.bold.yellow,
	colorCyan		: chalk.bold.cyan
}

exports.logCommand = function (serverName, authorObj, cmdString, suffixString) {
	console.log(cGBG( " " + serverName + " ") + " > User " + cCyan(authorObj.username + "#" + authorObj.discriminator) +
							" ran command " + cYellow(cmdString) + " " + suffixString );
}

exports.logError = function (typeString, error) {
	console.log(cError(" " + typeString + " ERROR ") + "\n" + error.stack);
}
