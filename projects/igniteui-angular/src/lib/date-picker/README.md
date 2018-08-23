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

The DatePicker input group could be retemplated.
```html
<igx-datePicker>
    <ng-template igxDatePickerTemplate let-openDialog="openDialog" let-value="value" let-displayData="displayData">
        <igx-input-group (click)="openDialog()">
            <label igxLabel>Date</label>
            <input igxInput [value]="displayData"/>
        </igx-input-group>
    </ng-template>
</igx-datePicker>
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

### Outputs
| Name | Return Type | Description |
|:--:|:---|:---|
| `onSelection` | `Date` | Fired when selection is made in the calendar. The event contains the selected value(s) based on the type of selection the component is set to |
| `onOpen`  | `datePicker` | Emitted when a datePicker calendar is being opened.  |

### Methods
| Name   | Arguments | Return Type | Description |
|:----------:|:------|:------|:------|
| `selectDate` | `date: Date` | `void` | Change the calendar selection. Calling this method will emit the `onSelection` event. |
