import { Location } from "@angular/common";
import { Component, OnInit } from "@angular/core";

const CURRENT_VIEW: string = "Ignite UI for Angular Samples";

@Component({
    selector: "navbar-sample",
    styleUrls: ["../app.samples.css", "./sample.component.css"],
    templateUrl: "sample.component.html"
})
export class NavbarSampleComponent implements OnInit {
    public currentView: string;

    constructor(private _location: Location) {

    }

    public ngOnInit() {
        this.currentView = CURRENT_VIEW;
    }

    public navigateBack() {
        this._location.back();
    }

    public canGoBack() {
        return window.history.length === 0;
    }
}
