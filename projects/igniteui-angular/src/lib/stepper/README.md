# IgxStepperComponent

## Description
_**IgxStepperComponent** is a collection of **IgxStepComponent**s that delivers a wizard-like workflow:_

A complete walkthrough of how to get started can be found [here](https://www.infragistics.com/products/ignite-ui-angular/angular/components/stepper).
The specification for the stepper can be found [here](https://github.com/IgniteUI/igniteui-angular/wiki/Stepper-Specification)

----------

## Usage
```html
<igx-stepper>
   <igx-step *ngFor="let step of stepsData" [disabled]=”step.disabled”>
      <igx-icon igxStepIndicator>
	      {{step.indicator}}
	  </igx-icon>

      <p igxStepTitle>
	      {{step.title}}
	  </p>

      <div igxStepContent>
         ...
      </div>
    </igx-step>
</igx-stepper>
```

----------

## Keyboard Navigation

The keyboard can be used to navigate through all steps in the stpper.

_Disabled steps are not counted as visible steps for the purpose of keyboard navigation._

|Keys          |Description|
|---------------|-----------|
| ARROW DOWN    | Focuses the next step header in a vertical stepper. |
|  ARROW UP     | Focuses the previous step header in a vertical stepper. |
|     TAB       | Moves the focus to the next tabbable element. |
| SHIFT + TAB   | Moves the focus to the previous tabbable element. |
|   HOME        | Moves the focus to the header of the FIRST enabled step in the _igx-stepper_ |
|   END         | Moves the focus to the header of the LAST enabled step in the _igx-stepper_ |
| ARROW RIGHT   | Moves the focus to the header of the next accessible step in both orientations. |
| ARROW LEFT    | Moves the focus to the header of the previous accessible step in both orientations. |
|   ENTER / SPACE   | Activates the currently focused step. |
| CLICK | Activates the currently focused step. |

_By design when the user presses the **Tab** key over the step header the focus will move to the step content container. In case the container should be skipped the developer should set the content container [tabIndex]="-1"_

----------

## API Summary

### IgxStepperComponent

#### Accessors

**Get**

   | Name           | Description                                                                  | Type               |
   |----------------|------------------------------------------------------------------------------|---------------------|
   | steps      | Gets the steps that are rendered in the stepper.                       | `IgxStepComponent[]`           |


#### Properties

   | Name           | Description                                                                  | Type                                   |
   |----------------|------------------------------------------------------------------------------|----------------------------------------|
   | id      | The id of the stepper. Bound to attr.id                                              | `string` |
   | orientation | Gets/sets the orientation of the stepper. Default is `horizontal`. | `IgxStepperOrientation` |
   | stepType| Gets/sets the type of the steps in the stepper. Default value is `full` | `IgxStepType` |
   | titlePosition  | Gets/sets the position of the titles in the stepper. Default value is `bottom` when the stepper is horizontally orientated and `end` when the layout is set to vertical. | `IgxStepperTitlePosition` |
   | linear | Whether the validity of previous steps should be checked and only in case, it's valid to be able to move forward or not. Default value is `false`. | `boolean` |
   | contentTop| Whether the steps content should be displayed above the steps header when the stepper orientation is Horizontal. Default value is `false`. | `boolean` |
   | verticalAnimationType | Gets/sets the animation type of the stepper when the orientation direction is vertical. Default value is `grow`. | `VerticalAnimationType` |
   | horizontalAnimationType | Gets/sets the animation type of the stepper when the orientation direction is horizontal. Default value is `slide`. |`HorizontalAnimationType` |
   | animationDuration | 320 | `number` |

#### Methods
   | Name           | Description               | Parameters             | Returns |
   |-----------------|----------------------------|-------------------------|--------|
   | navigateTo     | Activates the step given by index. | `index: number` | `void` | 
   | next | Activates the next enabled step. | | `void` |
   | prev |  Activates the previous enabled step. | | `void` |
   | reset  | Resets the stepper to its initial state. | | `void` |

#### Events

   | Name           | Description                                                             | Cancelable | Arguments |
   |----------------|-------------------------------------------------------------------------|------------|------------|
   | activeStepChanging  | Emitted when the active step is about to change. | true       | `{ oldIndex: number, newIndex: number, owner: IgxStepperComponent, cancel: boolean }` |
   | activeStepChanged  | Emitted when the active step is changed.  | false      | `{ index: number, owner: IgxStepperComponent }` |
### IgxStepComponent

#### Accessors

**Get**

  | Name           | Description                                                                  | Type               |
  |-----------------|-------------------------------------------------------------------------------|---------------------|
  | index      | Gets the step index inside of the stepper.                                  | `number`  |

#### Properties

   | Name            | Description                                                                   | Type                |
   |-----------------|-------------------------------------------------------------------------------|---------------------|
   | id | The id of the step. Bound to attr.id | `string` |
   | disabled        | Gets/sets whether the step is interactable. | `boolean` |
   | active       | Gets/sets whether the step is activе. Two-way data binding.                     | `boolean` |
   | optional        | Gets/sets whether the step is optional.    | `boolean`           |
   | complete           | Gets/sets whether the step is completed.     | `boolean`               |
   | isValid         | Gets/sets whether the step is valid. Default value is `true`. | `boolean` |

#### Events

   | Name            | Description                                                                   | Cancelable | Parameters |
   |-----------------|-------------------------------------------------------------------------------|------------|---------|
   | activeChange  | Emitted when the step's active property changes                           |   false    | `boolean` |


