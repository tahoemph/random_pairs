// This takes in a users and makes that user inactive.
/*jshint node: true */
"use strict";

var database = require('./database');

if (process.argv.length < 3) {
    console.log("Usage: node {} username");
    process.exit(-1);
}
var userName = process.argv[2];
database.findUserByName(userName).then(function(user) {
    if (user.length === 0) {
        console.log("Couldn't find " + userName + ".");
        process.exit(-1);
    }
    if (user.length > 1) {
        console.log("Found multiple users for " + userName + ".");
        process.exit(-1);
    }
    user[0].active = false;
    database.writeUser(user[0]).then(function() {
        console.log("Make " + userName + " inactive.");
    });
});
