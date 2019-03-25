import { Component } from '@angular/core';

@Component({
    // tslint:disable-next-line:component-selector
    selector: 'input-group-sample',
    styleUrls: ['input-group.sample.css'],
    templateUrl: 'input-group.sample.html'
})
export class InputGroupSampleComponent {
    public user = {
        firstName: 'Oke',
        lastName: 'Nduka'
    };

    public isRequired = true;
    public value = '';

    public toggleRequired() {
        this.isRequired = !this.isRequired;
    }
}
