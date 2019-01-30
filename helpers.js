/* 
This file contains utility functions for the main app file, liri.js.
*/
'use strict';

const fs = require("fs");

// Function that validates our Inquirer entries.
function validateThis(value) {

    var pass = value.match(
        /([A-Za-z0-9-]+)/i
    );
    
    if (pass) return true;
    
    return "Please enter a valid entry.";

}

// Function that logs our outputs to a text file.
function print(result) {

    fs.appendFile("log.txt", result, function(err) {
        if (err) return console.log(`Error writing to log: ${err}`);
    });

}

// Function that concatenates our API inputs so there aren't blank spaces.
function concat(input) {

    return input.trim().split(" ").join("+");

}

// Function that capitalizes user inputs.
function capitalize(string) {

    if (!string.includes(" ")) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }

    let capitalized = [];
    let arr = string.split(" ");
    
    for (let i = 0; i < arr.length; i++) {
        let temp = arr[i].charAt(0).toUpperCase() + arr[i].slice(1);
        capitalized.push(temp);
    }

    return capitalized.join(" ");

}

module.exports.validateThis = validateThis;
module.exports.print = print;
module.exports.concat = concat;
module.exports.capitalize = capitalize;