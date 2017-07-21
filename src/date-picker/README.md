# igx-datePicker

The **igx-datePicker** component allows you to choose date from calendar
which is presented into input field.

# Usage
```html
<igx-datePicker [formatter]="curtomFormatter" [dateValue]="dateValue">
</igx-datePicker>
```

# API Summary
| Name   |      Type      |  Description |
|:----------|:-------------:|:------|
| `formatter` |  function | Sets the date format. |
| `dateValue` | Date | Sets the initial date value. |
| `onOpened` | event | Emitted when a datePicker calendar is being opened. |

*You can also set all igx-datePicker properties programatically.

# Examples

Using `igx-datePicker` tag to include it into your app.
```html
<igx-datePicker [formatter]="curtomFormatter" [dateValue]="dateValue">
</igx-datePicker>
```

Using `TypeScript` to modify and existing igx-datePicker instance.
```typescript
datePickerInstance.formatter(callback);
datePickerInstance.dateValue(new Date(Date.now()));
```
