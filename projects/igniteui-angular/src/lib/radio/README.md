# igx-radio

**igx-radio** renders a set of radio buttons to allow the user make a choice and submit data. The user is able to select just one from the available options.  
A walkthrough of how to get started can be found [here](https://www.infragistics.com/products/ignite-ui-angular/angular/components/radio_button.html)

# Usage

A number of options, attributes and events are available to customize the component look and feel and the way the radio button is working.

__IMPORTANT__

Currently the checked state of radio button will update automatically only when its value is bound to ngModel. See the samples below for reference.

## Initialize
```html
<igx-radio
    *ngFor="let item of ['Foo', 'Bar', 'Baz']"
    value="{{item}}"
    name="group"
    [(ngModel)]="user.favouriteVarName">
    {{item}}
</igx-radio>
```

The above markup will render three radio buttons, one for each item of the ['Foo', 'Bar', 'Baz'] array. The `value` property is mapped to the input element value attribute, while the content of the <igx-radio> tag is what gets displayed in the label associated with the input.

You can assign unique ids by using the 'id' property. Use the 'name' property to group buttons together.

The rest of the properties are also standard and control the tabindex, disabled and checked attributes of the input element that gets rendered:
```html
<igx-radio
    id="{{user.id}}"
    value="{{user.manHours}}"
    [tabindex]="50"
    [disabled]="false"
    [checked]="false"
    [(ngModel)]="user.favouriteVarName">
    {{item}}
</igx-radio>
```

You can attach to a change event using `(onchange)="doAlert($event)"`:

```html
<igx-radio
	value="{{user.id}}"
	tabIndex="50"
	(change)="doAlert($event)"
	(focus)="doAlert($event)"
	(blur)="doAlert($event)"
	[(ngModel)]="user.favouriteVarName">
	{{user.name}}
</igx-radio>
```

```typescript
import { Component } from "@angular/core";
import { IgxRadioModule } from "../../src/radio/radio";

@Component({
    selector: "radio-button",
    templateUrl: "radio-button.html"
})
export class RadioSampleComponent {
    user = {
        name: 'John Doe',
        favouriteVarName: 'Foo',
        id: 12,
    };

    doAlert() {
        alert("Thank you for selecting this option!");
    }
}
```

# API Summary
| Name   |      Type      |  Description |
|:----------|:-------------:|:------|
| `@Input()` id |    string   | The unique `id` attribute to be used for the radio button. If you do not provide a value, it will be auto-generated. |
| `@Input()` labelId |    string   | The unique `id` attribute to be used for the radio button label. If you do not provide a value, it will be auto-generated. |
| `@Input()` name |  string | The `name` attribute to be used for the radio button. |
| `@Input()` value | any | The value to be set for the radio button. |
| `@Input()` tabindex | number | Specifies the tabbing order of the radio button. |
| `@Input()` checked | boolean | Specifies the checked state of the radio button. |
| `@Input()` required | boolean | Specifies the required state of the radio button. |
| `@Input()` disabled | boolean | Specifies the disabled state of the radio button. |
| `@Input()` disableRipple | boolean | Specifies the whether the ripple effect should be disabled for the radio button. |
| `@Input()` labelPosition | string `|` enum RadioLabelPosition | Specifies the position of the text label relative to the radio button element. Possible values are "before" and "after". |
| `@Input("aria-labelledby")` ariaLabelledBy | string | Specify an external element by id to be used as label for the radio button. |
| `@Output()` change | EventEmitter<IChangeRadioEventArgs> | Emitted when the radio button checked value changes. |

### Methods

| select |
|:----------|
| Selects the radio button. |
