'use strict';

require("dotenv").config();
const keys = require("./keys.js");
const fs = require("fs");
const axios = require("axios");
const nodeSpotify = require("node-spotify-api");
const moment = require("moment");
const inquirer = require("inquirer");
const spotify = new nodeSpotify({ id: keys.spotify.id, secret: keys.spotify.secret });
const omdb = keys.omdb;
const bandsintown = keys.bandsintown;

// Validate our Inquirer entries.
function validateThis(value) {
    var pass = value.match(
        /([A-Za-z0-9-]+)/i
    );
    if (pass) { return true; }
    return "Please enter a valid entry."
}

// Log our outputs to a text file.
function print(result) {
    fs.appendFile("log.txt", result, function(err) {
        if (err) { return console.log(`Error writing to log: ${err}`)}
        console.log(`Successfully logged result to log.txt!`);
    });
}

// Concatenate our API inputs.
function concat(input) {
    return input.split(" ").join("+");
}

// Capitalize user inputs.
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
]).then(response => {

    switch(response.command) {

        // Spotify API call.
        case "spotify": 
            inquirer.prompt([
                {
                    type: "input",
                    name: "spotifyArg",
                    message: "What song do you want to learn more about?",
                    validate: validateThis
                }
            ]).then(response => {
                const song = capitalize(response.spotifyArg);
                spotify.search({ type: 'track', query: song }, function(error, data) {
                    if (error) { return console.log(`There was an error with that song: ${error}`) };

                    if (data === "undefined") { return console.log("No songs found. Try again!") };

                    const result = `\nArtist: ${data.tracks.items[0].artists[0].name}\nTrack: ${data.tracks.items[0].name}\nAlbum: ${data.tracks.items[0].album.name}\nPreview Track: ${data.tracks.items[0].preview_url}\n`;

                    console.log(result);
                    print((result + "\n############\n"));

                });
            
            }).catch(error => {
                console.log(`Hmmm, something went wrong (${error}). Try again!`);
            });
            break;

        // OMDB API call.
        case "omdb":
            inquirer.prompt([
                {
                    type: "input",
                    name: "omdbArg",
                    message: "What movie do you want to learn more about?",
                    validate: validateThis
                }
            ]).then(response => {
                
                const movie = capitalize(response.omdbArg);
                const movieURL = concat(movie);
                const queryUrl = `http://www.omdbapi.com/?t=${movieURL}&y=&plot=short&apikey=${omdb.id}`;
                
                axios
                    .get(queryUrl)
                    .then(response => {
            
                        // Leave if the response is false.
                        if (response.data.Response === "False") { return console.log(`${movie} doesn't appear to be a movie. Try again!`) };

                        // Otherwise compile result, display in console, and append to log.txt
                        let result = `\nTitle: ${response.data.Title}\nReleased: ${response.data.Released}\nIMDB Rating: ${response.data.Ratings[0].Value}\nRotten Tomatoes Rating: ${response.data.Ratings[1].Value}\nCountry: ${response.data.Country}\nLanguage: ${response.data.Language}\nPlot: ${response.data.Plot}\nCast: ${response.data.Actors}\n`;

                        console.log(result);
                        print((result + "\n############\n"));

                    })
                    .catch(error => {
                        if (error) { console.log(`Error: ${error.message}`); }
                    });
            }).catch(error => {
                console.log("Hmm, something went wrong at some point. Try again!");
            });
            break;

        // Bands in Town API call.
        case "bandsintown":
            inquirer.prompt([
                {
                    type: "input",
                    name: "bandsintownArg",
                    message: "Which band or musical artist's upcoming tour dates do you want to see?",
                    validate: validateThis
                }
            ]).then(response => {

                const artist = capitalize(response.bandsintownArg);
                const artistQuery = concat(response.bandsintownArg);
                const queryUrl = `https://rest.bandsintown.com/artists/${artistQuery}/events?app_id=${bandsintown.id}`;

                axios
                    .get(queryUrl)
                    .then(response => {

                        let result = "";
                        const events = response.data;

                        if (!events.length) { return console.log(`Sorry, there aren't any upcoming shows for ${artist}.`)}
                        
                        // Loop through results and create entries.
                        for (let i = 0; i < events.length; i++) {
                            result += `\nArtist: ${artist}\nVenue: ${events[i].venue.name}\nLocation: ${events[i].venue.city}, ${events[i].venue.region}, ${events[i].venue.country}\nDate: ${moment(events[i].datetime).format('MMMM Do YYYY')}\n\n`;
                        }
                        console.log(result);
                        print((result + "\n############\n"));

                    })
                    .catch(error => {
                        if (error.message.includes("undefined")) {return console.log ("That artist doesn't exist. Try again!"); }

                        if (error) { console.log(`Error: ${error.message}`); }
                    });

            }).catch(error => {
                console.log("Hmm, something went wrong at some point. Try again!");
            });
            break;

        // Surprise me with one of the above API calls.
        case "surprise":
            console.log("surprise");
            break;

        // Default resolves to a note about trying again.
        default:
            return console.log("Hmmm, something went wrong. Try again");
            
    } // End Inquirer switch.
   
}); // End Inquirer entry prompt.