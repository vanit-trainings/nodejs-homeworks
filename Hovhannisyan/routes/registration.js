
const express = require('express');

const router = express.Router();
const jsonfile = require('jsonfile');

const filepath = './data/users.json';
const crypto = require('crypto');

const hash = crypto.createHash('sha512');
const serverError = 500;
const badRequest = 400;
const OK = 200;
const three = 3;
const validateUsername = function validateUsername(username) {
    const usernameRegex = /^[a-zA-Z]+$/;

    return usernameRegex.test(username);
};

const validatePass = function validatePass(password) {
    const passw = /^[A-Za-z]\w{7,15}$/;

    return passw.test(password);
};

const validateEmail = function validateEmail(email) {
    const mail = /^([A-Za-z0-9_\-.])+@([A-Za-z0-9_\-.])+\.([A-Za-z]{2,4})$/;

    return mail.test(email);
};

const toCode = (a) => {
    const data = hash.update(a, 'utf-8');
    const genHash = data.digest('hex');

    return `hash : ${genHash}`;
};


router.post('/', (req, res) => {
    jsonfile.readFile(filepath, (err1, obj) => {
        if (err1) {
            return res.status(serverError).send('Server error');
        }
        if (!validateUsername(req.body.username) || !validatePass(req.body.password) || !validateEmail(req.body.email)) {
            return res.status(badRequest).send('bad request');
        }
        if (Object.keys(req.body).length !== three) {
            return res.status(badRequest).send('bad request');
        }
        if (obj[ req.body.username ]) {
            return res.status(badRequest).send('Username is already existed');
        }
        
        obj[ req.body.username ] = {
            username: req.body.username,
            password: toCode(req.body.password),
            // password: Buffer.from(req.body.password).toString('base64'),//kodavorel
            email: req.body.email

        };
        jsonfile.writeFile(filepath, obj, { spaces: 4, EOL: '\r\n' }, (err) => {
            if (err) {
                return res.status(serverError).send('Server error');
            }
            return res.status(OK).send('ok');
        });
    });
});


module.exports = router;
