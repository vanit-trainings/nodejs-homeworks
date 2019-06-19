const express = require('express');
const router = express.Router();
const jsonfile = require('jsonfile');

const base_model = require('./../base_model/base_model.js');
const schemas = require('./../schemas/schemas.js');

const AllFilms = "./data/Films_info/all_fims_info.json";
const MovieCast = "./data/Films_info/movies_cast.json";

const schema_check_film = (obj,method = "post") => {
    if (method === "post" && (!obj["title"] && !obj["movie_info"] && !obj["cast"])) {
        return false;
    }
    const data = {};
    for (let i in obj) {
        if (typeof(obj[i]) === schemas.film_schema[i]) {
            data[i] = obj[i];
            continue;
        }
        return false;
    }
    return data;
}

///////////////////////////////////////////////Movie//////////////////////////////////
// get Movie
router.get('/:id', function(req, res, next) {
    base_model.readMovie(AllFilms, req.params.id)
    .then(allResponse => { return res.status(allResponse.status).send(allResponse.send) })
	.catch(err => { return err });
});

router.post('/', function(req, res, next) {
    const film = schema_check_film(req.body);
    if (!film) {
        return res.status(400).send("bad request");
    }
    jsonfile.readFile(AllFilms,"utf-8", (err,data) => {
        if (err) {
            return res.status(500).send("server error");
        }
        data[film.title] = film;
        jsonfile.writeFile(AllFilms, data, { spaces: 4, EOL: '\r\n' }, (err) => {
            if (err) {
                return res.status(500).send("server error");
            }
            return res.status(200).send("complete")
        })
    })
});

router.put('/:id', function(req, res, next) {
    const film = schema_check_film(req.body, "put");
    if (!film) {
        return res.status(400).send("bad request");
    }
    jsonfile.readFile(AllFilms,"utf-8", (err,data) => {
        if (err) {
            return res.status(500).send("server error");
        }
        if (!data[req.params.id]) {
            return res.status(400).send("bad request");
        }
        Object.assign(data[req.params.id], film);
        jsonfile.writeFile(AllFilms, data, { spaces: 4, EOL: '\r\n' }, (err) => {
            if (err) {
                return res.status(500).send("server error");
            }
            return res.status(200).send("complete")
        })
    })
});

router.delete('/:id', function(req, res, next) {
    jsonfile.readFile(AllFilms,"utf-8", (err,data) => {
        if (err) {
            return res.status(500).send("server error");
        }
        if (!data[req.params.id]) {
            return res.status(400).send("bad request");
        }
        delete data[req.params.id];
        jsonfile.writeFile(AllFilms, data, { spaces: 4, EOL: '\r\n' }, (err) => {
            if (err) {
                return res.status(500).send("server error");
            }
            return res.status(200).send("complete")
        })
    })
});

module.exports = router;
