// This takes in a set of pairs and writes them to the database.
/*jshint node: true */
"use strict";

var csv = require('fast-csv');
var database = require('./database');

var data = csv.fromPath('team.csv', {headers : true}).
on("data", function(datum) {
    database.writeUser({name: datum.User, location: datum.Location, active: true});
});
