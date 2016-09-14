import { Component } from "@angular/core";

class User {
    username: string;
    password: string;
    comment: string;

    constructor(username: string, password: string, comment: string) {
        this.username = username;
        this.password = password;
        this.comment = comment;
    }
}

@Component({
    selector: "sample-app",
    templateUrl: "app/main.html"
})
export class AppComponent {
    user = new User("John Doe", "secret", "");
    shouldDisable: boolean = false;

    foo(event) {
        console.log("Received type:", event.type, event.target.value);
        if (event.target.value === "disabled") {
            this.shouldDisable = true;
        } else {
            this.shouldDisable = false;
        }
    }
}
