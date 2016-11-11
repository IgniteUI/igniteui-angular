ig-radio

**ig-radio** renders a set of radio buttons to allow the user make a choice and submit data. The user is able to select just one from the available options.

#Usage

A number of options, attributes and events are available to customize the component look and feel and the way the radio button is working.

##Initialize
```html
<ig-radio
    *ngFor="let item of ['Foo', 'Bar', 'Baz']"
    value="{{item}}"
    name="group"
    [(ngModel)]="user.favouriteVarName">
    {{item}}
</ig-radio>
```

The above markup will render three radio buttons, one for each item of the ['Foo', 'Bar', 'Baz'] array. The'value' property is mapped to the input element value attribute,
while the content of the <ig-radio> tag is what gets displayed in the label associated with the input.

##You can assign unique id's by using the 'id' property and use the 'name' property to group buttons together.

##The rest of the properties are also standard and control the tabIndex, disabled and checked attributes of the input element that gets rendered:
```html
<ig-radio
    id="{{user.id}}"
    value="{{user.manHours}}"
    [tabIndex]="50"
    [disabled]="false"
    [checked]="false"
    [(ngModel)]="user.favouriteVarName">
    {{item}}
</ig-radio>
```

You can attach to a change event using `(onchange)="doAlert($event)"`:

```html
<ig-radio
	value="{{user.id}}"
	tabIndex="50"
	(change)="doAlert($event)"
	(focus)="doAlert($event)"
	(blur)="doAlert($event)"
	[(ngModel)]="user.favouriteVarName">
	{{user.name}}
</ig-radio>
```

```typescript
import { Component } from "@angular/core";
import { IgRadioModule } from "../../src/radio/radio";

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
        alert("Thank you for selecting this option ! !");
    }
}
```