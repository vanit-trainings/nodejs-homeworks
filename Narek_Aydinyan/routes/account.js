const express = require("express");
const uniqid = require("uniqid");
const jsonfile = require("jsonfile");
const router = express.Router();
const TokenGenerator = require("uuid-token-generator");

const userInfoPath = "./data/users.json";
const logPassPath = "./data/logPassId.json";
const tokenIdPath = "./data/tokenId.json";

function validateLogin(login) {
    const regLog = new RegExp(/^((\w+)(\.|_)?){5,16}/);
    if (login.match(regLog)[0] !== null) {
        return (login === login.match(regLog)[0]);
    }
    return false;
}

function existingLogin(login, data) {
    if (data[login] != undefined) {
        return false;
    }
    return true;
}

function validateEmail(email) {
    const regEmail = new RegExp(/[a-zA-z0-9]+[._]?[a-zA-Z0-9]+[._]?[a-zA-z0-9]@[a-zA-z]+[.][a-zA-Z]{1,}/);
    if (email.match(regEmail) !== null) {
    return email === email.match(regEmail)[0];
    }
    return false;
}

function existingEmail(email, data) {
    if (data.email === email) { 
        return false; 
    }
    for (var key in data) {
        if (data[key].email === email) {
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
    if (name.match(regName) !== null) {
    return (name === name.match(regName)[0]);
    }
    return false;
}

function authorization(req) {
    var token = req.headers["token"];
    var id;
    if (req.body && req.body.length !== 0) {
        id = req.body.userId;
    }
    else {
        if (req.query.userId !== null) {
            id = req.query.userId;
        }
        else {
            return "Id is missing";
        }
    }
    /*
    if(!getReqId && !postReqId){
        return "Bad request: Id missing";
    }
    if(getReqId){
        id = getReqId;
    }
    if(postReqId){
        id = postReqId;
    }
    */
    jsonfile.readFile(tokenIdPath, function(err, obj3) {
        if (err) {
            return "Server error";
        }
        if (obj3[token] !== id) {
            return "Token Id pair don't match";
        }
        return "OK";
    });
}

router.post("/registr", function(req, res) {
    if (Object.keys(req.body).length === 0) {
        return res.status(400).send("Bad request: Body is empty");
    }
    if (!validateLogin(req.body.login) && !validateEmail(req.body.login)) {
        return res.status(401).send("Bad request: Enter valid login");
    } 
    if (!validatePassword(req.body.password)) {
        return res.status(401).send("Bad request: Enter valid password");
    }
    if (!validateName(req.body.firstName) || !validateName(req.body.lastName)) {
        return res.status(401).send("Bad request: Invalid firstName or lastName ");
    }
    if (!validateEmail(req.body.email)) {
        return res.status(401).send("Bad request: Enter valid email");
    }

    jsonfile.readFile(userInfoPath, function (err, userInfoDb) {
        if (err) {
            return res.status(500).send("Server error");
        }
        if (!existingEmail(req.body.email, userInfoDb)) {
            return res.status(409).send("Bad request: Email already busy"); 
        }
        jsonfile.readFile(logPassPath, function(err, logPassDb){
            if (err) {
                return res.status(500).send("Server error");
            }
            if (!existingLogin(req.body.login, logPassDb)) {
                return res.status(409).send("Bad request: Login already busy"); 
            }
        const id = uniqid();
        const codePass = (new Buffer(req.body.password)).toString("base64");
        let data = {};
        data.firstName = req.body.firstName;    
        data.lastName = req.body.lastName;    
        data.email = req.body.email;    
        data.login = req.body.login;    
        data.gender = req.body.gender;
        data.birthDate = req.body.birthDate;
        data.userId = id;
        obj[id] = data;

        let logPass = {};    
        logPass.password = codePass;
        logPass.userId = id;

        jsonfile.writeFile(userInfoPath, userInfoDb, {spaces: 2, EOL:"\r\n"}, function (err) {
            if (err) {
                return res.status(500).send("Server error");
            }
            else {
                logPassDb[req.body.login] = logPass;
                jsonfile.writeFile(logPassPath, logPassDb, {spaces: 2, EOL:"\r\n"}, function (err) {
                    if (err) {
                    return res.status(500).send("Server error");
                    }
                    return res.status(200).send("OK");
                });
            }
        });
    });
});
});  

router.post("/login", function(req, res) {
    if (Object.keys(req.body).length === 0) {
        return res.status(400).send("Bad request: Body is empty");
    }

    jsonfile.readFile(logPassPath, function (err, logPassDb) {
        if (err) {
            return res.status(500).send("Server error"); 
        }  
        if (!logPassDb.hasOwnProperty(req.body.login) || logPassDb[req.body.login].password !== (new Buffer(req.body.password)).toString("base64")) {
            return res.status(401).send("Bad request: Enter valid login or password");
        }     
        else {
            const id = obj4[req.body.login].userId;
            const token = (new TokenGenerator(256, TokenGenerator.BASE62)).generate();
            jsonfile.readFile(tokenIdPath, function(err, tokenIdDb) {
                if (err) {
                    return res.status(500).send("Server error"); 
                }
                
                tokenIdDb[token] = id;
                jsonfile.writeFile(tokenIdPath, tokenIdDb,{spaces: 2, EOL:"\r\n"}, function (err) {
                    if (err) {
                        return res.status(500).send("Server error");
                    }
                    jsonfile.readFile(userInfoPath, function(err, userInfoDb) {
                        if (err) {
                            return res.status(500).send("Server error"); 
                        }
                        let userInfo = {};
                        userInfo.id = userInfoDb[id].userId;
                        userInfo.firstName = userInfoDb[id].firstName;
                        userInfo.lastName = userInfoDb[id].lastName;
                        userInfo.birthDate = userInfoDb[id].birthDate;
                        userInfo.gender = userInfoDb[id].gender;
                        userInfo.email = userInfoDb[id].email;
                        jsonfile.writeFile(userInfoPath, userInfoDb,{spaces: 2, EOL:"\r\n"}, function (err) {
                        if (err) {            
                            return res.status(500).send("Server error");
                        }
                        jsonfile.writeFile(logPassPath, logPassDb,{spaces: 2, EOL:"\r\n"}, function (err) {
                            if (err) {
                                return res.status(500).send("Server error");
                            }
                            res.writeHead(200, {"token":token});
                            let jsStr = JSON.stringify(userInfo);
                            res.write(jsStr);
                            res.end();
                            return res.send();
                            });
                        });    
                    });
                });
            });
        }
    });
});

router.get("/logout", function(req, res) {
    if(authorization(req) === "Server error"){
        return res.status(500).send("Server error");
    }
    if(authorization(req) === "Id is missing"){
        return res.status(400).send("Bad request: UserId is missing");
    }
    if(authorization(req) === "Token Id pair don't match"){
        return res.status(400).send("Bad request: Token Id pair don't match");
    }
    let token = req.headers['token'];
    jsonfile.readFile(tokenIdPath, function(err, obj6) {
        if(err){
            return res.status(500).send("Server error"); 
        }
        delete(obj6[token]);
        jsonfile.writeFile(tokenIdPath, obj6,{spaces: 2, EOL:"\r\n"}, function(err) {
            if(err){
                return res.status(500).send("Server error"); 
            }
            return res.status(200).send("OK");
        });
    });
});

module.exports = router;