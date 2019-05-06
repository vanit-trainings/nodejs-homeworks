
const alphaNum = Joi.string().alphanum();
const integer = Joi.number().integer();
const nameSchema = alphaNum.min(2).max(30);
const surnameSchema = alphaNum.min(2).max(50);
const birthYearSchema = integer.min(1900).max(2013);
const emailSchema = Joi.string().email();

const createUserSchema = Joi.object().keys({
    name: nameSchema.required(),
    surname: surnameSchema.required(),
    birthYear: birthYearSchema.required(),
    mail: emailSchema.required()
});

const editUserSchema = Joi.object().keys({
    name: nameSchema,
    surname: surnameSchema,
    birthYear: birthYearSchema,
    mail: emailSchema
});