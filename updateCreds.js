var request = require('request');

var config = require("./config.json");

var fs = require('fs');

try{
	/*
		The image should be loaded here
	*/
	var IMAGEDATA = fs.readFileSync("img.jpg", "base64");
	
} catch (err){
	console.log("Error");
	process.exit();
}

var options = {
	url: "https://discordapp.com/api/users/@me",
	method: "PATCH",
	headers: {
		"Authorization": config.token,
		"Content-Type": "application/json",
	},
	json: {
		"username": "Chii",
		"avatar": "data:image/jpeg;base64,"+IMAGEDATA,
		// "email": "EMAILHERE",
	},

}

/*
	Makes the request to the server
*/
request(options, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            console.log(body)
        } else {
            console.log(response.statusCode)

            console.log("Error: "+error);
        }
    }
);

