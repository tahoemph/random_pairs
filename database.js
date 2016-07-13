// Utility functions for dealing with the database.
/*jslint node:true */
"use strict";

var sequelize = require('sequelize');

var findDatabase = function() {
    var database = new sequelize('sqlite://pairs.sqlite');
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
