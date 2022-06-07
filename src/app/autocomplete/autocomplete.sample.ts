import { Component, PipeTransform, Pipe, ViewChild } from '@angular/core';
import { UntypedFormBuilder, UntypedFormControl, Validators, UntypedFormGroup } from '@angular/forms';
import { worldInfo, attractions } from './data';
import { IgxDialogComponent } from 'igniteui-angular';

const ATTRACTIONS_CUSTOM_WIDTH = '300px';
@Component({
    selector: 'app-autocomplete-sample',
    styleUrls: ['autocomplete.sample.css'],
    templateUrl: `autocomplete.sample.html`
})
export class AutocompleteSampleComponent {
    @ViewChild('alert', { read: IgxDialogComponent, static: true })
    private alert: IgxDialogComponent;

    public travel: UntypedFormGroup;
    public worldInfo;
    public attractions;
    public attractionsWidth = '';

    constructor(fb: UntypedFormBuilder) {
        this.worldInfo = worldInfo;
        this.attractions = attractions;

        this.travel = fb.group({
            country: new UntypedFormControl('', Validators.required),
            attraction: new UntypedFormControl('', Validators.required),
        });
    }

    public onSearch() {
        if (filterGroupContains(this.worldInfo, this.travel.value.country, true).length > 0 &&
            filterContains(this.attractions, this.travel.value.attraction, true).length > 0) {
            this.alert.message = 'You can visit ' + (100 + Math.floor(Math.random() * 100)) + ' ' + this.travel.value.attraction +
                ' in ' + this.travel.value.country + '.';
        } else {
            this.alert.message = 'Please enter correct country and attraction.';
        }
        this.alert.open();
    }

    public changeDefaultWidth(event: any) {
        this.attractionsWidth = event.checked ? ATTRACTIONS_CUSTOM_WIDTH : '';
    }
}

@Pipe({ name: 'contains' })
export class AutocompletePipeContains implements PipeTransform {
    public transform = (items: any[], term = '') => filterContains(items, term);
}

@Pipe({ name: 'groupContains' })
export class AutocompleteGroupPipeContains implements PipeTransform {
    public transform = (continents: any[], term = '') => filterGroupContains(continents, term);
}

const filterContains = (items: any[], term: string, exactMatch = false): any[] => items.filter((item) => {
        const itm = (item.name ? item.name : item).toString().toLowerCase();
        const trm = term.toString().toLowerCase();
        return exactMatch ? itm === trm : itm.indexOf(trm) > -1;
    });

const filterGroupContains = (groupItems: any[], term = '', exactMatch = false): any[] =>
    groupItems.filter((groupItem) => filterContains(groupItem.countries, term, exactMatch).length > 0);
