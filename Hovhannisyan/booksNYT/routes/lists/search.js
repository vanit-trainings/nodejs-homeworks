const express = require('express');
const router = express.Router();
const jsonfile = require('jsonfile');
const bookReview = './data/bookReview.json';
const serverError = 500;
const OK = 200;
const five = 5;
const badRequest = 400;

function search(path,key){
    let answer = [];
    jsonfile.readFile(path,'utf-8')
    .then(data => {
        for (let book in data){
            if (data[book].title.indexOf(key) !== -1) {
                answer.push(data[book]);
            }
        }
        return answer;
    })

}
router.get('/', function(req,res){
    const query = require('url').parse(req.url,true).query;
    if(!query["quest"]) {
        return res.status(badRequest).send("Bad request!")
    }
    search(bookReview,query["quest"])
    .then(answer => {
        return res.status(OK).send(answer)
    })
    .catch(error => {
        return res.send(error)
    })
});
module.exports = router;