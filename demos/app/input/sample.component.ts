import { Component } from "@angular/core";

@Component({
    selector: "input-sample",
    styleUrls: ["../app.samples.css", "sample.component.css"],
    templateUrl: "./sample.component.html"
})
export class InputSampleComponent {
    public placeholder = "Please enter a value";

    public user = {
        comment: "",
        firstName: "John",
        gender: "Male",
        lastName: "Doe",
        password: "1337s3cr3t",
        registered: false,
        subscribed: false
    };

    public user2 = {
        comment: "",
        firstName: "John",
        gender: "Male",
        lastName: "Doe",
        password: "1337s3cr3t",
        registered: true,
        subscribed: false
    };

    public onClick(event) {
        console.log(event);
    }

    public onChange(event) {
        console.log(event);
    }
}
