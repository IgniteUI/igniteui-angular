import { Component, PipeTransform, Pipe, ViewChild, forwardRef } from '@angular/core';
import { UntypedFormBuilder, UntypedFormControl, Validators, UntypedFormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { worldInfo, attractions } from './data';
import { IgxDialogComponent } from 'igniteui-angular';
import { IgxSwitchComponent } from '../../../projects/igniteui-angular/src/lib/switch/switch.component';
import { IgxButtonDirective } from '../../../projects/igniteui-angular/src/lib/directives/button/button.directive';
import { IgxDialogComponent as IgxDialogComponent_1 } from '../../../projects/igniteui-angular/src/lib/dialog/dialog.component';
import { IgxDropDownItemComponent } from '../../../projects/igniteui-angular/src/lib/drop-down/drop-down-item.component';
import { IgxDropDownGroupComponent } from '../../../projects/igniteui-angular/src/lib/drop-down/drop-down-group.component';
import { NgFor } from '@angular/common';
import { IgxDropDownComponent } from '../../../projects/igniteui-angular/src/lib/drop-down/drop-down.component';
import { IgxAutocompleteDirective } from '../../../projects/igniteui-angular/src/lib/directives/autocomplete/autocomplete.directive';
import { IgxInputDirective } from '../../../projects/igniteui-angular/src/lib/directives/input/input.directive';
import { IgxIconComponent } from '../../../projects/igniteui-angular/src/lib/icon/icon.component';
import { IgxPrefixDirective } from '../../../projects/igniteui-angular/src/lib/directives/prefix/prefix.directive';
import { IgxInputGroupComponent } from '../../../projects/igniteui-angular/src/lib/input-group/input-group.component';

const ATTRACTIONS_CUSTOM_WIDTH = '300px';
@Component({
    selector: 'app-autocomplete-sample',
    styleUrls: ['autocomplete.sample.css'],
    templateUrl: `autocomplete.sample.html`,
    standalone: true,
    imports: [FormsModule, ReactiveFormsModule, IgxInputGroupComponent, IgxPrefixDirective, IgxIconComponent, IgxInputDirective, IgxAutocompleteDirective, IgxDropDownComponent, NgFor, IgxDropDownGroupComponent, IgxDropDownItemComponent, IgxDialogComponent_1, IgxButtonDirective, IgxSwitchComponent, forwardRef(() => AutocompletePipeContains), forwardRef(() => AutocompleteGroupPipeContains)]
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

@Pipe({
    name: 'contains',
    standalone: true
})
export class AutocompletePipeContains implements PipeTransform {
    public transform = (items: any[], term = '') => filterContains(items, term);
}

@Pipe({
    name: 'groupContains',
    standalone: true
})
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
