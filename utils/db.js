/**
 * Database for server permissions
 */
var config = require('../config.json');
var clog = require('./clog.js');
var pg = require('pg');
var utilsLoader   = require('./utilsLoader');

var modules = [];
var mod;


/* Set up the pool configuration for the DB */
var poolConfig = {
	host		: config.database.db,
	user		: config.database.user,
	password	: config.database.pass,
	database	: config.database.name,
	port		: 5432
}

/* Connect to the pool */
var pool = new pg.Pool(poolConfig);

try {
    var Perms       = require('./dbstuff/perms.js');
    module.exports['perms'] = new Perms(pool);
    var Custom      = require('./dbstuff/custom.js');
    module.exports['custom'] = new Custom(pool);
    var Logging			= require('./dbstuff/logging.js');
    module.exports['logging'] = new Logging(pool);
} catch (e) {
  if (e instanceof Error && e.code === "MODULE_NOT_FOUND")
    console.log("Can't load foo!");
  else
    throw e;
}
