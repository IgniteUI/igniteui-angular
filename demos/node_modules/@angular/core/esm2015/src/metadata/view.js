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
const ViewEncapsulation = {
    /**
       * Emulate `Native` scoping of styles by adding an attribute containing surrogate id to the Host
       * Element and pre-processing the style rules provided via {@link Component#styles styles} or
       * {@link Component#styleUrls styleUrls}, and adding the new Host Element attribute to all
       * selectors.
       *
       * This is the default option.
       */
    Emulated: 0,
    /**
       * Use the native encapsulation mechanism of the renderer.
       *
       * For the DOM this means using [Shadow DOM](https://w3c.github.io/webcomponents/spec/shadow/) and
       * creating a ShadowRoot for Component's Host Element.
       */
    Native: 1,
    /**
       * Don't provide any template or style encapsulation.
       */
    None: 2,
};
export { ViewEncapsulation };
ViewEncapsulation[ViewEncapsulation.Emulated] = "Emulated";
ViewEncapsulation[ViewEncapsulation.Native] = "Native";
ViewEncapsulation[ViewEncapsulation.None] = "None";

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidmlldy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2NvcmUvc3JjL21ldGFkYXRhL3ZpZXcudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IiIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgSW5jLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuLyoqXG4gKiBEZWZpbmVzIHRlbXBsYXRlIGFuZCBzdHlsZSBlbmNhcHN1bGF0aW9uIG9wdGlvbnMgYXZhaWxhYmxlIGZvciBDb21wb25lbnQncyB7QGxpbmsgQ29tcG9uZW50fS5cbiAqXG4gKiBTZWUge0BsaW5rIENvbXBvbmVudCNlbmNhcHN1bGF0aW9uIGVuY2Fwc3VsYXRpb259LlxuICpcbiAqL1xuZXhwb3J0IGVudW0gVmlld0VuY2Fwc3VsYXRpb24ge1xuICAvKipcbiAgICogRW11bGF0ZSBgTmF0aXZlYCBzY29waW5nIG9mIHN0eWxlcyBieSBhZGRpbmcgYW4gYXR0cmlidXRlIGNvbnRhaW5pbmcgc3Vycm9nYXRlIGlkIHRvIHRoZSBIb3N0XG4gICAqIEVsZW1lbnQgYW5kIHByZS1wcm9jZXNzaW5nIHRoZSBzdHlsZSBydWxlcyBwcm92aWRlZCB2aWEge0BsaW5rIENvbXBvbmVudCNzdHlsZXMgc3R5bGVzfSBvclxuICAgKiB7QGxpbmsgQ29tcG9uZW50I3N0eWxlVXJscyBzdHlsZVVybHN9LCBhbmQgYWRkaW5nIHRoZSBuZXcgSG9zdCBFbGVtZW50IGF0dHJpYnV0ZSB0byBhbGxcbiAgICogc2VsZWN0b3JzLlxuICAgKlxuICAgKiBUaGlzIGlzIHRoZSBkZWZhdWx0IG9wdGlvbi5cbiAgICovXG4gIEVtdWxhdGVkID0gMCxcbiAgLyoqXG4gICAqIFVzZSB0aGUgbmF0aXZlIGVuY2Fwc3VsYXRpb24gbWVjaGFuaXNtIG9mIHRoZSByZW5kZXJlci5cbiAgICpcbiAgICogRm9yIHRoZSBET00gdGhpcyBtZWFucyB1c2luZyBbU2hhZG93IERPTV0oaHR0cHM6Ly93M2MuZ2l0aHViLmlvL3dlYmNvbXBvbmVudHMvc3BlYy9zaGFkb3cvKSBhbmRcbiAgICogY3JlYXRpbmcgYSBTaGFkb3dSb290IGZvciBDb21wb25lbnQncyBIb3N0IEVsZW1lbnQuXG4gICAqL1xuICBOYXRpdmUgPSAxLFxuICAvKipcbiAgICogRG9uJ3QgcHJvdmlkZSBhbnkgdGVtcGxhdGUgb3Igc3R5bGUgZW5jYXBzdWxhdGlvbi5cbiAgICovXG4gIE5vbmUgPSAyXG59XG4iXX0=