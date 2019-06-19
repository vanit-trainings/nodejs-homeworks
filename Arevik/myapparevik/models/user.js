const Joi = require('joi');
Joi.objectId = require('joi-objectid')(Joi);

function validateUsers(user) {
    const userSchema = Joi.object({
        _id: Joi.objectId(),
        username: Joi.string().regex(/^[a-zA-Z][a-z0-9-_]{3,20}/).required(),
        email: Joi.string().email().required(),
        password: Joi.string().required()
    });

    return Joi.validate(user, userSchema);
}
module.exports = validateUsers;