// This creates a set of unique pairs utilizing provided history.
/*jshint node: true */
"use strict";
var csv = require('fast-csv');
var database = require('./database');
var fs = require('fs');

var csvStream = csv.createWriteStream({headers: true}),
    writeableStream = fs.createWriteStream("pairs.csv");
csvStream.pipe(writeableStream);

// Durstenfeld Shuffle.  Take it away maestro...
function shuffleArray(arr) {
    for (var i = arr.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var temp = arr[i];
        arr[i] = arr[j];
        arr[j] = temp;
    }
    return arr;
}

var pairs;

function testUniqueness(pair) {
    // linear search to see if we can find the pair.
    // This could be replaced with something better.
    for (var i = 0; i < pairs.length; i++) {
        // If we have advanced past the point this pair could exist then terminate search.
        if (pair[0] < pairs[i][0] && pair[1] < pairs[i][1]) {
            return true;
        }
        if (pair[0] === pairs[i][0] && pair[1] === pairs[i][1]) {
            return false;
        }
    }
    return true;
}

database.readPairs().then(function(userPairs) {
    function strCmp(a, b) {
        if (a == b) {
            return (0);
        } else if (a > b) {
            return (1);
        } else {
            return (-1);
        }
    }

    pairs = userPairs.map(function(a) {
        return database.orderPair([a.name1, a.name2]);
    }).sort(function(a, b) {
        var val = strCmp(a[0], b[0]);
        if (val != 0) {
            return val;
        }
        return strCmp(a[1], b[1]);
    });

    database.readUsers().then(function(users) {
        // Partition users into sets by Location.
        var usersByLocation = new Map();
        var departmentByUser = new Map();
        users.map(function(elem) {
            if (!(elem.location in usersByLocation)) {
                usersByLocation[elem.location] = [];
            }
            usersByLocation[elem.location].push(elem.name);
        });
        users.map(function(elem) {
            departmentByUser[elem.name] = elem.department;
        });
        // Balance locations.
        // If a location is less then 10 individuals put it into global
        // pool.  If there is an odd number of people at a location put
        // one person in global pool.
        var globalPool = [];
        var index, key, value, i;
        var keys = Object.keys(usersByLocation);
        for (i = 0;i < keys.length; i++) {
            key = keys[i];
            if (!usersByLocation.hasOwnProperty(key)) {
                continue;
            }
            value = usersByLocation[key];
            if (value.length < 10) {
                globalPool.concat(value);
                delete usersByLocation[key];
            } else if (value.length % 1 !== 0) {
                index = Math.floor(Math.random()*value.length);
                globalPool.push(value[index]);
                value.splice(index, 1);
            }
        }
        if (globalPool.length > 0) {
            if (globalPool.length % 1 !== 0) {
                // Take one out randomly
                index = Math.floor(Math.random()*globalPool.length);
                console.log("leaving out " + globalPool[index]);
                globalPool.splice(index, 1);
            }
            usersByLocation.global = globalPool;
        }

        var options = [];
        var notUnique;
        var pair;
        for (var tries = 0; tries < 100; tries++) {
            notUnique = true;
            while(notUnique) {
                keys = Object.keys(usersByLocation);
                for (i = 0; i < keys.length; i++) {
                    key = keys[i];
                    if (!usersByLocation.hasOwnProperty(key)) {
                        continue;
                    }
                    value = usersByLocation[key];
                    shuffleArray(value);
                }
                notUnique = false;
                for (i = 0; i < keys.length; i++) {
                    key = keys[i];
                    if (!usersByLocation.hasOwnProperty(key)) {
                        continue;
                    }
                    value = usersByLocation[key];
                    for (i = 0; i < value.length; i += 2) {
                        pair = database.orderPair([value[i], value[i+1]]);
                        if (!testUniqueness(pair)) {
                            notUnique = true;
                        }
                    }
                }
            }
            var possibility = {};
            for (i = 0; i < keys.length; i++) {
                key = keys[i];
                if (usersByLocation.hasOwnProperty(key)) {
                    possibility[key] = usersByLocation[key].slice(0);
                }
            }
            options.push(possibility);
        }

        function scorePairing(possibility) {
            var score = 0;
            for (var i = 0; i < keys.length; i++) {
                key = keys[i];
                value = possibility[key];
                for (var j = 0; j < value.length; j += 2) {
                    if (departmentByUser[value[j]] != departmentByUser[value[j+1]]) {
                        score += 1;
                    }
                }
            }
            return score;
        }

        var maxScore = 0;
        var maxInd = 0;
        var score;
        for (i = 0; i < options.length; i++) {
            score = scorePairing(options[i]);
            if (score > maxScore) {
                maxScore = score;
                maxInd = i;
            }
        }

        var option = options[maxInd];
        pairs = []
        for (i = 0; i < keys.length; i++) {
            key = keys[i];
            value = option[key];
            for (var j = 0; j < value.length; j += 2) {
                pairs.push(database.orderPair([value[j], value[j+1]]));
            }
        }
        pairs.sort();
        for (var i = 0; i < pairs.length; i++) {
            pair = pairs[i]
            console.log(pair[0] + "\t" + pair[1]);
            csvStream.write({Name: pair[0], Buddy: pair[1]});
        }

        csvStream.end();
    });
});
