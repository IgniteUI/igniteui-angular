import { Component, ViewChild, OnInit } from '@angular/core';
import { IgxTreeGridComponent, IgxExcelExporterService, IgxCsvExporterService,
    IgxCsvExporterOptions, IgxExcelExporterOptions, CsvFileTypes, GridSelectionMode, DisplayDensity, HierarchicalFilteringStrategy } from 'igniteui-angular';
import { HIERARCHICAL_SAMPLE_DATA } from '../shared/sample-data';

@Component({
    providers: [],
    selector: 'app-tree-grid-sample',
    styleUrls: ['tree-grid.sample.css'],
    templateUrl: 'tree-grid.sample.html'
})

export class TreeGridSampleComponent implements OnInit {
    @ViewChild('grid1', { static: true }) public grid1: IgxTreeGridComponent;

    public data: Array<any>;
    public columns: Array<any>;
    public selectionMode;
    public density: DisplayDensity = 'compact';
    public displayDensities;
    public selectionModes: GridSelectionMode[] = ['none', 'single', 'multiple', 'multipleCascade'];

    public hierarchicalFilterStrategy: HierarchicalFilteringStrategy;

    constructor(private excelExporterService: IgxExcelExporterService,
        private csvExporterService: IgxCsvExporterService) {
            this.hierarchicalFilterStrategy = new HierarchicalFilteringStrategy(['ID']);
    }
    
    public ngOnInit(): void {
        this.selectionMode = GridSelectionMode.multiple;
        this.displayDensities = [
            { label: 'compact', selected: this.density === 'compact', togglable: true },
            { label: 'cosy', selected: this.density === 'cosy', togglable: true },
            { label: 'comfortable', selected: this.density === 'comfortable', togglable: true }
        ];

        this.columns = [
            { field: 'ID', width: 150, resizable: true, pinned: true },
            { field: 'CompanyName', width: 150, resizable: true },
            { field: 'ContactName', width: 150, resizable: true },
            { field: 'ContactTitle', width: 150, resizable: true },
            { field: 'Address', width: 150, resizable: true },
            { field: 'City', width: 150, resizable: true },
            { field: 'Region', width: 150, resizable: true },
            { field: 'PostalCode', width: 150, resizable: true },
            { field: 'Phone', width: 150, resizable: true },
            { field: 'Fax', width: 150, resizable: true }
        ];
        this.data = HIERARCHICAL_SAMPLE_DATA.slice(0);
    }

    public selectDensity(event) {
        this.density = this.displayDensities[event.index].label;
    }

    public exportToExcel() {
        this.excelExporterService.export(this.grid1, new IgxExcelExporterOptions('TreeGrid'));
    }

    public exportToCSV() {
        this.csvExporterService.export(this.grid1, new IgxCsvExporterOptions('TreeGrid', CsvFileTypes.CSV));
    }
}
