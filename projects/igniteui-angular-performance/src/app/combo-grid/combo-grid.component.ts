import { ChangeDetectionStrategy, Component, inject, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { GridColumnDataType, IGX_GRID_DIRECTIVES, IgxGridComponent } from 'igniteui-angular';
import { IgxComboComponent } from 'igniteui-angular';
import { DataService } from '../services/data.service';

/** One combo entry, kept small so a million of them stay affordable. */
interface ComboRecord {
    id: number;
    name: string;
}

@Component({
    selector: 'app-combo-grid',
    imports: [IGX_GRID_DIRECTIVES, IgxComboComponent],
    templateUrl: './combo-grid.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    styleUrl: './combo-grid.component.scss'
})
export class ComboGridComponent {
    protected columns: any[] = [];
    protected data: any[] = [];
    protected comboData: ComboRecord[] = [];
    protected rows: number;

    private dataService = inject(DataService);
    private activatedRoute = inject(ActivatedRoute);

    @ViewChild(IgxGridComponent, { static: true })
    public grid!: IgxGridComponent;

    constructor() {
        this.rows = this.activatedRoute.snapshot.data.rows;

        this.data = this.dataService.generateData(this.rows);
        // A value per row and no two alike, so opening the Excel filter on this column has
        // to list the whole collection rather than a handful of repeated entries.
        this.data.forEach((row, index) => row.UniqueValue = index);

        this.comboData = Array.from({ length: this.rows }, (_, index) => ({
            id: index,
            name: `Item ${index}`
        }));

        this.columns = [
            { field: 'UniqueValue', dataType: GridColumnDataType.Number, sortable: true, width: 'auto', groupable: false },
            { field: 'Name', dataType: GridColumnDataType.String, sortable: true, width: 'auto', groupable: true },
            { field: 'AthleteNumber', dataType: GridColumnDataType.Number, sortable: true, width: 'auto', groupable: true },
            { field: 'CountryName', dataType: GridColumnDataType.String, sortable: true, width: 'auto', groupable: true },
            { field: 'Registered', dataType: GridColumnDataType.DateTime, sortable: true, width: 'auto', groupable: true },
            { field: 'Active', dataType: GridColumnDataType.Boolean, sortable: true, width: 'auto', groupable: true },
            { field: 'NetWorth', dataType: GridColumnDataType.Currency, sortable: true, width: 'auto', groupable: true },
            { field: 'SuccessRate', dataType: GridColumnDataType.Percent, sortable: true, width: 'auto', groupable: true },
            { field: 'Position', dataType: GridColumnDataType.String, sortable: true, width: 'auto', groupable: true }
        ];
    }
}
