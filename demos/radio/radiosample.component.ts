import { Component } from "@angular/core";
import { IgxRadioModule } from "igniteui-js-blocks/main";

@Component({
    selector: "radio-sample",
    templateUrl: "demos/radio/radiosample.component.html"
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