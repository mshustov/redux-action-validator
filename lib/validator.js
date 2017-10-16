import rules from './rules';
import Traverser from './traverser';
import errorStoreFactory from './error-store';

const defaultShouldIgnore = () => false;

export default function createReduxActionValidator(options = {}) {
    const {
        shouldIgnore = defaultShouldIgnore,
        ignoreCircularRefs = false,
        validateAction = rules.validateAction,
        validateProps = rules.validateProps,
        customRules = null,
    } = options;

    const errorStore = errorStoreFactory();

    const traverser = new Traverser({
        onCircularRef: (path1, path2) => {
            if (!ignoreCircularRefs) {
                errorStore.add(rules.circularReferences.getDescription(path1, path2));
            }
        },
        onStart: (object) => {
            if (validateAction && !validateAction.isValid(object)) {
                errorStore.add(validateAction.getDescription());
            }
        },
        visit: (value, path) => {
            if (validateProps && !validateProps.isValid(value)) {
                errorStore.add(validateProps.getDescription(path));
            }
            if (customRules && !customRules.isValid(value)) {
                errorStore.add(customRules.getDescription(path));
            }
        },
    });

    const validate = (action) => {
        errorStore.reset();

        if (!shouldIgnore(action)) {
            traverser.traverse(action);
        }

        const errors = errorStore.get();

        return {
            errors,
            isValid: errors.length === 0,
        };
    };

    return validate;
}
