const Joi = require('joi');

const name = Joi.string().regex(/^([A-Z][a-z])+$/).required();

const personDataSchema = Joi.object().keys({
    firstname: name,
    lastname: name,
    fullname: Joi.string().regex(/^[A-Z]+ [A-Z]+$/i).uppercase(),
    sex: Joi.string().valid([ 'M', 'F', 'MALE', 'FEMALE' ]).uppercase().required(),
    email: Joi.string().email().lowercase().required(),
    username: Joi.string().regex(/^([a-zA-Z][a-z0-9-_]){3,16}/).required(),
    password: Joi.string().regex(/^([a-zA-Z][a-z0-9-_]){3,16}/).required()
});

module.exports = personDataSchema;
