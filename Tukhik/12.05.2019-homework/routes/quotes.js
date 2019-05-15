var express = require('express');
var router = express.Router();
const jsonfile = require('jsonfile');
const filePathQuotes = './data/quotes.json';



router.get('/', function(req, res) {
    jsonfile.readFile(filePathQuotes, function (err, obj) {
        if(err) {
			return res.status(500).send("1External server error");
		}
		res.status(200).send(obj);
    })
});

/* add new */
router.post('/', function(req, res) {
    jsonfile.readFile(filePathQuotes, function (err, obj) {
        if(err) {
			return res.status(500).send("There was an error reading the file!");
		}
		if(!req.body || req.body.data === "" ) {
            return res.status(400).send("Bad request");
        }
        const key = Date.now();
        obj.users[key] = {
            id: key,
            data: req.body.data.Sex 
        }
	     jsonfile.writeFile(filePathQuotes, obj, function(err, obj) {
            if(err) {
                return res.status(500).send("External server error");
            }
            res.status(200).send("ok");
        })
	
    })
});

router.get('/', function(req, res) {
    jsonfile.readFile(filePathQuotes, function (err, obj) {
        if(err) {
			return res.status(500).send("1External server error");
		}
		res.status(200).send(obj);
    })
});

/* add new */
router.post('/', function(req, res) {
    jsonfile.readFile(filePathQuotes, function (err, obj) {
        if(err) {
			return res.status(500).send("There was an error reading the file!");
		}
		if(!req.body || req.body.data === "" ) {
            return res.status(400).send("Bad request");
        }
        const key = Date.now();
        obj.users[key] = {
            id: key,
            data: req.body.data.Sex 
        }
	     jsonfile.writeFile(filePathQuotes, obj, function(err, obj) {
            if(err) {
                return res.status(500).send("External server error");
            }
            res.status(200).send("ok");
        })
	
    })
});



module.exports = router;

//https://any-api.com/1forge_com/1forge_com/docs/_symbols/GET