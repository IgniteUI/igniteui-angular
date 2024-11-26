import { Component, ViewChild, OnInit, Pipe, PipeTransform, AfterViewInit, ChangeDetectorRef, HostBinding } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { SAMPLE_DATA } from '../shared/sample-data';
import {
    AbsoluteScrollStrategy,
    ConnectedPositioningStrategy,
    FilterMode,
    HorizontalAlignment,
    IgxButtonDirective,
    IgxButtonGroupComponent,
    IgxCheckboxComponent,
    IgxColumnComponent,
    IgxColumnGroupComponent,
    IgxDropDownComponent,
    IgxDropDownItemComponent,
    IgxDropDownItemNavigationDirective,
    IgxGridComponent,
    IgxGridToolbarActionsComponent,
    IgxGridToolbarComponent,
    IgxGridToolbarHidingComponent,
    IgxGridToolbarPinningComponent, IgxGridToolbarTitleComponent,
    IgxIconComponent,
    IgxInputDirective,
    IgxInputGroupComponent,
    IgxLabelDirective,
    IgxPaginatorComponent,
    IgxRippleDirective, IgxSuffixDirective,
    IgxSwitchComponent,
    IgxToggleActionDirective,
    OverlaySettings,
    PositionSettings,
    VerticalAlignment
} from 'igniteui-angular';


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
    styleUrls: ['grid-column-selection.sample.scss'],
    templateUrl: 'grid-column-selection.sample.html',
    imports: [IgxButtonDirective, IgxToggleActionDirective, IgxDropDownItemNavigationDirective, IgxDropDownComponent, NgFor, NgIf, IgxDropDownItemComponent, IgxButtonGroupComponent, IgxGridComponent, IgxGridToolbarComponent, IgxGridToolbarActionsComponent, IgxGridToolbarPinningComponent, IgxGridToolbarHidingComponent, IgxPaginatorComponent, IgxRippleDirective, IgxCheckboxComponent, IgxInputGroupComponent, FormsModule, IgxInputDirective, IgxColumnComponent, IgxColumnGroupComponent, IgxSwitchComponent, GridColumnSelectionFilterPipe, IgxLabelDirective, IgxIconComponent, IgxSuffixDirective, IgxGridToolbarTitleComponent]
})
export class GridColumnSelectionSampleComponent implements OnInit, AfterViewInit {
    @HostBinding('style.--ig-size')
    protected get sizeStyle() {
        return `var(--ig-size-${this.size})`;
    }
    @ViewChild('grid1', { static: true }) public grid1: IgxGridComponent;
    @ViewChild('grid2', { static: true }) public grid2: IgxGridComponent;

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
    public size = 'large';
    public sizes;
    public paging = false;

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
        this.sizes = [
            { label: 'large', selected: this.size === 'large', togglable: true },
            { label: 'medium', selected: this.size === 'medium', togglable: true },
            { label: 'small', selected: this.size === 'small', togglable: true }
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
        console.log('general info', this.grid2.getColumnByName('CompanyName').parent.selected);
        console.log('company name', this.grid2.getColumnByName('CompanyName').selected);
    }

    public selectDensity(event) {
        this.size = this.sizes[event.index].label;
    }

    public selected(event) {
        const selectedItem = event.newSelection.element.nativeElement.textContent.trim();

        this.grid1.columnSelection = selectedItem;
        this.grid2.columnSelection = selectedItem;
    }

    public getGridSelectedColunsData() {
        const data = this.grid1.getSelectedColumnsData();
        console.log(data);
    }

    public deselectCol() {
        this.grid1.getColumnByName('ID').selected = false;
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
        this.grid1.selectColumns(['ID', 'CompanyName', 'aaaa']);
    }

    public selectFilterMode(event) {
        const filterMode = this.filterModes[event.index].value as FilterMode;
        if (filterMode !== this.grid1.filterMode) {
            this.grid1.filterMode = filterMode;
        }
    }
}

