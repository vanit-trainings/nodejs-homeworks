const express = require('express');
const router = express.Router();
const jsonfile = require('jsonfile');

const base_model = require('./../base_model/base_model.js');

const AllFilms = "./data/Films_info/all_fims_info.json";


///////////////////////////////////////////////Movie//////////////////////////////////
// get Box Office Movies List
router.get('/', function(req, res, next) {
    const query = require('url').parse(req.url,true).query;
    if (!query["search"]) {
        return res.status(400).send("bad request");//
    }
    base_model.search(AllFilms,query["search"])
    .then(response => {
        return res.status(200).send(response)
    })
    .catch(err => {
        return res.send(err)
    })
});







module.exports = router;
