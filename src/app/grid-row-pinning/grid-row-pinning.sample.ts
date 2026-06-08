import { Component, OnInit, ViewChild, AfterViewInit, HostBinding } from '@angular/core';

import {
    IgxGridComponent,
    ColumnPinningPosition,
    RowPinningPosition,
    IgxGridStateDirective,
    IgxExcelExporterService,
    IgxExcelExporterOptions,
    GridSelectionMode,
    IPinningConfig,
    IgxIconService,
    RowType,
    IGX_HIERARCHICAL_GRID_DIRECTIVES,
    IgxTreeGridComponent,
    IgxIconComponent,
    IgxSwitchComponent,
    IgxButtonDirective
} from 'igniteui-angular';
import { pinLeft, unpinLeft } from '@igniteui/material-icons-extended';
import { GridSearchBoxComponent } from '../grid-search-box/grid-search-box.component';
import { SAMPLE_DATA } from '../shared/sample-data';

@Component({
    selector: 'app-grid-row-pinning-sample',
    styleUrls: ['grid-row-pinning.sample.scss'],
    templateUrl: 'grid-row-pinning.sample.html',
    providers: [
        IgxIconService
    ],
    imports: [IGX_HIERARCHICAL_GRID_DIRECTIVES, IgxGridComponent, IgxTreeGridComponent, IgxIconComponent, GridSearchBoxComponent, IgxSwitchComponent, IgxButtonDirective]
})

export class GridRowPinningSampleComponent implements OnInit, AfterViewInit {
    @HostBinding('style.--ig-size')
    protected get sizeStyle() {
        return `var(--ig-size-${this.size})`;
    }
    @ViewChild('grid1', { static: true })
    private grid1: IgxGridComponent;

    @ViewChild(IgxGridStateDirective, { static: true })
    private state: IgxGridStateDirective;

    public pinningConfig: IPinningConfig = { columns: ColumnPinningPosition.Start };

    public options = {
        cellSelection: true,
        rowSelection: true,
        filtering: true,
        advancedFiltering: true,
        paging: true,
        sorting: true,
        groupBy: true,
        columns: false,
        rowPinning: true,
        pinningConfig: true
    };
    public selectionMode;
    public size = 'large';
    public data: any[];
    public hierarchicalData: any[];
    public columns: any[];
    public hColumns: any[];
    public treeColumns: any[];
    public treeData: any[];

    constructor(
                private iconService: IgxIconService,
                private excelExportService: IgxExcelExporterService) {
    }

    public onRowChange() {
        if (this.pinningConfig.rows === RowPinningPosition.Bottom) {
            this.pinningConfig = { columns: this.pinningConfig.columns, rows: RowPinningPosition.Top };
        } else {
            this.pinningConfig = { columns: this.pinningConfig.columns, rows: RowPinningPosition.Bottom };
        }
    }

    public onChange() {
        if (this.pinningConfig.columns === ColumnPinningPosition.End) {
            this.pinningConfig = { columns: ColumnPinningPosition.Start, rows: this.pinningConfig.rows };
        } else {
            this.pinningConfig = { columns: ColumnPinningPosition.End, rows: this.pinningConfig.rows };
        }
    }

    public ngOnInit(): void {
        this.columns = [
            { field: 'ID', width: '200px', hidden: true },
            { field: 'CompanyName', width: '200px', groupable: true },
            { field: 'ContactName', width: '200px', pinned: false, groupable: true },
            { field: 'ContactTitle', width: '300px', pinned: false, groupable: true },
            { field: 'Address', width: '250px' },
            { field: 'City', width: '200px' },
            { field: 'Region', width: '300px' },
            { field: 'PostalCode', width: '150px' },
            { field: 'Phone', width: '200px' },
            { field: 'Fax', width: '200px' }
        ];

        this.hColumns = [
            { field: 'ID', width: '200px' },
            { field: 'ChildLevels', width: '200px' },
            { field: 'ProductName', width: '200px' },
            { field: 'Col1', width: '200px' },
            { field: 'Col2', width: '200px' },
            { field: 'Col3', width: '200px' },
            { field: 'childData', width: '200px' },
            { field: 'childData2', width: '200px' },
            { field: 'hasChild', width: '200px' }
        ];

        this.data = SAMPLE_DATA;
        this.hierarchicalData = this.generateDataUneven(100, 3);

        // treegrid cols and data
        this.treeColumns = [
            { field: 'employeeID', label: 'ID', width: 200, resizable: true, dataType: 'number', hasSummary: false },
            { field: 'Salary', label: 'Salary', width: 200, resizable: true, dataType: 'number', hasSummary: true },
            { field: 'firstName', label: 'First Name', width: 300, resizable: true, dataType: 'string', hasSummary: false },
            { field: 'lastName', label: 'Last Name', width: 150, resizable: true, dataType: 'string', hasSummary: false },
            { field: 'Title', label: 'Title', width: 200, resizable: true, dataType: 'string', hasSummary: true }
        ];
        this.treeData = [
            { Salary: 2500, employeeID: 0, PID: -1, firstName: 'Andrew', lastName: 'Fuller', Title: 'Vice President, Sales' },
            { Salary: 3500, employeeID: 1, PID: -1, firstName: 'Jonathan', lastName: 'Smith', Title: 'Human resources' },
            { Salary: 1500, employeeID: 2, PID: -1, firstName: 'Nancy', lastName: 'Davolio', Title: 'CFO' },
            { Salary: 2500, employeeID: 3, PID: -1, firstName: 'Steven', lastName: 'Buchanan', Title: 'CTO' },
            // sub of ID 0
            { Salary: 2500, employeeID: 4, PID: 0, firstName: 'Janet', lastName: 'Leverling', Title: 'Sales Manager' },
            { Salary: 3500, employeeID: 5, PID: 0, firstName: 'Laura', lastName: 'Callahan', Title: 'Inside Sales Coordinator' },
            { Salary: 1500, employeeID: 6, PID: 0, firstName: 'Margaret', lastName: 'Peacock', Title: 'Sales Representative' },
            { Salary: 2500, employeeID: 7, PID: 0, firstName: 'Michael', lastName: 'Suyama', Title: 'Sales Representative' },
            // sub of ID 4
            { Salary: 2500, employeeID: 8, PID: 4, firstName: 'Anne', lastName: 'Dodsworth', Title: 'Sales Representative' },
            { Salary: 3500, employeeID: 9, PID: 4, firstName: 'Danielle', lastName: 'Davis', Title: 'Sales Representative' },
            { Salary: 1500, employeeID: 10, PID: 4, firstName: 'Robert', lastName: 'King', Title: 'Sales Representative' },
            // sub of ID 2
            { Salary: 2500, employeeID: 11, PID: 2, firstName: 'Peter', lastName: 'Lewis', Title: 'Chief Accountant' },
            { Salary: 3500, employeeID: 12, PID: 2, firstName: 'Ryder', lastName: 'Zenaida', Title: 'Accountant' },
            { Salary: 1500, employeeID: 13, PID: 2, firstName: 'Wang', lastName: 'Mercedes', Title: 'Accountant' },
            // sub of ID 3
            { Salary: 1500, employeeID: 14, PID: 3, firstName: 'Theodore', lastName: 'Zia', Title: 'Software Architect' },
            { Salary: 4500, employeeID: 15, PID: 3, firstName: 'Lacota', lastName: 'Mufutau', Title: 'Product Manager' },
            // sub of ID 16
            { Salary: 2500, employeeID: 16, PID: 15, firstName: 'Jin', lastName: 'Elliott', Title: 'Product Owner' },
            { Salary: 3500, employeeID: 17, PID: 15, firstName: 'Armand', lastName: 'Ross', Title: 'Product Owner' },
            { Salary: 1500, employeeID: 18, PID: 15, firstName: 'Dane', lastName: 'Rodriquez', Title: 'Team Leader' },
            // sub of ID 19
            { Salary: 2500, employeeID: 19, PID: 18, firstName: 'Declan', lastName: 'Lester', Title: 'Senior Software Developer' },
            { Salary: 3500, employeeID: 20, PID: 18, firstName: 'Bernard', lastName: 'Jarvis', Title: 'Senior Software Developer' },
            { Salary: 1500, employeeID: 21, PID: 18, firstName: 'Jason', lastName: 'Clark', Title: 'QA' },
            { Salary: 1500, employeeID: 22, PID: 18, firstName: 'Mark', lastName: 'Young', Title: 'QA' },
            // sub of ID 20
            { Salary: 1500, employeeID: 23, PID: 20, firstName: 'Jeremy', lastName: 'Donaldson', Title: 'Software Developer' }
        ];
        this.selectionMode = GridSelectionMode.multiple;
    }

    public ngAfterViewInit() {
        this.iconService.addSvgIconFromText(pinLeft.name, pinLeft.value, 'imx-icons');
        this.iconService.addSvgIconFromText(unpinLeft.name, unpinLeft.value, 'imx-icons');
    }

    public togglePinRow(index) {
        const rec = this.data[index];
        if (this.grid1.isRecordPinned(rec)) {
            this.grid1.pinRow(this.data[index]);
        } else {
            this.grid1.unpinRow(this.data[index]);
        }
    }

    public togglePining(row: RowType, event) {
        event.preventDefault();
        if (row.pinned) {
            row.unpin();
        } else {
            row.pin();
        }
    }

    public clickUnpin() {
        this.grid1.unpinRow('aaaa');
    }

    public generateDataUneven(count: number, level: number, parendID: string = null) {
        const prods = [];
        const currLevel = level;
        let children;
        for (let i = 0; i < count; i++) {
            const rowID = parendID ? parendID + i : i.toString();
            if (level > 0) {
                // Have child grids for row with even id less rows by not multiplying by 2
                children = this.generateDataUneven(((i % 2) + 1) * Math.round(count / 3), currLevel - 1, rowID);
            }
            prods.push({
                ID: rowID,
                ChildLevels: currLevel,
                ProductName: 'Product: A' + i,
                Col1: i,
                Col2: i,
                Col3: i,
                childData: children,
                childData2: children,
                hasChild: true
            });
        }
        return prods;
    }

    public isPinned(cell) {
        console.log(cell);
        return true;
    }

    public exportButtonHandler() {
        this.excelExportService.export(this.grid1, new IgxExcelExporterOptions('ExportFileFromGrid'));
    }

    public saveGridState() {
        const state = this.state.getState() as string;
        window.localStorage.setItem('grid1-state', state);
    }

    public restoreGridState() {
        const state = window.localStorage.getItem('grid1-state');
        this.state.setState(state);
    }

    public toggleDensity() {
        switch (this.size ) {
            case 'large': this.size = 'small'; break;
            case 'small': this.size ='medium'; break;
            case 'medium': this.size = 'small'; break;
        }
    }
}
