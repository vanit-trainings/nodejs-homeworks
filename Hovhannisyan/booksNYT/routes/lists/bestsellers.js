const express = require("express");
const router = express.Router();
const jsonfile = require('jsonfile');
const baseModel = './baseMod.js';
const combine = './data/combinedPrint.json';
const hardcover = './data/hardcoverFiction.json';
const bookReview = './data/bookReview.json';
const serverError = 500;
const OK = 200;

router.get('/', (req, res) => {
    let lists = {
        combine : [],
        hardcover : []
    } ;
    jsonfile.readFile(combine, (err, data) => {
        if (err) {
            return res.status(serverError).send('Server error1!');
        }
        for(let i = 0; i < 5;i++){
           lists.combine.push(data[Object.keys(data)[i]]) ; 
        }
        jsonfile.readFile(hardcover, (err, data2) => {
            if (err) {
                return res.status(serverError).send('Server error2!');
            }
            for(let i = 0; i < 5;i++){
                lists.hardcover.push(data2[Object.keys(data2)[i]]) ; 
            }
            return res.status(OK).send(lists);
        });
    });
});

router.get('/combined-print-and-e-book-fiction', (req, res) => {
    jsonfile.readFile(combine, (err, data) => {
        if (err) {
            return res.status(serverError).send('Server error!');
        }
        return res.status(OK).send(data);
    });

});
router.get('/hardcover-fiction', (req, res) => {
    jsonfile.readFile(hardcover, (err, data) => {
        if (err) {
            return res.status(serverError).send('Server error!');
        }
        return res.status(OK).send(data);
    });
});

module.exports = router;