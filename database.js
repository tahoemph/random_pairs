// Utility functions for dealing with the database.
/*jslint node:true */
"use strict";

var fs = require('fs');
var sequelize = require('sequelize');

// Read the config syncronously.  This is a startup blocker so doing this async
// doesn't help us much.
var config = JSON.parse(fs.readFileSync('config.json', 'utf8'));

var findDatabase = function() {
    var database = new sequelize(config.database);
    return database;
};

var writePairs = function(database, pairs) {
    var Users = database.define('user', {
        name: {
            type: sequelize.STRING,
            field: 'name'
        },
        active: {
            type: sequelize.BOOLEAN,
            field: 'active'
        }
    }, {
        freezeTableName: true
    });

    var Pairs = database.define('pairs', {
        name1: {
            type: sequelize.STRING,
            field: 'name1'
        },
        name2: {
            type: sequelize.STRING,
            field: 'name2'
        }
    }, {
        freezeTableName: true
    });

    Users.sync({force: false}).then(function() {
        return Users.create(pairs);
    });
};



exports.findDatabase = findDatabase;
exports.writePairs = writePairs;
