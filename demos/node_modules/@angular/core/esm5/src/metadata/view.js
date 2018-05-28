/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/**
 * Defines template and style encapsulation options available for Component's {@link Component}.
 *
 * See {@link Component#encapsulation encapsulation}.
 *
 */
/**
 * Defines template and style encapsulation options available for Component's {@link Component}.
 *
 * See {@link Component#encapsulation encapsulation}.
 *
 */
export var ViewEncapsulation;
/**
 * Defines template and style encapsulation options available for Component's {@link Component}.
 *
 * See {@link Component#encapsulation encapsulation}.
 *
 */
(function (ViewEncapsulation) {
    /**
     * Emulate `Native` scoping of styles by adding an attribute containing surrogate id to the Host
     * Element and pre-processing the style rules provided via {@link Component#styles styles} or
     * {@link Component#styleUrls styleUrls}, and adding the new Host Element attribute to all
     * selectors.
     *
     * This is the default option.
     */
    ViewEncapsulation[ViewEncapsulation["Emulated"] = 0] = "Emulated";
    /**
     * Use the native encapsulation mechanism of the renderer.
     *
     * For the DOM this means using [Shadow DOM](https://w3c.github.io/webcomponents/spec/shadow/) and
     * creating a ShadowRoot for Component's Host Element.
     */
    ViewEncapsulation[ViewEncapsulation["Native"] = 1] = "Native";
    /**
     * Don't provide any template or style encapsulation.
     */
    ViewEncapsulation[ViewEncapsulation["None"] = 2] = "None";
})(ViewEncapsulation || (ViewEncapsulation = {}));

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidmlldy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2NvcmUvc3JjL21ldGFkYXRhL3ZpZXcudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7OztBQUFBOzs7Ozs7R0FNRztBQUVIOzs7OztHQUtHOzs7Ozs7O0FBQ0gsTUFBTSxDQUFOLElBQVksaUJBcUJYOzs7Ozs7O0FBckJELFdBQVksaUJBQWlCO0lBQzNCOzs7Ozs7O09BT0c7SUFDSCxpRUFBWSxDQUFBO0lBQ1o7Ozs7O09BS0c7SUFDSCw2REFBVSxDQUFBO0lBQ1Y7O09BRUc7SUFDSCx5REFBUSxDQUFBO0dBcEJFLGlCQUFpQixLQUFqQixpQkFBaUIsUUFxQjVCIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBJbmMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG4vKipcbiAqIERlZmluZXMgdGVtcGxhdGUgYW5kIHN0eWxlIGVuY2Fwc3VsYXRpb24gb3B0aW9ucyBhdmFpbGFibGUgZm9yIENvbXBvbmVudCdzIHtAbGluayBDb21wb25lbnR9LlxuICpcbiAqIFNlZSB7QGxpbmsgQ29tcG9uZW50I2VuY2Fwc3VsYXRpb24gZW5jYXBzdWxhdGlvbn0uXG4gKlxuICovXG5leHBvcnQgZW51bSBWaWV3RW5jYXBzdWxhdGlvbiB7XG4gIC8qKlxuICAgKiBFbXVsYXRlIGBOYXRpdmVgIHNjb3Bpbmcgb2Ygc3R5bGVzIGJ5IGFkZGluZyBhbiBhdHRyaWJ1dGUgY29udGFpbmluZyBzdXJyb2dhdGUgaWQgdG8gdGhlIEhvc3RcbiAgICogRWxlbWVudCBhbmQgcHJlLXByb2Nlc3NpbmcgdGhlIHN0eWxlIHJ1bGVzIHByb3ZpZGVkIHZpYSB7QGxpbmsgQ29tcG9uZW50I3N0eWxlcyBzdHlsZXN9IG9yXG4gICAqIHtAbGluayBDb21wb25lbnQjc3R5bGVVcmxzIHN0eWxlVXJsc30sIGFuZCBhZGRpbmcgdGhlIG5ldyBIb3N0IEVsZW1lbnQgYXR0cmlidXRlIHRvIGFsbFxuICAgKiBzZWxlY3RvcnMuXG4gICAqXG4gICAqIFRoaXMgaXMgdGhlIGRlZmF1bHQgb3B0aW9uLlxuICAgKi9cbiAgRW11bGF0ZWQgPSAwLFxuICAvKipcbiAgICogVXNlIHRoZSBuYXRpdmUgZW5jYXBzdWxhdGlvbiBtZWNoYW5pc20gb2YgdGhlIHJlbmRlcmVyLlxuICAgKlxuICAgKiBGb3IgdGhlIERPTSB0aGlzIG1lYW5zIHVzaW5nIFtTaGFkb3cgRE9NXShodHRwczovL3czYy5naXRodWIuaW8vd2ViY29tcG9uZW50cy9zcGVjL3NoYWRvdy8pIGFuZFxuICAgKiBjcmVhdGluZyBhIFNoYWRvd1Jvb3QgZm9yIENvbXBvbmVudCdzIEhvc3QgRWxlbWVudC5cbiAgICovXG4gIE5hdGl2ZSA9IDEsXG4gIC8qKlxuICAgKiBEb24ndCBwcm92aWRlIGFueSB0ZW1wbGF0ZSBvciBzdHlsZSBlbmNhcHN1bGF0aW9uLlxuICAgKi9cbiAgTm9uZSA9IDJcbn1cbiJdfQ==