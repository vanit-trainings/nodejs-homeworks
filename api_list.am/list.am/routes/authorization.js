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

app.get('/', (request, response) => {
    response.json({ info: 'Node.js, Express, and Postgres API' })
});

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
                const userInfo = {};
                userInfo.phone = request.body.phone;
                userInfo.email = request.body.email;
                userInfo.password = (Buffer.from(request.body.password)).toString('base64');
                pool.query('INSERT INTO users (phone, email, password) VALUES ($1, $2, $3)', [userInfo.phone, userInfo.email, userInfo.password], (err, results) => {
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


app.post('/register', register);
app.post('/login', login);

module.exports = router;