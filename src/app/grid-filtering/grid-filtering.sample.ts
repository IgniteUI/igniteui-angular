import { Component, ViewChild, OnInit, HostBinding } from '@angular/core';
import { NgIf, NgFor } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FilterMode, FilteringExpressionsTree, FilteringLogic, FormattedValuesFilteringStrategy, GridSelectionMode, IChangeCheckboxEventArgs, IGX_GRID_DIRECTIVES, IgxButtonGroupComponent, IgxCheckboxComponent, IgxGridComponent, IgxIconComponent, IgxStringFilteringOperand } from 'igniteui-angular';
import { SAMPLE_DATA } from '../shared/sample-data';


@Component({
    providers: [],
    selector: 'app-grid-filtering-sample',
    styleUrls: ['grid-filtering.sample.scss'],
    templateUrl: 'grid-filtering.sample.html',
    imports: [NgIf, NgFor, FormsModule, IGX_GRID_DIRECTIVES, IgxCheckboxComponent, IgxButtonGroupComponent, IgxIconComponent]
})
export class GridFilteringComponent implements OnInit {

    @HostBinding('style.--ig-size')
    protected get sizeStyle() {
        return `var(--ig-size-${this.size})`;
    }
    
    @ViewChild('grid1', { static: true })
    public grid1: IgxGridComponent;

    @ViewChild('applyChangesCheckbox', { static: true })
    public applyChangesCheckbox: IgxCheckboxComponent;

    public data: Array<any>;
    public columns: Array<any>;
    public sizes;
    public filterModes;
    public size = 'large';
    public advancedFilteringTree: FilteringExpressionsTree;
    public selectionMode;
    public filterStrategy = new FormattedValuesFilteringStrategy();

    public ngOnInit(): void {
        this.sizes = [
            { label: 'large', selected: this.size === 'large', togglable: true },
            { label: 'medium', selected: this.size === 'medium', togglable: true },
            { label: 'small', selected: this.size === 'small', togglable: true }
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
        this.selectionMode = GridSelectionMode.multiple;
        this.columns = [
            { field: 'ID', width: 80, resizable: true, type: 'string' },
            { field: 'CompanyName', header: 'Company Name', width: 175, resizable: true, type: 'string'},
            { field: 'ContactName', header: 'Contact Name', width: 175, resizable: true, type: 'string' },
            { field: 'Employees', width: 150, resizable: true, type: 'number' },
            { field: 'ContactTitle', header: 'Contact Title', width: 150, resizable: true, type: 'string' },
            { field: 'DateCreated', header: 'Date Created', width: 150, resizable: true, type: 'date' },
            { field: 'Address', width: 150, resizable: true, type: 'string' },
            { field: 'City', width: 150, resizable: true, type: 'string' },
            { field: 'Region', width: 150, resizable: true, type: 'string' },
            { field: 'PostalCode', header: 'Postal Code', width: 150, resizable: true, type: 'string' },
            { field: 'Phone', width: 150, resizable: true, type: 'string' },
            { field: 'Fax', width: 150, resizable: true, type: 'string' },
            { field: 'Contract', width: 150, resizable: true, type: 'boolean' }
        ];
        this.data = SAMPLE_DATA;

        const tree = new FilteringExpressionsTree(FilteringLogic.And);
        tree.filteringOperands.push({
            fieldName: 'ID',
            condition: IgxStringFilteringOperand.instance().condition('contains'),
            searchVal: 'a',
            ignoreCase: true
        });
        const orTree = new FilteringExpressionsTree(FilteringLogic.Or);
        orTree.filteringOperands.push({
            fieldName: 'ID',
            condition: IgxStringFilteringOperand.instance().condition('contains'),
            searchVal: 'b',
            ignoreCase: true
        });
        orTree.filteringOperands.push({
            fieldName: 'CompanyName',
            condition: IgxStringFilteringOperand.instance().condition('contains'),
            searchVal: 'c',
            ignoreCase: true
        });
        tree.filteringOperands.push(orTree);
        tree.filteringOperands.push({
            fieldName: 'CompanyName',
            condition: IgxStringFilteringOperand.instance().condition('contains'),
            searchVal: 'd',
            ignoreCase: true
        });

        this.advancedFilteringTree = tree;
    }

    public selectDensity(event) {
        this.size = this.sizes[event.index].label;
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

    public formatNumber(value: number) {
        return value ? Math.round(value) : value;
    }

    public formatEvenOdd(value: number) {
        return value ? value % 2 ? 'even' : 'odd' : value;
    }
}
