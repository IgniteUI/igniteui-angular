import {Component, ViewChild } from '@angular/core';
import * as Infragistics from '../../../src/main';

@Component({
    selector: 'sample-app',
    providers: [Infragistics.NavigationService],
    styleUrls: ["app/main.css"],
    templateUrl: "app/main.html",
    directives: [
        Infragistics.NavigationDrawer,
        Infragistics.NavigationToggle,
        Infragistics.NavigationClose
    ]
})
export class AppComponent {
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
    @ViewChild(Infragistics.NavigationDrawer) viewChild: Infragistics.NavigationDrawer;
    
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

    removeItem(index) {
        let newNavItems: Array<Object> = this.navItems.filter( (v, i) => i !== index);
        this.navItems = newNavItems;
    }

    recycle(index) {
        alert("recycle " + index);
    }

    eat(index) {
        alert("eat " + index);
    }
}


/**
 * Pin demo
 */
@Component({
    selector: 'sample-app',
    providers: [Infragistics.NavigationService],
    styleUrls: ["app/main.css"],
    templateUrl: "app/main.html",
    directives: [
        Infragistics.NavigationDrawer,
        Infragistics.NavigationToggle,
        Infragistics.NavigationClose
    ]
})
export class AppComponentPin extends AppComponent {
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
    selector: 'sample-app',
    providers: [Infragistics.NavigationService],
    styleUrls: ["app/main.css"],
    templateUrl: "app/main-mini.html",
    directives: [
        Infragistics.NavigationDrawer,
        Infragistics.NavigationToggle,
        Infragistics.NavigationClose
    ]
})
export class AppComponentMini extends AppComponent {
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