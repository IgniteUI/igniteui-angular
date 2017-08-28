import { Component, EventEmitter, Output, ViewChild } from "@angular/core";
import { NavigationDrawer, NavigationDrawerModule } from "../../src/main";

@Component({
    selector: "sample-app",
    styleUrls: ["demos/app/app.component.css"],
    templateUrl: "demos/app/app.component.html"
})
export class AppComponent {
    @ViewChild("navdrawer") public navdrawer: NavigationDrawer;

    public drawerState = {
        enableGestures: true,
        open: true,
        pin: true,
        pinThreshold: "768px",
        position: "left",
        width: "242px"
    };
}
