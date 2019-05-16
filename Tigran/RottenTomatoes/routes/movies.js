const express = require('express');
const router = express.Router();
const jsonfile = require('jsonfile');

const base_model = require('./../base_model/base_model.js');

const AllFilms = "./data/Films_info/all_fims_info.json";
const MovieCast = "./data/Films_info/movies_cast.json";


///////////////////////////////////////////////Movie//////////////////////////////////
// get Box Office Movies List
router.get('/:id', function(req, res, next) {
    base_model.readMovie(AllFilms, req.params.id)
    .then(allResponse => { return res.status(allResponse.status).send(allResponse.send) })
	.catch(err => { return err });
});







module.exports = router;
