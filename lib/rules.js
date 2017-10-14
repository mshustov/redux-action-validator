import { isFSA } from 'flux-standard-action';
import isPlainObject from 'lodash.isplainobject';
import isObject from 'lodash.isobject';

// neither object or function
const isPrimitive = value => !isObject(value);

export const validateAction = {
    isValid(object) {
        return isFSA(object);
    },
    getDescription(path = '$') {
        return {
            rule: 'isFSA',
            path,
            message: 'passed action isn\'t a FSA object'
        };
    }
};

export const validateProps = {
    isValid(obj) {
        return isPrimitive(obj) || Array.isArray(obj) || isPlainObject(obj);
    },
    getDescription(path) {
        return {
            rule: 'isPlainObject',
            path,
            message: 'property expected to be either primitive or POJO'
        };
    }
};

export const circularReferences = {
    getDescription(path1, path2) {
        return {
            rule: 'noCircularReferences',
            path: path1,
            message: `circular reference has been detected by path ${path1} and ${path2}`
        };
    }
};

const rules = {
    validateAction,
    validateProps,
    circularReferences
};

export default rules;
