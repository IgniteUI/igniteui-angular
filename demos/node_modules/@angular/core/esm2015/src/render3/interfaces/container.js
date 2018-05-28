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
 * The state associated with an LContainer
 * @record
 */
export function LContainer() { }
function LContainer_tsickle_Closure_declarations() {
    /**
     * The next active index in the views array to read or write to. This helps us
     * keep track of where we are in the views array.
     * @type {?}
     */
    LContainer.prototype.nextIndex;
    /**
     * This allows us to jump from a container to a sibling container or
     * component view with the same parent, so we can remove listeners efficiently.
     * @type {?}
     */
    LContainer.prototype.next;
    /**
     * Access to the parent view is necessary so we can propagate back
     * up from inside a container to parent.next.
     * @type {?}
     */
    LContainer.prototype.parent;
    /**
     * A list of the container's currently active child views. Views will be inserted
     * here as they are added and spliced from here when they are removed. We need
     * to keep a record of current views so we know which views are already in the DOM
     * (and don't need to be re-added) and so we can remove views from the DOM when they
     * are no longer required.
     * @type {?}
     */
    LContainer.prototype.views;
    /**
     * Parent Element which will contain the location where all of the Views will be
     * inserted into to.
     *
     * If `renderParent` is `null` it is headless. This means that it is contained
     * in another `LViewNode` which in turn is contained in another `LContainerNode` and
     * therefore it does not yet have its own parent.
     *
     * If `renderParent` is not `null` then it may be:
     * - same as `LContainerNode.parent` in which case it is just a normal container.
     * - different from `LContainerNode.parent` in which case it has been re-projected.
     *   In other words `LContainerNode.parent` is logical parent where as
     *   `LContainer.projectedParent` is render parent.
     *
     * When views are inserted into `LContainerNode` then `renderParent` is:
     * - `null`, we are in `LViewNode` keep going up a hierarchy until actual
     *   `renderParent` is found.
     * - not `null`, then use the `projectedParent.native` as the `RElement` to insert
     *   `LViewNode`s into.
     * @type {?}
     */
    LContainer.prototype.renderParent;
    /**
     * The template extracted from the location of the Container.
     * @type {?}
     */
    LContainer.prototype.template;
    /**
     * A count of dynamic views rendered into this container. If this is non-zero, the `views` array
     * will be traversed when refreshing dynamic views on this container.
     * @type {?}
     */
    LContainer.prototype.dynamicViewCount;
    /**
     * Queries active for this container - all the views inserted to / removed from
     * this container are reported to queries referenced here.
     * @type {?}
     */
    LContainer.prototype.queries;
}
// Note: This hack is necessary so we don't erroneously get a circular dependency
// failure based on types.
export const /** @type {?} */ unusedValueExportToPlacateAjd = 1;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29udGFpbmVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvY29yZS9zcmMvcmVuZGVyMy9pbnRlcmZhY2VzL2NvbnRhaW5lci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQXdHQSxNQUFNLENBQUMsdUJBQU0sNkJBQTZCLEdBQUcsQ0FBQyxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBJbmMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge0NvbXBvbmVudFRlbXBsYXRlfSBmcm9tICcuL2RlZmluaXRpb24nO1xuaW1wb3J0IHtMQ29udGFpbmVyTm9kZSwgTEVsZW1lbnROb2RlLCBMVmlld05vZGV9IGZyb20gJy4vbm9kZSc7XG5pbXBvcnQge0xRdWVyaWVzfSBmcm9tICcuL3F1ZXJ5JztcbmltcG9ydCB7TFZpZXcsIFRWaWV3fSBmcm9tICcuL3ZpZXcnO1xuXG5cblxuLyoqIFRoZSBzdGF0ZSBhc3NvY2lhdGVkIHdpdGggYW4gTENvbnRhaW5lciAqL1xuZXhwb3J0IGludGVyZmFjZSBMQ29udGFpbmVyIHtcbiAgLyoqXG4gICAqIFRoZSBuZXh0IGFjdGl2ZSBpbmRleCBpbiB0aGUgdmlld3MgYXJyYXkgdG8gcmVhZCBvciB3cml0ZSB0by4gVGhpcyBoZWxwcyB1c1xuICAgKiBrZWVwIHRyYWNrIG9mIHdoZXJlIHdlIGFyZSBpbiB0aGUgdmlld3MgYXJyYXkuXG4gICAqL1xuICBuZXh0SW5kZXg6IG51bWJlcjtcblxuICAvKipcbiAgICogVGhpcyBhbGxvd3MgdXMgdG8ganVtcCBmcm9tIGEgY29udGFpbmVyIHRvIGEgc2libGluZyBjb250YWluZXIgb3JcbiAgICogY29tcG9uZW50IHZpZXcgd2l0aCB0aGUgc2FtZSBwYXJlbnQsIHNvIHdlIGNhbiByZW1vdmUgbGlzdGVuZXJzIGVmZmljaWVudGx5LlxuICAgKi9cbiAgbmV4dDogTFZpZXd8TENvbnRhaW5lcnxudWxsO1xuXG4gIC8qKlxuICAgKiBBY2Nlc3MgdG8gdGhlIHBhcmVudCB2aWV3IGlzIG5lY2Vzc2FyeSBzbyB3ZSBjYW4gcHJvcGFnYXRlIGJhY2tcbiAgICogdXAgZnJvbSBpbnNpZGUgYSBjb250YWluZXIgdG8gcGFyZW50Lm5leHQuXG4gICAqL1xuICBwYXJlbnQ6IExWaWV3fG51bGw7XG5cbiAgLyoqXG4gICAqIEEgbGlzdCBvZiB0aGUgY29udGFpbmVyJ3MgY3VycmVudGx5IGFjdGl2ZSBjaGlsZCB2aWV3cy4gVmlld3Mgd2lsbCBiZSBpbnNlcnRlZFxuICAgKiBoZXJlIGFzIHRoZXkgYXJlIGFkZGVkIGFuZCBzcGxpY2VkIGZyb20gaGVyZSB3aGVuIHRoZXkgYXJlIHJlbW92ZWQuIFdlIG5lZWRcbiAgICogdG8ga2VlcCBhIHJlY29yZCBvZiBjdXJyZW50IHZpZXdzIHNvIHdlIGtub3cgd2hpY2ggdmlld3MgYXJlIGFscmVhZHkgaW4gdGhlIERPTVxuICAgKiAoYW5kIGRvbid0IG5lZWQgdG8gYmUgcmUtYWRkZWQpIGFuZCBzbyB3ZSBjYW4gcmVtb3ZlIHZpZXdzIGZyb20gdGhlIERPTSB3aGVuIHRoZXlcbiAgICogYXJlIG5vIGxvbmdlciByZXF1aXJlZC5cbiAgICovXG4gIHJlYWRvbmx5IHZpZXdzOiBMVmlld05vZGVbXTtcblxuICAvKipcbiAgICogUGFyZW50IEVsZW1lbnQgd2hpY2ggd2lsbCBjb250YWluIHRoZSBsb2NhdGlvbiB3aGVyZSBhbGwgb2YgdGhlIFZpZXdzIHdpbGwgYmVcbiAgICogaW5zZXJ0ZWQgaW50byB0by5cbiAgICpcbiAgICogSWYgYHJlbmRlclBhcmVudGAgaXMgYG51bGxgIGl0IGlzIGhlYWRsZXNzLiBUaGlzIG1lYW5zIHRoYXQgaXQgaXMgY29udGFpbmVkXG4gICAqIGluIGFub3RoZXIgYExWaWV3Tm9kZWAgd2hpY2ggaW4gdHVybiBpcyBjb250YWluZWQgaW4gYW5vdGhlciBgTENvbnRhaW5lck5vZGVgIGFuZFxuICAgKiB0aGVyZWZvcmUgaXQgZG9lcyBub3QgeWV0IGhhdmUgaXRzIG93biBwYXJlbnQuXG4gICAqXG4gICAqIElmIGByZW5kZXJQYXJlbnRgIGlzIG5vdCBgbnVsbGAgdGhlbiBpdCBtYXkgYmU6XG4gICAqIC0gc2FtZSBhcyBgTENvbnRhaW5lck5vZGUucGFyZW50YCBpbiB3aGljaCBjYXNlIGl0IGlzIGp1c3QgYSBub3JtYWwgY29udGFpbmVyLlxuICAgKiAtIGRpZmZlcmVudCBmcm9tIGBMQ29udGFpbmVyTm9kZS5wYXJlbnRgIGluIHdoaWNoIGNhc2UgaXQgaGFzIGJlZW4gcmUtcHJvamVjdGVkLlxuICAgKiAgIEluIG90aGVyIHdvcmRzIGBMQ29udGFpbmVyTm9kZS5wYXJlbnRgIGlzIGxvZ2ljYWwgcGFyZW50IHdoZXJlIGFzXG4gICAqICAgYExDb250YWluZXIucHJvamVjdGVkUGFyZW50YCBpcyByZW5kZXIgcGFyZW50LlxuICAgKlxuICAgKiBXaGVuIHZpZXdzIGFyZSBpbnNlcnRlZCBpbnRvIGBMQ29udGFpbmVyTm9kZWAgdGhlbiBgcmVuZGVyUGFyZW50YCBpczpcbiAgICogLSBgbnVsbGAsIHdlIGFyZSBpbiBgTFZpZXdOb2RlYCBrZWVwIGdvaW5nIHVwIGEgaGllcmFyY2h5IHVudGlsIGFjdHVhbFxuICAgKiAgIGByZW5kZXJQYXJlbnRgIGlzIGZvdW5kLlxuICAgKiAtIG5vdCBgbnVsbGAsIHRoZW4gdXNlIHRoZSBgcHJvamVjdGVkUGFyZW50Lm5hdGl2ZWAgYXMgdGhlIGBSRWxlbWVudGAgdG8gaW5zZXJ0XG4gICAqICAgYExWaWV3Tm9kZWBzIGludG8uXG4gICAqL1xuICByZW5kZXJQYXJlbnQ6IExFbGVtZW50Tm9kZXxudWxsO1xuXG4gIC8qKlxuICAgKiBUaGUgdGVtcGxhdGUgZXh0cmFjdGVkIGZyb20gdGhlIGxvY2F0aW9uIG9mIHRoZSBDb250YWluZXIuXG4gICAqL1xuICByZWFkb25seSB0ZW1wbGF0ZTogQ29tcG9uZW50VGVtcGxhdGU8YW55PnxudWxsO1xuXG4gIC8qKlxuICAgKiBBIGNvdW50IG9mIGR5bmFtaWMgdmlld3MgcmVuZGVyZWQgaW50byB0aGlzIGNvbnRhaW5lci4gSWYgdGhpcyBpcyBub24temVybywgdGhlIGB2aWV3c2AgYXJyYXlcbiAgICogd2lsbCBiZSB0cmF2ZXJzZWQgd2hlbiByZWZyZXNoaW5nIGR5bmFtaWMgdmlld3Mgb24gdGhpcyBjb250YWluZXIuXG4gICAqL1xuICBkeW5hbWljVmlld0NvdW50OiBudW1iZXI7XG5cbiAgLyoqXG4gICAqIFF1ZXJpZXMgYWN0aXZlIGZvciB0aGlzIGNvbnRhaW5lciAtIGFsbCB0aGUgdmlld3MgaW5zZXJ0ZWQgdG8gLyByZW1vdmVkIGZyb21cbiAgICogdGhpcyBjb250YWluZXIgYXJlIHJlcG9ydGVkIHRvIHF1ZXJpZXMgcmVmZXJlbmNlZCBoZXJlLlxuICAgKi9cbiAgcXVlcmllczogTFF1ZXJpZXN8bnVsbDtcbn1cblxuLyoqXG4gKiBUaGUgc3RhdGljIGVxdWl2YWxlbnQgb2YgTENvbnRhaW5lciwgdXNlZCBpbiBUQ29udGFpbmVyTm9kZS5cbiAqXG4gKiBUaGUgY29udGFpbmVyIG5lZWRzIHRvIHN0b3JlIHN0YXRpYyBkYXRhIGZvciBlYWNoIG9mIGl0cyBlbWJlZGRlZCB2aWV3c1xuICogKFRWaWV3cykuIE90aGVyd2lzZSwgbm9kZXMgaW4gZW1iZWRkZWQgdmlld3Mgd2l0aCB0aGUgc2FtZSBpbmRleCBhcyBub2Rlc1xuICogaW4gdGhlaXIgcGFyZW50IHZpZXdzIHdpbGwgb3ZlcndyaXRlIGVhY2ggb3RoZXIsIGFzIHRoZXkgYXJlIGluXG4gKiB0aGUgc2FtZSB0ZW1wbGF0ZS5cbiAqXG4gKiBFYWNoIGluZGV4IGluIHRoaXMgYXJyYXkgY29ycmVzcG9uZHMgdG8gdGhlIHN0YXRpYyBkYXRhIGZvciBhIGNlcnRhaW5cbiAqIHZpZXcuIFNvIGlmIHlvdSBoYWQgVigwKSBhbmQgVigxKSBpbiBhIGNvbnRhaW5lciwgeW91IG1pZ2h0IGhhdmU6XG4gKlxuICogW1xuICogICBbe3RhZ05hbWU6ICdkaXYnLCBhdHRyczogLi4ufSwgbnVsbF0sICAgICAvLyBWKDApIFRWaWV3XG4gKiAgIFt7dGFnTmFtZTogJ2J1dHRvbicsIGF0dHJzIC4uLn0sIG51bGxdICAgIC8vIFYoMSkgVFZpZXdcbiAqIF1cbiAqL1xuZXhwb3J0IHR5cGUgVENvbnRhaW5lciA9IFRWaWV3W107XG5cbi8vIE5vdGU6IFRoaXMgaGFjayBpcyBuZWNlc3Nhcnkgc28gd2UgZG9uJ3QgZXJyb25lb3VzbHkgZ2V0IGEgY2lyY3VsYXIgZGVwZW5kZW5jeVxuLy8gZmFpbHVyZSBiYXNlZCBvbiB0eXBlcy5cbmV4cG9ydCBjb25zdCB1bnVzZWRWYWx1ZUV4cG9ydFRvUGxhY2F0ZUFqZCA9IDE7XG4iXX0=