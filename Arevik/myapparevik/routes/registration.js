const Joi = require("joi");
//const jwt = require('jsonwebtoken');
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

router.post('/', (req, res) => {
    const {error} = validateUsers(req.body);
	jsonfile.readFile(users, "utf-8",  (err, data)=> {
		if(err) return res.status(500).send("EXTERNAL SERVER ERROR");
        if(error) return res.status(400).send(error.details[0].message);
        if(data[req.body.username]) return res.status(400).send("This Username is already used");
        
        data[req.body.username] = {
            username : req.body.username,
            password : req.body.password,
            email : req.body.email
        };     		
        jsonfile.writeFile(users, data, (err, data) => {
            if(err) return res.status(500).send("EXTERNAL SERVER ERROR");
            res.status(200).send("OK");
			console.log(data);
        })
	})
})

module.exports = router;