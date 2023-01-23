import Joi from 'joi';

const transferSchema = Joi.object({
    value: Joi.number().required(),
    description: Joi.string().required(),
    type: Joi.string().valid("entry","exit").required()
})

export default transferSchema;