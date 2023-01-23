import Joi from 'joi';

export const signUpSchema = Joi.object({
    name: Joi.string().required(),
    email: Joi.string().email().required(),
    password: Joi.string().pattern(new RegExp('^[a-zA-Z0-9]{8,20}$')),
    confirmPassword: Joi.ref('password')
});

export const signInSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().pattern(new RegExp('^[a-zA-Z0-9]{8,20}$'))
})

