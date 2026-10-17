import { ChangeDetectionStrategy, ChangeDetectorRef, Component, inject, OnInit, QueryList, ViewChildren } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ISimpleComboSelectionChangingEventArgs, IgxSimpleComboComponent } from 'igniteui-angular/simple-combo';
import { IgxGridComponent } from 'igniteui-angular/grids/grid';
import { IgxCellTemplateDirective, IgxColumnComponent } from 'igniteui-angular/grids/core';
import { IgxLinearProgressBarComponent } from 'igniteui-angular/progressbar';
import { Country, getCitiesByCountry, getCountries } from './cities.data';

/** Rows start empty - the whole point of the sample is filling them through the combos. */
const DATA: any[] = [
    { ID: 1, Country: '', Region: '', City: '' },
    { ID: 2, Country: '', Region: '', City: '' },
    { ID: 3, Country: '', Region: '', City: '' }
];

@Component({
    selector: 'app-grid-cascading-combos',
    styleUrls: ['grid-cascading-combos.sample.scss'],
    templateUrl: 'grid-cascading-combos.sample.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [IgxGridComponent, IgxColumnComponent, IgxCellTemplateDirective, IgxSimpleComboComponent, FormsModule, IgxLinearProgressBarComponent]
})
export class GridCascadingCombosSampleComponent implements OnInit {
    private cdr = inject(ChangeDetectorRef);

    @ViewChildren(IgxSimpleComboComponent)
    public combos: QueryList<IgxSimpleComboComponent>;

    public selectedCountryName: string;
    public selectedRegionName: string;
    public selectedCityId: number;
    public countriesData: Country[];
    private loadingTime = 0;
    public data;

    public ngOnInit() {
        this.data = DATA;
        this.countriesData = getCountries([
            'United States',
            'Japan',
            'United Kingdom'
        ]);
    }

    public countryChanging(e: ISimpleComboSelectionChangingEventArgs, cell) {
        const ID = cell.row.data.ID;
        cell.row.data.loadingRegion = true;
        const nextRegionCombo = this.combos.filter(
            (combo) => combo.id === 'region-' + ID
        )[0];
        const nextCityCombo = this.combos.filter(
            (combo) => combo.id === 'city-' + ID
        )[0];
        this.clearOldData(cell, nextRegionCombo, nextCityCombo);
        this.selectedCountryName = e.newValue;
        cell.update(e.newValue ? e.newValue : '');
        if (e.newValue) {
            this.loadingTime = 2000;
        }
        setTimeout(() => {
            nextRegionCombo.data = getCitiesByCountry([this.selectedCountryName])
                .map((c) => ({ name: c.region, country: c.country }))
                .filter((v, i, a) => a.findIndex((r) => r.name === v.name) === i);
            cell.row.data.loadingRegion = false;
            this.cdr.markForCheck();
        }, this.loadingTime);
        this.selectedRegionName = null;
        this.selectedCityId = null;
        this.loadingTime = 0;
    }

    public regionChanging(e: ISimpleComboSelectionChangingEventArgs, cell) {
        const nextComboID = 'city-' + cell.row.data.ID;
        cell.row.data.loadingCity = true;
        const cityCombo = this.combos.filter(
            (combo) => combo.id === nextComboID
        )[0];
        this.clearOldData(cell, null, cityCombo);

        this.selectedRegionName = e.newValue;
        cell.update(e.newValue ? e.newValue : '');
        if (e.newValue) {
            this.loadingTime = 2000;
        }
        setTimeout(() => {
            cityCombo.data = getCitiesByCountry([this.selectedCountryName]).filter(
                (c) => c.region === this.selectedRegionName
            );
            cell.row.data.loadingCity = false;
            this.cdr.markForCheck();
        }, this.loadingTime);
        this.selectedCityId = null;
        this.loadingTime = 0;
    }

    public cityChanging(e: ISimpleComboSelectionChangingEventArgs, cell) {
        cell.update(e.newValue);
        this.selectedCityId = e.newValue;
    }

    private clearOldData(cell, RegionCombo, CityCombo) {
        const nextCellIndex = cell.column.visibleIndex + 1;
        cell.row.cells[nextCellIndex].update('');

        if (CityCombo !== null) {
            CityCombo.data = [];
        }
        if (RegionCombo !== null) {
            RegionCombo.data = [];
            cell.row.cells[nextCellIndex + 1].update('');
        }
    }
}
