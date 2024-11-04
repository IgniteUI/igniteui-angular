import { Component, ViewChild, OnInit } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { ColumnType, GridColumnDataType, GridSelectionMode, IGX_INPUT_GROUP_DIRECTIVES, IgxColumnComponent, IgxDateFilteringOperand, IgxFilterCellTemplateDirective, IgxGridComponent, IgxIconComponent, IgxNumberFilteringOperand, IgxStringFilteringOperand } from 'igniteui-angular';
import { SAMPLE_DATA } from '../shared/sample-data';



@Component({
    providers: [],
    selector: 'app-grid-filter-template-sample',
    styleUrls: ['grid-filter-template.sample.scss'],
    templateUrl: 'grid-filter-template.sample.html',
    imports: [IgxGridComponent, NgFor, IgxColumnComponent, IgxFilterCellTemplateDirective, IgxIconComponent, IGX_INPUT_GROUP_DIRECTIVES, NgIf]
})

export class GridFilterTemplateSampleComponent implements OnInit {
    @ViewChild('grid1', { static: true }) public grid1: IgxGridComponent;

    public data: Array<any>;
    public columns: Array<any>;
    public selectionMode;

    public ngOnInit(): void {
        this.columns = [
            { field: 'ID', width: 150, resizable: true, sortable: false, filterable: true, groupable: true, summary: true },
            {
                field: 'CompanyName', width: 150, resizable: true, sortable: true, filterable: true, groupable: true,
                summary: true, type: 'string'
            },
            {
                field: 'ContactName', width: 150, resizable: true, sortable: true, filterable: true, groupable: true,
                summary: true, type: 'string'
            },
            {
                field: 'ContactTitle', width: 150, resizable: true, sortable: true, filterable: true, groupable: true,
                summary: true, type: 'string'
            },
            {
                field: 'Address', width: 150, resizable: true, sortable: true, filterable: true, groupable: true,
                summary: true, type: 'string'
            },
            {
                field: 'City', width: 150, resizable: true, sortable: false, filterable: true, groupable: true,
                summary: true, type: 'string'
            },
            {
                field: 'Region', width: 150, resizable: true, sortable: true, filterable: true, groupable: true,
                summary: true, type: 'string'
            },
            {
                field: 'PostalCode', width: 150, resizable: true, sortable: true, filterable: true, groupable: true,
                summary: true, type: 'string'
            },
            {
                field: 'Phone', width: 150, resizable: true, sortable: true, filterable: true, groupable: true,
                summary: true, type: 'string'
            },
            {
                field: 'Fax', width: 150, resizable: true, sortable: true, filterable: true, groupable: true,
                summary: true, type: 'string'
            },
            {
                field: 'Employees', width: 150, resizable: true, sortable: true, filterable: true, groupable: true,
                summary: false, type: 'number'
            },
            {
                field: 'DateCreated', width: 150, resizable: true, sortable: true, filterable: true, groupable: true,
                summary: false, type: 'date'
            },
            {
                field: 'Contract', width: 150, resizable: true, sortable: true, filterable: true, groupable: true,
                summary: true, type: 'boolean'
            }
        ];
        this.data = SAMPLE_DATA;
        this.selectionMode = GridSelectionMode.multiple;
    }

    public onInput(input: any, column: ColumnType) {
        let operand = null;
        let value = input.value;

        if (value === '') {
            this.grid1.clearFilter(column.field);
            return;
        }

        switch (column.dataType) {
            case GridColumnDataType.Number:
                value = Number.parseInt(value, 10);
                operand = IgxNumberFilteringOperand.instance().condition('equals');
                break;
            case GridColumnDataType.Date:
                value = new Date(value);
                operand = IgxDateFilteringOperand.instance().condition('equals');
                break;
            default:
                operand = IgxStringFilteringOperand.instance().condition('contains');
                break;
        }

        this.grid1.filter(column.field, value, operand, column.filteringIgnoreCase);
    }

    public clearInput(input: any, column: any) {
        input.value = null;
        this.grid1.clearFilter(column.field);
    }

    public onKeyDown(event: KeyboardEvent) {
        event.stopImmediatePropagation();
    }

}
