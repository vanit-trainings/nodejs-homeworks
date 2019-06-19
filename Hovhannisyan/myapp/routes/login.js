const express = require('express');
//const require = require('../baseModules/baseMod.js')
const router = express.Router();
const jsonfile = require('jsonfile');
const validate = require('../baseModeles/validation')
const model = require('../baseModeles/baseMod');
const filepath = './data/users.json';
const loginedUsers = './data/loginedUsers.json';
const crypto = require('crypto');
const keyword = "barevdzez"
//const bearerToken = require('express-bearer-token');



const hash = crypto.createHash('sha512');
const serverError = 500;
const badRequest = 400;
const OK = 200;
const two = 2;
const three = 3;
const tokenSize = 32;
const sixth = 60;
const thousand = 1000;
const unauthorized = 401;
const second = two * sixth * sixth * thousand;


const toCode = function(str, key) {
    const hash = crypto.createHmac('sha512', Buffer.from(key));

    hash.update(str);
    const code = hash.digest('hex');

    return code;
};


const tokenGenerate = (username,date) => {
    const string = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789.@-_';

    let token = '';

    for (let i = 0; i < tokenSize; i++) {
        token += string[Math.floor(Math.random() * string.length)];
    }
    let x = {};
    x.username = username;
    x.date = date;
    x.token = token;
    x = JSON.stringify({username : username,date : date, token : token});
    
    Buffer.from(x).toString('base64');
    //toCode(token);
    return x;
};

router.post('/registration', (req, res) => {
    /*jsonfile.readFile(filepath, (err1, obj) => {
        if (err1) { 
            return res.status(serverError).send('Server error');
        }
        if (!validateUsername(req.body.username) || !validatePass(req.body.password) || !validateEmail(req.body.email)) {
            return res.status(badRequest).send('bad request');
        }
        if (Object.keys(req.body).length !== three) {
            return res.status(badRequest).send('bad request');
        }
        if (obj[req.body.username]) {
            return res.status(badRequest).send('Username is already existed');
        }
*/
        model.readAll(filepath)
        .then(data => { 
             res.send(data)
            // if(data[req.body.username]){
            //     return res.status(badRequest).send('Username is already existed');
            // }
            // data[req.body.username] = {
            //     username: req.body.username,
            //     password: toCode(req.body.password,keyword),
            //     // password: Buffer.from(req.body.password).toString('base64'),//kodavorel
            //     email: req.body.email
            //     };
            //     return data;
        })
        // .then(changedData=>{
        //     addItem(filepath,req.body.username,data[req.body.username])
        //     return 'OK';
        // })
        // .then(resp => {
        //     return res.send('resp');
        // })
        .catch(err=>{ res.send('err')});


        // obj[req.body.username] = {
        //     username: req.body.username,
        //     password: toCode(req.body.password,keyword),
        //     // password: Buffer.from(req.body.password).toString('base64'),//kodavorel
        //     email: req.body.email

        // };
//         jsonfile.writeFile(filepath, obj, { spaces: 4, EOL: '\r\n' }, (err) => {
//             if (err) {
//                 return res.status(serverError).send('Server error');
//             }
//             return res.status(OK).send('ok');
//         });
//     });
 });




router.post('/login', (req, res) => {
    jsonfile.readFile(filepath, (err1, obj) => {
        if (err1) {
            return res.status(serverError).send('Server error!');
        }
        if (Object.keys(req.body).length !== two || !req.body.username || !req.body.password) {
            return res.status(badRequest).send('Bad request');
        }
        //console.log(req.body.username);
        //console.log(obj[req.body.username]);
        if (!obj[req.body.username]) {
            return res.status(badRequest).send('Bad request');
        }
        if (toCode(req.body.password,keyword) !== obj[req.body.username].password) {
            return res.status(badRequest).send('Bad request');
        }
        


        jsonfile.readFile(loginedUsers, (err2, data) => {
            if (err2) {
                return res.status(serverError).send('Server error!');
            }
            if (data[req.headers.token]) {
                return res.status(OK).send('Has already logined');
            }
            const later = (new Date()).getTime() + second;

            const token = tokenGenerate(req.body.username,later);


            data[token] = {
                token
            };
            

            jsonfile.writeFile(loginedUsers, data, { spaces: 4, EOL: '\r\n' }, (err3) => {
                if (err3) {
                    return res.status(serverError).send('Server error!');
                }
                return res.status(serverError).send('You are logined');
            });
        });
    });
});
router.get('/login/authorized', (req, res) => {
    if (!req.headers.token) {
        return res.status(unauthorized).send('User is\'nt authorized!');
    }
    jsonfile.readFile(loginedUsers, (err, data) => {
        if (err) {
            return res.status(serverError).send('Server error!');
        }
        if (data[req.headers.token] === undefined) {
            return res.status(unauthorized).send('User is\'nt authorized!');
        }
        tmp = Buffer.from(req.headers.token, 'base64').toString('ascii');//2222222
        z = JSON.parse(tmp);
        //req.headers.token.
        if(z.date < (new Date()).getTime()) {
            return res.status(unauthorized).send('User isn\'t authorized');
        }
        //if (data[req.headers.token].date < (new Date()).getTime()) {
        //    return res.status(unauthorized).send('User isn\'t authorized');
        //}
        jsonfile.readFile(filepath, (err1, obj) => {
            if (err1) {
                return res.status(serverError).send('Server error!');
            }
            const user = obj[data[req.headers.token].username];

            delete user.password;
            return res.status(OK).send(user);
        });
    });
});

module.exports = router;
