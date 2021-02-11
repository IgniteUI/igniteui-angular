# Igx-Tooltip

#### Category
_Directives_

## Description
The **IgxTooltip** directive provides us a way to make a given element a tooltip. Then we can assign it to be a tooltip for another element (for example a button) by using the **IgxTooltipTarget** directive.
A walkthrough of how to get started can be found [here](https://www.infragistics.com/products/ignite-ui-angular/angular/components/tooltip).

## Usage
First we will have to import the IgxTooltipModule.
```typescript
import { IgxTooltipModule } from "igniteui-angular";
```

- The **IgxTooltip** directive is used to make a given element a tooltip. (exported with the name **tooltip**) This directive extends the **IgxToggle** directive and shares its functionality, since the tooltip is basically a togglable element.
- The **IgxTooltipTarget** directive is used to mark an element as one that has a tooltip. (exported with the name **tooltipTarget**) This directive extends the **IgxToggleAction** directive and shares most of its functionality as well as adding some of its own (for example the hover/unhover behavior which is tooltip specific).

By exporting the IgxTooltip directive and assigning it to the IgxTooltipTarget property, we assign the tooltip to a specific element.


### Simple tooltip

Let's say we have a button and we would like it to have a tooltip that provides some additional text information.
```html
<button [igxTooltipTarget]="tooltipRef">
    Hover me
</button>

<div #tooltipRef="tooltip" igxTooltip>
    Hello there, this is a tooltip!
</div>
```

### Content rich tooltip

Since the tooltip itself is a simple DOM element, we can inject whatever content we want inside of it and it will be displayed as an ordinary tooltip.

```html
<button [igxTooltipTarget]="tooltipRef">
    Hover me
</button>

<div #tooltipRef="tooltip" igxTooltip>
    <div>tooltip's header.</div>
    <custom-component></custom-component>
    <div>tooltip's footer</div>
</div>
```

## Configuration

### Delay settings
The **IgxTooltipTarget** directive exposes `showDelay` and `hideDelay` inputs, which can be used to set the amount of time (in milliseconds) that has to pass before showing and hiding the tooltip respectively.

```html
<button [igxTooltipTarget]="tooltipRef" showDelay="1500" hideDelay="1500">
    Hover me
</button>

<div #tooltipRef="tooltip" igxTooltip>
    Hello there, this is a tooltip!
</div>
```

### Manually showing and hiding the tooltip
While the tooltip's default behavior is to show when its target is hovered and hide when its target is unhovered, we can also do this manually by using the `showTooltip` and the `hideTooltip` methods of the IgxTooltipTarget directive.

```html
<button (click)="targetBtn.showTooltip()">Show tooltip</button>
<button (click)="targetBtn.hideTooltip()">Hide tooltip</button>

<button #targetBtn="tooltipTarget" [igxTooltipTarget]="tooltipRef">
    Hover me
</button>

<div #tooltipRef="tooltip" igxTooltip>
    Hello there, this is a tooltip!
</div>
```

## API Summary

## IgxTooltipDirective

### Properties
| Name | Type | Description |
| :--- |:--- | :--- |
| context | any | Specifies the context of the tooltip. (Used to store and access any tooltip related data.) |

Since the **IgxTooltip** directive extends the **IgxToggle** directive and there is no specific functionality it adds apart from some styling classes and attributes in combination with the properties from above, you can refer to the [IgxToggle API](https://github.com/IgniteUI/igniteui-angular/blob/master/projects/igniteui-angular/src/lib/directives/toggle/README.md) for additional details.

## IgxTooltipTargetDirective

### Properties
| Name | Type | Description |
| :--- |:--- | :--- |
| showDelay | number | Specifies the amount of milliseconds that should pass before showing the tooltip. |
| hideDelay | number | Specifies the amount of milliseconds that should pass before hiding the tooltip. |
| tooltipDisabled | boolean | Specifies if the tooltip should not show when hovering its target with the mouse. (defaults to false) |
| tooltipHidden | boolean | Indicates if the tooltip is currently hidden. |
| nativeElement | any | Reference to the native element of the directive. |

### Methods
| Name | Type | Arguments | Description |
| :--- |:--- | :--- | :--- |
| showTooltip | void | N/A | Shows the tooltip after the amount of ms specified by the `showDelay` property. |
| hideTooltip | void | N/A | Hides the tooltip after the amount of ms specified by the `hideDelay` property. |

### Events
|Name|Description|Cancelable|Event arguments|
|--|--|--|--|
| tooltipShow | Emitted when the tooltip starts showing. (This event is fired before the start of the countdown to showing the tooltip.) | True | ITooltipShowEventArgs |
| tooltipHide | Emitted when the tooltip starts hiding. (This event is fired before the start of the countdown to hiding the tooltip.) | True | ITooltipHideEventArgs |
