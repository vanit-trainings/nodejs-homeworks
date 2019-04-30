const express = require('express');
const uniqid = require('uniqid');
const jsonfile = require('jsonfile');
const TokenGenerator = require('uuid-token-generator');
const router = express.Router();

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

function existingLogin(login, obj) {
    if (obj[login] != undefined) {
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

function existingEmail(obj, email) {
    if (obj.email === email){ 
        return false; 
    }
    for (var key in obj) {
        if (obj[key].email === email) {
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

function validations(req) {
    if (Object.keys(req.body).length === 0) {
		return 'Bad request: Body is empty';
	}
	if (!validateName(req.body.firstName) || !validateName(req.body.lastName)) {
		return 'Bad request: Invalid firstName or lastName';
	}
	if (!validateEmail(req.body.email)) {
		return 'Bad request: Enter valid email';
	}
	if (!validateLogin(req.body.login) && !validateEmail(req.body.login)) {
		return 'Bad request: Enter valid login';
	}
	if (!validatePassword(req.body.password)) {
		return 'Bad request: Enter valid password';
    }
    return 'OK';                                             
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
        }
        else {
            return 'Id is missing';
        }
    }
    
    jsonfile.readFile(tokenIdPath, function(err, obj3) {
        if (err) {
            return 'Server error';
        }
        if (obj3[token] !== id){
            return 'Token-Id pair not found';
        }
        return 'OK';
    });
}

router.post('/registr', function(req, res) {
    if (validations(req) ===  'Bad request: Body is empty') {
        return res.status(Status.statusCode).send(Status.statusMessage);
    }
        jsonfile.readFile(filePath, function(err, obj) {
		if (err) {
			return res.status(500).send('Server error');
		}
		if (!existingEmail(obj, req.body.email)) {
			return res.status(409).send('Bad request: Email already busy'); 
        }
		jsonfile.readFile(logPassPath, function(err, obj1) {
			if (err) {
				return res.status(500).send('Server error');
            }
			if (!existingLogin(req.body.login, obj1)) {
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
			obj[id] = data;

			let logPass = {};    
			logPass.password = codePass;
			logPass.userId = id;

			jsonfile.writeFile(filePath, obj, {spaces: 2, EOL: "\r\n"}, function(err) {
				if (err) {
					return res.status(500).send('Server error');
				}
				else {
					obj1[req.body.login] = logPass;
					jsonfile.writeFile(logPassPath, obj1, {spaces: 2, EOL: "\r\n"}, function(err) {
						if(err) {
							return res.status(500).send('Server error');
						}
						return res.status(200).send('OK');
					});
				}
			});
		});
    })
});

router.post('/login', function(req, res) {
    if (Object.keys(req.body).length === 0) {
        return res.status(400).send('Bad request: Body is empty');
    }
    if (!validateLogin(req.body.login) && !validateEmail(req.body.login)) {
        return res.status(400).send('Bad request: Enter valid login');
    } 
    if (!validatePassword(req.body.password)) {
        return res.status(400).send('Bad request: Enter valid password');
    }
    jsonfile.readFile(logPassPath, function(err, obj4) {
        if (err){
            return res.status(500).send('Server error'); 
        }
        if (!obj4.hasOwnProperty(req.body.login) || obj4[req.body.login].password !== (new Buffer(req.body.password)).toString('base64')){
            return res.status(400).send('Bad request: Enter valid login and password');
        }     
        else {
            const id = obj4[req.body.login].userId;
            const token = (new TokenGenerator(256, TokenGenerator.BASE62)).generate();
            jsonfile.readFile(tokenIdPath, function(err, obj5) {
                if (err) {
                    return res.status(500).send('Server error'); 
                }
                obj5[token] = id;
                jsonfile.writeFile(tokenIdPath, obj5, {spaces: 2, EOL: "\r\n"}, function(err) {
                    if (err) {
                        return res.status(500).send('Server error');
                    }
                        jsonfile.writeFile(logPassPath, obj4, {spaces: 2, EOL: "\r\n"}, function(err) {
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
                }
            });
    });

router.get('/logOut', function(req, res) {
    if (authorization(req) === 'Server error') {
        return res.status(500).send('Server error');
    }
    if (authorization(req) === 'Id is missing') {
        return res.status(400).send('Bad request: UserId is missing');
    }
    if (authorization(req) === 'Token-Id pair not found') {
        return res.status(400).send('Bad request: Token-Id pair not found');
    }
    const token = req.headers['token'];
    jsonfile.readFile(tokenIdPath, function(err, obj6) {
        if (err) {
            return res.status(500).send('Server error'); 
        }
        delete(obj6[token]);
        jsonfile.writeFile(tokenIdPath, obj6, {spaces: 2, EOL: "\r\n"}, function(err) {
            if (err) {
                return res.status(500).send('Server error'); 
            }
            return res.status(200).send('OK');
        });
    });
});

router.get('/userInfo', function(req, res) {
    const userId = req.query.userId;
    let id = req.query.clientId;
    const token = req.headers['token'];
    if (!id) {
        id = userId;
    }
    if (authorization(req) === 'Server error') {
        return res.status(500).send('Server error');
    }
    if (authorization(req) === 'Id is missing') {
        return res.status(400).send('Bad request: UserId is missing');
    }
    if (authorization(req) === 'Token-Id pair not found') {
        return res.status(400).send('Bad request: Token-Id pair not found');
    }

    jsonfile.readFile(filePath, function(err, obj5) {
        if (err) {
            return res.status(500).send('Server error'); 
        }
        let userInfo = {};
        userInfo.id = obj5[id].userId;
        userInfo.firstName = obj5[id].firstName;
        userInfo.lastName = obj5[id].lastName;
        userInfo.birthDate = obj5[id].birthDate;
        userInfo.gender = obj5[id].gender;
        userInfo.email = obj5[id].email;
        jsonfile.writeFile(filePath, obj5, {spaces: 2, EOL: "\r\n"}, function(err) {
        if (err) {            
            return res.status(500).send('Server error');
        }
        if (!userInfo) {
            return res.status(400).send('User not found');            
        }
        console.log(token);
        res.writeHead(200, {"token" : token});
        let info = JSON.stringify(userInfo);
        res.write(String(info));
        res.end();
        return res.send();
        });
    });
});

module.exports = router;