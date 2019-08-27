import { Component, Inject } from '@angular/core';
import { DisplayDensityToken, DisplayDensity, IDisplayDensityOptions } from 'projects/igniteui-angular/src/lib/core/displayDensity';

@Component({
    // tslint:disable-next-line:component-selector
    selector: 'input-group-fluent-sample',
    styleUrls: ['input-group.sample.css'],
    templateUrl: 'input-group-fluent.sample.html',
    providers: [{ provide: DisplayDensityToken, useValue: { displayDensity: DisplayDensity.compact} }]
})

export class InputGroupFluentSampleComponent {
    public user = {
        firstName: 'Koke',
        lastName: 'Duduka'
    };
    public inputType = 'fluent';
    public inputSearchType = 'fluent_search';
    date = new Date();
    constructor(@Inject(DisplayDensityToken) public displayDensityOptions: IDisplayDensityOptions) {}
    public value: 'opt1';

    changeDisplayDensity() {
        switch (this.displayDensityOptions.displayDensity) {
            case DisplayDensity.comfortable: this.displayDensityOptions.displayDensity = DisplayDensity.compact; break;
            case DisplayDensity.compact: this.displayDensityOptions.displayDensity = DisplayDensity.cosy; break;
            case DisplayDensity.cosy: this.displayDensityOptions.displayDensity = DisplayDensity.comfortable; break;
        }
    }
    changeInputType() {
        if (this.inputType === 'fluent') {
            this.inputType = 'box';
        } else if (this.inputType === 'box') {
            this.inputType = 'fluent';
        }
        if (this.inputSearchType === 'fluent_search') {
            this.inputSearchType = 'search';
        } else if (this.inputSearchType === 'search') {
            this.inputSearchType = 'fluent_search';
        }
    }
}
