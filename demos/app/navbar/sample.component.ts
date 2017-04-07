import { Component, OnInit } from "@angular/core";
import { Location } from "@angular/common";

const CURRENT_VIEW: string = "Ignite UI JS Blocks Samples";

@Component({
    moduleId: module.id,
    selector: "navbar-sample",
    templateUrl: "sample.component.html",
    styleUrls: ["../app.samples.css", "./sample.component.css"]
})
export class NavbarSampleComponent implements OnInit {
    currentView: string;

    constructor(private _location: Location) {

    }

    ngOnInit() {
        this.currentView = CURRENT_VIEW;
    }

    navigateBack() {
        this._location.back();
    }

    canGoBack() {
        return window.history.length == 0;
    }
}