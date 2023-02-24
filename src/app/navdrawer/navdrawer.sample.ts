import { Component } from '@angular/core';
import { AppComponent } from './../app.component';
import { IgxRadioComponent } from '../../../projects/igniteui-angular/src/lib/radio/radio.component';
import { NgFor } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IgxSwitchComponent } from '../../../projects/igniteui-angular/src/lib/switch/switch.component';

@Component({
    selector: 'app-navbar-sample',
    styleUrls: ['navdrawer.sample.css'],
    templateUrl: 'navdrawer.sample.html',
    standalone: true,
    imports: [IgxSwitchComponent, FormsModule, NgFor, IgxRadioComponent]
})
export class NavdrawerSampleComponent {
    constructor(public app: AppComponent) {}

    public toggle() {
        this.app.navdrawer.toggle();
    }
}
