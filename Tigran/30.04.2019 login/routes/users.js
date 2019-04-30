const express = require('express');
const router = express.Router();
const jsonfile = require('jsonfile');
const usersData = "./data/users.json";
const loginedUsers = "./data/coockie.json";

function validateUsername(username) {
    var usernameRegex = /^[a-zA-Z\-]+$/;
    return usernameRegex.test(username);
}
function validatePass(password){
    var passw = /^[A-Za-z0-9]\w{7,15}$/;
    return passw.test(password);
}
function validateEmail(email){
    var mail = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return mail.test(email);
}

function genarateABC(){
    let abc = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let tazaABC = [];
    abc = abc.split("");
    for(let i = 62;i>0;i--){
        let randomLetter = Math.round(Math.random()*(i-1));
        Math.round(randomLetter);
        tazaABC.push(abc[randomLetter]);
        abc.splice(randomLetter,1);
        //console.log(randomLetter)
    }
    //console.log(tazaABC);
    return tazaABC;
}
function tokenGenerate(username,secret){
    let abc = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    // let secret = genarateABC();
    let token = [];
    for(let i in username){
        token[i] = secret[abc.indexOf(username[i])];
    }
    //console.log("token@ "  + token.join(""));
    return token.join("");
}
function tokenDeCode(token,secret){
    let abc = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let username = [];
    for(let i in token){
        username[i] = abc[secret.indexOf(token[i])];
    }
    //console.log("username@ " + username.join(""));
    return username.join("");
}



router.post('/registration', function (req, res) {
    jsonfile.readFile(usersData, function (err, obj) {
        if (err) {
            return res.status(500).send("Server error");
        }
        if(Object.keys(req.body).length !== 2){
            return res.status(400).send("bad request");
        }
        if (!validateUsername(req.body.username) || !validatePass(req.body.password)) {
            return res.status(400).send("bad request");
        }
        if (obj[req.body.username]) {
            return res.status(400).send("Username is already existed");
        }
        
        obj[req.body.username] = {
            username : req.body.username,
            password: Buffer.from(req.body.password).toString('base64'),//kodavorel
        };
        jsonfile.writeFile(usersData, obj, { spaces: 4, EOL: '\r\n' }, function (err) {
            if (err) {
                return res.status(500).send("Server error");
            }
            return res.status(200).send("ok");

        });
    })
});

router.post('/login', function (req, res) {

    jsonfile.readFile(usersData, function (err, obj) {
        if (err) {
            return res.status(500).send("Server error!");
        }
        if (req.headers["content-type"] !== "application/json") {
            return res.status(400).send("bad request");
        }
        if (Object.keys(req.body).length !== 2 || !req.body.username || !req.body.password) {
            return res.status(400).send("bad request");
        }
        if (obj[req.body.username.password] === Buffer.from(req.body.password, 'base64')) {
            return res.status(400).send("bad request");
        }
        if (!obj[req.body.username]) {
            return res.status(400).send("bad request");
        }

        jsonfile.readFile(loginedUsers, function (err, data) {
            if (err) {
                return res.status(500).send("Server error!");
            }
            const secret = genarateABC();
            const token = tokenGenerate(req.body.username,secret);
            
            let date = (new Date()).getTime() + (2*1000*60*60);
            data[token] = {
                token : token,
                date : date,
                secret : secret
            };
            jsonfile.writeFile(loginedUsers,data,{ spaces: 4, EOL: '\r\n' }, (err) => {
                if (err) {
                    return res.status(500).send("Server error!");
                }
                return res.status(200).send("You are logined");
            })
        })
    })
});

router.get('/login', function (req, res) {
    jsonfile.readFile(usersData, function (err, obj) {
        if (err) {
            return res.status(500).send("Server error!");
        }
        if (req.headers["content-type"] !== "application/json") {//petq chi
            return res.status(400).send("bad request");
        }
        if (!req.headers.token) {
            return res.status(400).send("bad requset");
        }
        jsonfile.readFile(loginedUsers, function (err, data) {
            if (err) {
                return res.status(500).send("Server error!");
            }
            if(!data[req.headers.token]){
                return res.status(401).send("User isn't unauthorized");
            }
            if(data[req.headers.token].date < (new Date()).getTime() ){
                return res.status(401).send("User isn't unauthorized");
            }
            let userId = tokenDeCode(req.headers.token,data[req.headers.token].secret);
            return res.status(200).send(obj[userId])
        })
    })
})





module.exports = router;