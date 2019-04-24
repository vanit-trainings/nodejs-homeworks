const express = require('express');
const uniqid = require('uniqid');
const jsonfile = require('jsonfile');
const router = express.Router();

const filePath = './data/users.json';
const logPassPath = './data/logPassId.json';

function validateLogin(login) {
    const regLog = new RegExp(/^((\w+)(\.|_)?){5,16}/);
    return (login === login.match(regLog)[0]);
}
function existingLogin(login, obj) {
    if(obj[login] != undefined){
        return false;
    }
    else{
        return true;
    }
}

function validateEmail(email) {
    const regEmail = new RegExp(/^(\w+)(\.|_)?(\w+)(\.|_)?(\w{1,})@(\w+)(\.(\w+))+/);
    if(email.match(regEmail) !== null){
    console.log(email === email.match(regEmail)[0]);
    return email === email.match(regEmail)[0];
    }
    return false;
}
function existingEmail(obj, email) {
        if(obj.email === email){ 
            return false; 
        }
        for(var i in obj) {
            if(obj[i].email === email){
                return false;
                    }
            }
        return true;
}

function validatePassword(password) {
    const regPass = new RegExp(/(\w+){6,16}/);
    return (password === password.match(regPass)[0]);
}
function validateName(name) {
    const regName = new RegExp(/^[A-Z]{1}[a-z]+/);
    if(name.match(regName) !== null){
    return (name === name.match(regName)[0]);
    }
    return false;
}

router.post('/registration', function(req, res) {
    var contype = req.headers['content-type'];
    if (!contype || contype.indexOf('application/json') !== 0) {
       return res.send(400);
    }
    jsonfile.readFile(filePath, function(err, obj) {
        if(err) {
            return res.status(500).send("Server error1");
            }
        if(Object.keys(req.body).length === 0) {
            return res.status(400).send("Bad request: Body is empty");
            }
        if(!validateLogin(req.body.login) && !validateEmail(req.body.login)) {
            return res.status(400).send("Bad request: Enter valid login");
        } 
        jsonfile.readFile(logPassPath, function(err, obj1){
            if(err) {
                return res.status(500).send("Server error");
                }
        if(!existingLogin(req.body.login, obj1)){
            return res.status(400).send("Bad request: Login already busy"); 
        }
        if(!validatePassword(req.body.password)) {
            return res.status(400).send("Bad request: Enter valid password");
        }
        if(!validateName(req.body.firstName) || !validateName(req.body.lastName)) {
            return res.status(400).send("Bad request: Invalid firstName or lastName ");
        }
        if(!validateEmail(req.body.email)) {
            return res.status(400).send("Bad request: Enter valid email");
        }
        if(!existingEmail(obj, req.body.email)){
            return res.status(400).send("Bad request: Email already busy"); 
        }
        const id = uniqid();
        let codePass = (new Buffer(req.body.password)).toString('base64');
        let data = {};
        data.firstName = req.body.firstName;    
        data.lastName = req.body.lastName;    
        data.email = req.body.email;    
        data.login = req.body.login;    
        data.gender = req.body.gender;
        data.birthDate = req.body.birthDate;
        obj[id] = data;

        let logPass = {};    
        logPass.password = codePass;
        logPass.id = id;

        jsonfile.writeFile(filePath, obj,{spaces: 2, EOL:"\r\n"}, function(err) {
            if(err) {
                return res.status(500).send("Server error");
            }
            else {
                obj1[req.body.login] = logPass;
                jsonfile.writeFile(logPassPath, obj1,{spaces: 2, EOL:"\r\n"}, function(err) {
                    if(err) {
                    return res.status(500).send("Server error");
                    }
                    return res.status(200).send("OK");
                    });
        }
    });
        });
    
    });
})
module.exports = router;