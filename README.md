## Motivation

How that problem has appeared? Working on complex client app written in js with usage of redux you may want to use different techincs that impose some restictions on the redux store state.
- Want to rehydrate store after SSR(Server Side Rendering)?
- Want to persist temporary state in LocalStorage for next re-usage?
- Want to use [Event Sourcing](https://martinfowler.com/eaaDev/EventSourcing.html) approach to be able to restore state of your app?

Well, in that case we have to have got *serializible* store.
Actually the [original redux FAQ](http://redux.js.org/docs/faq/OrganizingState.html#can-i-put-functions-promises-or-other-non-serializable-items-in-my-store-state) recommends it:
> **Can I put functions, promises, or other non-serializable items in my store state?**
>
> It is highly recommended that you only put plain serializable objects, arrays, and primitives into your store. It's technically possible to insert non-serializable items into the store, but doing so can break the ability to persist and rehydrate the contents of a store, as well as interfere with time-travel debugging.
>
>If you are okay with things like persistence and time-travel debugging potentially not working as intended, then you are totally welcome to put non-serializable items into your Redux store. Ultimately, it's your application, and how you implement it is up to you. As with many other things about Redux, just be sure you understand what tradeoffs are involved.

But we are human and can't spot problem easily. Take the most popular devtools for redux `redux-devtools` has [the next warning](https://github.com/zalmoxisus/redux-devtools-extension/blob/master/docs/Troubleshooting.md#symbols-or-other-unserializable-data-not-shown):
> **Symbols or other unserializable data not shown**:
>
> To get data which cannot be serialized by JSON.stringify, set serialize parameter.
> ...
> It will handle also date, regex, undefined, error objects, symbols, maps, sets and functions.

But that solves only the problem for the devtools, not the whole your app. And anyway next issues could be found in `redux-devtools` for 5 minutes of searching:

*handling circlar references:*
- https://github.com/gaearon/redux-devtools/issues/323
- https://github.com/gaearon/redux-devtools/pull/271
- https://github.com/gaearon/redux-devtools/issues/262

*serialization*
- https://github.com/gaearon/redux-devtools/issues/360
- https://github.com/gaearon/redux-devtools/issues/340

Now, when we aware of trade-offs, probably we want to keep store as much serializible as we can. And let the machine lint the aforementioned problems for us!

## Install
install `npm i blablabla`

## Usage
add the middleware and configure for your needs:
```js
import createReduxActionValidationMiddleware from 'redux-action-validator';

const ignoredTypes = [
    /^redux-form/
];

// setup ignoring for some actions
const shouldIgnore = action => ignoredTypes.some(rx => rx.test(action.type));

function logInvalidAction(actionObject) {
    console.error('Redux action is not valid', actionObject);
}

function logValidationError(error) {
    console.error(
        [
            `rule: ${error.rule}`,
            `path: ${error.path}`,
            `message: ${error.message}`
        ].join('\n')
    );
}

// format error as you need
function onError(action, errors) {
    console.group('validation error');
    logInvalidAction(action);
    errors.forEach(logValidationError);
    console.groupEnd();
};

const reduxActionValidationMiddleware = createReduxActionValidationMiddleware({
    validatorOptions: { shouldIgnore },
    onError
});

...
const middlewares = [reduxActionValidationMiddleware, ...];

const store = createStore(
    rootReducer,
    initialState,
    compose(
        applyMiddleware(...middlewares)
        ...
```

## Options
To adjust options to your need pass option object when initiate middleware

```js
createReduxActionValidationMiddleware({ validatorOptions, onError })
```

Next interfaces are used by utlity:
```ts
ErrorDescription {
    rule: string;       // used to setup rule name
    path: string;       // used to pass problem property. root object is denoted as $ sign
    message: string;    // used to be logged as extended message desciption
}

ValidationRule {
    isValid: (action: object) => bool;                // validate passed action. reutrn valse if not valid
    getDescription(path: string) => ErrorDescription; // return error description
}
```

### validatorOptions

#### shouldIgnore
`shouldIgnore: (action) => bool`

actions shouldn't be validated

#### ignoreCircularRefs
`ignoreCircularRefs: bool`

ignore circular reference errors

#### validateAction
`validateAction: ValidationRule || null`

Passing `null` you can disable default action validation implementation. By deafult we only validate that action meets [FSA](https://github.com/acdlite/flux-standard-action) requirements.
Also you can setup your own validation rule instead by passing object with `ValidationRule` interface.

#### validateProps
`validateProps: ValidationRule || null`

Passing `null` you can disable default action properties validation implementation. By deafult we validate all properties are plain javascript objects (POJO).
Also you can setup your own validation rule instead by passing object with `ValidationRule` interface.

#### customRules
`validateProps: ValidationRule || null`

You can extend default settings with your own validation rule by passing object with `ValidationRule` interface.

### onError
`(errors: ErrorDescription[]) => void`

callback called with validation errors
