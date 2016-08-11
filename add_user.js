// This takes in a set of pairs and writes them to the database.
/*jshint node: true */
"use strict";

var database = require('./database');

database.writeUser({name: process.argv[2], location: process.argv[3], active: true});
