import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    ElementRef,
    HostBinding,
    Input,
    OnInit,
    ViewChild,
    AfterViewInit,
    SimpleChanges,
    ComponentFactoryResolver
} from '@angular/core';
import { GridBaseAPIService } from '.././api.service';
import { IgxRowIslandComponent } from './row-island.component';
import { IgxGridComponent } from '../grid/grid.component';
import { takeUntil } from 'rxjs/operators';

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    preserveWhitespaces: false,
    selector: 'igx-child-grid-row',
    templateUrl: './child-grid-row.component.html'
})
export class IgxChildGridRowComponent implements AfterViewInit, OnInit {
    @Input()
    public layout: IgxRowIslandComponent;

    /**
     * @hidden
     */
    public get parentHasScroll() {
        return !this.parentGrid.verticalScrollContainer.dc.instance.notVirtual;
    }


    /**
     * @hidden
     */
    @Input()
    public parentGridID: string;

    /**
     *  The data passed to the row component.
     *
     * ```typescript
     * // get the row data for the first selected row
     * let selectedRowData = this.grid.selectedRows[0].rowData;
     * ```
     */
    @Input()
    public rowData: any = [];

    /**
     * The index of the row.
     *
     * ```typescript
     * // get the index of the second selected row
     * let selectedRowIndex = this.grid.selectedRows[1].index;
     * ```
     */
    @Input()
    public index: number;

    @ViewChild('hgrid', { static: true })
    public hGrid: any/* TODO: IgxHierarchicalGridComponent*/;

    /**
     * Get a reference to the grid that contains the selected row.
     *
     * ```typescript
     * handleRowSelection(event) {
     *  // the grid on which the rowSelected event was triggered
     *  const grid = event.row.grid;
     * }
     * ```
     *
     * ```html
     *  <igx-grid
     *    [data]="data"
     *    (rowSelected)="handleRowSelection($event)">
     *  </igx-grid>
     * ```
     */
    // TODO: Refactor
    public get parentGrid(): any/* TODO: IgxHierarchicalGridComponent*/ {
        return this.gridAPI.grid;
    }

    @HostBinding('attr.aria-level')
    public get level() {
        return this.layout.level;
    }

    /**
     * The native DOM element representing the row. Could be null in certain environments.
     *
     * ```typescript
     * // get the nativeElement of the second selected row
     * let selectedRowNativeElement = this.grid.selectedRows[1].nativeElement;
     * ```
     */
     public get nativeElement() {
        return this.element.nativeElement;
    }

    /**
     * Returns whether the row is expanded.
     * ```typescript
     * const RowExpanded = this.grid1.rowList.first.expanded;
     * ```
     */
    public expanded = false;

    private resolver;

    constructor(public gridAPI: GridBaseAPIService<any/* TODO: IgxHierarchicalGridComponent*/>,
        public element: ElementRef,
        resolver: ComponentFactoryResolver,
        public cdr: ChangeDetectorRef) {
            this.resolver = resolver;
    }

    /**
     * @hidden
     */
     public ngOnInit() {
        this.layout.layoutChange.subscribe((ch) => {
            this._handleLayoutChanges(ch);
        });
        const changes = this.layout.initialChanges;
        changes.forEach(change => {
            this._handleLayoutChanges(change);
        });
        this.hGrid.parent = this.parentGrid;
        this.hGrid.parentIsland = this.layout;
        this.hGrid.childRow =  this;
        // handler logic that re-emits hgrid events on the row island
        this.setupEventEmitters();
        this.layout.gridCreated.emit({
            owner: this.layout,
            parentID: this.rowData.rowID,
            grid: this.hGrid
        });
    }

    /**
     * @hidden
     */
     public ngAfterViewInit() {
        this.hGrid.childLayoutList = this.layout.children;
        const layouts = this.hGrid.childLayoutList.toArray();
        layouts.forEach((l) => this.hGrid.hgridAPI.registerChildRowIsland(l));
        this.parentGrid.hgridAPI.registerChildGrid(this.rowData.rowID, this.layout.key, this.hGrid);
        this.layout.rowIslandAPI.registerChildGrid(this.rowData.rowID, this.hGrid);

        this.layout.gridInitialized.emit({
            owner: this.layout,
            parentID: this.rowData.rowID,
            grid: this.hGrid
        });

        this.hGrid.cdr.detectChanges();
    }

    private setupEventEmitters() {
        const destructor = takeUntil(this.hGrid.destroy$);

        const factory = this.resolver.resolveComponentFactory(IgxGridComponent);
        // exclude outputs related to two-way binding functionality
        const inputNames = factory.inputs.map(input => input.propName);
        const outputs = factory.outputs.filter(o => {
            const matchingInputPropName = o.propName.slice(0, o.propName.indexOf('Change'));
            return inputNames.indexOf(matchingInputPropName) === -1;
        });

        // TODO: Skip the `rendered` output. Rendered should be called once per grid.
        outputs.filter(o => o.propName !== 'rendered').forEach(output => {
            if (this.hGrid[output.propName]) {
                this.hGrid[output.propName].pipe(destructor).subscribe((args) => {
                    if (!args) {
                        args = {};
                    }
                    args.owner = this.hGrid;
                    this.layout[output.propName].emit(args);
                });
            }
        });
    }


    private _handleLayoutChanges(changes: SimpleChanges) {
        for (const change in changes) {
            if (changes.hasOwnProperty(change)) {
                this.hGrid[change] = changes[change].currentValue;
            }
        }
    }
}
