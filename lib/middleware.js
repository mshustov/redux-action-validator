import createReduxActionValidator from './validator';

export default function createReduxActionValidationMiddleware({ validatorOptions, onError }) {
    const validate = createReduxActionValidator(validatorOptions);
    return function reduxActionValidationMiddleware() {
        return next => action => {
            const result = validate(action);
            if (!result.isValid) {
                onError(action, result.errors);
            }

            return next(action);
        };
    }
}
