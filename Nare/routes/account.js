const express = require('express');
const uniqid = require('uniqid');
const jsonfile = require('jsonfile');
const TokenGenerator = require('uuid-token-generator');

const router = express.Router();
const filePath = './data/users.json';
const logPassPath = './data/logPassId.json';
const tokenIdPath = './data/tokenId.json';

const statuses = {
    notFound: {
        status: 404,
        message: 'not found'
    },
    serverError: {
        status: 500,
        message: 'server Error'
    },
    badRequest: {
        status: 400,
        messageFirst: 'Body is empty',
        messageSecond: 'Invalid firstName or lastName',
        messageThird: 'Invalid gender',
        messageFourth: 'Enter valid email',
        messageFifth: 'Enter valid login',
        messageSixth: 'Enter valid password',
        messageSeventh: 'Enter valid login and password'
    },
    unauthorized: {
        status: 401,
        messageFirst: 'unauthorized',
        messageSecond: 'Token needs to be updated'

    },
    conflict: {
        status: 409,
        messageFirst: 'Email already busy',
        messageSecond: 'Login already busy'
    },
    ok: {
        status: 200,
        message: 'OK'
    }
};


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

    return (password === password.match(regPass)[ 0 ]);
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

    if (validationStatus.statusCode !== statueses.ok.s) {
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
                return res.status(statueses.conflict.status).json({ statusMessage: statueses.conflict.messageSecond });
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
                    return res.status(statueses.ok.status).json({ statusMessage: statueses.ok.message });
                });
            });
        });
    });
});

router.post('/login', (req, res) => {
    if (Object.keys(req.body).length === 0) {
        return res.status(400).send('Bad request: Body is empty');
    }
    jsonfile.readFile(logPassPath, (err, logPassId) => {
        if (err) {
            return res.status(statuses.serverError.status).json({ statusMessage: statuses.serverError.message });
        }
        if (!logPassId.hasOwnProperty(req.body.login) || logPassId[ req.body.login ].password !== (new Buffer(req.body.password)).toString('base64')) {
            return res.status(400).send('Bad request: Enter valid login or password');
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
                    res.writeHead(200, { token });
                    res.write('OK');
                    res.end();
                    return res.send();
                });
            });
        });
    });
});

router.get('/logOut', (req, res) => {
    if (authorization(req) === 'Server error') {
        return res.status(statuses.serverError.status).json({ statusMessage: statuses.serverError.message });
    }
    if (authorization(req) === 'Id is missing') {
        return res.status(400).send('Bad request: UserId is missing');
    }
    if (authorization(req) === 'Token Id pair do not match') {
        return res.status(400).send('Bad request: Token Id pair do not match');
    }
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
            return res.status(200).send('OK');
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
            res.writeHead(200, { token });
            const uInfo = JSON.stringify(userInfo);

            res.write(uInfo);
            res.end();
            return res.send();
        });
    });
});

module.exports = router;
