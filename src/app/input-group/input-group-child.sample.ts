import { Component, Inject } from '@angular/core';
import { DisplayDensityToken, DisplayDensity, IDisplayDensityOptions } from 'projects/igniteui-angular/src/lib/core/displayDensity';

@Component({
    // tslint:disable-next-line:component-selector
    selector: 'input-group-child-sample',
    styleUrls: ['input-group.sample.css'],
    templateUrl: 'input-group-child.sample.html',
    providers: [{ provide: DisplayDensityToken, useValue: { displayDensity: DisplayDensity.compact} }]
})
export class InputGroupChildSampleComponent {
    public user = {
        firstName: 'Koke',
        lastName: 'Duduka'
    };

    constructor(@Inject(DisplayDensityToken) public displayDensityOptions: IDisplayDensityOptions) {}

    changeDisplayDensity() {
        switch (this.displayDensityOptions.displayDensity) {
            case DisplayDensity.comfortable: this.displayDensityOptions.displayDensity = DisplayDensity.compact; break;
            case DisplayDensity.compact: this.displayDensityOptions.displayDensity = DisplayDensity.cosy; break;
            case DisplayDensity.cosy: this.displayDensityOptions.displayDensity = DisplayDensity.comfortable; break;
        }
    }
}
