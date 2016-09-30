import { Component, ViewChild, ViewEncapsulation } from "@angular/core";
import { NavigationDrawerModule, NavigationDrawer, NavigationService } from "../../../src/main";

@Component({
    moduleId: module.id, // commonJS standard
    selector: 'nav-sample',
    styleUrls: ["sample.css"],
    template: `
        <a routerLink="./"> Default sample </a>
        <a routerLink="./pin"> Pin sample </a>
        <a routerLink="./mini"> Mini sample</a>
        <router-outlet></router-outlet>
    `,
    providers: [NavigationService],
    encapsulation: ViewEncapsulation.None
})
export class NavDrawerSampleComponent {}

@Component({
    moduleId: module.id, // commonJS standard
    selector: "main-sample",
    templateUrl: "main.html",
    providers: [NavigationService]
})
export class MainDrawerSampleComponent {
        navItems: Array<Object> = [{
        text: "Nav1", link: "#"
    },{
        text: "Nav2", link: "#"
    },{
        text: "Nav3", link: "#"
    },{
        text: "Nav4", link: "#"
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
    moduleId: module.id, // commonJS standard
    selector: "pin-sample",
    templateUrl: "main.html",
    providers: [NavigationService]
})
export class PinNavDrawerSampleComponent extends MainDrawerSampleComponent {
    constructor() {
        super();
        this.open = true;
        this.pin = true;
        
        //sample config
        this.showPinToggle = true;
        this.showPositions = false;
    }
}

/**
 * Mini demo
 */
@Component({
    moduleId: module.id, // commonJS standard
    selector: "mini-sample",
    templateUrl: "main-mini.html",
    providers: [NavigationService]
})
export class MiniNavDrawerSampleComponent extends MainDrawerSampleComponent {
    /**
     * Main app component for the mini Navigation Drawer sample.
     * Can't reuse template with other samples because ngIf on the mini template selector won't work
     * Setup for future: Have mini content and show mini width input only on this sample.
     * See https://github.com/angular/angular/issues/6303 
     */
    constructor() {
        super();
        
        //sample config
        this.showMiniWidth = true;
        this.miniTemplate = true;
        this.showToggle = false;
    }
}