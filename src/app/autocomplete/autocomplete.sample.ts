import { Component } from '@angular/core';

@Component({
    selector: 'app-autocomplete-sample',
    styleUrls: ['autocomplete.sample.css'],
    templateUrl: `autocomplete.sample.html`
})
export class AutocompleteSampleComponent {
    placeholder = 'Please enter a value';

    user = {
        comment: '',
        firstName: 'John',
        gender: 'Male',
        lastName: 'Doe',
        password: '1337s3cr3t',
        registered: false,
        subscribed: false
    };

    items;
    itemsObj;

    constructor() {
        this.items = [
            'Jambol',
            'Topolovgrad',
            'Kermen',
            'Bolyarovo'
        ];

        this.itemsObj = [
            { id: 1, name: 'Jambol'},
            { id: 2, name: 'Topolovgrad'},
            { id: 3, name: 'Kermen'},
            { id: 4, name: 'Bolyarovo'}
        ];
    }
}
