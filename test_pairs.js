// Checks that the CSV offered on the command line is unique.
/*jshint node: true */
"use strict";

var csv = require('fast-csv');
var database = require('./database');

var db = database.findDatabase();
var data = csv.fromPath('pairs.csv', {headers: true}).
on("data", function(datum) {
    var pair = {name1: datum.Name, name2: datum.Buddy};
    database.readPair(pair).then(function(rows) {
        if (rows.length !== 0) {
            console.log(pair);
        }
    });
});
