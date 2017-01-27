The Linear Progress Bar provides the ability to display a single-line bar with its state changes. The value property determines the load state. The size of the filed-in part is calculated as percentage based on the current value vs the max value. The default max value is 100. The progress bar does not interact with the end-user and is read-only, i.e. the user could not change its state.

## Objectives
The progress bar aims at expanding the Ignite UI JS Blocks control set. It is providing minimal API for the most common use cases, leaving maximum flexibility in developer hands. It follows the mobile-first approach and should be suitable for hybrid applications.


## User Stories

### Developer

As a citizen developer I want to be able to display linearly certain progress for a concrete action so that the end-users know how much a task has been completed.
As a citizen developer I want to be able to implement different linear progress bar visual styles so that I can integrate it better with the overall look and feel of the application.

```html
<igx-linear-bar [striped]="false" [value]="currentValue" [max]="200">
</igx-linear-bar>
```

### End user
As an end user, I want to be given a visual representation of how much a task or an action has been completed as percentage, so that I can know how much of the task/action was done.
As an end user, I want to have linear progress bars with different styles, so that it matches the overall look and feel of the application

##Acceptance criteria
1. Have linear progressive bar that shows only increasing action.
2. The progress bar must have a type (Default, Warning, Danger, Info, Success) changing its background color.
3. The progress bar must indicate the current state as percentage.
4. The progress should have transition animation.
5. The linear progress bar should support different styling – stripped and solid color.
6. Value and max must be configurable through the API.

## Functionality
### End User Experience
The linear progress indicator should always fill from 0% to 100% and never decrease in value.
### Developer Experience
Max: Maximum value that can be passed.
Value: Precise value between 0 and Max (maximum value that can be passed to progress bar.)
Type of progress bars which sets the background color of the bar - Default, Warning, Danger, Info, Success
Progress bar animation - Transition (css)
Progress bar striped - Background-image (css-linear-gradients)
### User Interface
The end user interface consists of:
1. Progress bar container
2. Five color options for the progress bar that fill in the container from left to right.
3. Visual representation of the progress as percentage value followed by the % symbol.
### Navigation
The end-user will not interact with the progress bar.

### API
#### Options
You should be able to configure the `igx-linear-bar` and `igx-circular-bar` by passing an Options object to it. It should be able to override methods of Options object.

* `igx-linear-bar` properties
 * `max` - should set maximum value that can be passed.
 * `type` - should Set type of the linear bar. Possible options - `default`, `success`, `info`, `warning` and `danger`.
 * `value` - should set value that indicates the completed bar position.
 * `stripped` -should set bar to have striped style.
 * `animate` - animation on progress bar
* Methods
 * `getValue()` - get the progress value.
 * `getPercentValue()` - get the value in percentage.
* Methods External
 * `getValueInRange()` - validate passed value to progress bar to be in range between min(0) and max.
* Events
 * `onProgressChanged` - exposed event, that could be handled to track progress changing


### ARIA support
*Roles*:
role="progressbar"
*Attributes*:
aria-valuenow,
aria-valuemin,
aria-valuemax,
