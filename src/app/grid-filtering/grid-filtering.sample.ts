import { IgxExcelExporterOptions } from './../../../projects/igniteui-angular/src/lib/services/excel/excel-exporter-options';
import { Component, ViewChild, OnInit, AfterViewInit } from '@angular/core';
import { IgxGridComponent, FilteringExpressionsTree, IgxStringFilteringOperand,
    FilteringLogic, IgxCheckboxComponent, IChangeCheckboxEventArgs, FilterMode, IgxCsvExporterService, IgxExcelExporterService } from 'igniteui-angular';

@Component({
    providers: [],
    selector: 'app-grid-filtering-sample',
    styleUrls: ['grid-filtering.sample.css'],
    templateUrl: 'grid-filtering.sample.html'
})
export class GridFilteringComponent implements OnInit {

    public data: Array<any>;
    public columns: Array<any>;
    public displayDensities;
    public filterModes;
    public density = 'comfortable';
    public advancedFilteringTree: FilteringExpressionsTree;

    @ViewChild('grid1', { static: true })
    public grid1: IgxGridComponent;

    @ViewChild('applyChangesCheckbox', { static: true })
    public applyChangesCheckbox: IgxCheckboxComponent;

    constructor(private csvExportService: IgxCsvExporterService, private excelExportService: IgxExcelExporterService) {
        // this.csvExportService.onExportEnded.pipe().subscribe(() => {
        //     console.log(new Date());
        // });

        // this.excelExportService.onExportEnded.pipe().subscribe(() => {
        //     console.log(new Date());
        // });
    }

    public ngOnInit(): void {
        this.displayDensities = [
            { label: 'comfortable', selected: this.density === 'comfortable', togglable: true },
            { label: 'cosy', selected: this.density === 'cosy', togglable: true },
            { label: 'compact', selected: this.density === 'compact', togglable: true }
        ];

        this.filterModes = [
            {
                label: 'Filter Row',
                value: FilterMode.quickFilter,
                selected: false,
                togglable: true },
            {
                label: 'Excel Style',
                value: FilterMode.excelStyleFilter,
                selected: true,
                togglable: true
            }
        ];

        this.columns = [
            { field: 'Region', width: 150, resizable: true, movable: true, type: 'number' },
            { field: 'ID', width: 80, resizable: true, movable: true, type: 'string' },
            { field: 'CompanyName', header: 'Company Name', width: 175, resizable: true, movable: true, type: 'string'},
            { field: 'ContactName', header: 'Contact Name', width: 175, resizable: true, movable: true, type: 'string' },
            { field: 'ContactTitle', header: 'Contact Title', width: 150, resizable: true, movable: true, type: 'string' },
            { field: 'Address', width: 150, resizable: true, movable: true, type: 'string' },
            { field: 'City', width: 150, resizable: true, movable: true, type: 'string' },
            { field: 'PostalCode', header: 'Postal Code', width: 150, resizable: true, movable: true, type: 'string' },
            { field: 'Country', header: 'Country', width: 150, resizable: true, movable: true, type: 'string' },
            { field: 'Phone', width: 150, resizable: true, movable: true, type: 'string' },
            { field: 'Region1', width: 150, resizable: true, movable: true, type: 'number' },
            { field: 'ID1', width: 80, resizable: true, movable: true, type: 'string' },
            { field: 'CompanyName1', header: 'Company Name1', width: 175, resizable: true, movable: true, type: 'string'},
            { field: 'ContactName1', header: 'Contact Name1', width: 175, resizable: true, movable: true, type: 'string' },
            { field: 'ContactTitle1', header: 'Contact Title1', width: 150, resizable: true, movable: true, type: 'string' },
            { field: 'Address1', width: 150, resizable: true, movable: true, type: 'string' },
            { field: 'City1', width: 150, resizable: true, movable: true, type: 'string' },
            { field: 'PostalCode1', header: 'Postal Code1', width: 150, resizable: true, movable: true, type: 'string' },
            { field: 'Country1', header: 'Country1', width: 150, resizable: true, movable: true, type: 'string' },
            { field: 'Phone1', width: 150, resizable: true, movable: true, type: 'string' }
        ];

        const count = 500000;
        const dataArray = new Array(count);
        for (let index = 0; index < count; index++) {
            const employee = {
                'Region': index,
                'ID': 'ALFKI | ' + index,
                'CompanyName': 'Alfreds Futterkiste | ' + index,
                'ContactName': 'Maria Anders | ' + index,
                'ContactTitle': 'Sales Representative | ' + index,
                'Address': 'Obere Str. 57 | ' + index,
                'City': 'Berlin | ' + index,
                'PostalCode': '12209 | ' + index,
                'Country': 'Germany | ' + index,
                'Phone': '030-0074321 | ' + index,
                'Region1': index,
                'ID1': 'ALFKI | ' + index,
                'CompanyName1': 'Alfreds Futterkiste | ' + index,
                'ContactName1': 'Maria Anders | ' + index,
                'ContactTitle1': 'Sales Representative | ' + index,
                'Address1': 'Obere Str. 57 | ' + index,
                'City1': 'Berlin | ' + index,
                'PostalCode1': '12209 | ' + index,
                'Country1': 'Germany | ' + index,
                'Phone1': '030-0074321 | ' + index,
            };
            dataArray[index] = employee;
        }

        this.data = dataArray;
    }

    public selectDensity(event) {
        this.density = this.displayDensities[event.index].label;
    }

    public selectFilterMode(event) {
        const filterMode = this.filterModes[event.index].value as FilterMode;
        if (filterMode !== this.grid1.filterMode) {
            this.grid1.filterMode = filterMode;
        }
    }

    public openAdvancedFiltering() {
        this.grid1.openAdvancedFilteringDialog();
    }

    public closeAdvancedFiltering() {
        this.grid1.closeAdvancedFilteringDialog(this.applyChangesCheckbox.checked);
    }

    public clearAdvancedFiltering() {
        this.grid1.advancedFilteringExpressionsTree = null;
    }

    public onAllowFilteringChanged(event: IChangeCheckboxEventArgs) {
        this.grid1.allowFiltering = event.checked;
    }
}
