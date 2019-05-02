const express = require('express');
const uniqid = require('uniqid');
const jsonfile = require('jsonfile');

const crypto = require('crypto');
const keyHash = require('../data/keyHash.js');

const router = express.Router();

const filePath = './data/users.json';
const logPassPath = './data/logPassId.json';
const tokenIdPath = './data/tokenId.json';

const ok = 200;
const badRequest = 400;
const unauthorized = 401;
const notFound = 404;
const conflict = 409;
const update = 412;
const serverError = 500;

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
            statusCode: badRequest,
            statusMessage: { statusMessage: 'Body is empty' }
        };
    }
    if (!validateName(req.body.firstName) || !validateName(req.body.lastName)) {
        return {
            statusCode: badRequest,
            statusMessage: { statusMessage: 'Invalid firstName or lastName' }
        };
    }
    if (!validateGender(req.body.gender)) {
        return {
            statusCode: badRequest,
            statusMessage: { statusMessage: 'Invalid gender' }
        };
    }
    if (!validateEmail(req.body.email)) {
        return {
            statusCode: badRequest,
            statusMessage: { statusMessage: 'Enter valid email' }
        };
    }
    if (!validateLogin(req.body.login) && !validateEmail(req.body.login)) {
        return {
            statusCode: badRequest,
            statusMessage: { statusMessage: 'Enter valid login' }
        };
    }
    if (!validatePassword(req.body.password)) {
        return {
            statusCode: badRequest,
            statusMessage: { statusMessage: 'Enter valid password' }
        };
    }
    return {
        statusCode: ok,
        statusMessage: { statusMessage: 'OK' }
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
        const jsonObj = JSON.parse(str);

        return jsonObj;
    } catch (e) {
        return undefined;
    }
};

const validateToken = function(token) {
    if (token === undefined) {
        return res.status(unauthorized).json({ statusMessage: 'Unauthorized' });
    }
    const decodedStr = (Buffer.from(token.substring(7), 'base64').toString('ascii'));
    const tokenJsonObj = jsonString(decodedStr);
    
    if (tokenJsonObj === undefined) {
        return { statusCode: unauthorized, statusMessage: { statusMessage: 'Unauthorized' } };
    }
    const date = new Date();
    const htoken = tokenJsonObj.hash;
    const hinfo = hash(JSON.stringify(tokenJsonObj.info), keyHash.hashKey);

    if (htoken !== hinfo) {
        return { statusCode: unauthorized, statusMessage: { statusMessage: 'Unauthorized' } };
    }
    if (tokenJsonObj.info.limitation < date.getTime()) {
        return { statusCode: update, statusMessage: { statusMessage: 'Token needs to be updated' } };
    }
    return { statusCode: ok, id: tokenJsonObj.info.id };
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

    if (validationStatus.statusCode !== ok) {
        return res.status(validationStatus.statusCode).json(validationStatus.statusMessage);
    }
    jsonfile.readFile(filePath, (err, info) => {
        if (err) {
            return res.status(serverError).json({ statusMessage: 'Server error' });
        }
        if (!existingEmail(info, req.body.email)) {
            return res.status(conflict).json({ statusMessage: 'Email already busy' });
        }
        jsonfile.readFile(logPassPath, (err, logPass) => {
            if (err) {
                return res.status(serverError).json({ statusMessage: 'Server error' });
            }
            if (!existingLogin(req.body.login, logPass)) {
                return res.status(conflict).json({ statusMessage: 'Login already busy' });
            }
            const id = uniqid();

            info[ id ] = userInfo(req, id);
            
            const logPassObj = {};
            
            const codePass = (Buffer.from(req.body.password)).toString('base64');

            logPassObj.password = codePass;
            logPassObj.userId = id;

            jsonfile.writeFile(filePath, info, { spaces: 2, EOL: '\r\n' }, (err) => {
                if (err) {
                    return res.status(serverError).json({ statusMessage: 'Server error' });
                }

                logPass[ req.body.login ] = logPassObj;
                jsonfile.writeFile(logPassPath, logPass, { spaces: 2, EOL: '\r\n' }, (err) => {
                    if (err) {
                        return res.status(serverError).json({ statusMessage: 'Server error' });
                    }
                    return res.status(ok).json({ statusMessage: 'OK' });
                });
            });
        });
    });
});

router.post('/login', (req, res) => {
    if (Object.keys(req.body).length === 0) {
        return res.status(badRequest).json({ statusMessage: 'Body is empty' });
    }
    jsonfile.readFile(logPassPath, (err, logPass) => {
        if (err) {
            return res.status(serverError).json({ statusMessage: 'Server error' });
        }
        if (!logPass.hasOwnProperty(req.body.login) || logPass[ req.body.login ].password !== (Buffer.from(req.body.password)).toString('base64')) {
            return res.status(badRequest).json({ statusMessage: 'Enter valid login and password' });
        }

        const id = logPass[ req.body.login ].userId;
        const token = getToken(id);

        jsonfile.readFile(tokenIdPath, (err, tokenId) => {
            if (err) {
                return res.status(serverError).json({ statusMessage: 'Server error' });
            }
            let userid = {};
            userid.id = id;
            tokenId[ token ] = userid;
            jsonfile.writeFile(tokenIdPath, tokenId, { spaces: 2, EOL: '\r\n' }, (err) => {
                if (err) {
                    return res.status(serverError).json({ statusMessage: 'Server error' });
                }
                jsonfile.writeFile(logPassPath, logPass, { spaces: 2, EOL: '\r\n' }, (err) => {
                    if (err) {
                        return res.status(serverError).json({ statusMessage: 'Server error' });
                    }
                    res.getHeader('token', token);
                    return res.json({ statusMessage: 'OK' });
                });
            });
        });
    });
});

router.get('/logOut', (req, res) => {
    const token = req.headers.authorization;
    const tokenValidation = validateToken(token);

    if (tokenValidation.statusCode !== ok) {
        return res.status(tokenValidation.statusCode).json(tokenValidation.statusMessage);
    }

    jsonfile.readFile(tokenIdPath, (err, tokenId) => {
        if (err) {
            return res.status(serverError).json({ statusMessage: 'Server error' });
        }
        delete (tokenId[ token.substring(7) ]);
        jsonfile.writeFile(tokenIdPath, tokenId, { spaces: 2, EOL: '\r\n' }, (err) => {
            if (err) {
                return res.status(serverError).json({ statusMessage: 'Server error' });
            }
            return res.status(ok).json({ statusMessage: 'OK' });
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

    if (tokenValidation.statusCode !== ok) {
        return res.status(tokenValidation.statusCode).json(tokenValidation.statusMessage);
    }

    jsonfile.readFile(filePath, (err, info) => {
        if (err) {
            return res.status(serverError).json({ statusMessage: 'Server error' });
        }

        const data = info[ id ];

        jsonfile.writeFile(filePath, info, { spaces: 2, EOL: '\r\n' }, (err) => {
            if (err) {
                return res.status(serverError).json({ statusMessage: 'Server error' });
            }
            if (!data) {
                return res.status(notFound).json({ statusMessage: 'User not found' });
            }
            return res.status(ok).json(data);
        });
    });
});

router.get('/checkingToken', (req, res) => {
    const token = req.headers.authorization;
    const tokenValidation = validateToken(token);
    if(tokenValidation === ok) {
        return res.status(tokenValidation.statusCode).json('Token does not need to be updated');
    }
    if(tokenValidation !== ok && tokenValidation !== update) {
        return res.status(tokenValidation.statusCode).json(tokenValidation.statusMessage);
    }
    const checkingToken = crypto.randomBytes(15).toString('hex');
    jsonfile.readFile(tokenIdPath, (err, tokenId) => {
        if (err) {
            return res.status(serverError).json({ statusMessage: 'Server error' });
        }
        let token = tokenId[ req.headers.authorization.substring(7) ];
        token[ 'checkingToken' ] = checkingToken;
        tokenId[ req.headers.authorization.substring(7) ] = token;
        jsonfile.writeFile(tokenIdPath, tokenId, { spaces: 2, EOL: '\r\n' }, function(err) {
            if (err) {
                return res.status(serverError).json({ statusMessage: 'Server error' });
            }
            res.setHeader('checkingtoken', checkingToken);
            return res.status(ok).json({ statusMessage: 'OK' });
        });
    });
});

router.get('/updatedToken', (req, res) => {
    const token = req.headers.authorization;
    const tokenValidation = validateToken(token);
    if(tokenValidation === ok) {
        return res.status(tokenValidation.statusCode).json('Token does not need to be updated');
    }
    if(tokenValidation !== ok && tokenValidation !== update) {
        return res.status(tokenValidation.statusCode).json(tokenValidation.statusMessage);
    }
    const checkingToken = req.headers.checking;
    if(checkingToken === undefined) {
        return res.status().json({});
    }
    jsonfile.readFile(tokenIdPath, (err, tokenId) => {
        if (err) {
            return res.status(servererror).json({ statusMessage: 'Server error' });
        }
        let tokenObj = tokenId[ req.headers.authorization.substring(7) ];
        if (tokenObj[ 'checkingToken' ] !== checkingToken) {
            return res.status(unauthorized).json({ statusMessage: 'Unauthorized' });
        }
        const userId = tokenObj.userId;
        const newToken = getToken(userId);
        const newTokenObj = {};
        
        delete(tokenId[ req.headers.authorization.substring(7) ]);
        newTokenObj['userId'] = userId;
        tokenId[ newToken ] = newTokenObj;
        jsonfile.writeFile(tokenIdPath, tokenId, { spaces: 2, EOL: '\r\n' }, function(err) {
            if (err) {
                return res.status(serverError).json({ statusMessage: 'Server error' });
            }
            res.setHeader('updatedToken', newToken);
            return res.status(ok).json({ statusMessage: 'OK' });
        });
    });
});

module.exports = router;
