const express = require('express');
const router = express.Router();
const jsonfile = require('jsonfile');
const users = "./data/users.json";

function isvVlidUsername(username) {
    const regex = /^[a-zA-Z\-]+$/;
    return regex.test(username);//true || false 

}
function isValidaPassword(password){
    const regex =  /^[A-Za-z]\w{7,15}$/;
    return regex.test(password);//true || false
}

router.post('/', function (req, res) {
    jsonfile.readFile(users, function(err, obj){
        if (err) {
            return res.status(500).send("Server error");
        }
        if (!isvVlidUsername(req.body.username) && !isValidaPassword(req.body.password)){
            return res.status(400).send("bad request");
        }
        if(obj[req.body.username]){
            return res.status(400).send("Username is already used");
        }
        obj[req.body.username] = {
            username : req.body.username,
            password : Buffer.from(req.body.password).toString('base64')
            
        };
        jsonfile.writeFile(users, obj, {spaces: 2, EOL: '\r\n'}, function(err){
            if(err){
                return res.status(500).send("Server error");
            }
            return res.status(200).send("success");
        });
    })
});






module.exports = router;
