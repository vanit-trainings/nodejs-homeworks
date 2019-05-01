const express = require('express');

const router = express.Router();
const jsonfile = require('jsonfile');

const filepath = './data/users.json';
const loginedUsers = './data/loginedUsers.json';
const crypto = require('crypto');

const hash = crypto.createHash('sha512');
const serverError = 500;
const badRequest = 400;
const OK = 200;
const two = 2;
const tokenSize = 32;
const sixth = 60;
const thousand = 1000;
const unauthorized = 401;
const second = two * sixth * sixth * thousand;
const toCode = (a) => {
    const data = hash.update(a, 'utf-8');
    const genHash = data.digest('hex');

    return `hash : ${genHash}`;
};

const tokenGenerate = () => {
    const string = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789.@-_';

    let token = '';

    for (let i = 0; i < tokenSize; i++) {
        token += string[ Math.floor(Math.random() * string.length) ];
    }
    return token;
};


router.post('/', (req, res) => {
    jsonfile.readFile(filepath, (err1, obj) => {
        if (err1) {
            return res.status(serverError).send('Server error!');
        }
        if (Object.keys(req.body).length !== two || !req.body.username || !req.body.password) {
            return res.status(badRequest).send('Bad request');
        }
        if (!(toCode(req.body.password) === obj[ req.body.username ].password)) {
            return res.status(badRequest).send('Bad request');
        }
        /* if (!(Buffer.from(obj[req.body.username].password, 'base64').toString('ascii') === req.body.password)) {
            return res.status(badRequest).send("Bad request");
        }*/
        if (!obj[ req.body.username ]) {
            return res.status(badRequest).send('Bad request');
        }

        jsonfile.readFile(loginedUsers, (err2, data) => {
            if (err2) {
                return res.status(serverError).send('Server error!');
            }
            if (data[ req.headers.token ]) {
                return res.status(OK).send('Has already logined');
            }
            const token = tokenGenerate();
            
            const later = (new Date()).getTime() + second;
            
            data[ token ] = {
                token,
                username: req.body.username,
                date: later
            };
            // if(req.headers.token.date === later.setHours(now.getHours() + 6)){
            //  token = tokenGenerate();
            // }
            jsonfile.writeFile(loginedUsers, data, { spaces: 4, EOL: '\r\n' }, (err3) => {
                if (err3) {
                    return res.status(serverError).send('Server error!');
                }
                return res.status(serverError).send('You are logined');
            });
        });
    });
});
router.get('/authorized', (req, res) => {
    if (!req.headers.token) {
        return res.status(unauthorized).send('User is\'nt authorized!');
    }
    jsonfile.readFile(loginedUsers, (err, data) => {
        if (err) {
            return res.status(serverError).send('Server error!');
        }
        if (data[ req.headers.token ] === undefined) {
            return res.status(unauthorized).send('User is\'nt authorized!');
        }
        if (data[ req.headers.token ].date < (new Date()).getTime()) {
            return res.status(unauthorized).send('User isn\'t authorized');
        }
        jsonfile.readFile(filepath, (err1, obj) => {
            if (err1) {
                return res.status(serverError).send('Server error!');
            }
            const user = obj[ data[ req.headers.token ].username ];

            delete user.password;
            return res.status(OK).send(user);
        });
    });
});

module.exports = router;
