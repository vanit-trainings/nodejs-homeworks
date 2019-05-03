const jsonfile = require('jsonfile');

/* GET ALL DATA*/
const getItems = (filePath) => jsonfile.readFile(filePath);

// console.log(getItems('./data/user.json').then(data => console.log(data)).catch(err => console.log(err)));

/* GET DATA BY ID*/
const getItem = (filePath, id) => jsonfile.readFile(filePath)
    .then((obj) => obj[ id ])
    .catch((err) => err);

// console.log(getItem('./data/user.json', 'Aas567').then(data => console.log('SINGLE ITEM::', data)).catch(err => console.log(err)));

/* ADD ITEM*/
const addItem = (filePath, id) => jsonfile.readFile(filePath)
    .then((data) => {
        data[ id ] = '123';
        return jsonfile.writeFile(filePath, data);
    });

// addItem('./data/user.json', 'Aas56').
//     then(data =>
//         getItems('./data/user.json').
//             then(data => console.log(data)).
//             catch(err => console.log(err)))

/* DELETE ITEM*/
const deleteItem = (filePath, id) => jsonfile.readFile(filePath)
    .then((data) => {
        if (data[ id ]) {
            delete data[ id ];
            return jsonfile.writeFile(filePath, data);
        }
    });

// deleteItem('./data/user.json', 'Aas56').
//     then(data =>
//         getItems('./data/user.json').
//             then(data => console.log(data)).
//             catch(err => console.log(err)))

/* CHANGE ITEM*/
const changeItem = (filePath, id) => jsonfile.readFile(filePath)
    .then((data) => {
        if (data[ id ]) {
            data[ id ] = 123;
            return jsonfile.writeFile(filePath, data);
        }
    });

// changeItem('./data/user.json', 'Adfsd1111')
//     .then((data) => getItems('./data/user.json')
//         .then((data) => console.log(data))
//         .catch((err) => console.log(err)));
