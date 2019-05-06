const jsonfile = require('jsonfile');

const readAll = (path) => jsonfile.readFile(path);
const additem = (path, key, value) => {
    jsonfile.readFile(path)
        .then((result) => {
            result[ key ] = value;
            jsonfile.writeFile(path, result);
        }).catch((err) => err);
};

console.log(readAll('../data/books.json'));
module.exports = readAll;
// additem
// deleteitem
// readitem
// readAll
// updateItem
