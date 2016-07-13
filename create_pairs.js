// This creates a set of unique pairs utilizing provided history.
"use strict";
var csv = require('fast-csv');
var fs = require('fs');

var csvStream = csv.createWriteStream({headers: true}),
    writableStream = fs.createWriteStream("pairs.csv");

writableStream.on("finish", function(){
  console.log("DONE!");
});

csvStream.pipe(writableStream);
csvStream.write({name1: "Billy Man", name2: "William Robert"});
csvStream.write({name1: "Michael Hunter", name2: "William Robert"});
csvStream.write({name1: "Aaron Copland", name2: "Kirk Hemmet"});
csvStream.end();
