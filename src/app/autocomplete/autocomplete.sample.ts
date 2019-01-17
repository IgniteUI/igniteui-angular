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
    town;
    towns;
    townsDetailed;
    townsGrouped;

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

        this.townsGrouped = [
            { id: 0, name: 'Jambol', isHeader: true },
            { id: 1, name: 'Jambol', image: 'https://goo.gl/xxKw77'},
            { id: 2, name: 'Straldja', image: 'https://goo.gl/9XiRZb'},
            { id: 3, name: 'Haskovo', isHeader: true },
            { id: 4, name: 'Topolovgrad', image: 'https://goo.gl/UmhvYF'},
            { id: 5, name: 'Burgas', isHeader: true },
            { id: 6, name: 'Karnobat', image: 'https://goo.gl/VuWHvR'}
        ];
    }

    customSettings = {
        closeOnOutsideClick: false
    };

    customFilter = (value: any, term: any): boolean => {
        return value.name.toLowerCase().indexOf(term.toLowerCase()) > -1;
    }
}
