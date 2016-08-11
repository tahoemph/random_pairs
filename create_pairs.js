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

function orderPair(pair) {
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

var pairs;

function testUniqueness(pair) {
    // linear search to see if we can find the pair.
    // This could be replaced with something better.
    for (var i = 0; i < pairs.length; i++) {
        // If we have advanced past the point this pair could exist then terminate search.
        if (pair[0] > pairs[i].name1 && pair[1] > pairs[i].name2) {
            return true;
        }
        if (pair[0] === pairs[i].name1 && pair[1] === pairs[i].name2) {
            console.log("found " + pair[0] + " " + pair[1]);
            return false;
        }
    }
    return true;
}

database.readPairs().then(function(userPairs) {
    pairs = userPairs.sort(function(a, b) {
        if (a.name1 === b.name1) {
            return (a.name2 < b.name2);
        } else {
            return (a.name1 < b.name1);
        }
    });

    database.readUsers().then(function(users) {
        // Partition users into sets by Location.
        var usersByLocation = new Map();
        users.map(function(elem) {
            if (!(elem.location in usersByLocation)) {
                usersByLocation[elem.location] = [];
            }
            usersByLocation[elem.location].push(elem.name);
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

        var notUnique = true;
        var pair;
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
                    pair = orderPair([value[i], value[i+1]]);
                    if (!testUniqueness(pair)) {
                        notUnique = true;
                    }
                }
            }
        }
        for (i = 0; i < keys.length; i++) {
            key = keys[i];
            value = usersByLocation[key];
            for (var j = 0; j < value.length; j += 2) {
                pair = orderPair([value[j], value[j+1]]);
                console.log(pair);
                csvStream.write({Name: pair[0], Buddy: pair[1]});
            }
        }
        csvStream.end();
    });
});
