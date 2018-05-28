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
const RendererStyleFlags3 = {
    Important: 1,
    DashCase: 2,
};
export { RendererStyleFlags3 };
RendererStyleFlags3[RendererStyleFlags3.Important] = "Important";
RendererStyleFlags3[RendererStyleFlags3.DashCase] = "DashCase";
/**
 * Object Oriented style of API needed to create elements and text nodes.
 *
 * This is the native browser API style, e.g. operations are methods on individual objects
 * like HTMLElement. With this style, no additional code is needed as a facade
 * (reducing payload size).
 *
 * @record
 */
export function ObjectOrientedRenderer3() { }
function ObjectOrientedRenderer3_tsickle_Closure_declarations() {
    /** @type {?} */
    ObjectOrientedRenderer3.prototype.createElement;
    /** @type {?} */
    ObjectOrientedRenderer3.prototype.createTextNode;
    /** @type {?} */
    ObjectOrientedRenderer3.prototype.querySelector;
}
/**
 * Returns whether the `renderer` is a `ProceduralRenderer3`
 * @param {?} renderer
 * @return {?}
 */
export function isProceduralRenderer(renderer) {
    return !!((/** @type {?} */ (renderer)).listen);
}
/**
 * Procedural style of API needed to create elements and text nodes.
 *
 * In non-native browser environments (e.g. platforms such as web-workers), this is the
 * facade that enables element manipulation. This also facilitates backwards compatibility
 * with Renderer2.
 * @record
 */
export function ProceduralRenderer3() { }
function ProceduralRenderer3_tsickle_Closure_declarations() {
    /** @type {?} */
    ProceduralRenderer3.prototype.destroy;
    /** @type {?} */
    ProceduralRenderer3.prototype.createElement;
    /** @type {?} */
    ProceduralRenderer3.prototype.createText;
    /**
     * This property is allowed to be null / undefined,
     * in which case the view engine won't call it.
     * This is used as a performance optimization for production mode.
     * @type {?|undefined}
     */
    ProceduralRenderer3.prototype.destroyNode;
    /** @type {?} */
    ProceduralRenderer3.prototype.appendChild;
    /** @type {?} */
    ProceduralRenderer3.prototype.insertBefore;
    /** @type {?} */
    ProceduralRenderer3.prototype.removeChild;
    /** @type {?} */
    ProceduralRenderer3.prototype.selectRootElement;
    /** @type {?} */
    ProceduralRenderer3.prototype.setAttribute;
    /** @type {?} */
    ProceduralRenderer3.prototype.removeAttribute;
    /** @type {?} */
    ProceduralRenderer3.prototype.addClass;
    /** @type {?} */
    ProceduralRenderer3.prototype.removeClass;
    /** @type {?} */
    ProceduralRenderer3.prototype.setStyle;
    /** @type {?} */
    ProceduralRenderer3.prototype.removeStyle;
    /** @type {?} */
    ProceduralRenderer3.prototype.setProperty;
    /** @type {?} */
    ProceduralRenderer3.prototype.setValue;
    /** @type {?} */
    ProceduralRenderer3.prototype.listen;
}
/**
 * @record
 */
export function RendererFactory3() { }
function RendererFactory3_tsickle_Closure_declarations() {
    /** @type {?} */
    RendererFactory3.prototype.createRenderer;
    /** @type {?|undefined} */
    RendererFactory3.prototype.begin;
    /** @type {?|undefined} */
    RendererFactory3.prototype.end;
}
export const /** @type {?} */ domRendererFactory3 = {
    createRenderer: (hostElement, rendererType) => { return document; }
};
/**
 * Subset of API needed for appending elements and text nodes.
 * @record
 */
export function RNode() { }
function RNode_tsickle_Closure_declarations() {
    /** @type {?} */
    RNode.prototype.removeChild;
    /**
     * Insert a child node.
     *
     * Used exclusively for adding View root nodes into ViewAnchor location.
     * @type {?}
     */
    RNode.prototype.insertBefore;
    /**
     * Append a child node.
     *
     * Used exclusively for building up DOM which are static (ie not View roots)
     * @type {?}
     */
    RNode.prototype.appendChild;
}
/**
 * Subset of API needed for writing attributes, properties, and setting up
 * listeners on Element.
 * @record
 */
export function RElement() { }
function RElement_tsickle_Closure_declarations() {
    /** @type {?} */
    RElement.prototype.style;
    /** @type {?} */
    RElement.prototype.classList;
    /** @type {?} */
    RElement.prototype.className;
    /** @type {?} */
    RElement.prototype.setAttribute;
    /** @type {?} */
    RElement.prototype.removeAttribute;
    /** @type {?} */
    RElement.prototype.setAttributeNS;
    /** @type {?} */
    RElement.prototype.addEventListener;
    /** @type {?} */
    RElement.prototype.removeEventListener;
    /** @type {?|undefined} */
    RElement.prototype.setProperty;
}
/**
 * @record
 */
export function RCssStyleDeclaration() { }
function RCssStyleDeclaration_tsickle_Closure_declarations() {
    /** @type {?} */
    RCssStyleDeclaration.prototype.removeProperty;
    /** @type {?} */
    RCssStyleDeclaration.prototype.setProperty;
}
/**
 * @record
 */
export function RDomTokenList() { }
function RDomTokenList_tsickle_Closure_declarations() {
    /** @type {?} */
    RDomTokenList.prototype.add;
    /** @type {?} */
    RDomTokenList.prototype.remove;
}
/**
 * @record
 */
export function RText() { }
function RText_tsickle_Closure_declarations() {
    /** @type {?} */
    RText.prototype.textContent;
}
// Note: This hack is necessary so we don't erroneously get a circular dependency
// failure based on types.
export const /** @type {?} */ unusedValueExportToPlacateAjd = 1;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVuZGVyZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb3JlL3NyYy9yZW5kZXIzL2ludGVyZmFjZXMvcmVuZGVyZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBNENBLE1BQU0sK0JBQStCLFFBQXVEO0lBRTFGLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxtQkFBQyxRQUFlLEVBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQztDQUNyQzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBNkNELE1BQU0sQ0FBQyx1QkFBTSxtQkFBbUIsR0FBcUI7SUFDbkQsY0FBYyxFQUFFLENBQUMsV0FBNEIsRUFBRSxZQUFrQyxFQUNuRCxFQUFFLEdBQUcsTUFBTSxDQUFDLFFBQVEsQ0FBQyxFQUFDO0NBQ3JELENBQUM7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBb0RGLE1BQU0sQ0FBQyx1QkFBTSw2QkFBNkIsR0FBRyxDQUFDLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIEluYy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbi8qKlxuICogVGhlIGdvYWwgaGVyZSBpcyB0byBtYWtlIHN1cmUgdGhhdCB0aGUgYnJvd3NlciBET00gQVBJIGlzIHRoZSBSZW5kZXJlci5cbiAqIFdlIGRvIHRoaXMgYnkgZGVmaW5pbmcgYSBzdWJzZXQgb2YgRE9NIEFQSSB0byBiZSB0aGUgcmVuZGVyZXIgYW5kIHRoYW5cbiAqIHVzZSB0aGF0IHRpbWUgZm9yIHJlbmRlcmluZy5cbiAqXG4gKiBBdCBydW50aW1lIHdlIGNhbiB0aGFuIHVzZSB0aGUgRE9NIGFwaSBkaXJlY3RseSwgaW4gc2VydmVyIG9yIHdlYi13b3JrZXJcbiAqIGl0IHdpbGwgYmUgZWFzeSB0byBpbXBsZW1lbnQgc3VjaCBBUEkuXG4gKi9cblxuaW1wb3J0IHtWaWV3RW5jYXBzdWxhdGlvbn0gZnJvbSAnLi4vLi4vbWV0YWRhdGEvdmlldyc7XG5pbXBvcnQge1JlbmRlcmVyU3R5bGVGbGFnczIsIFJlbmRlcmVyVHlwZTJ9IGZyb20gJy4uLy4uL3JlbmRlci9hcGknO1xuXG5cbi8vIFRPRE86IGNsZWFudXAgb25jZSB0aGUgY29kZSBpcyBtZXJnZWQgaW4gYW5ndWxhci9hbmd1bGFyXG5leHBvcnQgZW51bSBSZW5kZXJlclN0eWxlRmxhZ3MzIHtcbiAgSW1wb3J0YW50ID0gMSA8PCAwLFxuICBEYXNoQ2FzZSA9IDEgPDwgMVxufVxuXG5leHBvcnQgdHlwZSBSZW5kZXJlcjMgPSBPYmplY3RPcmllbnRlZFJlbmRlcmVyMyB8IFByb2NlZHVyYWxSZW5kZXJlcjM7XG5cbi8qKlxuICogT2JqZWN0IE9yaWVudGVkIHN0eWxlIG9mIEFQSSBuZWVkZWQgdG8gY3JlYXRlIGVsZW1lbnRzIGFuZCB0ZXh0IG5vZGVzLlxuICpcbiAqIFRoaXMgaXMgdGhlIG5hdGl2ZSBicm93c2VyIEFQSSBzdHlsZSwgZS5nLiBvcGVyYXRpb25zIGFyZSBtZXRob2RzIG9uIGluZGl2aWR1YWwgb2JqZWN0c1xuICogbGlrZSBIVE1MRWxlbWVudC4gV2l0aCB0aGlzIHN0eWxlLCBubyBhZGRpdGlvbmFsIGNvZGUgaXMgbmVlZGVkIGFzIGEgZmFjYWRlXG4gKiAocmVkdWNpbmcgcGF5bG9hZCBzaXplKS5cbiAqICovXG5leHBvcnQgaW50ZXJmYWNlIE9iamVjdE9yaWVudGVkUmVuZGVyZXIzIHtcbiAgY3JlYXRlRWxlbWVudCh0YWdOYW1lOiBzdHJpbmcpOiBSRWxlbWVudDtcbiAgY3JlYXRlVGV4dE5vZGUoZGF0YTogc3RyaW5nKTogUlRleHQ7XG5cbiAgcXVlcnlTZWxlY3RvcihzZWxlY3RvcnM6IHN0cmluZyk6IFJFbGVtZW50fG51bGw7XG59XG5cbi8qKiBSZXR1cm5zIHdoZXRoZXIgdGhlIGByZW5kZXJlcmAgaXMgYSBgUHJvY2VkdXJhbFJlbmRlcmVyM2AgKi9cbmV4cG9ydCBmdW5jdGlvbiBpc1Byb2NlZHVyYWxSZW5kZXJlcihyZW5kZXJlcjogUHJvY2VkdXJhbFJlbmRlcmVyMyB8IE9iamVjdE9yaWVudGVkUmVuZGVyZXIzKTpcbiAgICByZW5kZXJlciBpcyBQcm9jZWR1cmFsUmVuZGVyZXIzIHtcbiAgcmV0dXJuICEhKChyZW5kZXJlciBhcyBhbnkpLmxpc3Rlbik7XG59XG5cbi8qKlxuICogUHJvY2VkdXJhbCBzdHlsZSBvZiBBUEkgbmVlZGVkIHRvIGNyZWF0ZSBlbGVtZW50cyBhbmQgdGV4dCBub2Rlcy5cbiAqXG4gKiBJbiBub24tbmF0aXZlIGJyb3dzZXIgZW52aXJvbm1lbnRzIChlLmcuIHBsYXRmb3JtcyBzdWNoIGFzIHdlYi13b3JrZXJzKSwgdGhpcyBpcyB0aGVcbiAqIGZhY2FkZSB0aGF0IGVuYWJsZXMgZWxlbWVudCBtYW5pcHVsYXRpb24uIFRoaXMgYWxzbyBmYWNpbGl0YXRlcyBiYWNrd2FyZHMgY29tcGF0aWJpbGl0eVxuICogd2l0aCBSZW5kZXJlcjIuXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgUHJvY2VkdXJhbFJlbmRlcmVyMyB7XG4gIGRlc3Ryb3koKTogdm9pZDtcbiAgY3JlYXRlRWxlbWVudChuYW1lOiBzdHJpbmcsIG5hbWVzcGFjZT86IHN0cmluZ3xudWxsKTogUkVsZW1lbnQ7XG4gIGNyZWF0ZVRleHQodmFsdWU6IHN0cmluZyk6IFJUZXh0O1xuICAvKipcbiAgICogVGhpcyBwcm9wZXJ0eSBpcyBhbGxvd2VkIHRvIGJlIG51bGwgLyB1bmRlZmluZWQsXG4gICAqIGluIHdoaWNoIGNhc2UgdGhlIHZpZXcgZW5naW5lIHdvbid0IGNhbGwgaXQuXG4gICAqIFRoaXMgaXMgdXNlZCBhcyBhIHBlcmZvcm1hbmNlIG9wdGltaXphdGlvbiBmb3IgcHJvZHVjdGlvbiBtb2RlLlxuICAgKi9cbiAgZGVzdHJveU5vZGU/OiAoKG5vZGU6IFJOb2RlKSA9PiB2b2lkKXxudWxsO1xuICBhcHBlbmRDaGlsZChwYXJlbnQ6IFJFbGVtZW50LCBuZXdDaGlsZDogUk5vZGUpOiB2b2lkO1xuICBpbnNlcnRCZWZvcmUocGFyZW50OiBSTm9kZSwgbmV3Q2hpbGQ6IFJOb2RlLCByZWZDaGlsZDogUk5vZGV8bnVsbCk6IHZvaWQ7XG4gIHJlbW92ZUNoaWxkKHBhcmVudDogUkVsZW1lbnQsIG9sZENoaWxkOiBSTm9kZSk6IHZvaWQ7XG4gIHNlbGVjdFJvb3RFbGVtZW50KHNlbGVjdG9yT3JOb2RlOiBzdHJpbmd8YW55KTogUkVsZW1lbnQ7XG5cbiAgc2V0QXR0cmlidXRlKGVsOiBSRWxlbWVudCwgbmFtZTogc3RyaW5nLCB2YWx1ZTogc3RyaW5nLCBuYW1lc3BhY2U/OiBzdHJpbmd8bnVsbCk6IHZvaWQ7XG4gIHJlbW92ZUF0dHJpYnV0ZShlbDogUkVsZW1lbnQsIG5hbWU6IHN0cmluZywgbmFtZXNwYWNlPzogc3RyaW5nfG51bGwpOiB2b2lkO1xuICBhZGRDbGFzcyhlbDogUkVsZW1lbnQsIG5hbWU6IHN0cmluZyk6IHZvaWQ7XG4gIHJlbW92ZUNsYXNzKGVsOiBSRWxlbWVudCwgbmFtZTogc3RyaW5nKTogdm9pZDtcbiAgc2V0U3R5bGUoXG4gICAgICBlbDogUkVsZW1lbnQsIHN0eWxlOiBzdHJpbmcsIHZhbHVlOiBhbnksXG4gICAgICBmbGFncz86IFJlbmRlcmVyU3R5bGVGbGFnczJ8UmVuZGVyZXJTdHlsZUZsYWdzMyk6IHZvaWQ7XG4gIHJlbW92ZVN0eWxlKGVsOiBSRWxlbWVudCwgc3R5bGU6IHN0cmluZywgZmxhZ3M/OiBSZW5kZXJlclN0eWxlRmxhZ3MyfFJlbmRlcmVyU3R5bGVGbGFnczMpOiB2b2lkO1xuICBzZXRQcm9wZXJ0eShlbDogUkVsZW1lbnQsIG5hbWU6IHN0cmluZywgdmFsdWU6IGFueSk6IHZvaWQ7XG4gIHNldFZhbHVlKG5vZGU6IFJUZXh0LCB2YWx1ZTogc3RyaW5nKTogdm9pZDtcblxuICAvLyBUT0RPKG1pc2tvKTogRGVwcmVjYXRlIGluIGZhdm9yIG9mIGFkZEV2ZW50TGlzdGVuZXIvcmVtb3ZlRXZlbnRMaXN0ZW5lclxuICBsaXN0ZW4odGFyZ2V0OiBSTm9kZSwgZXZlbnROYW1lOiBzdHJpbmcsIGNhbGxiYWNrOiAoZXZlbnQ6IGFueSkgPT4gYm9vbGVhbiB8IHZvaWQpOiAoKSA9PiB2b2lkO1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIFJlbmRlcmVyRmFjdG9yeTMge1xuICBjcmVhdGVSZW5kZXJlcihob3N0RWxlbWVudDogUkVsZW1lbnR8bnVsbCwgcmVuZGVyZXJUeXBlOiBSZW5kZXJlclR5cGUyfG51bGwpOiBSZW5kZXJlcjM7XG4gIGJlZ2luPygpOiB2b2lkO1xuICBlbmQ/KCk6IHZvaWQ7XG59XG5cbmV4cG9ydCBjb25zdCBkb21SZW5kZXJlckZhY3RvcnkzOiBSZW5kZXJlckZhY3RvcnkzID0ge1xuICBjcmVhdGVSZW5kZXJlcjogKGhvc3RFbGVtZW50OiBSRWxlbWVudCB8IG51bGwsIHJlbmRlcmVyVHlwZTogUmVuZGVyZXJUeXBlMiB8IG51bGwpOlxuICAgICAgICAgICAgICAgICAgICAgIFJlbmRlcmVyMyA9PiB7IHJldHVybiBkb2N1bWVudDt9XG59O1xuXG4vKiogU3Vic2V0IG9mIEFQSSBuZWVkZWQgZm9yIGFwcGVuZGluZyBlbGVtZW50cyBhbmQgdGV4dCBub2Rlcy4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgUk5vZGUge1xuICByZW1vdmVDaGlsZChvbGRDaGlsZDogUk5vZGUpOiB2b2lkO1xuXG4gIC8qKlxuICAgKiBJbnNlcnQgYSBjaGlsZCBub2RlLlxuICAgKlxuICAgKiBVc2VkIGV4Y2x1c2l2ZWx5IGZvciBhZGRpbmcgVmlldyByb290IG5vZGVzIGludG8gVmlld0FuY2hvciBsb2NhdGlvbi5cbiAgICovXG4gIGluc2VydEJlZm9yZShuZXdDaGlsZDogUk5vZGUsIHJlZkNoaWxkOiBSTm9kZXxudWxsLCBpc1ZpZXdSb290OiBib29sZWFuKTogdm9pZDtcblxuICAvKipcbiAgICogQXBwZW5kIGEgY2hpbGQgbm9kZS5cbiAgICpcbiAgICogVXNlZCBleGNsdXNpdmVseSBmb3IgYnVpbGRpbmcgdXAgRE9NIHdoaWNoIGFyZSBzdGF0aWMgKGllIG5vdCBWaWV3IHJvb3RzKVxuICAgKi9cbiAgYXBwZW5kQ2hpbGQobmV3Q2hpbGQ6IFJOb2RlKTogUk5vZGU7XG59XG5cbi8qKlxuICogU3Vic2V0IG9mIEFQSSBuZWVkZWQgZm9yIHdyaXRpbmcgYXR0cmlidXRlcywgcHJvcGVydGllcywgYW5kIHNldHRpbmcgdXBcbiAqIGxpc3RlbmVycyBvbiBFbGVtZW50LlxuICovXG5leHBvcnQgaW50ZXJmYWNlIFJFbGVtZW50IGV4dGVuZHMgUk5vZGUge1xuICBzdHlsZTogUkNzc1N0eWxlRGVjbGFyYXRpb247XG4gIGNsYXNzTGlzdDogUkRvbVRva2VuTGlzdDtcbiAgY2xhc3NOYW1lOiBzdHJpbmc7XG4gIHNldEF0dHJpYnV0ZShuYW1lOiBzdHJpbmcsIHZhbHVlOiBzdHJpbmcpOiB2b2lkO1xuICByZW1vdmVBdHRyaWJ1dGUobmFtZTogc3RyaW5nKTogdm9pZDtcbiAgc2V0QXR0cmlidXRlTlMobmFtZXNwYWNlVVJJOiBzdHJpbmcsIHF1YWxpZmllZE5hbWU6IHN0cmluZywgdmFsdWU6IHN0cmluZyk6IHZvaWQ7XG4gIGFkZEV2ZW50TGlzdGVuZXIodHlwZTogc3RyaW5nLCBsaXN0ZW5lcjogRXZlbnRMaXN0ZW5lciwgdXNlQ2FwdHVyZT86IGJvb2xlYW4pOiB2b2lkO1xuICByZW1vdmVFdmVudExpc3RlbmVyKHR5cGU6IHN0cmluZywgbGlzdGVuZXI/OiBFdmVudExpc3RlbmVyLCBvcHRpb25zPzogYm9vbGVhbik6IHZvaWQ7XG5cbiAgc2V0UHJvcGVydHk/KG5hbWU6IHN0cmluZywgdmFsdWU6IGFueSk6IHZvaWQ7XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgUkNzc1N0eWxlRGVjbGFyYXRpb24ge1xuICByZW1vdmVQcm9wZXJ0eShwcm9wZXJ0eU5hbWU6IHN0cmluZyk6IHN0cmluZztcbiAgc2V0UHJvcGVydHkocHJvcGVydHlOYW1lOiBzdHJpbmcsIHZhbHVlOiBzdHJpbmd8bnVsbCwgcHJpb3JpdHk/OiBzdHJpbmcpOiB2b2lkO1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIFJEb21Ub2tlbkxpc3Qge1xuICBhZGQodG9rZW46IHN0cmluZyk6IHZvaWQ7XG4gIHJlbW92ZSh0b2tlbjogc3RyaW5nKTogdm9pZDtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBSVGV4dCBleHRlbmRzIFJOb2RlIHsgdGV4dENvbnRlbnQ6IHN0cmluZ3xudWxsOyB9XG5cbi8vIE5vdGU6IFRoaXMgaGFjayBpcyBuZWNlc3Nhcnkgc28gd2UgZG9uJ3QgZXJyb25lb3VzbHkgZ2V0IGEgY2lyY3VsYXIgZGVwZW5kZW5jeVxuLy8gZmFpbHVyZSBiYXNlZCBvbiB0eXBlcy5cbmV4cG9ydCBjb25zdCB1bnVzZWRWYWx1ZUV4cG9ydFRvUGxhY2F0ZUFqZCA9IDE7XG4iXX0=