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
export const /** @type {?} */ FormErrorExamples = {
    formControlName: `
    <div [formGroup]="myGroup">
      <input formControlName="firstName">
    </div>

    In your class:

    this.myGroup = new FormGroup({
       firstName: new FormControl()
    });`,
    formGroupName: `
    <div [formGroup]="myGroup">
       <div formGroupName="person">
          <input formControlName="firstName">
       </div>
    </div>

    In your class:

    this.myGroup = new FormGroup({
       person: new FormGroup({ firstName: new FormControl() })
    });`,
    formArrayName: `
    <div [formGroup]="myGroup">
      <div formArrayName="cities">
        <div *ngFor="let city of cityArray.controls; index as i">
          <input [formControlName]="i">
        </div>
      </div>
    </div>

    In your class:

    this.cityArray = new FormArray([new FormControl('SF')]);
    this.myGroup = new FormGroup({
      cities: this.cityArray
    });`,
    ngModelGroup: `
    <form>
       <div ngModelGroup="person">
          <input [(ngModel)]="person.name" name="firstName">
       </div>
    </form>`,
    ngModelWithFormGroup: `
    <div [formGroup]="myGroup">
       <input formControlName="firstName">
       <input [(ngModel)]="showMoreControls" [ngModelOptions]="{standalone: true}">
    </div>
  `
};

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXJyb3JfZXhhbXBsZXMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9mb3Jtcy9zcmMvZGlyZWN0aXZlcy9lcnJvcl9leGFtcGxlcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7OztBQVFBLE1BQU0sQ0FBQyx1QkFBTSxpQkFBaUIsR0FBRztJQUMvQixlQUFlLEVBQUU7Ozs7Ozs7OztRQVNYO0lBRU4sYUFBYSxFQUFFOzs7Ozs7Ozs7OztRQVdUO0lBRU4sYUFBYSxFQUFFOzs7Ozs7Ozs7Ozs7OztRQWNUO0lBRU4sWUFBWSxFQUFFOzs7OztZQUtKO0lBRVYsb0JBQW9CLEVBQUU7Ozs7O0dBS3JCO0NBQ0YsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgSW5jLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuZXhwb3J0IGNvbnN0IEZvcm1FcnJvckV4YW1wbGVzID0ge1xuICBmb3JtQ29udHJvbE5hbWU6IGBcbiAgICA8ZGl2IFtmb3JtR3JvdXBdPVwibXlHcm91cFwiPlxuICAgICAgPGlucHV0IGZvcm1Db250cm9sTmFtZT1cImZpcnN0TmFtZVwiPlxuICAgIDwvZGl2PlxuXG4gICAgSW4geW91ciBjbGFzczpcblxuICAgIHRoaXMubXlHcm91cCA9IG5ldyBGb3JtR3JvdXAoe1xuICAgICAgIGZpcnN0TmFtZTogbmV3IEZvcm1Db250cm9sKClcbiAgICB9KTtgLFxuXG4gIGZvcm1Hcm91cE5hbWU6IGBcbiAgICA8ZGl2IFtmb3JtR3JvdXBdPVwibXlHcm91cFwiPlxuICAgICAgIDxkaXYgZm9ybUdyb3VwTmFtZT1cInBlcnNvblwiPlxuICAgICAgICAgIDxpbnB1dCBmb3JtQ29udHJvbE5hbWU9XCJmaXJzdE5hbWVcIj5cbiAgICAgICA8L2Rpdj5cbiAgICA8L2Rpdj5cblxuICAgIEluIHlvdXIgY2xhc3M6XG5cbiAgICB0aGlzLm15R3JvdXAgPSBuZXcgRm9ybUdyb3VwKHtcbiAgICAgICBwZXJzb246IG5ldyBGb3JtR3JvdXAoeyBmaXJzdE5hbWU6IG5ldyBGb3JtQ29udHJvbCgpIH0pXG4gICAgfSk7YCxcblxuICBmb3JtQXJyYXlOYW1lOiBgXG4gICAgPGRpdiBbZm9ybUdyb3VwXT1cIm15R3JvdXBcIj5cbiAgICAgIDxkaXYgZm9ybUFycmF5TmFtZT1cImNpdGllc1wiPlxuICAgICAgICA8ZGl2ICpuZ0Zvcj1cImxldCBjaXR5IG9mIGNpdHlBcnJheS5jb250cm9sczsgaW5kZXggYXMgaVwiPlxuICAgICAgICAgIDxpbnB1dCBbZm9ybUNvbnRyb2xOYW1lXT1cImlcIj5cbiAgICAgICAgPC9kaXY+XG4gICAgICA8L2Rpdj5cbiAgICA8L2Rpdj5cblxuICAgIEluIHlvdXIgY2xhc3M6XG5cbiAgICB0aGlzLmNpdHlBcnJheSA9IG5ldyBGb3JtQXJyYXkoW25ldyBGb3JtQ29udHJvbCgnU0YnKV0pO1xuICAgIHRoaXMubXlHcm91cCA9IG5ldyBGb3JtR3JvdXAoe1xuICAgICAgY2l0aWVzOiB0aGlzLmNpdHlBcnJheVxuICAgIH0pO2AsXG5cbiAgbmdNb2RlbEdyb3VwOiBgXG4gICAgPGZvcm0+XG4gICAgICAgPGRpdiBuZ01vZGVsR3JvdXA9XCJwZXJzb25cIj5cbiAgICAgICAgICA8aW5wdXQgWyhuZ01vZGVsKV09XCJwZXJzb24ubmFtZVwiIG5hbWU9XCJmaXJzdE5hbWVcIj5cbiAgICAgICA8L2Rpdj5cbiAgICA8L2Zvcm0+YCxcblxuICBuZ01vZGVsV2l0aEZvcm1Hcm91cDogYFxuICAgIDxkaXYgW2Zvcm1Hcm91cF09XCJteUdyb3VwXCI+XG4gICAgICAgPGlucHV0IGZvcm1Db250cm9sTmFtZT1cImZpcnN0TmFtZVwiPlxuICAgICAgIDxpbnB1dCBbKG5nTW9kZWwpXT1cInNob3dNb3JlQ29udHJvbHNcIiBbbmdNb2RlbE9wdGlvbnNdPVwie3N0YW5kYWxvbmU6IHRydWV9XCI+XG4gICAgPC9kaXY+XG4gIGBcbn07XG4iXX0=