# igx-slider
The slider component allows users to select a value in certain range or select a range of values 
based on it configuration it's a slider or range slider.

## Usage

### Slider

```html
<igx-slider [minValue]="0" [maxValue]="50" [lowerBound]="20" [value]="30">
</igx-slider>
```

----

### Range slider

```html
<igx-slider [type]="sliderType" [value]="{ lower: 5, upper: 50 }"
            [minValue]="0" [maxValue]="100">
</igx-slider>
```

## Getting Started

### Dependencies
To use the IgxSlider import the IgxSlider:

```typescript
import { IgxSlider } from "../../../src/main";
```

## API

##### Enums

###### SliderType

| Name | Description |
| :--- | :---------- |
| SLIDER | Slider with single thumb. |
| RANGE | Range slider with multiple thumbs, that can mark the range. |

##### Interfaces

###### IRangeSliderValue

| Name | Type | Description |
| :--- | :--- | :---------- |
| lower | number | The lower value of the range slider |
| upper | number | The upper value of the range slider |


##### Inputs

| Name | Type | Description |
| :--- | :--- | :--- |
| isContinuous | boolean | Marks slider as continuous. By default is considered that the slider is discrete. Discrete slider does not have ticks and does not shows bubble labels for values. |
| lowerBound | number | The lower boundary of the slider value. If not set is the same as min value. |
| maxValue | number | The maximal value for the slider. |
| minValue | number | The minimal value for the slider. |
| step | number | The incremental/decremental step of the value when dragging the thumb. The default step is 1, and step should not be less or equal than 0. |
| thumbLabelVisibilityDuration | number | The duration visibility of thumbs labels. The default value is 750 milliseconds. |
| type | [SliderType](#slidertype) | The duration visibility of thumbs labels. The default value is 750 milliseconds. |
| upperBound | number | The lower boundary of the slider value. If not set is the same as min value. |
| value | number\|[IRangeSliderValue](#IRangeSliderValue) | The slider value. If the slider is of type SLIDER the argument is number. By default if no value is set the default value is same as lower upper bound. If the slider type is RANGE the the argument is object containing lower and upper properties for the values.  By default if no value is set the default value is for lower value it is the same as lower bound and if no value is set for the upper value it is the same as the upper bound.

##### Outputs

| Name | Description |
| :--- | :--- | 
| onValueChange  | This event is emitted when user has stopped interacting the thumb and value is changed.  |
