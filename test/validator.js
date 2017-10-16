import sinon from 'sinon';
import chai, { expect } from 'chai';
import chaiSubset from 'chai-subset';

import { createReduxActionValidator } from '../lib/index';

chai.use(chaiSubset);

describe('redux-action-validator', () => {
    describe('createReduxActionValidator', () => {
        describe('instance', () => {
            it('all handlers passed in contructor are optional', () => {
                const testObject = { type: 'action-type' };

                function runner() {
                    const validate = createReduxActionValidator();
                    validate(testObject);
                }

                expect(runner).to.not.throw();
            });
        });

        describe('customRules option', () => {
            it('should call customRules.isValid on passed object', () => {
                const isValidStub = sinon.stub().returns(true);
                const descriptionSpy = sinon.spy();
                const validate = createReduxActionValidator({
                    customRules: {
                        isValid: isValidStub,
                        getDescription: descriptionSpy,
                    },
                });

                const testObject = {};

                validate(testObject);

                expect(isValidStub).calledOnce;
                expect(isValidStub).to.have.been.calledWith(testObject);
                expect(descriptionSpy).notCalled;
            });

            it('should call customRules.getDescription if passed object isn\'t valid ', () => {
                const isValidStub = sinon.stub().returns(false);
                const descriptionStub = sinon.stub().returns('description');
                const validate = createReduxActionValidator({
                    customRules: {
                        isValid: isValidStub,
                        getDescription: descriptionStub,
                    },
                });

                const testObject = {};

                validate(testObject);

                expect(isValidStub).calledOnce;
                expect(isValidStub).to.have.been.calledWith(testObject);
                expect(descriptionStub).calledOnce;
            });

            it('should call customRules.isValid on passed nested object', () => {
                const isValidStub = sinon.stub().returns(false);
                const descriptionStub = sinon.stub().returns('description');
                const validate = createReduxActionValidator({
                    customRules: {
                        isValid: isValidStub,
                        getDescription: descriptionStub,
                    },
                });

                const testObject = { value: 'a' };

                validate(testObject);

                expect(isValidStub).calledTwice;
            });
        });

        describe('shouldIgnore option', () => {
            it('shouldn\'t validate object if shouldIgnore returns true', () => {
                const testObject = {};
                const isValidSpy = sinon.spy();
                const shouldIgnore = object => object === testObject;
                const validate = createReduxActionValidator({
                    shouldIgnore,
                    customRules: { isValid: isValidSpy },
                });
                validate(testObject);

                expect(isValidSpy).notCalled;
            });
        });

        describe('ignoreCircularRefs option', () => {
            it('should return circular reference error if ignoreCircularRefs=false', () => {
                const testObject = { type: 'action-type' };
                testObject.payload = testObject;

                const validate = createReduxActionValidator({});

                const result = validate(testObject);

                expect(result.isValid).to.be.false;
                expect(result.errors).to.not.be.empty;
                expect(result.errors[0]).to.containSubset({
                    rule: 'noCircularReferences',
                });
            });

            it('shouldn\'t return circular error if ignoreCircularRefs=true', () => {
                const testObject = { type: 'action-type' };
                testObject.payload = testObject;

                const validate = createReduxActionValidator({
                    ignoreCircularRefs: true,
                });

                const result = validate(testObject);

                expect(result.isValid).to.be.true;
                expect(result.errors).to.be.empty;
            });

            it('shouldn\'t store errors between calls', () => {
                const testObject = { type: 'action-type' };
                testObject.payload = testObject;

                const validate = createReduxActionValidator();

                const resultFirstCall = validate(testObject);
                expect(resultFirstCall.isValid).to.be.false;
                expect(resultFirstCall.errors).to.not.be.empty;

                const resultSecondCall = validate({ type: 'another-type' });
                expect(resultSecondCall.isValid).to.be.true;
                expect(resultSecondCall.errors).to.be.empty;
            });
        });

        describe('validate()', () => {
            it('should return isValid=true if passed object doesn\'t violate any rules', () => {
                const isValidStub = sinon.stub().returns(true);
                const descriptionSpy = sinon.spy();
                const validate = createReduxActionValidator({
                    validateAction: false,
                    validateProps: false,
                    customRules: {
                        isValid: isValidStub,
                        getDescription: descriptionSpy,
                    },
                });

                const testObject = {};

                const result = validate(testObject);

                expect(result.isValid).to.be.true;
                expect(result.errors).to.be.empty;
            });

            it('should return isValid=false and description if passed object violates some rules', () => {
                const description = 'some description';
                const isValidStub = sinon.stub().returns(false);
                const descriptionStub = sinon.stub().returns(description);
                const validate = createReduxActionValidator({
                    validateAction: false,
                    validateProps: false,
                    customRules: {
                        isValid: isValidStub,
                        getDescription: descriptionStub,
                    },
                });

                const testObject = {};

                const result = validate(testObject);

                expect(result.isValid).to.be.false;
                expect(result.errors).to.not.be.empty;
                expect(result.errors).contains(description);
            });
        });
    });
});
