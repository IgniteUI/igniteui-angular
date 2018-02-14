# IgxToggle Directive

The **IgxToggle** provides a way for user to make a given content togglable.

You can see it in action [here](http://139.59.168.161/demos/toggle)

#Usage
```typescript
import { IgxToggleModule } from "igniteui-angular";
```

Basic initialization
```html
<div igxToggle>
    <p>Some content that user would like to make it togglable.</p>
</div>
```

Opne/Close toggle through public methods that are provided by exporting the directive with name **toggle**.
```html
<button (click)="toggleRef.open()">Open</button>
<button (click)="toggleRef.close()">Close</button>
<div igxToggle #toggleRef="toggle">
    <p>Some content that user would like to make it togglable.</p>
</div>
```

Open/Close the directive only through one trigger by exporting it with name **toggle** and subscription for event
handlers when the toggle is opened and respectively closed. 
```html
<button (click)="toggleRef.toggle()">Toggle</button>
<div igxToggle #toggleRef="toggle" (onOpen)="eventHandler()" (onClose)="eventHandler()">
    <p>Some content that user would like to make it togglable.</p>
</div>
```

## API Summary

### Inputs
| Name       |      Type      |  Description |
|:----------:|:-------------|:------|
| `collapsed`| `Boolean` | Determines whether the toggle is open or closed. |

### Outputs
| Name | Return Type | Description |
|:--:|:---|:---|
| `onOpen` | `void` | Emits an event when the toggle container is opened. |
| `onClose` | `void` | Emits an event when the toggle container is closed. |

### Methods
| Name   | Arguments | Return Type | Description |
|:----------:|:------|:------|:------|
| `open` | `None` | `void` | Opens the toggle. |
| `close` | `None` | `void` | Closes the toggle. |


# IgxToggleAction Directive

The **IgxToggleAction** provides a way for user to Open/Close(toggle) every Component/Directive which implements **IToggleView** interface by providing the reference to this particular Component/Directive or ID which is registered into **IgxNavigationService**. It is also applicable upon **IgxToggle**

You can see it in action [here](http://139.59.168.161/demos/toggle)

#Usage
```typescript
import { IgxToggleModule } from "igniteui-angular";
```

Basic initialization
```html

<button [igxToggleAction]="toggleRef">Toggle</button>
<div igxToggle #toggleRef="toggle">
    <p>Some content that user would like to make it togglable.</p>
</div>
```

Passing registered component into **IgxNavigationService** by ID.
```html
<button igxToggleAction="toggle">Toggle</button>
<div igxToggle id="toggle">
    <p>Some content that user would like to make it togglable.</p>
</div>
```

Providing reference from custom component which has already implemented **IToggleView** interface.
```html
<button [igxToggleAction]="reference">Toggle</button>
<custom-component #reference></custom-component>
```

Providing reference from custom component which has already been registered into **IgxNavigationService**.
```html
<button igxToggleAction="customComponent">Toggle</button>
<custom-component id="customComponent"></custom-component>
```

## API Summary

### Inputs
| Name       |      Type      |  Description |
|:----------:|:-------------|:------|
| `igxToggleAction`| `IToggleView | string` | Determines the target that have to be controled. |
| `closeOnOutsideClick`| `Boolean` | Determines if passed Component/Directive have to be closed when it is clicked outside. |