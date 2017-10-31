# igx-linear-bar and igx-circular-bar

The `linear` progress bar component provides the ability to display a progress bar and update its appearance as its state changes. This component offers a choice of colors and can be striped or non-striped.  
The `circular` progress indicator component provides the ability to display progress in a circle and update its appearance as its state changes.  

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



