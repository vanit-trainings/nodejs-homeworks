const express = require("express");
const uniqid = require("uniqid");
const jsonfile = require("jsonfile");
const router = express.Router();
const crypto = require('crypto');
const Key = require("../data/.key.js");
//const TokenGenerator = require("uuid-token-generator");

const userInfoPath = "./data/users.json";
const logPassPath = "./data/logPassId.json";
const tokenIdPath = "./data/tokenId.json";

function sha512(str, key){
    let hash = crypto.createHmac("sha512", new Buffer(key));
    hash.update(str);
    const value = hash.digest('hex');
    return value;
};

function getBearerToken(userId) {
    let date = new Date();
    let BearerToken = {};
    let tokenInfo = {};
    tokenInfo.userId = userId;
    tokenInfo.iss = "accountRouter";
    tokenInfo.expiresOn = Number(date.getTime()) + (2*60*60*1000);
    BearerToken.info = tokenInfo;
    const tokenStr = sha512(JSON.stringify(tokenInfo), Key.token);
    BearerToken.sha512 = tokenStr;
    return (new Buffer(JSON.stringify(BearerToken))).toString("base64");
}

function IsJsonString(str) {
    try {
        let jsObj = JSON.parse(str);
        return jsObj;
    } 
    catch (e) {
        return false;
    }
}

function validateToken(userToken) {
    const decodeStr = (Buffer.from(userToken, "base64").toString("ascii"));
    const tokenObj = IsJsonString(decodeStr);
    if (tokenObj === false) {
        return {"statusCode":401, "statusMessage":"Unauthorized"};
    }
    const hash = tokenObj.sha512;
    const infoHash = sha512(JSON.stringify(tokenObj.info), Key.token);
    let date = new Date();
    if (!hash === infoHash || !tokenObj.info.iss === "accountRouter") {
        return {"statusCode":401, "statusMessage":"Unauthorized"};
    }
    if (tokenObj.info.expiresOn < date.getTime()) {
        return {"statusCode":401, "statusMessage":"Token update required"};
        
    }
    return {"statusCode":"OK", "userId":tokenObj.info.userId};
}

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

function getUserInfoObj(info, id) {
    let data = {};
    data.firstName = info.firstName;    
    data.lastName = info.lastName;    
    data.email = info.email;    
    data.login = info.login;    
    data.gender = info.gender;
    data.birthDate = info.birthDate;
    data.userId = id;
    return data;
}

router.post("/registr", function (req, res) {
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
        jsonfile.readFile(logPassPath, function (err, logPassDb){
            if (err) {
                return res.status(500).send("Server error");
            }
            if (!existingLogin(req.body.login, logPassDb)) {
                return res.status(409).send("Bad request: Login already busy"); 
            }
            const id = uniqid();
            userInfoDb[id] = getUserInfoObj(req.body, id);
            jsonfile.writeFile(userInfoPath, userInfoDb, {spaces: 2, EOL:"\r\n"}, function (err) {
                if (err) {
                    return res.status(500).send("Server error");
                }
                else {
                    let logPass = {};
                    logPass.password = (sha512(req.body.password, Key.pass));
                    logPass.userId = id;
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
        if (!logPassDb.hasOwnProperty(req.body.login) || logPassDb[req.body.login].password !== (sha512(req.body.password, Key.pass))) {
            return res.status(401).send("Bad request: Enter valid login or password");
        }     
        else {
            const id = logPassDb[req.body.login].userId;
            const token = getBearerToken(id);
            jsonfile.readFile(tokenIdPath, function (err, tokenIdDb) {
                if (err) {
                    return res.status(500).send("Server error");
                }
                jsonfile.writeFile(logPassPath, logPassDb, {spaces: 2, EOL:"\r\n"}, function (err) {
                    if (err) {
                        return res.status(500).send("Server error"); 
                    }
                    tokenIdDb[id] = token;
                    jsonfile.writeFile(tokenIdPath, tokenIdDb, {spaces: 2, EOL:"\r\n"}, function (err) {
                        if (err) {
                            return res.status(500).send("Server error");
                        }
                        res.writeHead(200, {"bearerToken":token});
                        res.write("OK");
                        res.end();
                        return res.send();
                    });
                });
            });
        }
    });
});

router.get("/logout", function (req, res) {
    const token = req.headers["authorizationbearer"];
    const tokenValid = validateToken(token);
    if (tokenValid.statusCode !== "OK") {
            return res.status(tokenValid.statusCode).send(tokenValid.statusMessage);
    }
    jsonfile.readFile(tokenIdPath, function (err, tokenIdDb) {
        if (err) {
            return res.status(500).send("Server error"); 
        }
        delete(tokenIdDb[tokenValid.userId]);
        jsonfile.writeFile(tokenIdPath, tokenIdDb, {spaces: 2, EOL:"\r\n"}, function (err) {
            if (err) {
                return res.status(500).send("Server error"); 
            }
            return res.status(200).send("OK");
        });
    });
});

router.get("/myInfo", function (req, res) {
    const token = req.headers["authorizationbearer"];
    const tokenValid = validateToken(token);
    if (tokenValid.statusCode !== "OK") {
        return res.status(tokenValid.statusCode).send(tokenValid.statusMessage);
    }
    jsonfile.readFile(userInfoPath, function (err, userInfoDb) {
        if (err) {
            return res.status(500).send("Server Error");
        }
        const info = userInfoDb[tokenValid.userId];
        jsonfile.writeFile(userInfoPath, userInfoDb, {spaces: 2, EOL:"\r\n"}, function (err) {
            if (err) {
                return res.status(500).send("Server Error");
            }
            return res.status(200).send(JSON.stringify(info));
        });
    });
});

router.get("/UserInfo", function (req, res) {
    const token = req.headers["authorizationbearer"];
    const tokenValid = validateToken(token);
    if (tokenValid.statusCode !== "OK") {
        return res.status(tokenValid.statusCode).send(tokenValid.statusMessage);
    }
    jsonfile.readFile(userInfoPath, function (err, userInfoDb) {
        if (err) {
            return res.status(500).send("Server Error");
        }
        let id = req.query.userId;
        if (!id) {
            id = tokenValid.userId;
        }
        const info = userInfoDb[id];
        console.log(id);
        if (!info) {
            return res.status(404).send("User not found");
        }
        jsonfile.writeFile(userInfoPath, userInfoDb, {spaces: 2, EOL:"\r\n"}, function (err) {
            if (err) {
                return res.status(500).send("Server Error");
            }
            return res.status(200).send(JSON.stringify(info));
        });
    });
});

module.exports = router;