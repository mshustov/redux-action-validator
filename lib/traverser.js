import isObjectLike from 'lodash.isobjectlike';
import toPairs from 'lodash.topairs';

const noop = () => null;

class Traverser {
    constructor({ visit = noop, onCircularRef = noop, onStart = noop, onEnd = noop } = {}) {
        this.onCircularRef = onCircularRef;
        this.onStart = onStart;
        this.onEnd = onEnd;
        this.visit = visit;
    }

    traverse(object) {
        this.onStart(object);
        this._traverse(new WeakMap(), { $: object });
        this.onEnd(object);
    }

    // sometimes objects could have the same references on sibling levels
    // so we use stack to track nesting
    _traverse(visited, obj, prefix = '') {
        toPairs(obj).forEach(([key, value]) => {
            const path = `${prefix}[${key}]`;

            if (isObjectLike(value)) {
                if (this.onEnter(visited, value, path)) {
                    return;
                }

                this.visit(value, path);
                this._traverse(visited, value, path);

                this.onLeave(visited, value);
            } else {
                this.visit(value, path);
            }
        });
    }

    onEnter(visited, object, path) {
        const prevPath = visited.get(object);
        if (prevPath !== undefined) {
            this.onCircularRef(path, prevPath);
            return true;
        }

        visited.set(object, path);

        return false;
    }

    onLeave(visited, obj) {
        visited.delete(obj);
    }
}

export default Traverser;
