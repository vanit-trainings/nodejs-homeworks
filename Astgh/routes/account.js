const express = require('express');
const uniqid = require('uniqid');
const jsonfile = require('jsonfile');

const crypto = require('crypto');
const keyHash = require('../data/keyHash.js');
const statuses = require('../data/const.js');
const baseMod = new (require('../modules/baseModel'))();

const router = express.Router();

const filePath = './data/users.json';
const logPassPath = './data/logPassId.json';
const tokenIdPath = './data/tokenId.json';

const validateLogin = function(login) {
    const regLog = new RegExp(/^((\w+)(\.|_)?){5,16}/);

    if (login.match(regLog)[ 0 ] !== null) {
        return (login === login.match(regLog)[ 0 ]);
    }
    return false;
};

const existingLogin = function(login, obj) {
    if (obj[ login ] !== undefined) {
        return false;
    }
    return true;
};

const validateEmail = function(email) {
    const regEmail = new RegExp(/[a-zA-z0-9]+[._]?[a-zA-Z0-9]+[._]?[a-zA-z0-9]@[a-zA-z]+[.][a-zA-Z]{1,}/);

    if (email.match(regEmail) !== null) {
        return email === email.match(regEmail)[ 0 ];
    }
    return false;
};

const existingEmail = function(obj, email) {
    for (const key in obj) {
        if (obj[ key ].email === email) {
            return false;
        }
    }
    return true;
};

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
};

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
    const validationStatus = validations(req);

    if (validationStatus.statusCode !== statuses.ok.code) {
        return res.status(validationStatus.statusCode).json(validationStatus.statusMessage);
    }
    jsonfile.readFile(filePath, (err, info) => {
        if (err) {
            return res.status(statuses.serverError.code).json(statuses.serverError.message);
        }
        if (!existingEmail(info, req.body.email)) {
            return res.status(statuses.conflict.code).json(statuses.conflict.email);
        }
        jsonfile.readFile(logPassPath, (err, logPass) => {
            if (err) {
                return res.status(statuses.serverError.code).json(statuses.serverError.message);
            }
            if (!existingLogin(req.body.login, logPass)) {
                return res.status(statuses.conflict.code).json(statuses.conflict.login);
            }
            const id = uniqid();

            info[ id ] = userInfo(req, id);
            
            jsonfile.writeFile(filePath, info, { spaces: 2, EOL: '\r\n' }, (err) => {
                if (err) {
                    return res.status(statuses.serverError.code).json(statuses.serverError.message);
                }
                const logPassObj = {};

                logPassObj.password = (Buffer.from(req.body.password)).toString('base64');
                logPassObj.userId = id;

                logPass[ req.body.login ] = logPassObj;
                jsonfile.writeFile(logPassPath, logPass, { spaces: 2, EOL: '\r\n' }, (err) => {
                    if (err) {
                        return res.status(statuses.serverError.code).json(statuses.serverError.message);
                    }
                    return res.status(statuses.ok.code).json(statuses.ok.message);
                });
            });
        });
    });
});

router.post('/login', (req, res) => {
    if (Object.keys(req.body).length === 0) {
        return res.status(statuses.badRequest.code).json(statuses.badRequest.body);
    }
    jsonfile.readFile(logPassPath, (err, logPass) => {
        if (err) {
            return res.status(statuses.serverError.code).json(statuses.serverError.message);
        }
        if (!logPass.hasOwnProperty(req.body.login) || logPass[ req.body.login ].password !== (Buffer.from(req.body.password)).toString('base64')) {
            return res.status(statuses.badRequest.code).json(statuses.badRequest.logPass);
        }

        const id = logPass[ req.body.login ].userId;
        const token = getToken(id);
        const refresh = crypto.randomBytes(15).toString('hex');

        jsonfile.readFile(tokenIdPath, (err, tokenId) => {
            if (err) {
                return res.status(statuses.serverError.code).json(statuses.serverError.message);
            }
            const idToken = {};

            idToken.userId = id;
	    idToken.checkingToken = refresh;
            tokenId[ token ] = idToken;
            jsonfile.writeFile(tokenIdPath, tokenId, { spaces: 2, EOL: '\r\n' }, (err) => {
                if (err) {
                    return res.status(statuses.serverError.code).json(statuses.serverError.message);
                }
                return res.status(statuses.ok.code).json({ token, refreshToken: refresh });
            });
        });
    });
});

router.get('/logOut', (req, resv) => {
    const token = req.headers.authorization;
    const tokenValidation = validateToken(token);

    if (tokenValidation.statusCode !== statuses.ok.code) {
        return res.status(tokenValidation.statusCode).json(tokenValidation.statusMessage);
    }

    jsonfile.readFile(tokenIdPath, (err, tokenId) => {
        if (err) {
            return res.status(statuses.serverError.code).json(statuses.serverError.message);
        }
        delete (tokenId[ token.substring(7) ]);
        jsonfile.writeFile(tokenIdPath, tokenId, { spaces: 2, EOL: '\r\n' }, (err) => {
            if (err) {
                return res.status(statuses.serverError.code).json(statuses.serverError.message);
            }
            return res.status(statuses.ok.code).json(statuses.ok.message);
        });
    });
});

router.get('/userinfo', (req, res) => {
    const uId = req.query.userId;

    let id = req.query.clientId;
    const token = req.headers.authorization;

    if (id === undefined) {
        id = uId;
    }

    const tokenValidation = validateToken(token);

    if (tokenValidation.statusCode !== statuses.ok.code) {
        return res.status(tokenValidation.statusCode).json(tokenValidation.statusMessage);
    }

    jsonfile.readFile(filePath, (err, info) => {
        if (err) {
            return res.status(statuses.serverError.code).json(statuses.serverError.message);
        }

        const data = info[ id ];

        if (!data) {
            return res.status(statuses.notFound.code).json(statuses.notFound.message);
        }
        return res.status(statuses.ok.code).json(data);
    });
});

router.get('/updatedToken', (req, res) => {
    const token = req.headers.authorization;
    const tokenValidation = validateToken(token);

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

    jsonfile.readFile(tokenIdPath, (err, tokenId) => {
        if (err) {
            return res.status(statuses.serverError.code).json(statuses.serverError.message);
        }
        const tokenObj = tokenId[ (req.headers.authorization).substring(7) ];
        if (tokenObj[ 'checkingToken' ] !== checkingToken) {
            return res.status(statuses.unauthorized.code).json(statuses.unauthorized.message);
        }
        const uid = tokenObj[ 'userId' ];
        const newCheckingToken = crypto.randomBytes(15).toString('hex');
        const newTokenObj = {};
    
        delete (tokenId[ req.headers.authorization.substring(7) ]);
        newTokenObj.userId = uid;
        newTokenObj.checkingToken = newCheckingToken;
        tokenId[ token ] = newTokenObj;
        jsonfile.writeFile(tokenIdPath, tokenId, { spaces: 2, EOL: '\r\n' }, (err) => {
            if (err) {
                return res.status(statuses.serverError.code).json(statuses.serverError.message);
            }
            return res.status(statuses.ok.code).json({token: newCheckingToken});
        });
    });
});

module.exports = router;
