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
        const { navdrawer, drawerState: { open } } = this.app;
        open ? navdrawer.open() : navdrawer.close();
    }

    private pinned() {
        this.app.drawerState.pin = !this.app.drawerState.pin;
        this.toggle();
    }
}
