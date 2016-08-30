"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
const core_1 = require('@angular/core');
const Infragistics = require('../../../src/main');
let AppComponent = class AppComponent {
    constructor() {
        this.navItems = [{
                text: "Nav1", link: "#"
            }, {
                text: "Nav2", link: "#"
            }, {
                text: "Nav3", link: "#"
            }, {
                text: "Nav4", link: "#"
            }];
        this.pin = false;
        this.gestures = true;
        this.open = false;
        this.position = "left";
        this.drawerWidth = "";
        this.drawerMiniWidth = "";
        /** Sample-specific configurations: */
        this.miniTemplate = false;
        this.showGestureToggle = true;
        this.showPositions = true;
        this.showPinToggle = false;
        this.showMiniWidth = false;
        this.showEventLog = true;
        this.showToggle = true;
        this.log = new Array();
    }
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
        this.viewChild.toggle().then((value) => {
            this.logEvent("API call resolved: " + value);
        });
    }
    removeItem(index) {
        let newNavItems = this.navItems.filter((v, i) => i !== index);
        this.navItems = newNavItems;
    }
    recycle(index) {
        alert("recycle " + index);
    }
    eat(index) {
        alert("eat " + index);
    }
};
__decorate([
    core_1.ViewChild(Infragistics.NavigationDrawer), 
    __metadata('design:type', Infragistics.NavigationDrawer)
], AppComponent.prototype, "viewChild", void 0);
AppComponent = __decorate([
    core_1.Component({
        selector: 'sample-app',
        providers: [Infragistics.NavigationService],
        styleUrls: ["app/main.css"],
        templateUrl: "app/main.html",
        directives: [
            Infragistics.NavigationDrawer,
            Infragistics.NavigationToggle,
            Infragistics.NavigationClose
        ]
    }), 
    __metadata('design:paramtypes', [])
], AppComponent);
exports.AppComponent = AppComponent;
/**
 * Pin demo
 */
let AppComponentPin = class AppComponentPin extends AppComponent {
    constructor() {
        super();
        this.open = true;
        this.pin = true;
        //sample config
        this.showPinToggle = true;
        this.showPositions = false;
    }
};
AppComponentPin = __decorate([
    core_1.Component({
        selector: 'sample-app',
        providers: [Infragistics.NavigationService],
        styleUrls: ["app/main.css"],
        templateUrl: "app/main.html",
        directives: [
            Infragistics.NavigationDrawer,
            Infragistics.NavigationToggle,
            Infragistics.NavigationClose
        ]
    }), 
    __metadata('design:paramtypes', [])
], AppComponentPin);
exports.AppComponentPin = AppComponentPin;
/**
 * Mini demo
 */
let AppComponentMini = class AppComponentMini extends AppComponent {
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
};
AppComponentMini = __decorate([
    core_1.Component({
        selector: 'sample-app',
        providers: [Infragistics.NavigationService],
        styleUrls: ["app/main.css"],
        templateUrl: "app/main-mini.html",
        directives: [
            Infragistics.NavigationDrawer,
            Infragistics.NavigationToggle,
            Infragistics.NavigationClose
        ]
    }), 
    __metadata('design:paramtypes', [])
], AppComponentMini);
exports.AppComponentMini = AppComponentMini;

//# sourceMappingURL=main.js.map
