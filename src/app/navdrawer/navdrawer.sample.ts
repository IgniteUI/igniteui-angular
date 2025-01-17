import { Component } from '@angular/core';
import { NgFor } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IgxRadioComponent, IgxSwitchComponent } from 'igniteui-angular';
import { AppComponent } from '../app.component';



@Component({
    selector: 'app-navbar-sample',
    styleUrls: ['navdrawer.sample.scss'],
    templateUrl: 'navdrawer.sample.html',
    imports: [IgxSwitchComponent, FormsModule, NgFor, IgxRadioComponent]
})
export class NavdrawerSampleComponent {
    constructor(public app: AppComponent) {}

    public toggle() {
        // TODO: This needs to be refactored into a service.
        this.app.navdrawer.toggle();
    }
}
