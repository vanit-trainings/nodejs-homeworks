var express = require('express');
const jsonfile = require('jsonfile');
var uniqid = require('uniqid');
var router = express.Router();
const filePath = './data/users.json';

/* GET users listing. */
router.get('/', function(req, res) {
    jsonfile.readFile(filePath, function (err, obj) {
        if(err) {
			return res.status(500).send("External server error");
		}
        const users = {};
        for(item in obj.users) {
            users[item] = {"name":obj.users[item].name, "surname": obj.users[item].surname, "age": obj.users[item].age}
        }
        res.status(200).send(users);
    })
});

/* GET user by ID. */
router.get('/:id', function(req, res) {
    jsonfile.readFile(filePath, function (err, obj) {
        if(err) {
			return res.status(500).send("External server error");
		}
		const userID = req.params.id;
		if(!obj.users[userID]) {
			return res.status(404).send("Data not found");
		}
        res.status(200).send(obj.users[userID]);
    })
});

/* Add a new user. */
router.post('/', function(req, res) {
    jsonfile.readFile(filePath, function (err, obj) {
        if(err) {
			return res.status(500).send("External server error");
		}
        if(req.headers['content-type'] !== 'application/json') {
            return res.status(400).send("Bad request: Body is not JSON");            
        }        
        if(Object.keys(req.body).length === 0) {
            return res.status(400).send("Bad request: Body is empty");
        }
        if(req.body.name === "" || req.body.name === "" || req.body.email === "") {
            return res.status(400).send("Bad request: Missing or additional keys.");
        }
        const key = uniqid();
        obj.users[key] = {
            id: key,
            name: req.body.name,
            surname: req.body.surname,
            age: req.body.age,
            gender: req.body.gender,
            email: req.body.email
        }
        jsonfile.writeFile(filePath, obj, function(err, obj) {
            if(err) {
                return res.status(500).send("External server error");
            }
            res.status(200).send("ok");
        })
    })
});

/* Delete user data. */
router.delete('/:id', function(req, res) {
    jsonfile.readFile(filePath, function (err, obj) {
        if(err) {
			return res.status(500).send("External server error");
		}
        const userID = req.params.id;
        if(!obj.users[userID]) {
            return res.status(400).send("Bad request");
        }
        delete obj.users[userID];
        jsonfile.writeFile(filePath, obj, function(err, obj) {
            if(err) {
                return res.status(500).send("External server error");
            }
        res.status(204).send("No Content");
        })
    })
});

/* Change user data. */
router.put('/:id', function(req, res) {
    jsonfile.readFile(filePath, function (err, obj) {
        if(err) {
			return res.status(500).send("External server error");
		}
        if(req.headers['content-type'] !== 'application/json') {
            return res.status(400).send("Bad request: Body is not JSON");            
        }        
        if(Object.keys(req.body).length === 0) {
            return res.status(400).send("Bad request: Body is empty");
        }
        if(req.body.name === "" || req.body.name === "" || req.body.email === "") {
            return res.status(400).send("Bad request: Missing or additional keys.");
        }
        const iserID = req.params.id;
        if(!obj.users[iserID]) {
            return res.status(404).send("Data not found");
        }
        const keys = Object.keys(req.body);
        keys.forEach(function(item){
            if(obj.users[bookID][item] && req.body[item] !== "") {
                obj.users[bookID][item] = req.body[item];
            }
        });
        jsonfile.writeFile(filePath, obj, function(err, obj) {
            if(err) {
                return res.status(500).send("External server error");
            }
            res.status(200).send("ok");
        })
    })
});

module.exports = router;