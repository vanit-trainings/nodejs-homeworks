const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const bodyParser = require('body-parser');
const pg = require('pg');
const joi = require('joi');
const statuses = require('../data/const.js');
const dataSchema = require('../data/joiSchema');

const app = express();
const port = 3000;
const Pool = require('pg').Pool;

app.use(bodyParser.json());
app.use(
    bodyParser.urlencoded({
        extended: true,
    })
);

app.listen(port, () => {
    console.log(`App running on port ${port}.`)
});

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'list.am',
    password: 'psql_js',
    port: 5432
});

const register = (request, response) => {
    if (Object.keys(request.body).length === 0) {
        return response.status(statuses.badRequest.code).json(statuses.badRequest.body);
    }

    let isValid = true;
    joi.validate(request.body, dataSchema, (err, value) => {
        if (err) {
            isValid = false;
            return response.status(statuses.badRequest.code).json(statuses.badRequest[err.details[0].context.key]);
        }
    });

    if (isValid) {
        pool.query('SELECT exists(select 1 from users where email = $1)', [request.body.email], (err, results) => {
            if (results.rows[0].exists === true) {
                return response.status(statuses.conflict.code).json(statuses.conflict.email);
            } else {
                let phone = request.body.phone;
                let email = request.body.email;
                let password = (Buffer.from(request.body.password)).toString('base64');
                pool.query('INSERT INTO users (phone, email, password) VALUES ($1, $2, $3)', [phone, email, password], (err, results) => {
                    if (err) {
                        return response.status(statuses.serverError.code).json(statuses.serverError.message);
                    } else {
                        return response.status(statuses.ok.code).json(statuses.ok.message);
                    }
                });
            }
            if (err) {
                return response.send(statuses.serverError.code).json(statuses.serverError.message);
            }
        });
    }
}

const login = (request, response) => {
    if (Object.keys(request.body).length === 0) {
        return response.status(statuses.badRequest.code).json(statuses.badRequest.body);
    }
    pool.query('SELECT password from users where email = $1', [request.body.email], (err, results) => {
        if (err) {
            return response.send(statuses.serverError.code).json(statuses.serverError.message);
        }

        if (results.rowCount === 0 || results.rows[0].password !== (Buffer.from(request.body.password)).toString('base64')) {
            return response.status(statuses.badRequest.code).json(statuses.badRequest.logPass);
        }
        return response.status(statuses.ok.code).json(statuses.ok.message);
    });
}

const add_apartmentSell = (request, response) => {
    if (Object.keys(request.body).length === 0) {
        return response.status(statuses.badRequest.code).json(statuses.badRequest.body);
    }
    pool.query('SELECT exists(select 1 from users where id = $1)', [request.params['userId']], (err, results) => {
        if (results.rows[0].exists === false) {
            return response.status(statuses.notFound.code).json({ "statusMessage": "User not found" });
        } else {
            pool.query('SELECT exists(select 1 from apartment_sell where title = $1)', [request.body.title], (err, results) => {
                if (results.rows[0].exists === true) {
                    return response.status(statuses.conflict.code).json(statuses.conflict.title);
                } else {
                    let publication_time = new Date();
                    pool.query('INSERT INTO apartment_sell (region, address, building_type, space, room, floor, floor_mount, price, price_unity, title, description, picture, owner_agent, publication_time, contact) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)',
                        [request.body.region, request.body.address, request.body.building_type, request.body.space, request.body.room, request.body.floor, request.body.floor_mount, request.body.price, request.body.price_unity, request.body.title, request.body.description, request.body.picture, request.body.owner_agent, publication_time, request.params['userId']], (err, results) => {
                            if (err) {
                                return response.status(statuses.serverError.code).json(statuses.serverError.message);
                            }
                        });
                }
                if (err) {
                    return response.status(statuses.serverError.code).json(statuses.serverError.message);
                }
                return response.status(statuses.ok.code).json(statuses.ok.message);
            });
        }
    });
}

app.post('/register', register);
app.post('/login', login);
app.post('/addAnnouncement/user/:userId/apartment/sell', add_apartmentSell);

module.exports = router;