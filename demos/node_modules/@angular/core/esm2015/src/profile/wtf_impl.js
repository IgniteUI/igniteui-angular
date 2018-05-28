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
import { global } from '../util';
/**
 * A scope function for the Web Tracing Framework (WTF).
 *
 * \@experimental
 * @record
 */
export function WtfScopeFn() { }
function WtfScopeFn_tsickle_Closure_declarations() {
    /* TODO: handle strange member:
    (arg0?: any, arg1?: any): any;
    */
}
/**
 * @record
 */
function WTF() { }
function WTF_tsickle_Closure_declarations() {
    /** @type {?} */
    WTF.prototype.trace;
}
/**
 * @record
 */
function Trace() { }
function Trace_tsickle_Closure_declarations() {
    /** @type {?} */
    Trace.prototype.events;
    /** @type {?} */
    Trace.prototype.leaveScope;
    /** @type {?} */
    Trace.prototype.beginTimeRange;
    /** @type {?} */
    Trace.prototype.endTimeRange;
}
/**
 * @record
 */
export function Range() { }
function Range_tsickle_Closure_declarations() {
}
/**
 * @record
 */
function Events() { }
function Events_tsickle_Closure_declarations() {
    /** @type {?} */
    Events.prototype.createScope;
}
/**
 * @record
 */
export function Scope() { }
function Scope_tsickle_Closure_declarations() {
    /* TODO: handle strange member:
    (...args: any[] __* TODO #9100 __): any;
    */
}
let /** @type {?} */ trace;
let /** @type {?} */ events;
/**
 * @return {?}
 */
export function detectWTF() {
    const /** @type {?} */ wtf = (/** @type {?} */ (global /** TODO #9100 */) /** TODO #9100 */)['wtf'];
    if (wtf) {
        trace = wtf['trace'];
        if (trace) {
            events = trace['events'];
            return true;
        }
    }
    return false;
}
/**
 * @param {?} signature
 * @param {?=} flags
 * @return {?}
 */
export function createScope(signature, flags = null) {
    return events.createScope(signature, flags);
}
/**
 * @template T
 * @param {?} scope
 * @param {?=} returnValue
 * @return {?}
 */
export function leave(scope, returnValue) {
    trace.leaveScope(scope, returnValue);
    return returnValue;
}
/**
 * @param {?} rangeType
 * @param {?} action
 * @return {?}
 */
export function startTimeRange(rangeType, action) {
    return trace.beginTimeRange(rangeType, action);
}
/**
 * @param {?} range
 * @return {?}
 */
export function endTimeRange(range) {
    trace.endTimeRange(range);
}

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid3RmX2ltcGwuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb3JlL3NyYy9wcm9maWxlL3d0Zl9pbXBsLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7O0FBUUEsT0FBTyxFQUFDLE1BQU0sRUFBQyxNQUFNLFNBQVMsQ0FBQzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQTRCL0IscUJBQUksS0FBWSxDQUFDO0FBQ2pCLHFCQUFJLE1BQWMsQ0FBQzs7OztBQUVuQixNQUFNO0lBQ0osdUJBQU0sR0FBRyxHQUFRLG1CQUFDLE1BQWEsQ0FBQyxpQkFBaUIsb0JBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQztJQUMxRCxFQUFFLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO1FBQ1IsS0FBSyxHQUFHLEdBQUcsQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUNyQixFQUFFLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO1lBQ1YsTUFBTSxHQUFHLEtBQUssQ0FBQyxRQUFRLENBQUMsQ0FBQztZQUN6QixNQUFNLENBQUMsSUFBSSxDQUFDO1NBQ2I7S0FDRjtJQUNELE1BQU0sQ0FBQyxLQUFLLENBQUM7Q0FDZDs7Ozs7O0FBRUQsTUFBTSxzQkFBc0IsU0FBaUIsRUFBRSxRQUFhLElBQUk7SUFDOUQsTUFBTSxDQUFDLE1BQU0sQ0FBQyxXQUFXLENBQUMsU0FBUyxFQUFFLEtBQUssQ0FBQyxDQUFDO0NBQzdDOzs7Ozs7O0FBSUQsTUFBTSxnQkFBbUIsS0FBWSxFQUFFLFdBQWlCO0lBQ3RELEtBQUssQ0FBQyxVQUFVLENBQUMsS0FBSyxFQUFFLFdBQVcsQ0FBQyxDQUFDO0lBQ3JDLE1BQU0sQ0FBQyxXQUFXLENBQUM7Q0FDcEI7Ozs7OztBQUVELE1BQU0seUJBQXlCLFNBQWlCLEVBQUUsTUFBYztJQUM5RCxNQUFNLENBQUMsS0FBSyxDQUFDLGNBQWMsQ0FBQyxTQUFTLEVBQUUsTUFBTSxDQUFDLENBQUM7Q0FDaEQ7Ozs7O0FBRUQsTUFBTSx1QkFBdUIsS0FBWTtJQUN2QyxLQUFLLENBQUMsWUFBWSxDQUFDLEtBQUssQ0FBQyxDQUFDO0NBQzNCIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBJbmMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge2dsb2JhbH0gZnJvbSAnLi4vdXRpbCc7XG5cbi8qKlxuICogQSBzY29wZSBmdW5jdGlvbiBmb3IgdGhlIFdlYiBUcmFjaW5nIEZyYW1ld29yayAoV1RGKS5cbiAqXG4gKiBAZXhwZXJpbWVudGFsXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgV3RmU2NvcGVGbiB7IChhcmcwPzogYW55LCBhcmcxPzogYW55KTogYW55OyB9XG5cbmludGVyZmFjZSBXVEYge1xuICB0cmFjZTogVHJhY2U7XG59XG5cbmludGVyZmFjZSBUcmFjZSB7XG4gIGV2ZW50czogRXZlbnRzO1xuICBsZWF2ZVNjb3BlKHNjb3BlOiBTY29wZSwgcmV0dXJuVmFsdWU6IGFueSk6IGFueSAvKiogVE9ETyAjOTEwMCAqLztcbiAgYmVnaW5UaW1lUmFuZ2UocmFuZ2VUeXBlOiBzdHJpbmcsIGFjdGlvbjogc3RyaW5nKTogUmFuZ2U7XG4gIGVuZFRpbWVSYW5nZShyYW5nZTogUmFuZ2UpOiBhbnkgLyoqIFRPRE8gIzkxMDAgKi87XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgUmFuZ2Uge31cblxuaW50ZXJmYWNlIEV2ZW50cyB7XG4gIGNyZWF0ZVNjb3BlKHNpZ25hdHVyZTogc3RyaW5nLCBmbGFnczogYW55KTogU2NvcGU7XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgU2NvcGUgeyAoLi4uYXJnczogYW55W10gLyoqIFRPRE8gIzkxMDAgKi8pOiBhbnk7IH1cblxubGV0IHRyYWNlOiBUcmFjZTtcbmxldCBldmVudHM6IEV2ZW50cztcblxuZXhwb3J0IGZ1bmN0aW9uIGRldGVjdFdURigpOiBib29sZWFuIHtcbiAgY29uc3Qgd3RmOiBXVEYgPSAoZ2xvYmFsIGFzIGFueSAvKiogVE9ETyAjOTEwMCAqLylbJ3d0ZiddO1xuICBpZiAod3RmKSB7XG4gICAgdHJhY2UgPSB3dGZbJ3RyYWNlJ107XG4gICAgaWYgKHRyYWNlKSB7XG4gICAgICBldmVudHMgPSB0cmFjZVsnZXZlbnRzJ107XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIGZhbHNlO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlU2NvcGUoc2lnbmF0dXJlOiBzdHJpbmcsIGZsYWdzOiBhbnkgPSBudWxsKTogYW55IHtcbiAgcmV0dXJuIGV2ZW50cy5jcmVhdGVTY29wZShzaWduYXR1cmUsIGZsYWdzKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGxlYXZlPFQ+KHNjb3BlOiBTY29wZSk6IHZvaWQ7XG5leHBvcnQgZnVuY3Rpb24gbGVhdmU8VD4oc2NvcGU6IFNjb3BlLCByZXR1cm5WYWx1ZT86IFQpOiBUO1xuZXhwb3J0IGZ1bmN0aW9uIGxlYXZlPFQ+KHNjb3BlOiBTY29wZSwgcmV0dXJuVmFsdWU/OiBhbnkpOiBhbnkge1xuICB0cmFjZS5sZWF2ZVNjb3BlKHNjb3BlLCByZXR1cm5WYWx1ZSk7XG4gIHJldHVybiByZXR1cm5WYWx1ZTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHN0YXJ0VGltZVJhbmdlKHJhbmdlVHlwZTogc3RyaW5nLCBhY3Rpb246IHN0cmluZyk6IFJhbmdlIHtcbiAgcmV0dXJuIHRyYWNlLmJlZ2luVGltZVJhbmdlKHJhbmdlVHlwZSwgYWN0aW9uKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGVuZFRpbWVSYW5nZShyYW5nZTogUmFuZ2UpOiB2b2lkIHtcbiAgdHJhY2UuZW5kVGltZVJhbmdlKHJhbmdlKTtcbn1cbiJdfQ==