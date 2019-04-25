const Joi = require("joi");
const jwt = require('jsonwebtoken');
const express = require('express');
const router = express();
const jsonfile = require('jsonfile');
const users ='./data/user.json';

function validateUsers(users) {
    const schema = {
        username: Joi.string().regex(/^[a-zA-Z][a-z0-9-_]{3,20}/).required(),
        password: Joi.string().required(),
        email: Joi.string().email({ minDomainAtoms: 2 }).required()
    }
    return Joi.validate(users, schema);
};

router.post('/api/posts', verifyToken, (req, res) => {  
    jwt.verify(req.token, 'secretkey', (err, authData) => {
      if(err) {
        res.sendStatus(403);
      } else {
        res.json({
          message: 'Post created...',
          authData
        });
      }
    });
});

 
router.post('/api/login', (req, res) => {
    const {error} = validateUsers(req.body);
	jsonfile.readFile(users, "utf-8",  (err, data)=> {
		if(err) return res.status(500).send("EXTERNAL SERVER ERROR");
        if(error) return res.status(400).send(error.details[0].message);
        if(data[req.body.username]) return res.status(400).send("This Username is already used");
        const user = {
            id: 1, 
            username: 'arevik1983',
            email: 'arevik-elen@mail.ru'
        }  
    
        jwt.sign({user}, 'secretkey', { expiresIn: '30s' }, (err, token) => {
            res.json({
              token
            });
          });     		
        jsonfile.writeFile(users, data, (err, data) => {
            if(err) return res.status(500).send("EXTERNAL SERVER ERROR");
            res.status(200).send("OK");
			console.log(data);
        })
	})
})

function verifyToken(req, res, next) {
    // Get auth header value
    const bearerHeader = req.headers['authorization'];
    // Check if bearer is undefined
    if(typeof bearerHeader !== 'undefined') {
        // Split at the space
        const bearer = bearerHeader.split(' ');
        // Get token from array
        const bearerToken = bearer[1];
        // Set the token
        req.token = bearerToken;
        // Next middleware
        next();
    } else {
        // Forbidden
        res.sendStatus(403);
    }   
}

module.exports = router;