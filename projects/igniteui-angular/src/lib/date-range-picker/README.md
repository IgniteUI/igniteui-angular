# igx-date-range-picker Component

The `igx-date-range-picker` component allows you to select a range of dates from a calendar UI or editable input fields.

A getting started guide can be found [here]().

## Dependencies
In order to use the `igx-date-range-picker` component you must import the `BrowserAnimationModule` **once** in your application:
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
Import the `IgxDateRangePickerModule` in the module that you want to use it in:
```typescript
import { IgxDateRangePickerModule } from 'igniteui-angular';

@NgModule({
    imports: [IgxDateRangePickerModule]
})
export class AppModule { }
```

As for the component that you want to use `igx-date-range-picker` in, import `IgxDateRangePickerComponent`:

```typescript
import { IgxDateRangePickerComponent, DateRange } from 'igniteui-angular';

@Component({
    selector: 'my-component',
    template: `<igx-date-range-picker [(ngModel)]="range"></igx-date-range-picker>`,

})
export class MyComponent {
    @ViewChild(IgxDateRangePickerComponent, { read: IgxDateRangePickerComponent })
    public dateRange: IgxDateRangePickerComponent;
    public range: DateRange;
}
```

The default initialization produces a single *readonly* input:
```html
<igx-date-range-picker [(ngModel)]="range"></igx-date-range-picker>
```

With `IgxDateRangeStartComponent`, `IgxDateRangeEndComponent` and `IgxDateTimeEditorDirective` two *editable* inputs can be projected:
```html
<igx-date-range-picker>
    <igx-date-range-start>
        <input igxInput igxDateTimeEditor [(ngModel)]="range.start">
    </igx-date-range-start>
    <igx-date-range-end>
        <input igxInput igxDateTimeEditor [(ngModel)]="range.end">
    </igx-date-range-end>
</igx-date-range-picker>
```

`IgxDateRangePickerComponent` supports templating of its calendar icon:

The default template:
```html
<igx-date-range-picker>
    <igx-picker-toggle igxPrefix>
        <igx-icon>calendar_view_day</igx-icon>
    </igx-picker-toggle>
</igx-date-range-picker>
```

With projected inputs:
```html
<igx-date-range-picker>
    <igx-date-range-start>
        <igx-picker-toggle igxPrefix>
            <igx-icon>calendar_view_day</igx-icon>
        </igx-picker-toggle>
    </igx-date-range-start>
    <igx-date-range-end>
    </igx-date-range-end>
</igx-date-range-picker>
```

`IgxDateRangePicker` with first day of the week set to `Monday` and handler when a range selection is made:
```html
<igx-date-range-picker [weekStart]="2" (valueChange)="onRangeSelected($event)"></igx-date-range-picker>
```

`IgxDateRangePicker` that opens a calendar with more than `2` views and also hides days that are not part of each month:
```html
<igx-date-range-picker [displayMonthsCount]="5" [hideOutsideDays]="'true'"></igx-date-range-picker>
```

`IgxDateRangePicker` in a `drop-down` mode.
```html
<igx-date-range-picker [mode]="'dropdown'"></igx-date-range-picker>
```


# API

### Inputs
| Name             | Type               | Description |
|:-----------------|:-------------------|:------------|
| doneButtonText   | string             | Changes the default text of the `done` button. It will show up only in `dialog` mode. Default value is `Done`. |
| displayMonthsCount | number             | Sets the number displayed month views. Default is `2`. |
| formatter        | function => string | Applies a custom formatter function on the selected or passed date. |
| hideOutsideDays  | boolean            | Sets whether dates that are not part of the current month will be displayed. Default value is `false`. |
| locale           | string             | Gets the `locale` of the calendar. Default value is `"en"`. |
| mode             | PickerInteractionMode    | Sets whether `IgxDateRangePickerComponent` is in dialog or dropdown mode. Default is `dialog` |
| minValue | Date \| string | The minimum value in a valid range. |
| maxValue | Date \| string | The maximum value in a valid range. |
| outlet | IgxOverlayOutletDirective \| ElementRef<any> | Gets/Sets the container used for the popup element.
| overlaySettings  | OverlaySettings    | Changes the default overlay settings used by the `IgxDateRangePickerComponent`. | 
| placeholder      | string             | Sets the `placeholder` for single-input `IgxDateRangePickerComponent`. |
| weekStart        | number             | Sets the start day of the week. Can be assigned to a numeric value or to `WEEKDAYS` enum value. |

### Outputs
| Name        | Description                                                        | Cancelable | Emitted with                    |
|:------------|:-------------------------------------------------------------------|------------|:--------------------------------|
| valueChange | Emitted when the picker's value changes. Used for two-way binding. | false      | DateRange                       |
| opening     | Emitted when the calendar starts opening, cancelable.              | true       | IBaseCancelableBrowserEventArgs |
| opened      | Emitted when the `IgxDateRangePickerComponent` is opened.          | false      | IBaseEventArgs                  |
| closing     | Emitted when the calendar starts closing, cancelable.              | true       | IBaseCancelableBrowserEventArgs |
| closed      | Emitted when the `IgxDateRangePickerComponent` is closed.          | false      | IBaseEventArgs                  |

### Methods
| Name        | Arguments     | Return Type | Description |
|:-----------:|:--------------|:------------|:------------|
| open        | n/a           | void           | Opens the date picker's dropdown or dialog. |
| close       | n/a           | void           | Closes the date picker's dropdown or dialog. |
| value       | n/a           | DateRange      | Gets/sets the currently selected value / range from the calendar. |
| select | startDate, endDate | void      | Selects a range of dates, clears previous selection. |
