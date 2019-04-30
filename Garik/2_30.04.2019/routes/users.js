var express = require('express');
var router = express.Router();
const jsonfile = require('jsonfile');
const uniqId = require('uniqid');
var users = './data/users.json';
var token = './data/token.json';

validUserName = (value) => {
    return value.match(/^([a-z]|[A-Z]|[-]|[_]){1,10}$/)
}
validPassword = (value) => {
    return value.length < 10
}
creteToken = (userName) => {
    let token = `${Buffer.from(userName).toString('hex')}-${uniqId()}-${uniqId()}`
    return token.slice(0, 32)
}
decodeToken = (token) => {
    return Buffer.from(token.split('-')[0], 'hex').toString('ascii')
}
//1. register - userName, password
router.post('/register', function(req, res) {
    if(Object.keys(req.body).length !==2 || !req.body.userName || !req.body.password){
        return res.status(400).send('Bad Request : Missing keys, additional keys');
    }
    if(!validUserName(req.body.userName) || !validPassword(req.body.password)){
        return res.status(400).send('invalid userName or password');
    }
    jsonfile.readFile(users, 'utf-8', function(err, obj){ 
        if(err){
            res.status(500).send('Server error');
        }else{
            if(obj.users[req.body.userName]){
                res.status(409).send('Enter valid userName');
            }else{
                obj.users[req.body.userName] = {
                    'userName' : req.body['userName'],   
                    'password' : Buffer.from(req.body['password']).toString('base64'),
                    'userInfo' : 'This section contains examples of information sheets that you can distribute to users. The purpose of these information sheets is to assist the administrator in providing important information about the new system and how to use it. These examples can act as templates or starting points for your own information sheets.'    
                }
                jsonfile.writeFile(users, obj, {spaces : 4, EOL : '\r\n'}, function(err, obj){
                    if(err){
                        res.status(500).send('Server error');
                    }else{
                        res.status(200).send('OK');
                    }
                })
            }
        }
    })
});
//login
router.post('/login', function(req, res) {
    jsonfile.readFile(users, 'utf-8', function(err, obj){ 
        if(err){
            res.status(500).send('Server error');
        }else{
            if(!obj.users[req.body.userName] || 
                !(obj.users[req.body.userName].password === Buffer.from(req.body['password']).toString('base64'))){
                return res.status(404).send('user not found');
            }
            req.headers.token = {
                token : creteToken(req.body.userName),
                date : new Date().getTime() + (35 * 1000)
            }
            jsonfile.readFile(token, 'utf-8', function(err, tokenObj){
                if(err){
                    res.status(500).send('Server error');
                }else{
                    tokenObj[req.headers.token.token] = {
                        token : req.headers.token.token,
                        date : new Date().getTime() + (35 * 1000)
                    }
                    jsonfile.writeFile(token, tokenObj, {spaces : 4, EOL : '\r\n'}, function(err, obj){
                        if(err){
                            res.status(500).send('Server error');
                        }else{
                            res.status(200).send("OK");   
                        }
                    })
                }
            })
        }
    })
});
//userInfo
router.get('/authorized/v1/userInfo', function(req, res) {
    if(!req.headers.token){
        res.status(401).send('no token');
    }else{
        jsonfile.readFile(token, 'utf-8', function(err, tokenObj){
            if(err){
                res.status(500).send('Server error');
            }else {
                if(tokenObj[req.headers.token]){
                    if(tokenObj[req.headers.token].date >= new Date().getTime()){
                        let userName = decodeToken(req.headers.token);
                        jsonfile.readFile(users, 'utf-8', function(err, usersObj){
                            if(err){
                                res.status(500).send('Server error');
                            }else{
                                res.status(200).send(`${userName}${usersObj.users[userName].userInfo}`);
                            }
                        })
                    }else{
                        res.status(401).send('users/login');
                    }
                }else{
                    res.status(401).send('Unauthorized');
                }
            }
        })
    }
})
//logout
router.delete('/logout', function(req, res) {
    if(!req.headers.token){
        res.status(401).send('Unauthorized');
    }else{
        jsonfile.readFile(token, 'utf-8', function(err, tokenObj){
            if(err){
                res.status(500).send('Server error');
            }else {
                if(tokenObj[req.headers.token]){
                    delete tokenObj[req.headers.token]
                    jsonfile.writeFile(token, tokenObj, {spaces : 4, EOL : '\r\n'}, function(err, obj){
                        if(err){
                            res.status(500).send('Server error');
                        }else{
                            res.status(200).send("OK");   
                        }
                    })
                }else{
                    res.status(401).send('Unauthorized');
                }
            }
        })
    }
})
module.exports = router;