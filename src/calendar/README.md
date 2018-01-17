# igxCalendar Component

The **igxCalendar** provides a way for the user to select date(s).

You can see it in action [here](http://139.59.168.161/demos/calendar)

## Usage
```typescript
import { IgxCalendarComponent } from "igniteui-angular";
```

Basic initialization
```html
<igx-calendar></igx-calendar>
```

A range selection calendar with first day of week set to Monday and an event
handler when selection is done.
```html
<igx-calendar weekStart="1" selection="range" (onSelection)="eventHandler($event)"></igx-calendar>
```

The calendar also supports binding through `ngModel` if two-way data-bind is needed.
```html
<igx-calendar [(ngModel)]="myDateValue"></igx-calendar>
```

### Keyboard navigation
When the **igxCalendar** component is focused:
- `PageUp` will move to the previous month.
- `PageDown` will move to the next month.
- `Shift + PageUp` will move to the previous year.
- `Shift + PageDown` will move to the next year.
- `Home` will focus the first day of the current month that is into view.
- `End` will focus the last day of the current month that is into view.

When a day inside the current month is focused:
- Arrow keys will navigate through the days.
- `Enter` will select the currently focused day.

## API Summary

### Inputs
| Name       |      Type      |  Description |
|:----------:|:-------------|:------|
| `weekStart`| `Number \| WEEKDAYS` | Sets on which day will the week start. |
| `locale` | `string` | Sets the locale used for formatting and displaying the dates in the calendar. For more information check out [this](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl) page for valid formats. |
| `selection` | `string` | Sets the type of selection in the calendar. Valid values are `single` (default), `multi` and `range` |
| `viewDate` | `Date` | Sets the year/month that will be presented in the default view when the calendar renders. By default it is the current year/month.   |
| `value` | `Date \| Date[]` | Gets/Sets the current value of the calendar widget. Both multi-selection and range selection return an array of selected dates. |
| `formatOptions` | `Object` | The format options passed along with the `locale` property used for formatting the dates. |

### Outputs
| Name | Return Type | Description |
|:--:|:---|:---|
| `onSelection` | `Date \| Date[]` | Fired when selection is made in the calendar. The event contains the selected value(s) based on the type of selection the component is set to |

### Methods
| Name   | Arguments | Return Type | Description |
|:----------:|:------|:------|:------|
| `selectDate` | `date: Date \| Date[]` | `void` | Change the calendar selection. Calling this method will emit the `onSelection` event. |
