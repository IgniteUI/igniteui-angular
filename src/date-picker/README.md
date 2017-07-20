# igx-date-picker

The **igx-date-picker** component allows you to choose date from calendar
which is presented into input field.

# Usage
```html
<igx-date-picker [formatter]="curtomFormatter" [dateValue]="dateValue">
</igx-date-picker>
```

# API Summary
| Name   |      Type      |  Description |
|:----------|:-------------:|:------|
| `formatter` |  function | Sets the date format. |
| `dateValue` | Date | Sets the initial date value. |
| `onOpened` | event | Emitted when a datePicker calendar is being opened. |

*You can also set all igx-date-picker properties programatically.

# Examples

Using `igx-date-picker` tag to include it into your app.
```html
<igx-date-picker [formatter]="curtomFormatter" [dateValue]="dateValue">
</igx-date-picker>
```

Using `TypeScript` to modify and existing igx-date-picker instance.
```typescript
datePickerInstance.formatter(callback);
datePickerInstance.dateValue(new Date(Date.now()));
```
