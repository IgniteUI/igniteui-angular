# igxMonthPicker Component

The **igxMonthPicker** provides a way for the user to select date(s).


## Dependencies
In order to be able to use **igxMonthPicker** you should keep in mind that it is dependent on **BrowserAnimationsModule**,
which must be imported **only once** in your application's AppModule, for example:
```typescript
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
@NgModule({
	imports: [
        BrowserAnimationsModule,
        ...
	]
})
export class AppModule {
}
```
Also the **igxMonthPicker** uses the [Intl](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/DateTimeFormat) WebAPI for localization and formatting of dates. Consider using the [appropriate polyfills](https://github.com/andyearnshaw/Intl.js/) if your target platform does not support them.


## Usage

Importing the month picker in your application
```typescript
import { IgxMonthPickerComponent } from "igniteui-angular";
```

Instantiate a month picker component and pass a date object.
```html
<igx-month-picker [value]="dateValue"></igx-month-picker>
```

The **igxMonthPicker** implements the `ControlValueAccessor` interface, providing two-way data-binding
and the expected behavior when used both in Template-driven or Reactive Forms.
```html
<igx-month-picker [(ngModel)]="dateValue"></igx-month-picker>
```

Customize the format and set the locale
```typescript
    public formatOptions = {
        month: 'long',
        year: 'numeric'
    };

    public localeDe = 'de';
```

```html
<igx-month-picker [formatOptions]="formatOptions" [locale]="localeDe"></igx-month-picker>
```

### Keyboard navigation
When the **igxMonthPicker** component is focused:
- `PageUp` will move to the previous year.
- `PageDown` will move to the next year.
- `Home` will focus the first month of the current year.
- `End` will focus the last month of the current year.
- `Tab` will navigate through the subheader buttons;

When `prev` or `next` year buttons (in the subheader) are focused:
- `Space` or `Enter` will scroll into view the next or previous year.

When `years` button (in the subheader) is focused:
- `Space` or `Enter` will open the years view.

When a month inside the months view is focused:
- Arrow keys will navigate through the months.
- `Home` will focus the first month inside the months view.
- `End` will focus the last month inside the months view.
- `Enter` will select the currently focused month and close the view.


## API Summary

### Inputs

- `id: string`

Unique identifier of the component. If not provided it will be automatically generated.

- `locale: string`

Controls the locale used for formatting and displaying the dates in the month picker.
The expected string should be a [BCP 47 language tag](http://tools.ietf.org/html/rfc5646).
The default value is `en`.

- `viewDate: Date`

Controls the year/month that will be presented in the default view when the month picker renders. By default it is the current year/month.

- `value: Date`

Gets and sets the selected date in the month picker component.

- `formatOptions: Object`

Controls the date-time components to use in formatted output, and their desired representations.
Consult [this](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/DateTimeFormat)
for additional information on the available options.

The defaul values are listed below.
```typescript
{ day: 'numeric', month: 'short', weekday: 'short', year: 'numeric' }
```

- `formatViews: Object`

Controls whether the date parts in the different month picker views should be formatted according to the provided
`locale` and `formatOptions`.

The default values are listed below.
```typescript
{ day: false, month: true, year: false }
```

### Outputs

- `onSelection(): Date | Date[]`

Event fired when a value is selected through UI interaction.
Returns the selected value (depending on the type of selection).
