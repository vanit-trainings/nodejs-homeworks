const jsonfile = require('jsonfile');

const file = './data/users.json';
const Joi = require('joi');
const users = require('../models/users');

const validateUsers = users.validateUsers;

// ---------------------------------------------------------------------------------

// get all users
jsonfile.readFile(file)
    .then((data) => console.dir(data));
const { error } = validateUsers(file)
    .catch((err) => console.error(err));

if (error) {
    return res.status(400).send(error.details[ 0 ].message);
}

// ---------------------------------------------------------------------------------
// get user by id
jsonfile.readFile(file)
    .then((data) => console.dir(data[ 2 ]));
const { error } = validateUsers(data)
    .catch((err) => console.error(err));

if (error) {
    return res.status(400).send(error.details[ 0 ].message);
}
// -----------------------------------------------------------------------------------
// add user
const data = {
    id: 222,
    name: 'Anushik',
    surname: 'Karapetyan',
    age: '45',
    gender: 'male',
    email: 'karen@mail.ru'
};

jsonfile.writeFile(file, data, { flag: 'a' })
    .then((res) => console.dir('File succesfully is written'));
const { error } = validateUsers(data)
    .catch((err) => console.error(err));

if (error) {
    return res.status(400).send(error.details[ 0 ].message);
}
 
// ---------------------------------------------------------------------------------

// update user
const user = {
    id: 999,
    name: 'Anahit',
    surname: 'Vardanyan'
};

jsonfile.readFile(file)
    .then((data) => {
        const { error } = validateUsers(user);

        data[ 2 ].id = user.id;
        data[ 2 ].name = user.name;
        data[ 2 ].surname = user.surname;
        return jsonfile.writeFile(file, data);
    })
    .catch((err) => console.error(err));
if (error) {
    return res.status(400).send(error.details[ 0 ].message);
}

// ---------------------------------------------------------------------------


// delate user
jsonfile.readFile(file)
    .then((data) => {
        const { error } = validateUsers(user);

        if (data[ 2 ]) {
            delete (data[ 2 ]);
            console.dir('User succesfully is deleted');
        }
    })
    .catch((err) => console.error(err));
if (error) {
    return res.status(400).send(error.details[ 0 ].message);
}
        
