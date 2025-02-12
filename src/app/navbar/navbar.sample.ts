import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import {Location} from '@angular/common';
import {
    IGX_NAVBAR_DIRECTIVES,
    IGX_INPUT_GROUP_DIRECTIVES,
    IgxAvatarComponent,
    IgxButtonDirective,
    IGX_PROGRESS_BAR_DIRECTIVES,
    IgxIconButtonDirective,
    IgxIconComponent,
} from 'igniteui-angular';
import {FormsModule} from "@angular/forms";


const CURRENT_VIEW = 'Ignite UI for Angular Samples';

@Component({
    encapsulation: ViewEncapsulation.None,
    selector: 'app-navbar-sample',
    styleUrls: ['navbar.sample.scss'],
    templateUrl: 'navbar.sample.html',
    imports: [IGX_NAVBAR_DIRECTIVES, IgxIconComponent, IgxButtonDirective, IgxIconButtonDirective, IgxAvatarComponent, IGX_PROGRESS_BAR_DIRECTIVES, IGX_INPUT_GROUP_DIRECTIVES, FormsModule]
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
