const express = require('express');

const router = express.Router();
const jsonfile = require('jsonfile');

const crime = './data/crime.json';
const serverError = 500;
const OK = 200;

router.get('/', (req, res) => {
    jsonfile.readFile(crime, (err, data) => {
        if (err) {
            return res.status(serverError).send('Server error!');
        }
        return res.status(OK).send(data);
    });
});
router.post('/add-book', (req, res) => {
    jsonfile.readFile(crime, (err, data) => {
        if (err) {
            return res.status(serverError).send('Server error!');
        }
        if(!req.body.title || !req.body.photo || !req.body.description || !req.body.address || !req.body.data || !req.body.author) {
            return res.status(badRequest).send('Bad request');
        }
        // if(Object.keys[req.body].length != 5) {
        //     return res.status(badRequest).send('Bad request');
        // }
        //return res.status(OK).send(data);
        let tmp1 = req.body.title;
        let str = tmp1.split(" ", 3);
        let tmp2 = str[0] + "_" + str[1] + "_" + str[2];
        data[tmp2 ] = {
            title : req.body.title,
            photo : req.body.photo,
            description : req.body.description,
            author : req.body.author,
            address : req.body.address,
            data : req.body.data
        };
        jsonfile.writeFile(crime, data, { spaces: 4, EOL: '\r\n' }, (err) => {
            if (err) {
                return res.status(serverError).send('Server error');
            }
            return res.status(OK).send('OK');
        });
    });
});
router.delete('/delete-book',(req, res) => {
    jsonfile.readFile(crime, (err, data) => {
        if (err) {
            return res.status(serverError).send('Server error!');
        }
        let title = req.body.title;
        //delete crime.title
        
        //jsonfile.writeFile(crime, delete crime.title)
        function deleteFunc(title) {
            delete data[title];
            return data;
        }
        jsonfile.writeFile(crime, deleteFunc(title), { spaces: 4, EOL: '\r\n' }, (err) => {
            if (err) {
                return res.status(serverError).send('Server error');
            }
            return res.status(OK).send('OK');
        });
    });
});
router.put('/update-info/:id', (req, res) => {
    jsonfile.readFile(crime, (err, data) => {//req.params.id
        if (err) {
            return res.status(serverError).send('Server error!');
        }
        const schema = {
            title : "string",
            photo : "string",
            description : "string",
            author : "string",
            address : "string",
            data : "string"
        };
        
        for(let i in req.body ) {
            if(typeof(req.body[i]) === schema[i]){
                data[req.params.id][i] = req.body[i];

            }
            
        }        
        jsonfile.writeFile(crime, data, { spaces: 4, EOL: '\r\n' }, (err) => {
            if (err) {
                return res.status(serverError).send('Server error');
            }
            return res.status(OK).send('ok');
        });
    });
    
});
        



module.exports = router;
