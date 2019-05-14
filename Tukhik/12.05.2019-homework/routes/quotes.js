var express = require('express');
var router = express.Router();
const jsonfile = require('jsonfile');
const filePathQuotes = './data/quotes.json';

router.get('/', function(req, res) {
    jsonfile.readFile(filePathQuotes, function (err, obj) {
        if(err) {
			return res.status(500).send("1External server error");
		}
		const quotes = {};
        for(item in obj.quotes) {
            quotes[item] = {"id":obj.quotes[item].id}
        }
			res.status(200).send(quotes);
    })
});


router.get('/quotes', function(req, res) {
     jsonfile.readFile(filePathQuotes, function (err, obj) {
        if(err) {
			return res.status(500).send("1External server error");
		}
		const quotes = {};
        for(item in obj.quotes) {
            quotes[item] = {"id":obj.quotes[item].id, "quotes": obj.quotes[item].quotes}
        }
			res.status(200).send(quotes);
    })
});


module.exports = router;

//https://any-api.com/1forge_com/1forge_com/docs/_symbols/GET