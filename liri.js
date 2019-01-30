/* 
This file handles the main logic of the application.
*/
'use strict';

require("dotenv").config();
const helpers = require("./helpers"); // This module contains our helper functions.
const queries = require("./query"); // This module contains our API query function.
const inquirer = require("inquirer");

// Main application logic starts with the Inquirer prompt.
inquirer.prompt([
    {
        type: "list",
        message: "What do you want to know?",
        choices: [
            {
                name: "I want to learn more about a song.",
                value: "spotify"
            }, {
                name: "I want to learn more about a movie.",
                value: "omdb"
            }, {
                name: "I want to learn about a band or musical artist's upcoming tour dates.",
                value: "bandsintown"
            }, {
                name: "Surpise me.",
                value: "surprise"
            }
        ],
        name: "command"
    }
]).then(function(response) {

    // Route prompts based on user selection.
    switch(response.command) {

        // Call Spotify API call with Inquirer prompt.
        case "spotify": 
            inquirer.prompt([
                {
                    type: "input",
                    name: "spotifyArg",
                    message: "What song do you want to learn more about?",
                    validate: helpers.validateThis
                }
            ]).then(response => {
                queries.querySpotify(response);
            }).catch(error => {
                console.log(`Hmmm, something went wrong (Error: ${error.message}). Try again!`);
            });
            break;

        // Call OMDB API with Inquirer prompt.
        case "omdb":
            inquirer.prompt([
                {
                    type: "input",
                    name: "omdbArg",
                    message: "What movie do you want to learn more about?",
                    validate: helpers.validateThis
                }
            ]).then(response => {
                queries.queryOMDB(response);
            }).catch(error => {
                console.log(`Hmm, something went wrong (Error: ${error.message}). Try again!`);
            });
            break;

        // Call Bands in Town API with Inquirer prompt.
        case "bandsintown":
            inquirer.prompt([
                {
                    type: "input",
                    name: "bandsintownArg",
                    message: "Which band or musical artist's upcoming tour dates do you want to see?",
                    validate: helpers.validateThis
                }
            ]).then(response => {
                queries.queryBandsInTown(response);
            }).catch(error => {
                console.log(`Hmm, something went wrong (Error: ${error.message}). Try again!`);
            });
            break;

        // Surprise me with one of the above API calls.
        case "surprise":
            queries.querySuprise();
            break;

        // Resolve to a note about trying again if nothing is somehow selected.
        default:
            return console.log("Hmmm, something went wrong. Try again!");
            
    } // End Inquirer switch.
   
})
.catch(error => {
    console.log(`Hmmm, something went wrong (Error: ${error.message}). Try again!`);
}); // End Inquirer entry prompt.