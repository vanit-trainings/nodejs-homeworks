var express = require('express');
var router = express.Router();
var users = './data/users.json';
const jsonfile = require('jsonfile');

testBody = (req) => {
    let statusCode,
        statusMessage;
    if(req.headers["content-type"] !== "application/json"){
        statusCode = 400;
        statusMessage = `Bad Request : Body not json`;
        return {statusCode, statusMessage};
    }else if(Object.keys(req.body).length === 0){
        statusCode = 400;
        statusMessage = `Bad Request : Body is empty`;
        return {statusCode, statusMessage};
    }
    if(!req.body.userName || !req.body.password){
        statusCode = 400;
        statusMessage = `Bad Request : Missing keys, additional keys`;
        return {statusCode, statusMessage};
    }
    return "OK";
}
validUserName = (value) =>{
    return value.match(/^([a-z]|[A-Z]|[-]|[_]){1,10}$/)
}
validPassword = (value) =>{
    return value.length < 10
}
//1. signUp - userName, password
router.post('/signUp', function(req, res) {//password baca grum
    const bodyObj = testBody(req);
    if(bodyObj !== "OK"){
        return res.status(bodyObj.statusCode).send(bodyObj.statusMessage);
    }
    if(!validUserName(req.body.userName) || !validPassword(req.body.password)){
        return res.status(400).send(`invalid value`);
    }
    jsonfile.readFile(users, 'utf-8', function(err, obj){ 
        if(err){
            res.status(500).send(`Server error`);
        }else{
            if(obj.users[req.body.userName]){
                return res.status(400).send(`repeat userName`);
            }
            obj.users[req.body.userName] = {
                "userName" : req.body["userName"],   
                "password" : req.body["password"]   
            }
            jsonfile.writeFile(users, obj, {spaces : 4, EOL : '\r\n'}, function(err, obj){
                if(err){
                    return res.status(500).send(`Server error`);
                }
                 res.status(200).send("OK");
            })
        }
    })
});
//signIn
router.post('/signIn', function(req, res) {//token der arac chi
    const bodyObj = testBody(req);
    if(bodyObj !== "OK"){
        return res.status(bodyObj.statusCode).send(bodyObj.statusMessage);
    }
    if(!validUserName(req.body.userName) || !validPassword(req.body.password)){
        return res.status(400).send(`invalid value`);
    }
    jsonfile.readFile(users, 'utf-8', function(err, obj){ 
        if(err){
            res.status(500).send(`Server error`);
        }else{
            if(!obj.users[req.body.userName] || !(obj.users[req.body.userName].password === req.body.password)){
                return res.send(`user not found`);
            }
            res.send("OK")
            //token
//            jsonfile.writeFile(users, obj, {spaces : 4, EOL : '\r\n'}, function(err, obj){
//                if(err){
//                    return res.status(500).send(`Server error`);
//                }
//                 res.status(200).send("OK");
//            })
        }
    })
});
module.exports = router;