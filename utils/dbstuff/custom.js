'use strict'
/**
 * Database for server customization
 */

var pool;

function custom(p){
//We pass the pool as a parameter
  pool = p;
}

module.exports = custom;

custom.prototype.checkCustomPrefix = function (msg) {
}

custom.prototype.adjustCustomPrefix = function (msg, newPrefix) {
}


function initializeCustom (guild) {
}
