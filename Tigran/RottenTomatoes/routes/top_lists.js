const express = require('express');
const router = express.Router();
const jsonfile = require('jsonfile');

const base_model = require('./../base_model/base_model.js');
const base_schema = require('./../base_model/base_schema.js');

const TopLists = "./data/Top_level_lists/top_lists.json";

const TopMovies = "./data/Top_level_lists/top_movies.json";

const TopTvShows = "./data/Top_level_lists/top_tv_shows.json";


///////////////////////////////////////////////Top Lists//////////////////////////////////
// get Top Lists
router.get('/', function(req, res, next) {
    base_model.readAll(TopLists)
	.then(response => { return res.status(response.status).send(response.send) })
	.catch(err => { return err });
});
//get top Movies All Time
router.get('/bestofrt', function(req, res, next) {
    base_model.readMovie(TopMovies,'top_movies_all_time')
	.then(response => { return res.status(response.status).send(response.send) })
	.catch(err => { return err });
});
//get top TV shows
router.get('/tv', function(req, res, next) {
    base_model.readMovie(TopTvShows,'top_tv_shows')
	.then(response => { return res.status(response.status).send(response.send) })
	.catch(err => { return err });
});




module.exports = router;
