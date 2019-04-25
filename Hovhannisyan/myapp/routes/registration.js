const express = require('express');
const router = express.Router();
const jsonfile = require('jsonfile');
const filepath = "./data/users.json";
function validateUsername(username) {
    var usernameRegex = /^[a-zA-Z\-]+$/;
    return usernameRegex.test(username)

}
function validatePass(password){
    var passw = /^[A-Za-z]\w{7,15}$/;
    return passw.test(password)
}
function validateEmail(email){
    var mail = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return mail.test(email)
}   

router.post('/', function (req, res) {
    jsonfile.readFile(filepath, function (err, obj) {
        if (err) {
            return res.status(500).send("Server error");
        }
        if (!validateUsername(req.body.username) || !validatePass(req.body.password) ||  !validateEmail(req.body.email)) {
            return res.status(400).send("bad request");
        }
        if(Object.keys(req.body).length !==3){
            return res.status(400).send("bad request");
        }
        if (obj[req.body.username]) {
            return res.status(400).send("Username is already existed");
        }
        
        obj[req.body.username] = {
            username : req.body.username,
            password: Buffer.from(req.body.password).toString('base64'),//kodavorel
            email: req.body.email

        };
        jsonfile.writeFile(filepath, obj, { spaces: 4, EOL: '\r\n' }, function (err) {
            if (err) {
                return res.status(500).send("Server error");
            }
            return res.status(200).send("ok");

        });
    })

});






module.exports = router;
