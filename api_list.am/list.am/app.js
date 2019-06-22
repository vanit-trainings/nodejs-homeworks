const express = require('express');
const bodyParser = require('body-parser');
const joi = require('joi');
const statuses = require('/data/const.js');
const dataSchema = require('/data/joiSchema');

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

const getUsers = (request, response) => {
  pool.query('SELECT * FROM users ORDER BY id ASC', (error, results) => {
    if (error) {
      throw error
    }
    response.status(200).json(results.rows)
  })
};

const getUserById = (request, response) => {
    id = request.params.id;
    pool.query('SELECT * FROM users WHERE id = $1', [id], (error, results) => {//$1 ??
      if (error) {
        throw error
      }
      response.status(200).json(results.rows)
    })
}

const getUserByName = (request, response) => {//porcnakan (ashxatum a)
    name = request.params.name;
    pool.query('SELECT * FROM users WHERE name = $1', [name], (error, results) => {//$1 ??
      if (error) {
        throw error
      }
      response.status(200).json(results.rows);
    })
}

app.get('/users', getUsers);