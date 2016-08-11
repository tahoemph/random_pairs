// Checks that the CSV offered on the command line is unique.
/*jshint node: true */
"use strict";

var csv = require('fast-csv');
var database = require('./database');

var db = database.findDatabase();
var data = csv.fromPath('pairs.csv', {headers: true}).
on("data", function(datum) {
    var op = database.orderPair([datum.Name, datum.Buddy]);
    var pair = {name1: op[0], name2: op[1]};
    database.readPair(pair).then(function(rows) {
        if (rows.length !== 0) {
            console.log(pair);
        }
    });
});
