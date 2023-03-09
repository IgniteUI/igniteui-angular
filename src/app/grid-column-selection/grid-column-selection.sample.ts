import { Component, ViewChild, OnInit, Pipe, PipeTransform, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { NgFor } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { SAMPLE_DATA } from '../shared/sample-data';
import { IgxSwitchComponent } from '../../../projects/igniteui-angular/src/lib/switch/switch.component';
import { IgxColumnGroupComponent } from '../../../projects/igniteui-angular/src/lib/grids/columns/column-group.component';
import { IgxColumnComponent } from '../../../projects/igniteui-angular/src/lib/grids/columns/column.component';
import { IgxInputDirective } from '../../../projects/igniteui-angular/src/lib/directives/input/input.directive';
import { IgxInputGroupComponent } from '../../../projects/igniteui-angular/src/lib/input-group/input-group.component';
import { IgxCheckboxComponent } from '../../../projects/igniteui-angular/src/lib/checkbox/checkbox.component';
import { IgxRippleDirective } from '../../../projects/igniteui-angular/src/lib/directives/ripple/ripple.directive';
import { IgxGridToolbarHidingComponent } from '../../../projects/igniteui-angular/src/lib/grids/toolbar/grid-toolbar-hiding.component';
import { IgxGridToolbarPinningComponent } from '../../../projects/igniteui-angular/src/lib/grids/toolbar/grid-toolbar-pinning.component';
import { IgxGridToolbarActionsComponent } from '../../../projects/igniteui-angular/src/lib/grids/toolbar/common';
import { IgxGridToolbarComponent } from '../../../projects/igniteui-angular/src/lib/grids/toolbar/grid-toolbar.component';
import { IgxGridComponent } from '../../../projects/igniteui-angular/src/lib/grids/grid/grid.component';
import { IgxButtonGroupComponent } from '../../../projects/igniteui-angular/src/lib/buttonGroup/buttonGroup.component';
import { IgxDropDownItemComponent } from '../../../projects/igniteui-angular/src/lib/drop-down/drop-down-item.component';
import { IgxDropDownComponent } from '../../../projects/igniteui-angular/src/lib/drop-down/drop-down.component';
import { IgxDropDownItemNavigationDirective } from '../../../projects/igniteui-angular/src/lib/drop-down/drop-down-navigation.directive';
import { IgxToggleActionDirective } from '../../../projects/igniteui-angular/src/lib/directives/toggle/toggle.directive';
import { IgxButtonDirective } from '../../../projects/igniteui-angular/src/lib/directives/button/button.directive';
import { FilterMode } from 'projects/igniteui-angular/src/lib/grids/common/enums';
import { DisplayDensity } from 'projects/igniteui-angular/src/lib/core/density';
import { AbsoluteScrollStrategy, ConnectedPositioningStrategy, HorizontalAlignment, OverlaySettings, PositionSettings, VerticalAlignment } from 'projects/igniteui-angular/src/lib/services/public_api';

@Pipe({
    name: 'filterColumns',
    standalone: true
})
export class GridColumnSelectionFilterPipe implements PipeTransform {
  public transform(items: any[], searchText: string): any[] {
        if (!items || !items.length) {
            return [];
        }

        if (!searchText) {
            return items;
        }

        searchText = searchText.toLowerCase();
        const result = items.filter((it) =>
            it.field.toLowerCase().indexOf(searchText) > -1 );

        return  result;
    }
}

@Component({
    providers: [],
    selector: 'app-grid-column-selection-sample',
    styleUrls: ['grid-column-selection.sample.css'],
    templateUrl: 'grid-column-selection.sample.html',
    standalone: true,
    imports: [IgxButtonDirective, IgxToggleActionDirective, IgxDropDownItemNavigationDirective, IgxDropDownComponent, NgFor, IgxDropDownItemComponent, IgxButtonGroupComponent, IgxGridComponent, IgxGridToolbarComponent, IgxGridToolbarActionsComponent, IgxGridToolbarPinningComponent, IgxGridToolbarHidingComponent, IgxRippleDirective, IgxCheckboxComponent, IgxInputGroupComponent, FormsModule, IgxInputDirective, IgxColumnComponent, IgxColumnGroupComponent, IgxSwitchComponent, GridColumnSelectionFilterPipe]
})

export class GridColumnSelectionSampleComponent implements OnInit, AfterViewInit {
    @ViewChild('grid1', { static: true }) public grid1: IgxGridComponent;
    @ViewChild('grid', { static: true }) public grid: IgxGridComponent;

    @ViewChild('columnSelectionDropdown', { read: IgxDropDownComponent })
    public columnSelectionDropdown: IgxDropDownComponent;

    @ViewChild('columnSelectionButton', { read: IgxButtonDirective })
    public columnSelectionButton: IgxButtonDirective;
    public searchSelectedColumn = '';
    public data: Array<any>;
    public columns: Array<any>;
    public selectionModes = ['none', 'single', 'multiple'];
    // public data = [];
    public filterModes = [
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
    public density: DisplayDensity = 'comfortable';
    public displayDensities;

    private _positionSettings: PositionSettings = {
        horizontalDirection: HorizontalAlignment.Left,
        horizontalStartPoint: HorizontalAlignment.Right,
        verticalDirection: VerticalAlignment.Bottom,
        verticalStartPoint: VerticalAlignment.Bottom
    };
    private _overlaySettings: OverlaySettings = {
        positionStrategy: new ConnectedPositioningStrategy(this._positionSettings),
        scrollStrategy: new AbsoluteScrollStrategy(),
        modal: false,
        closeOnOutsideClick: true
    };

    constructor(private cdr: ChangeDetectorRef) {}

    public log(event) {
        console.log(event);
    }

    public ngAfterViewInit() {
        this.cdr.detectChanges();
    }

    public ngOnInit(): void {
        this.displayDensities = [
            { label: 'comfortable', selected: this.density === 'comfortable', togglable: true },
            { label: 'cosy', selected: this.density === 'cosy', togglable: true },
            { label: 'compact', selected: this.density === 'compact', togglable: true }
        ];
         this.data = SAMPLE_DATA.slice(0);

        this.columns = [
            { field: 'ID', width: 150, groupable: true, summary: true, selectable: true,  type: 'string' },
            { field: 'CompanyName', width: 150, groupable: true, summary: true, selectable: true, type: 'string',  },
            { field: 'ContactName', width: 150, resizable: true, selectable: false, summary: true, type: 'string' },
            { field: 'ContactTitle', width: 150, sortable: true, selectable: true, summary: true, type: 'string' },
            { field: 'Address', width: 150, resizable: true, sortable: true, selectable: true, type: 'string' },
            { field: 'City', width: 150, sortable: false, selectable: true,   type: 'string' },
            { field: 'Region', width: 150, sortable: true, selectable: true, type: 'string' },
            { field: 'PostalCode', width: 150, selectable: true, type: 'string' },
            { field: 'Phone', width: 150, resizable: true, sortable: true,  type: 'string' },
            { field: 'Fax', width: 150, resizable: true, selectable: true, type: 'string' },
            { field: 'Employees', width: 150, resizable: true, summary: false, selectable: true, type: 'number' },
            { field: 'DateCreated', width: 150, resizable: true, selectable: true, type: 'date' },
            { field: 'Contract', width: 150, resizable: true, selectable: true, type: 'boolean' }
        ];
    }

    public getGenInfoState() {
        console.log('general info', this.grid.getColumnByName('CompanyName').parent.selected);
        console.log('company name', this.grid.getColumnByName('CompanyName').selected);
    }

    public selectDensity(event) {
        this.density = this.displayDensities[event.index].label;
    }

    public selected(event) {
        const selection = event.newSelection.element.nativeElement.textContent.trim();
        this.grid.columnSelection = selection;
        this.grid1.columnSelection = selection;
    }

    public getGridSelectedColunsData() {
        const data = this.grid1.getSelectedColumnsData();
        console.log(data);
    }
    public deselectCol() {
        this.grid1.getColumnByName('ID').selected = true;
    }

    public toggleColumnSelection() {
        this._overlaySettings.target = this.columnSelectionButton.nativeElement;
        this._overlaySettings.excludeFromOutsideClick = [this.columnSelectionButton.nativeElement];
        this._overlaySettings.outlet = this.grid1.outlet;
        this.columnSelectionDropdown.toggle(this._overlaySettings);
    }

    public onColumnSelection(event) {
        console.log(event);
    }

    public getGridSelectedColumns() {
        console.log(this.grid1.selectedColumns());
    }

    public selectedColumns() {
        this.grid1.selectColumns(['ID', 'Name', 'aaaa']);
    }

    public selectFilterMode(event) {
        const filterMode = this.filterModes[event.index].value as FilterMode;
        if (filterMode !== this.grid1.filterMode) {
            this.grid1.filterMode = filterMode;
        }
    }
}

