import { iterator as Symbol_iterator } from '../symbol/iterator';
/** Identifies an input as being an Iterable */
export function isIterable(input) {
    return input && typeof input[Symbol_iterator] === 'function';
}
//# sourceMappingURL=isIterable.js.map