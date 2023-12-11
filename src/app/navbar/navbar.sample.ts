import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Location } from '@angular/common';
import { IGX_NAVBAR_DIRECTIVES, IgxButtonDirective, IgxIconButtonDirective, IgxIconComponent } from 'igniteui-angular';


const CURRENT_VIEW = 'Ignite UI for Angular Samples';

@Component({
    encapsulation: ViewEncapsulation.None,
    selector: 'app-navbar-sample',
    styleUrls: ['navbar.sample.scss'],
    templateUrl: 'navbar.sample.html',
    standalone: true,
    imports: [IGX_NAVBAR_DIRECTIVES, IgxIconComponent, IgxButtonDirective, IgxIconButtonDirective]
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
