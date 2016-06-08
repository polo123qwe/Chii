var http = require('http');
var Bluebird = require('bluebird');
var Forecast = require('forecast.io-bluebird');
var api_key = require("../../config.json").forecastKey;

module.exports = {
    time: {
        permissions: -1,
        run: function(message, bot){
            var date = new Date(Date.now());
            var options = "GMT UTC GMT+ GMT + GMT- GMT - UTC+ UTC + UTC- UTC -";
            var splitted = message.cleanContent.split(" ");
    		var time = splitted.splice(1, splitted.length).join(" ");

    		if(time != null){
    			time = time.toUpperCase();

                if(!options.includes(time.replace(/[0-9]/g, ''))){
                    bot.sendMessage(message, "Incorrect Usage");
                    return;
                }

    			var offset = time.match(/\d+/);
                if(offset) offset = offset[0];
                else{
                    offset = 0;
                }

    			if(offset>12) {
    				offset = 12;
    			}

    			if(time.includes("-")){
    				date = new Date(date.getTime()-(offset*3600000));
                    offset = "-"+offset;
                }else {
                    date = new Date(date.getTime()+(offset*3600000));
                    offset = "+"+offset;
                }
    		} time = "+0";

    		var h = date.getUTCHours();
    		h = (h < 10 ? "0" : "") + h;
    		var m  = date.getUTCMinutes();
    		m = (m < 10 ? "0" : "") + m;
    		var s  = date.getUTCSeconds();
    		s = (s < 10 ? "0" : "") + s;
    		var Y = date.getUTCFullYear();
    		var M = date.getUTCMonth() + 1;
    		M = (M < 10 ? "0" : "") + M;
    		var D  = date.getUTCDate();
    		D = (D < 10 ? "0" : "") + D;

    		bot.sendMessage(message, "**UTC"+offset+"** Standard Time: `"+D+"/"+M+"/"+Y+" "+h+":"+m+":"+s+"`");
        },
        help: "time! <gmt/utc+offset> - returns specified utc time",
    },

    weather: {
        permissions: -1,
        run: function(message, bot){
            var splitted = message.cleanContent.split(" ");
            if(splitted[1] == null) bot.sendMessage(message, "Type a city");
            var argument = splitted.splice(1, splitted.length).join().replace(",", " ");
            geocode(argument, function(err, locat){
                if(err != null) {
                    // console.log('Error: ' + err);
                } else if( !locat ) {
                    bot.sendMessage(message.channel, 'No result.');
                } else {
                    getForecast(locat.geometry.location.lat, locat.geometry.location.lng, function(err, out){
                            if(err) return;
                            else{
                                // var currentWeather = "The weather at "+address+" is: "+"\n -> Summary: "+out.summary
                                // 					+".\n -> Temperature: "+out.temperature+"ºC."
                                // 					+"\n -> Apparent Temperature: "+out.apparentTemperature+"ºC."+"\n -> Humidity: "
                                // 					+out.humidity+".\n";
                                var result = "The weather at "+locat.formatted_address+" is: \n -> "+
                                             out.summary+".\n -> Temperature "+out.temperature+"ºC."+
                                             "\n -> Humidity: "+out.humidity+".\n";
                                bot.sendMessage(message, result);
                            }
                    });
                }
            });
        },
        help: "weather! <city> - returns the weather of a city",
    }
}

function geocode(address, callback){

    var url = "http://maps.googleapis.com/maps/api/geocode/json?address=" + encodeURIComponent(address) + "&sensor=false";

    http.get(url, function(res) {
        if( res.statusCode != 200 ) {
            callback("HTTP status = " + res.statusCode, null);
        } else {
            var output = '';
            res.setEncoding('utf8');
            res.on('data', function (chunk) {
                output += chunk;
            });
            res.on('end', function() {
                var response = JSON.parse(output);
                if( response.status == "OK" ) {
                    var location = response.results[0];
                    callback(null, location);
                } else if( response.status == "ZERO_RESULTS" ) {
                    callback(null, null);
                } else {
                    callback("Status = " + response.status, null);
                }
            });
        }
    }).on('error', function(e) {
        callback(e.message, null);
    });
}

function getForecast(latitude, longitude, callback){
	var forecast = new Forecast({
	    key: api_key,
	    timeout: 2500
	});
	var options = {
    	units: 'si',
	};
	forecast.fetch(latitude, longitude, options)
	.then(function(out) {
		var out = out.currently;
        callback(null, out);
	})
	.catch(function(error) {
	    // console.error(error);
        callback(error);
	});
}
