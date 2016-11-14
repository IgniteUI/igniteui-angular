import { Component } from "@angular/core";
import {IgxComponentsModule, IgxDirectivesModule} from "../../../src/main";


@Component({
    selector: "input-sample",
    moduleId: module.id,
    templateUrl: './sample.component.html'
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