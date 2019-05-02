const express = require('express');
const jsonfile = require('jsonfile');
const bcrypt = require('bcrypt');
const Joi = require('joi');

const constants = require('../constants');
const messages = require('../messages');
const schema = require('../models/schema');

const router = express.Router();

const filePath = './data/user.json';
const tokensPaht = './data/authUsers.json';

const tokenLength = 32;
const tokenExpireTime = 2;
const saltRounds = 10;

// const validateUsername = (username) => {
//     const reg = new RegExp(/^[a-zA-Z][a-z0-9-_]{2,16}/);

//     return reg.test(username);
// };

const existingUser = (username, obj) => !!obj[ username ];

const createToken = (length) => {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;

    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
};

router.post('/registration', (req, res) => {
    if (Object.keys(req.body).length === 0 || !req.body.username || !req.body.password) {
        return res.status(constants.BAD_REQUEST).send({ statusMessage: messages.BAD_REQUEST });
    }
    jsonfile.readFile(filePath, (err, obj) => {
        if (err) {
            return res.status(constants.SERVER_ERROR).send({ statusMessage: messages.SERVER_ERROR });
        }
        // if (!validateUsername(req.body.username)) {
        //     return res.status(constants.BAD_REQUEST).send({ statusMessage: messages.ENTER_VALID_USERNAME });
        // }
        if (existingUser(req.body.username, obj)) {
            return res.status(constants.CONFLICT).send({ statusMessage: messages.ENTER_VALID_USERNAME });
        }
        const user = req.body;

        Joi.validate(user, schema, (schemaErr) => {
            if (schemaErr) {
                res.status(constants.BAD_REQUEST).json({ statusMessage: messages.BAD_REQUEST });
            }
        });
        const hashedPassword = bcrypt.hashSync(req.body.password, saltRounds);

        obj[ req.body.username ] = hashedPassword;
        jsonfile.writeFile(filePath, obj, { spaces: 2, EOL: '\r\n' }, (writeErr) => {
            if (writeErr) {
                return res.status(constants.SERVER_ERROR).send({ statusMessage: messages.OK });
            }
            return res.status(constants.OK).send({ statusMessage: messages.OK });
        });
    });
});

router.post('/login', (req, res) => {
    if (Object.keys(req.body).length === 0 || !req.body.username || !req.body.password) {
        return res.status(constants.BAD_REQUEST).send({ statusMessage: messages.BAD_REQUEST });
    }
    jsonfile.readFile(filePath, (err, obj) => {
        if (err) {
            return res.status(constants.SERVER_ERROR).send({ statusMessage: messages.SERVER_ERROR });
        }
        const hashedPassword = bcrypt.hashSync(req.body.password, saltRounds);

        if (!obj[ req.body.username ] || obj[ req.body.username ] !== hashedPassword) {
            return res.status(constants.UNAUTHORIZED_USER).send({ statusMessage: messages.UNAUTHORIZED_USER });
        }
        const token = createToken(tokenLength);

        jsonfile.readFile(tokensPaht, (tokenErr, tokens) => {
            if (tokenErr) {
                return res.status(constants.SERVER_ERROR).send({ statusMessage: messages.SERVER_ERROR });
            }
            tokens[ token ] = {
                username: req.body.username,
                expDate: new Date().getHours() + tokenExpireTime
            };
            jsonfile.writeFile(tokensPaht, tokens, { spaces: 2, EOL: '\r\n' }, (writeErr) => {
                if (writeErr) {
                    return res.status(constants.SERVER_ERROR).send({ statusMessage: messages.SERVER_ERROR });
                }
                return res.status(constants.OK).send({ token });
            });
        });
    });
});

router.get('/authorization/v1/userInfo', (req, res) => {
    const token = req.headers.Authorization;

    if (!token) {
        return res.status(constants.UNAUTHORIZED_USER).send({ statusMessage: messages.UNAUTHORIZED_USER });
    }
    jsonfile.readFile(tokensPaht, (err, obj) => {
        if (err) {
            return res.status(constants.SERVER_ERROR).send({ statusMessage: messages.SERVER_ERROR });
        }
        if (!obj[ token ]) {
            return res.status(constants.UNAUTHORIZED_USER).send({ statusMessage: messages.UNAUTHORIZED_USER });
        }
        const currentDate = new Date().getHours();

        if (obj[ token ].expDate < currentDate) {
            delete obj[ token ];
            jsonfile.writeFile(tokensPaht, obj, { spaces: 2, EOL: '\r\n' }, (writeErr) => {
                if (writeErr) {
                    return res.status(constants.SERVER_ERROR).send({ statusMessage: messages.SERVER_ERROR });
                }
            });
            return res.status(constants.UNAUTHORIZED_USER).send({ statusMessage: messages.UNAUTHORIZED_USER });
        }
        jsonfile.readFile(filePath, (readErr, user) => {
            if (readErr) {
                return res.status(constants.SERVER_ERROR).send({ statusMessage: messages.SERVER_ERROR });
            }
            return res.status(constants.OK).send(user[ obj[ token ].username ]);
        });
    });
});

module.exports = router;
