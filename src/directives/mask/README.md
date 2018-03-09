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

Use the `igxMask` input property on an input element to apply a mask.
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

Attach to the `dataValueChange` event to implement custom logic when the value changes. Both, raw and formatted value, are accessible through the event payload.
```typescript
let raw: string;
let formatted: string;

handleValueChange(event) {
  this.raw = event.rawValue;
  this.formatted = event.formattedValue;
}
```
```html
<input type="text" igxInput [(ngModel)]="1234567890" [igxMask]="'(000) 0000-000'" (onValueChange)="handleValueChange($event)"/>
```

### API

### Inputs
| Name       |      Type      |  Description |
|:----------:|:-------------|:------|
| `mask`| `String` | Represents the current mask. |
| `promptChar`| `String` | Character representing a fillable spot in the mask. |
| `includeLiterals`| `Boolean` | Include or exclude literals in the raw value. |

### Outputs
| Name | Return Type | Description |
|:--:|:---|:---|
| `onValueChange` | `void` | Fires each time the value changes. |
