/*eslint no-undef: "error"*/
/*eslint-env node*/

var express = require('express');
var router = express.Router();
var fs = require('fs');
var cripto = require('crypto-js');
var validator = require('validator');

const passObj = './data/data.json';
const tokenObj = './data/token.json';

router.post('/register', function(req, res) {
	fs.readFile(passObj, "utf8", function(err, data){
		if(err) {return res.status(500).send("Internal Server Error")}
		const users = JSON.parse(data);
		const newUser = {};
		if(!req.body.login || !req.body.password) {return res.status(400).send("mutq login")}
		if(!validator.isEmail(req.body.login)) {return res.status(400).send("mutq login")}
		if(!validator.isAlphanumeric(req.body.password)) {return res.status(400).send("mutq password")}
		if(users[req.body.login]) {return res.status(400).send("This login already exists.")}
		newUser[req.body.login] = req.body.password;
		Object.assign(users, newUser);
		fs.writeFile(passObj, JSON.stringify(users), function(err) {
			if(err) {return res.status(500).send("Internal Server Error")}
			res.send("Registration Completed Successfully");
		}); 

	})
});

router.post('/login', function(req, res){
	fs.readFile(passObj, "utf8", function(err, data){
		if(err) {return res.status(500).send("Internal Server Error")}
		const users = JSON.parse(data);
		if(!req.body.login || !req.body.password) {return res.status(400).send("bad request")}
		if(!users.hasOwnProperty(req.body.login)) {return res.status(400).send("no corect")}
		if(users[req.body.login] != req.body.password) {return res.status(400).send("no corect")}
		let token = cripto.AES.encrypt(req.body.login, '24').toString();
		const tokenUser = {};
		tokenUser[token] = Date.parse(new Date());
		fs.readFile(tokenObj, "utf8", function(err, data){
			if(err) {return res.status(500).send("Internal Server Error")}
			const tokenData = JSON.parse(data);
			Object.assign(tokenData, tokenUser);
			fs.writeFile(tokenObj, JSON.stringify(tokenData), function(err){
				if(err) {return res.status(500).send("Internal Server Error")}
			});
			res.setHeader("Authorizat", `${token}`);
			res.send('ok');
		});
	});
});

router.get('/info', function(req, res){
	const token = req.headers["authorizat"];
	if(!token) {return res.status(500).send("Internal Server Error1")}
	fs.readFile(tokenObj, "utf8", function(err, data){
		const tokenData = JSON.parse(data);
		if(!tokenData.hasOwnProperty(token)){return res.status(500).send("Internal Server Error2")}
		const nowTime = Date.parse(new Date());
		if(nowTime - tokenData[token] > 7200000) {
			delete tokenData[token];
			fs.writeFile(tokenObj, JSON.stringify(tokenData), function(err){
				if(err) {return res.status(500).send("Internal Server Error")}
			});
			res.status(401).send("no authorization");
		}
		const inf = "alo";
		res.send(inf);
	});
});

module.exports = router;