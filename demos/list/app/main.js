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
var core_1 = require('@angular/core');
var Infragistics = require('../../../src/main');
var filter_pipe_1 = require('../../../src/list/filter-pipe');
var AppComponent = (function () {
    function AppComponent() {
        this.navItems = [
            { key: "1", text: "Nav1", link: "#" },
            { key: "2", text: "Nav2", link: "#" },
            { key: "3", text: "Nav3", link: "#" },
            { key: "4", text: "Nav4", link: "#" }
        ];
    }
    Object.defineProperty(AppComponent.prototype, "filterOptions", {
        get: function () {
            var fo = new filter_pipe_1.FilterOptions();
            fo.matchFn = function (filteringValue, inputValue) { return filteringValue.indexOf(inputValue.toLowerCase()) > -1; }; // "contains" behavior
            fo.formatter = function (text) { return text.toLowerCase(); };
            return fo;
        },
        enumerable: true,
        configurable: true
    });
    AppComponent.prototype.filteringHandler = function (args) {
        //args.cancel = true;
        console.log(args);
    };
    AppComponent.prototype.filteredHandler = function (args) {
        console.log(args);
    };
    AppComponent = __decorate([
        core_1.Component({
            selector: 'sample-app',
            styleUrls: ["app/main.css"],
            templateUrl: "app/main.html",
            directives: [
                Infragistics.ListHeader,
                Infragistics.ListItem,
                Infragistics.List,
            ]
        }), 
        __metadata('design:paramtypes', [])
    ], AppComponent);
    return AppComponent;
}());
exports.AppComponent = AppComponent;

//# sourceMappingURL=main.js.map
