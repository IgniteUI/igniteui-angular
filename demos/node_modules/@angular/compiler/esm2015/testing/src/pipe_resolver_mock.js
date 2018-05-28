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
import { PipeResolver } from '@angular/compiler';
export class MockPipeResolver extends PipeResolver {
    /**
     * @param {?} refector
     */
    constructor(refector) {
        super(refector);
        this._pipes = new Map();
    }
    /**
     * Overrides the {\@link Pipe} for a pipe.
     * @param {?} type
     * @param {?} metadata
     * @return {?}
     */
    setPipe(type, metadata) { this._pipes.set(type, metadata); }
    /**
     * Returns the {\@link Pipe} for a pipe:
     * - Set the {\@link Pipe} to the overridden view when it exists or fallback to the
     * default
     * `PipeResolver`, see `setPipe`.
     * @param {?} type
     * @param {?=} throwIfNotFound
     * @return {?}
     */
    resolve(type, throwIfNotFound = true) {
        let /** @type {?} */ metadata = this._pipes.get(type);
        if (!metadata) {
            metadata = /** @type {?} */ ((super.resolve(type, throwIfNotFound)));
        }
        return metadata;
    }
}
function MockPipeResolver_tsickle_Closure_declarations() {
    /** @type {?} */
    MockPipeResolver.prototype._pipes;
}

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGlwZV9yZXNvbHZlcl9tb2NrLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvY29tcGlsZXIvdGVzdGluZy9zcmMvcGlwZV9yZXNvbHZlcl9tb2NrLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7O0FBUUEsT0FBTyxFQUFtQixZQUFZLEVBQU8sTUFBTSxtQkFBbUIsQ0FBQztBQUV2RSxNQUFNLHVCQUF3QixTQUFRLFlBQVk7Ozs7SUFHaEQsWUFBWSxRQUEwQjtRQUFJLEtBQUssQ0FBQyxRQUFRLENBQUMsQ0FBQztzQkFGekMsSUFBSSxHQUFHLEVBQXdCO0tBRVk7Ozs7Ozs7SUFLNUQsT0FBTyxDQUFDLElBQWUsRUFBRSxRQUFtQixJQUFVLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLElBQUksRUFBRSxRQUFRLENBQUMsQ0FBQyxFQUFFOzs7Ozs7Ozs7O0lBUXhGLE9BQU8sQ0FBQyxJQUFlLEVBQUUsZUFBZSxHQUFHLElBQUk7UUFDN0MscUJBQUksUUFBUSxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ3JDLEVBQUUsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQztZQUNkLFFBQVEsc0JBQUcsS0FBSyxDQUFDLE9BQU8sQ0FBQyxJQUFJLEVBQUUsZUFBZSxDQUFDLEVBQUUsQ0FBQztTQUNuRDtRQUNELE1BQU0sQ0FBQyxRQUFRLENBQUM7S0FDakI7Q0FDRiIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgSW5jLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtDb21waWxlUmVmbGVjdG9yLCBQaXBlUmVzb2x2ZXIsIGNvcmV9IGZyb20gJ0Bhbmd1bGFyL2NvbXBpbGVyJztcblxuZXhwb3J0IGNsYXNzIE1vY2tQaXBlUmVzb2x2ZXIgZXh0ZW5kcyBQaXBlUmVzb2x2ZXIge1xuICBwcml2YXRlIF9waXBlcyA9IG5ldyBNYXA8Y29yZS5UeXBlLCBjb3JlLlBpcGU+KCk7XG5cbiAgY29uc3RydWN0b3IocmVmZWN0b3I6IENvbXBpbGVSZWZsZWN0b3IpIHsgc3VwZXIocmVmZWN0b3IpOyB9XG5cbiAgLyoqXG4gICAqIE92ZXJyaWRlcyB0aGUge0BsaW5rIFBpcGV9IGZvciBhIHBpcGUuXG4gICAqL1xuICBzZXRQaXBlKHR5cGU6IGNvcmUuVHlwZSwgbWV0YWRhdGE6IGNvcmUuUGlwZSk6IHZvaWQgeyB0aGlzLl9waXBlcy5zZXQodHlwZSwgbWV0YWRhdGEpOyB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgdGhlIHtAbGluayBQaXBlfSBmb3IgYSBwaXBlOlxuICAgKiAtIFNldCB0aGUge0BsaW5rIFBpcGV9IHRvIHRoZSBvdmVycmlkZGVuIHZpZXcgd2hlbiBpdCBleGlzdHMgb3IgZmFsbGJhY2sgdG8gdGhlXG4gICAqIGRlZmF1bHRcbiAgICogYFBpcGVSZXNvbHZlcmAsIHNlZSBgc2V0UGlwZWAuXG4gICAqL1xuICByZXNvbHZlKHR5cGU6IGNvcmUuVHlwZSwgdGhyb3dJZk5vdEZvdW5kID0gdHJ1ZSk6IGNvcmUuUGlwZSB7XG4gICAgbGV0IG1ldGFkYXRhID0gdGhpcy5fcGlwZXMuZ2V0KHR5cGUpO1xuICAgIGlmICghbWV0YWRhdGEpIHtcbiAgICAgIG1ldGFkYXRhID0gc3VwZXIucmVzb2x2ZSh0eXBlLCB0aHJvd0lmTm90Rm91bmQpICE7XG4gICAgfVxuICAgIHJldHVybiBtZXRhZGF0YTtcbiAgfVxufVxuIl19