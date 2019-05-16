const express = require('express');
const router = express.Router();
const jsonfile = require('jsonfile');
const filepath = '../data/users.json';

class model{

addItem(filepath, key, value) {
    jsonfile.readFile(filepath)
        .then(data => {
        data[key] = value
            jsonfile.writeFile(filepath, data, { spaces: 4, EOL: '\r\n' });
        })
        .catch(err => { console.log(err) });
}
deleteItem(filepath, id) {
    jsonfile.readFile(filepath)
        .then(data => {
            delete data[id];
            jsonfile.writeFile(filepath, data, { spaces: 4, EOL: '\r\n' });
        })
        .catch(err => { console.log(err) });
}

readItem(filepath, id) {
    jsonfile.readFile(filepath)
        .then(data => { console.log(data[id]) })
        .catch(err => { console.log(err) });
}
readAll(filepath) {
    jsonfile.readFile(filepath)
        .then(data => { return data })
        .catch(err => { console.log(err) });
}

updateItem(filepath, key, value) {
    jsonfile.readFile(filepath)
        .then(data => {
        data[key] = value;
            jsonfile.writeFile(filepath, data, { spaces: 4, EOL: '\r\n' });
        })
        .catch('serverError')
}
};

module.exports = model;