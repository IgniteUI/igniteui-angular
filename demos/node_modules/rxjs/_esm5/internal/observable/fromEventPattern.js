/** PURE_IMPORTS_START _Observable,_util_isArray,_util_isFunction,_operators_map PURE_IMPORTS_END */
import { Observable } from '../Observable';
import { isArray } from '../util/isArray';
import { isFunction } from '../util/isFunction';
import { map } from '../operators/map';
/* tslint:enable:max-line-length */
/**
 * Creates an Observable from an API based on addHandler/removeHandler
 * functions.
 *
 * <span class="informal">Converts any addHandler/removeHandler API to an
 * Observable.</span>
 *
 * <img src="./img/fromEventPattern.png" width="100%">
 *
 * Creates an Observable by using the `addHandler` and `removeHandler`
 * functions to add and remove the handlers. The `addHandler` is
 * called when the output Observable is subscribed, and `removeHandler` is
 * called when the Subscription is unsubscribed.
 *
 * @example <caption>Emits clicks happening on the DOM document</caption>
 * function addClickHandler(handler) {
 *   document.addEventListener('click', handler);
 * }
 *
 * function removeClickHandler(handler) {
 *   document.removeEventListener('click', handler);
 * }
 *
 * var clicks = fromEventPattern(
 *   addClickHandler,
 *   removeClickHandler
 * );
 * clicks.subscribe(x => console.log(x));
 *
 * @see {@link from}
 * @see {@link fromEvent}
 *
 * @param {function(handler: Function): any} addHandler A function that takes
 * a `handler` function as argument and attaches it somehow to the actual
 * source of events.
 * @param {function(handler: Function, signal?: any): void} [removeHandler] An optional function that
 * takes a `handler` function as argument and removes it in case it was
 * previously attached using `addHandler`. if addHandler returns signal to teardown when remove,
 * removeHandler function will forward it.
 * @return {Observable<T>}
 * @name fromEventPattern
 */
export function fromEventPattern(addHandler, removeHandler, resultSelector) {
    if (resultSelector) {
        // DEPRECATED PATH
        return fromEventPattern(addHandler, removeHandler).pipe(map(function (args) { return isArray(args) ? resultSelector.apply(void 0, args) : resultSelector(args); }));
    }
    return new Observable(function (subscriber) {
        var handler = function () {
            var e = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                e[_i] = arguments[_i];
            }
            return subscriber.next(e.length === 1 ? e[0] : e);
        };
        var retValue;
        try {
            retValue = addHandler(handler);
        }
        catch (err) {
            subscriber.error(err);
            return undefined;
        }
        if (!isFunction(removeHandler)) {
            return undefined;
        }
        return function () { return removeHandler(handler, retValue); };
    });
}
//# sourceMappingURL=fromEventPattern.js.map
