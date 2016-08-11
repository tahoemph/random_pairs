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

var Users = null;
var Pairs = null;

var _defineDatabase = function(database) {
    if (!Pairs) {
        Pairs = database.define('pairs', {
            name1: sequelize.STRING,
            name2: sequelize.STRING,
        }, {
            freezeTableName: true
        });
    }

    if (!Users) {
        Users = database.define('user', {
            name: sequelize.STRING,
            location: sequelize.STRING,
            active: sequelize.BOOLEAN,
        }, {
            freezeTableName: true
        });
    }
};

var writePair = function(pair) {
    _defineDatabase(findDatabase());
    Pairs.sync().then(function() {
        return Pairs.create(pair);
    });
};

var readPair = function(pair) {
    _defineDatabase(findDatabase());
    return Pairs.findAll({
        where: pair
    });
};

var writeUser = function(user) {
    _defineDatabase(findDatabase());
    Users.sync().then(function() {
        return Users.create(user);
    });
};

var readUser = function() {
    throw new Error("not implemented");
};


exports.findDatabase = findDatabase;
exports.writePair = writePair;
exports.readPair = readPair;
exports.writeUser = writeUser;
exports.readUser = readUser;
