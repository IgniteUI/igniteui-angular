import { Component, EventEmitter, Output, ViewChild } from "@angular/core";
import { NavigationStart, Router } from "@angular/router";
import "rxjs/add/operator/filter";
import { IgxNavigationDrawer, IgxNavigationDrawerModule } from "../lib/main";

@Component({
    selector: "sample-app",
    styleUrls: ["app.component.css"],
    templateUrl: "app.component.html"
})
export class AppComponent {
    @ViewChild("navdrawer") public navdrawer: IgxNavigationDrawer;

    public drawerState = {
        enableGestures: true,
        open: true,
        pin: false,
        pinThreshold: 768,
        position: "left",
        width: "242px"
    };

    constructor(private router: Router) {}
    public ngOnInit(): void {
        this.router.events
            .filter((x) => x instanceof NavigationStart)
            .subscribe((event: NavigationStart) => {
                if (event.url !== "/" && !this.drawerState.pin) {
                    // Close drawer when a sample is selected
                    this.navdrawer.close();
                }
            });
    }
}
