const express = require('express');
const router = express.Router();
const jsonfile = require('jsonfile');

const base_model = require('./../base_model/base_model.js');

const BoxOficeMovieList = "./data/Movie_lists/Box_ofice_movie_lists.json";
const OpeningThisWeek = "./data/Movie_lists/opening_this_week.json";
const UpcomingMoviesList = "./data/Movie_lists/upcoming_movies_list.json";
const CertifiedFreshMosies = "./data/Movie_lists/certifed_fresh_movies.json";

const UpcomingDvdList = "./data/DVD_lists/upcoming_dvd_list.json";
const NewReleases = "./data/DVD_lists/new_releases.json";
const TopDvd = "./data/DVD_lists/top_dvd.json";
const CertifiedFreshDvd = "./data/DVD_lists/certified_fresh_dvd.json";

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
