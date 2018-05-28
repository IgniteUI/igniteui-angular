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
import { AbstractControlDirective } from './abstract_control_directive';
/**
 * @return {?}
 */
function unimplemented() {
    throw new Error('unimplemented');
}
/**
 * A base class that all control directive extend.
 * It binds a `FormControl` object to a DOM element.
 *
 * Used internally by Angular forms.
 *
 *
 * @abstract
 */
export class NgControl extends AbstractControlDirective {
    constructor() {
        super(...arguments);
        /**
         * \@internal
         */
        this._parent = null;
        this.name = null;
        this.valueAccessor = null;
        /**
         * \@internal
         */
        this._rawValidators = [];
        /**
         * \@internal
         */
        this._rawAsyncValidators = [];
    }
    /**
     * @return {?}
     */
    get validator() { return /** @type {?} */ (unimplemented()); }
    /**
     * @return {?}
     */
    get asyncValidator() { return /** @type {?} */ (unimplemented()); }
}
function NgControl_tsickle_Closure_declarations() {
    /**
     * \@internal
     * @type {?}
     */
    NgControl.prototype._parent;
    /** @type {?} */
    NgControl.prototype.name;
    /** @type {?} */
    NgControl.prototype.valueAccessor;
    /**
     * \@internal
     * @type {?}
     */
    NgControl.prototype._rawValidators;
    /**
     * \@internal
     * @type {?}
     */
    NgControl.prototype._rawAsyncValidators;
    /**
     * @abstract
     * @param {?} newValue
     * @return {?}
     */
    NgControl.prototype.viewToModelUpdate = function (newValue) { };
}

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmdfY29udHJvbC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2Zvcm1zL3NyYy9kaXJlY3RpdmVzL25nX2NvbnRyb2wudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7QUFTQSxPQUFPLEVBQUMsd0JBQXdCLEVBQUMsTUFBTSw4QkFBOEIsQ0FBQzs7OztBQUt0RTtJQUNFLE1BQU0sSUFBSSxLQUFLLENBQUMsZUFBZSxDQUFDLENBQUM7Q0FDbEM7Ozs7Ozs7Ozs7QUFVRCxNQUFNLGdCQUEwQixTQUFRLHdCQUF3Qjs7Ozs7O3VCQUU3QixJQUFJO29CQUNqQixJQUFJOzZCQUNtQixJQUFJOzs7OzhCQUVBLEVBQUU7Ozs7bUNBRWEsRUFBRTs7Ozs7SUFFaEUsSUFBSSxTQUFTLEtBQXVCLE1BQU0sbUJBQWMsYUFBYSxFQUFFLEVBQUMsRUFBRTs7OztJQUMxRSxJQUFJLGNBQWMsS0FBNEIsTUFBTSxtQkFBbUIsYUFBYSxFQUFFLEVBQUMsRUFBRTtDQUcxRiIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgSW5jLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuXG5pbXBvcnQge0Fic3RyYWN0Q29udHJvbERpcmVjdGl2ZX0gZnJvbSAnLi9hYnN0cmFjdF9jb250cm9sX2RpcmVjdGl2ZSc7XG5pbXBvcnQge0NvbnRyb2xDb250YWluZXJ9IGZyb20gJy4vY29udHJvbF9jb250YWluZXInO1xuaW1wb3J0IHtDb250cm9sVmFsdWVBY2Nlc3Nvcn0gZnJvbSAnLi9jb250cm9sX3ZhbHVlX2FjY2Vzc29yJztcbmltcG9ydCB7QXN5bmNWYWxpZGF0b3IsIEFzeW5jVmFsaWRhdG9yRm4sIFZhbGlkYXRvciwgVmFsaWRhdG9yRm59IGZyb20gJy4vdmFsaWRhdG9ycyc7XG5cbmZ1bmN0aW9uIHVuaW1wbGVtZW50ZWQoKTogYW55IHtcbiAgdGhyb3cgbmV3IEVycm9yKCd1bmltcGxlbWVudGVkJyk7XG59XG5cbi8qKlxuICogQSBiYXNlIGNsYXNzIHRoYXQgYWxsIGNvbnRyb2wgZGlyZWN0aXZlIGV4dGVuZC5cbiAqIEl0IGJpbmRzIGEgYEZvcm1Db250cm9sYCBvYmplY3QgdG8gYSBET00gZWxlbWVudC5cbiAqXG4gKiBVc2VkIGludGVybmFsbHkgYnkgQW5ndWxhciBmb3Jtcy5cbiAqXG4gKlxuICovXG5leHBvcnQgYWJzdHJhY3QgY2xhc3MgTmdDb250cm9sIGV4dGVuZHMgQWJzdHJhY3RDb250cm9sRGlyZWN0aXZlIHtcbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBfcGFyZW50OiBDb250cm9sQ29udGFpbmVyfG51bGwgPSBudWxsO1xuICBuYW1lOiBzdHJpbmd8bnVsbCA9IG51bGw7XG4gIHZhbHVlQWNjZXNzb3I6IENvbnRyb2xWYWx1ZUFjY2Vzc29yfG51bGwgPSBudWxsO1xuICAvKiogQGludGVybmFsICovXG4gIF9yYXdWYWxpZGF0b3JzOiBBcnJheTxWYWxpZGF0b3J8VmFsaWRhdG9yRm4+ID0gW107XG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgX3Jhd0FzeW5jVmFsaWRhdG9yczogQXJyYXk8QXN5bmNWYWxpZGF0b3J8QXN5bmNWYWxpZGF0b3JGbj4gPSBbXTtcblxuICBnZXQgdmFsaWRhdG9yKCk6IFZhbGlkYXRvckZufG51bGwgeyByZXR1cm4gPFZhbGlkYXRvckZuPnVuaW1wbGVtZW50ZWQoKTsgfVxuICBnZXQgYXN5bmNWYWxpZGF0b3IoKTogQXN5bmNWYWxpZGF0b3JGbnxudWxsIHsgcmV0dXJuIDxBc3luY1ZhbGlkYXRvckZuPnVuaW1wbGVtZW50ZWQoKTsgfVxuXG4gIGFic3RyYWN0IHZpZXdUb01vZGVsVXBkYXRlKG5ld1ZhbHVlOiBhbnkpOiB2b2lkO1xufVxuIl19