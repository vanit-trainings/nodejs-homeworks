const express = require('express');
const router = express.Router();
const jsonfile = require('jsonfile');
const filepath = '../data/users.json';

addItem = function (filepath, key, value) {
    jsonfile.readFile(filepath)
        .then(data => {
        data[key] = value
            jsonfile.writeFile(filepath, data, { spaces: 4, EOL: '\r\n' });
        })
        .catch(err => { console.log(err) });
}
deleteItem = function (filepath, id) {
    jsonfile.readFile(filepath)
        .then(data => {
            delete data[id];
            jsonfile.writeFile(filepath, data, { spaces: 4, EOL: '\r\n' });
        })
        .catch(err => { console.log(err) });
}

readItem = function (filepath, id) {
    jsonfile.readFile(filepath)
        .then(data => { console.log(data[id]) })
        .catch(err => { console.log(err) });
}
readAll = function (filepath) {
    jsonfile.readFile(filepath)
        .then(data => { return data })
        .catch(err => { console.log(err) });
}

updateItem = function (filepath, key, value) {
    jsonfile.readFile(filepath)
        .then(data => {
        data[key] = value;
            jsonfile.writeFile(filepath, data, { spaces: 4, EOL: '\r\n' });
        })
        .catch('serverError')
}


