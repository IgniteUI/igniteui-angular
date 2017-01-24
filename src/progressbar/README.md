# igx-linear-bar and igx-circular-bar

Both `linear` and `circular` bar components provides the ability to display a progress bar and its state changes.
Displayed number value property determines the load state.

# Usage
```html
<igx-linear-bar [striped]="false" [value]="currentValue" [max]="200">
</igx-linear-bar>

<igx-circular-bar (onProgressChanged)="f($event)" [value]="currentValue">
</igx-circular-bar>
```

# API Summary
## igx-linear-bar
| Name   |       Type      |  Description |
|:----------|:-------------:|:------|
| `max` |  number | Set maximum value that can be passed. |
| `type` |  string | Set type of the linear bar. Possible options - `default`, `success`, `info`, `warning` and `danger`. |
| `value` |  number | Set value that indicates the completed bar position. |
| `stripped` |  boolean | Set bar to have striped style. |
| `animate` |  boolean | animation on progress bar. |
## igx-circular-bar
| Name   |       Type      |  Description |
|:----------|:-------------:|:------|
| `max` |  number | Set maximum value that can be passed. Default `max` value is 100. |
| `value` |  number | Set value that indicates the completed bar position. |
| `animate` |  boolean | animation on progress bar. |
## Common
| Name   |  Description |
|:----------|:------|
| `getValue()` | Return passed value to progress bar to be in range between min(0) and max. |
| `getPercentValue()` | Calculate the percentage based on passed value. |
| `onProgressChanged` | Exposed event, that could be handled to track progress changing |



