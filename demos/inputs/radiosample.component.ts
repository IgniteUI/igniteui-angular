import { Component } from "@angular/core";
import { IgRadioModule } from "../../src/radio/radio";

@Component({
    selector: "radio-sample",
    templateUrl: "demos/inputs/radiosample.component.html"
})
export class RadioSampleComponent {
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