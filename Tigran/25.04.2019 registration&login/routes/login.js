const express = require('express');
const router = express.Router();
const jsonfile = require('jsonfile');
const filepath = "./data/users.json";
const coockie = "./data/coockie.json";

function tokenGenerate(username) {
    if (username.length !== 32) {
        for (let i = 1; i < 32 - username.length; i++) {
            username += "a";
        }
    }
    return Buffer.from(username).toString('base64');
}

router.post('/', function (req, res) {

    jsonfile.readFile(filepath, function (err, obj) {
        if (err) {
            return res.status(500).send("Server error!");
        }
        // return res.send(req.headers)
        if (req.headers["content-type"] !== "application/json") {
            return res.status(400).send("bad request");
        }
        if (Object.keys(req.body).length !== 2 || !req.body.username || !req.body.password) {
            return res.status(400).send("bad request");
        }
        if (!(Buffer.from(obj[req.body.username].password, 'base64').toString('ascii') === req.body.password)) {
            return res.status(400).send("bad request");
        }
        if (!obj[req.body.username]) {
            return res.status(400).send("bad request");
        }

        jsonfile.readFile(coockie, function (err, data) {
            if (err) {
                return res.status(500).send("Server error!");
            }
            if (data[req.headers.token]) {
                return res.status(200).send("Has already logined")
            }
            const token = tokenGenerate(req.body.username);
            // let targetDate = new Date();
            // targetDate.setDate(targetDate.getDate() + 10);
            let now=new Date();
            let later=new Date();
            later.setHours(now.getHours()+6);

            data[token] = {
                token : token,
                date : later
            }
            jsonfile.writeFile(coockie,data,{ spaces: 4, EOL: '\r\n' }, (err) => {
                if (err) {
                    return res.status(500).send("Server error!");
                }
                return res.status(200).send("You are logined");
            })
    
            
            
        })

    })
})

module.exports = router;