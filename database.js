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

var orderPair function(pair) {
    var name1, name2, nameTemp;
    name1 = pair[0];
    name2 = pair[1];
    if (name2 < name1) {
        nameTemp = name1;
        name1 = name2;
        name2 = nameTemp;
    }
    return [name1, name2];
}

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

var readPairs = function() {
    _defineDatabase(findDatabase());
    return Pairs.findAll();
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

var readUsers = function() {
    _defineDatabase(findDatabase());
    return Users.findAll({
        where: {
            active: 1
        }
    });
};


exports.findDatabase = findDatabase;
exports.writePair = writePair;
exports.writeUser = writeUser;
exports.readPair = readPair;
exports.readPairs = readPairs;
exports.orderPair = orderPair;
exports.readUser = readUser;
exports.readUsers = readUsers;
