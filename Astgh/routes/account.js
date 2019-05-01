const express = require('express');
const uniqid = require('uniqid');
const jsonfile = require('jsonfile');
const TokenGenerator = require('uuid-token-generator');

const router = express.Router();

const filePath = './data/users.json';
const logPassPath = './data/logPassId.json';
const tokenIdPath = './data/tokenId.json';

const ok = 200;
const badRequest = 400;
const unauthorized = 401;
const notFound = 404;
const conflict = 409;
const serverError = 500;

const validateLogin = function isvalidLogin(login) {
    const regLog = new RegExp(/^((\w+)(\.|_)?){5,16}/);

    if (login.match(regLog)[ 0 ] !== null) {
        return (login === login.match(regLog)[ 0 ]);
    }
    return false;
};

const existingLogin = function subsistingLogin(login, obj) {
    if (obj[ login ] !== undefined) {
        return false;
    }
    return true;
};

const validateEmail = function isvalidEmail(email) {
    const regEmail = new RegExp(/[a-zA-z0-9]+[._]?[a-zA-Z0-9]+[._]?[a-zA-z0-9]@[a-zA-z]+[.][a-zA-Z]{1,}/);

    if (email.match(regEmail) !== null) {
        return email === email.match(regEmail)[ 0 ];
    }
    return false;
};

const existingEmail = function subsistingEmail(obj, email) {
    for (const key in obj) {
        if (obj[ key ].email === email) {
            return false;
        }
    }
    return true;
};

const validatePassword = function isvalidPassword(password) {
    const regPass = new RegExp(/(\w+){6,16}/);
    if (password.match(regPass) !== null) {
        return (password === password.match(regPass)[ 0 ]);
    }
    return false;
};

const validateName = function isvalidName(name) {
    const regName = new RegExp(/^[A-Z]{1}[a-z]+/);
    console.log(name.match(regName));
    if (name.match(regName) !== null) {
        return (name === name.match(regName)[ 0 ]);
    }
    return false;
};

const validations = function validData(req) {
    if (Object.keys(req.body).length === 0) {
        return { statusCode: badRequest, 
                statusMessage: { statusMessage: 'Body is empty' } };
    }
    if (!validateName(req.body.firstName) || !validateName(req.body.lastName)) {
        return { statusCode: badRequest, 
                statusMessage:{ statusMessage: 'Invalid firstName or lastName' } };
    }
    if (!validateEmail(req.body.email)) {
        return { statusCode: badRequest, 
            statusMessage: { statusMessage: 'Enter valid email' } };
    }
    if (!validateLogin(req.body.login) && !validateEmail(req.body.login)) {
        return { statusCode: badRequest, 
            statusMessage: { statusMessage: 'Enter valid login' } };
    }
    if (!validatePassword(req.body.password)) {
        return { statusCode: badRequest, 
            statusMessage: { statusMessage: 'Enter valid password' } };
    }
    return { statusCode: ok, 
        statusMessage: { statusMessage: 'OK' } };;
};

const authorization = function authorize(req) {
    const token = req.headers['authorization'];

    let id;
    console.log(1)
    if (token === undefined) {
        return { statusCode: unauthorized, 
            statusMessage: { statusMessage: 'Unauthorized' } };
    }
    console.log(1)

    if (req.body && req.body.length !== 0) {
        id = req.body.userId;
    } else if (req.query.userId !== undefined) {
        id = req.query.userId;
    } else {req.query.userId
        return { statusCode: badRequest, 
            statusMessage: { statusMessage: 'Id is missing' } };
    }
    console.log(1)
    var x;
    jsonfile.readFile(tokenIdPath, (err, obj3) => {
        if (err) {
            x = undefined;
        }
        x = obj3
    });
    jsonfile.readFile(tokenIdPath, (err, obj3x) => {
        console.log("read");
        if (err) {
            return { statusCode: serverError, 
                statusMessage: { statusMessage: 'Server error' } };
        }
        console.log(1)
        const usId = obj3x[ token ];
        jsonfile.writeFile(tokenIdPath, obj3x, { spaces: 2, EOL: '\r\n' }, (err) => {
            if (err) {
                return { statusCode: serverError, 
                    statusMessage: { statusMessage: 'Server error' } };
            }
            console.log("ssss"+usId);
            if (usId !== id) {
                return { statusCode: unauthorized, 
                    statusMessage: { statusMessage: 'Unauthorized' } };
            }        
            return { statusCode: ok, 
                statusMessage: { statusMessage: 'OK' } };
        });
    });
    console.log('verj')
    return x;
};

router.post('/register', (req, res) => {
    const validStatus = validations(req);
    if (validStatus.statusCode !== ok) {
        return res.status(validStatus.statusCode).json(validStatus.statusMessage);
    }
    jsonfile.readFile(filePath, (err, obj) => {
        if (err) {
            return res.status(serverError).json({ statusMessage: 'Server error' });
        }
        if (!existingEmail(obj, req.body.email)) {
            return res.status(conflict).json({ statusMessage: 'Email already busy' });
        }
        jsonfile.readFile(logPassPath, (err, obj1) => {
            if (err) {
                return res.status(serverError).json({ statusMessage: 'Server error' });
            }
            if (!existingLogin(req.body.login, obj1)) {
                return res.status(conflict).json({ statusMessage: 'Login already busy' });
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
            obj[ id ] = data;

            const logPass = {};

            logPass.password = codePass;
            logPass.userId = id;

            jsonfile.writeFile(filePath, obj, { spaces: 2, EOL: '\r\n' }, (err) => {
                if (err) {
                    return res.status(serverError).json({ statusMessage: 'Server error'});
                }
				
                obj1[ req.body.login ] = logPass;
                jsonfile.writeFile(logPassPath, obj1, { spaces: 2, EOL: '\r\n' }, (err) => {
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
    jsonfile.readFile(logPassPath, (err, obj4) => {
        if (err) {
            return res.status(serverError).json({ statusMessage: 'Server error' });
        }
        if (!obj4.hasOwnProperty(req.body.login) || obj4[ req.body.login ].password !== (new Buffer(req.body.password)).toString('base64')) {
            return res.status(badRequest).json({ statusMessage: 'Enter valid login and password' });
        }
        
        const id = obj4[ req.body.login ].userId;
        const token = (new TokenGenerator(256, TokenGenerator.BASE62)).generate();

        jsonfile.readFile(tokenIdPath, (err, obj5) => {
            if (err) {
                return res.status(serverError).json({ statusMessage: 'Server error' });
            }
            obj5[ token ] = id;
            jsonfile.writeFile(tokenIdPath, obj5, { spaces: 2, EOL: '\r\n' }, (err) => {
                if (err) {
                    return res.status(serverError).json({ statusMessage: 'Server error' });
                }
                jsonfile.writeFile(logPassPath, obj4, { spaces: 2, EOL: '\r\n' }, (err) => {
                    if (err) {
                        return res.status(serverError).json({ statusMessage: 'Server error' });
                    }
                    console.log(token)
                    res.setHeader( 'token', token );
                    return res.json({ statusMessage: 'OK' });
                });
            });
        });
    });
});

router.get('/logOut', (req, res) => {
    //if (authorization(req) === 'Server error') {
    //    return res.status(serverError).send('Server error');
    //}
    //if (authorization(req) === 'Id is missing') {
    //    return res.status(badRequest).send('Bad request: UserId is missing');
    //}
    //if (authorization(req) === 'Token-Id pair not found') {
    //    return res.status(badRequest).send('Bad request: Token-Id pair not found');
    //}
    const authorized = authorization(req);
    if (authorized.statusCode !== ok) {
        return res.status(authorized.statusCode).json(authorized.statusMessage);
    }
    const token = req.headers['authorization'];

    jsonfile.readFile(tokenIdPath, (err, obj6) => {
        if (err) {
            return res.status(serverError).json({ statusMessage: 'Server error' });
        }
        delete (obj6[ token ]);
        jsonfile.writeFile(tokenIdPath, obj6, { spaces: 2, EOL: '\r\n' }, (err) => {
            if (err) {
                return res.status(serverError).json({ statusMessage: 'Server error' });
            }
            return res.status(ok).json({ statusMessage: 'OK' });
        });
    });
});

router.get('/userinfo', (req, res) => {
    const userId = req.query.userId;
    console.log(userId)
    let id = req.query.clientId;
    //const token = req.headers['authorization'];
    console.log(id);
    if (id === undefined) {
        id = userId;
    }
    console.log(id);
    jsonfile.readFile(filePath, (err, obj5) => {
        if (err) {
            return res.status(serverError).json({ statusMessage: 'Server error' });
        }

        const authorized = authorization(req);
    console.log(authorized);
    if (authorized.statusCode !== ok) {
        return res.status(authorized.statusCode).json(authorized.statusMessage);
    }
console.log("xxxxx")
        const userInfo = {};

        userInfo.id = obj5[ id ].userId;
        userInfo.firstName = obj5[ id ].firstName;
        userInfo.lastName = obj5[ id ].lastName;
        userInfo.birthDate = obj5[ id ].birthDate;
        userInfo.gender = obj5[ id ].gender;
        userInfo.email = obj5[ id ].email;
        jsonfile.writeFile(filePath, obj5, { spaces: 2, EOL: '\r\n' }, (err) => {
            if (err) {
                return res.status(serverError).json({ statusMessage: 'Server error' });
            }
            if (!userInfo) {
                return res.status(notFound).json({ statusMessage: 'User not found' });
            }
            return res.status(ok).json(userInfo);
        });
    });
});

module.exports = router;
