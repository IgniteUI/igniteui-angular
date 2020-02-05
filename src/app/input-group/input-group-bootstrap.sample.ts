import { Component, Inject, ViewEncapsulation } from '@angular/core';
import { DisplayDensityToken, DisplayDensity, IDisplayDensityOptions } from 'igniteui-angular';

@Component({
    encapsulation: ViewEncapsulation.None,
    // tslint:disable-next-line:component-selector
    selector: 'input-group-bootstrap-sample',
    templateUrl: 'input-group-bootstrap.sample.html',
    providers: [{ provide: DisplayDensityToken, useValue: { displayDensity: DisplayDensity.compact} }]
})
export class InputGroupBoostrapSampleComponent {
    public date = new Date();
    public user = {
        firstName: 'Koke',
        lastName: 'Duduka'
    };

    constructor(@Inject(DisplayDensityToken) public ddOptions: IDisplayDensityOptions) {}

    changeDisplayDensity() {
        switch (this.ddOptions.displayDensity) {
            case DisplayDensity.comfortable:
                this.ddOptions.displayDensity = DisplayDensity.compact;
                break;

            case DisplayDensity.compact:
                this.ddOptions.displayDensity = DisplayDensity.cosy;
                break;

            case DisplayDensity.cosy:
                this.ddOptions.displayDensity = DisplayDensity.comfortable;
                break;

            default:
                this.ddOptions.displayDensity = DisplayDensity.comfortable;
        }
    }
}

