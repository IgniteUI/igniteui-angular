/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import * as tslib_1 from "tslib";
import { Directive, EventEmitter, Inject, InjectionToken, Input, Optional, Output, Self, forwardRef } from '@angular/core';
import { FormControl } from '../../model';
import { NG_ASYNC_VALIDATORS, NG_VALIDATORS } from '../../validators';
import { NG_VALUE_ACCESSOR } from '../control_value_accessor';
import { NgControl } from '../ng_control';
import { ReactiveErrors } from '../reactive_errors';
import { _ngModelWarning, composeAsyncValidators, composeValidators, isPropertyUpdated, selectValueAccessor, setUpControl } from '../shared';
/**
 * Token to provide to turn off the ngModel warning on formControl and formControlName.
 */
export var NG_MODEL_WITH_FORM_CONTROL_WARNING = new InjectionToken('NgModelWithFormControlWarning');
export var formControlBinding = {
    provide: NgControl,
    useExisting: forwardRef(function () { return FormControlDirective; })
};
/**
 * @description
 *
 * Syncs a standalone `FormControl` instance to a form control element.
 *
 * This directive ensures that any values written to the `FormControl`
 * instance programmatically will be written to the DOM element (model -> view). Conversely,
 * any values written to the DOM element through user input will be reflected in the
 * `FormControl` instance (view -> model).
 *
 * Use this directive if you'd like to create and manage a `FormControl` instance directly.
 * Simply create a `FormControl`, save it to your component class, and pass it into the
 * `FormControlDirective`.
 *
 * This directive is designed to be used as a standalone control.  Unlike `FormControlName`,
 * it does not require that your `FormControl` instance be part of any parent
 * `FormGroup`, and it won't be registered to any `FormGroupDirective` that
 * exists above it.
 *
 * **Get the value**: the `value` property is always synced and available on the
 * `FormControl` instance. See a full list of available properties in
 * `AbstractControl`.
 *
 * **Set the value**: You can pass in an initial value when instantiating the `FormControl`,
 * or you can set it programmatically later using {@link AbstractControl#setValue setValue} or
 * {@link AbstractControl#patchValue patchValue}.
 *
 * **Listen to value**: If you want to listen to changes in the value of the control, you can
 * subscribe to the {@link AbstractControl#valueChanges valueChanges} event.  You can also listen to
 * {@link AbstractControl#statusChanges statusChanges} to be notified when the validation status is
 * re-calculated.
 *
 * ### Example
 *
 * {@example forms/ts/simpleFormControl/simple_form_control_example.ts region='Component'}
 *
 * * **npm package**: `@angular/forms`
 *
 * * **NgModule**: `ReactiveFormsModule`
 *
 * ### Use with ngModel
 *
 * Support for using the `ngModel` input property and `ngModelChange` event with reactive
 * form directives has been deprecated in Angular v6 and will be removed in Angular v7.
 *
 * Now deprecated:
 * ```html
 * <input [formControl]="control" [(ngModel)]="value">
 * ```
 *
 * ```ts
 * this.value = 'some value';
 * ```
 *
 * This has been deprecated for a few reasons. First, developers have found this pattern
 * confusing. It seems like the actual `ngModel` directive is being used, but in fact it's
 * an input/output property named `ngModel` on the reactive form directive that simply
 * approximates (some of) its behavior. Specifically, it allows getting/setting the value
 * and intercepting value events. However, some of `ngModel`'s other features - like
 * delaying updates with`ngModelOptions` or exporting the directive - simply don't work,
 * which has understandably caused some confusion.
 *
 * In addition, this pattern mixes template-driven and reactive forms strategies, which
 * we generally don't recommend because it doesn't take advantage of the full benefits of
 * either strategy. Setting the value in the template violates the template-agnostic
 * principles behind reactive forms, whereas adding a `FormControl`/`FormGroup` layer in
 * the class removes the convenience of defining forms in the template.
 *
 * To update your code before v7, you'll want to decide whether to stick with reactive form
 * directives (and get/set values using reactive forms patterns) or switch over to
 * template-driven directives.
 *
 * After (choice 1 - use reactive forms):
 *
 * ```html
 * <input [formControl]="control">
 * ```
 *
 * ```ts
 * this.control.setValue('some value');
 * ```
 *
 * After (choice 2 - use template-driven forms):
 *
 * ```html
 * <input [(ngModel)]="value">
 * ```
 *
 * ```ts
 * this.value = 'some value';
 * ```
 *
 * By default, when you use this pattern, you will see a deprecation warning once in dev
 * mode. You can choose to silence this warning by providing a config for
 * `ReactiveFormsModule` at import time:
 *
 * ```ts
 * imports: [
 *   ReactiveFormsModule.withConfig({warnOnNgModelWithFormControl: 'never'});
 * ]
 * ```
 *
 * Alternatively, you can choose to surface a separate warning for each instance of this
 * pattern with a config value of `"always"`. This may help to track down where in the code
 * the pattern is being used as the code is being updated.
 *
 *
 */
var FormControlDirective = /** @class */ (function (_super) {
    tslib_1.__extends(FormControlDirective, _super);
    function FormControlDirective(validators, asyncValidators, valueAccessors, _ngModelWarningConfig) {
        var _this = _super.call(this) || this;
        _this._ngModelWarningConfig = _ngModelWarningConfig;
        /** @deprecated as of v6 */
        _this.update = new EventEmitter();
        /**
           * Instance property used to track whether an ngModel warning has been sent out for this
           * particular FormControlDirective instance. Used to support warning config of "always".
           *
           * @internal
           */
        _this._ngModelWarningSent = false;
        _this._rawValidators = validators || [];
        _this._rawAsyncValidators = asyncValidators || [];
        _this.valueAccessor = selectValueAccessor(_this, valueAccessors);
        return _this;
    }
    Object.defineProperty(FormControlDirective.prototype, "isDisabled", {
        set: function (isDisabled) { ReactiveErrors.disabledAttrWarning(); },
        enumerable: true,
        configurable: true
    });
    FormControlDirective.prototype.ngOnChanges = function (changes) {
        if (this._isControlChanged(changes)) {
            setUpControl(this.form, this);
            if (this.control.disabled && this.valueAccessor.setDisabledState) {
                this.valueAccessor.setDisabledState(true);
            }
            this.form.updateValueAndValidity({ emitEvent: false });
        }
        if (isPropertyUpdated(changes, this.viewModel)) {
            _ngModelWarning('formControl', FormControlDirective, this, this._ngModelWarningConfig);
            this.form.setValue(this.model);
            this.viewModel = this.model;
        }
    };
    Object.defineProperty(FormControlDirective.prototype, "path", {
        get: function () { return []; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(FormControlDirective.prototype, "validator", {
        get: function () { return composeValidators(this._rawValidators); },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(FormControlDirective.prototype, "asyncValidator", {
        get: function () {
            return composeAsyncValidators(this._rawAsyncValidators);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(FormControlDirective.prototype, "control", {
        get: function () { return this.form; },
        enumerable: true,
        configurable: true
    });
    FormControlDirective.prototype.viewToModelUpdate = function (newValue) {
        this.viewModel = newValue;
        this.update.emit(newValue);
    };
    FormControlDirective.prototype._isControlChanged = function (changes) {
        return changes.hasOwnProperty('form');
    };
    /**
       * Static property used to track whether any ngModel warnings have been sent across
       * all instances of FormControlDirective. Used to support warning config of "once".
       *
       * @internal
       */
    FormControlDirective._ngModelWarningSentOnce = false;
    FormControlDirective.decorators = [
        { type: Directive, args: [{ selector: '[formControl]', providers: [formControlBinding], exportAs: 'ngForm' },] }
    ];
    /** @nocollapse */
    FormControlDirective.ctorParameters = function () { return [
        { type: Array, decorators: [{ type: Optional }, { type: Self }, { type: Inject, args: [NG_VALIDATORS,] },] },
        { type: Array, decorators: [{ type: Optional }, { type: Self }, { type: Inject, args: [NG_ASYNC_VALIDATORS,] },] },
        { type: Array, decorators: [{ type: Optional }, { type: Self }, { type: Inject, args: [NG_VALUE_ACCESSOR,] },] },
        { type: undefined, decorators: [{ type: Optional }, { type: Inject, args: [NG_MODEL_WITH_FORM_CONTROL_WARNING,] },] },
    ]; };
    FormControlDirective.propDecorators = {
        "form": [{ type: Input, args: ['formControl',] },],
        "isDisabled": [{ type: Input, args: ['disabled',] },],
        "model": [{ type: Input, args: ['ngModel',] },],
        "update": [{ type: Output, args: ['ngModelChange',] },],
    };
    return FormControlDirective;
}(NgControl));
export { FormControlDirective };

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZm9ybV9jb250cm9sX2RpcmVjdGl2ZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2Zvcm1zL3NyYy9kaXJlY3RpdmVzL3JlYWN0aXZlX2RpcmVjdGl2ZXMvZm9ybV9jb250cm9sX2RpcmVjdGl2ZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7OztBQVFBLE9BQU8sRUFBQyxTQUFTLEVBQUUsWUFBWSxFQUFFLE1BQU0sRUFBRSxjQUFjLEVBQUUsS0FBSyxFQUFhLFFBQVEsRUFBRSxNQUFNLEVBQUUsSUFBSSxFQUFpQixVQUFVLEVBQUMsTUFBTSxlQUFlLENBQUM7QUFFbkosT0FBTyxFQUFDLFdBQVcsRUFBQyxNQUFNLGFBQWEsQ0FBQztBQUN4QyxPQUFPLEVBQUMsbUJBQW1CLEVBQUUsYUFBYSxFQUFDLE1BQU0sa0JBQWtCLENBQUM7QUFDcEUsT0FBTyxFQUF1QixpQkFBaUIsRUFBQyxNQUFNLDJCQUEyQixDQUFDO0FBQ2xGLE9BQU8sRUFBQyxTQUFTLEVBQUMsTUFBTSxlQUFlLENBQUM7QUFDeEMsT0FBTyxFQUFDLGNBQWMsRUFBQyxNQUFNLG9CQUFvQixDQUFDO0FBQ2xELE9BQU8sRUFBQyxlQUFlLEVBQUUsc0JBQXNCLEVBQUUsaUJBQWlCLEVBQUUsaUJBQWlCLEVBQUUsbUJBQW1CLEVBQUUsWUFBWSxFQUFDLE1BQU0sV0FBVyxDQUFDOzs7O0FBTzNJLE1BQU0sQ0FBQyxJQUFNLGtDQUFrQyxHQUMzQyxJQUFJLGNBQWMsQ0FBQywrQkFBK0IsQ0FBQyxDQUFDO0FBRXhELE1BQU0sQ0FBQyxJQUFNLGtCQUFrQixHQUFRO0lBQ3JDLE9BQU8sRUFBRSxTQUFTO0lBQ2xCLFdBQVcsRUFBRSxVQUFVLENBQUMsY0FBTSxPQUFBLG9CQUFvQixFQUFwQixDQUFvQixDQUFDO0NBQ3BELENBQUM7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7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NENBQzlDLFFBQVEsWUFBSSxJQUFJLFlBQUksTUFBTSxTQUFDLGlCQUFpQjtnREFFNUMsUUFBUSxZQUFJLE1BQU0sU0FBQyxrQ0FBa0M7Ozt5QkFqQ2pFLEtBQUssU0FBQyxhQUFhOytCQUVuQixLQUFLLFNBQUMsVUFBVTswQkFNaEIsS0FBSyxTQUFDLFNBQVM7MkJBR2YsTUFBTSxTQUFDLGVBQWU7OytCQTFKekI7RUE0STBDLFNBQVM7U0FBdEMsb0JBQW9CIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBJbmMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge0RpcmVjdGl2ZSwgRXZlbnRFbWl0dGVyLCBJbmplY3QsIEluamVjdGlvblRva2VuLCBJbnB1dCwgT25DaGFuZ2VzLCBPcHRpb25hbCwgT3V0cHV0LCBTZWxmLCBTaW1wbGVDaGFuZ2VzLCBmb3J3YXJkUmVmfSBmcm9tICdAYW5ndWxhci9jb3JlJztcblxuaW1wb3J0IHtGb3JtQ29udHJvbH0gZnJvbSAnLi4vLi4vbW9kZWwnO1xuaW1wb3J0IHtOR19BU1lOQ19WQUxJREFUT1JTLCBOR19WQUxJREFUT1JTfSBmcm9tICcuLi8uLi92YWxpZGF0b3JzJztcbmltcG9ydCB7Q29udHJvbFZhbHVlQWNjZXNzb3IsIE5HX1ZBTFVFX0FDQ0VTU09SfSBmcm9tICcuLi9jb250cm9sX3ZhbHVlX2FjY2Vzc29yJztcbmltcG9ydCB7TmdDb250cm9sfSBmcm9tICcuLi9uZ19jb250cm9sJztcbmltcG9ydCB7UmVhY3RpdmVFcnJvcnN9IGZyb20gJy4uL3JlYWN0aXZlX2Vycm9ycyc7XG5pbXBvcnQge19uZ01vZGVsV2FybmluZywgY29tcG9zZUFzeW5jVmFsaWRhdG9ycywgY29tcG9zZVZhbGlkYXRvcnMsIGlzUHJvcGVydHlVcGRhdGVkLCBzZWxlY3RWYWx1ZUFjY2Vzc29yLCBzZXRVcENvbnRyb2x9IGZyb20gJy4uL3NoYXJlZCc7XG5pbXBvcnQge0FzeW5jVmFsaWRhdG9yLCBBc3luY1ZhbGlkYXRvckZuLCBWYWxpZGF0b3IsIFZhbGlkYXRvckZufSBmcm9tICcuLi92YWxpZGF0b3JzJztcblxuXG4vKipcbiAqIFRva2VuIHRvIHByb3ZpZGUgdG8gdHVybiBvZmYgdGhlIG5nTW9kZWwgd2FybmluZyBvbiBmb3JtQ29udHJvbCBhbmQgZm9ybUNvbnRyb2xOYW1lLlxuICovXG5leHBvcnQgY29uc3QgTkdfTU9ERUxfV0lUSF9GT1JNX0NPTlRST0xfV0FSTklORyA9XG4gICAgbmV3IEluamVjdGlvblRva2VuKCdOZ01vZGVsV2l0aEZvcm1Db250cm9sV2FybmluZycpO1xuXG5leHBvcnQgY29uc3QgZm9ybUNvbnRyb2xCaW5kaW5nOiBhbnkgPSB7XG4gIHByb3ZpZGU6IE5nQ29udHJvbCxcbiAgdXNlRXhpc3Rpbmc6IGZvcndhcmRSZWYoKCkgPT4gRm9ybUNvbnRyb2xEaXJlY3RpdmUpXG59O1xuXG4vKipcbiAqIEBkZXNjcmlwdGlvblxuICpcbiAqIFN5bmNzIGEgc3RhbmRhbG9uZSBgRm9ybUNvbnRyb2xgIGluc3RhbmNlIHRvIGEgZm9ybSBjb250cm9sIGVsZW1lbnQuXG4gKlxuICogVGhpcyBkaXJlY3RpdmUgZW5zdXJlcyB0aGF0IGFueSB2YWx1ZXMgd3JpdHRlbiB0byB0aGUgYEZvcm1Db250cm9sYFxuICogaW5zdGFuY2UgcHJvZ3JhbW1hdGljYWxseSB3aWxsIGJlIHdyaXR0ZW4gdG8gdGhlIERPTSBlbGVtZW50IChtb2RlbCAtPiB2aWV3KS4gQ29udmVyc2VseSxcbiAqIGFueSB2YWx1ZXMgd3JpdHRlbiB0byB0aGUgRE9NIGVsZW1lbnQgdGhyb3VnaCB1c2VyIGlucHV0IHdpbGwgYmUgcmVmbGVjdGVkIGluIHRoZVxuICogYEZvcm1Db250cm9sYCBpbnN0YW5jZSAodmlldyAtPiBtb2RlbCkuXG4gKlxuICogVXNlIHRoaXMgZGlyZWN0aXZlIGlmIHlvdSdkIGxpa2UgdG8gY3JlYXRlIGFuZCBtYW5hZ2UgYSBgRm9ybUNvbnRyb2xgIGluc3RhbmNlIGRpcmVjdGx5LlxuICogU2ltcGx5IGNyZWF0ZSBhIGBGb3JtQ29udHJvbGAsIHNhdmUgaXQgdG8geW91ciBjb21wb25lbnQgY2xhc3MsIGFuZCBwYXNzIGl0IGludG8gdGhlXG4gKiBgRm9ybUNvbnRyb2xEaXJlY3RpdmVgLlxuICpcbiAqIFRoaXMgZGlyZWN0aXZlIGlzIGRlc2lnbmVkIHRvIGJlIHVzZWQgYXMgYSBzdGFuZGFsb25lIGNvbnRyb2wuICBVbmxpa2UgYEZvcm1Db250cm9sTmFtZWAsXG4gKiBpdCBkb2VzIG5vdCByZXF1aXJlIHRoYXQgeW91ciBgRm9ybUNvbnRyb2xgIGluc3RhbmNlIGJlIHBhcnQgb2YgYW55IHBhcmVudFxuICogYEZvcm1Hcm91cGAsIGFuZCBpdCB3b24ndCBiZSByZWdpc3RlcmVkIHRvIGFueSBgRm9ybUdyb3VwRGlyZWN0aXZlYCB0aGF0XG4gKiBleGlzdHMgYWJvdmUgaXQuXG4gKlxuICogKipHZXQgdGhlIHZhbHVlKio6IHRoZSBgdmFsdWVgIHByb3BlcnR5IGlzIGFsd2F5cyBzeW5jZWQgYW5kIGF2YWlsYWJsZSBvbiB0aGVcbiAqIGBGb3JtQ29udHJvbGAgaW5zdGFuY2UuIFNlZSBhIGZ1bGwgbGlzdCBvZiBhdmFpbGFibGUgcHJvcGVydGllcyBpblxuICogYEFic3RyYWN0Q29udHJvbGAuXG4gKlxuICogKipTZXQgdGhlIHZhbHVlKio6IFlvdSBjYW4gcGFzcyBpbiBhbiBpbml0aWFsIHZhbHVlIHdoZW4gaW5zdGFudGlhdGluZyB0aGUgYEZvcm1Db250cm9sYCxcbiAqIG9yIHlvdSBjYW4gc2V0IGl0IHByb2dyYW1tYXRpY2FsbHkgbGF0ZXIgdXNpbmcge0BsaW5rIEFic3RyYWN0Q29udHJvbCNzZXRWYWx1ZSBzZXRWYWx1ZX0gb3JcbiAqIHtAbGluayBBYnN0cmFjdENvbnRyb2wjcGF0Y2hWYWx1ZSBwYXRjaFZhbHVlfS5cbiAqXG4gKiAqKkxpc3RlbiB0byB2YWx1ZSoqOiBJZiB5b3Ugd2FudCB0byBsaXN0ZW4gdG8gY2hhbmdlcyBpbiB0aGUgdmFsdWUgb2YgdGhlIGNvbnRyb2wsIHlvdSBjYW5cbiAqIHN1YnNjcmliZSB0byB0aGUge0BsaW5rIEFic3RyYWN0Q29udHJvbCN2YWx1ZUNoYW5nZXMgdmFsdWVDaGFuZ2VzfSBldmVudC4gIFlvdSBjYW4gYWxzbyBsaXN0ZW4gdG9cbiAqIHtAbGluayBBYnN0cmFjdENvbnRyb2wjc3RhdHVzQ2hhbmdlcyBzdGF0dXNDaGFuZ2VzfSB0byBiZSBub3RpZmllZCB3aGVuIHRoZSB2YWxpZGF0aW9uIHN0YXR1cyBpc1xuICogcmUtY2FsY3VsYXRlZC5cbiAqXG4gKiAjIyMgRXhhbXBsZVxuICpcbiAqIHtAZXhhbXBsZSBmb3Jtcy90cy9zaW1wbGVGb3JtQ29udHJvbC9zaW1wbGVfZm9ybV9jb250cm9sX2V4YW1wbGUudHMgcmVnaW9uPSdDb21wb25lbnQnfVxuICpcbiAqICogKipucG0gcGFja2FnZSoqOiBgQGFuZ3VsYXIvZm9ybXNgXG4gKlxuICogKiAqKk5nTW9kdWxlKio6IGBSZWFjdGl2ZUZvcm1zTW9kdWxlYFxuICpcbiAqICMjIyBVc2Ugd2l0aCBuZ01vZGVsXG4gKlxuICogU3VwcG9ydCBmb3IgdXNpbmcgdGhlIGBuZ01vZGVsYCBpbnB1dCBwcm9wZXJ0eSBhbmQgYG5nTW9kZWxDaGFuZ2VgIGV2ZW50IHdpdGggcmVhY3RpdmVcbiAqIGZvcm0gZGlyZWN0aXZlcyBoYXMgYmVlbiBkZXByZWNhdGVkIGluIEFuZ3VsYXIgdjYgYW5kIHdpbGwgYmUgcmVtb3ZlZCBpbiBBbmd1bGFyIHY3LlxuICpcbiAqIE5vdyBkZXByZWNhdGVkOlxuICogYGBgaHRtbFxuICogPGlucHV0IFtmb3JtQ29udHJvbF09XCJjb250cm9sXCIgWyhuZ01vZGVsKV09XCJ2YWx1ZVwiPlxuICogYGBgXG4gKlxuICogYGBgdHNcbiAqIHRoaXMudmFsdWUgPSAnc29tZSB2YWx1ZSc7XG4gKiBgYGBcbiAqXG4gKiBUaGlzIGhhcyBiZWVuIGRlcHJlY2F0ZWQgZm9yIGEgZmV3IHJlYXNvbnMuIEZpcnN0LCBkZXZlbG9wZXJzIGhhdmUgZm91bmQgdGhpcyBwYXR0ZXJuXG4gKiBjb25mdXNpbmcuIEl0IHNlZW1zIGxpa2UgdGhlIGFjdHVhbCBgbmdNb2RlbGAgZGlyZWN0aXZlIGlzIGJlaW5nIHVzZWQsIGJ1dCBpbiBmYWN0IGl0J3NcbiAqIGFuIGlucHV0L291dHB1dCBwcm9wZXJ0eSBuYW1lZCBgbmdNb2RlbGAgb24gdGhlIHJlYWN0aXZlIGZvcm0gZGlyZWN0aXZlIHRoYXQgc2ltcGx5XG4gKiBhcHByb3hpbWF0ZXMgKHNvbWUgb2YpIGl0cyBiZWhhdmlvci4gU3BlY2lmaWNhbGx5LCBpdCBhbGxvd3MgZ2V0dGluZy9zZXR0aW5nIHRoZSB2YWx1ZVxuICogYW5kIGludGVyY2VwdGluZyB2YWx1ZSBldmVudHMuIEhvd2V2ZXIsIHNvbWUgb2YgYG5nTW9kZWxgJ3Mgb3RoZXIgZmVhdHVyZXMgLSBsaWtlXG4gKiBkZWxheWluZyB1cGRhdGVzIHdpdGhgbmdNb2RlbE9wdGlvbnNgIG9yIGV4cG9ydGluZyB0aGUgZGlyZWN0aXZlIC0gc2ltcGx5IGRvbid0IHdvcmssXG4gKiB3aGljaCBoYXMgdW5kZXJzdGFuZGFibHkgY2F1c2VkIHNvbWUgY29uZnVzaW9uLlxuICpcbiAqIEluIGFkZGl0aW9uLCB0aGlzIHBhdHRlcm4gbWl4ZXMgdGVtcGxhdGUtZHJpdmVuIGFuZCByZWFjdGl2ZSBmb3JtcyBzdHJhdGVnaWVzLCB3aGljaFxuICogd2UgZ2VuZXJhbGx5IGRvbid0IHJlY29tbWVuZCBiZWNhdXNlIGl0IGRvZXNuJ3QgdGFrZSBhZHZhbnRhZ2Ugb2YgdGhlIGZ1bGwgYmVuZWZpdHMgb2ZcbiAqIGVpdGhlciBzdHJhdGVneS4gU2V0dGluZyB0aGUgdmFsdWUgaW4gdGhlIHRlbXBsYXRlIHZpb2xhdGVzIHRoZSB0ZW1wbGF0ZS1hZ25vc3RpY1xuICogcHJpbmNpcGxlcyBiZWhpbmQgcmVhY3RpdmUgZm9ybXMsIHdoZXJlYXMgYWRkaW5nIGEgYEZvcm1Db250cm9sYC9gRm9ybUdyb3VwYCBsYXllciBpblxuICogdGhlIGNsYXNzIHJlbW92ZXMgdGhlIGNvbnZlbmllbmNlIG9mIGRlZmluaW5nIGZvcm1zIGluIHRoZSB0ZW1wbGF0ZS5cbiAqXG4gKiBUbyB1cGRhdGUgeW91ciBjb2RlIGJlZm9yZSB2NywgeW91J2xsIHdhbnQgdG8gZGVjaWRlIHdoZXRoZXIgdG8gc3RpY2sgd2l0aCByZWFjdGl2ZSBmb3JtXG4gKiBkaXJlY3RpdmVzIChhbmQgZ2V0L3NldCB2YWx1ZXMgdXNpbmcgcmVhY3RpdmUgZm9ybXMgcGF0dGVybnMpIG9yIHN3aXRjaCBvdmVyIHRvXG4gKiB0ZW1wbGF0ZS1kcml2ZW4gZGlyZWN0aXZlcy5cbiAqXG4gKiBBZnRlciAoY2hvaWNlIDEgLSB1c2UgcmVhY3RpdmUgZm9ybXMpOlxuICpcbiAqIGBgYGh0bWxcbiAqIDxpbnB1dCBbZm9ybUNvbnRyb2xdPVwiY29udHJvbFwiPlxuICogYGBgXG4gKlxuICogYGBgdHNcbiAqIHRoaXMuY29udHJvbC5zZXRWYWx1ZSgnc29tZSB2YWx1ZScpO1xuICogYGBgXG4gKlxuICogQWZ0ZXIgKGNob2ljZSAyIC0gdXNlIHRlbXBsYXRlLWRyaXZlbiBmb3Jtcyk6XG4gKlxuICogYGBgaHRtbFxuICogPGlucHV0IFsobmdNb2RlbCldPVwidmFsdWVcIj5cbiAqIGBgYFxuICpcbiAqIGBgYHRzXG4gKiB0aGlzLnZhbHVlID0gJ3NvbWUgdmFsdWUnO1xuICogYGBgXG4gKlxuICogQnkgZGVmYXVsdCwgd2hlbiB5b3UgdXNlIHRoaXMgcGF0dGVybiwgeW91IHdpbGwgc2VlIGEgZGVwcmVjYXRpb24gd2FybmluZyBvbmNlIGluIGRldlxuICogbW9kZS4gWW91IGNhbiBjaG9vc2UgdG8gc2lsZW5jZSB0aGlzIHdhcm5pbmcgYnkgcHJvdmlkaW5nIGEgY29uZmlnIGZvclxuICogYFJlYWN0aXZlRm9ybXNNb2R1bGVgIGF0IGltcG9ydCB0aW1lOlxuICpcbiAqIGBgYHRzXG4gKiBpbXBvcnRzOiBbXG4gKiAgIFJlYWN0aXZlRm9ybXNNb2R1bGUud2l0aENvbmZpZyh7d2Fybk9uTmdNb2RlbFdpdGhGb3JtQ29udHJvbDogJ25ldmVyJ30pO1xuICogXVxuICogYGBgXG4gKlxuICogQWx0ZXJuYXRpdmVseSwgeW91IGNhbiBjaG9vc2UgdG8gc3VyZmFjZSBhIHNlcGFyYXRlIHdhcm5pbmcgZm9yIGVhY2ggaW5zdGFuY2Ugb2YgdGhpc1xuICogcGF0dGVybiB3aXRoIGEgY29uZmlnIHZhbHVlIG9mIGBcImFsd2F5c1wiYC4gVGhpcyBtYXkgaGVscCB0byB0cmFjayBkb3duIHdoZXJlIGluIHRoZSBjb2RlXG4gKiB0aGUgcGF0dGVybiBpcyBiZWluZyB1c2VkIGFzIHRoZSBjb2RlIGlzIGJlaW5nIHVwZGF0ZWQuXG4gKlxuICpcbiAqL1xuQERpcmVjdGl2ZSh7c2VsZWN0b3I6ICdbZm9ybUNvbnRyb2xdJywgcHJvdmlkZXJzOiBbZm9ybUNvbnRyb2xCaW5kaW5nXSwgZXhwb3J0QXM6ICduZ0Zvcm0nfSlcblxuZXhwb3J0IGNsYXNzIEZvcm1Db250cm9sRGlyZWN0aXZlIGV4dGVuZHMgTmdDb250cm9sIGltcGxlbWVudHMgT25DaGFuZ2VzIHtcbiAgdmlld01vZGVsOiBhbnk7XG5cbiAgQElucHV0KCdmb3JtQ29udHJvbCcpIGZvcm06IEZvcm1Db250cm9sO1xuXG4gIEBJbnB1dCgnZGlzYWJsZWQnKVxuICBzZXQgaXNEaXNhYmxlZChpc0Rpc2FibGVkOiBib29sZWFuKSB7IFJlYWN0aXZlRXJyb3JzLmRpc2FibGVkQXR0cldhcm5pbmcoKTsgfVxuXG4gIC8vIFRPRE8oa2FyYSk6IHJlbW92ZSBuZXh0IDQgcHJvcGVydGllcyBvbmNlIGRlcHJlY2F0aW9uIHBlcmlvZCBpcyBvdmVyXG5cbiAgLyoqIEBkZXByZWNhdGVkIGFzIG9mIHY2ICovXG4gIEBJbnB1dCgnbmdNb2RlbCcpIG1vZGVsOiBhbnk7XG5cbiAgLyoqIEBkZXByZWNhdGVkIGFzIG9mIHY2ICovXG4gIEBPdXRwdXQoJ25nTW9kZWxDaGFuZ2UnKSB1cGRhdGUgPSBuZXcgRXZlbnRFbWl0dGVyKCk7XG5cbiAgLyoqXG4gICAqIFN0YXRpYyBwcm9wZXJ0eSB1c2VkIHRvIHRyYWNrIHdoZXRoZXIgYW55IG5nTW9kZWwgd2FybmluZ3MgaGF2ZSBiZWVuIHNlbnQgYWNyb3NzXG4gICAqIGFsbCBpbnN0YW5jZXMgb2YgRm9ybUNvbnRyb2xEaXJlY3RpdmUuIFVzZWQgdG8gc3VwcG9ydCB3YXJuaW5nIGNvbmZpZyBvZiBcIm9uY2VcIi5cbiAgICpcbiAgICogQGludGVybmFsXG4gICAqL1xuICBzdGF0aWMgX25nTW9kZWxXYXJuaW5nU2VudE9uY2UgPSBmYWxzZTtcblxuICAvKipcbiAgICogSW5zdGFuY2UgcHJvcGVydHkgdXNlZCB0byB0cmFjayB3aGV0aGVyIGFuIG5nTW9kZWwgd2FybmluZyBoYXMgYmVlbiBzZW50IG91dCBmb3IgdGhpc1xuICAgKiBwYXJ0aWN1bGFyIEZvcm1Db250cm9sRGlyZWN0aXZlIGluc3RhbmNlLiBVc2VkIHRvIHN1cHBvcnQgd2FybmluZyBjb25maWcgb2YgXCJhbHdheXNcIi5cbiAgICpcbiAgICogQGludGVybmFsXG4gICAqL1xuICBfbmdNb2RlbFdhcm5pbmdTZW50ID0gZmFsc2U7XG5cbiAgY29uc3RydWN0b3IoQE9wdGlvbmFsKCkgQFNlbGYoKSBASW5qZWN0KE5HX1ZBTElEQVRPUlMpIHZhbGlkYXRvcnM6IEFycmF5PFZhbGlkYXRvcnxWYWxpZGF0b3JGbj4sXG4gICAgICAgICAgICAgIEBPcHRpb25hbCgpIEBTZWxmKCkgQEluamVjdChOR19BU1lOQ19WQUxJREFUT1JTKSBhc3luY1ZhbGlkYXRvcnM6IEFycmF5PEFzeW5jVmFsaWRhdG9yfEFzeW5jVmFsaWRhdG9yRm4+LFxuICAgICAgICAgICAgICBAT3B0aW9uYWwoKSBAU2VsZigpIEBJbmplY3QoTkdfVkFMVUVfQUNDRVNTT1IpXG4gICAgICAgICAgICAgIHZhbHVlQWNjZXNzb3JzOiBDb250cm9sVmFsdWVBY2Nlc3NvcltdLFxuICAgICAgICAgICAgICBAT3B0aW9uYWwoKSBASW5qZWN0KE5HX01PREVMX1dJVEhfRk9STV9DT05UUk9MX1dBUk5JTkcpIHByaXZhdGUgX25nTW9kZWxXYXJuaW5nQ29uZmlnOiBzdHJpbmd8bnVsbCkge1xuICAgICAgICAgICAgICAgIHN1cGVyKCk7XG4gICAgICAgICAgICAgICAgdGhpcy5fcmF3VmFsaWRhdG9ycyA9IHZhbGlkYXRvcnMgfHwgW107XG4gICAgICAgICAgICAgICAgdGhpcy5fcmF3QXN5bmNWYWxpZGF0b3JzID0gYXN5bmNWYWxpZGF0b3JzIHx8IFtdO1xuICAgICAgICAgICAgICAgIHRoaXMudmFsdWVBY2Nlc3NvciA9IHNlbGVjdFZhbHVlQWNjZXNzb3IodGhpcywgdmFsdWVBY2Nlc3NvcnMpO1xuICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgbmdPbkNoYW5nZXMoY2hhbmdlczogU2ltcGxlQ2hhbmdlcyk6IHZvaWQge1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLl9pc0NvbnRyb2xDaGFuZ2VkKGNoYW5nZXMpKSB7XG4gICAgICAgICAgICAgICAgICBzZXRVcENvbnRyb2wodGhpcy5mb3JtLCB0aGlzKTtcbiAgICAgICAgICAgICAgICAgIGlmICh0aGlzLmNvbnRyb2wuZGlzYWJsZWQgJiYgdGhpcy52YWx1ZUFjY2Vzc29yICEuc2V0RGlzYWJsZWRTdGF0ZSkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnZhbHVlQWNjZXNzb3IgIS5zZXREaXNhYmxlZFN0YXRlICEodHJ1ZSk7XG4gICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICB0aGlzLmZvcm0udXBkYXRlVmFsdWVBbmRWYWxpZGl0eSh7ZW1pdEV2ZW50OiBmYWxzZX0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAoaXNQcm9wZXJ0eVVwZGF0ZWQoY2hhbmdlcywgdGhpcy52aWV3TW9kZWwpKSB7XG4gICAgICAgICAgICAgICAgICBfbmdNb2RlbFdhcm5pbmcoXG4gICAgICAgICAgICAgICAgICAgICAgJ2Zvcm1Db250cm9sJywgRm9ybUNvbnRyb2xEaXJlY3RpdmUsIHRoaXMsIHRoaXMuX25nTW9kZWxXYXJuaW5nQ29uZmlnKTtcbiAgICAgICAgICAgICAgICAgIHRoaXMuZm9ybS5zZXRWYWx1ZSh0aGlzLm1vZGVsKTtcbiAgICAgICAgICAgICAgICAgIHRoaXMudmlld01vZGVsID0gdGhpcy5tb2RlbDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICBnZXQgcGF0aCgpOiBzdHJpbmdbXSB7IHJldHVybiBbXTsgfVxuXG4gICAgICAgICAgICAgIGdldCB2YWxpZGF0b3IoKTogVmFsaWRhdG9yRm58bnVsbCB7IHJldHVybiBjb21wb3NlVmFsaWRhdG9ycyh0aGlzLl9yYXdWYWxpZGF0b3JzKTsgfVxuXG4gICAgICAgICAgICAgIGdldCBhc3luY1ZhbGlkYXRvcigpOiBBc3luY1ZhbGlkYXRvckZufG51bGwge1xuICAgICAgICAgICAgICAgIHJldHVybiBjb21wb3NlQXN5bmNWYWxpZGF0b3JzKHRoaXMuX3Jhd0FzeW5jVmFsaWRhdG9ycyk7XG4gICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICBnZXQgY29udHJvbCgpOiBGb3JtQ29udHJvbCB7IHJldHVybiB0aGlzLmZvcm07IH1cblxuICAgICAgICAgICAgICB2aWV3VG9Nb2RlbFVwZGF0ZShuZXdWYWx1ZTogYW55KTogdm9pZCB7XG4gICAgICAgICAgICAgICAgdGhpcy52aWV3TW9kZWwgPSBuZXdWYWx1ZTtcbiAgICAgICAgICAgICAgICB0aGlzLnVwZGF0ZS5lbWl0KG5ld1ZhbHVlKTtcbiAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgIHByaXZhdGUgX2lzQ29udHJvbENoYW5nZWQoY2hhbmdlczoge1trZXk6IHN0cmluZ106IGFueX0pOiBib29sZWFuIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gY2hhbmdlcy5oYXNPd25Qcm9wZXJ0eSgnZm9ybScpO1xuICAgICAgICAgICAgICB9XG59XG4iXX0=