const express = require('express');

const router = express.Router();
const jsonfile = require('jsonfile');

const bookReview = './data/bookReview.json';
const byTheBook = 'data/byTheBook.json';
const serverError = 500;
const OK = 200;
const five = 5;
const badRequest = 400;

router.get('/', (req, res) => {
    const lists = {
        bookReview: []
    };

    jsonfile.readFile(bookReview, (err, data) => {
        if (err) {
            return res.status(serverError).send('Server error1!');
        }
        for (let i = 0; i <= five; i++) {
            lists.bookReview.push(data[ Object.keys(data)[ i ] ]);
        }
        return res.status(OK).send(lists);
    });
});
router.get('/by-the-book', (req, res) => {
    jsonfile.readFile(byTheBook, (err, data) => {
        if (err) {
            return res.status(serverError).send('Server error!');
        }
        return res.status(OK).send(data);
    });
});
router.post('/by-the-book/add-book', (req, res) => {
    jsonfile.readFile(byTheBook, (err, data) => {
        if (err) {
            return res.status(serverError).send('Server error!');
        }
        if(!req.body.title || !req.body.photo || !req.body.description || !req.body.address || !req.body.data) {
            return res.status(badRequest).send('Bad request');
        }
        // if(Object.keys[req.body].length != 5) {
        //     return res.status(badRequest).send('Bad request');
        // }
        //return res.status(OK).send(data);
        data[ req.body.title ] = {
            title : req.body.title,
            photo : req.body.photo,
            description : req.body.description,
            address : req.body.address,
            data : req.body.data
        };
        jsonfile.writeFile(byTheBook, data, { spaces: 4, EOL: '\r\n' }, (err) => {
            if (err) {
                return res.status(serverError).send('Server error');
            }
            return res.status(OK).send('ok');
        });
    });
});
router.put('/by-the-book/update-info/:id', (req, res) => {
    jsonfile.readFile(byTheBook, (err, data) => {//req.params.id
        if (err) {
            return res.status(serverError).send('Server error!');
        }
        const schema = {
            title : "string",
            photo : "string",
            description : "string",
            address : "string",
            data : "string"
        };
        
        for(let i in req.body ) {
            if(typeof(req.body[i]) === schema[i]){
                data[req.params.id][i] = req.body[i];

            }
            
        }        
        jsonfile.writeFile(byTheBook, data, { spaces: 4, EOL: '\r\n' }, (err) => {
            if (err) {
                return res.status(serverError).send('Server error');
            }
            return res.status(OK).send('ok');
        });
    });
    
});
module.exports = router;
