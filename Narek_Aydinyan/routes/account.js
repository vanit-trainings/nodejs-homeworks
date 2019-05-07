const express = require('express');
const uniqid = require('uniqid');

const router = express.Router();
const crypto = require('crypto');
const Key = require('../data/.key.js');
const statusCodes = require('../modules/constants.js');
const baseModel = new (require('../modules/base'))();

const userInfoPath = './data/users.json';
const logPassPath = './data/logPassId.json';
const tokenIdPath = './data/tokenId.json';

const sha512 = function(str, key) {
    const hash = crypto.createHmac('sha512', Buffer.from(key));

    hash.update(str);
    const value = hash.digest('hex');

    return value;
};

const getBearerToken = function(userId) {
    const date = new Date();
    const BearerToken = {};
    const tokenInfo = {};

    tokenInfo.userId = userId;
    tokenInfo.iss = 'accountRouter';
    tokenInfo.expiresOn = Number(date.getTime()) + (2 * 60 * 60 * 1000);
    BearerToken.info = tokenInfo;
    const tokenStr = sha512(JSON.stringify(tokenInfo), Key.token);

    BearerToken.sha512 = tokenStr;
    return (Buffer.from(JSON.stringify(BearerToken))).toString('base64');
};

const ToJsonString = function(str) {
    try {
        return JSON.parse(str);
    } catch (e) {
        return ;
    }
};

const validateToken = function(userToken) {
    if (userToken === undefined) {
        return { statusCode: statusCodes.unauthorized.code, statusMessage: statusCodes.unauthorized.message }; 
    }
    if ((!userToken.match('Bearer')) || userToken.match('Bearer').index !== 0) {
        return { statusCode: statusCodes.unauthorized.code, statusMessage: statusCodes.unauthorized.message };
    }
    const decodeStr = (Buffer.from(userToken.substring(7), 'base64').toString('ascii'));
    const tokenObj = ToJsonString(decodeStr);
    
    if (tokenObj === undefined) {
        return { statusCode: statusCodes.unauthorized.code, statusMessage: statusCodes.unauthorized.message };
    }
    const hash = tokenObj.sha512;
    const infoHash = sha512(JSON.stringify(tokenObj.info), Key.token);
    const date = new Date();

    if (hash !== infoHash || tokenObj.info.iss !== 'accountRouter') {
        return { statusCode: statusCodes.unauthorized.code, statusMessage: statusCodes.unauthorized.message };
    }
    if (tokenObj.info.expiresOn < date.getTime()) {
        return { statusCode: statusCodes.updateRequired.code, statusMessage: statusCodes.updateRequired.message };
    }
    return { statusCode: statusCodes.ok.code, userId: tokenObj.info.userId };
};

const validateLogin = function(login) {
    const regLog = new RegExp(/^((\w+)(\.|_)?){5,16}/);

    if (login.match(regLog) !== null) {
        return (login === login.match(regLog)[ 0 ]);
    }
    return false;
};

const existingLogin = function(login, data) {
    if (data[ login ] !== undefined) {
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

const existingEmail = function(email, data) {
    for (const key in data) {
        if (data[ key ].email === email) {
            return false;
        }
    }
    return true;
};

const validatePassword = function(password) {
    const regPass = new RegExp(/(\w+){6,16}/);

    return (password === password.match(regPass)[ 0 ]);
};

const validateName = function(name) {
    const regName = new RegExp(/^[A-Za-z]+/);

    if (name.match(regName) !== null) {
        return (name === name.match(regName)[ 0 ]);
    }
    return false;
};

const getUserInfoObj = function(info, id) {
    const data = {};

    data.firstName = info.firstName;
    data.lastName = info.lastName;
    data.email = info.email;
    data.login = info.login;
    data.gender = info.gender;
    data.birthDate = info.birthDate;
    data.userId = id;
    return data;
};

const isSignIn = function(id, data) {
    let count = 0;

    for (const key in data) {
        if (data[ key ].userId === id) {
            count++;
        }
    }
    if (count >= 3) {
        return false;
    }
    return true;
};

const validateRegistrReq = function(req) {
    if (Object.keys(req.body).length === 0) {
        return { statusCode: statusCodes.badRequest.code, statusMessage: statusCodes.badRequest.body };
    }
    if (!validateLogin(req.body.login) && !validateEmail(req.body.login)) {
        return { statusCode: statusCodes.badRequest.code, statusMessage: statusCodes.badRequest.login };
    }
    if (!validatePassword(req.body.password)) {
        return { statusCode: statusCodes.badRequest.code, statusMessage: statusCodes.badRequest.password };
    }
    if (!validateName(req.body.firstName)) {
        return { statusCode: statusCodes.badRequest.code, statusMessage: statusCodes.badRequest.firstName };
    }
    if (!validateName(req.body.lastName)) {
        return { statusCode: statusCodes.badRequest.code, statusMessage: statusCodes.badRequest.lastName };
    }
    if (!validateEmail(req.body.email)) {
        return { statusCode: statusCodes.badRequest.code, statusMessage: statusCodes.badRequest.email };
    }
    return { statusCode: statusCodes.ok.code };
};

router.post('/register', (req, res) => {
    const status = validateRegistrReq(req);

    if (status.statusCode !== statusCodes.ok.code) {
        return res.status(status.statusCode).json(status.statusMessage);
    }
 
    baseModel.readAll(userInfoPath)
        .then((userInfoDb) => {
            if (!existingEmail(req.body.email, userInfoDb)) {
                throw { statusCode: 409, statusMessage: statusCodes.conflict.email };
            } else { 
                return baseModel.readAll(logPassPath);
            }
        })
        .then((logPassDb) => {
            if (!existingLogin(req.body.login, logPassDb)) {
                throw { statusCode: 409, statusMessage: statusCodes.conflict.login };
            } else {
                const id = uniqid();
                const userInfo = getUserInfoObj(req.body, id);
        
                baseModel.addItem(userInfoPath, userInfo.userId, userInfo);
                return userInfo.userId;
            }
        })
        .then((id) => {
            const logPass = {};

            logPass.password = (sha512(req.body.password, Key.pass));
            logPass.userId = id;
            baseModel.addItem(logPassPath, req.body.login, logPass);
        })
        .then(() => res.status(statusCodes.ok.code).json(statusCodes.ok.message))
        .catch((err) => {
            if (err.statusCode === statusCodes.conflict.code) {
                return res.status(err.statusCode).json(err.statusMessage);
            }
            return res.status(statusCodes.serverError.code).json(statusCodes.serverError.message);
        });
});

router.post('/login', (req, res) => {
    if (Object.keys(req.body).length === 0) {
        return res.status(statusCodes.badRequest.code).json(statusCodes.badRequest.body);
    }
 
    baseModel.readAll(logPassPath)
        .then((logPassDb) => {
            if (!logPassDb.hasOwnProperty(req.body.login) || logPassDb[ req.body.login ].password !== (sha512(req.body.password, Key.pass))) {
                throw { statusCode: statusCodes.badRequest.code, statusMessage: statusCodes.badRequest.logPass };
            } else {
                const id = logPassDb[ req.body.login ].userId;
                const tokenIdDb = baseModel.readAll(tokenIdPath);
            
                return { id: id, tokenIdDb: tokenIdDb };
            }
        })
        .then((info) => {
            const signInStatus = isSignIn(info.id, info.tokenIdDb);
            
            if (!signInStatus) {
                throw { statusCode: statusCodes.conflict.code, statusMessage: statusCodes.conflict.allreadyLogin };
            } else {
                const token = getBearerToken(info.id);
                const refreshT = crypto.randomBytes(15).toString('hex');
                const tokObj = {};

                tokObj.userId = info.id;
                tokObj.refreshToken = refreshT;
                baseModel.addItem(tokenIdPath, token, tokObj);
                return { BearerToken: token, RefreshToken: refreshT };
            }
        })
        .then((messageInfo) => res.status(statusCodes.ok.code).json(messageInfo))
        .catch((err) => {
            if (err.statusCode === statusCodes.badRequest.code || err.statusCode === statusCodes.conflict.code) {
                return res.status(err.statusCode).json(err.statusMessage);
            }
            return res.status(statusCodes.serverError.code).json(statusCodes.serverError.message); 
        });
});

router.get('/logout', (req, res) => {
    const tokenValid = validateToken(req.headers.authorization);
    
    if (tokenValid.statusCode !== statusCodes.ok.code) {
        return res.status(tokenValid.statusCode).json(tokenValid.statusMessage);
    }
    baseModel.deleteItem(tokenIdPath, req.headers.authorization.substring(7))
        .then(() => res.status(statusCodes.ok.code).json(statusCodes.ok.message))
        .catch((err) => res.status(statusCodes.serverError.code).json(statusCodes.serverError.message));
});

router.get('/userinfo', (req, res) => {
    const tokenValid = validateToken(req.headers.authorization);

    if (tokenValid.statusCode !== statusCodes.ok.code) {
        return res.status(tokenValid.statusCode).json(tokenValid.statusMessage);
    }
    let id = req.query.userId;

    if (!id) {
        id = tokenValid.userId;
    }
    baseModel.readItem(userInfoPath, id)
        .then((info) => {
            if (info === null) {
                return res.status(statusCodes.notFound.code).json(statusCodes.notFound.message);
            }
            return res.status(statusCodes.ok.code).json(info);
        })
        .catch((err) => res.status(statusCodes.serverError.code).json(statusCodes.serverError.message));
});

router.get('/refreshtoken', (req, res) => {
    const tokenValid = validateToken(req.headers.authorization);
    const basicToken = req.headers.refreshtoken;

    if (tokenValid.statusCode !== statusCodes.ok.code && tokenValid.statusCode !== statusCodes.updateRequired.code) {
        return res.status(tokenValid.statusCode).json(tokenValid.statusMessage);
    }
    if (tokenValid.statusCode === statusCodes.ok.code) {
        return res.status(statusCodes.conflict.code).json(statusCodes.conflict.token);
    }
    if (basicToken === undefined) {
        return res.status(statusCodes.preconditionFailed.code).json(statusCodes.preconditionFailed.message);
    }

    baseModel.readItem(tokenIdPath, req.headers.authorization.substring(7))
        .then((tokenObj) => {
            if (!tokenObj || tokenObj.refreshToken !== basicToken) {
                throw { statusCode: statusCodes.unauthorized.code, statusMessage: statusCodes.unauthorized.message };
            } else {
                const id = tokenObj.userId;
                
                baseModel.deleteItem(tokenIdPath, req.headers.authorization.substring(7))
                .then(() => {
                    const bearerToken = getBearerToken(id);
                    const newRefTok = crypto.randomBytes(15).toString('hex');
                    const newTokenObj = {};
        
                    newTokenObj.userId = id;
                    newTokenObj.refreshToken = newRefTok;
                    baseModel.addItem(tokenIdPath, bearerToken, newTokenObj);
                    return res.status(statusCodes.ok.code).json({ BearerToken: bearerToken, RefreshToken: newRefTok });
                });
            }
        })
        .catch((err) => {
            if (err.statusCode) {
                return res.status(err.statusCode).json(err.statusMessage);
            }
            return res.status(statusCodes.serverError.code).json(statusCodes.serverError.message);
        });
});

module.exports = router;