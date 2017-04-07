import { Component } from "@angular/core";
import {IgxComponentsModule, IgxDirectivesModule} from "../../../src/main";


@Component({
    selector: "input-sample",
    moduleId: module.id,
    templateUrl: './sample.component.html',
    styleUrls: ['../app.samples.css', 'sample.component.css']
})
export class InputSampleComponent {
    placeholder = "Please enter a value";

    user = {
        firstName: 'John',
        lastName: 'Doe',
        password: '1337s3cr3t',
        comment: '',
        registered: true,
        subscribed: false,
        gender: 'Male'
    };
}