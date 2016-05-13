var MongoClient = require('mongodb').MongoClient;

var database;
var servers;
module.exports = Mongo;

function Mongo(db){
    database = db;
    servers = db.collection('servers');
}
Mongo.prototype = {
    //Update settings of a server
    update: function(serverID, field, value){
         servers.update({_id:serverID}, {$set: {field:value}});
    },

    //retrieve data from db
    find: function(serverID, field){
        collection.findOne({_id: serverID}, function(err, document) {
            console.log(document[field]);
        });
    },

    // remove: function(collection, data){
    //     //collection.remove({mykey:1});
    // }
}
