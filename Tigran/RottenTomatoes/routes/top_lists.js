const express = require('express');
const router = express.Router();
const jsonfile = require('jsonfile');

const base_model = require('./../base_model/base_model.js');

const TopLists = "./data/Top_level_lists/top_lists.json";

const TopMovies = "./data/Top_level_lists/top_movies.json";

const TopTvShows = "./data/Top_level_lists/top_tv_shows.json";

const schema_for_top_movie = {
    "rank" : "number",
    "name" : "string",
    "year" : "number",
    "num_of_reviews" : "number",
    "tomatometer" : "number"
}
///////////////////////////////////////////////Top Lists//////////////////////////////////
// get Top Lists
router.get('/', function(req, res, next) {
    base_model.readAll(TopLists)
	.then(response => { return res.status(response.status).send(response.send) })
	.catch(err => { return err });
});
//get top Movies All Time
router.get('/bestofrt', function(req, res, next) {
    base_model.readAll(TopMovies,'top_movies_all_time')
	.then(response => { return res.status(response.status).send(response.send) })
	.catch(err => { return err });
});
//
const schema_check = (obj) => {
    let changedData = {};
    for (let i in obj) {
        if (typeof(obj[i]) === schema_for_top_movie[i]) {
            changedData[i] = obj[i];
            continue;
        }
        return false;
    }
    return changedData;
}
//
router.put('/bestofrt/:id', function(req, res, next) {
    let obj = schema_check(req.body);
    if (!obj) {
        return res.status(400).send("bad requset");
    }
    jsonfile.readFile(TopMovies, "utf-8", (err, data) => {
        if (err) return res.status(500).send("server error");
        if (!data[req.params.id]) {
            return res.status(400).send("bad requset");
        }
        Object.assign(data[req.params.id], obj);
        jsonfile.writeFile(TopMovies, data, { spaces: 4, EOL: '\r\n' }, (err) => {
            if (err) {
                return res.status(500).send("server error");
            }
            return res.status(200).send("complete");
        })
    })
});
//get top TV shows
router.get('/tv', function(req, res, next) {
    base_model.readMovie(TopTvShows,'top_tv_shows')
	.then(response => { return res.status(response.status).send(response.send) })
	.catch(err => { return err });
});




module.exports = router;
