# igx-date-picker Component

The **igx-date-picker** component allows you to choose date from calendar
which is presented into input field.
A walk through of how to get started can be found [here](https://www.infragistics.com/products/ignite-ui-angular/angular/components/date_picker.html)

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
Import the `IgxDatePickerModule` in the module that you want to use it in:
```typescript
import { IgxDatePickerModule } from 'igniteui-angular';

@NgModule({
    imports: [IgxDatePickerModule]
})
export class AppModule { }
```

Basic initialization
```html
<igx-date-picker></igx-date-picker>
```

This will produce an `igx-date-picker` without a default label. If you want to add a label you can import the `IgxLabelModule` and then in your `HTML` you can project it like so:
```html
<igx-date-picker>
    <label igxLabel>Date: </label>
</igx-date-picker>
```

Custom formats for the input field.
```html
<igx-date-picker
    [inputFormat]="dd/MM/yyyy" 
    [displayFormat]="'longDate'" 
    [value]="date" >
</igx-date-picker>
```
If the `inputFormat` is not set, it will default to the format used by the browser. The `displayFormat` accepts all supported formats by Angular's `DatePipe`.


DatePicker with cancel and today buttons
```html
<igx-date-picker
    [cancelButtonLabel]="'Close'"
    [todayButtonLabel]="'Today'">
</igx-date-picker>
```
If the these two properties are not set, the `igx-date-picker` will have any buttons.

Additionally, custom buttons can be templated in the `igx-date-picker` using the `igxPickerActions` directive:
```html
<igx-date-picker #datePicker>
    <ng-template igxPickerActions>
        <div class="action-buttons">
            <button igxButton="flat" (click)="datePicker.selectToday()">Today</button>
        </div>
    </ng-template>
</igx-date-picker>
```

The date picker also supports binding through `ngModel` if two-way date-bind is needed. It is also a custom validator which triggers 
```html
<igx-date-picker #model="ngModel" required 
    [displayMonthsCount]="3" [(ngModel)]="date" [minValue]="minDate" [maxValue]="maxDate">
    <label igxLabel>Select a Date</label>
    <igx-hint *ngIf="model.errors?.value">
        This field is required.
    </igx-hint>
    <igx-hint *ngIf="model.errors?.minValue || model.errors?.maxValue">
        Value is not in range.
    </igx-hint>
</igx-date-picker>
```

# API

###### Inputs
| Name   |      Type      |  Description |
|:----------|:-------------:|:------|
| `id` | string | Unique identifier of the component. If not provided it will be automatically generated.|
| `todayBottonLabel` | `string` | Renders today button with custom content, which selects today date from calendar, and fill the datePicker input. |
| `cancelButtonLabel` | `string` | Renders cancel button with custom content, which closes the calendar. |
| `formatter` | `function` | Applied custom formatter on the selected or passed in date. |
| `formatViews` | `PickersFormatViews` | Determines if `day`, `month` and `year` will be rendered in the calendar. `locale` and `calendarFormat` are taken into account as well, if present.
| `disabled` | `boolean` | Disables the date picker. |
| `weekStart`| `Number | WEEKDAYS` | Sets on which day will the week start. |
| `locale` | `string` | Sets the locale used for formatting and displaying the dates in the calendar. For more information check out [this](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl) page for valid formats. |
| `displayFormat` | `string` | The format used to display the picker's value when it's not being edited. |
| `inputFormat` | `string` | The editor's input mask. |
| `disabledDates` | `DateRangeDescriptor[]` | Configure the disabled dates. |
| `specialDates` | `DateRangeDescriptor[]` | Configure the special dates. |
| `calendarFormat` | `PickersFormatOptions` | The calendar's format options for the day view.
| `value` | `Date | string` | The date picker's value and the selected date in the calendar. |
| `headerOrientation` | `'horizontal' | 'vertical'` | Determines whether the calendar's header renders in vertical or horizontal state. Applies only in dialog mode. |
| `mode` | `'dropdown' | 'dialog'` | Sets whether `IgxDatePickerComponent` is in dialog or dropdown mode. |
| `spinLoop` | `boolean` | Determines if the currently spun date segment should loop over. |
| `spinDelta` | `DatePartDeltas` | Delta values used to increment or decrement each editor date part on spin actions. All values default to `1`.
| `type` | `IgxInputGroupType` | Determines how the picker will be styled.
| `displayMonthsCount` | `number` | Sets the number of displayed month views. Default is `2`. |
| `hideOutsideDays`| `boolean` | Controls the visibility of the dates that do not belong to the current month. |
| `overlaySettings` | `OverlaySettings` | Changes the default overlay settings used by the `IgxDatePickerComponent`.
| `placeholder` | `string` | Sets the placeholder text for empty input.
| `minValue` | `Date | string` | The minimum value required for the picker to remain valid.
| `maxValue` | `Date | string` | The maximum value required for the editor to remain valid.



### Outputs
| Name | Return Type | Description |
|:--:|:---|:---|
| `opening`  | `IBaseCancelableBrowserEventArgs` | Fired when the calendar has started opening, cancelable. |
| `opened`  | `IBaseEventArgs` | Fired after the calendar has opened. |
| `closing`  | `IBaseCancelableBrowserEventArgs` | Fired when the calendar has started closing, cancelable. |
| `closed`  | `IBaseEventArgs` | Fired after the calendar has closed. |
| `validationFailed`  | `IDatePickerValidationFailedEventArgs` | Emitted when a user enters an invalid date string or when the value is not within a min/max range. |
| `valueChange` | `Date` | Emitted when the picker's value changes. Allows two-way binding of `value`. |

### Methods
| Name   | Arguments | Return Type | Description |
|:----------:|:------|:------|:------|
| `select` | `Date` | `void` | Accepts a Date object and selects the corresponding date from the calendar. |
| `clear` | n/a | `void` | Clears the editor's date. |
| `selectToday` | n/a | `void` | Selects today's date in calendar and changes the input field value. |
| `open` | `OverlaySettings` | `void` | Opens the calendar. |
| `close` | n/a | `void` | Closes the calendar. |
| `toggle` | `OverlaySettings` | `void` | Toggles the calendar between opened and closed states. |
| `increment` | `DatePart?, number?` | | `void` | Accepts a `DatePart` and increments it by one. If no value is provided, it defaults to the part at the position of the cursor.
| `decrement` | `DatePart?, number?` | `void` | Accepts a `DatePart` and decrements it by one. If no value is provided, it defaults to the part at the position of the cursor.
