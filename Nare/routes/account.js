const express = require('express');
const uniqid = require('uniqid');
const jsonfile = require('jsonfile');
const TokenGenerator = require('uuid-token-generator');
const crypto = require('crypto');
const keyHash = require('../data/keyHash.js');

const router = express.Router();
const filePath = './data/users.json';
const logPassPath = './data/logPassId.json';
const tokenIdPath = './data/tokenId.json';
const statuses = require('./status');

const validateLogin = (login) => {
    const regLog = new RegExp(/^((\w+)(\.|_)?){5,16}/);

    if (login.match(regLog)[ 0 ] !== null) {
        return (login === login.match(regLog)[ 0 ]);
    }
    return false;
};

const existingLogin = (login, info) => {
    if (info[ login ] !== undefined) {
        return false;
    }
    return true;
};

const validateEmail = (email) => {
    const regEmail = new RegExp(/[a-zA-z0-9]+[._]?[a-zA-Z0-9]+[._]?[a-zA-z0-9]@[a-zA-z]+[.][a-zA-Z]{1,}/);

    if (email.match(regEmail) !== null) {
        return email === email.match(regEmail)[ 0 ];
    }
    return false;
};

const existingEmail = (info, email) => {
    if (info.email === email) {
        return false;
    }
    for (const key in info) {
        if (info[ key ].email === email) {
            return false;
        }
    }
    return true;
};

const validatePassword = (password) => {
    const regPass = new RegExp(/(\w+){6,16}/);

    if (password.match(regPass)) {
        return (password === password.match(regPass)[ 0 ]);
    }
    return false;
};

const validateName = (name) => {
    const regName = new RegExp(/^[A-Z]{1}[a-z]+/);

    if (name.match(regName) !== null) {
        return (name === name.match(regName)[ 0 ]);
    }
    return false;
};
const validateGender = (gender) => (gender === 'female' || gender === 'male');

const validations = function(req) {
    if (Object.keys(req.body).length === 0) {
        return {
            statusCode: statuses.badRequest.status,
            statusMessage: statuses.badRequest.messageFirst
        };
    }
    if (!validateName(req.body.firstName) || !validateName(req.body.lastName)) {
        return {
            statusCode: statuses.badRequest.status,
            statusMessage: statuses.badRequest.messageSecond
        };
    }
    if (!validateGender(req.body.gender)) {
        return {
            statusCode: statuses.badRequest.status,
            statusMessage: statuses.badRequest.messageThird
        };
    }
    if (!validateEmail(req.body.email)) {
        return {
            statusCode: statuses.badRequest.status,
            statusMessage: statuses.badRequest.messageFourth
        };
    }
    if (!validateLogin(req.body.login) && !validateEmail(req.body.login)) {
        return {
            statusCode: statuses.badRequest.status,
            statusMessage: statuses.badRequest.messageFifth
        };
    }
    if (!validatePassword(req.body.password)) {
        return {
            statusCode: statuses.badRequest.status,
            statusMessage: statuses.badRequest.messageSixth
        };
    }
    return {
        statusCode: statuses.ok.status,
        statusMessage: statuses.ok.message
    };
};

router.post('/register', (req, res) => {
    const validationStatus = validations(req);

    if (validationStatus.statusCode !== statuses.ok.status) {
        return res.status(validationStatus.statusCode).json(validationStatus.statusMessage);
    }
    jsonfile.readFile(filePath, (err, info) => {
        if (err) {
            return res.status(statuses.serverError.status).json({ statusMessage: statuses.serverError.message });
        }
        if (!existingEmail(info, req.body.email)) {
            return res.status(statuses.conflict.status).json({ statusMessage: statuses.conflict.messageFirst });
        }
        jsonfile.readFile(logPassPath, (err, logPassId) => {
            if (err) {
                return res.status(statuses.serverError.status).json({ statusMessage: statuses.serverError.message });
            }
            if (!existingLogin(req.body.login, logPassId)) {
                return res.status(statuses.conflict.status).json({ statusMessage: statuses.conflict.messageSecond });
            }
            const id = uniqid();
            const codePass = (new Buffer(req.body.password)).toString('base64');
            const data = {};

            data.firstName = req.body.firstName;
            data.lastName = req.body.lastName;
            data.email = req.body.email;
            data.login = req.body.login;
            data.gender = req.body.gender;
            data.birthDate = req.body.birthDate;
            data.userId = id;
            info[ id ] = data;

            const logPass = {};

            logPass.password = codePass;
            logPass.userId = id;

            jsonfile.writeFile(filePath, info, { spaces: 2, EOL: '\r\n' }, (err) => {
                if (err) {
                    return res.status(statuses.serverError.status).json({ statusMessage: statuses.serverError.message });
                }
				
                logPassId[ req.body.login ] = logPass;
                jsonfile.writeFile(logPassPath, logPassId, { spaces: 2, EOL: '\r\n' }, (err) => {
                    if (err) {
                        return res.status(statuses.serverError.status).json({ statusMessage: statuses.serverError.message });
                    }
                    return res.status(statuses.ok.status).json({ statusMessage: statuses.ok.message });
                });
            });
        });
    });
});

router.post('/login', (req, res) => {
    if (Object.keys(req.body).length === 0) {
        return res.status(statuses.badRequest.status).json({ statusMessage: statuses.badRequest.messageFirst });
    }
    jsonfile.readFile(logPassPath, (err, logPassId) => {
        if (err) {
            return res.status(statuses.serverError.status).json({ statusMessage: statuses.serverError.message });
        }
        if (!logPassId.hasOwnProperty(req.body.login) || logPassId[ req.body.login ].password !== (new Buffer(req.body.password)).toString('base64')) {
            return res.status(statuses.badRequest.status).json({ statusMessage: statuses.badRequest.messageSeventh });
        }
		
        const id = logPassId[ req.body.login ].userId;
        const token = (new TokenGenerator(256, TokenGenerator.BASE62)).generate();

        jsonfile.readFile(tokenIdPath, (err, tokenId) => {
            if (err) {
                return res.status(statuses.serverError.status).json({ statusMessage: statuses.serverError.message });
            }

            tokenId[ token ] = id;
            jsonfile.writeFile(tokenIdPath, tokenId, { spaces: 2, EOL: '\r\n' }, (err) => {
                if (err) {
                    return res.status(statuses.serverError.status).json({ statusMessage: statuses.serverError.message });
                }
                jsonfile.writeFile(logPassPath, logPassId, { spaces: 2, EOL: '\r\n' }, (err) => {
                    if (err) {
                        return res.status(statuses.serverError.status).json({ statusMessage: statuses.serverError.message });
                    }
                    res.setHeader('token', token);
                    return res.json({ statusMessage: statuses.ok.message });
                });
            });
        });
    });
});

router.get('/logOut', (req, res) => {
    const token = req.headers.token;

    jsonfile.readFile(tokenIdPath, (err, tokenId) => {
        if (err) {
            return res.status(statuses.serverError.status).json({ statusMessage: statuses.serverError.message });
        }
        delete (tokenId[ token ]);
        jsonfile.writeFile(tokenIdPath, tokenId, { spaces: 2, EOL: '\r\n' }, (err) => {
            if (err) {
                return res.status(statuses.serverError.status).json({ statusMessage: statuses.serverError.message });
            }
            return res.status(statuses.ok.status).json({ statusMessage: statuses.ok.message });
        });
    });
});
router.get('/userInfo', (req, res) => {
    const userId = req.query.userId;
    let clientId = req.query.clientId;
    const token = req.header.token;

    if (!clientId) {
        clientId = userId;
    }

    jsonfile.readFile(filePath, (err, info) => {
        if (err) {
            return res.status(statuses.serverError.status).json({ statusMessage: statuses.serverError.message });
        }

        const userInfo = {};

        userInfo.id = info[ clientId ].userId;
        userInfo.firstName = info[ clientId ].firstName;
        userInfo.lastName = info[ clientId ].lastName;
        userInfo.birthDate = info[ clientId ].birthDate;
        userInfo.gender = info[ clientId ].gender;
        userInfo.email = info[ clientId ].email;

        jsonfile.writeFile(filePath, info, { spaces: 2, EOL: '\r\n' }, (err) => {
            if (err) {
                return res.status(statuses.serverError.status).json({ statusMessage: statuses.serverError.message });
            }
            res.writeHead(statuses.ok.status, { token });
            const uInfo = JSON.stringify(userInfo);

            res.write(uInfo);
            res.end();
            return res.send();
        });
    });
});

module.exports = router;
