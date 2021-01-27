import { Component } from '@angular/core';
import { AppComponent } from './../app.component';

@Component({
    selector: 'app-navbar-sample',
    styleUrls: ['navdrawer.sample.css'],
    templateUrl: 'navdrawer.sample.html'
})
export class NavdrawerSampleComponent {
    constructor(public app: AppComponent) {}

    public toggle() {
        this.app.navdrawer.toggle();
    }
}
