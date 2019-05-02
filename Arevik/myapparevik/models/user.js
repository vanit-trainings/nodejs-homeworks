const Joi = require('joi');

Joi.objectId = require('joi-objectid')(Joi);

const userSchema = Joi.object({
    _id: Joi.objectId(),
    username: Joi.string(),
    email: Joi.string().email().required(),
    password: Joi.string()
});

module.exports = userSchema;
