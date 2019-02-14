# igx-date-picker Component

The **igx-date-picker** component allows you to choose date from calendar
which is presented into input field.
A walkthrough of how to get started can be found [here](https://www.infragistics.com/products/ignite-ui-angular/angular/components/date_picker.html)

## Dependencies
In order to be able to use **igx-date-picker** you should keep in mind that it is dependent on **BrowserAnimationsModule**,
which must be imported **only once** in your application's AppModule, for example:
```typescript
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
@NgModule({
	imports: [
		...
        BrowserAnimationsModule
        ...
	]
})
export class AppModule {
}
```

# Usage
```typescript
import { IgxDatePickerComponent } from "igniteui-angular";
```

Basic initialization
```html
<igx-date-picker></igx-date-picker>
```
Custom formatter function with passed initial date and locale.
```html
<igx-date-picker [formatter]="customFormatter" [value]="dateValue" [locale]="'en-US'">
</igx-date-picker>
```

DatePicker with cancel and today buttons
```html
<igx-date-picker [cancelButtonLabel]="'Close'"[todayButtonLabel]="'Today'">
</igx-date-picker>
```

You have also ability to disable the datePicker
```html
<igx-date-picker [disabled]="false">
</igx-date-picker>
```

DatePicker with first day of week set to Monday and an event handler when selection is done.
```html
<igx-date-picker [weekStart]="1" (onSelection)="eventHandler($event)">
</igx-date-picker>
```

The DatePicker also supports binding through `ngModel` if two-way date-bind is needed.
```html
<igx-date-picker [(ngModel)]="myDateValue">
</igx-date-picker>
```

The DatePicker has editable mode as well. Custom display format and editor mask can be configured by setting the `format` and `mask` properties.
```html
<igx-date-picker [(ngModel)]="myDateValue" mode="editable" mask="dd-MM-y">
</igx-date-picker>
```

The DatePicker input group could be retemplated.
```html
<igx-date-picker>
    <ng-template igxDatePickerTemplate let-openDialog="openDialog" let-value="value" let-displayData="displayData">
        <igx-input-group (click)="openDialog()">
            <label igxLabel>Date</label>
            <input igxInput [value]="displayData"/>
        </igx-input-group>
    </ng-template>
</igx-date-picker>
```

# API

###### Inputs
| Name   |      Type      |  Description |
|:----------|:-------------:|:------|
| `id` | string | Unique identifier of the component. If not provided it will be automatically generated.|
| `todayBottonLabel` | `string` | Renders today button with custom name, which selects today date from calendar, and fill the datePicker input. |
| `cancelButtonLabel` | `string` | Renders cancel button with custom name, which closes the calendar. |
| `formatter` | `function` | Applied custom formatter on the selected or passed date. |
| `disabled` | `boolean` | Disable the datePicker. |
| `weekStart`| `Number \| WEEKDAYS` | Sets on which day will the week start. |
| `locale` | `string` | Sets the locale used for formatting and displaying the dates in the calendar. For more information check out [this](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl) page for valid formats. |
| `formatOptions` | `Object` | The format options passed along with the `locale` property used for formatting the dates. |
| `label` | `string` | Configure the input label text. |
| `labelVisibility` | `string` | Configure the input label text visibility. |
| `format` | `string` | Configure the date display format when in edit mode. Accepts formats using the d, M and y symbols, custom separators and the following pre-defined format options - shortDate, mediumDate, longDate and fullDate. |
| `mask` | `string` | Configure the date editor mask. Accepts the d, M and y symbols as mask - for example dd-MM-y. |
| `disabledDates` | `DateRangeDescriptor[]` | Configure the disabled dates. |
| `specialDates` | `DateRangeDescriptor[]` | Configure the special dates. |
| `value` | `Date` | Configure the datePicker value and selected date in the calendar. |
| `vertical` | `boolean` | Configure the calendar mode - horizontal or vertical in read-only datePicker. |
| `mode` | `DatePickerInteractionMode` | Configure the datePicker input mode - READONLY or EDITABLE. In editable mode, the datePicker input is editable, in read-only mode  - the input is not editable and popup appears to select a date.|
| `isSpinLoop` | `boolean` | Configure whether the date parts would spin continuously or stop when min/max value is reached in editable mode.|


### Outputs
| Name | Return Type | Description |
|:--:|:---|:---|
| `onSelection` | `Date` | Fired when selection is made in the calendar. The event contains the selected value(s) based on the type of selection the component is set to |
| `onOpen`  | `datePicker` | Emitted when a datePicker calendar is being opened. |
| `onClose`  | `datePicker` | Emitted when a datePicker calendar is being closed. |
| `onDisabledDate`  | `IgxDatePickerDisabledDateEventArgs` | Emitted when a disabled date is entered in editable mode. |
| `onValidationFailed`  | `IgxDatePickerValidationFailedEventArgs` | Emitted when an invalid date is entered in editable mode. |

### Methods
| Name   | Arguments | Return Type | Description |
|:----------:|:------|:------|:------|
| `selectDate` | `date: Date` | `void` | Change the calendar selection. Calling this method will emit the `onSelection` event. |
| `deselectDate` | `void` | Deselects the calendar date and clear input field value. |
| `triggerTodaySelection` | `void` | Selects today's date in calendar and change the input field value. |