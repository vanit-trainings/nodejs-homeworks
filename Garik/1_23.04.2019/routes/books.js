var express = require('express');
var router = express.Router();
var books = './data/books.json';
const baseObj = require('../base model/model');
const jsonfile = require('jsonfile');
let uniqid = require('uniqid');

testRequest = (req) => {
	let count = 0,
		statusCode,
		statusMessage;
	if(req.headers['content-type'] !== 'application/json'){
		statusCode = 400;
		statusMessage = 'Bad Request : Body not json';
		return {statusCode, statusMessage};
	}else if(Object.keys(req.body).length === 0){
		statusCode = 400;
		statusMessage = 'Bad Request : Body is empty';
		return {statusCode, statusMessage};
	}
	const bodyKeys = Object.keys(req.body);
	for(let key of bodyKeys){
		switch(key){
		case 'author':
			count++;
			break;
		case 'language':
			count++;
			break;
		case 'title':
			count++;
			break;
		case 'imageLink':
		case 'country':
		case 'link':
		case 'pages':
		case 'year':
			break;
		default:
			statusCode = 400;
			statusMessage = 'Bad Request : Missing keys, additional keys';
			return {statusCode, statusMessage};
		}
	}
	if(count !== 3){
		statusCode = 400;
		statusMessage = 'Bad Request : Missing keys, additional keys';
		return {statusCode, statusMessage};
	}
};
// //1. Create new book - required(author, language, title), imageLink, language, link, pages, year
// //4.1 post
router.post('/', function(req, res) {
	let testObj = testRequest(req);
	if(testObj){
		res.status(testObj.statusCode).send(testObj.statusMessage);
		return;
	}
	baseObj.additem(books, uniqid(), req.body)
		.then(result => {
			res.status(200).send('OK');
		}).catch((err) => {
			return res.status(500).send('Server error');
		});
});

//2. Get all books - author, language, title
router.get('/', function(req, res) {
	baseObj.readAll(books).then(result => {
		 res.status(200).send(Object.keys(result).map(item =>{
			return {'author' : result[item].author, 'language' : result[item].language, 'title' : result[item].title};
		}));
	}).catch((err) => {
		res.status(500).send('Server error');
	});
});

testRequestId = (req ) => {
	let statusCode,
		statusMessage;
	if(req.params.id === undefined){
		statusCode = 400;
		statusMessage = 'id - not provided';
		return {statusCode, statusMessage};
	}
};
//2. Update book - author, language, title, imageLink, language, link, pages, year
router.put('/:id', function(req, res){
	let testObj = testRequest(req);
	let testObjId = testRequestId(req);
	if(testObj){
		return res.status(testObj.statusCode).send(testObj.statusMessage);
	}
	if(testObjId){
		return res.status(testObjId.statusCode).send(testObjId.statusMessage);
	}
	baseObj.updateItem(books, req.params.id, req.body) 
		.then(result => {
			res.status(200).send(result);   
		}).catch(err => {
			res.status(500).send('Server error');
		});
});
//4. Get specific books details - author, language, title, imageLink, language, link, pages, year
router.get('/:id', function(req, res){
	let testObjId = testRequestId(req);
	if(testObjId){
		return res.status(testObjId.statusCode).send(testObjId.statusMessage);
	}
	baseObj.readItem(books, req.params.id) 
		.then(result => {
			res.status(200).send(result);   
		}).catch((err) => {
			res.status(500).send('Server error');
		});
});
//5. Delete book - id (request param)
router.delete('/:id', function(req, res){
	let testObjId = testRequestId(req);
	if(testObjId){
		return res.status(testObjId.statusCode).send(testObjId.statusMessage);
	}
	baseObj.deleteItem(books, req.params.id)
		.then(result => {
			res.status(200).send(result);
		}).catch(err => {
			res.status(500).send('Server error');        
		});
});
module.exports = router;
