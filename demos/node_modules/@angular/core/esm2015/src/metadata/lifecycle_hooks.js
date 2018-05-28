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
 * A `changes` object whose keys are property names and
 * values are instances of {\@link SimpleChange}. See {\@link OnChanges}
 *
 * @record
 */
export function SimpleChanges() { }
function SimpleChanges_tsickle_Closure_declarations() {
    /* TODO: handle strange member:
    [propName: string]: SimpleChange;
    */
}
/**
 * \@usageNotes
 * {\@example core/ts/metadata/lifecycle_hooks_spec.ts region='OnChanges'}
 *
 * \@description
 * Lifecycle hook that is called when any data-bound property of a directive changes.
 *
 * `ngOnChanges` is called right after the data-bound properties have been checked and before view
 * and content children are checked if at least one of them has changed.
 * The `changes` parameter contains the changed properties.
 *
 * See {\@linkDocs guide/lifecycle-hooks#onchanges "Lifecycle Hooks Guide"}.
 *
 *
 * @record
 */
export function OnChanges() { }
function OnChanges_tsickle_Closure_declarations() {
    /** @type {?} */
    OnChanges.prototype.ngOnChanges;
}
/**
 * \@usageNotes
 * {\@example core/ts/metadata/lifecycle_hooks_spec.ts region='OnInit'}
 *
 * \@description
 * Lifecycle hook that is called after data-bound properties of a directive are
 * initialized.
 *
 * `ngOnInit` is called right after the directive's data-bound properties have been checked for the
 * first time, and before any of its children have been checked. It is invoked only once when the
 * directive is instantiated.
 *
 * See {\@linkDocs guide/lifecycle-hooks "Lifecycle Hooks Guide"}.
 *
 *
 * @record
 */
export function OnInit() { }
function OnInit_tsickle_Closure_declarations() {
    /** @type {?} */
    OnInit.prototype.ngOnInit;
}
/**
 * \@usageNotes
 * {\@example core/ts/metadata/lifecycle_hooks_spec.ts region='DoCheck'}
 *
 * \@description
 * Lifecycle hook that is called when Angular dirty checks a directive.
 *
 * `ngDoCheck` gets called to check the changes in the directives in addition to the default
 * algorithm. The default change detection algorithm looks for differences by comparing
 * bound-property values by reference across change detection runs.
 *
 * Note that a directive typically should not use both `DoCheck` and {\@link OnChanges} to respond to
 * changes on the same input, as `ngOnChanges` will continue to be called when the default change
 * detector detects changes.
 *
 * See {\@link KeyValueDiffers} and {\@link IterableDiffers} for implementing custom dirty checking
 * for collections.
 *
 * See {\@linkDocs guide/lifecycle-hooks#docheck "Lifecycle Hooks Guide"}.
 *
 *
 * @record
 */
export function DoCheck() { }
function DoCheck_tsickle_Closure_declarations() {
    /** @type {?} */
    DoCheck.prototype.ngDoCheck;
}
/**
 * \@usageNotes
 * {\@example core/ts/metadata/lifecycle_hooks_spec.ts region='OnDestroy'}
 *
 * \@description
 * Lifecycle hook that is called when a directive, pipe or service is destroyed.
 *
 * `ngOnDestroy` callback is typically used for any custom cleanup that needs to occur when the
 * instance is destroyed.
 *
 * See {\@linkDocs guide/lifecycle-hooks "Lifecycle Hooks Guide"}.
 *
 *
 * @record
 */
export function OnDestroy() { }
function OnDestroy_tsickle_Closure_declarations() {
    /** @type {?} */
    OnDestroy.prototype.ngOnDestroy;
}
/**
 *
 * \@usageNotes
 * {\@example core/ts/metadata/lifecycle_hooks_spec.ts region='AfterContentInit'}
 *
 * \@description
 * Lifecycle hook that is called after a directive's content has been fully
 * initialized.
 *
 * See {\@linkDocs guide/lifecycle-hooks#aftercontent "Lifecycle Hooks Guide"}.
 *
 *
 * @record
 */
export function AfterContentInit() { }
function AfterContentInit_tsickle_Closure_declarations() {
    /** @type {?} */
    AfterContentInit.prototype.ngAfterContentInit;
}
/**
 * \@usageNotes
 * {\@example core/ts/metadata/lifecycle_hooks_spec.ts region='AfterContentChecked'}
 *
 * \@description
 * Lifecycle hook that is called after every check of a directive's content.
 *
 * See {\@linkDocs guide/lifecycle-hooks#aftercontent "Lifecycle Hooks Guide"}.
 *
 *
 * @record
 */
export function AfterContentChecked() { }
function AfterContentChecked_tsickle_Closure_declarations() {
    /** @type {?} */
    AfterContentChecked.prototype.ngAfterContentChecked;
}
/**
 * \@usageNotes
 * {\@example core/ts/metadata/lifecycle_hooks_spec.ts region='AfterViewInit'}
 *
 * \@description
 * Lifecycle hook that is called after a component's view has been fully
 * initialized.
 *
 * See {\@linkDocs guide/lifecycle-hooks#afterview "Lifecycle Hooks Guide"}.
 *
 *
 * @record
 */
export function AfterViewInit() { }
function AfterViewInit_tsickle_Closure_declarations() {
    /** @type {?} */
    AfterViewInit.prototype.ngAfterViewInit;
}
/**
 * \@usageNotes
 * {\@example core/ts/metadata/lifecycle_hooks_spec.ts region='AfterViewChecked'}
 *
 * \@description
 * Lifecycle hook that is called after every check of a component's view.
 *
 * See {\@linkDocs guide/lifecycle-hooks#afterview "Lifecycle Hooks Guide"}.
 *
 *
 * @record
 */
export function AfterViewChecked() { }
function AfterViewChecked_tsickle_Closure_declarations() {
    /** @type {?} */
    AfterViewChecked.prototype.ngAfterViewChecked;
}

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGlmZWN5Y2xlX2hvb2tzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvY29yZS9zcmMvbWV0YWRhdGEvbGlmZWN5Y2xlX2hvb2tzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIEluYy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7U2ltcGxlQ2hhbmdlfSBmcm9tICcuLi9jaGFuZ2VfZGV0ZWN0aW9uL2NoYW5nZV9kZXRlY3Rpb25fdXRpbCc7XG5cblxuLyoqXG4gKiBBIGBjaGFuZ2VzYCBvYmplY3Qgd2hvc2Uga2V5cyBhcmUgcHJvcGVydHkgbmFtZXMgYW5kXG4gKiB2YWx1ZXMgYXJlIGluc3RhbmNlcyBvZiB7QGxpbmsgU2ltcGxlQ2hhbmdlfS4gU2VlIHtAbGluayBPbkNoYW5nZXN9XG4gKlxuICovXG5leHBvcnQgaW50ZXJmYWNlIFNpbXBsZUNoYW5nZXMgeyBbcHJvcE5hbWU6IHN0cmluZ106IFNpbXBsZUNoYW5nZTsgfVxuXG4vKipcbiAqIEB1c2FnZU5vdGVzXG4gKiB7QGV4YW1wbGUgY29yZS90cy9tZXRhZGF0YS9saWZlY3ljbGVfaG9va3Nfc3BlYy50cyByZWdpb249J09uQ2hhbmdlcyd9XG4gKlxuICogQGRlc2NyaXB0aW9uXG4gKiBMaWZlY3ljbGUgaG9vayB0aGF0IGlzIGNhbGxlZCB3aGVuIGFueSBkYXRhLWJvdW5kIHByb3BlcnR5IG9mIGEgZGlyZWN0aXZlIGNoYW5nZXMuXG4gKlxuICogYG5nT25DaGFuZ2VzYCBpcyBjYWxsZWQgcmlnaHQgYWZ0ZXIgdGhlIGRhdGEtYm91bmQgcHJvcGVydGllcyBoYXZlIGJlZW4gY2hlY2tlZCBhbmQgYmVmb3JlIHZpZXdcbiAqIGFuZCBjb250ZW50IGNoaWxkcmVuIGFyZSBjaGVja2VkIGlmIGF0IGxlYXN0IG9uZSBvZiB0aGVtIGhhcyBjaGFuZ2VkLlxuICogVGhlIGBjaGFuZ2VzYCBwYXJhbWV0ZXIgY29udGFpbnMgdGhlIGNoYW5nZWQgcHJvcGVydGllcy5cbiAqXG4gKiBTZWUge0BsaW5rRG9jcyBndWlkZS9saWZlY3ljbGUtaG9va3Mjb25jaGFuZ2VzIFwiTGlmZWN5Y2xlIEhvb2tzIEd1aWRlXCJ9LlxuICpcbiAqXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgT25DaGFuZ2VzIHsgbmdPbkNoYW5nZXMoY2hhbmdlczogU2ltcGxlQ2hhbmdlcyk6IHZvaWQ7IH1cblxuLyoqXG4gKiBAdXNhZ2VOb3Rlc1xuICoge0BleGFtcGxlIGNvcmUvdHMvbWV0YWRhdGEvbGlmZWN5Y2xlX2hvb2tzX3NwZWMudHMgcmVnaW9uPSdPbkluaXQnfVxuICpcbiAqIEBkZXNjcmlwdGlvblxuICogTGlmZWN5Y2xlIGhvb2sgdGhhdCBpcyBjYWxsZWQgYWZ0ZXIgZGF0YS1ib3VuZCBwcm9wZXJ0aWVzIG9mIGEgZGlyZWN0aXZlIGFyZVxuICogaW5pdGlhbGl6ZWQuXG4gKlxuICogYG5nT25Jbml0YCBpcyBjYWxsZWQgcmlnaHQgYWZ0ZXIgdGhlIGRpcmVjdGl2ZSdzIGRhdGEtYm91bmQgcHJvcGVydGllcyBoYXZlIGJlZW4gY2hlY2tlZCBmb3IgdGhlXG4gKiBmaXJzdCB0aW1lLCBhbmQgYmVmb3JlIGFueSBvZiBpdHMgY2hpbGRyZW4gaGF2ZSBiZWVuIGNoZWNrZWQuIEl0IGlzIGludm9rZWQgb25seSBvbmNlIHdoZW4gdGhlXG4gKiBkaXJlY3RpdmUgaXMgaW5zdGFudGlhdGVkLlxuICpcbiAqIFNlZSB7QGxpbmtEb2NzIGd1aWRlL2xpZmVjeWNsZS1ob29rcyBcIkxpZmVjeWNsZSBIb29rcyBHdWlkZVwifS5cbiAqXG4gKlxuICovXG5leHBvcnQgaW50ZXJmYWNlIE9uSW5pdCB7IG5nT25Jbml0KCk6IHZvaWQ7IH1cblxuLyoqXG4gKiBAdXNhZ2VOb3Rlc1xuICoge0BleGFtcGxlIGNvcmUvdHMvbWV0YWRhdGEvbGlmZWN5Y2xlX2hvb2tzX3NwZWMudHMgcmVnaW9uPSdEb0NoZWNrJ31cbiAqXG4gKiBAZGVzY3JpcHRpb25cbiAqIExpZmVjeWNsZSBob29rIHRoYXQgaXMgY2FsbGVkIHdoZW4gQW5ndWxhciBkaXJ0eSBjaGVja3MgYSBkaXJlY3RpdmUuXG4gKlxuICogYG5nRG9DaGVja2AgZ2V0cyBjYWxsZWQgdG8gY2hlY2sgdGhlIGNoYW5nZXMgaW4gdGhlIGRpcmVjdGl2ZXMgaW4gYWRkaXRpb24gdG8gdGhlIGRlZmF1bHRcbiAqIGFsZ29yaXRobS4gVGhlIGRlZmF1bHQgY2hhbmdlIGRldGVjdGlvbiBhbGdvcml0aG0gbG9va3MgZm9yIGRpZmZlcmVuY2VzIGJ5IGNvbXBhcmluZ1xuICogYm91bmQtcHJvcGVydHkgdmFsdWVzIGJ5IHJlZmVyZW5jZSBhY3Jvc3MgY2hhbmdlIGRldGVjdGlvbiBydW5zLlxuICpcbiAqIE5vdGUgdGhhdCBhIGRpcmVjdGl2ZSB0eXBpY2FsbHkgc2hvdWxkIG5vdCB1c2UgYm90aCBgRG9DaGVja2AgYW5kIHtAbGluayBPbkNoYW5nZXN9IHRvIHJlc3BvbmQgdG9cbiAqIGNoYW5nZXMgb24gdGhlIHNhbWUgaW5wdXQsIGFzIGBuZ09uQ2hhbmdlc2Agd2lsbCBjb250aW51ZSB0byBiZSBjYWxsZWQgd2hlbiB0aGUgZGVmYXVsdCBjaGFuZ2VcbiAqIGRldGVjdG9yIGRldGVjdHMgY2hhbmdlcy5cbiAqXG4gKiBTZWUge0BsaW5rIEtleVZhbHVlRGlmZmVyc30gYW5kIHtAbGluayBJdGVyYWJsZURpZmZlcnN9IGZvciBpbXBsZW1lbnRpbmcgY3VzdG9tIGRpcnR5IGNoZWNraW5nXG4gKiBmb3IgY29sbGVjdGlvbnMuXG4gKlxuICogU2VlIHtAbGlua0RvY3MgZ3VpZGUvbGlmZWN5Y2xlLWhvb2tzI2RvY2hlY2sgXCJMaWZlY3ljbGUgSG9va3MgR3VpZGVcIn0uXG4gKlxuICpcbiAqL1xuZXhwb3J0IGludGVyZmFjZSBEb0NoZWNrIHsgbmdEb0NoZWNrKCk6IHZvaWQ7IH1cblxuLyoqXG4gKiBAdXNhZ2VOb3Rlc1xuICoge0BleGFtcGxlIGNvcmUvdHMvbWV0YWRhdGEvbGlmZWN5Y2xlX2hvb2tzX3NwZWMudHMgcmVnaW9uPSdPbkRlc3Ryb3knfVxuICpcbiAqIEBkZXNjcmlwdGlvblxuICogTGlmZWN5Y2xlIGhvb2sgdGhhdCBpcyBjYWxsZWQgd2hlbiBhIGRpcmVjdGl2ZSwgcGlwZSBvciBzZXJ2aWNlIGlzIGRlc3Ryb3llZC5cbiAqXG4gKiBgbmdPbkRlc3Ryb3lgIGNhbGxiYWNrIGlzIHR5cGljYWxseSB1c2VkIGZvciBhbnkgY3VzdG9tIGNsZWFudXAgdGhhdCBuZWVkcyB0byBvY2N1ciB3aGVuIHRoZVxuICogaW5zdGFuY2UgaXMgZGVzdHJveWVkLlxuICpcbiAqIFNlZSB7QGxpbmtEb2NzIGd1aWRlL2xpZmVjeWNsZS1ob29rcyBcIkxpZmVjeWNsZSBIb29rcyBHdWlkZVwifS5cbiAqXG4gKlxuICovXG5leHBvcnQgaW50ZXJmYWNlIE9uRGVzdHJveSB7IG5nT25EZXN0cm95KCk6IHZvaWQ7IH1cblxuLyoqXG4gKlxuICogQHVzYWdlTm90ZXNcbiAqIHtAZXhhbXBsZSBjb3JlL3RzL21ldGFkYXRhL2xpZmVjeWNsZV9ob29rc19zcGVjLnRzIHJlZ2lvbj0nQWZ0ZXJDb250ZW50SW5pdCd9XG4gKlxuICogQGRlc2NyaXB0aW9uXG4gKiBMaWZlY3ljbGUgaG9vayB0aGF0IGlzIGNhbGxlZCBhZnRlciBhIGRpcmVjdGl2ZSdzIGNvbnRlbnQgaGFzIGJlZW4gZnVsbHlcbiAqIGluaXRpYWxpemVkLlxuICpcbiAqIFNlZSB7QGxpbmtEb2NzIGd1aWRlL2xpZmVjeWNsZS1ob29rcyNhZnRlcmNvbnRlbnQgXCJMaWZlY3ljbGUgSG9va3MgR3VpZGVcIn0uXG4gKlxuICpcbiAqL1xuZXhwb3J0IGludGVyZmFjZSBBZnRlckNvbnRlbnRJbml0IHsgbmdBZnRlckNvbnRlbnRJbml0KCk6IHZvaWQ7IH1cblxuLyoqXG4gKiBAdXNhZ2VOb3Rlc1xuICoge0BleGFtcGxlIGNvcmUvdHMvbWV0YWRhdGEvbGlmZWN5Y2xlX2hvb2tzX3NwZWMudHMgcmVnaW9uPSdBZnRlckNvbnRlbnRDaGVja2VkJ31cbiAqXG4gKiBAZGVzY3JpcHRpb25cbiAqIExpZmVjeWNsZSBob29rIHRoYXQgaXMgY2FsbGVkIGFmdGVyIGV2ZXJ5IGNoZWNrIG9mIGEgZGlyZWN0aXZlJ3MgY29udGVudC5cbiAqXG4gKiBTZWUge0BsaW5rRG9jcyBndWlkZS9saWZlY3ljbGUtaG9va3MjYWZ0ZXJjb250ZW50IFwiTGlmZWN5Y2xlIEhvb2tzIEd1aWRlXCJ9LlxuICpcbiAqXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgQWZ0ZXJDb250ZW50Q2hlY2tlZCB7IG5nQWZ0ZXJDb250ZW50Q2hlY2tlZCgpOiB2b2lkOyB9XG5cbi8qKlxuICogQHVzYWdlTm90ZXNcbiAqIHtAZXhhbXBsZSBjb3JlL3RzL21ldGFkYXRhL2xpZmVjeWNsZV9ob29rc19zcGVjLnRzIHJlZ2lvbj0nQWZ0ZXJWaWV3SW5pdCd9XG4gKlxuICogQGRlc2NyaXB0aW9uXG4gKiBMaWZlY3ljbGUgaG9vayB0aGF0IGlzIGNhbGxlZCBhZnRlciBhIGNvbXBvbmVudCdzIHZpZXcgaGFzIGJlZW4gZnVsbHlcbiAqIGluaXRpYWxpemVkLlxuICpcbiAqIFNlZSB7QGxpbmtEb2NzIGd1aWRlL2xpZmVjeWNsZS1ob29rcyNhZnRlcnZpZXcgXCJMaWZlY3ljbGUgSG9va3MgR3VpZGVcIn0uXG4gKlxuICpcbiAqL1xuZXhwb3J0IGludGVyZmFjZSBBZnRlclZpZXdJbml0IHsgbmdBZnRlclZpZXdJbml0KCk6IHZvaWQ7IH1cblxuLyoqXG4gKiBAdXNhZ2VOb3Rlc1xuICoge0BleGFtcGxlIGNvcmUvdHMvbWV0YWRhdGEvbGlmZWN5Y2xlX2hvb2tzX3NwZWMudHMgcmVnaW9uPSdBZnRlclZpZXdDaGVja2VkJ31cbiAqXG4gKiBAZGVzY3JpcHRpb25cbiAqIExpZmVjeWNsZSBob29rIHRoYXQgaXMgY2FsbGVkIGFmdGVyIGV2ZXJ5IGNoZWNrIG9mIGEgY29tcG9uZW50J3Mgdmlldy5cbiAqXG4gKiBTZWUge0BsaW5rRG9jcyBndWlkZS9saWZlY3ljbGUtaG9va3MjYWZ0ZXJ2aWV3IFwiTGlmZWN5Y2xlIEhvb2tzIEd1aWRlXCJ9LlxuICpcbiAqXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgQWZ0ZXJWaWV3Q2hlY2tlZCB7IG5nQWZ0ZXJWaWV3Q2hlY2tlZCgpOiB2b2lkOyB9XG4iXX0=