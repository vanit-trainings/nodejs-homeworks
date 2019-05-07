const Joi = require("joi");
const express = require('express');
const router = express();
const fs = require('fs');
let dataBooks = require('../data/books.json');

function validateBooks(books) {
    const schema = {
        title: Joi.string().min(3).required(),
        authors: Joi.array().required(),
        status: Joi.string().required()
    }
    return Joi.validate(books, schema);
};

//ստանում ենք բոլոր գրքերը
exports.getAllBooks = (req, res) => {
    fs.readFile("./data/books.json", "utf-8", function (err, data) {
        if(err) return res.status(500).send("EXTERNAL SERVER ERROR");
	    res.status(200).send(dataBooks);
	});
}


//ստանում ենք 1 գիրք իր id-ով
exports.getOneBook = (req, res) => {
	fs.readFile("./data/books.json", "utf-8",  (err, data) => {
		if(err) return res.status(500).send("EXTERNAL SERVER ERROR");
		const _id = req.params.id;
		if(!dataBooks[_id]) return res.status(404).send("The book with the given ID was not found");
	    res.status(200).send(dataBooks[_id]);
	})	
}


//ստեղծում ենք նոր գիրք
createNewBook = (req, res) => {
    const {error} = validateBooks(req.body);
	fs.readFile("./data/books.json", "utf-8",  (err, data)=> {
		if(err) return res.status(500).send("EXTERNAL SERVER ERROR");
        if(error) return res.status(400).send(error.details[0].message);
        
        const _id = Date.now();
        dataBooks[_id] = {
            id: _id,
            title: req.body.title,
            isbn: req.body.isbn,
            pageCount: req.body.pageCount,
            publishedDate: req.body.publishedDate,
            thumbnailUrl: req.body.thumbnailUrl,
            description: req.body.description,
            status: req.body.status,
            authors: req.body.authors,
            categories: req.body.categories
        }
		
        fs.writeFile("./data/books.json", JSON.stringify(dataBooks,  null, 2), (err, data) => {
            if(err) return res.status(500).send("EXTERNAL SERVER ERROR");
            res.status(200).send("OK");
			console.log(dataBooks);
        })
	})
}

//թարմացնել գիրքը
updateBook = (req, res) => {
    const {error} = validateBooks(req.body);
    fs.readFile("./data/books.json", (err, data) => {
        if(err) return res.status(500).send("EXTERNAL SERVER ERROR");
        if(error) return res.status(400).send(error.details[0].message);
        
        const _id = req.params.id;
        if(!dataBooks[_id]) return res.status(404).send("The book with the given ID was not found");
        dataBooks[_id].title = req.body.title;
        dataBooks[_id].isbn = req.body.isbn;
        dataBooks[_id].age = req.body.age;
        dataBooks[_id].pageCount = req.body.pageCount;
        dataBooks[_id].publishedDate = req.body.publishedDate;
        dataBooks[_id].thumbnailUrl = req.body.thumbnailUrl;
        dataBooks[_id].description = req.body.description;
        dataBooks[_id].status = req.body.status;
        dataBooks[_id].authors = req.body.authors;
        dataBooks[_id].categories = req.body.categories;
        fs.writeFile("./data/books.json", JSON.stringify(dataBooks,  null, 2), (err, data) => {
            if(err) return res.status(500).send("EXTERNAL SERVER ERROR");
            res.status(200).send("OK");
        })
    })
};

//հեռացնել գիրքը
delateBook = (req, res) => {
    fs.readFile("./data/books.json", (err, data) => {
        if(err) {
			return res.status(500).send("EXTERNAL SERVER ERROR");
		}
        const _id = req.params.id;
        if(!dataBooks[_id]) return res.status(404).send("The book with the given ID was not found.");
        delete dataBooks[_id];
        fs.writeFile("./data/books.json", JSON.stringify(dataBooks,  null, 2), function(err, data) {
            if(err) {
                return res.status(500).send("EXTERNAL SERVER ERROR");
            }
        res.status(204).send("NO CONTENT");
        })
    })
};

module.exports = router;