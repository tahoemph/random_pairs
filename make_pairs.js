// This takes in a set of pairs and writes them to the database.
/*jshint node: true */
"use strict";

var csv = require('fast-csv');
var database = require('./database');

var db = database.findDatabase();
var data = csv.fromPath('pairs.csv', {headers: true}).
on("data", function(datum) {
    console.log(datum);
    var name1 = datum.Name;
    var name2 = datum.Buddy;
    if (name2 > name1) {
        var nameTemp = name1;
        name1 = name2;
        name2 = nameTemp;
    }
    var pair = {name1: name1, name2: name2};
    // Should throw an error here or log?
    database.readPair(pair).then(function(rows) {
        if (rows.length === 0) {
            database.writePair({name1: name1, name2: name2});
        } else {
            console.log("dup pair: " + name1 + " " + name2);
        }
    });
});
