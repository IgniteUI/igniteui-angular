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

    public pin: boolean = false;
    public gestures: boolean = true;
    public open: boolean = false;
    public position = "left";
    public drawerWidth = "";
    public drawerMiniWidth = "";
    @ViewChild(NavigationDrawer) public viewChild: NavigationDrawer;

    /** Sample-specific configurations: */
    public miniTemplate: boolean = false;
    public showGestureToggle: boolean = true;
    public showPositions: boolean = true;
    public showPinToggle: boolean = false;
    public showMiniWidth: boolean = false;
    public showEventLog: boolean = true;
    public showToggle: boolean = true;
    public log: string[] = new Array<string>();

    public logEvent(event) {
        this.log.push(event);
        if (event === "closing") {
            // this will cause change detection, potentially run outside of angular
            this.open = false;
        }
        if (event === "opening") {
            this.open = true;
        }
    }

    public testToggle() {
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

        // sample config
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

        // sample config
        this.showMiniWidth = true;
        this.miniTemplate = true;
        this.showToggle = false;
    }
}
