import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Location } from '@angular/common';

import { IgxButtonDirective } from '../../../projects/igniteui-angular/src/lib/directives/button/button.directive';
import { IgxIconComponent } from '../../../projects/igniteui-angular/src/lib/icon/icon.component';
import { IgxNavbarComponent, IgxNavbarActionDirective, IgxNavbarTitleDirective } from '../../../projects/igniteui-angular/src/lib/navbar/navbar.component';

const CURRENT_VIEW = 'Ignite UI for Angular Samples';

@Component({
    encapsulation: ViewEncapsulation.None,
    selector: 'app-navbar-sample',
    styleUrls: ['navbar.sample.css'],
    templateUrl: 'navbar.sample.html',
    standalone: true,
    imports: [IgxNavbarComponent, IgxIconComponent, IgxNavbarActionDirective, IgxNavbarTitleDirective, IgxButtonDirective]
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
