const joi = require('joi');

const dataSchema = joi.object().options({ abortEarly: false }).keys({
    firstName: joi.string().regex(/^[A-Za-z]+$/).required(),
    lastName: joi.string().regex(/^[A-Za-z]+$/).required(),
    gender: joi.string().valid([ 'male', 'female' ]).required(),
    birthDate: joi.string().regex(/^[0-9]{2}(\/)[0-9]{2}(\/)[0-9]{4}$/).required(),
    email: joi.string().email().required(),
    login: joi.string().regex(/(^(((\w+)(\.|_)?){5,16})$)|(^[a-zA-z0-9]+[._]?[a-zA-Z0-9]+[._]?[a-zA-z0-9]@[a-zA-z]+[.][a-zA-Z]{1,}$)/).required(),
    password: joi.string().regex(/^(\w+){6,16}$/).required(),
});

module.exports = dataSchema;