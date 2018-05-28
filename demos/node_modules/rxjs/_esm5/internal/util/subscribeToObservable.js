/** PURE_IMPORTS_START _symbol_observable PURE_IMPORTS_END */
import { observable as Symbol_observable } from '../symbol/observable';
/**
 * Subscribes to an object that implements Symbol.observable with the given
 * Subscriber.
 * @param obj An object that implements Symbol.observable
 */
export var subscribeToObservable = function (obj) {
    return function (subscriber) {
        var obs = obj[Symbol_observable]();
        if (typeof obs.subscribe !== 'function') {
            // Should be caught by observable subscribe function error handling.
            throw new TypeError('Provided object does not correctly implement Symbol.observable');
        }
        else {
            return obs.subscribe(subscriber);
        }
    };
};
//# sourceMappingURL=subscribeToObservable.js.map
