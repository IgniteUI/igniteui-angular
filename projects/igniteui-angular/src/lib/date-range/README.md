# igx-date-range Component

The `igx-date-range` component allows you to select a range of dates from a calendar which is presented into a single or two non-editable input fields.

A getting started guide can be found [here]().

## Dependencies
In order to use the `igx-date-range` component you must import the `BrowserAnimationModule` **once** in your application:
```typescript
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
@NgModule({
	imports: [
		...
        BrowserAnimationsModule
        ...
	]
})
export class AppModule { }
```

# Usage
Import the `IgxDateRangeModule` in the module that you want to use it in:
```typescript
import { IgxDateRangeModule } from 'igniteui-angular';

@NgModule({
    imports: [IgxDateRangeModule]
})
export class AppModule { }
```

As for the component that you want to use `igx-date-range` in, import `IgxDateRangeComponent` and then declare it in the template, like so:

```typescript
import { IgxDateRangeComponent } from 'igniteui-angular';

@Component({
    selector: 'my-component'
    template: `
        <igx-date-range>
            <input igxDateRange>
        </igx-date-range>`,

})
export class MyComponent {
    @ViewChild(IgxDateRangeComponent, { read: IgxDateRangeComponent, static: false })
    public dateRange: IgxDateRangeComponent;
}
```

Basic initialization with a single input:
```html
<igx-date-range>
    <input igxDateRange>
</igx-date-range>
```

Basic initialization with two inputs:
```html
<igx-date-range>
    <input igxDateRangeStart>
    <input igxDateRangeEnd>
</igx-date-range>
```

`IgxDateRange` with `Today` and `Done` buttons:
```html
<igx-date-range [todayButtonText]="'Show Today'" [doneButtonText]="'Close'">
    <input igxDateRage>
</igx-date-range>
```

`IgxDateRange` with first day of the week set to `Monday` and handler when a range selection is made:
```html
<igx-date-range [weekStart]="2" (rangeSelected)="onRangeSelected($event)">
    <input igxDateRange>
</igx-date-range>
```

`IgxDateRange` that opens a calendar with more than `2` views and also hides days that are not part of each month:
```html
<igx-date-range [monthsViewNumber]="5" [hideOutsideDays]="'true'">
    <input igxDateRange>
</igx-date-range>
```

`IgxDateRange` in a drop `down-mode`, the `Done` button is only visible when in a `dialog` mode:
```html
<igx-date-range [mode]="'dropdown'">
    <input igxDateRange>
</igx-date-range>
```



# API

### Inputs
| Name             | Type               | Description |
|:-----------------|:-------------------|:------------|
| mode             | InteractionMode    | Property which sets whether `IgxDateRangeComponent` is in dialog or dropdown mode. |
| monthsViewNumber | number             | Property which sets the number displayed month views. Default is `2`. |
| hideOutsideDays  | boolean            | Property which sets the whether dates that are not part of the current month will be displayed. Default value is `false`. |
| weekStart        | number             | Property which sets the start day of the week. Can be assigned to a numeric value or to `WEEKDAYS` enum value. |
| locale           | string             | Property which gets the `locale` of the calendar. Default value is `"en"`. |
| formatter        | function => string | Property that applies a custom formatter function on the selected or passed date. |
| todayButtonText  | string             | Property that changes the default text of the `today` button. Default value is `Today`. |
| doneButtonText   | string             | Property that changes the default text of the `done` button. It will show up only in `dialog` mode. Default value is `Done`. |
| overlaySettings  | OverlaySettings    | Property that changes the default overlay settings used by the `IgxDateRangeComponent`. | 

### Outputs
| Name             | Type                  | Description |
|:-----------------|:----------------------|:------------|
| rangeSelected    | IgxDateRangeComponent | An event that is emitted when a full range was selected in the `IgxDateRangeComponent`. |
| onOpened         | IgxDateRangeComponent | An event that is emitted when the `IgxDateRangeComponent` is opened.                    |
| onClosed         | IgxDateRangeComponent | An event that is emitted when the `IgxDateRangeComponent` is closed.                    |

### Methods
| Name        | Arguments     | Return Type | Description |
|:-----------:|:--------------|:------------|:------------|
| open        | n/a           | void           | Opens the date picker's dropdown or dialog. |
| close       | n/a           | void           | Closes the date picker's dropdown or dialog. |
| selectToday | n/a           | void           | Selects the today date if no previous selection is made. If there is a previous selection, it does a range selection to today. | 
| value       | n/a           | Date or Date[] | Gets the currently selected value / range from the calendar. |
| selectRange | startDate, endDate | void      | Selects a range of dates, cancels previous selection. |