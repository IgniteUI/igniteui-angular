"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var core_1 = require('angular2/core');
var Infragistics = require('../../../src/main');
var AppComponent = (function () {
    function AppComponent() {
        this.navItems = [{
                text: "Nav1", link: "#"
            }, {
                text: "Nav2", link: "#"
            }, {
                text: "Nav3", link: "#"
            }, {
                text: "Nav4", link: "#"
            }];
        this.options = [{
                name: "delete",
                icon: "ig-delete",
                label: "Delete",
                position: "left",
                handler: function () {
                    console.log("delete");
                }
            }, {
                name: "recycle",
                icon: "ig-recycle",
                label: "Recycle",
                position: "left",
                handler: function () {
                    console.log("recycle");
                }
            }, {
                name: "eat",
                icon: "ig-eat",
                label: "eat",
                position: "right",
                handler: function () {
                    console.log("eat");
                }
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
    AppComponent.prototype.logEvent = function (event) {
        this.log.push(event);
        if (event === "closing") {
            // this will cause change detection, potentially run outside of angular
            this.open = false;
        }
        if (event === "opening") {
            this.open = true;
        }
    };
    AppComponent.prototype.testToggle = function () {
        var _this = this;
        this.viewChild.toggle().then(function (value) {
            _this.logEvent("API call resolved: " + value);
        });
    };
    AppComponent.prototype.removeItem = function (index) {
        var newNavItems = this.navItems.filter(function (v, i) { return i !== index; });
        this.navItems = newNavItems;
    };
    AppComponent.prototype.recycle = function (index) {
        alert("recycle " + index);
    };
    AppComponent.prototype.eat = function (index) {
        alert("eat " + index);
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
                Infragistics.NavigationClose,
                Infragistics.Button,
                Infragistics.Icon,
                Infragistics.Header,
                Infragistics.Item,
                Infragistics.List
            ]
        }), 
        __metadata('design:paramtypes', [])
    ], AppComponent);
    return AppComponent;
}());
exports.AppComponent = AppComponent;
/**
 * Pin demo
 */
var AppComponentPin = (function (_super) {
    __extends(AppComponentPin, _super);
    function AppComponentPin() {
        _super.call(this);
        this.open = true;
        this.pin = true;
        //sample config
        this.showPinToggle = true;
        this.showPositions = false;
    }
    return AppComponentPin;
}(AppComponent));
exports.AppComponentPin = AppComponentPin;
/**
 * Mini demo
 */
var AppComponentMini = (function (_super) {
    __extends(AppComponentMini, _super);
    /**
     * Main app component for the mini Navigation Drawer sample.
     * Can't reuse template with other samples because ngIf on the mini template selector won't work
     * Setup for future: Have mini content and show mini width input only on this sample.
     * See https://github.com/angular/angular/issues/6303
     */
    function AppComponentMini() {
        _super.call(this);
        //sample config
        this.showMiniWidth = true;
        this.miniTemplate = true;
        this.showToggle = false;
    }
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
    return AppComponentMini;
}(AppComponent));
exports.AppComponentMini = AppComponentMini;
//# sourceMappingURL=main.js.map