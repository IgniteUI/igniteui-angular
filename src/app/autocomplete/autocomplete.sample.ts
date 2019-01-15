import { Component } from '@angular/core';

@Component({
    selector: 'app-autocomplete-sample',
    styleUrls: ['autocomplete.sample.css'],
    templateUrl: `autocomplete.sample.html`
})
export class AutocompleteSampleComponent {
    placeholder = 'Please enter a value';

    info;
    towns;
    townsDetailed;

    constructor() {
        this.towns = [
            'Jambol',
            'Topolovgrad',
            'Kermen',
            'Bolyarovo'
        ];

        this.townsDetailed = [
            { id: 1, name: 'Jambol'},
            { id: 2, name: 'Topolovgrad'},
            { id: 3, name: 'Kermen'},
            { id: 4, name: 'Bolyarovo'}
        ];

        this.info = {
            town: this.towns[0]
        };
    }
}
