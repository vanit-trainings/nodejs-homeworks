const express = require("express");
const router = express.Router();
const jsonfile = require('jsonfile');
const baseModel = './baseMod.js';
const bookReview = './data/bookReview.json';
const byTheBook = 'data/byTheBook.json'
const serverError = 500;
const OK = 200;

router.get('/', (req, res) => {
    let lists = {
        bookReview : [],
    } ;
    jsonfile.readFile(bookReview, (err, data) => {
        if (err) {
            return res.status(serverError).send('Server error1!');
        }
        for(let i = 0; i <= 5;i++){
           lists.bookReview.push(data[Object.keys(data)[i]]) ; 
        }
        return res.status(OK).send(lists);
    });
});
router.get('/by-the-book',(req,res) => {

    jsonfile.readFile(byTheBook, (err, data) => {
        if (err) {
            return res.status(serverError).send('Server error1!');
        }
        return res.status(OK).send(data);
    });
});

module.exports = router;