/* 
This file contains API query functions for the main app file, liri.js.
*/
"use strict";

const helpers = require("./helpers"); // This module contains our helper functions.
const keys = require("./keys.js");
const fs = require("fs");
const axios = require("axios");
const nodeSpotify = require("node-spotify-api");
const moment = require("moment");

// Specialized function for querying Bands in Town API based on the result of an Inquirer response.
function queryBandsInTown(response) {
  const bandsintown = keys.bandsintown;
  // If the response is coming from the OMDB Inquirer prompt (ie, it has a 'omdbArg' key-value pair), assign 'movie' based on the returned response. Otherwise it's coming from the 'surprise' command, so assign the variable to response as is.
  const artist = response.bandsintownArg
    ? helpers.capitalize(response.bandsintownArg)
    : helpers.capitalize(response);
  const artistQuery = helpers.concat(artist);
  const queryUrl = `https://rest.bandsintown.com/artists/${artistQuery}/events?app_id=${
    bandsintown.id
  }`;

  axios
    .get(queryUrl)
    .then(function(response) {
      let result = "";
      const events = response.data;

      if (!events.length) {
        return console.log(
          `Sorry, there aren't any upcoming shows for ${artist}.`
        );
      }

      // Loop through results and create entries on a new line.
      for (let i = 0; i < events.length; i++) {
        result += `\nArtist: ${artist}\nVenue: ${
          events[i].venue.name
        }\nLocation: ${events[i].venue.city} (${
          events[i].venue.country
        })\nDate: ${moment(events[i].datetime).format("MMMM Do YYYY")}\n\n`;
      }

      console.log(result);
      helpers.print(result + "\n############\n"); // Print results to log.txt.
    })
    .catch(error => {
      if (error.message.includes("undefined")) {
        return console.log("That artist doesn't exist. Try again!");
      }

      if (error) {
        console.log(
          `There was an error with that artist (Error: ${error.message}).`
        );
      }
    });
}

// Specialized function for querying OMDB API based on the result of an Inquirer response.
function queryOMDB(response) {
  const omdb = keys.omdb;
  // If the response is coming from the OMDB Inquirer prompt (ie, it has a 'omdbArg' key-value pair), assign 'movie' based on the returned response. Otherwise it's coming from the 'surprise' command, so assign the variable to the response as is.
  const movie = response.omdbArg
    ? helpers.capitalize(response.omdbArg)
    : helpers.capitalize(response);
  const movieURL = helpers.concat(movie);
  const queryUrl = `http://www.omdbapi.com/?t=${movieURL}&y=&plot=short&apikey=${
    omdb.id
  }`;

  axios
    .get(queryUrl)
    .then(function(response) {
      // Leave if the response is false.
      if (response.data.Response === "False") {
        return console.log(`${movie} doesn't appear to be a movie. Try again!`);
      }

      // Otherwise create entries on new lines.
      let result = `\nTitle: ${response.data.Title}\nReleased: ${
        response.data.Released
      }\nIMDB Rating: ${
        response.data.Ratings[0].Value
      }\nRotten Tomatoes Rating: ${response.data.Ratings[1].Value}\nCountry: ${
        response.data.Country
      }\nLanguage: ${response.data.Language}\nPlot: ${
        response.data.Plot
      }\nCast: ${response.data.Actors}\n`;

      console.log(result);
      helpers.print(result + "\n############\n"); // Print results to log.txt.
    })
    .catch(error => {
      if (error) {
        console.log(`Error: ${error.message}.`);
      }
    });
}

// Specialized function for querying Spotify API based on the result of an Inquirer response.
function querySpotify(response) {
  const spotify = new nodeSpotify({
    id: keys.spotify.id,
    secret: keys.spotify.secret
  });
  // If the response is coming from the Spotify Inquirer prompt (ie, it has a 'spotiftyArg' key-value pair), assign 'song' based on the returned response. Otherwise it's coming from the 'surprise' command, so assign the variable to the response is.
  const song = response.spotifyArg
    ? helpers.capitalize(response.spotifyArg)
    : helpers.capitalize(response);

  spotify.search({ type: "track", query: song }, function(error, data) {
    // Leave if the response is false.
    if (error) {
      return console.log(
        `There was an error with that song. (Error: ${
          error.message
        }). Try again!`
      );
    }

    // Otherwise construct result on new lines.
    let result = `\nArtist: ${data.tracks.items[0].artists[0].name}\nTrack: ${
      data.tracks.items[0].name
    }\nAlbum: ${data.tracks.items[0].album.name}\n`;

    // Show the preview URL if it exists.
    if (data.tracks.items[0].preview_url) {
      result += `Preview Track: ${data.tracks.items[0].preview_url}\n`;
    }

    console.log(result);
    helpers.print(result + "\n############\n"); // Print results to log.txt.
  });
}

// Specialized function that reads random commands from the random.txt file and returns the corresponding result.
function querySuprise() {
  // Read the text file.
  fs.readFile("random.txt", "utf8", function(error, data) {
    if (error) {
      return console.log(
        `There was an error reading the file (Error: ${error})`
      );
    }

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

module.exports.queryBandsInTown = queryBandsInTown;
module.exports.querySpotify = querySpotify;
module.exports.queryOMDB = queryOMDB;
module.exports.querySuprise = querySuprise;
