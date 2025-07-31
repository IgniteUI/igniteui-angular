import { Component, inject, ViewChild } from '@angular/core';
import { GridColumnDataType, IGX_GRID_DIRECTIVES, IgxGridComponent } from "igniteui-angular"
import { DataService } from '../services/data.service';
import { ActivatedRoute } from '@angular/router';

@Component({
    selector: 'app-grid',
    imports: [IGX_GRID_DIRECTIVES],
    templateUrl: './grid.component.html',
    styleUrl: './grid.component.scss'
})
export class GridComponent {
    protected columns: any[] = []
    protected data: any[] = [];
    protected performanceDataList: PerformanceEntryList = [];
    private dataService = inject(DataService);
    private activatedRoute = inject(ActivatedRoute);

    @ViewChild(IgxGridComponent, { static: true })
    public grid: IgxGridComponent;

    constructor() {
        this.data = this.dataService.generateData(this.activatedRoute.snapshot.data.rows)
        this.columns = [
            { field: "Id", dataType: GridColumnDataType.Number, sortable: true, width: 'auto', groupable: true },
            { field: "Name", dataType: GridColumnDataType.String, sortable: true, width: 'auto', groupable: true },
            { field: "AthleteNumber", dataType: GridColumnDataType.Number, sortable: true, width: 'auto', groupable: true },
            { field: "Registered", dataType: GridColumnDataType.DateTime, sortable: true, width: 'auto', groupable: true },
            { field: "CountryName", dataType: GridColumnDataType.String, sortable: true, width: 'auto', groupable: true },
            { field: "FirstAppearance", dataType: GridColumnDataType.Time, sortable: true, width: 'auto', groupable: true },
            { field: "CareerStart", dataType: GridColumnDataType.Date, sortable: true, width: 'auto', groupable: true },
            { field: "Active", dataType: GridColumnDataType.Boolean, sortable: true, width: 'auto', groupable: true },
            { field: "NetWorth", dataType: GridColumnDataType.Currency, sortable: true, width: 'auto', groupable: true },
            { field: "CountryFlag", dataType: GridColumnDataType.Image, sortable: true, width: 'auto', groupable: true },
            { field: "SuccessRate", dataType: GridColumnDataType.Percent, sortable: true, width: 'auto', groupable: true },
            { field: "Position", dataType: GridColumnDataType.String, sortable: true, width: 'auto', groupable: true },
        ];
    }
}
