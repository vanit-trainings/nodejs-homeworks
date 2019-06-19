const express = require('express');
const uniqid = require('uniqid');
const jsonfile = require('jsonfile');
const TokenGenerator = require('uuid-token-generator');
const router = express.Router();
const Key = require("../data/.key.js")

const statusCodes  = require('../data/statusCodes.js');
const filePath = './data/users.json';
const logPassPath = './data/logPassId.json';
const tokenIdPath = './data/tokenId.json';


function validateLogin(login) {
	const regLog = new RegExp(/^((\w+)(\.|_)?){5,16}/);
	if (login.match(regLog)[0] !== null) {
		return (login === login.match(regLog)[0]);
	}
	return false;
}

function existingLogin(login, info) {
	if (info[login] != undefined) {
		return false;
	}
	return true;
}

function validateEmail(email) {
	const regEmail = new RegExp(/[a-zA-z0-9]+[._]?[a-zA-Z0-9]+[._]?[a-zA-z0-9]@[a-zA-z]+[.][a-zA-Z]{1,}/);
	if (email.match(regEmail) !== null) {
		return email === email.match(regEmail)[0];
	}
	return false;
}

function existingEmail(info, email) {
	if (info.email === email){ 
		return false; 
	}
	for (var key in info) {
		if (info[key].email === email) {
			return false;
		}
	}
	return true;
}

function validatePassword(password) {
	const regPass = new RegExp(/(\w+){6,16}/);
	return (password === password.match(regPass)[0]);
}

function validateName(name) {
	const regName = new RegExp(/^[A-Z]{1}[a-z]+/);
	if (name.match(regName) !== null) {
		return (name === name.match(regName)[0]);
	}
	return false;
}

function isJsonString(str) {
    try {
        const jsObj = JSON.parse(str);
        return jsObj;
    } 
    catch (e) {
        return false;
    }
}

function authorization(req) {
	const token = req.headers['token'];
	let id;
	if (req.body && req.body.length !== 0) {
		id = req.body.userId;
	}
	else {
		if (req.query.userId !== null) {
			id = req.query.userId;
		}		else {
			return { 'Status Code' : 401, 'Status Message' : 'Id is missing'};
		}
	}

	jsonfile.readFile(tokenIdPath, function(err, tokenId) {
		if (err) {
			return 'Server error';
		}
		if (tokenId[token] !== id){
			return 'Token Id pair do not match';
		}
		return 'OK';
	});
}
	
router.post('/registr', function(req, res) {
	if (Object.keys(req.body).length === 0) {
		return res.status(400).send('Bad request: Body is empty');
	}
	if (!validateName(req.body.firstName) || !validateName(req.body.lastName)) {
		return res.status(400).send('Bad request: Invalid firstName or lastName');
	}
	if (!validateEmail(req.body.email)) {
		return res.status(400).send('Bad request: Enter valid email');
	}
	if (!validateLogin(req.body.login) && !validateEmail(req.body.login)) {
		return res.status(401).send('Bad request: Enter valid login');
	}
	if (!validatePassword(req.body.password)) {
		return res.status(400).send('Bad request: Enter valid password');
	} 
	jsonfile.readFile(filePath, function(err, info) {
		if (err) {
			return res.status(500).send('Server error');
		}
		if (!existingEmail(info, req.body.email)) {
			return res.status(409).send('Bad request: Email already busy'); 
		}
		jsonfile.readFile(logPassPath, function(err, logPassId) {
			if (err) {
				return res.status(500).send('Server error');
			}
			if (!existingLogin(req.body.login, logPassId)) {
				return res.status(400).send('Bad request: Login already busy'); 
			}
			const id = uniqid();
			const codePass = (new Buffer(req.body.password)).toString('base64');
			let data = {};
			data.firstName = req.body.firstName;    
			data.lastName = req.body.lastName;    
			data.email = req.body.email;    
			data.login = req.body.login;    
			data.gender = req.body.gender;
			data.birthDate = req.body.birthDate;
			data.userId = id;
			info[id] = data;

			let logPass = {};    
			logPass.password = codePass;
			logPass.userId = id;

			jsonfile.writeFile(filePath, info, {spaces: 2, EOL: "\r\n"}, function(err) {
				if (err) {
					return res.status(500).send('Server error');
				}
				else {
					logPassId[req.body.login] = logPass;
					jsonfile.writeFile(logPassPath, logPassId, {spaces: 2, EOL: "\r\n"}, function(err) {
						if(err) {
							return res.status(500).send('Server error');
						}
						return res.status(200).send('OK');
					});
				}
			});
		});
	});
});

router.post('/login', function(req, res) {
	if (Object.keys(req.body).length === 0) {
		return res.status(400).send('Bad request: Body is empty');
	}
	jsonfile.readFile(logPassPath, function(err, logPassId) {
		if (err){
			return res.status(500).send('Server error'); 
		}
		if (!logPassId.hasOwnProperty(req.body.login) || logPassId[req.body.login].password !== (new Buffer(req.body.password)).toString('base64')){
			return res.status(400).send('Bad request: Enter valid login or password');
		}     
		else {
			const id = logPassId[req.body.login].userId;
			const token = (new TokenGenerator(256, TokenGenerator.BASE62)).generate();
			jsonfile.readFile(tokenIdPath, function(err, tokenId) {
				if (err) {
					return res.status(500).send('Server error'); 
				}

				tokenId[token] = id;
				jsonfile.writeFile(tokenIdPath, tokenId, {spaces: 2, EOL: "\r\n"}, function(err) {
					if (err) {
						return res.status(500).send('Server error');
					}
					jsonfile.writeFile(logPassPath, logPassId, {spaces: 2, EOL: "\r\n"}, function(err) {
						if (err) {
							return res.status(500).send('Server error');
						}
						res.writeHead(200, {'token':token});                        
						res.write('OK');
						res.end();
						return res.send();
					});
				});    
			});
		};
	});
});

router.get('/logOut', function(req, res) {
	if (authorization(req) === 'Server error') {
		return res.status(500).send('Server error');
	}
	if (authorization(req) === 'Id is missing') {
		return res.status(400).send('Bad request: UserId is missing');
	}
	if (authorization(req) === 'Token Id pair do not match') {
		return res.status(400).send('Bad request: Token Id pair do not match');
	}
	const token = req.headers['token'];
	jsonfile.readFile(tokenIdPath, function(err, tokenId) {
		if (err) {
			return res.status(500).send('Server error'); 
		}
		delete(tokenId[token]);
		jsonfile.writeFile(tokenIdPath, tokenId, {spaces: 2, EOL: "\r\n"}, function(err) {
			if (err) {
				return res.status(500).send('Server error'); 
			}
			return res.status(200).send('OK');
		});
	});
});
router.get('/userInfo', function(req, res) { 
	const userId = req.query.userId;
	let clientId = req.query.clientId;
	const token = req.header['token'];

	if(!clientId) {
		clientId = userId; 
	}

	if (authorization(req) === 'Server error') {
		return res.status(500).send('Server error');
	}
	if (authorization(req) === 'Id is missing') {
		return res.status(400).send('Bad request: UserId is missing');
	}
	if (authorization(req) === 'Token Id pair do not match') {
		return res.status(400).send('Bad request: Token Id pair do not match');
	}
	jsonfile.readFile(filePath, function(err, info) {
		if (err) {
			return res.status(500).send('Server error'); 
		}

		let userInfo = {};
		userInfo.id = info[clientId].userId;
		userInfo.firstName = info[clientId].firstName;
		userInfo.lastName = info[clientId].lastName;
		userInfo.birthDate = info[clientId].birthDate;
		userInfo.gender = info[clientId].gender;
		userInfo.email = info[clientId].email;

		jsonfile.writeFile(filePath, info,{spaces: 2, EOL: "\r\n"}, function(err) {
			if (err) {            
				return res.status(500).send('Server error');
			}
			res.writeHead(200, {'token' : token});
			let uInfo = JSON.stringify(userInfo);                        
			res.write(uInfo);
			res.end();
			return res.send();
		});
	});
});
})

module.exports = router;
