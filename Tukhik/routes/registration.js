const express = require('express');
const router = express.Router();
const jsonfile = require('jsonfile');
const users = "./data/users.json";

function isvVlidUsernameOrPasswoord(usernameOrPassword) {
    const regex = /^[a-zA-Z\-]/;
    return regex.test(usernameOrPassword);
}


router.post('/', function (req, res) {
    jsonfile.readFile(users, function(err, obj){
        if (err) {
            return res.status(500).send("Server error");
        }
        if (!isvVlidUsernameOrPasswoord(req.body.username) && !isvVlidUsernameOrPasswoord(req.body.password)){
            return res.status(400).send("bad request");
        }
        if(obj[req.body.username]){
            return res.status(400).send("Username is already used");
        }
        obj[req.body.username] = {
            username : req.body.username,
            password : req.body.password
            
        };
        jsonfile.writeFile(users, obj,  function(err){
            if(err){
                return res.status(500).send("Server error");
            }
            return res.status(200).send("success");
        });
    })
});






module.exports = router;