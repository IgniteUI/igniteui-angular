# igxMask

The **igxMask** directive is intended to provide means for controlling user input and formatting the visible value based on a configurable mask rules.

The following built-in mask rules should be supported:

    0: requires a digit (0-9).
    9: requires a digit (0-9) or a space.
    #: requires a digit (0-9), plus (+), or minus (-) sign.
    L: requires a letter (a-Z).
    ?: Requires a letter (a-Z) or a space.
    A: requires an alphanumeric (0-9, a-Z).
    a: requires an alphanumeric (0-9, a-Z) or a space.
    &: any keyboard character (excluding space).
    C: any keyboard character.

Static symbols (literals) in the mask pattern are also supported.

# Usage
```typescript
import { IgxMaskModule } from "igniteui-angular";
```

Use the `igxMask` input property on an input element to apply a mask. The **igxMask** directive is fully supported only on an input element of type **text**.
```html
<input type="text" igxInput [(ngModel)]="1234567890" [igxMask]="'(000) 0000-000'"/>
```

Use the `includeLiterals` input property to include/exclude the mask literals from the raw value.
```typescript
public myValue = "1234567890";
public myMask = "(000) 0000-000";
public includeLiterals = true;
```
```html
<input type="text" igxInput [(ngModel)]="myValue" [igxMask]="myMask" [includeLiterals]="includeLiterals"/>
```

Attach to the `valueChanged` event to implement custom logic when the value changes. Both, raw and formatted value, are accessible through the event payload.
```typescript
let raw: string;
let formatted: string;

handleValueChanged(event) {
  this.raw = event.rawValue;
  this.formatted = event.formattedValue;
}
```
```html
<input type="text" igxInput [(ngModel)]="1234567890" [igxMask]="'(000) 0000-000'" (valueChanged)="handleValueChanged($event)"/>
```

Use the `placeholder` input property to specify the placeholder attribute of the host input element that the `igxMask` is applied on.
```typescript
placeholder = 'hello';
```
```html
<input type="text" igxInput [igxMask]="'CCCCCC'" [placeholder]="placeholder"/>
```

Use the `focusedValuePipe` and `displayValuePipe` input properties to additionally transform the value on focus and blur.
```typescript
@Pipe({ name: "displayFormat" })
export class DisplayFormatPipe implements PipeTransform {
     transform(value: any): string {
        return value.toLowerCase();
    }
}

displayFormat = new DisplayFormatPipe();
```
```html
<input type="text" igxInput [igxMask]="'CCCCCC'" [displayValuePipe]="displayFormat"/>
```

### Undo and redo
The directive writes the value of the input on each edit, which clears the undo history of the browser. It keeps its own history instead.

| Key combination | Effect |
|--|--|
| `CTRL/COMMAND` + `Z` | Undoes the last edit step. |
| `CTRL` + `Y` or `CTRL/COMMAND` + `SHIFT` + `Z` | Redoes the last undone step. |

The Undo and Redo commands of the context menu, the Edit menu and software keyboards are handled the same way.

- A run of typed characters is a single step, and so is a run of deletes in the same direction. Moving the caret starts a new step.
- Paste, drop, cut and a committed IME composition are one step each.
- An edit that the mask rejects is not recorded.
- A restored step updates the bound value, emits `valueChanged` and puts the caret where the undone edit began.
- The history is dropped when the value is set from outside (`writeValue`) and when `mask` or `promptChar` changes. It is kept while the input loses and regains the focus.
- Nothing is undone while the input is readonly or during an IME composition.

### API

### Inputs
| Name       |      Type      |  Description |
|:----------:|:-------------|:------|
| `mask`| `String` | Represents the current mask. |
| `promptChar`| `String` | Character representing a fillable spot in the mask. |
| `includeLiterals`| `Boolean` | Include or exclude literals in the raw value. |
| `placeholder`| `string` | Specifies a short hint that describes the expected value. |
| `displayValuePipe`| `PipeTransform` | A pipe to transform the input value on blur. |
| `focusedValuePipe`| `PipeTransform` | A pipe to transform the input value on focus. |

### Outputs
| Name | Return Type | Description |
|:--:|:---|:---|
| `valueChanged` | `void` | Fires each time the value changes. |
