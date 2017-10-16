import chai, { expect } from 'chai';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';

import { Traverser } from '../lib/index';

chai.use(sinonChai);

describe('redux-action-validator', () => {
    describe('Traverser', () => {
        describe('instance', () => {
            it('all handlers passed in contructor are optional', () => {
                const testObject = {
                    person: {
                        name: 'person-name',
                        age: 20,
                    },
                };
                function runner() {
                    const traverser = new Traverser();
                    traverser.traverse(testObject);
                }

                expect(runner).to.not.throw();
            });
        });
        describe('handlers', () => {
            describe('onCircularRef', () => {
                it('should be an optional argument', () => {
                    const testObject = {
                        person: {
                            name: 'person-name',
                            age: 20,
                        },
                    };
                    const traverser = new Traverser();
                    expect(() => traverser.traverse(testObject)).to.not.throw();
                });

                it('should be called with paths of both circular refs (if presert in passed object)', () => {
                    const person = {
                        name: 'person-name',
                        age: 20,
                    };

                    const position = {
                        title: 'developer',
                        person,
                    };
                    person.position = position;

                    const spy = sinon.spy();

                    const traverser = new Traverser({ onCircularRef: spy });
                    traverser.traverse(person);

                    expect(spy.calledOnce).to.be.true;
                    expect(spy).to.have.been.calledWith('[$][position][person]', '[$]');
                });

                it('shouldn\'t be called if no circular refs in passed object', () => {
                    const person = {
                        name: 'person-name',
                        age: 20,
                    };

                    const position = {
                        title: 'developer',
                    };
                    person.position = position;

                    const spy = sinon.spy();

                    const traverser = new Traverser({ onCircularRef: spy });
                    traverser.traverse(person);

                    expect(spy.notCalled).to.be.true;
                });

                it('duplicated references within different subtrees aren\'t considered as circular refs', () => {
                    const person = {
                        name: 'person-name',
                        age: 20,
                    };

                    const position = {
                        title: 'developer',
                    };
                    person.position = position;
                    person.employmentStatus = position;

                    const spy = sinon.spy();

                    const traverser = new Traverser({ onCircularRef: spy });
                    traverser.traverse(person);

                    expect(spy.notCalled).to.be.true;
                });
            });
        });

        describe('onStart', () => {
            it('should be called once on root object', () => {
                const person = {
                    name: 'person-name',
                    age: 20,
                };

                const position = {
                    title: 'developer',
                };
                person.position = position;

                const onStartSpy = sinon.spy();
                const visitSpy = sinon.spy();

                const traverser = new Traverser({
                    onStart: onStartSpy,
                    visit: visitSpy,
                });

                traverser.traverse(person);

                expect(onStartSpy).calledOnce;
                onStartSpy.calledBefore(visitSpy);
                onStartSpy.calledWith(person);
            });
        });

        describe('visit', () => {
            it('should be called with every property while traversing', () => {
                const person = {
                    name: 'person-name',
                    age: 20,
                };

                const position = {
                    title: 'developer',
                };
                person.position = position;

                const spy = sinon.spy();

                const traverser = new Traverser({ visit: spy });
                traverser.traverse(person);

                expect(spy).to.have.been.callCount(5);

                const traversingResult = spy.getCalls().map(call => call.args);

                const expected = [
                    [person, '[$]'],
                    [person.name, '[$][name]'],
                    [person.age, '[$][age]'],
                    [person.position, '[$][position]'],
                    [person.position.title, '[$][position][title]'],
                ];
                expect(traversingResult).to.have.deep.members(expected);
            });

            it('shouldn\'t visit circular refs', () => {
                const person = {
                    name: 'person-name',
                    age: 20,
                };

                const position = {
                    title: 'developer',
                    person,
                };
                person.position = position;

                const spy = sinon.spy();

                const traverser = new Traverser({ visit: spy });
                traverser.traverse(person);

                expect(spy).to.have.been.callCount(5);

                const traversingResult = spy.getCalls().map(call => call.args);

                const expected = [
                    [person, '[$]'],
                    [person.name, '[$][name]'],
                    [person.age, '[$][age]'],
                    [person.position, '[$][position]'],
                    [person.position.title, '[$][position][title]'],
                ];
                expect(traversingResult).to.have.deep.members(expected);
            });
        });
    });
});
