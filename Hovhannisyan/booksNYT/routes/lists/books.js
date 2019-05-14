const express = require('express');

const router = express.Router();
const jsonfile = require('jsonfile');

const bookReview = './data/bookReview.json';
const byTheBook = 'data/byTheBook.json';
const serverError = 500;
const OK = 200;
const five = 5;

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

module.exports = router;
