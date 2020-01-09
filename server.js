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

const createShortURL = () => {
	const length = 8;
	const alphabet = 'abcdefghijklmnopqrstuvwxyz';
	let i = 0;
	let short;

	while (i < length) {
		const even = i % 2 === 0;
		let char;

		if (even) {
			char = alphabet[Math.floor(Math.random() * 26)];
		} else {
			char = Math.floor(Math.random() * 10);
		}

		short = i === 0 ? char : `${short}${char}`;
		i++;
	}

	return short;
};

const URLSchema = new mongoose.Schema({
	original_url: String,
	short_url: String
});

const URL = mongoose.model('URL', URLSchema);

const createAndSaveURL = (original_url, short_url) => {
	const item = new URL({ original_url, short_url });
	item.save();
};

const shortenURL = (req, res) => {
	const httpRegex = /http[s]*:\/\/[www.]*/;
	const original_url = req.body.url;
	const dnsURL = original_url.replace(httpRegex, '');

	// Test if URL is valid
	dns.lookup(dnsURL, err => {
		if (err) return res.json({ error: 'Invalid URL' });

		const short_url = createShortURL();
		createAndSaveURL(original_url, short_url);

		res.json({ original_url, short_url });
	});
};

// Shorten URL API endpoint
app.post('/api/shorturl/new', shortenURL);

const findURLByShort = async short_url => await URL.findOne({ short_url });

const redirectShortURL = async (req, res) => {
	const { short_url } = req.params;
	const { original_url } = await findURLByShort(short_url);
	res.redirect(original_url);
};

// Redirect Short URL API endpoint
app.get('/api/shorturl/:short_url', redirectShortURL);

app.listen(process.env.PORT, function() {
	console.log(`Node listening on ${process.env.PORT}`);
});
