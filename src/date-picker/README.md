# igx-datePicker

The **igx-datePicker** component allows you to choose date from calendar
which is presented into input field.

# Usage
```html
<igx-datePicker [formatter]="curtomFormatter" [dateValue]="dateValue">
</igx-datePicker>
```

# API

###### Inputs
| Name   |      Type      |  Description |
|:----------|:-------------:|:------|
| `dateValue` | Date | Sets the initial date value. |

###### Outputs
| Name | Description |
| :--- | :--- | 
| `onOpen`  | Emitted when a datePicker calendar is being opened.  |

###### Methods
| Signature | Description |
| :--- | :--- |
| `formatter`  | Sets the date format.  |

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
