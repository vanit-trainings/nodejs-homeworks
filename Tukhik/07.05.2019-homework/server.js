var express = require('express');
var bodyParser = require('body-parser');
var MongoClient = require('mongodb').MongoClient;
var ObjectID = require('mongodb').ObjectID
var db = require('./db');
var usersController = require('./controllers/users');

var app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', function (req, res) {
  res.send('Hello NodeJS');
});

app.get('/users', usersController.all);

app.get('/users/:id', usersController.findById);

//add
app.post('/users', usersController.create);
//update
app.put('/users/:id', usersController.update);
//delete
app.delete('/artists/:id', artistsController.delete);


MongoClient.connect('mongodb://localhost:27017/myapi', function (err) {
  if (err) {
    return console.log(err);
  }
  db = database;
  app.listen(3000, function () {
    console.log('API app started');
  })
})