import { Component, OnInit } from "@angular/core";
import { Location } from "@angular/common";

const CURRENT_VIEW: string = "Ignite UI JS Blocks Samples";

@Component({
    moduleId: module.id,
    selector: "navbar-sample",
    templateUrl: "sample.html",
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
        var isStackHisoryEmpty = window.history.length == 0;

        return !isStackHisoryEmpty;
    }
}