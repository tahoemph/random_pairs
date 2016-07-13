// This takes in a set of pairs and writes them to the database.
/*jshint node: true */
"use strict";

var csv = require('fast-csv');
var database = require('./database');

var db = database.findDatabase();
var pairs = [];
var data = csv.fromPath('pairs.csv').
on("data", function(datum) {
    console.log(datum);
    pairs.push({name1: datum[0], name2: datum[1]});
}).
on('end', function() {
    database.writePairs(db, pairs[0]);
});
