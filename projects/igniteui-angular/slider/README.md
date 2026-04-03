# igx-slider

### The latest version of the SPEC could be found in the [Wiki](https://github.com/IgniteUI/igniteui-angular/wiki/igxSlider-Specification).

IgxSliderComponent is a much more powerful alternative to `<input type="range" />`.  
The slider component allows users to select a single value from a range or select upper and lower values from range of values.  
The slider is a form component and can be used in both template-driven and reactive forms. When using the slider with `[(ngModel)]` consider the fact that the `IgxSliderType.SLIDER` (single-value) slider supports it fully, but the `IgxSliderType.RANGE` (upper and lower value) slider supports it only to write to the `ngModel`. If you want to take advantage of two-way databinding with the `IgxSliderType.RANGE` slider, then use `[(upperValue)]` and `[(lowerValue)]` bindings.  
Based on its configuration it's a slider (single value) or range (upper and lower value) slider.  
A walkthrough of how to get started can be found [here](https://www.infragistics.com/products/ignite-ui-angular/angular/components/slider)

## Usage

### Slider

```html
<igx-slider [minValue]="0" [maxValue]="50" [lowerBound]="20" [value]="30">
</igx-slider>
```

----

### Range slider

```html
<igx-slider [type]="sliderType" [lowerValue]="5" [upperValue]="50" 
            [minValue]="0" [maxValue]="100">
</igx-slider>
```

## Getting Started

### Dependencies

To use the IgxSlider import the IgxSliderComponent:

```typescript
import { IgxSliderComponent } from "../../../src/main";
```

## API

##### Enums

###### IgxSliderType

| Name | Description |
| :--- | :---------- |
| SLIDER | Slider with single thumb. |
| RANGE | Range slider with multiple thumbs, that can mark the range. |

##### Interfaces

###### IRangeSliderValue

| Name | Type | Description |
| :--- | :--- | :---------- |
| lower | number | The lower value of the RANGE slider |
| upper | number | The upper value of the RANGE slider |


##### Inputs

| Name | Type | Description |
| :--- | :--- | :--- |
| id | string | Unique identifier of the component. If not provided it will be automatically generated.|
| disabled | boolean | Disables or enables UI interaction. |
| continuous | boolean | Marks slider as continuous. By default is considered that the slider is discrete. Discrete slider does not have ticks and does not shows bubble labels for values. |
| lowerBound | number | The lower boundary of the slider value. If not set is the same as min value. |
| upperBound | number | The lower boundary of the slider value. If not set is the same as max value. |
| lowerValue | number | The lower value of a RANGE slider. |
| upperValue | number | The upper value of a RANGE slider. |
| maxValue | number | The maximal value for the slider. |
| minValue | number | The minimal value for the slider. |
| step | number | The incremental/decremental step of the value when dragging the thumb. The default step is 1, and step should be greater than 0. |
| thumbLabelVisibilityDuration | number | The duration visibility of thumbs labels. The default value is 750 milliseconds. |
| type | [IgxSliderType](#slidertype) | Sets the IgxSliderType, which is SLIDER or RANGE. |
| value | number | [IRangeSliderValue](#irangeslidervalue) | The slider value. If the slider is of type SLIDER the argument is number. By default if no value is set the default value is same as lower upper bound. If the slider type is RANGE then the argument is object containing lower and upper properties for the values.  By default if no value is set the default value is for lower value it is the same as lower bound and if no value is set for the upper value it is the same as the upper bound.

##### Outputs

| Name | Description |
| :--- | :--- | 
| valueChange  | This event is emitted when user has stopped interacting the thumb and value is changed.  |
| upperValueChange | This event is emitted when `upperValue` changes in a RANGE slider. |
| lowerValueChange | This event is emitted when `lowerValue` changes in a RANGE slider. |
