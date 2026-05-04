const validate = (schema) => {
    return (req, res, next) => {
        const { error } = schema.validate(req.body, { abortEarly: true });
        if (error) {
            req.validationError = error.details[0].message;
        }
        next();
    };
};

module.exports = { validate };
