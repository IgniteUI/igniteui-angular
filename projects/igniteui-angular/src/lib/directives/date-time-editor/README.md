# igxDateTimeEditor Directive

The `igxDateTimeEditor` allows the user to set and edit date and time in a chosen input element. The user can edit date or time portion, using an editable masked input. Additionally, can specify a desired display and input format, as well as min and max values to help validation.

## Usage
Import the `IgxDateTimeEditorModule` in the module that you want to use it in:

```typescript
...
import { IgxDateTimeEditorModule } from 'igniteui-angular';

@NgModule({
    ...
    imports: [..., IgxDateTimeEditorModule ],
    ...
})
export class AppModule {}
```

To use an input as a date time editor, set an `igxDateTimeEditor` directive and a valid date object as value. In order to have complete editor look and feel, wrap the input in an `input group`. This will allow you to not only take advantage of the following directives `igxInput`, `igxLabel`, `igx-prefix`, `igx-suffix`, `igx-hint`, but cover common scenarios when dealing with form inputs as well.

### Binding 
A basic configuration scenario setting a Date object as a `value`:
```typescript
public date = new Date();
```

```html
<igx-input-group>
    <input type="text" igxInput igxDateTimeEditor [value]="date"/>
</igx-input-group>
```

To create a two-way data-binding, set an ngModel:
```html
<igx-input-group>
    <input type="text" igxInput igxDateTimeEditor [(ngModel)]="date"/>
</igx-input-group>
```

### Features
#### Date Format 
To set specific display and input format.
```html
<igx-input-group>
    <input type="text" igxInput [displayFormat]="'shortDate'" [igxDateTimeEditor]="'dd/MM/yyyy'" [(ngModel)]="date"/>
</igx-input-group>
```

#### Min and Max Value
You can specify `minValue` and `maxValue` properties to restrict input and control the validity of the ngModel.
```typescript
public minDate = new Date(2020, 1, 15);
public maxDate = new Date(2020, 12, 1);
``` 
```html
<igx-input-group>
    <input type="text" igxInput igxDateTimeEditor [minValue]="minDate" [maxValue]="maxDate" [(ngModel)]="date"/>
</igx-input-group>

```

#### Increment and Decrement
`igxDateTimeEditor` directive exposes public `increment` and `decrement` methods, that increment or decrement a specific `DatePart` of the currently set date and time.
```typescript
public date = new Date();
public datePart: typeof DatePart = DatePart;
```
```html
<igx-input-group>
<input igxInput #timeEditor="igxDateTimeEditor" type="text" [igxDateTimeEditor]="'HH:mm tt'" [(ngModel)]="date">
<igx-suffix>
    <igx-icon (click)="timeEditor.increment(datePart.Minutes)">keyboard_arrow_up</igx-icon>
    <igx-icon (click)="timeEditor.decrement(datePart.Minutes)">keyboard_arrow_down</igx-icon>
</igx-suffix>
</igx-input-group>
```

#### Keyboard Navigation
`igxDateTimeEditor` directive has intuitive keyboard navigation that makes it easy to jump through different `DateParts`, increment, decrement, etc. without having to touch the mouse.

| Key combination | Effect |
|--|--|
| `Left Arrow` | Move one character to the left. |
| `Right Arrow` | Move one character to the left. |
| `Home` | Move to the beginning. |
| `End` | Move to the end. |
| `CTRL/COMMAND` + `Left Arrow` | Move to the beginning of the date/time section - current one or left one. |
| `CTRL/COMMAND` + `Right Arrow` | Move to the end of the date/time section - current on or right one. |
| `Down Arrow` | On a date/time section should decrement that part of the edited date. |
| `Up Arrow` | On a date/time section should increment that part of the edited date. |
| `CTRL/COMMAND` + `;` | Sets the current date and time as the value of the editor. |

### API
| Name | Type | Description |
|:-----|:----|:------------|
| `value` | Date \| string | The value of the editor. |
| `displayFormat` | string | The display value of the editor. |
| `inputFormat` | string | The format that the editor will use to display the date/time. |
| `minValue` | Date \| string | Sets the minimum value required for the editor to remain valid. |
| `maxValue` | Date \| string | Sets the maximum value required for the editor to remain valid. |
| `spinLoop` | boolean | Loop over the currently spun segment. |
| `spinDelta` | DatePartDeltas | Delta values used to increment or decrement each editor date part on spin actions. All values default to `1`.
| `promptChar` | string | Defines the empty characters in the mask. |
| `locale` | string | Locale settings used in displayFormat. |

#### Methods
| Name | Type | Description |
|:-----|:----|:------------|
| `clear` | void | Clears the input element of user input. |
| `increment` | void | Increments default OR specified time portion. |
| `decrement` | void | Decrements default OR specified time portion. |

#### Events
| Name | Type | Description |
|:-----|:----|:------------|
| `valueChanged` | custom | Fired when the editor's value has changed. |
| `validationFailed` | custom | Fired when the editor is not within a specified range. Can revert back to a previously valid state by changing the `newValue` property of the `args` parameter. |
