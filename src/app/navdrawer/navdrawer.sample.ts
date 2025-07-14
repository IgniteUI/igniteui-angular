import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IgxRadioComponent, IgxSwitchComponent } from 'igniteui-angular';
import { AppComponent } from '../app.component';



@Component({
    selector: 'app-navbar-sample',
    styleUrls: ['navdrawer.sample.scss'],
    templateUrl: 'navdrawer.sample.html',
    imports: [IgxSwitchComponent, FormsModule, IgxRadioComponent]
})
export class NavdrawerSampleComponent {
    app = inject(AppComponent);


    public toggle() {
        // TODO: This needs to be refactored into a service.
        this.app.navdrawer.toggle();
    }
}
