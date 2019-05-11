const express = require('express');
const router = express.Router();
const jsonfile = require('jsonfile');

const base_model = require('./../base_model/base_model.js');
const base_schema = require('./../base_model/base_schema.js');

const BoxOficeMovieList = "./data/Movie_lists/Box_ofice_movie_lists.json";
const OpeningThisWeek = "./data/Movie_lists/opening_this_week.json";
const UpcomingMoviesList = "./data/Movie_lists/upcoming_movies_list.json";
const CertifiedFreshMosies = "./data/Movie_lists/certifed_fresh_movies.json";

const UpcomingDvdList = "./data/DVD_lists/upcoming_dvd_list.json";
const NewReleases = "./data/DVD_lists/new_releases.json";
const TopDvd = "./data/DVD_lists/top_dvd.json";
const CertifiedFreshDvd = "./data/DVD_lists/certified_fresh_dvd.json";

///////////////////////////////////////////////Movie//////////////////////////////////
// get Box Office Movies List
router.get('/in-theaters', function(req, res, next) {
    base_model.readAll(BoxOficeMovieList)
	.then(response => { return res.status(response.status).send(response.send) })
	.catch(err => { return err });
});

// get Upcoming  Movies List
router.get('/upcoming', function(req, res, next) {
	base_model.readAll(UpcomingMoviesList)
	.then(response => { return res.status(response.status).send(response.send) })
	.catch(err => { return err });
});

// get Opening this Week Mosies
router.get('/opening', function(req, res, next) {
	base_model.readAll(OpeningThisWeek)
	.then(response => { return res.status(response.status).send(response.send) })
	.catch(err => { return err });
});

// get Certified fresh Mosies
router.get('/cf-in-theaters', function(req, res, next) {
	base_model.readAll(CertifiedFreshMosies)
	.then(response => { return res.status(response.status).send(response.send) })
	.catch(err => { return err });
});

////////////////////////////////////////////////////////DVD//////////////////////////////////////

// get Upcoming  DVD List
router.get('/dvd-streaming-upcoming', function(req, res, next) {
	base_model.readAll(UpcomingDvdList)
	.then(response => { return res.status(response.status).send(response.send) })
	.catch(err => { return err });
});

// get Top Dvd List
router.get('/top-dvd-streaming', function(req, res, next) {
	base_model.readAll(TopDvd)
	.then(response => { return res.status(response.status).send(response.send) })
	.catch(err => { return err });
});

// get Upcoming  Certified Fresh Dvd List
router.get('/cf-dvd-streaming', function(req, res, next) {
	base_model.readAll(CertifiedFreshDvd)
	.then(response => { return res.status(response.status).send(response.send) })
	.catch(err => { return err });
});

// get Upcoming  Certified Fresh Dvd List
router.get('/dvd-streaming-new', function(req, res, next) {
	base_model.readAll(NewReleases)
	.then(response => { return res.status(response.status).send(response.send) })
	.catch(err => { return err });
});





module.exports = router;
