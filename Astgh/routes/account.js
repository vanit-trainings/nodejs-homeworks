const express = require('express');
const uniqid = require('uniqid');
const jsonfile = require('jsonfile');
const joi = require('joi');

const crypto = require('crypto');
const keyHash = require('../data/keyHash.js');
const statuses = require('../data/const.js');
const baseMod = new (require('../modules/baseModel'))();
const dataSchema = require('../modules/joiSchema');

const router = express.Router();

const filePath = './data/users.json';
const logPassPath = './data/logPassId.json';
const tokenIdPath = './data/tokenId.json';

/*const validateLogin = function(login) {
	const regLog = new RegExp(/^((\w+)(\.|_)?){5,16}/);

	if (login.match(regLog)[ 0 ] !== null) {
		return (login === login.match(regLog)[ 0 ]);
	}
	return false;
};*/

const existingLogin = function(login, obj) {
	if (obj[ login ] !== undefined) {
		return false;
	}
	return true;
};

/*const validateEmail = function(email) {
	const regEmail = new RegExp(/[a-zA-z0-9]+[._]?[a-zA-Z0-9]+[._]?[a-zA-z0-9]@[a-zA-z]+[.][a-zA-Z]{1,}/);

	if (email.match(regEmail) !== null) {
		return email === email.match(regEmail)[ 0 ];
	}
	return false;
};*/

const existingEmail = function(obj, email) {
	for (const key in obj) {
		if (obj[ key ].email === email) {
			return false;
		}
	}
	return true;
};
/*
const validatePassword = function(password) {
	const regPass = new RegExp(/(\w+){6,16}/);

	if (password.match(regPass) !== null) {
		return (password === password.match(regPass)[ 0 ]);
	}
	return false;
};

const validateName = function(name) {
	const regName = new RegExp(/^[A-Z]{1}[a-z]+/);

	if (name.match(regName) !== null) {
		return (name === name.match(regName)[ 0 ]);
	}
	return false;
};

const validateGender = function(gender) {
	return (gender === 'female' || gender === 'male');
};

const validations = function(req) {
	if (Object.keys(req.body).length === 0) {
		return {
			statusCode: statuses.badRequest.code,
			statusMessage: statuses.badRequest.body
		};
	}
	if (!validateName(req.body.firstName)) {
		return {
			statusCode: statuses.badRequest.code,
			statusMessage: statuses.badRequest.firstName
		};
	}
	if (!validateName(req.body.lastName)) {
		return {
			statusCode: statuses.badRequest.code,
			statusMessage: statuses.badRequest.lastName
		};
	}
	if (!validateGender(req.body.gender)) {
		return {
			statusCode: statuses.badRequest.code,
			statusMessage: statuses.badRequest.gender
		};
	}
	if (!validateEmail(req.body.email)) {
		return {
			statusCode: statuses.badRequest.code,
			statusMessage: statuses.badRequest.email
		};
	}
	if (!validateLogin(req.body.login) && !validateEmail(req.body.login)) {
		return {
			statusCode: statuses.badRequest.code,
			statusMessage: statuses.badRequest.login
		};
	}
	if (!validatePassword(req.body.password)) {
		return {
			statusCode: statuses.badRequest.code,
			statusMessage: statuses.badRequest.password
		};
	}
	return {
		statusCode: statuses.ok.code,
		statusMessage: statuses.ok.message
	};
};*/

const hash = function(str, key) {
	const hcode = crypto.createHmac('sha512', Buffer.from(key));

	hcode.update(str);
	const value = hcode.digest('hex');

	return value;
};

const getToken = function(id) {
	const date = new Date();
	const content = {};
	const token = {};

	content.id = id;
	content.limitation = Number(date.getTime()) + (3 * 60 * 60 * 1000);
	token.info = content;

	const htoken = hash(JSON.stringify(content), keyHash.hashKey);

	token.hash = htoken;
	return (Buffer.from(JSON.stringify(token))).toString('base64');
};

const jsonString = function(str) {
	try {
		return JSON.parse(str);
	} catch (e) {
			return;
	}
};

const validateToken = function(token) {
	if (token === undefined) {
		return { statusCode: statuses.unauthorized.code, statusMessage: statuses.unauthorized.message };
	}
	const decodedStr = (Buffer.from(token.substring(7), 'base64').toString('ascii'));
	const tokenJsonObj = jsonString(decodedStr);

	if (tokenJsonObj === undefined) {
		return { statusCode: statuses.unauthorized.code, statusMessage: statuses.unauthorized.message };
	}
	const date = new Date();
	const htoken = tokenJsonObj.hash;
	const hinfo = hash(JSON.stringify(tokenJsonObj.info), keyHash.hashKey);

	if (htoken !== hinfo) {
		return { statusCode: statuses.unauthorized.code, statusMessage: statuses.unauthorized.message };
	}

	let time = tokenJsonObj.info.limitation - date.getTime();
	console.log(time);
	
	if (tokenJsonObj.info.limitation < date.getTime()) {
		return { statusCode: statuses.update.code, statusMessage: statuses.update.message };
	}
	return { statusCode: statuses.ok.code, id: tokenJsonObj.info.id };
};

const userInfo = function(req, id) {
	const info = {};

	info.firstName = req.body.firstName;
	info.lastName = req.body.lastName;
	info.email = req.body.email;
	info.login = req.body.login;
	info.gender = req.body.gender;
	info.birthDate = req.body.birthDate;
	info.userId = id;
	return info;
};

router.post('/register', (req, res) => {
    /*  const validationStatus = validations(req);
        if (validationStatus.statusCode !== statuses.ok.code) {
                return res.status(validationStatus.statusCode).json(validationStatus.statusMessage);
				}*/
				const data = req.body;
				joi.validate(data, dataSchema)
				.then(() => baseMod.readAll(filePath))
        .then((info) => {
                 if (!existingEmail(info, req.body.email)) {
					throw { statusCode: statuses.conflict.code, statusMessage: statuses.conflict.email};
                 }
                 else {
                         return baseMod.readAll(logPassPath);
                 }
        })
        .then((logPass) => {
                if (!existingLogin(req.body.login, logPass)) {
                    throw {statusCode: statuses.conflict.code, statusMessage: statuses.conflict.login};
                }
                else {
                        const id = uniqid();
                        const uinfo = userInfo(req, id);
                        baseMod.addItem(filePath, uinfo.userId, uinfo);
                        return id;
                }
        })
        .then((id) => {
                const logPassObj = {};
                logPassObj.password = (Buffer.from(req.body.password)).toString('base64');
                logPassObj.userId = id;
                baseMod.addItem(logPassPath, req.body.login, logPassObj);
        })
        .then(() => res.status(statuses.ok.code).json(statuses.ok.message))
        .catch((err) => {
				if (err.statusCode === statuses.badRequest.code || err.statusCode === statuses.conflict.code) {
                        return res.status(err.statusCode).json(err.statusMessage);
				}
				if (err.details[0].context.key) {
						return res.status(statuses.badRequest.code).json({ statusMessage: statuses.badRequest[err.details[0].context.key] });
				}
                return res.status(statuses.serverError.code).json(statuses.serverError.message);
        });
});

router.post('/login', (req, res) => {
	if (Object.keys(req.body).length === 0) {
		return res.status(statuses.badRequest.code).json(statuses.badRequest.body);
	}
	let id;
	baseMod.readAll(logPassPath)
        .then((logPass) => {
			if (!logPass.hasOwnProperty(req.body.login) || 
			   logPass[ req.body.login ].password !== (Buffer.from(req.body.password)).toString('base64')) {
				throw {statusCode: statuses.badRequest.code, statusMessage: statuses.badRequest.logPass};
			}			
			else {
				id = logPass[ req.body.login ].userId;
				return baseMod.readAll(tokenIdPath);
			}
		})
		.then((tokenId) => {
			const token = getToken(id);
			const refresh = crypto.randomBytes(15).toString('hex');
			
			const idToken = {};

			idToken.userId = id;
			idToken.checkingToken = refresh;
			baseMod.addItem(tokenIdPath, token, idToken);
			return {bearerToken: token, checkingToken: refresh};
		})
		.then((tokensPair) => res.status(statuses.ok.code).json(tokensPair))
		.catch((err) => {
			if (err.statusCode === statuses.badRequest.code || err.statusCode === statuses.conflict.code) {
				return res.status(err.statusCode).json(err.statusMessage);
			}
			return res.status(statuses.serverError.code).json(statuses.serverError.message);
		});
});

router.get('/logOut', (req, res) => {
	const bearerToken = req.headers.authorization;
	const tokenValidation = validateToken(bearerToken);
	const token = bearerToken.substring(7);
	if (tokenValidation.statusCode !== statuses.ok.code) {
		return res.status(tokenValidation.statusCode).json(tokenValidation.statusMessage);
	}
	baseMod.deleteItem(tokenIdPath, token)
	.then(() => res.status(statuses.ok.code).json(statuses.ok.message))
	.catch((err) => res.status(statuses.serverError.code).json(statuses.serverError.message));
});

router.get('/userinfo', (req, res) => {
	const token = req.headers.authorization;
	const tokenValidation = validateToken(token);
	if (tokenValidation.statusCode !== statuses.ok.code) {
		return res.status(tokenValidation.statusCode).json(tokenValidation.statusMessage);
	}

	const id = req.query.userId;
	if (!id) {
		id = tokenValidation.userId;
	}
	baseMod.readItem(filePath, id)
	.then((info) => {
		if (info === null) {
			return res.status(statuses.notFound.code).json(statuses.notFound.message);
		}
			return res.status(statuses.ok.code).json(info);
		})
	.catch((err) => res.status(statuses.serverError.code).json(statuses.serverError.message));
});

router.get('/updatedToken', (req, res) => {
	const bearerToken = req.headers.authorization;
	const tokenValidation = validateToken(bearerToken);
	if (tokenValidation.statusCode === statuses.ok.code) {
		return res.status(statuses.conflict.code).json(statuses.conflict.token);
	}
	if (tokenValidation.statusCode !== statuses.ok.code && tokenValidation.statusCode !== statuses.update.code) {
		return res.status(tokenValidation.statusCode).json(tokenValidation.statusMessage);
	}
	const checkingToken = req.headers.checking;
	if (checkingToken === undefined) {
		return res.status(statuses.preconditionFailed.code).json(statuses.preconditionFailed.message);
	}

	const token = req.headers.authorization.substring(7);

	baseMod.readItem(tokenIdPath, token)
	.then((tokenObj) => {
		if (!tokenObj || tokenObj[ 'checkingToken' ] !== checkingToken) {
			throw {statusCode: statuses.unauthorized.code, statusMessage: statuses.unauthorized.message};
		}
		else {
			const uid = tokenObj[ 'userId' ];
			baseMod.deleteItem(tokenIdPath, token)
			.then(() => {
				const newCheckingToken = crypto.randomBytes(15).toString('hex');
				const newTokenObj = {};
				newTokenObj.userId = uid;
				newTokenObj.checkingToken = newCheckingToken;
				baseMod.addItem(tokenIdPath, bearerToken, newCheckingToken);
				return res.status(statuses.ok.code).json({Token: bearerToken, CheckingToken: newCheckingToken});
			})
		}
	})
	.catch(() => {
		if (err.statusCode === statuses.badRequest.code || err.statusCode === statuses.conflict.code) {
			return res.status(err.statusCode).json(err.statusMessage);
		}
		return res.status(statuses.serverError.code).json(statuses.serverError.message);
	});
});

module.exports = router;