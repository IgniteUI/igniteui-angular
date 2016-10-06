import { Component, ViewChild, ViewEncapsulation } from "@angular/core";
import { NavigationDrawerModule, NavigationDrawer, NavigationService } from "../../../src/main";

@Component({
    moduleId: module.id, // commonJS standard
    selector: 'nav-sample',
    styleUrls: ["sample.css"],
    template: `
        <router-outlet></router-outlet>
    `,
    providers: [NavigationService],
    encapsulation: ViewEncapsulation.None
})
export class NavDrawerSampleComponent {}

@Component({
    moduleId: module.id,
    selector: "main-sample",
    templateUrl: "main.html"
})
export class MainDrawerSampleComponent {
    navItems: Array<Object> = [{
        text: "Default sample", link: "/navigation-drawer"
    },{
        // router seems pretty confused how relative works.. "./pin" would generate "/navigation-drawer/mini/pin" under the "/navigation-drawer/mini" sample... 
        text: "Pin sample", link: "/navigation-drawer/pin"
    },{
        text: "Mini sample", link: "/navigation-drawer/mini"
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
    log: Array<string> = new Array<string>();
    
    logEvent(event) {
        this.log.push(event);
        if(event === "closing") {
            // this will cause change detection, potentially run outside of angular
            this.open = false;
        }
        if(event === "opening") {
            this.open = true;
        }
    }
    testToggle () {
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