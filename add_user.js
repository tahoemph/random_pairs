// This takes in a users and write it to the database.
/*jshint node: true */
"use strict";

var database = require('./database');

database.writeUser({name: process.argv[2], location: process.argv[3], active: true});
