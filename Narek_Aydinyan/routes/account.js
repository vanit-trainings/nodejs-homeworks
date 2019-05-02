const express = require('express');
const uniqid = require('uniqid');
const jsonfile = require('jsonfile');

const router = express.Router();
const crypto = require('crypto');
const Key = require('../data/.key.js');

const userInfoPath = './data/users.json';
const logPassPath = './data/logPassId.json';
const tokenIdPath = './data/tokenId.json';

const allok = 200;
const badrequest = 400;
const unauthorized = 401;
const notfound = 404;
const conflict = 409;
const updaterequired = 426;
const servererror = 500;

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
        const jsObj = JSON.parse(str);

        return jsObj;
    } catch (e) {
        return undefined;
    }
};

const validateToken = function(userToken) {
    if (userToken === undefined) {
        return res.status(unauthorized).json({ statusMessage: 'Unauthorized' }); 
    }
    const decodeStr = (Buffer.from(userToken.substring(7), 'base64').toString('ascii'));
    const tokenObj = ToJsonString(decodeStr);

    if (tokenObj === undefined) {
        return { statusCode: unauthorized, statusMessage: { statusMessage: 'Unauthorized' } };
    }
    const hash = tokenObj.sha512;
    const infoHash = sha512(JSON.stringify(tokenObj.info), Key.token);
    const date = new Date();

    if (hash !== infoHash || tokenObj.info.iss !== 'accountRouter') {
        return { statusCode: unauthorized, statusMessage: { statusMessage: 'Unauthorized' } };
    }
    if (tokenObj.info.expiresOn < date.getTime()) {
        return { statusCode: updaterequired, statusMessage: { statusMessage: 'Token update required' } };
    }
    return { statusCode: allok, userId: tokenObj.info.userId };
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

const isSignIn = function(id, data){
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
}

const validateRegistrReq = function(req) {
    if (Object.keys(req.body).length === 0) {
        return { statusCode: badrequest, statusMessage: { statusMessage: 'Body is Empty' } };
    }
    if (!validateLogin(req.body.login) && !validateEmail(req.body.login)) {
        return { statusCode: badrequest, statusMessage: { statusMessage: 'Enter valid login' } };
    }
    if (!validatePassword(req.body.password)) {
        return { statusCode: badrequest, statusMessage: { statusMessage: 'Enter valid password' } };
    }
    if (!validateName(req.body.firstName)) {
        return { statusCode: badrequest, statusMessage: { statusMessage: 'Enter valid firstName' } };
    }
    if (!validateName(req.body.lastName)) {
        return { statusCode: badrequest, statusMessage: { statusMessage: 'Enter valid lastName' } };
    }
    if (!validateEmail(req.body.email)) {
        return { statusCode: badrequest, statusMessage: { statusMessage: 'Enter valid email' } };
    }
    return { statusCode: allok };
};

router.post('/register', function(req, res) {
    const Status = validateRegistrReq(req);

    if (Status.statusCode !== allok) {
        return res.status(Status.statusCode).json(Status.statusMessage);
    }
    jsonfile.readFile(userInfoPath, function(err, userInfoDb) {
        if (err) {
            return res.status(servererror).json({ statusMessage: 'Server error' });
        }
        if (!existingEmail(req.body.email, userInfoDb)) {
            return res.status(conflict).json({ statusMessage: 'Email already busy' });
        }
        jsonfile.readFile(logPassPath, function(err, logPassDb) {
            if (err) {
                return res.status(servererror).json({ statusMessage: 'Server error' });
            }
            if (!existingLogin(req.body.login, logPassDb)) {
                return res.status(conflict).json({ statusMessage: 'Login already busy' });
            }
            const id = uniqid();

            userInfoDb[ id ] = getUserInfoObj(req.body, id);
            jsonfile.writeFile(userInfoPath, userInfoDb, { spaces: 2, EOL: '\r\n' }, function(err) {
                if (err) {
                    return res.status(servererror).json({ statusMessage: 'Server error' });
                }   
                const logPass = {};

                logPass.password = (sha512(req.body.password, Key.pass));
                logPass.userId = id;
                logPassDb[ req.body.login ] = logPass;
                jsonfile.writeFile(logPassPath, logPassDb, { spaces: 2, EOL: '\r\n' }, function(err) {
                    if (err) {
                        return res.status(servererror).json({ statusMessage: 'Server error' });
                    }
                    return res.status(allok).json({ statusMessage: 'OK' });
                });
            });
        });
    });
});

router.post('/login', function (req, res) {
    if (Object.keys(req.body).length === 0) {
        return res.status(badrequest).json({ statusMessage: 'Body is empty' });
    }
    jsonfile.readFile(logPassPath, function(err, logPassDb) {
        if (err) {
            return res.status(servererror).json({ statusMessage: 'Server error' });
        }
        if (!logPassDb.hasOwnProperty(req.body.login) || logPassDb[ req.body.login ].password !== (sha512(req.body.password, Key.pass))) {
            return res.status(badrequest).json({ statusMessage: 'Enter valid login and password' });
        }
        const id = logPassDb[ req.body.login ].userId;
        const token = getBearerToken(id);

        jsonfile.readFile(tokenIdPath, function(err, tokenIdDb) {
            if (err) {
                return res.status(servererror).json({ statusMessage: 'Server error' });
            }
            jsonfile.writeFile(logPassPath, logPassDb, { spaces: 2, EOL: '\r\n' }, function(err) {
                if (err) {
                    return res.status(servererror).json({ statusMessage: 'Server error' });
                }
                const signInStatus = isSignIn(id, tokenIdDb);
    
                if (signInStatus) {
                    const tokObj = {};
                    tokObj.userId = id;
                    tokenIdDb[ token ] = tokObj;
                }
                jsonfile.writeFile(tokenIdPath, tokenIdDb, { spaces: 2, EOL: '\r\n' }, function(err) {
                    if (err) {
                        return res.status(servererror).json({ statusMessage: 'Server error' });
                    }
                    if (signInStatus) {
                        res.setHeader('bearerToken', token);
                        return res.status(allok).json({ 'statusMessage': 'OK' });
                    }
                    return res.status(conflict).json({ 'statusMessage': 'You are already logged in' });
                });
            });
        });
    });
});

router.get('/logout', function(req, res) {
    //const token = req.headers.authorization;
    const tokenValid = validateToken(req.headers.authorization);

    if (tokenValid.statusCode !== allok) {
        return res.status(tokenValid.statusCode).json(tokenValid.statusMessage);
    }
    jsonfile.readFile(tokenIdPath, function(err, tokenIdDb) {
        if (err) {
            return res.status(servererror).json({ statusMessage: 'Server error' });
        }
        delete (tokenIdDb[ token.substring(7) ]);
    
        jsonfile.writeFile(tokenIdPath, tokenIdDb, { spaces: 2, EOL: '\r\n' }, function(err) {
            if (err) {
                return res.status(servererror).json({ statusMessage: 'Server error' });
            }
            return res.status(allok).json({ statusMessage: 'OK' });
        });
    });
});

router.get('/userinfo', function(req, res) {
    const tokenValid = validateToken(req.headers.authorization);

    if (tokenValid.statusCode !== allok) {
        return res.status(tokenValid.statusCode).json(tokenValid.statusMessage);
    }
    jsonfile.readFile(userInfoPath, function(err, userInfoDb) {
        if (err) {
            return res.status(servererror).json({ statusMessage: 'Server error' });
        }
        let id = req.query.userId;

        if (!id) {
            id = tokenValid.userId;
        }
        const info = userInfoDb[ id ];
        
        if (!info) {
            return res.status(notfound).json({ statusMessage: 'User not found' });
        }
        jsonfile.writeFile(userInfoPath, userInfoDb, { spaces: 2, EOL: '\r\n' }, function(err) {
            if (err) {
                return res.status(servererror).json({ statusMessage: 'Server error' });
            }
            return res.status(allok).json(info);
        });
    });
});

router.get('/basictoken', function(req, res) {
    const tokenValid = validateToken(req.headers.authorization);

    if (tokenValid.statusCode !== allok && tokenValid.statusCode !== updaterequired) {
        console.log("if1");
        return res.status(tokenValid.statusCode).json(tokenValid.statusMessage);
    }
    if (tokenValid.statusCode === allok) {
        console.log("if2");
        return res.status(tokenValid.statusCode).json({ statusMessage: 'Your token doesnt need to be refreshed' });
    }
    const basicToken = crypto.randomBytes(15).toString('hex');

    jsonfile.readFile(tokenIdPath, function(err, tokenIdDb) {
        if (err) {
            return res.status(servererror).json({ statusMessage: 'Server error' });
        }
        let tokenObj = tokenIdDb[ req.headers.authorization.substring(7) ];
        tokenObj[ 'basicToken' ] = basicToken;
        tokenIdDb[ req.headers.authorization.substring(7) ] = tokenObj;
        jsonfile.writeFile(tokenIdPath, tokenIdDb, { spaces: 2, EOL: '\r\n' }, function(err) {
            if (err) {
                return res.status(servererror).json({ statusMessage: 'Server error' });
            }
            res.setHeader('basictoken', basicToken);
            return res.status(allok).json({ statusMessage: 'OK' });
        });
    });
});

router.get('/refreshtoken', function(req, res) {
    const tokenValid = validateToken(req.headers.authorization);
    const basicToken = req.headers.basic;

    if (tokenValid.statusCode !== allok && tokenValid.statusCode !== updaterequired) {
        return res.status(tokenValid.statusCode).json(tokenValid.statusMessage);
    }
    if (tokenValid.statusCode === allok) {
        return res.status(tokenValid.statusCode).json({ statusMessage: 'Your token doesnt need to be refreshed' });
    }
    if (basicToken === undefined) {
        return res.status(unauthorized).json({ statusMessage: 'Unauthorized' });
    }
    jsonfile.readFile(tokenIdPath, function(err, tokenIdDb) {
        if (err) {
            return res.status(servererror).json({ statusMessage: 'Server error' });
        }
        let tokenObj = tokenIdDb[ req.headers.authorization.substring(7) ];
        if (tokenObj[ 'basicToken' ] !== basicToken) {
            return res.status(unauthorized).json({ statusMessage: 'Unauthorized' });
        }
        const bearerToken = getBearerToken(tokenObj.userId);
        const newTokenObj = {};
        
        newTokenObj['userId'] = tokenObj.userId;
        delete(tokenIdDb[ req.headers.authorization.substring(7) ]);
        tokenIdDb[ bearerToken ] = newTokenObj;
        jsonfile.writeFile(tokenIdPath, tokenIdDb, { spaces: 2, EOL: '\r\n' }, function(err) {
            if (err) {
                return res.status(servererror).json({ statusMessage: 'Server error' });
            }
            res.setHeader('refreshtoken', bearerToken);
            return res.status(allok).json({ statusMessage: 'OK' });
        });
    });
});

module.exports = router;
