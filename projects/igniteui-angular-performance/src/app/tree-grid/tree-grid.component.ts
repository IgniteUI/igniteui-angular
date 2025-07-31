import { Component, inject, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { GridColumnDataType, IgxColumnComponent, IgxTreeGridComponent } from 'igniteui-angular';
import { DataService } from '../services/data.service';

@Component({
    selector: 'app-tree-grid',
    imports: [IgxTreeGridComponent, IgxColumnComponent],
    templateUrl: './tree-grid.component.html',
    styleUrl: './tree-grid.component.scss'
})
export class TreeGridComponent {
    protected columns: any[] = []
    protected data: any[] = [];
    protected performanceDataList: PerformanceEntryList = [];
    private dataService = inject(DataService);
    private activatedRoute = inject(ActivatedRoute);

    @ViewChild(IgxTreeGridComponent, { static: true })
    public grid: IgxTreeGridComponent;

    constructor() {
        this.data = this.dataService.generateTreeData(this.activatedRoute.snapshot.data.rows)
        this.columns = [
            { field: "ID", dataType: GridColumnDataType.Number, sortable: true, width: 'auto', groupable: true },
            { field: "Name", dataType: GridColumnDataType.String, sortable: true, width: 'auto', groupable: true },
            { field: "Age", dataType: GridColumnDataType.Number, sortable: true, width: 'auto', groupable: true },
            { field: "HireDate", dataType: GridColumnDataType.Date, sortable: true, width: 'auto', groupable: true },
            { field: "Title", dataType: GridColumnDataType.String, sortable: true, width: 'auto', groupable: true },
            { field: "CheckedIn", dataType: GridColumnDataType.Time, sortable: true, width: 'auto', groupable: true },
            { field: "PTO", dataType: GridColumnDataType.Boolean, sortable: true, width: 'auto', groupable: true },
            { field: "GrossSalary", dataType: GridColumnDataType.Currency, sortable: true, width: 'auto', groupable: true },
            { field: "Avatar", dataType: GridColumnDataType.Image, sortable: true, width: 'auto', groupable: true },
            { field: "CareerStart", dataType: GridColumnDataType.DateTime, sortable: true, width: 'auto', groupable: true },
            { field: "SuccessRate", dataType: GridColumnDataType.Percent, sortable: true, width: 'auto', groupable: true },
        ];
    }
}
