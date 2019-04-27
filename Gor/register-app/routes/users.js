const express = require('express');
const uniqid = require('uniqid');
const jsonfile = require('jsonfile');
const router = express.Router();

const filePath = './data/user.json';
const tokensPaht = './data/authUsers.json'

const validateUsername = function(username) {
    const reg = new RegExp(/^[a-zA-Z][a-z0-9-_]{2,16}/);
    return reg.test(username);
};

const existingUser = function(username, obj) {
    return obj[username] ? true : false;
}

const createToken = function(length) {
   let result = '';
   let characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
   let charactersLength = characters.length;
   for(let i = 0; i < length; i++) {
       result += characters.charAt(Math.floor(Math.random() * charactersLength));
   }
   return result;
}

router.post('/registration', function(req, res) {
    if(Object.keys(req.body).length === 0 || !req.body.username || !req.body.password) {
        return res.status(400).send(`BAD REQUEST`);
    }  
    jsonfile.readFile(filePath, function(err, obj) {
        if(err) {
            return res.status(500).send(`SERVER ERROR`);
        }
        if(!validateUsername(req.body.username)) {
            return res.status(400).send(`ENTER VALID USERNAME`);
        }
        if(existingUser(req.body.username, obj)) {
            return res.status(409).send(`ENTER VALID USERNAME`);
        }
        const hashedPassword = Buffer.from(req.body.password).toString('base64');
        obj[req.body.username] = hashedPassword;
        jsonfile.writeFile(filePath, obj, {spaces : 2, EOL : '\r\n'}, function(err, obj) {
            if(err) {
                return res.status(500).send(`SERVER ERROR`);
            }
            return res.status(200).send(`OK`);
        })
    })
});

router.post('/login', function(req, res) {
    if(Object.keys(req.body).length === 0 || !req.body.username || !req.body.password) {
        return res.status(400).send(`BAD REQUEST`);
    }
    jsonfile.readFile(filePath, function(err, obj) {
        if(err) {
            return res.status(500).send(`SERVER ERROR`);
        }
        const hashedPassword = Buffer.from(req.body.password).toString('base64');
        if(!obj[req.body.username] || obj[req.body.username] !== hashedPassword) {
            return res.status(401).send(`ENTER VALID USERNAME OR PASSWORD`);
        } else {
            const token = createToken(32);
            jsonfile.readFile(tokensPaht, function(err, tokens) {
                if(err) {
                    return res.status(500).send(`SERVER ERROR`);
                }
                tokens[token] = {
                    username: req.body.username,
                    expDate: new Date().getHours() + 2
                }
                jsonfile.writeFile(tokensPaht, tokens, {spaces : 2, EOL : '\r\n'}, function(err, obj) {
                    if(err) {
                        return res.status(500).send(`SERVER ERROR`);
                    }
                    return res.status(200).send(token);
                })
            })           
        }
    })
});

router.get('/authenticate/v1', function(req, res) {
    const token = req.headers['x-access-token'];
    if(!token) {
        return res.status(401).send(`UNAUTHORIZED USER`);        
    }
    jsonfile.readFile(tokensPaht, function(err, obj) {
        if(err) {
            return res.status(500).send(`SERVER ERROR`);
        }
        if(!obj[token]) {
            return res.status(401).send(`UNAUTHORIZED USER`);
        }
        const currentDate = new Date().getHours();
        if(obj[token].expDate < currentDate) {
            delete obj[token];
            jsonfile.writeFile(tokensPaht, tokens, {spaces : 2, EOL : '\r\n'}, function(err, obj) {
                if(err) {
                    return res.status(500).send(`SERVER ERROR`);
                }
                return res.status(401).send(`UNAUTHORIZED USER`);
            })
        }
        jsonfile.readFile(filePath, function(err, user) {
            if(err) {
                return res.status(500).send(`SERVER ERROR`);
            }
            return res.status(200).send(user[obj[token].username]);
        })
    })
});

module.exports = router;