'use strict';
require('dotenv').config();
const express = require('express');
// const mongo = require('mongodb');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();

mongoose.connect(process.env.MONGOLAB_URI, { useNewUrlParser: true, useUnifiedTopology: true });

const db = mongoose.connection;

db.on('error', console.error.bind(console, 'connection error:'));

const Schema = mongoose.Schema;

app.use(cors());

/** this project needs to parse POST bodies **/
// you should mount the body-parser here
app.use(bodyParser.urlencoded({ extended: false }));

app.use('/public', express.static(process.cwd() + '/public'));

app.get('/', function(req, res) {
	res.sendFile(process.cwd() + '/views/index.html');
});

const urlSchema = new Schema({
	url:  String,
	shortURL: String,
});

const Url = mongoose.model('url', urlSchema);

const shortenURL = (req, res) => {
	const createAndSaveURL = (done) => {
		const newUrl = new Url({
			originalURL: req.body.url,
			shortenedURL: 1,
		});
	
		newUrl.save((err, data) => {
			if (err) return console.error(err);
			done(null, data);
		});
	};

	res.json({ url: req.body.url });
};

// Shorten URL API endpoint
app.post('/api/shorturl/new', shortenURL);

app.listen(process.env.PORT, function() {
	console.log(`Node listening on ${process.env.PORT}`);
});

/*
dns.lookup(host, cb)

1. I can POST a URL to [project_url]/api/shorturl/new and I will receive a shortened URL in the JSON response. Example : {"original_url":"www.google.com","short_url":1}

2. If I pass an invalid URL that doesn't follow the http(s)://www.example.com(/more/routes) format, the JSON response will contain an error like {"error":"invalid URL"}

HINT: to be sure that the submitted url points to a valid site you can use the function dns.lookup(host, cb) from the dns core module. When I visit the shortened URL, it will redirect me to my original link. 
*/
