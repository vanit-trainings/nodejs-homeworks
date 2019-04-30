var express = require('express');
var router = express.Router();
var fs = require('fs');
var uniqid = require('uniqid');

router.post('/register', function(req, res) {
	fs.readFile("./data/data.json", "utf8", function(err, data){
		if(err) {return res.status(500).send("Internal Server Error")};
		const users = JSON.parse(data);
		const newUser = {};
		newUser[req.body.login] = req.body.password;
		if(!req.body.login || !req.body.password) {return res.status(400).send("mutq login")};
		const x = /^\w+@\w+(\.\w{2,3})/;
		const y = /^\w{8,16}/;
		if(!x.test(req.body.login)) {return res.status(400).send("no corect email")};
		if(!y.test(req.body.password)) {return res.status(400).send("no corect password")};
		if(!!users[req.body.login]){
			return res.status(400).send("This login already exists.");
		};
		const user = Object.assign(users, newUser);
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
		if(!!users[req.body.login] && !!users[req.body.login][req.body.password]) {			
			return res.status(400).send("no corect");
		};
		function Token() {
			let x = Math.random().toString(36).substr(2);
			return x + x;
		};
		let token = Token();
		let tokenUser[token] = {
				login : req.body.login,
				date : new Date()
			};
		fs.readFile("./data/token.json", "utf8", function(err, tok){
			if(err) {return res.status(500).send("Internal Server Error")};
			const valid = JSON.parse(tok);
			const user = Object.assign(valid, tokenUser);
			fs.writeFile("./data/token.json", JSON.stringify(valid), function(err){
				if(err) {return res.status(500).send("Internal Server Error")};
				res.send(token);
			});
		});
	});
});

router.get('/info', function(res, req){
	const token = req.getHeaders['to'];
	if(!!token) {return res.status(500).send("Internal Server Error")};
	fs.readFile("./data/token.json", "utf8", function(err, tok){
		const valid = JSON.parse(tok);
		if(!!valid[token]){return res.status(500).send("Internal Server Error")};
		const tim = new Date();
		if((tim - valid[token][date]) > 7200000) {
			delete valid[token];
			fs.writeFile("./data/token.json", JSON.stringify(valid), function(err){
				if(err) {return res.status(500).send("Internal Server Error")};
			});
			return res.status(500).send("Internal Server Error");
		};
		const inf = "alo";
		res.send(inf);
	});
});

module.exports = router;