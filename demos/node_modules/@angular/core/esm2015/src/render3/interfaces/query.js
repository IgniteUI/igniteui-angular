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
/**
 * Used for tracking queries (e.g. ViewChild, ContentChild).
 * @record
 */
export function LQueries() { }
function LQueries_tsickle_Closure_declarations() {
    /**
     * Used to ask queries if those should be cloned to the child element.
     *
     * For example in the case of deep queries the `child()` returns
     * queries for the child node. In case of shallow queries it returns
     * `null`.
     * @type {?}
     */
    LQueries.prototype.child;
    /**
     * Notify `LQueries` that a new `LNode` has been created and needs to be added to query results
     * if matching query predicate.
     * @type {?}
     */
    LQueries.prototype.addNode;
    /**
     * Notify `LQueries` that a  `LNode` has been created and needs to be added to query results
     * if matching query predicate.
     * @type {?}
     */
    LQueries.prototype.container;
    /**
     * Notify `LQueries` that a new view was created and is being entered in the creation mode.
     * This allow queries to prepare space for matching nodes from views.
     * @type {?}
     */
    LQueries.prototype.enterView;
    /**
     * Notify `LQueries` that an `LViewNode` has been removed from `LContainerNode`. As a result all
     * the matching nodes from this view should be removed from container's queries.
     * @type {?}
     */
    LQueries.prototype.removeView;
    /**
     * Add additional `QueryList` to track.
     *
     * \@param queryList `QueryList` to update with changes.
     * \@param predicate Either `Type` or selector array of [key, value] predicates.
     * \@param descend If true the query will recursively apply to the children.
     * \@param read Indicates which token should be read from DI for this query.
     * @type {?}
     */
    LQueries.prototype.track;
}
/**
 * @template T
 */
export class QueryReadType {
}
function QueryReadType_tsickle_Closure_declarations() {
    /** @type {?} */
    QueryReadType.prototype.defeatStructuralTyping;
}
// Note: This hack is necessary so we don't erroneously get a circular dependency
// failure based on types.
export const /** @type {?} */ unusedValueExportToPlacateAjd = 1;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicXVlcnkuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb3JlL3NyYy9yZW5kZXIzL2ludGVyZmFjZXMvcXVlcnkudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQTREQSxNQUFNO0NBQWdFOzs7Ozs7O0FBSXRFLE1BQU0sQ0FBQyx1QkFBTSw2QkFBNkIsR0FBRyxDQUFDLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIEluYy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7UXVlcnlMaXN0fSBmcm9tICcuLi8uLi9saW5rZXInO1xuaW1wb3J0IHtUeXBlfSBmcm9tICcuLi8uLi90eXBlJztcbmltcG9ydCB7TE5vZGV9IGZyb20gJy4vbm9kZSc7XG5cbi8qKiBVc2VkIGZvciB0cmFja2luZyBxdWVyaWVzIChlLmcuIFZpZXdDaGlsZCwgQ29udGVudENoaWxkKS4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgTFF1ZXJpZXMge1xuICAvKipcbiAgICogVXNlZCB0byBhc2sgcXVlcmllcyBpZiB0aG9zZSBzaG91bGQgYmUgY2xvbmVkIHRvIHRoZSBjaGlsZCBlbGVtZW50LlxuICAgKlxuICAgKiBGb3IgZXhhbXBsZSBpbiB0aGUgY2FzZSBvZiBkZWVwIHF1ZXJpZXMgdGhlIGBjaGlsZCgpYCByZXR1cm5zXG4gICAqIHF1ZXJpZXMgZm9yIHRoZSBjaGlsZCBub2RlLiBJbiBjYXNlIG9mIHNoYWxsb3cgcXVlcmllcyBpdCByZXR1cm5zXG4gICAqIGBudWxsYC5cbiAgICovXG4gIGNoaWxkKCk6IExRdWVyaWVzfG51bGw7XG5cbiAgLyoqXG4gICAqIE5vdGlmeSBgTFF1ZXJpZXNgIHRoYXQgYSBuZXcgYExOb2RlYCBoYXMgYmVlbiBjcmVhdGVkIGFuZCBuZWVkcyB0byBiZSBhZGRlZCB0byBxdWVyeSByZXN1bHRzXG4gICAqIGlmIG1hdGNoaW5nIHF1ZXJ5IHByZWRpY2F0ZS5cbiAgICovXG4gIGFkZE5vZGUobm9kZTogTE5vZGUpOiB2b2lkO1xuXG4gIC8qKlxuICAgKiBOb3RpZnkgYExRdWVyaWVzYCB0aGF0IGEgIGBMTm9kZWAgaGFzIGJlZW4gY3JlYXRlZCBhbmQgbmVlZHMgdG8gYmUgYWRkZWQgdG8gcXVlcnkgcmVzdWx0c1xuICAgKiBpZiBtYXRjaGluZyBxdWVyeSBwcmVkaWNhdGUuXG4gICAqL1xuICBjb250YWluZXIoKTogTFF1ZXJpZXN8bnVsbDtcblxuICAvKipcbiAgICogTm90aWZ5IGBMUXVlcmllc2AgdGhhdCBhIG5ldyB2aWV3IHdhcyBjcmVhdGVkIGFuZCBpcyBiZWluZyBlbnRlcmVkIGluIHRoZSBjcmVhdGlvbiBtb2RlLlxuICAgKiBUaGlzIGFsbG93IHF1ZXJpZXMgdG8gcHJlcGFyZSBzcGFjZSBmb3IgbWF0Y2hpbmcgbm9kZXMgZnJvbSB2aWV3cy5cbiAgICovXG4gIGVudGVyVmlldyhuZXdWaWV3SW5kZXg6IG51bWJlcik6IExRdWVyaWVzfG51bGw7XG5cbiAgLyoqXG4gICAqIE5vdGlmeSBgTFF1ZXJpZXNgIHRoYXQgYW4gYExWaWV3Tm9kZWAgaGFzIGJlZW4gcmVtb3ZlZCBmcm9tIGBMQ29udGFpbmVyTm9kZWAuIEFzIGEgcmVzdWx0IGFsbFxuICAgKiB0aGUgbWF0Y2hpbmcgbm9kZXMgZnJvbSB0aGlzIHZpZXcgc2hvdWxkIGJlIHJlbW92ZWQgZnJvbSBjb250YWluZXIncyBxdWVyaWVzLlxuICAgKi9cbiAgcmVtb3ZlVmlldyhyZW1vdmVJbmRleDogbnVtYmVyKTogdm9pZDtcblxuICAvKipcbiAgICogQWRkIGFkZGl0aW9uYWwgYFF1ZXJ5TGlzdGAgdG8gdHJhY2suXG4gICAqXG4gICAqIEBwYXJhbSBxdWVyeUxpc3QgYFF1ZXJ5TGlzdGAgdG8gdXBkYXRlIHdpdGggY2hhbmdlcy5cbiAgICogQHBhcmFtIHByZWRpY2F0ZSBFaXRoZXIgYFR5cGVgIG9yIHNlbGVjdG9yIGFycmF5IG9mIFtrZXksIHZhbHVlXSBwcmVkaWNhdGVzLlxuICAgKiBAcGFyYW0gZGVzY2VuZCBJZiB0cnVlIHRoZSBxdWVyeSB3aWxsIHJlY3Vyc2l2ZWx5IGFwcGx5IHRvIHRoZSBjaGlsZHJlbi5cbiAgICogQHBhcmFtIHJlYWQgSW5kaWNhdGVzIHdoaWNoIHRva2VuIHNob3VsZCBiZSByZWFkIGZyb20gREkgZm9yIHRoaXMgcXVlcnkuXG4gICAqL1xuICB0cmFjazxUPihcbiAgICAgIHF1ZXJ5TGlzdDogUXVlcnlMaXN0PFQ+LCBwcmVkaWNhdGU6IFR5cGU8YW55PnxzdHJpbmdbXSwgZGVzY2VuZD86IGJvb2xlYW4sXG4gICAgICByZWFkPzogUXVlcnlSZWFkVHlwZTxUPnxUeXBlPFQ+KTogdm9pZDtcbn1cblxuZXhwb3J0IGNsYXNzIFF1ZXJ5UmVhZFR5cGU8VD4geyBwcml2YXRlIGRlZmVhdFN0cnVjdHVyYWxUeXBpbmc6IGFueTsgfVxuXG4vLyBOb3RlOiBUaGlzIGhhY2sgaXMgbmVjZXNzYXJ5IHNvIHdlIGRvbid0IGVycm9uZW91c2x5IGdldCBhIGNpcmN1bGFyIGRlcGVuZGVuY3lcbi8vIGZhaWx1cmUgYmFzZWQgb24gdHlwZXMuXG5leHBvcnQgY29uc3QgdW51c2VkVmFsdWVFeHBvcnRUb1BsYWNhdGVBamQgPSAxO1xuIl19