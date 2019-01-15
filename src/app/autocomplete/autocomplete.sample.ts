import { Component } from '@angular/core';
import { IGX_DROPDOWN_BASE } from 'projects/igniteui-angular/src/lib/drop-down/drop-down.common';
import { IgxAutocompleteDropDownComponent
    } from 'projects/igniteui-angular/src/lib/directives/autocomplete/autocomplete.dropdown.component';

@Component({
    selector: 'app-autocomplete-sample',
    styleUrls: ['autocomplete.sample.css'],
    templateUrl: `autocomplete.sample.html`,
    providers: [{ provide: IGX_DROPDOWN_BASE, useClass: IgxAutocompleteDropDownComponent }] // ?
})
export class AutocompleteSampleComponent {
    placeholder = 'Please enter a value';

    info;
    town;
    towns;
    townsDetailed;

    constructor() {
        this.towns = [
            'Jambol',
            'Topolovgrad',
            'Straldja',
            'Karnobat'
        ];

        this.townsDetailed = [
            { id: 1, name: 'Jambol', image: 'https://goo.gl/xxKw77'},
            { id: 2, name: 'Topolovgrad', image: 'https://goo.gl/UmhvYF'},
            { id: 3, name: 'Straldja', image: 'https://goo.gl/9XiRZb'},
            { id: 4, name: 'Karnobat', image: 'https://goo.gl/VuWHvR'}
        ];
    }
}
