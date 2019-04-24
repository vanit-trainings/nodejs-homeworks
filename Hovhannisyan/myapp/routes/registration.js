const express = require('express');
const router = express.Router();
const jsonfile = require('jsonfile');
const filepath = "./data/users.json";
function validateUsername(username) {
    var usernameRegex = /^[a-zA-Z\-]+$/;
    return usernameRegex.test(username);

}
function validatePass(password){
    var passw=  /^[A-Za-z]\w{7,15}$/;
    return passw.test(password);
}

router.post('/', function (req, res) {
    jsonfile.readFile(filepath, function (err, obj) {
        if (err) {
            return res.status(500).send("Server error");
        }
        if (!req.body.email) {
            return res.status(400).send("bad request");
        }
        if (!validateUsername(req.body.username) && !validatePass(req.body.password)) {
            return res.status(400).send("bad request");
        }
              
        if (obj[req.body.username]) {
            return res.status(400).send("Username is already used");
        }
        
        obj[req.body.username] = {
            password: Buffer.from(req.body.password).toString('base64'),//kodavorel
            email: req.body.email
        };
        const porc = Buffer.from(obj[req.body.username].password,'base64').toString('ascii');
        jsonfile.writeFile(filepath, obj, function (err) {
            if (err) {
                return res.status(500).send("Server error");
            }
            return res.status(200).send(porc);

        });
    })

});






module.exports = router;
