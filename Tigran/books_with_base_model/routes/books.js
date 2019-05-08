const express = require('express');
const router = express.Router();
const allBooks = "./data/allBooks.json";
const jsonfile = require('jsonfile');

const base_model = require('./../base_model/base_model.js')




/* GET all books */

router.get('/', function(req, res, next) {
	base_model.readAll(allBooks)
	.then(obj => { return res.status(obj.status).send(obj.send) })
	.catch(err => { return err });
});

/* ADD new book */

router.post('/', function(req, res, next) {
	//console.log(req.headers[`content-type`]);// === application/json
	// base_model.addItem()
	// .then(obj => { return res.status(obj.status).send(obj.send) })
	// .catch(err => { return err })
	const newBook = {};
	if (req.body.isbn && req.body.title && req.body.author && req.body.website) {
		for(let key in req.body){
			switch (key) {
				case "isbn":
				case "title":
				case "author":
				case "website":
				case "subtitle":
				case "published":
				case "publisher":
				case "pages":
				case "description":
					newBook[key] = req.body[key]
					break;
				default:
					res.status(400).send("bad request");
					return;
			}
		}
	}else {
		res.status(400).send("bad request");
	}
	base_model.addItem(newBook)
	.then(obj => { return res.status(obj.status).send(obj.send) })
	.catch(err => { res.send(err) });//catch@ petq chi voch mi angam
});

/* CHANGE book info */

router.put('/:id', function(req, res, next) {
	//console.log(req.headers[`content-type`]);// === application/json
	
	const newBook = data[req.params.id];
	if (req.headers[`content-type`] === "application/json" && req.body) {
		for(let key in req.body){
			switch (key) {
				case "isbn":
				case "title":
				case "author":
				case "website":
				case "subtitle":
				case "published":
				case "publisher":
				case "pages":
				case "description":
					newBook[key] = req.body[key]
					break;
				default:
					res.status(400).send("bad request");
					return
			}
		}
	}else{
		res.status(400).send("bad request");
	}
	data[newBook.isbn] = newBook;
	base_model.changeItem()
	.then
	
});

/* GET one book   id => (isbn) */

router.get('/:id', function(req, res, next) {
	base_model.readItem(req.params.id)
	.then(obj => {return res.status(obj.status).send(obj.send)})
	.catch(err => {res.send(err)})//catch@ petq chi voch mi angam errorn el a then_i mej galis
});



/* delete book */

router.delete('/:id',function(req,res){
	base_model.deleteItem(req.params.id)
	.then(obj => {return res.status(obj.status).send(obj.send)})
	.catch(err => {res.send(err)})//catch@ petq chi voch mi angam errorn el a then_i mej galis
});

module.exports = router;
