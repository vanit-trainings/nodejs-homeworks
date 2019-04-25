var express = require('express');
var router = express.Router();
const jsonfile = require('jsonfile');
var users = './data/users.json';
var cookie = './data/cookie.json';

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
    if(Object.keys(req.body).length !==2 || !req.body.userName || !req.body.password){
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
router.post('/signUp', function(req, res) {
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
                "password" : Buffer.from(req.body["password"]).toString('base64')   
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
    req.headers.token = {
        token : Buffer.from(`${req.body["password"] + req.body["userName"]}`).toString('base64'),
        date : new Date()
    }
    jsonfile.readFile(users, 'utf-8', function(err, obj){ 
        if(err){
            res.status(500).send(`Server error`);
        }else{
            if(!obj.users[req.body.userName] || 
               !(obj.users[req.body.userName].password === Buffer.from(req.body["password"]).toString('base64'))){
                return res.send(`user not found`);
            }
            jsonfile.readFile(cookie, 'utf-8', function(err, cookieObj){
                if(err){
                    res.status(500).send(`Server error`);
                }else{
                    if(cookieObj[req.headers.token.token]){
                        res.send("++++++")
                    }else{
                        const date = new Date();
                        cookieObj[req.headers.token.token] = {
                            token : req.headers.token.token,
                            date : date.getTime() + (1 * 1000 * 60 * 60 )
                        }
                        setTimeout(function(){
                            delete cookieObj[req.headers.token.token]
                            jsonfile.writeFile(cookie, cookieObj, {spaces : 4, EOL : '\r\n'}, function(err, obj){
                                if(err){
                                    res.status(500).send(`Server error`);
                                }else{
                                    res.status(200).send("OK");   
                                }
                            })
                        }, (1 * 1000 * 60 * 60))
                        jsonfile.writeFile(cookie, cookieObj, {spaces : 4, EOL : '\r\n'}, function(err, obj){
                            if(err){
                                res.status(500).send(`Server error`);
                            }else{
                                res.status(200).send("OK");   
                            }
                        })
                    }
                }
            })
        }
    })
});
module.exports = router;