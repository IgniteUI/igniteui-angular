# igx-time-picker Component

The **igx-time-picker** component allows you to select time which is presented into input field.

# Usage
```typescript
import { IgxTimePickerComponent } from "igniteui-angular";
```

Basic initialization
```html
<igx-time-picker></igx-time-picker>
```
Custom format with passed initial value.
```html
<igx-time-picker format="h:mm tt" [value]="dateValue" >
</igx-time-picker>
```

You have also ability to disable the time picker
```html
<igx-time-picker [disabled]="true">
</igx-time-picker>
```

TimePicker with min and max values and onInvalidValueSelected event handler in order to decide what to do if an ivalid value is selected.
```html
<igx-time-picker [minValue]="minValue" [maxValue]="maxValue" (onInvalidValueSelected)="okClicked($event)">
</igx-time-picker>
```

The TimePicker also supports binding through `ngModel` if two-way date-bind is needed.
```html
<igx-time-picker [(ngModel)]="myValue">
</igx-time-picker>
```

The TimePicker also has to spin options. Spin loop and limited scroll modes are available. By default `isSpinLoop` is set to true.
```html
<igx-time-picker [isSpinLoop]="false">
</igx-time-picker>
```

The TimePicker has vertical and horizontal layout. By default the `vertical` is set to false
```html
<igx-time-picker [vertical]="true">
</igx-time-picker>
```

The TimePicker input group could be retemplated.
```html
<igx-time-picker>
    <ng-template igxTimePickerTemplate let-openDialog="openDialog" let-value="value" let-displayTime="displayTime">
        <igx-input-group (click)="openDialog()">
            <label igxLabel>Time</label>
            <input igxInput [value]="displayTime"/>
        </igx-input-group>
    </ng-template>
</igx-time-picker>
```
The TimePicker now supports one more interaction mode - and editable masked input and a dropdown. The user can enter or edit the time value that inside the text input or select a vlaue from a dropdown that is therefore applied on the text input.
```typescript
mode = InteractionMode.dropdown;
```

```html
<igx-time-picker [mode]="mode">
</igx-time-picker>
```

# API

###### Inputs
| Name   |      Type      |  Description |
|:----------|:-------------:|:------|
| `okButtonLabel` | string | Renders OK button with custom name, which commits the selected time, and fill the timePicker input. By default `okButtonLabel` is set to 'OK'. |
| `cancelButtonLabel` | string | Renders cancel button with custom name, which closes the dialog. By default `cancelButtonLabel` is set to 'Cancel'. |
| `value` | Date | Value of the timePicker. |
|`resourceStrings`| ITimePickerResourceStrings | Resource strings of the time-picker. |
| `disabled` | boolean | Disable the timePicker. |
| `itemsDelta`| object | Sets the delta for hour and minute items. By default `itemsDelta` is set ti {hours:1, minutes:1} |
| `minValue` | string | Sets minimum value. It should follow the `format` of the timePicker. |
| `maxValue` | string | Sets maximum value. It should follow the `format` of the timePicker. |
| `vertical` | boolean | Sets the orientation of the timePicker. By default `vertical` is set to true. |
| `format` | string | Gets/Sets format of time while timePicker has no focus. By default `format` is set to `hh:mm tt`.
List of time-flags:
"h": hours field in 12-hours format without leading zero
"hh": hours field in 12-hours format with leading zero
"H": hours field in 24-hours format without leading zero
"HH": hours field in 24-hours format with leading zero
"m": minutes field without leading zero
"mm": minutes field with leading zero
"tt": 2 characters of string which represents AM/PM field |
| `isSpinLoop` | boolean | Determines the spin behavior. By default `isSpinLoop` is set to true. |
| `mode` | InteractionMode | Determines the interaction mode - a dialog picker or dropdown with editable masked input. Deafult is dialog picker.|
| `promptChar` | string | Sets the character representing a fillable spot in the editable masked input. Only applicable for dropdown mode.

### Outputs
| Name | Description |
|:--:|:---|
| `onValueChanged` | Fired when selection is made. The event contains the selected value. |
| `onInvalidValueSelected ` | Emitted when the user try to commit invalid value. The event contains the timePicker |
| `onOpen` | Emitted when a timePicker is being opened. |
| `onClose` | Emitted when a timePicker is being closed. |

### Methods
| Name   | Arguments | Return Type | Description |
|:----------:|:------|:------|:------|
| `okButtonClick` | | `void` | If current value is valid selects it and closes the dialog. |
| `cancelButtonClick` | | `void` | Closes the dialog without selecting the current value. |
| `hoursInView` | | `string[]` | Returns an array of the hours currently in view. |
| `minutesInView` | | `string[]` | Returns an array of the minutes currently in view. |
| `ampmInView` | | `string[]` | Returns an array of the ampm currently in view. |
| `scrollHourIntoView` | `(item: string)` | `void` | Scrolls a hour item into view. |
| `scrollMinuteIntoView` | `(item: string)` | `void` | Scrolls a minute item into view. |
| `scrollAmPmIntoView` | `(item: string)` | `void` | Scrolls a period item into view. |
