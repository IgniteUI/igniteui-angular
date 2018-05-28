/** PURE_IMPORTS_START _symbol_observable PURE_IMPORTS_END */
import { observable as Symbol_observable } from '../symbol/observable';
/** Identifies an input as being Observable (but not necessary an Rx Observable) */
export function isInteropObservable(input) {
    return input && typeof input[Symbol_observable] === 'function';
}
//# sourceMappingURL=isInteropObservable.js.map
