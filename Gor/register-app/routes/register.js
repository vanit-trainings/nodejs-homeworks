const express = require('express');
const uniqid = require('uniqid');
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

const existingUser = function(username, obj) {
    return obj[username] ? true : false;
}
router.post('/', function(req, res) {
    if(Object.keys(req.body).length === 0) {
        return res.status(400).send("Bad request: Body is empty");
    }  
    jsonfile.readFile(filePath, function(err, obj) {
        if(err) {
            return res.status(500).send("Server error");
        }
        if(!validateUsername(req.body.username) || existingUser(req.body.username, obj)) {
            return res.status(400).send("Bad request: Enter valid username");
        }
        const hashedPassword = bcrypt.hashSync(req.body.password, 8);
        obj[req.body.username] = hashedPassword;
        //token
        const token = jwt.sign({id: req.body.username}, config.secret, {expiresIn: 60});
        jsonfile.writeFile(filePath, obj, {spaces : 2, EOL : '\r\n'}, function(err, obj) {
            if(err) {
                return res.status(500).send("Server error");
            }
            return res.status(200).send({auth: true, token: token});
        })
    })
});

module.exports = router;
