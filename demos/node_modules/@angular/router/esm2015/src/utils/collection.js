/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes} checked by tsc
 */
/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { ɵisObservable as isObservable, ɵisPromise as isPromise } from '@angular/core';
import { from, of } from 'rxjs';
import { concatAll, every, last as lastValue, map, mergeAll } from 'rxjs/operators';
import { PRIMARY_OUTLET } from '../shared';
/**
 * @param {?} a
 * @param {?} b
 * @return {?}
 */
export function shallowEqualArrays(a, b) {
    if (a.length !== b.length)
        return false;
    for (let /** @type {?} */ i = 0; i < a.length; ++i) {
        if (!shallowEqual(a[i], b[i]))
            return false;
    }
    return true;
}
/**
 * @param {?} a
 * @param {?} b
 * @return {?}
 */
export function shallowEqual(a, b) {
    const /** @type {?} */ k1 = Object.keys(a);
    const /** @type {?} */ k2 = Object.keys(b);
    if (k1.length != k2.length) {
        return false;
    }
    let /** @type {?} */ key;
    for (let /** @type {?} */ i = 0; i < k1.length; i++) {
        key = k1[i];
        if (a[key] !== b[key]) {
            return false;
        }
    }
    return true;
}
/**
 * Flattens single-level nested arrays.
 * @template T
 * @param {?} arr
 * @return {?}
 */
export function flatten(arr) {
    return Array.prototype.concat.apply([], arr);
}
/**
 * Return the last element of an array.
 * @template T
 * @param {?} a
 * @return {?}
 */
export function last(a) {
    return a.length > 0 ? a[a.length - 1] : null;
}
/**
 * Verifys all booleans in an array are `true`.
 * @param {?} bools
 * @return {?}
 */
export function and(bools) {
    return !bools.some(v => !v);
}
/**
 * @template K, V
 * @param {?} map
 * @param {?} callback
 * @return {?}
 */
export function forEach(map, callback) {
    for (const /** @type {?} */ prop in map) {
        if (map.hasOwnProperty(prop)) {
            callback(map[prop], prop);
        }
    }
}
/**
 * @template A, B
 * @param {?} obj
 * @param {?} fn
 * @return {?}
 */
export function waitForMap(obj, fn) {
    if (Object.keys(obj).length === 0) {
        return of({});
    }
    const /** @type {?} */ waitHead = [];
    const /** @type {?} */ waitTail = [];
    const /** @type {?} */ res = {};
    forEach(obj, (a, k) => {
        const /** @type {?} */ mapped = fn(k, a).pipe(map((r) => res[k] = r));
        if (k === PRIMARY_OUTLET) {
            waitHead.push(mapped);
        }
        else {
            waitTail.push(mapped);
        }
    });
    // Closure compiler has problem with using spread operator here. So just using Array.concat.
    return of.apply(null, waitHead.concat(waitTail)).pipe(concatAll(), lastValue(), map(() => res));
}
/**
 * ANDs Observables by merging all input observables, reducing to an Observable verifying all
 * input Observables return `true`.
 * @param {?} observables
 * @return {?}
 */
export function andObservables(observables) {
    return observables.pipe(mergeAll(), every((result) => result === true));
}
/**
 * @template T
 * @param {?} value
 * @return {?}
 */
export function wrapIntoObservable(value) {
    if (isObservable(value)) {
        return value;
    }
    if (isPromise(value)) {
        // Use `Promise.resolve()` to wrap promise-like instances.
        // Required ie when a Resolver returns a AngularJS `$q` promise to correctly trigger the
        // change detection.
        return from(Promise.resolve(value));
    }
    return of(/** @type {?} */ (value));
}

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29sbGVjdGlvbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL3JvdXRlci9zcmMvdXRpbHMvY29sbGVjdGlvbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7OztBQVFBLE9BQU8sRUFBa0IsYUFBYSxJQUFJLFlBQVksRUFBRSxVQUFVLElBQUksU0FBUyxFQUFDLE1BQU0sZUFBZSxDQUFDO0FBQ3RHLE9BQU8sRUFBYSxJQUFJLEVBQUUsRUFBRSxFQUFFLE1BQU0sTUFBTSxDQUFDO0FBQzNDLE9BQU8sRUFBQyxTQUFTLEVBQUUsS0FBSyxFQUFFLElBQUksSUFBSSxTQUFTLEVBQUUsR0FBRyxFQUFFLFFBQVEsRUFBQyxNQUFNLGdCQUFnQixDQUFDO0FBRWxGLE9BQU8sRUFBQyxjQUFjLEVBQUMsTUFBTSxXQUFXLENBQUM7Ozs7OztBQUV6QyxNQUFNLDZCQUE2QixDQUFRLEVBQUUsQ0FBUTtJQUNuRCxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxLQUFLLENBQUMsQ0FBQyxNQUFNLENBQUM7UUFBQyxNQUFNLENBQUMsS0FBSyxDQUFDO0lBQ3hDLEdBQUcsQ0FBQyxDQUFDLHFCQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxNQUFNLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQztRQUNsQyxFQUFFLENBQUMsQ0FBQyxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFBQyxNQUFNLENBQUMsS0FBSyxDQUFDO0tBQzdDO0lBQ0QsTUFBTSxDQUFDLElBQUksQ0FBQztDQUNiOzs7Ozs7QUFFRCxNQUFNLHVCQUF1QixDQUFxQixFQUFFLENBQXFCO0lBQ3ZFLHVCQUFNLEVBQUUsR0FBRyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQzFCLHVCQUFNLEVB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Q0FBQyxJQUFJLENBQUMsU0FBUyxFQUFFLEVBQUUsU0FBUyxFQUFFLEVBQUUsR0FBRyxDQUFDLEdBQUcsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7Q0FDbEc7Ozs7Ozs7QUFNRCxNQUFNLHlCQUF5QixXQUF3QztJQUNyRSxNQUFNLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxRQUFRLEVBQUUsRUFBRSxLQUFLLENBQUMsQ0FBQyxNQUFXLEVBQUUsRUFBRSxDQUFDLE1BQU0sS0FBSyxJQUFJLENBQUMsQ0FBQyxDQUFDO0NBQzlFOzs7Ozs7QUFFRCxNQUFNLDZCQUFnQyxLQUF3RDtJQUU1RixFQUFFLENBQUMsQ0FBQyxZQUFZLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ3hCLE1BQU0sQ0FBQyxLQUFLLENBQUM7S0FDZDtJQUVELEVBQUUsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7Ozs7UUFJckIsTUFBTSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7S0FDckM7SUFFRCxNQUFNLENBQUMsRUFBRSxtQkFBRSxLQUFVLEVBQUMsQ0FBQztDQUN4QiIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgSW5jLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtOZ01vZHVsZUZhY3RvcnksIMm1aXNPYnNlcnZhYmxlIGFzIGlzT2JzZXJ2YWJsZSwgybVpc1Byb21pc2UgYXMgaXNQcm9taXNlfSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7T2JzZXJ2YWJsZSwgZnJvbSwgb2YgfSBmcm9tICdyeGpzJztcbmltcG9ydCB7Y29uY2F0QWxsLCBldmVyeSwgbGFzdCBhcyBsYXN0VmFsdWUsIG1hcCwgbWVyZ2VBbGx9IGZyb20gJ3J4anMvb3BlcmF0b3JzJztcblxuaW1wb3J0IHtQUklNQVJZX09VVExFVH0gZnJvbSAnLi4vc2hhcmVkJztcblxuZXhwb3J0IGZ1bmN0aW9uIHNoYWxsb3dFcXVhbEFycmF5cyhhOiBhbnlbXSwgYjogYW55W10pOiBib29sZWFuIHtcbiAgaWYgKGEubGVuZ3RoICE9PSBiLmxlbmd0aCkgcmV0dXJuIGZhbHNlO1xuICBmb3IgKGxldCBpID0gMDsgaSA8IGEubGVuZ3RoOyArK2kpIHtcbiAgICBpZiAoIXNoYWxsb3dFcXVhbChhW2ldLCBiW2ldKSkgcmV0dXJuIGZhbHNlO1xuICB9XG4gIHJldHVybiB0cnVlO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gc2hhbGxvd0VxdWFsKGE6IHtbeDogc3RyaW5nXTogYW55fSwgYjoge1t4OiBzdHJpbmddOiBhbnl9KTogYm9vbGVhbiB7XG4gIGNvbnN0IGsxID0gT2JqZWN0LmtleXMoYSk7XG4gIGNvbnN0IGsyID0gT2JqZWN0LmtleXMoYik7XG4gIGlmIChrMS5sZW5ndGggIT0gazIubGVuZ3RoKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG4gIGxldCBrZXk6IHN0cmluZztcbiAgZm9yIChsZXQgaSA9IDA7IGkgPCBrMS5sZW5ndGg7IGkrKykge1xuICAgIGtleSA9IGsxW2ldO1xuICAgIGlmIChhW2tleV0gIT09IGJba2V5XSkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgfVxuICByZXR1cm4gdHJ1ZTtcbn1cblxuLyoqXG4gKiBGbGF0dGVucyBzaW5nbGUtbGV2ZWwgbmVzdGVkIGFycmF5cy5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGZsYXR0ZW48VD4oYXJyOiBUW11bXSk6IFRbXSB7XG4gIHJldHVybiBBcnJheS5wcm90b3R5cGUuY29uY2F0LmFwcGx5KFtdLCBhcnIpO1xufVxuXG4vKipcbiAqIFJldHVybiB0aGUgbGFzdCBlbGVtZW50IG9mIGFuIGFycmF5LlxuICovXG5leHBvcnQgZnVuY3Rpb24gbGFzdDxUPihhOiBUW10pOiBUfG51bGwge1xuICByZXR1cm4gYS5sZW5ndGggPiAwID8gYVthLmxlbmd0aCAtIDFdIDogbnVsbDtcbn1cblxuLyoqXG4gKiBWZXJpZnlzIGFsbCBib29sZWFucyBpbiBhbiBhcnJheSBhcmUgYHRydWVgLlxuICovXG5leHBvcnQgZnVuY3Rpb24gYW5kKGJvb2xzOiBib29sZWFuW10pOiBib29sZWFuIHtcbiAgcmV0dXJuICFib29scy5zb21lKHYgPT4gIXYpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZm9yRWFjaDxLLCBWPihtYXA6IHtba2V5OiBzdHJpbmddOiBWfSwgY2FsbGJhY2s6ICh2OiBWLCBrOiBzdHJpbmcpID0+IHZvaWQpOiB2b2lkIHtcbiAgZm9yIChjb25zdCBwcm9wIGluIG1hcCkge1xuICAgIGlmIChtYXAuaGFzT3duUHJvcGVydHkocHJvcCkpIHtcbiAgICAgIGNhbGxiYWNrKG1hcFtwcm9wXSwgcHJvcCk7XG4gICAgfVxuICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiB3YWl0Rm9yTWFwPEEsIEI+KFxuICAgIG9iajoge1trOiBzdHJpbmddOiBBfSwgZm46IChrOiBzdHJpbmcsIGE6IEEpID0+IE9ic2VydmFibGU8Qj4pOiBPYnNlcnZhYmxlPHtbazogc3RyaW5nXTogQn0+IHtcbiAgaWYgKE9iamVjdC5rZXlzKG9iaikubGVuZ3RoID09PSAwKSB7XG4gICAgcmV0dXJuIG9mICh7fSk7XG4gIH1cblxuICBjb25zdCB3YWl0SGVhZDogT2JzZXJ2YWJsZTxCPltdID0gW107XG4gIGNvbnN0IHdhaXRUYWlsOiBPYnNlcnZhYmxlPEI+W10gPSBbXTtcbiAgY29uc3QgcmVzOiB7W2s6IHN0cmluZ106IEJ9ID0ge307XG5cbiAgZm9yRWFjaChvYmosIChhOiBBLCBrOiBzdHJpbmcpID0+IHtcbiAgICBjb25zdCBtYXBwZWQgPSBmbihrLCBhKS5waXBlKG1hcCgocjogQikgPT4gcmVzW2tdID0gcikpO1xuICAgIGlmIChrID09PSBQUklNQVJZX09VVExFVCkge1xuICAgICAgd2FpdEhlYWQucHVzaChtYXBwZWQpO1xuICAgIH0gZWxzZSB7XG4gICAgICB3YWl0VGFpbC5wdXNoKG1hcHBlZCk7XG4gICAgfVxuICB9KTtcblxuICAvLyBDbG9zdXJlIGNvbXBpbGVyIGhhcyBwcm9ibGVtIHdpdGggdXNpbmcgc3ByZWFkIG9wZXJhdG9yIGhlcmUuIFNvIGp1c3QgdXNpbmcgQXJyYXkuY29uY2F0LlxuICByZXR1cm4gb2YgLmFwcGx5KG51bGwsIHdhaXRIZWFkLmNvbmNhdCh3YWl0VGFpbCkpLnBpcGUoY29uY2F0QWxsKCksIGxhc3RWYWx1ZSgpLCBtYXAoKCkgPT4gcmVzKSk7XG59XG5cbi8qKlxuICogQU5EcyBPYnNlcnZhYmxlcyBieSBtZXJnaW5nIGFsbCBpbnB1dCBvYnNlcnZhYmxlcywgcmVkdWNpbmcgdG8gYW4gT2JzZXJ2YWJsZSB2ZXJpZnlpbmcgYWxsXG4gKiBpbnB1dCBPYnNlcnZhYmxlcyByZXR1cm4gYHRydWVgLlxuICovXG5leHBvcnQgZnVuY3Rpb24gYW5kT2JzZXJ2YWJsZXMob2JzZXJ2YWJsZXM6IE9ic2VydmFibGU8T2JzZXJ2YWJsZTxhbnk+Pik6IE9ic2VydmFibGU8Ym9vbGVhbj4ge1xuICByZXR1cm4gb2JzZXJ2YWJsZXMucGlwZShtZXJnZUFsbCgpLCBldmVyeSgocmVzdWx0OiBhbnkpID0+IHJlc3VsdCA9PT0gdHJ1ZSkpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gd3JhcEludG9PYnNlcnZhYmxlPFQ+KHZhbHVlOiBUIHwgTmdNb2R1bGVGYWN0b3J5PFQ+fCBQcm9taXNlPFQ+fCBPYnNlcnZhYmxlPFQ+KTpcbiAgICBPYnNlcnZhYmxlPFQ+IHtcbiAgaWYgKGlzT2JzZXJ2YWJsZSh2YWx1ZSkpIHtcbiAgICByZXR1cm4gdmFsdWU7XG4gIH1cblxuICBpZiAoaXNQcm9taXNlKHZhbHVlKSkge1xuICAgIC8vIFVzZSBgUHJvbWlzZS5yZXNvbHZlKClgIHRvIHdyYXAgcHJvbWlzZS1saWtlIGluc3RhbmNlcy5cbiAgICAvLyBSZXF1aXJlZCBpZSB3aGVuIGEgUmVzb2x2ZXIgcmV0dXJucyBhIEFuZ3VsYXJKUyBgJHFgIHByb21pc2UgdG8gY29ycmVjdGx5IHRyaWdnZXIgdGhlXG4gICAgLy8gY2hhbmdlIGRldGVjdGlvbi5cbiAgICByZXR1cm4gZnJvbShQcm9taXNlLnJlc29sdmUodmFsdWUpKTtcbiAgfVxuXG4gIHJldHVybiBvZiAodmFsdWUgYXMgVCk7XG59XG4iXX0=