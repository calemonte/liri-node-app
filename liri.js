'use strict';

require("dotenv").config();
const keys = require("./keys.js");
const fs = require("fs");
const axios = require("axios");
const nodeSpotify = require("node-spotify-api");
const moment = require("moment");
const inquirer = require("inquirer");

// Function that validates our Inquirer entries.
function validateThis(value) {

    var pass = value.match(
        /([A-Za-z0-9-]+)/i
    );
    
    if (pass) { return true; }
    return "Please enter a valid entry."

}

// Function that logs our outputs to a text file.
function print(result) {

    fs.appendFile("log.txt", result, function(err) {
        if (err) { return console.log(`Error writing to log: ${err}`) }
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

// Specialized function for querying Bands in Town API based on the result of an Inquirer response.
function queryBandsInTown(response){

    const bandsintown = keys.bandsintown;
    // If the response is coming from the OMDB Inquirer prompt (ie, it has a 'omdbArg' key-value pair), assign 'movie' based on the returned response. Otherwise it's coming from the 'surprise' command, so assign the variable to response as is.
    const artist = (response.bandsintownArg) ? capitalize(response.bandsintownArg) : capitalize(response);
    const artistQuery = concat(artist);
    const queryUrl = `https://rest.bandsintown.com/artists/${artistQuery}/events?app_id=${bandsintown.id}`;

    axios
        .get(queryUrl)
        .then(function(response) {

            let result = "";
            const events = response.data;

            if (!events.length) { return console.log(`Sorry, there aren't any upcoming shows for ${artist}.`) }
            
            // Loop through results and create entries on a new line.
            for (let i = 0; i < events.length; i++) {
                result += `\nArtist: ${artist}\nVenue: ${events[i].venue.name}\nLocation: ${events[i].venue.city} (${events[i].venue.country})\nDate: ${moment(events[i].datetime).format('MMMM Do YYYY')}\n\n`;
            }

            console.log(result);
            print(result + "\n############\n"); // Print results to log.txt.

        })
        .catch(error => {
            if (error.message.includes("undefined")) { return console.log ("That artist doesn't exist. Try again!"); }

            if (error) { console.log(`There was an error with that artist (Error: ${error.message}).`); }
        });

}

// Specialized function for querying OMDB API based on the result of an Inquirer response.
function queryOMDB(response) {

    const omdb = keys.omdb;
    // If the response is coming from the OMDB Inquirer prompt (ie, it has a 'omdbArg' key-value pair), assign 'movie' based on the returned response. Otherwise it's coming from the 'surprise' command, so assign the variable to the response as is.
    const movie = (response.omdbArg) ? capitalize(response.omdbArg) : capitalize(response);
    const movieURL = concat(movie);
    const queryUrl = `http://www.omdbapi.com/?t=${movieURL}&y=&plot=short&apikey=${omdb.id}`;
    
    axios
        .get(queryUrl)
        .then(function(response) {

            // Leave if the response is false.
            if (response.data.Response === "False") { return console.log(`${movie} doesn't appear to be a movie. Try again!`) };

            // Otherwise create entries on new lines.
            let result = `\nTitle: ${response.data.Title}\nReleased: ${response.data.Released}\nIMDB Rating: ${response.data.Ratings[0].Value}\nRotten Tomatoes Rating: ${response.data.Ratings[1].Value}\nCountry: ${response.data.Country}\nLanguage: ${response.data.Language}\nPlot: ${response.data.Plot}\nCast: ${response.data.Actors}\n`;

            console.log(result);
            print(result + "\n############\n"); // Print results to log.txt.

        })
        .catch(error => {
            if (error) { console.log(`Error: ${error.message}.`); }
        });

}

// Specialized function for querying Spotify API based on the result of an Inquirer response.
function querySpotify(response) {

    const spotify = new nodeSpotify({ id: keys.spotify.id, secret: keys.spotify.secret });
    // If the response is coming from the Spotify Inquirer prompt (ie, it has a 'spotiftyArg' key-value pair), assign 'song' based on the returned response. Otherwise it's coming from the 'surprise' command, so assign the variable to the response is.
    const song = (response.spotifyArg) ? capitalize(response.spotifyArg) : capitalize(response);

    spotify.search({ type: 'track', query: song }, function(error, data) {

        // Leave if the response is false.
        if (error) { return console.log(`There was an error with that song. (Error: ${error.message}). Try again!`) };

        // Otherwise construct result on new lines.
        let result = `\nArtist: ${data.tracks.items[0].artists[0].name}\nTrack: ${data.tracks.items[0].name}\nAlbum: ${data.tracks.items[0].album.name}\n`;

        // Show the preview URL if it exists.
        if (data.tracks.items[0].preview_url) {
            result += `Preview Track: ${data.tracks.items[0].preview_url}\n`; 
        }

        console.log(result);
        print(result + "\n############\n"); // Print results to log.txt.

    });

}

// Specialized function that reads random commands from the random.txt file and returns the corresponding result.
function querySuprise() {

    // Read the text file.
    fs.readFile("random.txt", "utf8", function(error, data) {

        if (error) { return console.log(`There was an error reading the file (Error: ${error})`); }
        
        const arr1 = data.split("\n");
        const randomSelection = arr1[Math.floor(Math.random() * arr1.length)];
        const finalSelection = randomSelection.split(",");
        const command = finalSelection[0].trim();
        const argument = finalSelection[1].trim();

        // Route the randomly selected commands appropriately.
        switch (command) {
            case "spotify":
                querySpotify(argument);
                break;
            case "omdb":
                queryOMDB(argument);
                break;
            case "bandsintown":
                queryBandsInTown(argument);
                break;
            default:
                return console.log("Hmmm, something went wrong. Try again!");
        }
    });

}

// Main application logic starts with the Inquirer prompt.
inquirer.prompt([
    {
        type: "list",
        message: "What do you want to know?",
        choices: [
            {
                name: "I want to learn more about a song.",
                value: "spotify"
            },
            {
                name: "I want to learn more about a movie.",
                value: "omdb"
            },
            {
                name: "I want to learn about a band or musical artist's upcoming tour dates.",
                value: "bandsintown"
            },
            {
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
                    validate: validateThis
                }
            ]).then(response => {
                querySpotify(response);
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
                    validate: validateThis
                }
            ]).then(response => {
                queryOMDB(response);
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
                    validate: validateThis
                }
            ]).then(response => {
                queryBandsInTown(response);
            }).catch(error => {
                console.log(`Hmm, something went wrong (Error: ${error.message}). Try again!`);
            });
            break;

        // Surprise me with one of the above API calls.
        case "surprise":
            querySuprise();
            break;

        // Resolve to a note about trying again if nothing is somehow selected.
        default:
            return console.log("Hmmm, something went wrong. Try again!");
            
    } // End Inquirer switch.
   
})
.catch(error => {

    console.log(`Hmmm, something went wrong (Error: ${error.message}). Try again!`);
    
}); // End Inquirer entry prompt.