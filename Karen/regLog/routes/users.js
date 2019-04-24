var express = require('express');
var router = express.Router();
var fs = require('fs');
var uniqid = require('uniqid');

router.post('/register', function(req, res) {
	fs.readFile("./data/data.json", "utf8", function(err, data){
		if(err) {return res.status(500).send("Internal Server Error")};
		const users = JSON.parse(data);
		const newUserId = {};
		const newId = uniqid.process();
		const newUser = {
			login: req.body.login,
			password: req.body.password
		};
		if(!req.body.login || !req.body.password) {return res.status(400).send("mutq login")};
		const x = /^\w+@\w+(\.\w{2,3})/;
		const y = /^\w{8,16}/;
		if(!x.test(req.body.login)) {return res.status(400).send("no corect email")};
		if(!y.test(req.body.password)) {return res.status(400).send("no corect password")};
		for(key in users){
			if(users[key].login == req.body.login){
				return res.status(400).send("This login already exists.");
			}
		};
		newUserId[newId] = newUser;
		const user = Object.assign(users, newUserId);
		fs.writeFile("./data/data.json", JSON.stringify(users), function(err) {
    		if(err) {return res.status(500).send("Internal Server Error")};
    		res.send("Registration Completed Successfully");
    	}); 

	})
});

router.post('/login', function(req, res){
	fs.readFile("./data/data.json", "utf8", function(err, data){
		if(err) {return res.status(500).send("Internal Server Error")};
		const users = JSON.parse(data);
		const x = /^\w+@\w+(\.\w{2,3})/;
		const y = /^\w{8,16}/;
		if(!x.test(req.body.login)) {return res.status(400).send("no corect email")};
		if(!y.test(req.body.password)) {return res.status(400).send("no corect password")};
		for(key in users){
			if((users[key].login === req.body.login) && (users[key].password === req.body.password)) {
				return res.send('mutq');
			}
		}
		res.status(400).send('no corect')
	})
});

module.exports = router;
