require("dotenv").config();
const keys = require("./keys.js");
const axios = require("axios");
const nodeSpotify = require("node-spotify-api");
const moment = require("moment");
const inquirer = require("inquirer");
const spotify = keys.spotify;
const omdb = keys.omdb;
const bandsintown = keys.bandsintown;