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
import { FormErrorExamples as Examples } from './error_examples';
export class ReactiveErrors {
    /**
     * @return {?}
     */
    static controlParentException() {
        throw new Error(`formControlName must be used with a parent formGroup directive.  You'll want to add a formGroup
       directive and pass it an existing FormGroup instance (you can create one in your class).

      Example:

      ${Examples.formControlName}`);
    }
    /**
     * @return {?}
     */
    static ngModelGroupException() {
        throw new Error(`formControlName cannot be used with an ngModelGroup parent. It is only compatible with parents
       that also have a "form" prefix: formGroupName, formArrayName, or formGroup.

       Option 1:  Update the parent to be formGroupName (reactive form strategy)

        ${Examples.formGroupName}

        Option 2: Use ngModel instead of formControlName (template-driven strategy)

        ${Examples.ngModelGroup}`);
    }
    /**
     * @return {?}
     */
    static missingFormException() {
        throw new Error(`formGroup expects a FormGroup instance. Please pass one in.

       Example:

       ${Examples.formControlName}`);
    }
    /**
     * @return {?}
     */
    static groupParentException() {
        throw new Error(`formGroupName must be used with a parent formGroup directive.  You'll want to add a formGroup
      directive and pass it an existing FormGroup instance (you can create one in your class).

      Example:

      ${Examples.formGroupName}`);
    }
    /**
     * @return {?}
     */
    static arrayParentException() {
        throw new Error(`formArrayName must be used with a parent formGroup directive.  You'll want to add a formGroup
       directive and pass it an existing FormGroup instance (you can create one in your class).

        Example:

        ${Examples.formArrayName}`);
    }
    /**
     * @return {?}
     */
    static disabledAttrWarning() {
        console.warn(`
      It looks like you're using the disabled attribute with a reactive form directive. If you set disabled to true
      when you set up this control in your component class, the disabled attribute will actually be set in the DOM for
      you. We recommend using this approach to avoid 'changed after checked' errors.
       
      Example: 
      form = new FormGroup({
        first: new FormControl({value: 'Nancy', disabled: true}, Validators.required),
        last: new FormControl('Drew', Validators.required)
      });
    `);
    }
    /**
     * @param {?} directiveName
     * @return {?}
     */
    static ngModelWarning(directiveName) {
        console.warn(`
    It looks like you're using ngModel on the same form field as ${directiveName}. 
    Support for using the ngModel input property and ngModelChange event with 
    reactive form directives has been deprecated in Angular v6 and will be removed 
    in Angular v7.
    
    For more information on this, see our API docs here:
    https://angular.io/api/forms/${directiveName === 'formControl' ? 'FormControlDirective'
            : 'FormControlName'}#use-with-ngmodel
    `);
    }
}

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVhY3RpdmVfZXJyb3JzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvZm9ybXMvc3JjL2RpcmVjdGl2ZXMvcmVhY3RpdmVfZXJyb3JzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7O0FBU0EsT0FBTyxFQUFDLGlCQUFpQixJQUFJLFFBQVEsRUFBQyxNQUFNLGtCQUFrQixDQUFDO0FBRS9ELE1BQU07Ozs7SUFDSixNQUFNLENBQUMsc0JBQXNCO1FBQzNCLE1BQU0sSUFBSSxLQUFLLENBQ1g7Ozs7O1FBS0EsUUFBUSxDQUFDLGVBQWUsRUFBRSxDQUFDLENBQUM7S0FDakM7Ozs7SUFFRCxNQUFNLENBQUMscUJBQXFCO1FBQzFCLE1BQU0sSUFBSSxLQUFLLENBQ1g7Ozs7O1VBS0UsUUFBUSxDQUFDLGFBQWE7Ozs7VUFJdEIsUUFBUSxDQUFDLFlBQVksRUFBRSxDQUFDLENBQUM7S0FDaEM7Ozs7SUFDRCxNQUFNLENBQUMsb0JBQW9CO1FBQ3pCLE1BQU0sSUFBSSxLQUFLLENBQUM7Ozs7U0FJWCxRQUFRLENBQUMsZUFBZSxFQUFFLENBQUMsQ0FBQztLQUNsQzs7OztJQUVELE1BQU0sQ0FBQyxvQkFBb0I7UUFDekIsTUFBTSxJQUFJLEtBQUssQ0FDWDs7Ozs7UUFLQSxRQUFRLENBQUMsYUFBYSxFQUFFLENBQUMsQ0FBQztLQUMvQjs7OztJQUVELE1BQU0sQ0FBQyxvQkFBb0I7UUFDekIsTUFBTSxJQUFJLEtBQUssQ0FDWDs7Ozs7VUFLRSxRQUFRLENBQUMsYUFBYSxFQUFFLENBQUMsQ0FBQztLQUNqQzs7OztJQUVELE1BQU0sQ0FBQyxtQkFBbUI7UUFDeEIsT0FBTyxDQUFDLElBQUksQ0FBQzs7Ozs7Ozs7OztLQVVaLENBQUMsQ0FBQztLQUNKOzs7OztJQUVELE1BQU0sQ0FBQyxjQUFjLENBQUMsYUFBcUI7UUFDekMsT0FBTyxDQUFDLElBQUksQ0FBQzttRUFDa0QsYUFBYTs7Ozs7O21DQU03QyxhQUFhLEtBQUssYUFBYSxDQUFDLENBQUMsQ0FBQyxzQkFBc0I7WUFDckYsQ0FBQyxDQUFDLGlCQUFpQjtLQUNwQixDQUFDLENBQUM7S0FDSjtDQUNGIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBJbmMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5cbmltcG9ydCB7Rm9ybUVycm9yRXhhbXBsZXMgYXMgRXhhbXBsZXN9IGZyb20gJy4vZXJyb3JfZXhhbXBsZXMnO1xuXG5leHBvcnQgY2xhc3MgUmVhY3RpdmVFcnJvcnMge1xuICBzdGF0aWMgY29udHJvbFBhcmVudEV4Y2VwdGlvbigpOiB2b2lkIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgIGBmb3JtQ29udHJvbE5hbWUgbXVzdCBiZSB1c2VkIHdpdGggYSBwYXJlbnQgZm9ybUdyb3VwIGRpcmVjdGl2ZS4gIFlvdSdsbCB3YW50IHRvIGFkZCBhIGZvcm1Hcm91cFxuICAgICAgIGRpcmVjdGl2ZSBhbmQgcGFzcyBpdCBhbiBleGlzdGluZyBGb3JtR3JvdXAgaW5zdGFuY2UgKHlvdSBjYW4gY3JlYXRlIG9uZSBpbiB5b3VyIGNsYXNzKS5cblxuICAgICAgRXhhbXBsZTpcblxuICAgICAgJHtFeGFtcGxlcy5mb3JtQ29udHJvbE5hbWV9YCk7XG4gIH1cblxuICBzdGF0aWMgbmdNb2RlbEdyb3VwRXhjZXB0aW9uKCk6IHZvaWQge1xuICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICAgYGZvcm1Db250cm9sTmFtZSBjYW5ub3QgYmUgdXNlZCB3aXRoIGFuIG5nTW9kZWxHcm91cCBwYXJlbnQuIEl0IGlzIG9ubHkgY29tcGF0aWJsZSB3aXRoIHBhcmVudHNcbiAgICAgICB0aGF0IGFsc28gaGF2ZSBhIFwiZm9ybVwiIHByZWZpeDogZm9ybUdyb3VwTmFtZSwgZm9ybUFycmF5TmFtZSwgb3IgZm9ybUdyb3VwLlxuXG4gICAgICAgT3B0aW9uIDE6ICBVcGRhdGUgdGhlIHBhcmVudCB0byBiZSBmb3JtR3JvdXBOYW1lIChyZWFjdGl2ZSBmb3JtIHN0cmF0ZWd5KVxuXG4gICAgICAgICR7RXhhbXBsZXMuZm9ybUdyb3VwTmFtZX1cblxuICAgICAgICBPcHRpb24gMjogVXNlIG5nTW9kZWwgaW5zdGVhZCBvZiBmb3JtQ29udHJvbE5hbWUgKHRlbXBsYXRlLWRyaXZlbiBzdHJhdGVneSlcblxuICAgICAgICAke0V4YW1wbGVzLm5nTW9kZWxHcm91cH1gKTtcbiAgfVxuICBzdGF0aWMgbWlzc2luZ0Zvcm1FeGNlcHRpb24oKTogdm9pZCB7XG4gICAgdGhyb3cgbmV3IEVycm9yKGBmb3JtR3JvdXAgZXhwZWN0cyBhIEZvcm1Hcm91cCBpbnN0YW5jZS4gUGxlYXNlIHBhc3Mgb25lIGluLlxuXG4gICAgICAgRXhhbXBsZTpcblxuICAgICAgICR7RXhhbXBsZXMuZm9ybUNvbnRyb2xOYW1lfWApO1xuICB9XG5cbiAgc3RhdGljIGdyb3VwUGFyZW50RXhjZXB0aW9uKCk6IHZvaWQge1xuICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICAgYGZvcm1Hcm91cE5hbWUgbXVzdCBiZSB1c2VkIHdpdGggYSBwYXJlbnQgZm9ybUdyb3VwIGRpcmVjdGl2ZS4gIFlvdSdsbCB3YW50IHRvIGFkZCBhIGZvcm1Hcm91cFxuICAgICAgZGlyZWN0aXZlIGFuZCBwYXNzIGl0IGFuIGV4aXN0aW5nIEZvcm1Hcm91cCBpbnN0YW5jZSAoeW91IGNhbiBjcmVhdGUgb25lIGluIHlvdXIgY2xhc3MpLlxuXG4gICAgICBFeGFtcGxlOlxuXG4gICAgICAke0V4YW1wbGVzLmZvcm1Hcm91cE5hbWV9YCk7XG4gIH1cblxuICBzdGF0aWMgYXJyYXlQYXJlbnRFeGNlcHRpb24oKTogdm9pZCB7XG4gICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgICBgZm9ybUFycmF5TmFtZSBtdXN0IGJlIHVzZWQgd2l0aCBhIHBhcmVudCBmb3JtR3JvdXAgZGlyZWN0aXZlLiAgWW91J2xsIHdhbnQgdG8gYWRkIGEgZm9ybUdyb3VwXG4gICAgICAgZGlyZWN0aXZlIGFuZCBwYXNzIGl0IGFuIGV4aXN0aW5nIEZvcm1Hcm91cCBpbnN0YW5jZSAoeW91IGNhbiBjcmVhdGUgb25lIGluIHlvdXIgY2xhc3MpLlxuXG4gICAgICAgIEV4YW1wbGU6XG5cbiAgICAgICAgJHtFeGFtcGxlcy5mb3JtQXJyYXlOYW1lfWApO1xuICB9XG5cbiAgc3RhdGljIGRpc2FibGVkQXR0cldhcm5pbmcoKTogdm9pZCB7XG4gICAgY29uc29sZS53YXJuKGBcbiAgICAgIEl0IGxvb2tzIGxpa2UgeW91J3JlIHVzaW5nIHRoZSBkaXNhYmxlZCBhdHRyaWJ1dGUgd2l0aCBhIHJlYWN0aXZlIGZvcm0gZGlyZWN0aXZlLiBJZiB5b3Ugc2V0IGRpc2FibGVkIHRvIHRydWVcbiAgICAgIHdoZW4geW91IHNldCB1cCB0aGlzIGNvbnRyb2wgaW4geW91ciBjb21wb25lbnQgY2xhc3MsIHRoZSBkaXNhYmxlZCBhdHRyaWJ1dGUgd2lsbCBhY3R1YWxseSBiZSBzZXQgaW4gdGhlIERPTSBmb3JcbiAgICAgIHlvdS4gV2UgcmVjb21tZW5kIHVzaW5nIHRoaXMgYXBwcm9hY2ggdG8gYXZvaWQgJ2NoYW5nZWQgYWZ0ZXIgY2hlY2tlZCcgZXJyb3JzLlxuICAgICAgIFxuICAgICAgRXhhbXBsZTogXG4gICAgICBmb3JtID0gbmV3IEZvcm1Hcm91cCh7XG4gICAgICAgIGZpcnN0OiBuZXcgRm9ybUNvbnRyb2woe3ZhbHVlOiAnTmFuY3knLCBkaXNhYmxlZDogdHJ1ZX0sIFZhbGlkYXRvcnMucmVxdWlyZWQpLFxuICAgICAgICBsYXN0OiBuZXcgRm9ybUNvbnRyb2woJ0RyZXcnLCBWYWxpZGF0b3JzLnJlcXVpcmVkKVxuICAgICAgfSk7XG4gICAgYCk7XG4gIH1cblxuICBzdGF0aWMgbmdNb2RlbFdhcm5pbmcoZGlyZWN0aXZlTmFtZTogc3RyaW5nKTogdm9pZCB7XG4gICAgY29uc29sZS53YXJuKGBcbiAgICBJdCBsb29rcyBsaWtlIHlvdSdyZSB1c2luZyBuZ01vZGVsIG9uIHRoZSBzYW1lIGZvcm0gZmllbGQgYXMgJHtkaXJlY3RpdmVOYW1lfS4gXG4gICAgU3VwcG9ydCBmb3IgdXNpbmcgdGhlIG5nTW9kZWwgaW5wdXQgcHJvcGVydHkgYW5kIG5nTW9kZWxDaGFuZ2UgZXZlbnQgd2l0aCBcbiAgICByZWFjdGl2ZSBmb3JtIGRpcmVjdGl2ZXMgaGFzIGJlZW4gZGVwcmVjYXRlZCBpbiBBbmd1bGFyIHY2IGFuZCB3aWxsIGJlIHJlbW92ZWQgXG4gICAgaW4gQW5ndWxhciB2Ny5cbiAgICBcbiAgICBGb3IgbW9yZSBpbmZvcm1hdGlvbiBvbiB0aGlzLCBzZWUgb3VyIEFQSSBkb2NzIGhlcmU6XG4gICAgaHR0cHM6Ly9hbmd1bGFyLmlvL2FwaS9mb3Jtcy8ke2RpcmVjdGl2ZU5hbWUgPT09ICdmb3JtQ29udHJvbCcgPyAnRm9ybUNvbnRyb2xEaXJlY3RpdmUnIFxuICAgICAgOiAnRm9ybUNvbnRyb2xOYW1lJ30jdXNlLXdpdGgtbmdtb2RlbFxuICAgIGApO1xuICB9XG59XG4iXX0=