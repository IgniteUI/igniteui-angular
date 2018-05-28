/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import * as tslib_1 from "tslib";
import { Directive, EventEmitter, Host, Inject, Input, Optional, Output, Self, SkipSelf, forwardRef } from '@angular/core';
import { NG_ASYNC_VALIDATORS, NG_VALIDATORS } from '../../validators';
import { AbstractFormGroupDirective } from '../abstract_form_group_directive';
import { ControlContainer } from '../control_container';
import { NG_VALUE_ACCESSOR } from '../control_value_accessor';
import { NgControl } from '../ng_control';
import { ReactiveErrors } from '../reactive_errors';
import { _ngModelWarning, composeAsyncValidators, composeValidators, controlPath, isPropertyUpdated, selectValueAccessor } from '../shared';
import { NG_MODEL_WITH_FORM_CONTROL_WARNING } from './form_control_directive';
import { FormGroupDirective } from './form_group_directive';
import { FormArrayName, FormGroupName } from './form_group_name';
export var controlNameBinding = {
    provide: NgControl,
    useExisting: forwardRef(function () { return FormControlName; })
};
/**
 * @description
 *
 * Syncs a `FormControl` in an existing `FormGroup` to a form control
 * element by name.
 *
 * This directive ensures that any values written to the `FormControl`
 * instance programmatically will be written to the DOM element (model -> view). Conversely,
 * any values written to the DOM element through user input will be reflected in the
 * `FormControl` instance (view -> model).
 *
 * This directive is designed to be used with a parent `FormGroupDirective` (selector:
 * `[formGroup]`).
 *
 * It accepts the string name of the `FormControl` instance you want to
 * link, and will look for a `FormControl` registered with that name in the
 * closest `FormGroup` or `FormArray` above it.
 *
 * **Access the control**: You can access the `FormControl` associated with
 * this directive by using the {@link AbstractControl#get get} method.
 * Ex: `this.form.get('first');`
 *
 * **Get value**: the `value` property is always synced and available on the `FormControl`.
 * See a full list of available properties in `AbstractControl`.
 *
 *  **Set value**: You can set an initial value for the control when instantiating the
 *  `FormControl`, or you can set it programmatically later using
 *  {@link AbstractControl#setValue setValue} or {@link AbstractControl#patchValue patchValue}.
 *
 * **Listen to value**: If you want to listen to changes in the value of the control, you can
 * subscribe to the {@link AbstractControl#valueChanges valueChanges} event.  You can also listen to
 * {@link AbstractControl#statusChanges statusChanges} to be notified when the validation status is
 * re-calculated.
 *
 * ### Example
 *
 * In this example, we create form controls for first name and last name.
 *
 * {@example forms/ts/simpleFormGroup/simple_form_group_example.ts region='Component'}
 *
 * To see `formControlName` examples with different form control types, see:
 *
 * * Radio buttons: `RadioControlValueAccessor`
 * * Selects: `SelectControlValueAccessor`
 *
 * **npm package**: `@angular/forms`
 *
 * **NgModule**: `ReactiveFormsModule`
 *
 * ### Use with ngModel
 *
 * Support for using the `ngModel` input property and `ngModelChange` event with reactive
 * form directives has been deprecated in Angular v6 and will be removed in Angular v7.
 *
 * Now deprecated:
 * ```html
 * <form [formGroup]="form">
 *   <input formControlName="first" [(ngModel)]="value">
 * </form>
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
 * <form [formGroup]="form">
 *   <input formControlName="first">
 * </form>
 * ```
 *
 * ```ts
 * this.form.get('first').setValue('some value');
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
var FormControlName = /** @class */ (function (_super) {
    tslib_1.__extends(FormControlName, _super);
    function FormControlName(parent, validators, asyncValidators, valueAccessors, _ngModelWarningConfig) {
        var _this = _super.call(this) || this;
        _this._ngModelWarningConfig = _ngModelWarningConfig;
        _this._added = false;
        /** @deprecated as of v6 */
        _this.update = new EventEmitter();
        /**
           * Instance property used to track whether an ngModel warning has been sent out for this
           * particular FormControlName instance. Used to support warning config of "always".
           *
           * @internal
           */
        _this._ngModelWarningSent = false;
        _this._parent = parent;
        _this._rawValidators = validators || [];
        _this._rawAsyncValidators = asyncValidators || [];
        _this.valueAccessor = selectValueAccessor(_this, valueAccessors);
        return _this;
    }
    Object.defineProperty(FormControlName.prototype, "isDisabled", {
        set: function (isDisabled) { ReactiveErrors.disabledAttrWarning(); },
        enumerable: true,
        configurable: true
    });
    FormControlName.prototype.ngOnChanges = function (changes) {
        if (!this._added)
            this._setUpControl();
        if (isPropertyUpdated(changes, this.viewModel)) {
            _ngModelWarning('formControlName', FormControlName, this, this._ngModelWarningConfig);
            this.viewModel = this.model;
            this.formDirective.updateModel(this, this.model);
        }
    };
    FormControlName.prototype.ngOnDestroy = function () {
        if (this.formDirective) {
            this.formDirective.removeControl(this);
        }
    };
    FormControlName.prototype.viewToModelUpdate = function (newValue) {
        this.viewModel = newValue;
        this.update.emit(newValue);
    };
    Object.defineProperty(FormControlName.prototype, "path", {
        get: function () { return controlPath(this.name, (this._parent)); },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(FormControlName.prototype, "formDirective", {
        get: function () { return this._parent ? this._parent.formDirective : null; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(FormControlName.prototype, "validator", {
        get: function () { return composeValidators(this._rawValidators); },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(FormControlName.prototype, "asyncValidator", {
        get: function () {
            return composeAsyncValidators(this._rawAsyncValidators);
        },
        enumerable: true,
        configurable: true
    });
    FormControlName.prototype._checkParentType = function () {
        if (!(this._parent instanceof FormGroupName) &&
            this._parent instanceof AbstractFormGroupDirective) {
            ReactiveErrors.ngModelGroupException();
        }
        else if (!(this._parent instanceof FormGroupName) && !(this._parent instanceof FormGroupDirective) &&
            !(this._parent instanceof FormArrayName)) {
            ReactiveErrors.controlParentException();
        }
    };
    FormControlName.prototype._setUpControl = function () {
        this._checkParentType();
        this.control = this.formDirective.addControl(this);
        if (this.control.disabled && this.valueAccessor.setDisabledState) {
            this.valueAccessor.setDisabledState(true);
        }
        this._added = true;
    };
    /**
       * Static property used to track whether any ngModel warnings have been sent across
       * all instances of FormControlName. Used to support warning config of "once".
       *
       * @internal
       */
    FormControlName._ngModelWarningSentOnce = false;
    FormControlName.decorators = [
        { type: Directive, args: [{ selector: '[formControlName]', providers: [controlNameBinding] },] }
    ];
    /** @nocollapse */
    FormControlName.ctorParameters = function () { return [
        { type: ControlContainer, decorators: [{ type: Optional }, { type: Host }, { type: SkipSelf },] },
        { type: Array, decorators: [{ type: Optional }, { type: Self }, { type: Inject, args: [NG_VALIDATORS,] },] },
        { type: Array, decorators: [{ type: Optional }, { type: Self }, { type: Inject, args: [NG_ASYNC_VALIDATORS,] },] },
        { type: Array, decorators: [{ type: Optional }, { type: Self }, { type: Inject, args: [NG_VALUE_ACCESSOR,] },] },
        { type: undefined, decorators: [{ type: Optional }, { type: Inject, args: [NG_MODEL_WITH_FORM_CONTROL_WARNING,] },] },
    ]; };
    FormControlName.propDecorators = {
        "name": [{ type: Input, args: ['formControlName',] },],
        "isDisabled": [{ type: Input, args: ['disabled',] },],
        "model": [{ type: Input, args: ['ngModel',] },],
        "update": [{ type: Output, args: ['ngModelChange',] },],
    };
    return FormControlName;
}(NgControl));
export { FormControlName };

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZm9ybV9jb250cm9sX25hbWUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9mb3Jtcy9zcmMvZGlyZWN0aXZlcy9yZWFjdGl2ZV9kaXJlY3RpdmVzL2Zvcm1fY29udHJvbF9uYW1lLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7O0FBUUEsT0FBTyxFQUFDLFNBQVMsRUFBRSxZQUFZLEVBQUUsSUFBSSxFQUFFLE1BQU0sRUFBRSxLQUFLLEVBQXdCLFFBQVEsRUFBRSxNQUFNLEVBQUUsSUFBSSxFQUFpQixRQUFRLEVBQUUsVUFBVSxFQUFDLE1BQU0sZUFBZSxDQUFDO0FBRzlKLE9BQU8sRUFBQyxtQkFBbUIsRUFBRSxhQUFhLEVBQUMsTUFBTSxrQkFBa0IsQ0FBQztBQUNwRSxPQUFPLEVBQUMsMEJBQTBCLEVBQUMsTUFBTSxrQ0FBa0MsQ0FBQztBQUM1RSxPQUFPLEVBQUMsZ0JBQWdCLEVBQUMsTUFBTSxzQkFBc0IsQ0FBQztBQUN0RCxPQUFPLEVBQXVCLGlCQUFpQixFQUFDLE1BQU0sMkJBQTJCLENBQUM7QUFDbEYsT0FBTyxFQUFDLFNBQVMsRUFBQyxNQUFNLGVBQWUsQ0FBQztBQUN4QyxPQUFPLEVBQUMsY0FBYyxFQUFDLE1BQU0sb0JBQW9CLENBQUM7QUFDbEQsT0FBTyxFQUFDLGVBQWUsRUFBRSxzQkFBc0IsRUFBRSxpQkFBaUIsRUFBRSxXQUFXLEVBQUUsaUJBQWlCLEVBQUUsbUJBQW1CLEVBQUMsTUFBTSxXQUFXLENBQUM7QUFHMUksT0FBTyxFQUFDLGtDQUFrQyxFQUFDLE1BQU0sMEJBQTBCLENBQUM7QUFDNUUsT0FBTyxFQUFDLGtCQUFrQixFQUFDLE1BQU0sd0JBQXdCLENBQUM7QUFDMUQsT0FBTyxFQUFDLGFBQWEsRUFBRSxhQUFhLEVBQUMsTUFBTSxtQkFBbUIsQ0FBQztBQUUvRCxNQUFNLENBQUMsSUFBTSxrQkFBa0IsR0FBUTtJQUNyQyxPQUFPLEVBQUUsU0FBUztJQUNsQixXQUFXLEVBQUUsVUFBVSxDQUFDLGNBQU0sT0FBQSxlQUFlLEVBQWYsQ0FBZSxDQUFDO0NBQy9DLENBQUM7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztJQTRIbUMsMkNBQVM7SUFtQzVDLHlCQUNvQyxRQUNXLFlBQ00saUJBRUYsZ0JBQ2lCO1FBTnBFLFlBUUUsaUJBQU8sU0FLUjtRQVBtRSwyQkFBcUIsR0FBckIscUJBQXFCO3VCQXhDeEUsS0FBSzs7dUJBZ0JZLElBQUksWUFBWSxFQUFFOzs7Ozs7O29DQWdCOUIsS0FBSztRQVd6QixLQUFJLENBQUMsT0FBTyxHQUFHLE1BQU0sQ0FBQztRQUN0QixLQUFJLENBQUMsY0FBYyxHQUFHLFVBQVUsSUFBSSxFQUFFLENBQUM7UUFDdkMsS0FBSSxDQUFDLG1CQUFtQixHQUFHLGVBQWUsSUFBSSxFQUFFLENBQUM7UUFDakQsS0FBSSxDQUFDLGFBQWEsR0FBRyxtQkFBbUIsQ0FBQyxLQUFJLEVBQUUsY0FBYyxDQUFDLENBQUM7O0tBQ2hFOzBCQXZDRyx1Q0FBVTt1QkFBQyxVQUFtQixJQUFJLGNBQWMsQ0FBQyxtQkFBbUIsRUFBRSxDQUFDOzs7O0lBeUMzRSxxQ0FBVyxHQUFYLFVBQVksT0FBc0I7UUFDaEMsRUFBRSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDO1lBQUMsSUFBSSxDQUFDLGFBQWEsRUFBRSxDQUFDO1FBQ3ZDLEVBQUUsQ0FBQyxDQUFDLGlCQUFpQixDQUFDLE9BQU8sRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQy9DLGVBQWUsQ0FBQyxpQkFBaUIsRUFBRSxlQUFlLEVBQUUsSUFBSSxFQUFFLElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxDQUFDO1lBQ3RGLElBQUksQ0FBQyxTQUFTLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQztZQUM1QixJQUFJLENBQUMsYUFBYSxDQUFDLFdBQVcsQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDO1NBQ2xEO0tBQ0Y7SUFFRCxxQ0FBVyxHQUFYO1FBQ0UsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxDQUFDLENBQUM7WUFDdkIsSUFBSSxDQUFDLGFBQWEsQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDLENBQUM7U0FDeEM7S0FDRjtJQUVELDJDQUFpQixHQUFqQixVQUFrQixRQUFhO1FBQzdCLElBQUksQ0FBQyxTQUFTLEdBQUcsUUFBUSxDQUFDO1FBQzFCLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDO0tBQzVCO0lBRUQsc0JBQUksaUNBQUk7YUFBUixjQUF1QixNQUFNLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQSxJQUFJLENBQUMsT0FBUyxDQUFBLENBQUMsQ0FBQyxFQUFFOzs7T0FBQTtJQUV2RSxzQkFBSSwwQ0FBYTthQUFqQixjQUEyQixNQUFNLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxhQUFhLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxFQUFFOzs7T0FBQTtJQUVyRixzQkFBSSxzQ0FBUzthQUFiLGNBQW9DLE1BQU0sQ0FBQyxpQkFBaUIsQ0FBQyxJQUFJLENBQUMsY0FBYyxDQUFDLENBQUMsRUFBRTs7O09BQUE7SUFFcEYsc0JBQUksMkNBQWM7YUFBbEI7WUFDRSxNQUFNLENBQUMsc0JBQXNCLENBQUMsSUFBSSxDQUFDLG1CQUFtQixDQUFHLENBQUM7U0FDM0Q7OztPQUFBO0lBRU8sMENBQWdCLEdBQXhCO1FBQ0UsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxPQUFPLFlBQVksYUFBYSxDQUFDO1lBQ3hDLElBQUksQ0FBQyxPQUFPLFlBQVksMEJBQTBCLENBQUMsQ0FBQyxDQUFDO1lBQ3ZELGNBQWMsQ0FBQyxxQkFBcUIsRUFBRSxDQUFDO1NBQ3hDO1FBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUNOLENBQUMsQ0FBQyxJQUFJLENBQUMsT0FBTyxZQUFZLGFBQWEsQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsT0FBTyxZQUFZLGtCQUFrQixDQUFDO1lBQ3pGLENBQUMsQ0FBQyxJQUFJLENBQUMsT0FBTyxZQUFZLGFBQWEsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUM3QyxjQUFjLENBQUMsc0JBQXNCLEVBQUUsQ0FBQztTQUN6QztLQUNGO0lBRU8sdUNBQWEsR0FBckI7UUFDRSxJQUFJLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQztRQUN2QixJQUE4QixDQUFDLE9BQU8sR0FBRyxJQUFJLENBQUMsYUFBYSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUM5RSxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLFFBQVEsSUFBSSxJQUFJLENBQUMsYUFBZSxDQUFDLGdCQUFnQixDQUFDLENBQUMsQ0FBQztZQUNuRSxJQUFJLENBQUMsYUFBZSxDQUFDLGdCQUFrQixDQUFDLElBQUksQ0FBQyxDQUFDO1NBQy9DO1FBQ0QsSUFBSSxDQUFDLE1BQU0sR0FBRyxJQUFJLENBQUM7S0FDcEI7Ozs7Ozs7OENBekVnQyxLQUFLOztnQkExQnZDLFNBQVMsU0FBQyxFQUFDLFFBQVEsRUFBRSxtQkFBbUIsRUFBRSxTQUFTLEVBQUUsQ0FBQyxrQkFBa0IsQ0FBQyxFQUFDOzs7O2dCQXpJbkUsZ0JBQWdCLHVCQThLakIsUUFBUSxZQUFJLElBQUksWUFBSSxRQUFROzRDQUM1QixRQUFRLFlBQUksSUFBSSxZQUFJLE1BQU0sU0FBQyxhQUFhOzRDQUN4QyxRQUFRLFlBQUksSUFBSSxZQUFJLE1BQU0sU0FBQyxtQkFBbUI7NENBRTlDLFFBQVEsWUFBSSxJQUFJLFlBQUksTUFBTSxTQUFDLGlCQUFpQjtnREFDNUMsUUFBUSxZQUFJLE1BQU0sU0FBQyxrQ0FBa0M7Ozt5QkFuQ3pELEtBQUssU0FBQyxpQkFBaUI7K0JBRXZCLEtBQUssU0FBQyxVQUFVOzBCQU1oQixLQUFLLFNBQUMsU0FBUzsyQkFHZixNQUFNLFNBQUMsZUFBZTs7MEJBeEt6QjtFQXVKcUMsU0FBUztTQUFqQyxlQUFlIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBJbmMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge0RpcmVjdGl2ZSwgRXZlbnRFbWl0dGVyLCBIb3N0LCBJbmplY3QsIElucHV0LCBPbkNoYW5nZXMsIE9uRGVzdHJveSwgT3B0aW9uYWwsIE91dHB1dCwgU2VsZiwgU2ltcGxlQ2hhbmdlcywgU2tpcFNlbGYsIGZvcndhcmRSZWZ9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuXG5pbXBvcnQge0Zvcm1Db250cm9sfSBmcm9tICcuLi8uLi9tb2RlbCc7XG5pbXBvcnQge05HX0FTWU5DX1ZBTElEQVRPUlMsIE5HX1ZBTElEQVRPUlN9IGZyb20gJy4uLy4uL3ZhbGlkYXRvcnMnO1xuaW1wb3J0IHtBYnN0cmFjdEZvcm1Hcm91cERpcmVjdGl2ZX0gZnJvbSAnLi4vYWJzdHJhY3RfZm9ybV9ncm91cF9kaXJlY3RpdmUnO1xuaW1wb3J0IHtDb250cm9sQ29udGFpbmVyfSBmcm9tICcuLi9jb250cm9sX2NvbnRhaW5lcic7XG5pbXBvcnQge0NvbnRyb2xWYWx1ZUFjY2Vzc29yLCBOR19WQUxVRV9BQ0NFU1NPUn0gZnJvbSAnLi4vY29udHJvbF92YWx1ZV9hY2Nlc3Nvcic7XG5pbXBvcnQge05nQ29udHJvbH0gZnJvbSAnLi4vbmdfY29udHJvbCc7XG5pbXBvcnQge1JlYWN0aXZlRXJyb3JzfSBmcm9tICcuLi9yZWFjdGl2ZV9lcnJvcnMnO1xuaW1wb3J0IHtfbmdNb2RlbFdhcm5pbmcsIGNvbXBvc2VBc3luY1ZhbGlkYXRvcnMsIGNvbXBvc2VWYWxpZGF0b3JzLCBjb250cm9sUGF0aCwgaXNQcm9wZXJ0eVVwZGF0ZWQsIHNlbGVjdFZhbHVlQWNjZXNzb3J9IGZyb20gJy4uL3NoYXJlZCc7XG5pbXBvcnQge0FzeW5jVmFsaWRhdG9yLCBBc3luY1ZhbGlkYXRvckZuLCBWYWxpZGF0b3IsIFZhbGlkYXRvckZufSBmcm9tICcuLi92YWxpZGF0b3JzJztcblxuaW1wb3J0IHtOR19NT0RFTF9XSVRIX0ZPUk1fQ09OVFJPTF9XQVJOSU5HfSBmcm9tICcuL2Zvcm1fY29udHJvbF9kaXJlY3RpdmUnO1xuaW1wb3J0IHtGb3JtR3JvdXBEaXJlY3RpdmV9IGZyb20gJy4vZm9ybV9ncm91cF9kaXJlY3RpdmUnO1xuaW1wb3J0IHtGb3JtQXJyYXlOYW1lLCBGb3JtR3JvdXBOYW1lfSBmcm9tICcuL2Zvcm1fZ3JvdXBfbmFtZSc7XG5cbmV4cG9ydCBjb25zdCBjb250cm9sTmFtZUJpbmRpbmc6IGFueSA9IHtcbiAgcHJvdmlkZTogTmdDb250cm9sLFxuICB1c2VFeGlzdGluZzogZm9yd2FyZFJlZigoKSA9PiBGb3JtQ29udHJvbE5hbWUpXG59O1xuXG4vKipcbiAqIEBkZXNjcmlwdGlvblxuICpcbiAqIFN5bmNzIGEgYEZvcm1Db250cm9sYCBpbiBhbiBleGlzdGluZyBgRm9ybUdyb3VwYCB0byBhIGZvcm0gY29udHJvbFxuICogZWxlbWVudCBieSBuYW1lLlxuICpcbiAqIFRoaXMgZGlyZWN0aXZlIGVuc3VyZXMgdGhhdCBhbnkgdmFsdWVzIHdyaXR0ZW4gdG8gdGhlIGBGb3JtQ29udHJvbGBcbiAqIGluc3RhbmNlIHByb2dyYW1tYXRpY2FsbHkgd2lsbCBiZSB3cml0dGVuIHRvIHRoZSBET00gZWxlbWVudCAobW9kZWwgLT4gdmlldykuIENvbnZlcnNlbHksXG4gKiBhbnkgdmFsdWVzIHdyaXR0ZW4gdG8gdGhlIERPTSBlbGVtZW50IHRocm91Z2ggdXNlciBpbnB1dCB3aWxsIGJlIHJlZmxlY3RlZCBpbiB0aGVcbiAqIGBGb3JtQ29udHJvbGAgaW5zdGFuY2UgKHZpZXcgLT4gbW9kZWwpLlxuICpcbiAqIFRoaXMgZGlyZWN0aXZlIGlzIGRlc2lnbmVkIHRvIGJlIHVzZWQgd2l0aCBhIHBhcmVudCBgRm9ybUdyb3VwRGlyZWN0aXZlYCAoc2VsZWN0b3I6XG4gKiBgW2Zvcm1Hcm91cF1gKS5cbiAqXG4gKiBJdCBhY2NlcHRzIHRoZSBzdHJpbmcgbmFtZSBvZiB0aGUgYEZvcm1Db250cm9sYCBpbnN0YW5jZSB5b3Ugd2FudCB0b1xuICogbGluaywgYW5kIHdpbGwgbG9vayBmb3IgYSBgRm9ybUNvbnRyb2xgIHJlZ2lzdGVyZWQgd2l0aCB0aGF0IG5hbWUgaW4gdGhlXG4gKiBjbG9zZXN0IGBGb3JtR3JvdXBgIG9yIGBGb3JtQXJyYXlgIGFib3ZlIGl0LlxuICpcbiAqICoqQWNjZXNzIHRoZSBjb250cm9sKio6IFlvdSBjYW4gYWNjZXNzIHRoZSBgRm9ybUNvbnRyb2xgIGFzc29jaWF0ZWQgd2l0aFxuICogdGhpcyBkaXJlY3RpdmUgYnkgdXNpbmcgdGhlIHtAbGluayBBYnN0cmFjdENvbnRyb2wjZ2V0IGdldH0gbWV0aG9kLlxuICogRXg6IGB0aGlzLmZvcm0uZ2V0KCdmaXJzdCcpO2BcbiAqXG4gKiAqKkdldCB2YWx1ZSoqOiB0aGUgYHZhbHVlYCBwcm9wZXJ0eSBpcyBhbHdheXMgc3luY2VkIGFuZCBhdmFpbGFibGUgb24gdGhlIGBGb3JtQ29udHJvbGAuXG4gKiBTZWUgYSBmdWxsIGxpc3Qgb2YgYXZhaWxhYmxlIHByb3BlcnRpZXMgaW4gYEFic3RyYWN0Q29udHJvbGAuXG4gKlxuICogICoqU2V0IHZhbHVlKio6IFlvdSBjYW4gc2V0IGFuIGluaXRpYWwgdmFsdWUgZm9yIHRoZSBjb250cm9sIHdoZW4gaW5zdGFudGlhdGluZyB0aGVcbiAqICBgRm9ybUNvbnRyb2xgLCBvciB5b3UgY2FuIHNldCBpdCBwcm9ncmFtbWF0aWNhbGx5IGxhdGVyIHVzaW5nXG4gKiAge0BsaW5rIEFic3RyYWN0Q29udHJvbCNzZXRWYWx1ZSBzZXRWYWx1ZX0gb3Ige0BsaW5rIEFic3RyYWN0Q29udHJvbCNwYXRjaFZhbHVlIHBhdGNoVmFsdWV9LlxuICpcbiAqICoqTGlzdGVuIHRvIHZhbHVlKio6IElmIHlvdSB3YW50IHRvIGxpc3RlbiB0byBjaGFuZ2VzIGluIHRoZSB2YWx1ZSBvZiB0aGUgY29udHJvbCwgeW91IGNhblxuICogc3Vic2NyaWJlIHRvIHRoZSB7QGxpbmsgQWJzdHJhY3RDb250cm9sI3ZhbHVlQ2hhbmdlcyB2YWx1ZUNoYW5nZXN9IGV2ZW50LiAgWW91IGNhbiBhbHNvIGxpc3RlbiB0b1xuICoge0BsaW5rIEFic3RyYWN0Q29udHJvbCNzdGF0dXNDaGFuZ2VzIHN0YXR1c0NoYW5nZXN9IHRvIGJlIG5vdGlmaWVkIHdoZW4gdGhlIHZhbGlkYXRpb24gc3RhdHVzIGlzXG4gKiByZS1jYWxjdWxhdGVkLlxuICpcbiAqICMjIyBFeGFtcGxlXG4gKlxuICogSW4gdGhpcyBleGFtcGxlLCB3ZSBjcmVhdGUgZm9ybSBjb250cm9scyBmb3IgZmlyc3QgbmFtZSBhbmQgbGFzdCBuYW1lLlxuICpcbiAqIHtAZXhhbXBsZSBmb3Jtcy90cy9zaW1wbGVGb3JtR3JvdXAvc2ltcGxlX2Zvcm1fZ3JvdXBfZXhhbXBsZS50cyByZWdpb249J0NvbXBvbmVudCd9XG4gKlxuICogVG8gc2VlIGBmb3JtQ29udHJvbE5hbWVgIGV4YW1wbGVzIHdpdGggZGlmZmVyZW50IGZvcm0gY29udHJvbCB0eXBlcywgc2VlOlxuICpcbiAqICogUmFkaW8gYnV0dG9uczogYFJhZGlvQ29udHJvbFZhbHVlQWNjZXNzb3JgXG4gKiAqIFNlbGVjdHM6IGBTZWxlY3RDb250cm9sVmFsdWVBY2Nlc3NvcmBcbiAqXG4gKiAqKm5wbSBwYWNrYWdlKio6IGBAYW5ndWxhci9mb3Jtc2BcbiAqXG4gKiAqKk5nTW9kdWxlKio6IGBSZWFjdGl2ZUZvcm1zTW9kdWxlYFxuICpcbiAqICMjIyBVc2Ugd2l0aCBuZ01vZGVsXG4gKlxuICogU3VwcG9ydCBmb3IgdXNpbmcgdGhlIGBuZ01vZGVsYCBpbnB1dCBwcm9wZXJ0eSBhbmQgYG5nTW9kZWxDaGFuZ2VgIGV2ZW50IHdpdGggcmVhY3RpdmVcbiAqIGZvcm0gZGlyZWN0aXZlcyBoYXMgYmVlbiBkZXByZWNhdGVkIGluIEFuZ3VsYXIgdjYgYW5kIHdpbGwgYmUgcmVtb3ZlZCBpbiBBbmd1bGFyIHY3LlxuICpcbiAqIE5vdyBkZXByZWNhdGVkOlxuICogYGBgaHRtbFxuICogPGZvcm0gW2Zvcm1Hcm91cF09XCJmb3JtXCI+XG4gKiAgIDxpbnB1dCBmb3JtQ29udHJvbE5hbWU9XCJmaXJzdFwiIFsobmdNb2RlbCldPVwidmFsdWVcIj5cbiAqIDwvZm9ybT5cbiAqIGBgYFxuICpcbiAqIGBgYHRzXG4gKiB0aGlzLnZhbHVlID0gJ3NvbWUgdmFsdWUnO1xuICogYGBgXG4gKlxuICogVGhpcyBoYXMgYmVlbiBkZXByZWNhdGVkIGZvciBhIGZldyByZWFzb25zLiBGaXJzdCwgZGV2ZWxvcGVycyBoYXZlIGZvdW5kIHRoaXMgcGF0dGVyblxuICogY29uZnVzaW5nLiBJdCBzZWVtcyBsaWtlIHRoZSBhY3R1YWwgYG5nTW9kZWxgIGRpcmVjdGl2ZSBpcyBiZWluZyB1c2VkLCBidXQgaW4gZmFjdCBpdCdzXG4gKiBhbiBpbnB1dC9vdXRwdXQgcHJvcGVydHkgbmFtZWQgYG5nTW9kZWxgIG9uIHRoZSByZWFjdGl2ZSBmb3JtIGRpcmVjdGl2ZSB0aGF0IHNpbXBseVxuICogYXBwcm94aW1hdGVzIChzb21lIG9mKSBpdHMgYmVoYXZpb3IuIFNwZWNpZmljYWxseSwgaXQgYWxsb3dzIGdldHRpbmcvc2V0dGluZyB0aGUgdmFsdWVcbiAqIGFuZCBpbnRlcmNlcHRpbmcgdmFsdWUgZXZlbnRzLiBIb3dldmVyLCBzb21lIG9mIGBuZ01vZGVsYCdzIG90aGVyIGZlYXR1cmVzIC0gbGlrZVxuICogZGVsYXlpbmcgdXBkYXRlcyB3aXRoYG5nTW9kZWxPcHRpb25zYCBvciBleHBvcnRpbmcgdGhlIGRpcmVjdGl2ZSAtIHNpbXBseSBkb24ndCB3b3JrLFxuICogd2hpY2ggaGFzIHVuZGVyc3RhbmRhYmx5IGNhdXNlZCBzb21lIGNvbmZ1c2lvbi5cbiAqXG4gKiBJbiBhZGRpdGlvbiwgdGhpcyBwYXR0ZXJuIG1peGVzIHRlbXBsYXRlLWRyaXZlbiBhbmQgcmVhY3RpdmUgZm9ybXMgc3RyYXRlZ2llcywgd2hpY2hcbiAqIHdlIGdlbmVyYWxseSBkb24ndCByZWNvbW1lbmQgYmVjYXVzZSBpdCBkb2Vzbid0IHRha2UgYWR2YW50YWdlIG9mIHRoZSBmdWxsIGJlbmVmaXRzIG9mXG4gKiBlaXRoZXIgc3RyYXRlZ3kuIFNldHRpbmcgdGhlIHZhbHVlIGluIHRoZSB0ZW1wbGF0ZSB2aW9sYXRlcyB0aGUgdGVtcGxhdGUtYWdub3N0aWNcbiAqIHByaW5jaXBsZXMgYmVoaW5kIHJlYWN0aXZlIGZvcm1zLCB3aGVyZWFzIGFkZGluZyBhIGBGb3JtQ29udHJvbGAvYEZvcm1Hcm91cGAgbGF5ZXIgaW5cbiAqIHRoZSBjbGFzcyByZW1vdmVzIHRoZSBjb252ZW5pZW5jZSBvZiBkZWZpbmluZyBmb3JtcyBpbiB0aGUgdGVtcGxhdGUuXG4gKlxuICogVG8gdXBkYXRlIHlvdXIgY29kZSBiZWZvcmUgdjcsIHlvdSdsbCB3YW50IHRvIGRlY2lkZSB3aGV0aGVyIHRvIHN0aWNrIHdpdGggcmVhY3RpdmUgZm9ybVxuICogZGlyZWN0aXZlcyAoYW5kIGdldC9zZXQgdmFsdWVzIHVzaW5nIHJlYWN0aXZlIGZvcm1zIHBhdHRlcm5zKSBvciBzd2l0Y2ggb3ZlciB0b1xuICogdGVtcGxhdGUtZHJpdmVuIGRpcmVjdGl2ZXMuXG4gKlxuICogQWZ0ZXIgKGNob2ljZSAxIC0gdXNlIHJlYWN0aXZlIGZvcm1zKTpcbiAqXG4gKiBgYGBodG1sXG4gKiA8Zm9ybSBbZm9ybUdyb3VwXT1cImZvcm1cIj5cbiAqICAgPGlucHV0IGZvcm1Db250cm9sTmFtZT1cImZpcnN0XCI+XG4gKiA8L2Zvcm0+XG4gKiBgYGBcbiAqXG4gKiBgYGB0c1xuICogdGhpcy5mb3JtLmdldCgnZmlyc3QnKS5zZXRWYWx1ZSgnc29tZSB2YWx1ZScpO1xuICogYGBgXG4gKlxuICogQWZ0ZXIgKGNob2ljZSAyIC0gdXNlIHRlbXBsYXRlLWRyaXZlbiBmb3Jtcyk6XG4gKlxuICogYGBgaHRtbFxuICogPGlucHV0IFsobmdNb2RlbCldPVwidmFsdWVcIj5cbiAqIGBgYFxuICpcbiAqIGBgYHRzXG4gKiB0aGlzLnZhbHVlID0gJ3NvbWUgdmFsdWUnO1xuICogYGBgXG4gKlxuICogQnkgZGVmYXVsdCwgd2hlbiB5b3UgdXNlIHRoaXMgcGF0dGVybiwgeW91IHdpbGwgc2VlIGEgZGVwcmVjYXRpb24gd2FybmluZyBvbmNlIGluIGRldlxuICogbW9kZS4gWW91IGNhbiBjaG9vc2UgdG8gc2lsZW5jZSB0aGlzIHdhcm5pbmcgYnkgcHJvdmlkaW5nIGEgY29uZmlnIGZvclxuICogYFJlYWN0aXZlRm9ybXNNb2R1bGVgIGF0IGltcG9ydCB0aW1lOlxuICpcbiAqIGBgYHRzXG4gKiBpbXBvcnRzOiBbXG4gKiAgIFJlYWN0aXZlRm9ybXNNb2R1bGUud2l0aENvbmZpZyh7d2Fybk9uTmdNb2RlbFdpdGhGb3JtQ29udHJvbDogJ25ldmVyJ30pO1xuICogXVxuICogYGBgXG4gKlxuICogQWx0ZXJuYXRpdmVseSwgeW91IGNhbiBjaG9vc2UgdG8gc3VyZmFjZSBhIHNlcGFyYXRlIHdhcm5pbmcgZm9yIGVhY2ggaW5zdGFuY2Ugb2YgdGhpc1xuICogcGF0dGVybiB3aXRoIGEgY29uZmlnIHZhbHVlIG9mIGBcImFsd2F5c1wiYC4gVGhpcyBtYXkgaGVscCB0byB0cmFjayBkb3duIHdoZXJlIGluIHRoZSBjb2RlXG4gKiB0aGUgcGF0dGVybiBpcyBiZWluZyB1c2VkIGFzIHRoZSBjb2RlIGlzIGJlaW5nIHVwZGF0ZWQuXG4gKlxuICpcbiAqL1xuQERpcmVjdGl2ZSh7c2VsZWN0b3I6ICdbZm9ybUNvbnRyb2xOYW1lXScsIHByb3ZpZGVyczogW2NvbnRyb2xOYW1lQmluZGluZ119KVxuZXhwb3J0IGNsYXNzIEZvcm1Db250cm9sTmFtZSBleHRlbmRzIE5nQ29udHJvbCBpbXBsZW1lbnRzIE9uQ2hhbmdlcywgT25EZXN0cm95IHtcbiAgcHJpdmF0ZSBfYWRkZWQgPSBmYWxzZTtcbiAgLyoqIEBpbnRlcm5hbCAqL1xuICB2aWV3TW9kZWw6IGFueTtcbiAgcmVhZG9ubHkgY29udHJvbDogRm9ybUNvbnRyb2w7XG5cbiAgQElucHV0KCdmb3JtQ29udHJvbE5hbWUnKSBuYW1lOiBzdHJpbmc7XG5cbiAgQElucHV0KCdkaXNhYmxlZCcpXG4gIHNldCBpc0Rpc2FibGVkKGlzRGlzYWJsZWQ6IGJvb2xlYW4pIHsgUmVhY3RpdmVFcnJvcnMuZGlzYWJsZWRBdHRyV2FybmluZygpOyB9XG5cbiAgLy8gVE9ETyhrYXJhKTogcmVtb3ZlIG5leHQgNCBwcm9wZXJ0aWVzIG9uY2UgZGVwcmVjYXRpb24gcGVyaW9kIGlzIG92ZXJcblxuICAvKiogQGRlcHJlY2F0ZWQgYXMgb2YgdjYgKi9cbiAgQElucHV0KCduZ01vZGVsJykgbW9kZWw6IGFueTtcblxuICAvKiogQGRlcHJlY2F0ZWQgYXMgb2YgdjYgKi9cbiAgQE91dHB1dCgnbmdNb2RlbENoYW5nZScpIHVwZGF0ZSA9IG5ldyBFdmVudEVtaXR0ZXIoKTtcblxuICAvKipcbiAgICogU3RhdGljIHByb3BlcnR5IHVzZWQgdG8gdHJhY2sgd2hldGhlciBhbnkgbmdNb2RlbCB3YXJuaW5ncyBoYXZlIGJlZW4gc2VudCBhY3Jvc3NcbiAgICogYWxsIGluc3RhbmNlcyBvZiBGb3JtQ29udHJvbE5hbWUuIFVzZWQgdG8gc3VwcG9ydCB3YXJuaW5nIGNvbmZpZyBvZiBcIm9uY2VcIi5cbiAgICpcbiAgICogQGludGVybmFsXG4gICAqL1xuICBzdGF0aWMgX25nTW9kZWxXYXJuaW5nU2VudE9uY2UgPSBmYWxzZTtcblxuICAvKipcbiAgICogSW5zdGFuY2UgcHJvcGVydHkgdXNlZCB0byB0cmFjayB3aGV0aGVyIGFuIG5nTW9kZWwgd2FybmluZyBoYXMgYmVlbiBzZW50IG91dCBmb3IgdGhpc1xuICAgKiBwYXJ0aWN1bGFyIEZvcm1Db250cm9sTmFtZSBpbnN0YW5jZS4gVXNlZCB0byBzdXBwb3J0IHdhcm5pbmcgY29uZmlnIG9mIFwiYWx3YXlzXCIuXG4gICAqXG4gICAqIEBpbnRlcm5hbFxuICAgKi9cbiAgX25nTW9kZWxXYXJuaW5nU2VudCA9IGZhbHNlO1xuXG4gIGNvbnN0cnVjdG9yKFxuICAgICAgQE9wdGlvbmFsKCkgQEhvc3QoKSBAU2tpcFNlbGYoKSBwYXJlbnQ6IENvbnRyb2xDb250YWluZXIsXG4gICAgICBAT3B0aW9uYWwoKSBAU2VsZigpIEBJbmplY3QoTkdfVkFMSURBVE9SUykgdmFsaWRhdG9yczogQXJyYXk8VmFsaWRhdG9yfFZhbGlkYXRvckZuPixcbiAgICAgIEBPcHRpb25hbCgpIEBTZWxmKCkgQEluamVjdChOR19BU1lOQ19WQUxJREFUT1JTKSBhc3luY1ZhbGlkYXRvcnM6XG4gICAgICAgICAgQXJyYXk8QXN5bmNWYWxpZGF0b3J8QXN5bmNWYWxpZGF0b3JGbj4sXG4gICAgICBAT3B0aW9uYWwoKSBAU2VsZigpIEBJbmplY3QoTkdfVkFMVUVfQUNDRVNTT1IpIHZhbHVlQWNjZXNzb3JzOiBDb250cm9sVmFsdWVBY2Nlc3NvcltdLFxuICAgICAgQE9wdGlvbmFsKCkgQEluamVjdChOR19NT0RFTF9XSVRIX0ZPUk1fQ09OVFJPTF9XQVJOSU5HKSBwcml2YXRlIF9uZ01vZGVsV2FybmluZ0NvbmZpZzogc3RyaW5nfFxuICAgICAgbnVsbCkge1xuICAgIHN1cGVyKCk7XG4gICAgdGhpcy5fcGFyZW50ID0gcGFyZW50O1xuICAgIHRoaXMuX3Jhd1ZhbGlkYXRvcnMgPSB2YWxpZGF0b3JzIHx8IFtdO1xuICAgIHRoaXMuX3Jhd0FzeW5jVmFsaWRhdG9ycyA9IGFzeW5jVmFsaWRhdG9ycyB8fCBbXTtcbiAgICB0aGlzLnZhbHVlQWNjZXNzb3IgPSBzZWxlY3RWYWx1ZUFjY2Vzc29yKHRoaXMsIHZhbHVlQWNjZXNzb3JzKTtcbiAgfVxuXG4gIG5nT25DaGFuZ2VzKGNoYW5nZXM6IFNpbXBsZUNoYW5nZXMpIHtcbiAgICBpZiAoIXRoaXMuX2FkZGVkKSB0aGlzLl9zZXRVcENvbnRyb2woKTtcbiAgICBpZiAoaXNQcm9wZXJ0eVVwZGF0ZWQoY2hhbmdlcywgdGhpcy52aWV3TW9kZWwpKSB7XG4gICAgICBfbmdNb2RlbFdhcm5pbmcoJ2Zvcm1Db250cm9sTmFtZScsIEZvcm1Db250cm9sTmFtZSwgdGhpcywgdGhpcy5fbmdNb2RlbFdhcm5pbmdDb25maWcpO1xuICAgICAgdGhpcy52aWV3TW9kZWwgPSB0aGlzLm1vZGVsO1xuICAgICAgdGhpcy5mb3JtRGlyZWN0aXZlLnVwZGF0ZU1vZGVsKHRoaXMsIHRoaXMubW9kZWwpO1xuICAgIH1cbiAgfVxuXG4gIG5nT25EZXN0cm95KCk6IHZvaWQge1xuICAgIGlmICh0aGlzLmZvcm1EaXJlY3RpdmUpIHtcbiAgICAgIHRoaXMuZm9ybURpcmVjdGl2ZS5yZW1vdmVDb250cm9sKHRoaXMpO1xuICAgIH1cbiAgfVxuXG4gIHZpZXdUb01vZGVsVXBkYXRlKG5ld1ZhbHVlOiBhbnkpOiB2b2lkIHtcbiAgICB0aGlzLnZpZXdNb2RlbCA9IG5ld1ZhbHVlO1xuICAgIHRoaXMudXBkYXRlLmVtaXQobmV3VmFsdWUpO1xuICB9XG5cbiAgZ2V0IHBhdGgoKTogc3RyaW5nW10geyByZXR1cm4gY29udHJvbFBhdGgodGhpcy5uYW1lLCB0aGlzLl9wYXJlbnQgISk7IH1cblxuICBnZXQgZm9ybURpcmVjdGl2ZSgpOiBhbnkgeyByZXR1cm4gdGhpcy5fcGFyZW50ID8gdGhpcy5fcGFyZW50LmZvcm1EaXJlY3RpdmUgOiBudWxsOyB9XG5cbiAgZ2V0IHZhbGlkYXRvcigpOiBWYWxpZGF0b3JGbnxudWxsIHsgcmV0dXJuIGNvbXBvc2VWYWxpZGF0b3JzKHRoaXMuX3Jhd1ZhbGlkYXRvcnMpOyB9XG5cbiAgZ2V0IGFzeW5jVmFsaWRhdG9yKCk6IEFzeW5jVmFsaWRhdG9yRm4ge1xuICAgIHJldHVybiBjb21wb3NlQXN5bmNWYWxpZGF0b3JzKHRoaXMuX3Jhd0FzeW5jVmFsaWRhdG9ycykgITtcbiAgfVxuXG4gIHByaXZhdGUgX2NoZWNrUGFyZW50VHlwZSgpOiB2b2lkIHtcbiAgICBpZiAoISh0aGlzLl9wYXJlbnQgaW5zdGFuY2VvZiBGb3JtR3JvdXBOYW1lKSAmJlxuICAgICAgICB0aGlzLl9wYXJlbnQgaW5zdGFuY2VvZiBBYnN0cmFjdEZvcm1Hcm91cERpcmVjdGl2ZSkge1xuICAgICAgUmVhY3RpdmVFcnJvcnMubmdNb2RlbEdyb3VwRXhjZXB0aW9uKCk7XG4gICAgfSBlbHNlIGlmIChcbiAgICAgICAgISh0aGlzLl9wYXJlbnQgaW5zdGFuY2VvZiBGb3JtR3JvdXBOYW1lKSAmJiAhKHRoaXMuX3BhcmVudCBpbnN0YW5jZW9mIEZvcm1Hcm91cERpcmVjdGl2ZSkgJiZcbiAgICAgICAgISh0aGlzLl9wYXJlbnQgaW5zdGFuY2VvZiBGb3JtQXJyYXlOYW1lKSkge1xuICAgICAgUmVhY3RpdmVFcnJvcnMuY29udHJvbFBhcmVudEV4Y2VwdGlvbigpO1xuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgX3NldFVwQ29udHJvbCgpIHtcbiAgICB0aGlzLl9jaGVja1BhcmVudFR5cGUoKTtcbiAgICAodGhpcyBhc3tjb250cm9sOiBGb3JtQ29udHJvbH0pLmNvbnRyb2wgPSB0aGlzLmZvcm1EaXJlY3RpdmUuYWRkQ29udHJvbCh0aGlzKTtcbiAgICBpZiAodGhpcy5jb250cm9sLmRpc2FibGVkICYmIHRoaXMudmFsdWVBY2Nlc3NvciAhLnNldERpc2FibGVkU3RhdGUpIHtcbiAgICAgIHRoaXMudmFsdWVBY2Nlc3NvciAhLnNldERpc2FibGVkU3RhdGUgISh0cnVlKTtcbiAgICB9XG4gICAgdGhpcy5fYWRkZWQgPSB0cnVlO1xuICB9XG59XG4iXX0=