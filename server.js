'use strict';
require('dotenv').config();
const express = require('express');
const mongo = require('mongodb');
const mongoose = require('mongoose');

const cors = require('cors');

const app = express();

/** this project needs a db !! **/

// mongoose.connect(process.env.MONGOLAB_URI);

app.use(cors());

/** this project needs to parse POST bodies **/
// you should mount the body-parser here

app.use('/public', express.static(process.cwd() + '/public'));

app.get('/', function(req, res) {
	res.sendFile(process.cwd() + '/views/index.html');
});

const shortenURL = url => ({ url });

// Shorten URL API endpoint
app.get('/api/shorturl/:url', function(req, res) {
	res.json(shortenURL(req.params.url));

	// Example response
	// {"original_url":"www.google.com","short_url":1}

	// Invalid URL response.
	// {"error":"invalid URL"}
});

app.listen(process.env.PORT, function() {
	console.log(`Node listening on ${process.env.PORT}`);
});
