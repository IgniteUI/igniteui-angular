import { Component, EventEmitter, Output, ViewChild } from "@angular/core";
import { Router, NavigationStart } from "@angular/router";
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
        pin: false,
        pinThreshold: 768,
        position: "left",
        width: "242px"
    };

    constructor(private router: Router) {}
    ngOnInit() {
        this.router.events
            .filter(x =>  x instanceof  NavigationStart)
            .subscribe((event: NavigationStart) => {
                if (event.url !== "/" && !this.drawerState.pin) {
                    // Close drawer when a sample is selected
                    this.navdrawer.close();
                }
            });
    }
}
