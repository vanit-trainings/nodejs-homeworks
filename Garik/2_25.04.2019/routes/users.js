var express = require('express');
var router = express.Router();
var users = './PROJECT_PATH/data/users.json';
const jsonfile = require('jsonfile');
let uniqid = require('uniqid');

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
    return 0;
}
isUniqUserName = (userName, arr) => {
    let uniq = true;
    for(let value of arr){
        if(value.userName === userName){
            uniq = false;
            break;
        }
    }
    return uniq;
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
    if(bodyObj !== 0){
        return res.status(bodyObj.statusCode).send(bodyObj.statusMessage);
    }
    if(!validUserName(req.body.userName) || !validPassword(req.body.password)){
        return res.status(400).send(`invalid value`);
    }
    jsonfile.readFile(users, 'utf-8', function(err, obj){ 
        if(err){
            res.status(500).send(`Server error`);
        }else{
            if(!isUniqUserName(req.body.userName, Object.values(obj.users))){
                return res.status(400).send(`repeat userName`);
            }
            obj.users[uniqid()] = {
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
hasUser = (userName, password, arr) => {
    let has = false;
    for(let value of arr){
        if(value.userName === userName && value.password === password){
            has = true;
            break;
        }
    }
    return has;
}
router.post('/signIn', function(req, res) {
    const bodyObj = testBody(req);
    if(bodyObj !== 0){
        return res.status(bodyObj.statusCode).send(bodyObj.statusMessage);
    }
    if(!validUserName(req.body.userName) || !validPassword(req.body.password)){
        return res.status(400).send(`invalid value`);
    }
    jsonfile.readFile(users, 'utf-8', function(err, obj){ 
        if(err){
            res.status(500).send(`Server error`);
        }else{
            if(!hasUser(req.body.userName, req.body.password, Object.values(obj.users))){
                return res.send(`user not found`);
            }
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