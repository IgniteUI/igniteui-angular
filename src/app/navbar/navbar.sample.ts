import { Location } from '@angular/common';
import { Component, OnInit, ViewEncapsulation } from '@angular/core';

const CURRENT_VIEW = 'Ignite UI for Angular Samples';

@Component({
    encapsulation: ViewEncapsulation.None,
    selector: 'app-navbar-sample',
    styleUrls: ['navbar.sample.css'],
    templateUrl: 'navbar.sample.html'
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

    public get canGoBack() {
        return window.history.length === 0;
    }
}
