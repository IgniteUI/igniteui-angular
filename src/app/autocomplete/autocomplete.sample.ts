import { Component, PipeTransform, Pipe, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, Validators, FormGroup } from '@angular/forms';
import { worldInfo, attractions } from './data';
import { IgxDialogComponent } from 'igniteui-angular';

@Component({
    selector: 'app-autocomplete-sample',
    styleUrls: ['autocomplete.sample.css'],
    templateUrl: `autocomplete.sample.html`
})
export class AutocompleteSampleComponent {
    @ViewChild('alert', { read: IgxDialogComponent }) public alert: IgxDialogComponent;
    public travel: FormGroup;
    worldInfo;
    attractions;

    constructor(fb: FormBuilder) {
        this.worldInfo = worldInfo;
        this.attractions = attractions;

        this.travel = fb.group({
            country: new FormControl('', Validators.required),
            attraction: new FormControl('', Validators.required),
        });
    }

    onSearch() {
        this.alert.message = 'You can visit ' + Math.floor(Math.random() * 100) + ' ' + this.travel.value.attraction +
            ' in ' + this.travel.value.country;
        this.alert.open();
    }
}

@Pipe({ name: 'contains' })
export class AutocompletePipeContains implements PipeTransform {

    public transform = (items: any[], term = '') => this.filterItems(items, term);

    protected filterItems = (items: any[], term: string) =>
        items.filter((item) =>
            (item.name ? item.name : item).toString().toLowerCase().indexOf(term.toString().toLowerCase()) > -1)
}

@Pipe({ name: 'groupContains' })
export class AutocompleteGroupPipeContains extends AutocompletePipeContains implements PipeTransform {

    public transform = (continents: any[], term = '') => this.filterContinents(continents, term);

    private filterContinents = (countries: any[], term = '') =>
        countries.filter((continent) => this.filterItems(continent.countries, term).length > 0)
}
