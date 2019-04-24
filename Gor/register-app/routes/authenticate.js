const express = require('express');
const jsonfile = require('jsonfile');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const router = express.Router();

const filePath = './data/user.json';
const config = require('../config');

const validateUsername = function(username) {
    const reg = new RegExp(/^[a-zA-Z][a-z0-9-_]{2,16}/);
    return reg.test(username);
};

router.get('/me', function(req, res) {
    const token = req.headers['x-access-token'];
    if(!token) {
        return res.status(401).send({auth: false, message: 'No token provided.'});        
    }
    jwt.verify(token, config.secret, function(err, decoded) {
        if(err) {
            return res.status(500).send({auth: false, message: 'Failed to authenticate token.'});
        }
        res.status(200).send(decoded);
      });
});

router.post('/', function(req, res) {
    if(Object.keys(req.body).length === 0) {
        return res.status(400).send("Bad request: Body is empty");
    }
    if(!validateUsername(req.body.username)) {
        return res.status(400).send("Bad request: Enter valid username");
    }
    jsonfile.readFile(filePath, function(err, obj) {
        if(err) {
            return res.status(500).send("Server error");
        }
        const hashedPassword = bcrypt.hashSync(req.body.password, 8);
        if(obj[req.body.username] !== hashedPassword) {
            return res.status(404).send("unauthenticated user");
        }
        if(obj[req.body.username] === hashedPassword) {
            const token = jwt.sign({id: req.body.username}, config.secret, {expiresIn: 60});
            res.status(200).send({auth: true, token: token});            
        }
    })
});

module.exports = router;