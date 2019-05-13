var express = require('express');
var router = express.Router();
const jsonfile = require('jsonfile');
let uniqid = require('uniqid');
const Validator = require('schema-validator');
var books = './data/books.json';
const baseObj = require('./../base model/model');
const schema = require('./../base model/schema');

router.get('/svc/books/v3', (req, res) => {
	const query = require('url').parse(req.url,true).query;
	const listValid = (new Validator(schema.getLists())).check( {
		getLists : {
			list : query.list,
			weeksOnList : query.weeksOnList,
			bestSellersDate : query.bestSellersDate,
			date : query.date,
			isbn : query.isbn,
			publishedDate : query.publishedDate,
			rank : query.rank,
			rankLastWeek : query.rankLastWeek,
			offset : query.offset,
			sortOrder : query.sortOrder
		}
	});
	if(listValid['_error']){
		res.send(listValid);
	}else{
		const listQuerys = Object.keys(listValid.getLists);
		jsonfile.readAll(books).then(result => {
			let data = result;
			listQuerys.forEach(item => {
				switch(item){//es patrast chi
					case 'list':
						data = result;
						break;
					case 'weeksOnList':
						data = result;
						break;
					case 'bestSellersDate':
						data = result;
						break;
					case 'date':
						data = result;
						break;
					case 'isbn':
						data = result;
						break;
					case 'publishedDate':
						data = result;
						break;
					case 'rank':
						data = result;
						break;
					case 'rankLastWeek':
						data = result;
						break;
					case 'offset':
						data = result;
						break;
					case 'sortOrder':
						data = result;
						break;
					default : 
						return
				}
			});
		}).catch(err => {
			return res.status(500).send(err);
		});
	}
});
module.exports = router;
//path/filename?id=123&option=456