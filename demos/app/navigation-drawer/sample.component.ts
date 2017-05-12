import { Component, ViewChild, ViewEncapsulation } from "@angular/core";
import { NavigationDrawer, NavigationDrawerModule, NavigationService } from "../../../src/main";

@Component({
    encapsulation: ViewEncapsulation.None,
    moduleId: module.id, // commonJS standard
    providers: [NavigationService],
    selector: "nav-sample",
    styleUrls: ["sample.css"],
    template: `
        <router-outlet></router-outlet>
    `
})
export class NavDrawerSampleComponent {}

@Component({
    moduleId: module.id,
    selector: "main-sample",
    templateUrl: "main.html"
})
export class MainDrawerSampleComponent {
    public navItems: object[] = [{
        link: "/navigation-drawer",
        text: "Default sample"
    }, {
        // router seems pretty confused how relative works..
        // "./pin" would generate "/navigation-drawer/mini/pin" under the "/navigation-drawer/mini" sample...
        link: "/navigation-drawer/pin",
        text: "Pin sample"
    }, {
        link: "/navigation-drawer/mini",
        text: "Mini sample"
    }];

    pin: boolean = false;
    gestures: boolean = true;
    open: boolean = false;
    position = "left";
    drawerWidth = "";
    drawerMiniWidth = "";
    @ViewChild(NavigationDrawer) viewChild: NavigationDrawer;

    /** Sample-specific configurations: */
    miniTemplate: boolean = false;
    showGestureToggle: boolean = true;
    showPositions: boolean = true;
    showPinToggle: boolean = false;
    showMiniWidth: boolean = false;
    showEventLog: boolean = true;
    showToggle: boolean = true;
    log: string[] = new Array<string>();

    logEvent(event) {
        this.log.push(event);
        if (event === "closing") {
            // this will cause change detection, potentially run outside of angular
            this.open = false;
        }
        if (event === "opening") {
            this.open = true;
        }
    }
    testToggle() {
        this.viewChild.toggle().then( (value) => {
            this.logEvent("API call resolved: " + value);
        });
    }
}

/**
 * Pin demo
 */
@Component({
    moduleId: module.id,
    selector: "pin-sample",
    templateUrl: "main.html"
})
export class PinNavDrawerSampleComponent extends MainDrawerSampleComponent {
    constructor() {
        super();
        this.open = true;
        this.pin = true;

        //sample config
        this.showPinToggle = true;
        this.showPositions = false;
        this.showGestureToggle = false;
    }
}

/**
 * Mini demo
 */
@Component({
    moduleId: module.id,
    selector: "mini-sample",
    templateUrl: "main.html"
})
export class MiniNavDrawerSampleComponent extends MainDrawerSampleComponent {
    constructor() {
        super();

        //sample config
        this.showMiniWidth = true;
        this.miniTemplate = true;
        this.showToggle = false;
    }
}
