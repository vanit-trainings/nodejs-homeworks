const express = require('express');
const router = express.Router();
const allBooks = "./data/allBooks.json";
const jsonfile = require('jsonfile');

const base_model = require('./../base_model/base_model.js');
const base_schema = require('./../base_model/base_schema.js');




/* GET all books */

router.get('/', function(req, res, next) {
	base_model.readAll(allBooks)
	.then(response => { return res.status(response.status).send(response.send) })
	.catch(err => { return err });
});

/* ADD new book */

router.post('/', function(req, res, next) {
	base_schema.newBookSchema(req.body)
	.then(newBook => base_model.addItem(newBook))
	.then(response => { return res.status(response.status).send(response.send) })
	.catch(err => { return res.send(err) });//catch@ petq chi voch mi angam
});

/* CHANGE book info */

router.put('/:id', function(req, res, next) {
	base_schema.changeBookSchema(req.body)
	.then(base_model.updateItem(req.body,req.params.id))
	.then(response => { return res.status(response.status).send(response.send) })
	.catch(err => { res.send(err) });//catch@ petq chi voch mi angam
	
});

/* GET one book   id => (isbn) */

router.get('/:id', function(req, res, next) {
	base_model.readItem(req.params.id)
	.then(response => {return res.status(response.status).send(response.send)})
	.catch(err => {res.send(err)})//catch@ petq chi voch mi angam errorn el a then_i mej galis
});



/* delete book */

router.delete('/:id',function(req,res){
	base_model.deleteItem(req.params.id)
	.then(response => {return res.status(response.status).send(response.send)})
	.catch(err => {res.send(err)})//catch@ petq chi voch mi angam errorn el a then_i mej galis
});

module.exports = router;
