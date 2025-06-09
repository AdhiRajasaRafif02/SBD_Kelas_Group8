module.exports = {
    generateResponse: (status, message, data = null) => {
        return {
            status,
            message,
            data,
        };
    },

    validateInput: (input, schema) => {
        const { error } = schema.validate(input);
        return error ? error.details[0].message : null;
    },

    paginate: (array, page, limit) => {
        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + limit;
        const results = {};

        if (endIndex < array.length) {
            results.next = {
                page: page + 1,
                limit,
            };
        }

        results.results = array.slice(startIndex, endIndex);
        return results;
    },
};