const express = require("express");
const router = express.Router();
const jsonfile = require('jsonfile');
const baseModel = './baseMod.js';
const crime = './data/crime.json';
const serverError = 500;
const OK = 200;

router.get('/', (req, res) => {
    jsonfile.readFile(crime, (err, data) => {
        if (err) {
            return res.status(serverError).send('Server error1!');
        }
        return res.status(OK).send(data);
    });
});
module.exports = router;