'use strict';

// Get environment variables
require('dotenv').config();

const cors = require('cors');
const dns = require('dns');
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const mongo = require('mongodb');
const app = express();

// Connect to database
mongoose.connect(
	process.env.MONGOLAB_URI,
	{
		useNewUrlParser: true,
		useUnifiedTopology: true
	},
	() => console.log(mongoose.connection.readyState)
);

app.use(cors());

/** this project needs to parse POST bodies **/
app.use(bodyParser.urlencoded({ extended: false }));

app.use('/public', express.static(process.cwd() + '/public'));

app.get('/', function(req, res) {
	res.sendFile(process.cwd() + '/views/index.html');
});

const URLSchema = new mongoose.Schema({
	original_url: String,
	short_url: String
});

const URL = mongoose.model('URL', URLSchema);

const createAndSaveURL = (url, done) => {
	const item = new URL({
		original_url: url,
		short_url: String(Math.floor(Math.random() * 100))
	});

	item.save((err, data) => (err ? console.error(err) : done(null, data)));
};

const shortenURL = (req, res, done) => {
	const httpRegex = /http[s]*:\/\/[www.]*/;
	const { url } = req.body;
	const dnsURL = url.replace(httpRegex, '');

	// Test if URL is valid
	dns.lookup(dnsURL, err => {
		if (err) return res.json({ error: 'Invalid URL' });

		createAndSaveURL(url, done);

		res.json({
			original_url: url,
			short_url: 'unkown'
		});
	});
};

// Shorten URL API endpoint
app.post('/api/shorturl/new', shortenURL);

app.listen(process.env.PORT, function() {
	console.log(`Node listening on ${process.env.PORT}`);
});

/*
1. I can POST a URL to [project_url]/api/shorturl/new and I will receive a shortened URL in the JSON response. Example : {"original_url":"www.google.com","short_url":1}

2. If I pass an invalid URL that doesn't follow the http(s)://www.example.com(/more/routes) format, the JSON response will contain an error like {"error":"invalid URL"}

HINT: to be sure that the submitted url points to a valid site you can use the function dns.lookup(host, cb) from the dns core module. When I visit the shortened URL, it will redirect me to my original link. 
*/
