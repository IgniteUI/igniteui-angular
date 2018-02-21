import { Component } from "@angular/core";
import { AppComponent } from "./../app.component";

@Component({
    selector: "navbar-sample",
    styleUrls: ["../app.samples.css", "./sample.component.css"],
    templateUrl: "sample.component.html"
})
export class NavdrawerSampleComponent {
    constructor(private app: AppComponent) {}

    private toggle() {
        this.app.navdrawer.toggle();
    }
}
