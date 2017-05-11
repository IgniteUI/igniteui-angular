import { Component } from "@angular/core";

@Component({
    selector: "switch-sample",
    templateUrl: "demos/switch/switchsample.component.html"
})
export class SwitchSampleComponent {
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