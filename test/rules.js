import { expect } from 'chai';
import { rules } from '../lib/index';

describe('redux-action-validator', () => {
    describe('rules', () => {
        describe('default validateProps', () => {
            it('should handle primitives as valid payload values', () => {
                const suits = [
                    'a',            // string
                    1,              // number
                    false,          // boolean
                    Symbol('1'),    // symbol
                    null,           // null
                    undefined,      // undefined
                ];
                suits.forEach((v) => {
                    expect(rules.validateProps.isValid(v)).to.be.true;
                });
            });

            it('should handle array as valid payload values', () => {
                expect(rules.validateProps.isValid([])).to.be.true;
            });

            it('should handle POJO as valid payload values', () => {
                expect(rules.validateProps.isValid({})).to.be.true;
                expect(rules.validateProps.isValid(Object.create(null))).to.be.true;
            });

            it('shouldn\'t handle other object types as valid payload values', () => {
                function Animal() {}
                const suits = [
                    new Date(),         // date
                    () => null,         // fn
                    Promise.resolve(),  // promise
                    new Animal(),       // custom type
                ];
                suits.forEach((v) => {
                    expect(rules.validateProps.isValid(v)).to.be.false;
                });
            });
        });
    });
});
