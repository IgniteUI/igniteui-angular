The Circular Progress Bar component provides the ability to display a determinate progress bar and its state changes. The value property determines the load state. The size of the filed-in part is calculated as percentage based on the current value vs the max value property. The default max value is 100. The circular progress bar shows percentage value, does not interact with the end-user and is read-only, i.e. the user could not change its state or value.


## Objectives
The circular progress bar component is a new Ignite UI JS Blocks component. It is providing minimal API for the most common use cases, leaving maximum flexibility in developer hands. It follows the mobile-first approach and should be suitable for hybrid applications.

## User Stories

### Developer
As a citizen developer I want to be able to display certain progress for a concrete action so that the end-users know how much of a task has been completed.
As a citizen developer I want to be able to implement determinate circular progress bar visual styles so that I can integrate it better with the overall look and feel of the application.
As a citizen developer I want to be able to implement a circular progress bar with starting position at 12 o’clock that increases in clockwise direction.

```html
<igx-circular-bar (onProgressChanged)="f($event)" [value]="currentValue">
</igx-circular-bar>
```

### End user
As an end user, I want to be given a visual representation of how much a task or an action has been completed, so that I can be better informed about its state.
As an end user, I want to have circular progress bars, so that it matches the overall look and feel of the application.

##Acceptance criteria
1. Have determinate circular progress bar that shows only increasing action.
2. Have circular progressive bar that only increases in the clockwise direction starting from the position of 12 o’clock.
3. The progress should support transition animation and must dynamically display the progress percentage.
4. Value and Max must be configurable through the API.

## Functionality
### End User Experience
The circular progress indicator should always fill from 0% to 100% in clockwise direction and never decrease in value.
### Developer Experience
`Max`: Maximum value that can be passed.

`Value`: Precise value between 0 and Max

`Progress bar animation`: Transition (CSS)

`Background-color`: styled through the CSS

### Globalization/Localization
No localization options are envisaged.
### User Interface
The end user interface consists of:

1. Value positioned in the middle of the circle showing the current state as percentage (between 0 and max)
2. Clockwise increasing circle showing progress between 0% and 100%.

### Navigation
The end-user must not be able to change the circular progress bar value, max and size.

### API
You should be able to configure the `igx-linear-bar` and `igx-circular-bar` by passing an Options object to it. It should be able to override methods of Options object.

* `igx-circular-bar`
 * `max` - set maximum value that can be passed. Default `max` value is 100.
 * `value` - set value that indicates the completed bar position.
 * `animate` - animation on progress bar
* Methods
 * `getValue()` - return passed value to progress bar to be in range between min(0) and max.
 * `getPercentValue()` - calculate the percentage based on passed value.
* Methods External
 * `getValueInRange()` - validate passed value to progress bar to be in range between min(0) and max.
* Events
 * `onProgressChanged` - exposed event, that could be handled to track progress changing


### ARIA support
* `Roles`:
 * role="progressbar"
* `Attributes`:
 * aria-valuenow
 * aria-valuemin
 * aria-valuemax
