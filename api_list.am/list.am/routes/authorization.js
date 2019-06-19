const express = require('express');
const router = express.Router();
const jsonfile = require('jsonfile');
const crypto = require('crypto');
const keyword = 'xabar chem';
const pg = require('pg');
const bodyParser = require('body-parser')
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
  password: 'lyusi',
  port: 5432,
});

module.exports = router;