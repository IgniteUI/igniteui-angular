import { Component, ViewChild, OnInit, HostBinding } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { TreeGridLoadOnDemandService } from './tree-grid-load-on-demand.service';
import { GridSearchBoxComponent } from '../grid-search-box/grid-search-box.component';
import { IgxSummaryOperand, IgxSummaryResult, IgxButtonGroupComponent, IgxTreeGridComponent, IgxGridToolbarComponent, IgxGridToolbarActionsComponent, IgxGridToolbarPinningComponent, IgxGridToolbarHidingComponent, IgxGridToolbarAdvancedFilteringComponent, IgxGridToolbarExporterComponent, IgxExcelTextDirective, IgxCSVTextDirective, IgxColumnComponent, IgxSwitchComponent, IgxButtonDirective, GridSummaryCalculationMode, IgxExcelExporterService, IgxCsvExporterService, GridSelectionMode, IgxExcelExporterOptions, IgxCsvExporterOptions, CsvFileTypes, IgxPaginatorComponent } from 'igniteui-angular';


export class MySummaryOperand extends IgxSummaryOperand {
    public override operate(data: any[] = []): IgxSummaryResult[] {
        return [{
            key: 'count',
            label: 'Count',
            summaryResult: IgxSummaryOperand.count(data)
        }, {
            key: 'countIf',
            label: 'Count If',
            summaryResult: data.filter(r => r > 10).length
        }];
    }
}

@Component({
    selector: 'app-tree-grid-load-on-demand-sample',
    styleUrls: ['tree-grid-load-on-demand.sample.scss'],
    templateUrl: 'tree-grid-load-on-demand.sample.html',
    imports: [IgxButtonGroupComponent, IgxTreeGridComponent, IgxGridToolbarComponent, GridSearchBoxComponent, IgxGridToolbarActionsComponent, IgxGridToolbarPinningComponent, IgxGridToolbarHidingComponent, IgxGridToolbarAdvancedFilteringComponent, IgxGridToolbarExporterComponent, IgxExcelTextDirective, IgxCSVTextDirective, NgFor, IgxColumnComponent, IgxSwitchComponent, FormsModule, NgIf, IgxPaginatorComponent, IgxButtonDirective]
})
export class TreeGridLoadOnDemandSampleComponent implements OnInit {
    @HostBinding('style.--ig-size')
    protected get sizeStyle() {
        return `var(--ig-size-${this.size})`;
    }
    @ViewChild('grid1', { static: true }) public grid1: IgxTreeGridComponent;

    public data1: Array<any>;
    public data2: Array<any>;
    public columns: Array<any>;
    public summaryMode: GridSummaryCalculationMode = GridSummaryCalculationMode.rootLevelOnly;
    public summaryModes = [];
    public selectionMode;

    public size = 'large';
    public sizes;
    private dataService = new TreeGridLoadOnDemandService();
    private nextRow = 1;
    public paging = false;

    constructor(private excelExporterService: IgxExcelExporterService,
                private csvExporterService: IgxCsvExporterService) {
    }

    public ngOnInit(): void {
        this.selectionMode = GridSelectionMode.multiple;
        this.sizes = [
            { label: 'small', selected: this.size === 'small', togglable: true },
            { label: 'medium', selected: this.size === 'medium', togglable: true },
            { label: 'large', selected: this.size === 'large', togglable: true }
        ];
        this.summaryModes = [
            { label: 'rootLevelOnly', selected: this.summaryMode === 'rootLevelOnly', togglable: true },
            { label: 'childLevelsOnly', selected: this.summaryMode === 'childLevelsOnly', togglable: true },
            { label: 'rootAndChildLevels', selected: this.summaryMode === 'rootAndChildLevels', togglable: true }
        ];

        this.columns = [
            // { field: 'employeeID', label: 'ID', width: 200, resizable: true, dataType: 'number', hasSummary: false },
            { field: 'firstName', label: 'First Name', width: 300, resizable: true, dataType: 'string', hasSummary: false },
            { field: 'lastName', label: 'Last Name', width: 150, resizable: true, dataType: 'string', hasSummary: false },
            { field: 'Title', label: 'Title', width: 200, resizable: true, dataType: 'string', hasSummary: true },
            { field: 'Salary', label: 'Salary', width: 200, resizable: true, dataType: 'number', hasSummary: false }
        ];
        this.data1 = [];
        this.data2 = [];
        this.dataService.getData(-1, children => {
            this.data1 = children.slice();
            this.data2 = children.slice();
        });
    }

    public loadChildren = (parentID: any, done: (children: any[]) => void) => {
        this.dataService.getData(parentID, children => done(children));
    };

    public addRow() {
        this.grid1.addRow({
            employeeID: this.data1.length + this.nextRow++,
            PID: -1,
            firstName: 'John',
            lastName: 'Doe',
            Title: 'Junior Sales Representative'
        });
    }

    public addChildRow() {
        const selectedRowId = this.grid1.selectedRows[0];
        const parent = this.grid1.records.get(selectedRowId).data;

        if (!parent[this.grid1.hasChildrenKey]) {
            parent[this.grid1.hasChildrenKey] = true;
        }

        this.grid1.addRow(
            {
                employeeID: this.data1.length + this.nextRow++,
                firstName: `Added `,
                lastName: 'Added',
                Title: 'Sales Manager'
            },
            selectedRowId);
    }

    public deleteRow() {
        this.grid1.deleteRow(this.grid1.selectedRows[0]);
    }

    public selectDensity(event) {
        this.size = this.sizes[event.index].label;
    }

    public selectSummaryMode(event) {
        this.summaryMode = this.summaryModes[event.index].label;
    }

    public disableSummary() {
        const name = 'Salary';
        const col = this.grid1.getColumnByName(name);
        // col.hasSummary = !col.hasSummary;
        // col.summaries = MySummaryOperand;

        if (col.hasSummary) {
            this.grid1.disableSummaries(name);
        } else {
            this.grid1.enableSummaries([{ fieldName: name, customSummary: MySummaryOperand }]);
        }
    }

    public undo() {
        this.grid1.transactions.undo();
    }

    public redo() {
        this.grid1.transactions.redo();
    }

    public commit() {
        this.grid1.transactions.commit(this.data1);
    }

    public exportToExcel() {
        this.excelExporterService.export(this.grid1, new IgxExcelExporterOptions('TreeGrid'));
    }

    public exportToCSV() {
        this.csvExporterService.export(this.grid1, new IgxCsvExporterOptions('TreeGrid', CsvFileTypes.CSV));
    }
}
