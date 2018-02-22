# igx-linear-bar and igx-circular-bar

The `linear` progress bar component provides the ability to display a progress bar and update its appearance as its state changes. The indicator can be styled with a choice of colors in stripes or solids. You can also manage where the text is aligned.
The `circular` progress indicator component provides the ability to display progress in a circle and update its appearance as its state changes. You can also manage if the text is visible or not.

# Usage
To get started with the Ignite UI for Angular Linear and Circular Progress Indicator, we should first import the **IgxProgressBarModule** in the **app.module.ts** file:
```typescript
// app.module.ts
...
import { IgxProgressBarModule } from 'igniteui-angular/main';

@NgModule({
    ...
    imports: [..., IgxProgressBarModule],
    ...
})
export class AppModule {}
```
### Basic configuration

```html
<igx-circular-bar [value]="currentValue" [max]="100" [animate]="true" [textVisibility]="false" (onProgressChanged)="progresChanged($event)"></igx-circular-bar>

<igx-linear-bar type="warning" [text]="'Custom text'" [textAlign]="positionCenter" [textTop]="true" [striped]="true" [textVisibility]="true" (onProgressChanged)="progresChanged($event)"></igx-linear-bar>>
```

# API Summary
## igx-linear-bar
| Name   |       Type      |  Description |
|:----------|:-------------:|:------|
| `max` |  number | Set maximum value that can be passed. By default it is set to 100. |
| `type` |  string | Set type of the linear bar. Possible options - `default`, `success`, `info`, `warning`, and `danger`. |
| `value` |  number | Set value that indicates the completed bar position. |
| `striped` |  boolean | Set bar to have striped style. |
| `animate` |  boolean | animation on progress bar. |
| `textAlign` | enum | Set the position that define where the text is aligned. Possible options - `IgxTextAlign.START` (default), `IgxTextAlign.CENTER`, `IgxTextAlign.END`. |
| `textVisibility` | boolean | Set the text to be visible. By default is set to `true`. |
| `textTop` | boolean | Set the position that defene is text to be aligned above the progress line. By default is set to `false`. |
| `text` | string | Set a custom text that is displayed according defined position. |
## igx-circular-bar
| Name   |       Type      |  Description |
|:----------|:-------------:|:------|
| `max` |  number | Set maximum value that can be passed. Default `max` value is 100. |
| `value` |  number | Set value that indicates the completed bar position. |
| `animate` |  boolean | animation on progress bar. |
| `textVisibility` | boolean | Set the text to be visible. By default is set to `true`. |
## Common
| Name   |  Description |
|:----------|:------|
| `getValue()` | Return passed value to progress bar to be in range between min(0) and max. |
| `getPercentValue()` | Calculate the percentage based on passed value. |
| `onProgressChanged` | Exposed event, that could be handled to track progress changing |
