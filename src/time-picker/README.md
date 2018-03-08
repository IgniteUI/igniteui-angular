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
<igx-time-picker [isDisabled]="true">
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

# API

###### Inputs
| Name   |      Type      |  Description |
|:----------|:-------------:|:------|
| `okButtonLabel` | string | Renders OK button with custom name, which commits the selected time, and fill the timePicker input. By default `okButtonLabel` is set to 'OK'. |
| `cancelButtonLabel` | string | Renders cancel button with custom name, which closes the dialog. By default `cancelButtonLabel` is set to 'Cancel'. |
| `value` | Date | Value of the timePicker. |
| `isDisabled` | boolean | Disable the timePicker. |
| `itemsDelta`| object | Sets the delta for hour and minute items. By default `itemsDelta` is set ti {hours:1, minutes:1} |
| `minValue` | string | Sets minimum value. It should follow the `format` of the timePicker. |
| `maxValue` | string | Sets maximum value. It should follow the `format` of the timePicker. |
| `vertical` | boolean | Sets the orientation of the timePicker. By default `vertical` is set to true. |
| `format` | string | Gets/Sets format of time while timePicker has no focus. |

### Outputs
| Name | Description |
|:--:|:---|
| `onValueChanged` | Fired when selection is made. The event contains the selected value. |
| `onInvalidValueSelected ` | Emitted when the user try to commit invalid value. The event contains the timePicker |
| `onOpen` | Emitted when a timePicker is being opened.  |

### Methods
| Name   | Arguments | Return Type | Description |
|:----------:|:------|:------|:------|
| `selectDate` | `date: Date` | `void` | Change the calendar selection. Calling this method will emit the `onSelection` event. |