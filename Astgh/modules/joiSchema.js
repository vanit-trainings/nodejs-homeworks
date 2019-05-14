const joi = require('joi');

const dataSchema = joi.object().options({ abortEarly: false }).keys({
    firstName: joi.string().regex(/^[A-Z]{1}[a-z]+/).required(),
    lastName: joi.string().regex(/^[A-Z]{1}[a-z]+/).required(),
    gender: joi.string().valid([ 'male', 'female' ]).required(),
    birthDate: joi.string().regex(/^[0-9]{2}(\-)[0-9]{2}(\-)[0-9]{4}/).required(),  
    email: joi.string().email().required(), 
    login: joi.string().regex(/^((\w+)(\.|_)?){5,16}/).required(),
    password: joi.string().regex(/(\w+){6,16}/).required(),
});

module.exports = dataSchema;