import { AfterViewInit, ChangeDetectionStrategy, Component, DestroyRef, Injector, TemplateRef, afterNextRender, computed, inject, signal, viewChild } from '@angular/core';
import { ColumnPinningPosition } from 'igniteui-angular/core';
import {
    IPinColumnCancellableEventArgs,
    IPinRowEventArgs,
    IPinningConfig,
    IgxCellTemplateDirective,
    IgxColumnComponent,
    IgxGridPinningActionsComponent,
    IgxGridToolbarActionsComponent,
    IgxGridToolbarComponent,
    IgxGridToolbarHidingComponent,
    IgxGridToolbarPinningComponent,
    IgxGridToolbarTitleComponent,
    RowPinningPosition,
    RowType
} from 'igniteui-angular/grids/core';
import { IgxGridBaseDirective, IgxGridComponent } from 'igniteui-angular/grids/grid';
import { IgxTreeGridComponent } from 'igniteui-angular/grids/tree-grid';
import { IgxHierarchicalGridComponent, IgxRowIslandComponent } from 'igniteui-angular/grids/hierarchical-grid';
import { IgxActionStripComponent } from 'igniteui-angular/action-strip';
import { IgxIconComponent } from 'igniteui-angular/icon';
import { IgxButtonDirective } from 'igniteui-angular/directives';
import { IgxSnackbarComponent } from 'igniteui-angular/snackbar';
import { IgxTabContentComponent, IgxTabHeaderComponent, IgxTabHeaderLabelDirective, IgxTabItemComponent, IgxTabsComponent } from 'igniteui-angular/tabs';
import { Properties, PropertyChangeService, PropertyPanelConfig } from '../properties-panel/property-change.service';
import { HIERARCHICAL_SAMPLE_DATA, SAMPLE_DATA } from '../shared/sample-data';

interface PinnableColumn {
    field: string;
    header: string;
    width: string;
    pinned?: boolean;
    /** Overrides `pinning.columns` for this column only; the grid default applies when omitted. */
    pinningPosition?: ColumnPinningPosition;
}

@Component({
    selector: 'app-grid-column-pinning-sample',
    styleUrls: ['grid-column-pinning.sample.scss'],
    templateUrl: 'grid-column-pinning.sample.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [
        IgxGridComponent,
        IgxTreeGridComponent,
        IgxHierarchicalGridComponent,
        IgxRowIslandComponent,
        IgxColumnComponent,
        IgxCellTemplateDirective,
        IgxGridToolbarComponent,
        IgxGridToolbarTitleComponent,
        IgxGridToolbarActionsComponent,
        IgxGridToolbarPinningComponent,
        IgxGridToolbarHidingComponent,
        IgxActionStripComponent,
        IgxGridPinningActionsComponent,
        IgxTabsComponent,
        IgxTabItemComponent,
        IgxTabHeaderComponent,
        IgxTabHeaderLabelDirective,
        IgxTabContentComponent,
        IgxIconComponent,
        IgxButtonDirective,
        IgxSnackbarComponent
    ]
})
export class GridColumnPinningSampleComponent implements AfterViewInit {
    private readonly flatGrid = viewChild<IgxGridComponent>('flatGrid');
    private readonly treeGrid = viewChild<IgxTreeGridComponent>('treeGrid');
    private readonly hierarchicalGrid = viewChild<IgxHierarchicalGridComponent>('hierarchicalGrid');
    private readonly snackbar = viewChild.required<IgxSnackbarComponent>('snackbar');
    private readonly customControls = viewChild.required<TemplateRef<any>>('customControls');

    private readonly pcs = inject(PropertyChangeService);
    private readonly destroyRef = inject(DestroyRef);
    private readonly injector = inject(Injector);

    public panelConfig: PropertyPanelConfig = {
        columnArea: {
            label: 'Column pinning position',
            control: {
                type: 'button-group',
                options: [{ label: 'Start', value: 'start' }, { label: 'End', value: 'end' }],
                defaultValue: 'start'
            }
        },
        rowArea: {
            label: 'Row pinning position',
            control: {
                type: 'button-group',
                options: [{ label: 'Top', value: 'top' }, { label: 'Bottom', value: 'bottom' }],
                defaultValue: 'top'
            }
        },
        rowPinningUI: {
            label: 'Pin rows with',
            control: {
                type: 'button-group',
                options: [{ label: 'Action strip', value: 'strip' }, { label: 'Cell icons', value: 'icons' }],
                defaultValue: 'strip'
            }
        },
        showPinningUI: {
            label: 'Column pinning UI',
            control: { type: 'boolean', defaultValue: true }
        },
        preventIdPinning: {
            label: 'Prevent pinning the ID column',
            control: { type: 'boolean', defaultValue: false }
        }
    };

    protected properties = signal<Properties>(
        Object.fromEntries(
            Object.entries(this.panelConfig).map(([key, config]) => [key, config?.control?.defaultValue])
        ) as Properties
    );

    /**
     * `columns` is the area a column lands in when it is pinned without an explicit position,
     * and `rows` is the edge the pinned row area is docked to. Every grid below takes the
     * same config - pinning works the same way in all of them.
     */
    protected pinningConfig = computed<IPinningConfig>(() => ({
        columns: this.properties().columnArea === 'end' ? ColumnPinningPosition.End : ColumnPinningPosition.Start,
        rows: this.properties().rowArea === 'bottom' ? RowPinningPosition.Bottom : RowPinningPosition.Top
    }));

    /** Only the grid on the selected tab is mounted. */
    protected activeTab = signal(0);

    protected data = SAMPLE_DATA;
    protected hierarchicalData = HIERARCHICAL_SAMPLE_DATA;

    protected columns: PinnableColumn[] = [
        { field: 'ID', header: 'ID', width: '120px' },
        { field: 'CompanyName', header: 'Company Name', width: '220px' },
        // Pinned to whichever area `pinning.columns` points at.
        { field: 'ContactName', header: 'Contact Name', width: '180px', pinned: true },
        // Always pinned to the end, whatever the grid default is.
        { field: 'ContactTitle', header: 'Contact Title', width: '200px', pinned: true, pinningPosition: ColumnPinningPosition.End },
        { field: 'Address', header: 'Address', width: '220px' },
        { field: 'City', header: 'City', width: '140px' },
        { field: 'Country', header: 'Country', width: '140px' },
        { field: 'PostalCode', header: 'Postal Code', width: '140px' },
        { field: 'Phone', header: 'Phone', width: '160px' },
        { field: 'Fax', header: 'Fax', width: '160px' }
    ];

    protected treeData = [
        { ID: 1, ParentID: -1, Name: 'Johnathan Winchester', Title: 'Development Manager', Country: 'UK', City: 'London', Phone: '020 7946 0958' },
        { ID: 2, ParentID: 1, Name: 'Michael Burke', Title: 'Senior Software Developer', Country: 'UK', City: 'Manchester', Phone: '0161 496 0245' },
        { ID: 3, ParentID: 1, Name: 'Thomas Anderson', Title: 'Software Developer', Country: 'UK', City: 'Leeds', Phone: '0113 496 0113' },
        { ID: 4, ParentID: 3, Name: 'Monica Reyes', Title: 'Software Developer', Country: 'Ireland', City: 'Dublin', Phone: '01 496 0142' },
        { ID: 5, ParentID: -1, Name: 'Yang Wang', Title: 'Sales Manager', Country: 'USA', City: 'Seattle', Phone: '(206) 555 0184' },
        { ID: 6, ParentID: 5, Name: 'Kelly Rodriguez', Title: 'Sales Representative', Country: 'USA', City: 'Portland', Phone: '(503) 555 0117' },
        { ID: 7, ParentID: 5, Name: 'Ana Sanders', Title: 'Sales Representative', Country: 'Canada', City: 'Vancouver', Phone: '(604) 555 0163' },
        { ID: 8, ParentID: -1, Name: 'Elizabeth Richards', Title: 'Support Manager', Country: 'Germany', City: 'Berlin', Phone: '030 0074 321' },
        { ID: 9, ParentID: 8, Name: 'Pedro Afonso', Title: 'Support Engineer', Country: 'Portugal', City: 'Lisbon', Phone: '213 555 0198' },
        { ID: 10, ParentID: 8, Name: 'Laurence Lebihan', Title: 'Support Engineer', Country: 'France', City: 'Marseille', Phone: '091 24 45 40' },
        { ID: 11, ParentID: 10, Name: 'Frédérique Citeaux', Title: 'Support Engineer', Country: 'France', City: 'Strasbourg', Phone: '088 60 15 31' },
        { ID: 12, ParentID: 10, Name: 'Martín Sommer', Title: 'Support Engineer', Country: 'Spain', City: 'Madrid', Phone: '(91) 555 22 82' }
    ];

    protected message = signal('');

    /**
     * The pinned columns are read from the grid whenever a pin state changes, rather than during
     * change detection - the pinned collections are rebuilt while the grid renders.
     */
    private pinnedColumns = signal({ start: 0, end: 0 });

    /**
     * The pinned rows are followed through the `rowPinned` output instead: `grid.pinnedRows` is a
     * view query, so it throws while the grid is still rendering its first pinned row. The event
     * covers every way a row can be pinned - the action strip, the cell icons or the API.
     */
    private pinnedRowKeys = signal<Set<any>>(new Set());

    protected pinnedStartCount = computed(() => this.pinnedColumns().start);
    protected pinnedEndCount = computed(() => this.pinnedColumns().end);
    protected pinnedRowCount = computed(() => this.pinnedRowKeys().size);

    private viewReady = false;

    constructor() {
        this.pcs.setPanelConfig(this.panelConfig);

        const propertyChange = this.pcs.propertyChanges.subscribe((updated) => {
            const previousArea = this.properties().columnArea;

            this.properties.set(Object.fromEntries(
                Object.entries(this.panelConfig).map(([key, config]) => [
                    key,
                    updated[key] !== undefined ? updated[key] : config?.control?.defaultValue
                ])
            ) as Properties);

            if (this.viewReady && this.properties().columnArea !== previousArea) {
                // The new config reaches the grid with the next render, so the columns can
                // only be re-pinned into the new default area after that.
                this.afterRender(() => this.repinToDefaultArea());
            }
        });

        this.destroyRef.onDestroy(() => propertyChange.unsubscribe());
    }

    public ngAfterViewInit(): void {
        this.viewReady = true;
        this.pcs.setPanelTitle('Grid Column & Row Pinning');
        this.pcs.setCustomControls(this.customControls());
        this.pinFirstRow();
    }

    protected onTabChange(index: number): void {
        // Leaving a tab destroys its grid, so the pinned state starts over on the new one.
        this.pinnedRowKeys.set(new Set());
        this.activeTab.set(index);
        // The grid of the selected tab is created with the next render.
        this.afterRender(() => this.pinFirstRow());
    }

    protected refreshPinnedColumns(): void {
        const grid = this.activeGrid();

        this.pinnedColumns.set({
            start: grid?.pinnedStartColumns.length ?? 0,
            end: grid?.pinnedEndColumns.length ?? 0
        });
    }

    protected onRowPinned(event: IPinRowEventArgs): void {
        this.pinnedRowKeys.update((keys) => {
            const next = new Set(keys);
            if (event.isPinned) {
                next.add(event.rowKey);
            } else {
                next.delete(event.rowKey);
            }
            return next;
        });
    }

    /** Row pinning from a cell template, as opposed to the built-in action strip. */
    protected togglePinnedRow(row: RowType): void {
        if (row.pinned) {
            row.unpin();
        } else {
            row.pin();
        }
    }

    protected unpinAllColumns(): void {
        const grid = this.activeGrid();

        for (const column of [...grid.pinnedStartColumns, ...grid.pinnedEndColumns]) {
            column.unpin();
        }

        this.refreshPinnedColumns();
    }

    protected unpinAllRows(): void {
        for (const key of this.pinnedRowKeys()) {
            this.activeGrid().unpinRow(key);
        }
    }

    /** `columnPin` runs before the column is pinned and can call the operation off. */
    protected onColumnPin(event: IPinColumnCancellableEventArgs): void {
        if (this.properties().preventIdPinning && event.column.field === 'ID') {
            event.cancel = true;
            this.message.set('Pinning of the ID column was cancelled by the columnPin handler.');
            this.snackbar().open();
        }
    }

    private activeGrid(): IgxGridBaseDirective {
        return [this.flatGrid(), this.treeGrid(), this.hierarchicalGrid()][this.activeTab()] as IgxGridBaseDirective;
    }

    /** Pinning a row from code takes the row key - the primaryKey value of the record. */
    private pinFirstRow(): void {
        const grid = this.activeGrid();
        const keys = [this.data[0].ID, this.treeData[0].ID, this.hierarchicalData[0].ID];

        grid.pinRow(keys[this.activeTab()]);
        this.refreshPinnedColumns();
    }

    /**
     * `pinning.columns` decides where a column lands *when it gets pinned*, so changing it
     * leaves the already pinned columns where they are. Re-pinning is what moves them, and
     * only the ones that do not override the area with their own `pinningPosition`.
     */
    private repinToDefaultArea(): void {
        const grid = this.activeGrid();
        const followsDefault = (field: string) =>
            !this.columns.find(column => column.field === field)?.pinningPosition;

        for (const column of [...grid.pinnedStartColumns, ...grid.pinnedEndColumns]) {
            if (followsDefault(column.field)) {
                column.unpin();
                column.pin();
            }
        }

        this.refreshPinnedColumns();
    }

    private afterRender(callback: () => void): void {
        afterNextRender(callback, { injector: this.injector });
    }
}
