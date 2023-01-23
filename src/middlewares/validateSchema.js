export default function validateSchema(schema){
    return (req, res, next) => {
        const { error } = schema.validate(req.body, {abortEaly: false});
        if (error) {
            const errorMessages = error.details.map((e) => e.message);
            return res.status(422).send(errorMessages);
        }
        next();    
    }
}