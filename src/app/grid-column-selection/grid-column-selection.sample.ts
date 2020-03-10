import { Component, ViewChild, OnInit, Pipe, PipeTransform, ɵbypassSanitizationTrustResourceUrl, AfterViewInit } from '@angular/core';
import {
    IgxGridComponent,
    OverlaySettings,
    ConnectedPositioningStrategy,
    AbsoluteScrollStrategy,
    PositionSettings,
    HorizontalAlignment,
    VerticalAlignment,
    IgxDropDownComponent,
    IgxButtonDirective,
    IgxColumnComponent,
    FilterMode
} from 'igniteui-angular';
import { SAMPLE_DATA } from '../shared/sample-data';

@Component({
    providers: [],
    selector: 'app-grid-column-selection-sample',
    styleUrls: ['grid-column-selection.sample.css'],
    templateUrl: 'grid-column-selection.sample.html'
})

export class GridColumnSelectionSampleComponent implements OnInit, AfterViewInit {
    public searchSelectedColumn = '';
    public data: Array<any>;
    public columns: Array<any>;
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
        closeOnOutsideClick: true,
        excludePositionTarget: true
    };

    @ViewChild('grid1', { static: true }) public grid1: IgxGridComponent;

    @ViewChild('columnSelectionDropdown', { read: IgxDropDownComponent })
    public columnSelectionDropdown: IgxDropDownComponent;

    @ViewChild('columnSelectionButton', { read: IgxButtonDirective })
    public columnSelectionButton: IgxButtonDirective;

    public density = 'comfortable';
    public displayDensities;

    log(event) {
        console.log(event);
    }
    ngAfterViewInit(): void {
        this.grid1.getColumnByName('ID').selected = true;
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
            { field: 'ContactName', width: 150, resizable: true, movable: true, selectable: false, summary: true, type: 'string' },
            { field: 'ContactTitle', width: 150, movable: true, sortable: true, selectable: true, summary: true, type: 'string' },
            { field: 'Address', width: 150, resizable: true, movable: true, sortable: true, selectable: true, type: 'string' },
            { field: 'City', width: 150, movable: true, sortable: false, selectable: true,   type: 'string' },
            { field: 'Region', width: 150, movable: true, sortable: true, selectable: true, type: 'string' },
            { field: 'PostalCode', width: 150, movable: true, selectable: true, type: 'string' },
            { field: 'Phone', width: 150, resizable: true, movable: true, sortable: true,  type: 'string' },
            { field: 'Fax', width: 150, resizable: true, movable: true, selectable: true, type: 'string' },
            { field: 'Employees', width: 150, resizable: true, summary: false, selectable: true, type: 'number' },
            { field: 'DateCreated', width: 150, resizable: true, selectable: true, type: 'date' },
            { field: 'Contract', width: 150, resizable: true, selectable: true, type: 'boolean' }
        ];
    }

    public selectDensity(event) {
        this.density = this.displayDensities[event.index].label;
    }

    getGridSelectedColunsData() {
        const data = this.grid1.getSelectedColumnsData();
        console.log(data);
    }
    deselectCol() {
        this.grid1.getColumnByName('ID').selected = true;
    }

    public toggleColumnSelection() {
        this._overlaySettings.positionStrategy.settings.target = this.columnSelectionButton.nativeElement;
        this._overlaySettings.outlet = this.grid1.outletDirective;
        this.columnSelectionDropdown.toggle(this._overlaySettings);
    }

    onColumnSelection(event) {
        console.log(event);
    }

    getGridSelectedColumns() {
        console.log(this.grid1.selectedColumns());
    }

    selectedColumns() {
        this.grid1.selectColumns(['ID', 'Name', 'aaaa']);
    }

    public selectFilterMode(event) {
        const filterMode = this.filterModes[event.index].value as FilterMode;
        if (filterMode !== this.grid1.filterMode) {
            this.grid1.filterMode = filterMode;
        }
    }
}


@Pipe({
    name: 'filterColumns'
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

