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
/** @enum {number} */
const LNodeType = {
    Container: 0,
    Projection: 1,
    View: 2,
    Element: 3,
    ViewOrElement: 2,
};
export { LNodeType };
/** @enum {number} */
const TNodeFlags = {
    /** The number of directives on this node is encoded on the least significant bits */
    DirectiveCountMask: 4095,
    /** Then this bit is set when the node is a component */
    isComponent: 4096,
    /** The index of the first directive on this node is encoded on the most significant bits  */
    DirectiveStartingIndexShift: 13,
};
export { TNodeFlags };
/**
 * LNode is an internal data structure which is used for the incremental DOM algorithm.
 * The "L" stands for "Logical" to differentiate between `RNodes` (actual rendered DOM
 * node) and our logical representation of DOM nodes, `LNodes`.
 *
 * The data structure is optimized for speed and size.
 *
 * In order to be fast, all subtypes of `LNode` should have the same shape.
 * Because size of the `LNode` matters, many fields have multiple roles depending
 * on the `LNode` subtype.
 *
 * See: https://en.wikipedia.org/wiki/Inline_caching#Monomorphic_inline_caching
 *
 * NOTE: This is a private data structure and should not be exported by any of the
 * instructions.
 * @record
 */
export function LNode() { }
function LNode_tsickle_Closure_declarations() {
    /**
     * The type of the node (see LNodeFlags)
     * @type {?}
     */
    LNode.prototype.type;
    /**
     * The associated DOM node. Storing this allows us to:
     *  - append children to their element parents in the DOM (e.g. `parent.native.appendChild(...)`)
     *  - retrieve the sibling elements of text nodes whose creation / insertion has been delayed
     * @type {?}
     */
    LNode.prototype.native;
    /**
     * We need a reference to a node's parent so we can append the node to its parent's native
     * element at the appropriate time.
     * @type {?}
     */
    LNode.prototype.parent;
    /**
     * First child of the current node.
     * @type {?}
     */
    LNode.prototype.child;
    /**
     * The next sibling node. Necessary so we can propagate through the root nodes of a view
     * to insert them or remove them from the DOM.
     * @type {?}
     */
    LNode.prototype.next;
    /**
     * If regular LElementNode, then `data` will be null.
     * If LElementNode with component, then `data` contains LView.
     * If LViewNode, then `data` contains the LView.
     * If LContainerNode, then `data` contains LContainer.
     * If LProjectionNode, then `data` contains LProjection.
     * @type {?}
     */
    LNode.prototype.data;
    /**
     * Each node belongs to a view.
     *
     * When the injector is walking up a tree, it needs access to the `directives` (part of view).
     * @type {?}
     */
    LNode.prototype.view;
    /**
     * The injector associated with this node. Necessary for DI.
     * @type {?}
     */
    LNode.prototype.nodeInjector;
    /**
     * Optional set of queries that track query-related events for this node.
     *
     * If present the node creation/updates are reported to the `LQueries`.
     * @type {?}
     */
    LNode.prototype.queries;
    /**
     * If this node is projected, pointer to the next node in the same projection parent
     * (which is a container, an element, or a text node), or to the parent projection node
     * if this is the last node in the projection.
     * If this node is not projected, this field is null.
     * @type {?}
     */
    LNode.prototype.pNextOrParent;
    /**
     * Pointer to the corresponding TNode object, which stores static
     * data about this node.
     * @type {?}
     */
    LNode.prototype.tNode;
    /**
     * A pointer to a LContainerNode created by directives requesting ViewContainerRef
     * @type {?}
     */
    LNode.prototype.dynamicLContainerNode;
}
/**
 * LNode representing an element.
 * @record
 */
export function LElementNode() { }
function LElementNode_tsickle_Closure_declarations() {
    /**
     * The DOM element associated with this node.
     * @type {?}
     */
    LElementNode.prototype.native;
    /** @type {?} */
    LElementNode.prototype.child;
    /** @type {?} */
    LElementNode.prototype.next;
    /**
     * If Component then data has LView (light DOM)
     * @type {?}
     */
    LElementNode.prototype.data;
    /**
     * LElementNodes can be inside other LElementNodes or inside LViewNodes.
     * @type {?}
     */
    LElementNode.prototype.parent;
}
/**
 * LNode representing a #text node.
 * @record
 */
export function LTextNode() { }
function LTextNode_tsickle_Closure_declarations() {
    /**
     * The text node associated with this node.
     * @type {?}
     */
    LTextNode.prototype.native;
    /** @type {?} */
    LTextNode.prototype.child;
    /** @type {?} */
    LTextNode.prototype.next;
    /**
     * LTextNodes can be inside LElementNodes or inside LViewNodes.
     * @type {?}
     */
    LTextNode.prototype.parent;
    /** @type {?} */
    LTextNode.prototype.data;
    /** @type {?} */
    LTextNode.prototype.dynamicLContainerNode;
}
/**
 * Abstract node which contains root nodes of a view.
 * @record
 */
export function LViewNode() { }
function LViewNode_tsickle_Closure_declarations() {
    /** @type {?} */
    LViewNode.prototype.native;
    /** @type {?} */
    LViewNode.prototype.child;
    /** @type {?} */
    LViewNode.prototype.next;
    /**
     * LViewNodes can only be added to LContainerNodes.
     * @type {?}
     */
    LViewNode.prototype.parent;
    /** @type {?} */
    LViewNode.prototype.data;
    /** @type {?} */
    LViewNode.prototype.dynamicLContainerNode;
}
/**
 * Abstract node container which contains other views.
 * @record
 */
export function LContainerNode() { }
function LContainerNode_tsickle_Closure_declarations() {
    /** @type {?} */
    LContainerNode.prototype.native;
    /** @type {?} */
    LContainerNode.prototype.data;
    /** @type {?} */
    LContainerNode.prototype.child;
    /** @type {?} */
    LContainerNode.prototype.next;
    /**
     * Containers can be added to elements or views.
     * @type {?}
     */
    LContainerNode.prototype.parent;
}
/**
 * @record
 */
export function LProjectionNode() { }
function LProjectionNode_tsickle_Closure_declarations() {
    /** @type {?} */
    LProjectionNode.prototype.native;
    /** @type {?} */
    LProjectionNode.prototype.child;
    /** @type {?} */
    LProjectionNode.prototype.next;
    /** @type {?} */
    LProjectionNode.prototype.data;
    /**
     * Projections can be added to elements or views.
     * @type {?}
     */
    LProjectionNode.prototype.parent;
    /** @type {?} */
    LProjectionNode.prototype.dynamicLContainerNode;
}
/**
 * LNode binding data (flyweight) for a particular node that is shared between all templates
 * of a specific type.
 *
 * If a property is:
 *    - PropertyAliases: that property's data was generated and this is it
 *    - Null: that property's data was already generated and nothing was found.
 *    - Undefined: that property's data has not yet been generated
 *
 * see: https://en.wikipedia.org/wiki/Flyweight_pattern for more on the Flyweight pattern
 * @record
 */
export function TNode() { }
function TNode_tsickle_Closure_declarations() {
    /**
     * This number stores two values using its bits:
     *
     * - the number of directives on that node (first 12 bits)
     * - the starting index of the node's directives in the directives array (last 20 bits).
     *
     * These two values are necessary so DI can effectively search the directives associated
     * with a node without searching the whole directives array.
     * @type {?}
     */
    TNode.prototype.flags;
    /**
     * The tag name associated with this node.
     * @type {?}
     */
    TNode.prototype.tagName;
    /**
     * Static attributes associated with an element. We need to store
     * static attributes to support content projection with selectors.
     * Attributes are stored statically because reading them from the DOM
     * would be way too slow for content projection and queries.
     *
     * Since attrs will always be calculated first, they will never need
     * to be marked undefined by other instructions.
     *
     * The name of the attribute and its value alternate in the array.
     * e.g. ['role', 'checkbox']
     * @type {?}
     */
    TNode.prototype.attrs;
    /**
     * A set of local names under which a given element is exported in a template and
     * visible to queries. An entry in this array can be created for different reasons:
     * - an element itself is referenced, ex.: `<div #foo>`
     * - a component is referenced, ex.: `<my-cmpt #foo>`
     * - a directive is referenced, ex.: `<my-cmpt #foo="directiveExportAs">`.
     *
     * A given element might have different local names and those names can be associated
     * with a directive. We store local names at even indexes while odd indexes are reserved
     * for directive index in a view (or `-1` if there is no associated directive).
     *
     * Some examples:
     * - `<div #foo>` => `["foo", -1]`
     * - `<my-cmpt #foo>` => `["foo", myCmptIdx]`
     * - `<my-cmpt #foo #bar="directiveExportAs">` => `["foo", myCmptIdx, "bar", directiveIdx]`
     * - `<div #foo #bar="directiveExportAs">` => `["foo", -1, "bar", directiveIdx]`
     * @type {?}
     */
    TNode.prototype.localNames;
    /**
     * Information about input properties that need to be set once from attribute data.
     * @type {?}
     */
    TNode.prototype.initialInputs;
    /**
     * Input data for all directives on this node.
     *
     * - `undefined` means that the prop has not been initialized yet,
     * - `null` means that the prop has been initialized but no inputs have been found.
     * @type {?}
     */
    TNode.prototype.inputs;
    /**
     * Output data for all directives on this node.
     *
     * - `undefined` means that the prop has not been initialized yet,
     * - `null` means that the prop has been initialized but no outputs have been found.
     * @type {?}
     */
    TNode.prototype.outputs;
    /**
     * The static data equivalent of LNode.data.
     *
     * If this TNode corresponds to an LContainerNode, the container will
     * need to store separate static data for each of its views (TContainer).
     *
     * If this TNode corresponds to an LElementNode, data will be null.
     * @type {?}
     */
    TNode.prototype.data;
}
/**
 * Static data for an LElementNode
 * @record
 */
export function TElementNode() { }
function TElementNode_tsickle_Closure_declarations() {
    /** @type {?} */
    TElementNode.prototype.data;
}
/**
 * Static data for an LContainerNode
 * @record
 */
export function TContainerNode() { }
function TContainerNode_tsickle_Closure_declarations() {
    /** @type {?} */
    TContainerNode.prototype.data;
}
// Note: This hack is necessary so we don't erroneously get a circular dependency
// failure based on types.
export const /** @type {?} */ unusedValueExportToPlacateAjd = 1;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibm9kZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2NvcmUvc3JjL3JlbmRlcjMvaW50ZXJmYWNlcy9ub2RlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUF1V0EsTUFBTSxDQUFDLHVCQUFNLDZCQUE2QixHQUFHLENBQUMsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgSW5jLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtMQ29udGFpbmVyLCBUQ29udGFpbmVyfSBmcm9tICcuL2NvbnRhaW5lcic7XG5pbXBvcnQge0xJbmplY3Rvcn0gZnJvbSAnLi9pbmplY3Rvcic7XG5pbXBvcnQge0xQcm9qZWN0aW9ufSBmcm9tICcuL3Byb2plY3Rpb24nO1xuaW1wb3J0IHtMUXVlcmllc30gZnJvbSAnLi9xdWVyeSc7XG5pbXBvcnQge1JFbGVtZW50LCBSTm9kZSwgUlRleHR9IGZyb20gJy4vcmVuZGVyZXInO1xuaW1wb3J0IHtMVmlldywgVERhdGEsIFRWaWV3fSBmcm9tICcuL3ZpZXcnO1xuXG5cblxuLyoqXG4gKiBMTm9kZVR5cGUgY29ycmVzcG9uZHMgdG8gdGhlIExOb2RlLnR5cGUgcHJvcGVydHkuIEl0IGNvbnRhaW5zIGluZm9ybWF0aW9uXG4gKiBvbiBob3cgdG8gbWFwIGEgcGFydGljdWxhciBzZXQgb2YgYml0cyBpbiBMTm9kZS5mbGFncyB0byB0aGUgbm9kZSB0eXBlLlxuICovXG5leHBvcnQgY29uc3QgZW51bSBMTm9kZVR5cGUge1xuICBDb250YWluZXIgPSAwYjAwLFxuICBQcm9qZWN0aW9uID0gMGIwMSxcbiAgVmlldyA9IDBiMTAsXG4gIEVsZW1lbnQgPSAwYjExLFxuICBWaWV3T3JFbGVtZW50ID0gMGIxMCxcbn1cblxuLyoqXG4gKiBDb3JyZXNwb25kcyB0byB0aGUgVE5vZGUuZmxhZ3MgcHJvcGVydHkuXG4gKi9cbmV4cG9ydCBjb25zdCBlbnVtIFROb2RlRmxhZ3Mge1xuICAvKiogVGhlIG51bWJlciBvZiBkaXJlY3RpdmVzIG9uIHRoaXMgbm9kZSBpcyBlbmNvZGVkIG9uIHRoZSBsZWFzdCBzaWduaWZpY2FudCBiaXRzICovXG4gIERpcmVjdGl2ZUNvdW50TWFzayA9IDBiMDAwMDAwMDAwMDAwMDAwMDAwMDAxMTExMTExMTExMTEsXG5cbiAgLyoqIFRoZW4gdGhpcyBiaXQgaXMgc2V0IHdoZW4gdGhlIG5vZGUgaXMgYSBjb21wb25lbnQgKi9cbiAgaXNDb21wb25lbnQgPSAwYjEwMDAwMDAwMDAwMDAsXG5cbiAgLyoqIFRoZSBpbmRleCBvZiB0aGUgZmlyc3QgZGlyZWN0aXZlIG9uIHRoaXMgbm9kZSBpcyBlbmNvZGVkIG9uIHRoZSBtb3N0IHNpZ25pZmljYW50IGJpdHMgICovXG4gIERpcmVjdGl2ZVN0YXJ0aW5nSW5kZXhTaGlmdCA9IDEzLFxufVxuXG4vKipcbiAqIExOb2RlIGlzIGFuIGludGVybmFsIGRhdGEgc3RydWN0dXJlIHdoaWNoIGlzIHVzZWQgZm9yIHRoZSBpbmNyZW1lbnRhbCBET00gYWxnb3JpdGhtLlxuICogVGhlIFwiTFwiIHN0YW5kcyBmb3IgXCJMb2dpY2FsXCIgdG8gZGlmZmVyZW50aWF0ZSBiZXR3ZWVuIGBSTm9kZXNgIChhY3R1YWwgcmVuZGVyZWQgRE9NXG4gKiBub2RlKSBhbmQgb3VyIGxvZ2ljYWwgcmVwcmVzZW50YXRpb24gb2YgRE9NIG5vZGVzLCBgTE5vZGVzYC5cbiAqXG4gKiBUaGUgZGF0YSBzdHJ1Y3R1cmUgaXMgb3B0aW1pemVkIGZvciBzcGVlZCBhbmQgc2l6ZS5cbiAqXG4gKiBJbiBvcmRlciB0byBiZSBmYXN0LCBhbGwgc3VidHlwZXMgb2YgYExOb2RlYCBzaG91bGQgaGF2ZSB0aGUgc2FtZSBzaGFwZS5cbiAqIEJlY2F1c2Ugc2l6ZSBvZiB0aGUgYExOb2RlYCBtYXR0ZXJzLCBtYW55IGZpZWxkcyBoYXZlIG11bHRpcGxlIHJvbGVzIGRlcGVuZGluZ1xuICogb24gdGhlIGBMTm9kZWAgc3VidHlwZS5cbiAqXG4gKiBTZWU6IGh0dHBzOi8vZW4ud2lraXBlZGlhLm9yZy93aWtpL0lubGluZV9jYWNoaW5nI01vbm9tb3JwaGljX2lubGluZV9jYWNoaW5nXG4gKlxuICogTk9URTogVGhpcyBpcyBhIHByaXZhdGUgZGF0YSBzdHJ1Y3R1cmUgYW5kIHNob3VsZCBub3QgYmUgZXhwb3J0ZWQgYnkgYW55IG9mIHRoZVxuICogaW5zdHJ1Y3Rpb25zLlxuICovXG5leHBvcnQgaW50ZXJmYWNlIExOb2RlIHtcbiAgLyoqIFRoZSB0eXBlIG9mIHRoZSBub2RlIChzZWUgTE5vZGVGbGFncykgKi9cbiAgdHlwZTogTE5vZGVUeXBlO1xuXG4gIC8qKlxuICAgKiBUaGUgYXNzb2NpYXRlZCBET00gbm9kZS4gU3RvcmluZyB0aGlzIGFsbG93cyB1cyB0bzpcbiAgICogIC0gYXBwZW5kIGNoaWxkcmVuIHRvIHRoZWlyIGVsZW1lbnQgcGFyZW50cyBpbiB0aGUgRE9NIChlLmcuIGBwYXJlbnQubmF0aXZlLmFwcGVuZENoaWxkKC4uLilgKVxuICAgKiAgLSByZXRyaWV2ZSB0aGUgc2libGluZyBlbGVtZW50cyBvZiB0ZXh0IG5vZGVzIHdob3NlIGNyZWF0aW9uIC8gaW5zZXJ0aW9uIGhhcyBiZWVuIGRlbGF5ZWRcbiAgICovXG4gIHJlYWRvbmx5IG5hdGl2ZTogUkVsZW1lbnR8UlRleHR8bnVsbHx1bmRlZmluZWQ7XG5cbiAgLyoqXG4gICAqIFdlIG5lZWQgYSByZWZlcmVuY2UgdG8gYSBub2RlJ3MgcGFyZW50IHNvIHdlIGNhbiBhcHBlbmQgdGhlIG5vZGUgdG8gaXRzIHBhcmVudCdzIG5hdGl2ZVxuICAgKiBlbGVtZW50IGF0IHRoZSBhcHByb3ByaWF0ZSB0aW1lLlxuICAgKi9cbiAgcmVhZG9ubHkgcGFyZW50OiBMTm9kZXxudWxsO1xuXG4gIC8qKlxuICAgKiBGaXJzdCBjaGlsZCBvZiB0aGUgY3VycmVudCBub2RlLlxuICAgKi9cbiAgY2hpbGQ6IExOb2RlfG51bGw7XG5cbiAgLyoqXG4gICAqIFRoZSBuZXh0IHNpYmxpbmcgbm9kZS4gTmVjZXNzYXJ5IHNvIHdlIGNhbiBwcm9wYWdhdGUgdGhyb3VnaCB0aGUgcm9vdCBub2RlcyBvZiBhIHZpZXdcbiAgICogdG8gaW5zZXJ0IHRoZW0gb3IgcmVtb3ZlIHRoZW0gZnJvbSB0aGUgRE9NLlxuICAgKi9cbiAgbmV4dDogTE5vZGV8bnVsbDtcblxuICAvKipcbiAgICogSWYgcmVndWxhciBMRWxlbWVudE5vZGUsIHRoZW4gYGRhdGFgIHdpbGwgYmUgbnVsbC5cbiAgICogSWYgTEVsZW1lbnROb2RlIHdpdGggY29tcG9uZW50LCB0aGVuIGBkYXRhYCBjb250YWlucyBMVmlldy5cbiAgICogSWYgTFZpZXdOb2RlLCB0aGVuIGBkYXRhYCBjb250YWlucyB0aGUgTFZpZXcuXG4gICAqIElmIExDb250YWluZXJOb2RlLCB0aGVuIGBkYXRhYCBjb250YWlucyBMQ29udGFpbmVyLlxuICAgKiBJZiBMUHJvamVjdGlvbk5vZGUsIHRoZW4gYGRhdGFgIGNvbnRhaW5zIExQcm9qZWN0aW9uLlxuICAgKi9cbiAgcmVhZG9ubHkgZGF0YTogTFZpZXd8TENvbnRhaW5lcnxMUHJvamVjdGlvbnxudWxsO1xuXG5cbiAgLyoqXG4gICAqIEVhY2ggbm9kZSBiZWxvbmdzIHRvIGEgdmlldy5cbiAgICpcbiAgICogV2hlbiB0aGUgaW5qZWN0b3IgaXMgd2Fsa2luZyB1cCBhIHRyZWUsIGl0IG5lZWRzIGFjY2VzcyB0byB0aGUgYGRpcmVjdGl2ZXNgIChwYXJ0IG9mIHZpZXcpLlxuICAgKi9cbiAgcmVhZG9ubHkgdmlldzogTFZpZXc7XG5cbiAgLyoqIFRoZSBpbmplY3RvciBhc3NvY2lhdGVkIHdpdGggdGhpcyBub2RlLiBOZWNlc3NhcnkgZm9yIERJLiAqL1xuICBub2RlSW5qZWN0b3I6IExJbmplY3RvcnxudWxsO1xuXG4gIC8qKlxuICAgKiBPcHRpb25hbCBzZXQgb2YgcXVlcmllcyB0aGF0IHRyYWNrIHF1ZXJ5LXJlbGF0ZWQgZXZlbnRzIGZvciB0aGlzIG5vZGUuXG4gICAqXG4gICAqIElmIHByZXNlbnQgdGhlIG5vZGUgY3JlYXRpb24vdXBkYXRlcyBhcmUgcmVwb3J0ZWQgdG8gdGhlIGBMUXVlcmllc2AuXG4gICAqL1xuICBxdWVyaWVzOiBMUXVlcmllc3xudWxsO1xuXG4gIC8qKlxuICAgKiBJZiB0aGlzIG5vZGUgaXMgcHJvamVjdGVkLCBwb2ludGVyIHRvIHRoZSBuZXh0IG5vZGUgaW4gdGhlIHNhbWUgcHJvamVjdGlvbiBwYXJlbnRcbiAgICogKHdoaWNoIGlzIGEgY29udGFpbmVyLCBhbiBlbGVtZW50LCBvciBhIHRleHQgbm9kZSksIG9yIHRvIHRoZSBwYXJlbnQgcHJvamVjdGlvbiBub2RlXG4gICAqIGlmIHRoaXMgaXMgdGhlIGxhc3Qgbm9kZSBpbiB0aGUgcHJvamVjdGlvbi5cbiAgICogSWYgdGhpcyBub2RlIGlzIG5vdCBwcm9qZWN0ZWQsIHRoaXMgZmllbGQgaXMgbnVsbC5cbiAgICovXG4gIHBOZXh0T3JQYXJlbnQ6IExOb2RlfG51bGw7XG5cbiAgLyoqXG4gICAqIFBvaW50ZXIgdG8gdGhlIGNvcnJlc3BvbmRpbmcgVE5vZGUgb2JqZWN0LCB3aGljaCBzdG9yZXMgc3RhdGljXG4gICAqIGRhdGEgYWJvdXQgdGhpcyBub2RlLlxuICAgKi9cbiAgdE5vZGU6IFROb2RlfG51bGw7XG5cbiAgLyoqXG4gICAqIEEgcG9pbnRlciB0byBhIExDb250YWluZXJOb2RlIGNyZWF0ZWQgYnkgZGlyZWN0aXZlcyByZXF1ZXN0aW5nIFZpZXdDb250YWluZXJSZWZcbiAgICovXG4gIGR5bmFtaWNMQ29udGFpbmVyTm9kZTogTENvbnRhaW5lck5vZGV8bnVsbDtcbn1cblxuXG4vKiogTE5vZGUgcmVwcmVzZW50aW5nIGFuIGVsZW1lbnQuICovXG5leHBvcnQgaW50ZXJmYWNlIExFbGVtZW50Tm9kZSBleHRlbmRzIExOb2RlIHtcbiAgLyoqIFRoZSBET00gZWxlbWVudCBhc3NvY2lhdGVkIHdpdGggdGhpcyBub2RlLiAqL1xuICByZWFkb25seSBuYXRpdmU6IFJFbGVtZW50O1xuXG4gIGNoaWxkOiBMQ29udGFpbmVyTm9kZXxMRWxlbWVudE5vZGV8TFRleHROb2RlfExQcm9qZWN0aW9uTm9kZXxudWxsO1xuICBuZXh0OiBMQ29udGFpbmVyTm9kZXxMRWxlbWVudE5vZGV8TFRleHROb2RlfExQcm9qZWN0aW9uTm9kZXxudWxsO1xuXG4gIC8qKiBJZiBDb21wb25lbnQgdGhlbiBkYXRhIGhhcyBMVmlldyAobGlnaHQgRE9NKSAqL1xuICByZWFkb25seSBkYXRhOiBMVmlld3xudWxsO1xuXG4gIC8qKiBMRWxlbWVudE5vZGVzIGNhbiBiZSBpbnNpZGUgb3RoZXIgTEVsZW1lbnROb2RlcyBvciBpbnNpZGUgTFZpZXdOb2Rlcy4gKi9cbiAgcmVhZG9ubHkgcGFyZW50OiBMRWxlbWVudE5vZGV8TFZpZXdOb2RlO1xufVxuXG4vKiogTE5vZGUgcmVwcmVzZW50aW5nIGEgI3RleHQgbm9kZS4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgTFRleHROb2RlIGV4dGVuZHMgTE5vZGUge1xuICAvKiogVGhlIHRleHQgbm9kZSBhc3NvY2lhdGVkIHdpdGggdGhpcyBub2RlLiAqL1xuICBuYXRpdmU6IFJUZXh0O1xuICBjaGlsZDogbnVsbDtcbiAgbmV4dDogTENvbnRhaW5lck5vZGV8TEVsZW1lbnROb2RlfExUZXh0Tm9kZXxMUHJvamVjdGlvbk5vZGV8bnVsbDtcblxuICAvKiogTFRleHROb2RlcyBjYW4gYmUgaW5zaWRlIExFbGVtZW50Tm9kZXMgb3IgaW5zaWRlIExWaWV3Tm9kZXMuICovXG4gIHJlYWRvbmx5IHBhcmVudDogTEVsZW1lbnROb2RlfExWaWV3Tm9kZTtcbiAgcmVhZG9ubHkgZGF0YTogbnVsbDtcbiAgZHluYW1pY0xDb250YWluZXJOb2RlOiBudWxsO1xufVxuXG4vKiogQWJzdHJhY3Qgbm9kZSB3aGljaCBjb250YWlucyByb290IG5vZGVzIG9mIGEgdmlldy4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgTFZpZXdOb2RlIGV4dGVuZHMgTE5vZGUge1xuICByZWFkb25seSBuYXRpdmU6IG51bGw7XG4gIGNoaWxkOiBMQ29udGFpbmVyTm9kZXxMRWxlbWVudE5vZGV8TFRleHROb2RlfExQcm9qZWN0aW9uTm9kZXxudWxsO1xuICBuZXh0OiBMVmlld05vZGV8bnVsbDtcblxuICAvKiogIExWaWV3Tm9kZXMgY2FuIG9ubHkgYmUgYWRkZWQgdG8gTENvbnRhaW5lck5vZGVzLiAqL1xuICByZWFkb25seSBwYXJlbnQ6IExDb250YWluZXJOb2RlfG51bGw7XG4gIHJlYWRvbmx5IGRhdGE6IExWaWV3O1xuICBkeW5hbWljTENvbnRhaW5lck5vZGU6IG51bGw7XG59XG5cbi8qKiBBYnN0cmFjdCBub2RlIGNvbnRhaW5lciB3aGljaCBjb250YWlucyBvdGhlciB2aWV3cy4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgTENvbnRhaW5lck5vZGUgZXh0ZW5kcyBMTm9kZSB7XG4gIC8qXG4gICAqIENhY2hlcyB0aGUgcmVmZXJlbmNlIG9mIHRoZSBmaXJzdCBuYXRpdmUgbm9kZSBmb2xsb3dpbmcgdGhpcyBjb250YWluZXIgaW4gdGhlIHNhbWUgbmF0aXZlXG4gICAqIHBhcmVudC5cbiAgICogVGhpcyBpcyByZXNldCB0byB1bmRlZmluZWQgaW4gY29udGFpbmVyUmVmcmVzaEVuZC5cbiAgICogV2hlbiBpdCBpcyB1bmRlZmluZWQsIGl0IG1lYW5zIHRoZSB2YWx1ZSBoYXMgbm90IGJlZW4gY29tcHV0ZWQgeWV0LlxuICAgKiBPdGhlcndpc2UsIGl0IGNvbnRhaW5zIHRoZSByZXN1bHQgb2YgZmluZEJlZm9yZU5vZGUoY29udGFpbmVyLCBudWxsKS5cbiAgICovXG4gIG5hdGl2ZTogUkVsZW1lbnR8UlRleHR8bnVsbHx1bmRlZmluZWQ7XG4gIHJlYWRvbmx5IGRhdGE6IExDb250YWluZXI7XG4gIGNoaWxkOiBudWxsO1xuICBuZXh0OiBMQ29udGFpbmVyTm9kZXxMRWxlbWVudE5vZGV8TFRleHROb2RlfExQcm9qZWN0aW9uTm9kZXxudWxsO1xuXG4gIC8qKiBDb250YWluZXJzIGNhbiBiZSBhZGRlZCB0byBlbGVtZW50cyBvciB2aWV3cy4gKi9cbiAgcmVhZG9ubHkgcGFyZW50OiBMRWxlbWVudE5vZGV8TFZpZXdOb2RlfG51bGw7XG59XG5cblxuZXhwb3J0IGludGVyZmFjZSBMUHJvamVjdGlvbk5vZGUgZXh0ZW5kcyBMTm9kZSB7XG4gIHJlYWRvbmx5IG5hdGl2ZTogbnVsbDtcbiAgY2hpbGQ6IG51bGw7XG4gIG5leHQ6IExDb250YWluZXJOb2RlfExFbGVtZW50Tm9kZXxMVGV4dE5vZGV8TFByb2plY3Rpb25Ob2RlfG51bGw7XG5cbiAgcmVhZG9ubHkgZGF0YTogTFByb2plY3Rpb247XG5cbiAgLyoqIFByb2plY3Rpb25zIGNhbiBiZSBhZGRlZCB0byBlbGVtZW50cyBvciB2aWV3cy4gKi9cbiAgcmVhZG9ubHkgcGFyZW50OiBMRWxlbWVudE5vZGV8TFZpZXdOb2RlO1xuICBkeW5hbWljTENvbnRhaW5lck5vZGU6IG51bGw7XG59XG5cbi8qKlxuICogTE5vZGUgYmluZGluZyBkYXRhIChmbHl3ZWlnaHQpIGZvciBhIHBhcnRpY3VsYXIgbm9kZSB0aGF0IGlzIHNoYXJlZCBiZXR3ZWVuIGFsbCB0ZW1wbGF0ZXNcbiAqIG9mIGEgc3BlY2lmaWMgdHlwZS5cbiAqXG4gKiBJZiBhIHByb3BlcnR5IGlzOlxuICogICAgLSBQcm9wZXJ0eUFsaWFzZXM6IHRoYXQgcHJvcGVydHkncyBkYXRhIHdhcyBnZW5lcmF0ZWQgYW5kIHRoaXMgaXMgaXRcbiAqICAgIC0gTnVsbDogdGhhdCBwcm9wZXJ0eSdzIGRhdGEgd2FzIGFscmVhZHkgZ2VuZXJhdGVkIGFuZCBub3RoaW5nIHdhcyBmb3VuZC5cbiAqICAgIC0gVW5kZWZpbmVkOiB0aGF0IHByb3BlcnR5J3MgZGF0YSBoYXMgbm90IHlldCBiZWVuIGdlbmVyYXRlZFxuICpcbiAqIHNlZTogaHR0cHM6Ly9lbi53aWtpcGVkaWEub3JnL3dpa2kvRmx5d2VpZ2h0X3BhdHRlcm4gZm9yIG1vcmUgb24gdGhlIEZseXdlaWdodCBwYXR0ZXJuXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgVE5vZGUge1xuICAvKipcbiAgICogVGhpcyBudW1iZXIgc3RvcmVzIHR3byB2YWx1ZXMgdXNpbmcgaXRzIGJpdHM6XG4gICAqXG4gICAqIC0gdGhlIG51bWJlciBvZiBkaXJlY3RpdmVzIG9uIHRoYXQgbm9kZSAoZmlyc3QgMTIgYml0cylcbiAgICogLSB0aGUgc3RhcnRpbmcgaW5kZXggb2YgdGhlIG5vZGUncyBkaXJlY3RpdmVzIGluIHRoZSBkaXJlY3RpdmVzIGFycmF5IChsYXN0IDIwIGJpdHMpLlxuICAgKlxuICAgKiBUaGVzZSB0d28gdmFsdWVzIGFyZSBuZWNlc3Nhcnkgc28gREkgY2FuIGVmZmVjdGl2ZWx5IHNlYXJjaCB0aGUgZGlyZWN0aXZlcyBhc3NvY2lhdGVkXG4gICAqIHdpdGggYSBub2RlIHdpdGhvdXQgc2VhcmNoaW5nIHRoZSB3aG9sZSBkaXJlY3RpdmVzIGFycmF5LlxuICAgKi9cbiAgZmxhZ3M6IFROb2RlRmxhZ3M7XG5cbiAgLyoqIFRoZSB0YWcgbmFtZSBhc3NvY2lhdGVkIHdpdGggdGhpcyBub2RlLiAqL1xuICB0YWdOYW1lOiBzdHJpbmd8bnVsbDtcblxuICAvKipcbiAgICogU3RhdGljIGF0dHJpYnV0ZXMgYXNzb2NpYXRlZCB3aXRoIGFuIGVsZW1lbnQuIFdlIG5lZWQgdG8gc3RvcmVcbiAgICogc3RhdGljIGF0dHJpYnV0ZXMgdG8gc3VwcG9ydCBjb250ZW50IHByb2plY3Rpb24gd2l0aCBzZWxlY3RvcnMuXG4gICAqIEF0dHJpYnV0ZXMgYXJlIHN0b3JlZCBzdGF0aWNhbGx5IGJlY2F1c2UgcmVhZGluZyB0aGVtIGZyb20gdGhlIERPTVxuICAgKiB3b3VsZCBiZSB3YXkgdG9vIHNsb3cgZm9yIGNvbnRlbnQgcHJvamVjdGlvbiBhbmQgcXVlcmllcy5cbiAgICpcbiAgICogU2luY2UgYXR0cnMgd2lsbCBhbHdheXMgYmUgY2FsY3VsYXRlZCBmaXJzdCwgdGhleSB3aWxsIG5ldmVyIG5lZWRcbiAgICogdG8gYmUgbWFya2VkIHVuZGVmaW5lZCBieSBvdGhlciBpbnN0cnVjdGlvbnMuXG4gICAqXG4gICAqIFRoZSBuYW1lIG9mIHRoZSBhdHRyaWJ1dGUgYW5kIGl0cyB2YWx1ZSBhbHRlcm5hdGUgaW4gdGhlIGFycmF5LlxuICAgKiBlLmcuIFsncm9sZScsICdjaGVja2JveCddXG4gICAqL1xuICBhdHRyczogc3RyaW5nW118bnVsbDtcblxuICAvKipcbiAgICogQSBzZXQgb2YgbG9jYWwgbmFtZXMgdW5kZXIgd2hpY2ggYSBnaXZlbiBlbGVtZW50IGlzIGV4cG9ydGVkIGluIGEgdGVtcGxhdGUgYW5kXG4gICAqIHZpc2libGUgdG8gcXVlcmllcy4gQW4gZW50cnkgaW4gdGhpcyBhcnJheSBjYW4gYmUgY3JlYXRlZCBmb3IgZGlmZmVyZW50IHJlYXNvbnM6XG4gICAqIC0gYW4gZWxlbWVudCBpdHNlbGYgaXMgcmVmZXJlbmNlZCwgZXguOiBgPGRpdiAjZm9vPmBcbiAgICogLSBhIGNvbXBvbmVudCBpcyByZWZlcmVuY2VkLCBleC46IGA8bXktY21wdCAjZm9vPmBcbiAgICogLSBhIGRpcmVjdGl2ZSBpcyByZWZlcmVuY2VkLCBleC46IGA8bXktY21wdCAjZm9vPVwiZGlyZWN0aXZlRXhwb3J0QXNcIj5gLlxuICAgKlxuICAgKiBBIGdpdmVuIGVsZW1lbnQgbWlnaHQgaGF2ZSBkaWZmZXJlbnQgbG9jYWwgbmFtZXMgYW5kIHRob3NlIG5hbWVzIGNhbiBiZSBhc3NvY2lhdGVkXG4gICAqIHdpdGggYSBkaXJlY3RpdmUuIFdlIHN0b3JlIGxvY2FsIG5hbWVzIGF0IGV2ZW4gaW5kZXhlcyB3aGlsZSBvZGQgaW5kZXhlcyBhcmUgcmVzZXJ2ZWRcbiAgICogZm9yIGRpcmVjdGl2ZSBpbmRleCBpbiBhIHZpZXcgKG9yIGAtMWAgaWYgdGhlcmUgaXMgbm8gYXNzb2NpYXRlZCBkaXJlY3RpdmUpLlxuICAgKlxuICAgKiBTb21lIGV4YW1wbGVzOlxuICAgKiAtIGA8ZGl2ICNmb28+YCA9PiBgW1wiZm9vXCIsIC0xXWBcbiAgICogLSBgPG15LWNtcHQgI2Zvbz5gID0+IGBbXCJmb29cIiwgbXlDbXB0SWR4XWBcbiAgICogLSBgPG15LWNtcHQgI2ZvbyAjYmFyPVwiZGlyZWN0aXZlRXhwb3J0QXNcIj5gID0+IGBbXCJmb29cIiwgbXlDbXB0SWR4LCBcImJhclwiLCBkaXJlY3RpdmVJZHhdYFxuICAgKiAtIGA8ZGl2ICNmb28gI2Jhcj1cImRpcmVjdGl2ZUV4cG9ydEFzXCI+YCA9PiBgW1wiZm9vXCIsIC0xLCBcImJhclwiLCBkaXJlY3RpdmVJZHhdYFxuICAgKi9cbiAgbG9jYWxOYW1lczogKHN0cmluZ3xudW1iZXIpW118bnVsbDtcblxuICAvKiogSW5mb3JtYXRpb24gYWJvdXQgaW5wdXQgcHJvcGVydGllcyB0aGF0IG5lZWQgdG8gYmUgc2V0IG9uY2UgZnJvbSBhdHRyaWJ1dGUgZGF0YS4gKi9cbiAgaW5pdGlhbElucHV0czogSW5pdGlhbElucHV0RGF0YXxudWxsfHVuZGVmaW5lZDtcblxuICAvKipcbiAgICogSW5wdXQgZGF0YSBmb3IgYWxsIGRpcmVjdGl2ZXMgb24gdGhpcyBub2RlLlxuICAgKlxuICAgKiAtIGB1bmRlZmluZWRgIG1lYW5zIHRoYXQgdGhlIHByb3AgaGFzIG5vdCBiZWVuIGluaXRpYWxpemVkIHlldCxcbiAgICogLSBgbnVsbGAgbWVhbnMgdGhhdCB0aGUgcHJvcCBoYXMgYmVlbiBpbml0aWFsaXplZCBidXQgbm8gaW5wdXRzIGhhdmUgYmVlbiBmb3VuZC5cbiAgICovXG4gIGlucHV0czogUHJvcGVydHlBbGlhc2VzfG51bGx8dW5kZWZpbmVkO1xuXG4gIC8qKlxuICAgKiBPdXRwdXQgZGF0YSBmb3IgYWxsIGRpcmVjdGl2ZXMgb24gdGhpcyBub2RlLlxuICAgKlxuICAgKiAtIGB1bmRlZmluZWRgIG1lYW5zIHRoYXQgdGhlIHByb3AgaGFzIG5vdCBiZWVuIGluaXRpYWxpemVkIHlldCxcbiAgICogLSBgbnVsbGAgbWVhbnMgdGhhdCB0aGUgcHJvcCBoYXMgYmVlbiBpbml0aWFsaXplZCBidXQgbm8gb3V0cHV0cyBoYXZlIGJlZW4gZm91bmQuXG4gICAqL1xuICBvdXRwdXRzOiBQcm9wZXJ0eUFsaWFzZXN8bnVsbHx1bmRlZmluZWQ7XG5cbiAgLyoqXG4gICAqIFRoZSBzdGF0aWMgZGF0YSBlcXVpdmFsZW50IG9mIExOb2RlLmRhdGEuXG4gICAqXG4gICAqIElmIHRoaXMgVE5vZGUgY29ycmVzcG9uZHMgdG8gYW4gTENvbnRhaW5lck5vZGUsIHRoZSBjb250YWluZXIgd2lsbFxuICAgKiBuZWVkIHRvIHN0b3JlIHNlcGFyYXRlIHN0YXRpYyBkYXRhIGZvciBlYWNoIG9mIGl0cyB2aWV3cyAoVENvbnRhaW5lcikuXG4gICAqXG4gICAqIElmIHRoaXMgVE5vZGUgY29ycmVzcG9uZHMgdG8gYW4gTEVsZW1lbnROb2RlLCBkYXRhIHdpbGwgYmUgbnVsbC5cbiAgICovXG4gIGRhdGE6IFRDb250YWluZXJ8bnVsbDtcbn1cblxuLyoqIFN0YXRpYyBkYXRhIGZvciBhbiBMRWxlbWVudE5vZGUgICovXG5leHBvcnQgaW50ZXJmYWNlIFRFbGVtZW50Tm9kZSBleHRlbmRzIFROb2RlIHsgZGF0YTogbnVsbDsgfVxuXG4vKiogU3RhdGljIGRhdGEgZm9yIGFuIExDb250YWluZXJOb2RlICovXG5leHBvcnQgaW50ZXJmYWNlIFRDb250YWluZXJOb2RlIGV4dGVuZHMgVE5vZGUgeyBkYXRhOiBUQ29udGFpbmVyOyB9XG5cbi8qKlxuICogVGhpcyBtYXBwaW5nIGlzIG5lY2Vzc2FyeSBzbyB3ZSBjYW4gc2V0IGlucHV0IHByb3BlcnRpZXMgYW5kIG91dHB1dCBsaXN0ZW5lcnNcbiAqIHByb3Blcmx5IGF0IHJ1bnRpbWUgd2hlbiBwcm9wZXJ0eSBuYW1lcyBhcmUgbWluaWZpZWQgb3IgYWxpYXNlZC5cbiAqXG4gKiBLZXk6IHVubWluaWZpZWQgLyBwdWJsaWMgaW5wdXQgb3Igb3V0cHV0IG5hbWVcbiAqIFZhbHVlOiBhcnJheSBjb250YWluaW5nIG1pbmlmaWVkIC8gaW50ZXJuYWwgbmFtZSBhbmQgcmVsYXRlZCBkaXJlY3RpdmUgaW5kZXhcbiAqXG4gKiBUaGUgdmFsdWUgbXVzdCBiZSBhbiBhcnJheSB0byBzdXBwb3J0IGlucHV0cyBhbmQgb3V0cHV0cyB3aXRoIHRoZSBzYW1lIG5hbWVcbiAqIG9uIHRoZSBzYW1lIG5vZGUuXG4gKi9cbmV4cG9ydCB0eXBlIFByb3BlcnR5QWxpYXNlcyA9IHtcbiAgLy8gVGhpcyB1c2VzIGFuIG9iamVjdCBtYXAgYmVjYXVzZSB1c2luZyB0aGUgTWFwIHR5cGUgd291bGQgYmUgdG9vIHNsb3dcbiAgW2tleTogc3RyaW5nXTogUHJvcGVydHlBbGlhc1ZhbHVlXG59O1xuXG4vKipcbiAqIFN0b3JlIHRoZSBydW50aW1lIGlucHV0IG9yIG91dHB1dCBuYW1lcyBmb3IgYWxsIHRoZSBkaXJlY3RpdmVzLlxuICpcbiAqIC0gRXZlbiBpbmRpY2VzOiBkaXJlY3RpdmUgaW5kZXhcbiAqIC0gT2RkIGluZGljZXM6IG1pbmlmaWVkIC8gaW50ZXJuYWwgbmFtZVxuICpcbiAqIGUuZy4gWzAsICdjaGFuZ2UtbWluaWZpZWQnXVxuICovXG5leHBvcnQgdHlwZSBQcm9wZXJ0eUFsaWFzVmFsdWUgPSAobnVtYmVyIHwgc3RyaW5nKVtdO1xuXG5cbi8qKlxuICogVGhpcyBhcnJheSBjb250YWlucyBpbmZvcm1hdGlvbiBhYm91dCBpbnB1dCBwcm9wZXJ0aWVzIHRoYXRcbiAqIG5lZWQgdG8gYmUgc2V0IG9uY2UgZnJvbSBhdHRyaWJ1dGUgZGF0YS4gSXQncyBvcmRlcmVkIGJ5XG4gKiBkaXJlY3RpdmUgaW5kZXggKHJlbGF0aXZlIHRvIGVsZW1lbnQpIHNvIGl0J3Mgc2ltcGxlIHRvXG4gKiBsb29rIHVwIGEgc3BlY2lmaWMgZGlyZWN0aXZlJ3MgaW5pdGlhbCBpbnB1dCBkYXRhLlxuICpcbiAqIFdpdGhpbiBlYWNoIHN1Yi1hcnJheTpcbiAqXG4gKiBFdmVuIGluZGljZXM6IG1pbmlmaWVkL2ludGVybmFsIGlucHV0IG5hbWVcbiAqIE9kZCBpbmRpY2VzOiBpbml0aWFsIHZhbHVlXG4gKlxuICogSWYgYSBkaXJlY3RpdmUgb24gYSBub2RlIGRvZXMgbm90IGhhdmUgYW55IGlucHV0IHByb3BlcnRpZXNcbiAqIHRoYXQgc2hvdWxkIGJlIHNldCBmcm9tIGF0dHJpYnV0ZXMsIGl0cyBpbmRleCBpcyBzZXQgdG8gbnVsbFxuICogdG8gYXZvaWQgYSBzcGFyc2UgYXJyYXkuXG4gKlxuICogZS5nLiBbbnVsbCwgWydyb2xlLW1pbicsICdidXR0b24nXV1cbiAqL1xuZXhwb3J0IHR5cGUgSW5pdGlhbElucHV0RGF0YSA9IChJbml0aWFsSW5wdXRzIHwgbnVsbClbXTtcblxuLyoqXG4gKiBVc2VkIGJ5IEluaXRpYWxJbnB1dERhdGEgdG8gc3RvcmUgaW5wdXQgcHJvcGVydGllc1xuICogdGhhdCBzaG91bGQgYmUgc2V0IG9uY2UgZnJvbSBhdHRyaWJ1dGVzLlxuICpcbiAqIEV2ZW4gaW5kaWNlczogbWluaWZpZWQvaW50ZXJuYWwgaW5wdXQgbmFtZVxuICogT2RkIGluZGljZXM6IGluaXRpYWwgdmFsdWVcbiAqXG4gKiBlLmcuIFsncm9sZS1taW4nLCAnYnV0dG9uJ11cbiAqL1xuZXhwb3J0IHR5cGUgSW5pdGlhbElucHV0cyA9IHN0cmluZ1tdO1xuXG4vLyBOb3RlOiBUaGlzIGhhY2sgaXMgbmVjZXNzYXJ5IHNvIHdlIGRvbid0IGVycm9uZW91c2x5IGdldCBhIGNpcmN1bGFyIGRlcGVuZGVuY3lcbi8vIGZhaWx1cmUgYmFzZWQgb24gdHlwZXMuXG5leHBvcnQgY29uc3QgdW51c2VkVmFsdWVFeHBvcnRUb1BsYWNhdGVBamQgPSAxO1xuIl19