# igx-datePicker Component

The **igx-datePicker** component allows you to choose date from calendar
which is presented into input field.

# Usage
```typescript
import { IgxDatePickerComponent } from "igniteui-js-blocks";
```

Basic initialization
```html
<igx-datePicker></igx-datePicker>
```
Custom formatter function with passed initial date.
```html
<igx-datePicker [formatter]="customFormatter" [value]="dateValue">
</igx-datePicker>
```

DatePicker with cancel and today buttons
```html
<igx-datePicker [cancelButtonLabel]="'Close'"[todayButtonLabel]="'Today'">
</igx-datePicker>
```

You have also ability to disable the datePicker
```html
<igx-datePicker [isDisabled]="false">
</igx-datePicker>
```

# API

###### Inputs
| Name   |      Type      |  Description |
|:----------|:-------------:|:------|
| `todayBottonLabel` | string | Creates today button with custom name, which selects today date from calendar, and fill the datePicker input. |
| `cancelButtonLabel` | string | Creates cancel button with custom name, which closes the calendar. |
| `formatter` | function | Applied custom formatter on the selected or passed date. |
| `isDisabled` | boolean | Disable the datePicker. |
| `value` | Date | Getter and Setter for the selected or passed date value. |

###### Outputs
| Name | Description |
| :--- | :--- | 
| `onOpen`  | Emitted when a datePicker calendar is being opened.  |

###### Methods
| Signature | Description |
| :--- | :--- |
| `triggerTodaySelection`  | Selects today date from calendar and fill the input value with it. Also emits the `onSelection` event from calendar.  |