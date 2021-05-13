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
| Name | Description | Type |
|:-----|:------------|:----|
| `id` | `attr.id` of the picker. | string |
| `mode` | Sets whether `IgxDatePickerComponent` is in dialog or dropdown mode. | InteractionMode |
| `value` | The value of the editor. | Date |
| `minValue` | The minimum value required for the picker to remain valid. | Date \| string |
| `maxValue` | The maximum value required for the editor to remain valid. | Date \| string |
| `displayFormat` | The display value of the editor. | string |
| `inputFormat` | The format that the editor will use to display the date/time. | string |
| `calendarFormat` | The calendar's format options for the day view. | PickersFormatOptions | 
| `specialDates` | Dates that will be marked as special in the calendar. | DateRangeDescriptor[] |
| `disabledDates` | Dates that will be disabled in the calendar. | DateRangeDescriptor[] |
| `formatViews` | Determines if `day`, `month` and `year` will be rendered in the calendar. `locale` and `formatOptions` are taken into account as well, if present. | PickersFormatViews |
| `displayMonthsCount` | Sets the number of displayed month views. Default is `2`. | number |
| `hideOutsideDays` | Sets whether dates that are not part of the current month will be displayed. Default is `false`. | boolean |
| `showWeekNumbers` | Shows or hides week numbers. | number |
| `tabindex` | The editor's tabindex. | number |
| `weekStart`| Sets the start day of the week. | number |
| `locale` | Locale settings used in `displayFormat` and for localizing the calendar.  | string |
| `overlaySettings` | Changes the default overlay settings used by the `IgxDatePickerComponent`. | OverlaySettings |
| `placeholder` | Sets the placeholder text for empty input. | string |
| `disabled` | Disables or enables the picker. | boolean |
| `outlet` | The container used for the pop up element. | IgxOverlayOutletDirective \| ElementRef |
| `type` | Determines how the picker will be styled. | IgxInputGroupType |
| `spinLoop` | Determines if the currently spun date segment should loop over. | boolean |
| `spinDelta` | Delta values used to increment or decrement each editor date part on spin actions. All values default to `1`. | DatePartDeltas |
| `cancelButtonLabel` | The label of the `cancel` button. No button is rendered if there is no label provided. | string |
| `todayButtonLabel` | The label of the `select today` button. No button is rendered if there is no label provided. | string |
| `headerOrientation` | Determines whether the calendar's header renders in `vertical` or `horizontal` state. Applies only in `dialog` mode. | 'horizontal' \| 'vertical' |

### Outputs
| Name | Description | Emitted with |
|:-----|:------------|:----|
| `opening` | Fired when the calendar has started opening, cancelable. | IBaseCancelableBrowserEventArgs |
| `opened` | Fired after the calendar has opened. | IBaseEventArgs |
| `closing` | Fired when the calendar has started closing, cancelable. | IBaseCancelableBrowserEventArgs |
| `closed` | Fired after the calendar has closed. | IBaseEventArgs |
| `valueChange` | Emitted when the picker's value changes. Allows two-way binding of `value`. | Date |
| `validationFailed` | Emitted when a user enters an invalid date string or when the value is not within a min/max range. | IDatePickerValidationFailedEventArgs |

### Methods
| Name | Description | Return type |
|:-----|:------------|:----|
| `select` | Accepts a Date object and selects the corresponding date from the calendar. | void |
| `clear` | Clears the editor's date. | void |
| `open` | Opens the calendar. | void |
| `close` | Closes the calendar. | void |
| `toggle` | Toggles the calendar between opened and closed states. | void |
| `increment` | Accepts a `DatePart` and increments it by one. If no value is provided, it defaults to the part at the position of the cursor. | void |
| `decrement` | Accepts a `DatePart` and decrements it by one. If no value is provided, it defaults to the part at the position of the cursor. | void |
