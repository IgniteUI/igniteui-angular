# IgxFocusTrap Directive

The **IgxFocusTrap** directive provides functionality to trap the focus within an element. The focus should not leave the element when the user keeps tabbing through the focusable elements. Typically, when the focus leaves the last element, it should move to the first element. And vice versa, when SHIFT + TAB is pressed, when the focus leaves the first element, the last element should be focused. In case the element does not contain any focusable elements, the focus will be trapped on the element itself.

The focus moves through the elements in DOM order, starting from the currently focused element, even if that element is not part of the tab order itself (e.g. an element with `tabindex="-1"` that was focused programmatically).

An element is considered focusable when it is part of the sequential tab order, which excludes:
- elements with a negative `tabindex`, hidden inputs (`type="hidden"`) and disabled elements, including the ones inside a disabled `fieldset`;
- elements that are not rendered or are not visible (e.g. `display: none`, `visibility: hidden`, the `hidden` attribute, the content of a collapsed `details` element);
- elements inside `inert` or `aria-hidden="true"` containers.

# Usage
```typescript
import { IgxFocusTrapModule } from "igniteui-angular";
```

Basic initialization
```html
<form [igxFocusTrap]="true" tabindex="0">
    <input type="text" name="uname">
    <input type="password" name="psw">
    <button>SIGN IN</button>
</form>
```

# API

### Inputs
| Name | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `igxFocusTrap` | `boolean` | `true` | Sets whether the Tab key focus is trapped within the element. |
