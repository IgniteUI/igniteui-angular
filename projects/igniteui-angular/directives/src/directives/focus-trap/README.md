# IgxFocusTrap Directive

The **IgxFocusTrap** directive provides functionality to trap the focus within an element. The focus should not leave the element when the user keeps tabbing through the focusable elements. Typically, when the focus leaves the last element, it should move to the first element. And vice versa, when SHIFT + TAB is pressed, when the focus leaves the first element, the last element should be focused. In case the element does not contain any focusable elements, the focus will be trapped on the element itself.

#Usage
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
