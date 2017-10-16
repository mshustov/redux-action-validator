function errorStoreFactory() {
    const errors = [];

    return {
        reset() {
            errors.length = 0;
        },
        add(error) {
            errors.push(error);
        },
        get() {
            return errors;
        },
    };
}

export default errorStoreFactory;
