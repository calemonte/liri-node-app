'use strict';

require("dotenv").config();
const keys = require("./keys.js");
const fs = require("fs");
const axios = require("axios");
const nodeSpotify = require("node-spotify-api");
const moment = require("moment");
const inquirer = require("inquirer");
const spotify = keys.spotify;
const omdb = keys.omdb;
const bandsintown = keys.bandsintown;

// Function that validates our entries.
function validateThis(value) {
    var pass = value.match(
        /([A-Za-z0-9-]+)/i
    );
    if (pass) { return true; }
    return "Please enter a valid entry."
}

// Function that logs output to a text file.
function print(event) {
    // take in an event and append it to a text file.
};

inquirer.prompt([
    {
        type: "list",
        message: "\nWhat do you want to know?",
        choices: [
            {
                name: "I want to learn more about a song.",
                value: "spotify"
            },
            {
                name: "I want learn more about a movie.",
                value: "omdb"
            },
            {
                name: "I want learn about a musical artist's upcoming tour dates.",
                value: "bandsintown"
            },
            {
                name: "Surpise me!",
                value: "surprise"
            }
        ],
        name: "command"
    }
]).then(response => {

    switch(response.command) {

        case "spotify": 
            console.log('spotify called');
            break;

        case "omdb":
            inquirer.prompt([
                {
                    type: "input",
                    name: "omdbArg",
                    message: "What movie do you want to learn more about?",
                    validate: validateThis
                }
            ]).then(response => {
                
                const movie = response.omdbArg.split(" ").join("+");
                const queryUrl = `http://www.omdbapi.com/?t=${movie}&y=&plot=short&apikey=${omdb.id}`;
                
                axios
                    .get(queryUrl)
                    .then(response => {
            
                        if (response.data.Response === "False") { return console.log("That doesn't appear to be a movie. Try again!") };

                        let result = 
                            `\nTitle: ${response.data.Title}\nReleased: ${response.data.Released}\nIMDB Rating: ${response.data.Ratings[0].Value}\nRotten Tomatoes Rating: ${response.data.Ratings[1].Value}\nCountry: ${response.data.Country}\nLanguage: ${response.data.Language}\nPlot: ${response.data.Plot}\nCast: ${response.data.Actors}\n`;

                        console.log(result);

                        // console.log(`\nTitle: ${response.data.Title}`);
                        // console.log(`Released: ${response.data.Released}`);
                        // console.log(`IMDB Rating: ${response.data.Ratings[0].Value}`);
                        // console.log(`Rotten Tomatoes Rating: ${response.data.Ratings[1].Value}`);
                        // console.log(`Country: ${response.data.Country}`);
                        // console.log(`Language: ${response.data.Language}`);
                        // console.log(`Plot: ${response.data.Plot}`);
                        // console.log(`Cast: ${response.data.Actors}\n`);

                    })
                    .catch(error => {
                        if (error) { console.log(`Error: ${error.message}`); }
                    });
            }).catch(error => {
                console.log("Hmm, something went wrong at some point. Try again!");
            });
            break;

        case "bandsintown":
            console.log("bandsintown");
            break;

        case "surprise":
            console.log("surprise");
            break;

        default:
            return console.log("Hmmm, something went wrong. Try again");
            
    } // End Inquirer switch.
   
}); // End Inquirer entry prompt.