const express = require('express');
const uniqid = require('uniqid');
const jsonfile = require('jsonfile')
const router = express.Router();

const filePath = './data/user.json';

const validateUsername = function(username) {
    const reg = new RegExp(/^[a-zA-Z][a-z0-9-_]{2,16}/);
    return reg.test(username);
};

const existingUser = function(username, obj) {
    return obj[username] ? true : false;
}
router.post('/', function(req, res) {
    jsonfile.readFile(filePath, function(err, obj) {
        if(err) {
            return res.status(500).send("Server error");
        }  
        if(Object.keys(req.body).length === 0) {
            return res.status(400).send("Bad request: Body is empty");
        }
        if(!validateUsername(req.body.username) || existingUser(req.body.username, obj)) {
            return res.status(400).send("Bad request: Enter valid username");
        }       
        obj[req.body.username] = req.body.password
        jsonfile.writeFile(filePath, obj, function(err, obj) {
            if(err) {
                return res.status(500).send("Server error");
            }
            return res.status(200).send("OK");
        })
    })
});

module.exports = router;
