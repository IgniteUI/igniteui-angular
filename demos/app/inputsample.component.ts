import { Component } from "@angular/core";
import { IgInput } from "../../src/input/input";
import { CheckboxModule } from "../../src/checkbox/checkbox";
import { SwitchModule } from "../../src/switch/switch";
import { IgRadioModule } from "../../src/radio/radio";


@Component({
    selector: "input-sample",
    template:`
        <h3>Text Inputs</h3>

        <input type="text" igInput [(ngModel)]="user.name" />

        <p><code>Selected value = {{ user.name || ''}}</code></p>

        <input type="password" igInput placeholder="{{placeholder}}" [(ngModel)]="user.password" />
        <p><code>Selected value = {{ user.password || ''}}</code></p>

        <textarea placeholder="{{placeholder}}" igInput [(ngModel)]="user.comment"></textarea>
        <p><code>Selected value = {{ user.comment || ''}}</code></p>

        <h3>Checkbox</h3>
        <ig-checkbox [(ngModel)]="user.registered">Registered</ig-checkbox>
        <p><code>Selected value = {{ user.registered || false}}</code></p>

        <h3>Switch</h3>
        <ig-switch [(ngModel)]="user.subscribed">Subscribed</ig-switch>
        <p><code>Selected value = {{ user.subscribed || false}}</code></p>

        <h3>Radio</h3>
        <ig-radio *ngFor="let item of ['Foo', 'Bar', 'Baz']" value="{{item}}" name="group" [(ngModel)]="user.favouriteVarName">{{item}}</ig-radio>
        <p><code>Selected value = {{ user.favouriteVarName || ''}}</code></p>

        <h4>Data model</h4>
        <pre>{{ user | json }}</pre>

        <h3>Labels</h3>
        <label igLabel>Label me!</label>
    `
})
export class InputSampleComponent {
    placeholder = "Please enter a value";

    user = {
        name: 'John Doe',
        password: '1337s3cr3t',
        comment: "N/A",
        registered: true,
        subscribed: false,
        favouriteVarName: 'Foo'
    };
}