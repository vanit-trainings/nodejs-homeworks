const joi = require('joi');

const dataSchema = joi.object().options({ abortEarly: false }).keys({
    phone: joi.string().regex(/(0\d{2})-\d{2}-\d{2}-\d{2}/).required(),
    email: joi.string().email().required(), 
    password: joi.string().regex(/(\w+){6,16}/).required(),
});

module.exports = dataSchema;