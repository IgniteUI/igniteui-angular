# igx-time-picker Component

The **igx-time-picker** component allows you to select time from dropdown/dialog which is presented into input field.
A walk through of how to get started can be found [here](https://www.infragistics.com/products/ignite-ui-angular/angular/components/time_picker.html)

# Usage
```typescript
import { IgxTimePickerComponent } from "igniteui-angular";
```

Basic initialization
```html
<igx-time-picker></igx-time-picker>
```

Custom formats for the input field.
```html
<igx-time-picker
    [inputFormat]="hh:mm:ss tt"
    [displayFormat]="'shortTime'"
    [value]="date" >
</igx-time-picker>
```
If the `inputFormat` is not set, it will default to `hh:mm tt`. The `displayFormat` accepts all supported formats by Angular's `DatePipe`.

The time picker also supports binding through `ngModel` in case two-way date-binding is needed.
```html
<igx-time-picker #model="ngModel"
    [(ngModel)]="date" [minValue]="minDate" [maxValue]="maxDate">
    <igx-hint *ngIf="model.errors?.minValue || model.errors?.maxValue">
        Time is not in range.
    </igx-hint>
</igx-time-picker>
```

Additionally the time picker spin options can be set by the `spinLoop` property. Its default value is `true`, in which case the spinning is wrapped around the min and max values.
```html
<igx-time-picker [spinLoop]="false">
</igx-time-picker>
```

In dialog mode the dialog's header orientation can be set to `vertical` or `horizontal`
```html
<igx-time-picker [headerOrientation]="'vertical'">
</igx-time-picker>
```

A label can be added to the time picker in the following way:
````html
<igx-time-picker>
    <label igxLabel>Time</label>
</igx-time-picker>
````

The component's action buttons can be templated using the `igxPickerActions` directive:
```html
<igx-time-picker #picker>
    <ng-template igxTimePickerActions>
        <div class="action-buttons">
            <button igxButton="flat" (click)="selectToday(picker)">Today</button>
        </div>
    </ng-template>
</igx-time-picker>
```
```typescript
    public selectToday(picker: IgxTimePickerComponent) {
        picker.value = new Date(Date.now());
        picker.close();
    }
```

# API

###### Inputs
| Name   |      Type      |  Description |
|:----------|:-------------:|:------|
| `id` | string | Unique identifier of the component. If not provided it will be automatically generated.|
| `okButtonLabel` | string | Renders OK button with custom content, which closes the dropdown/dialog. By default `okButtonLabel` is set to 'OK'. |
| `cancelButtonLabel` | string | Renders cancel button with custom content, which closes the dropdown/dialog and reverts picker's value to the value at the moment of opening. By default `cancelButtonLabel` is set to 'Cancel'. |
| `value` | `Date | string` | Value of the time picker. |
|`resourceStrings`| ITimePickerResourceStrings | Resource strings of the time-picker. |
| `disabled` | boolean | Disable the time picker. |
| `itemsDelta`| object | Sets the delta for hour, minute and second items. By default `itemsDelta` is set to {hour:1, minute:1, second:1} |
| `minValue` | `Date | string` | The minimum value required for the picker to remain valid. |
| `maxValue` | `Date | string` | The maximum value required for the editor to remain valid. |
| `headerOrientation` | `'horizontal' | 'vertical'` | Determines whether the dialog's header renders in vertical or horizontal state. Applies only in dialog mode. |
| `locale` | `string` | Sets the locale used for formatting and displaying time in the dropdown/dialog. For more information check out [this](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl) page for valid formats. |
| `displayFormat` | `string` | The format used to display the picker's value when it's not being edited. |
| `inputFormat` | `string` | The editor's input mask. |
| `formatter` | `function` | Applied custom formatter on the selected or passed in date. |
| `spinLoop` | boolean | Determines the spin behavior. By default `spinLoop` is set to true. |
| `mode` | PickerInteractionMode | Determines the interaction mode - a dialog picker or a dropdown with editable masked input. Default is dropdown picker.|
| `overlaySettings` | `OverlaySettings` | Changes the default overlay settings used by the `IgxTimePickerComponent`.
| `placeholder` | `string` | Sets the placeholder text for empty input.
| `type` | `IgxInputGroupType` | Determines how the picker will be styled.

### Outputs
| Name | Description | Cancelable | Emitted with |
|:----:|:------------|:----------:|--------------|
| `opening` | Fired when the dropdown/dialog has started opening | true | `IBaseCancelableBrowserEventArgs` |
| `opened` | Fired after the dropdown/dialog has opened. | false | `IBaseEventArgs` |
| `closing` | Fired when the dropdown/dialog has started closing, cancelable. | true | `IBaseCancelableBrowserEventArgs` |
| `closed`  | Fired after the dropdown/dialog has closed. | false | `IBaseEventArgs` |
| `validationFailed` | Emitted when an invalid time string is entered or when the value is outside the min/max range. | false | `ITimePickerValidationFailedEventArgs` |
| `valueChange` | Emitted when the picker's value changes. Allows two-way binding of `value`. | false | `Date | string` |

### Methods
| Name   | Arguments | Return Type | Description |
|:----------:|:------|:------|:------|
| `select` | `Date | string` | `void` | Accepts a Date object or string and selects the corresponding time from the dropdown/dialog. |
| `clear` | n/a | `void` | Clears the picker's value in case it is a string and resets it to `00:00:00` when it is a Date object |
| `open` | `OverlaySettings` | `void` | Opens the dropdown/dialog. |
| `close` | n/a | `void` | Closes the dropdown/dialog. |
| `toggle` | `OverlaySettings` | `void` | Toggles the dropdown/dialog between opened and closed states. |
| `increment` | `DatePart?, number?` | | `void` | Accepts a `DatePart` and increments it by one. If no value is provided, it defaults to the part at the position of the cursor.
| `decrement` | `DatePart?, number?` | `void` | Accepts a `DatePart` and decrements it by one. If no value is provided, it defaults to the part at the position of the cursor.
