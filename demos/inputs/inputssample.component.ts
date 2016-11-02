import { Component } from "@angular/core";

@Component({
    selector: "inputs-sample",
    templateUrl: "demos/inputs/inputssample.component.html"
})
export class InputsSampleComponent {
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