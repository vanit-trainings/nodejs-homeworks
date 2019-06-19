var Users = require('../models/users');

exports.all = function (req, res) {
  Users.all(function (err, docs) {
    if (err) {
      console.log(err);
      return res.sendStatus(500);
    }
    res.send(docs);
  })
}

exports.findById = function (req, res) {
  Users.findById(req.params.id, function (err, doc) {
    if (err) {
      console.log(err);
      return res.sendStatus(500);
    }
    res.send(doc);
  })
}

exports.create = function (req, res) {
  var user = {
    username: req.body.username;
	password: req.body.password;
	email: req.body.email
  };
  Users.create(user, function (err) {
    if (err) {
      console.log(err);
      return res.sendStatus(500);
    }
    res.send(user);
  })
}

exports.update = function (req, res) {
  var newData = {
    username: req.body.username;
	password: req.body.password;
	email: req.body.email
  }
  Users.update(req.params.id, newData, function (err) {
    if (err) {
      console.log(err);
      return res.sendStatus(500);
    }
    res.sendStatus(200);
  })
}

exports.delete = function (req, res) {
  Users.delete(req.params.id, function (err) {
    if (err) {
      console.log(err);
      return res.sendStatus(500);
    }
    res.sendStatus(200);
  })
}