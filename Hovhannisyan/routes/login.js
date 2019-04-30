const express = require('express');
const router = express.Router();
const jsonfile = require('jsonfile');
const filepath = "./data/users.json";
const loginedUsers = "./data/loginedUsers.json";
const crypto = require('crypto');
const hash = crypto.createHash('sha512');

function toCode(a){
    data = hash.update(a, 'utf-8');
    gen_hash= data.digest('hex');
    return "hash : " + gen_hash;
}

function tokenGenerate() {
    var string = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789.@-_';
    var token = '';
    for (let i = 0; i < 32; i++) {
        token += string[Math.floor(Math.random() * string.length)];
    }
    return token;
}


router.post('/', function (req, res) {

    jsonfile.readFile(filepath, function (err, obj) {
        if (err) {
            return res.status(500).send("Server error!");
        }
        if (Object.keys(req.body).length !== 2 || !req.body.username || !req.body.password) {
            return res.status(400).send("Bad request");
        }
        if(!(toCode(req.body.password) === obj[req.body.username].password)){
            return res.status(400).send("Bad request")
        }        
        /*if (!(Buffer.from(obj[req.body.username].password, 'base64').toString('ascii') === req.body.password)) {
            return res.status(400).send("Bad request");
        }*/
        if (!obj[req.body.username]) {
            return res.status(400).send("Bad request");
        }

        jsonfile.readFile(loginedUsers, function (err, data) {
            if (err) {
                return res.status(500).send("Server error!");
            }
            if (data[req.headers.token]) {
                return res.status(200).send("Has already logined")
            }
            let token = tokenGenerate();
            
            let later = (new Date()).getTime() + (2*1000*60*60);
            
            data[token] = {
                token: token,
                username: req.body.username,
                date: later
            }
            //if(req.headers.token.date === later.setHours(now.getHours() + 6)){
            //  token = tokenGenerate();
            //}
            jsonfile.writeFile(loginedUsers, data, { spaces: 4, EOL: '\r\n' }, (err) => {
                if (err) {
                    return res.status(500).send("Server error!");
                }
                return res.status(200).send("You are logined");
            })
        })
    })
})
router.get('/authorized',function(req,res){
    if(!req.headers.token){
        return res.status(401).send("User is'nt unautherized!");
    }
    jsonfile.readFile(loginedUsers,function(err,data){
        if(err){
            return res.status(500).send("Server error!");
        }
        if(data[req.headers.token] === undefined){
            return res.status(401).send("User is'nt unauthorized!");
        }
        if(data[req.headers.token].date < (new Date()).getTime() ){
            return res.status(401).send("User isn't unauthorized")
        }
        jsonfile.readFile(filepath,function(err,obj){
            if(err){
                return res.status(500).send("Server error!");
            }
            let user = obj[data[req.headers.token].username];
            delete user.password;
            return res.status(200).send(user);
        })
    })
})

module.exports = router;