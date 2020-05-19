import {
    Directive,
    Input,
    Output,
    Renderer2,
    NgModule,
    EventEmitter,
    AfterViewInit,
    Inject,
    Self,
    Optional,
    OnDestroy
} from '@angular/core';
import { IgxGridBaseDirective } from './grid-base.directive';
import { RowType } from './common/row.interface';
import { IgxRowIslandComponent } from './hierarchical-grid/row-island.component';
import { CellType } from './common/cell.interface';

export interface IInteractionConfig {
    start: Array<string>;
    end: Array<string>;
}

export interface ICellInteractionArgs {
    cell: CellType;
    originalEvent: Event;
}

export interface IRowInteractionArgs {
    row: RowType;
    originalEvent: Event;
}
/**
 * Allows subscribing to DOM events on cells and rows,
 * but receive component-related context for the element
 * triggering the event instead of just DOM-related one.
 */
@Directive({
    selector: '[igxCellInteraction],[igxRowInteraction]'
})

export class IgxGridInteractionDirective implements AfterViewInit, OnDestroy {
    /**
     * Controls which events to subscribe to for emitting the interaction outputs for cells
     * @example
     * ```html
     * <igx-grid
     *    [igxCellInteraction]="{ start: ['pointerenter'], end: ['pointerleave'] }"
     *    (onCellInteractionStart)="menu.show($event)"
     *    (onCellInteractionEnd)="menu.hide($event)">
     * </igx-grid>
     * ```
     */
    @Input('igxCellInteraction') cellInteraction: IInteractionConfig;
    /**
     * Controls which events to subscribe to for emitting the interaction outputs for rows
     * @example
     * ```html
     * <igx-grid
     *    [igxRowInteraction]="{ start: ['pointerenter'], end: ['pointerleave'] }"
     *    (onRowInteractionStart)="menu.show($event)"
     *    (onRowInteractionEnd)="menu.hide($event)">
     * </igx-grid>
     * ```
     */
    @Input('igxRowInteraction') rowInteraction: IInteractionConfig;

    /**
     * Emitted when a specified start DOM event is fired for a cell
     */
    @Output() onCellInteractionStart = new EventEmitter<ICellInteractionArgs>();
    /**
     * Emitted when a specified end DOM event is fired for a cell
     */
    @Output() onCellInteractionEnd = new EventEmitter<ICellInteractionArgs>();
    /**
     * Emitted when a specified start DOM event is fired for a row
     */
    @Output() onRowInteractionStart = new EventEmitter<IRowInteractionArgs>();
    /**
     * Emitted when a specified end DOM event is fired for a row
     */
    @Output() onRowInteractionEnd = new EventEmitter<IRowInteractionArgs>();

    private cellStartListenerFn: Array<() => void> = [];
    private cellEndListenerFn: Array<() => void> = [];
    private rowStartListenerFn: Array<() => void> = [];
    private rowEndListenerFn: Array<() => void> = [];

    constructor(private renderer: Renderer2,
        @Inject(IgxGridBaseDirective) private grid: IgxGridBaseDirective,
        @Optional() @Self() @Inject(IgxRowIslandComponent) private rowIsland?: IgxRowIslandComponent) { }

    ngAfterViewInit() {
        this.listen(this.cellInteraction, true);
        this.listen(this.rowInteraction, false);
    }

    /**
     * @hidden
     * @internal
     * Applies start listener to grid and emits events for rows and cell.
     * Applies end listener to target cell or row element.
     */
    private listen(interaction: IInteractionConfig, isCellInteraction = false): void {
        let grid;
        if (interaction) {
            interaction.start.forEach(startEvent => {
                const startFn = this.renderer.listen(this.grid.tbody.nativeElement, startEvent, (evt) => {
                    const target = evt.target;
                    if (this.isGridCell(target.tagName.toLowerCase())) {
                        const rowNode = target.parentNode.parentNode;
                        const rowIndex = parseInt(target.getAttribute('data-rowindex'), 10);
                        const visibleIndex = parseInt(target.getAttribute('data-visibleindex'), 10);
                        grid = this.extractGrid(rowIndex, rowNode);

                        if (grid) {
                            const cell = grid.getCellByColumnVisibleIndex(rowIndex, visibleIndex);
                            const row = grid.getRowByIndex(rowIndex);
                            this.emitEvents(row, rowNode, evt, interaction, isCellInteraction ? cell : null);
                        }
                    }
                });
                (isCellInteraction ? this.cellStartListenerFn : this.rowStartListenerFn).push(startFn);
            });
        }
    }

    /**
     * @hidden
     * @internal
     * Emit the start and end events
     */
    private emitEvents(row, rowNode, event, interaction, cell?) {
        if (row && row.nativeElement === rowNode) {
            const interactionElement = cell ? cell : row;
            if (cell) {
                this.onCellInteractionStart.emit({ cell: interactionElement, originalEvent: event });
            } else {
                this.onRowInteractionStart.emit({ row: interactionElement, originalEvent: event });
            }
            interaction.end.forEach(endEvent => {
                const endFn = this.renderer.listen(interactionElement.nativeElement, endEvent, (evt) => {
                    if (cell) {
                        this.onCellInteractionEnd.emit({ cell: interactionElement, originalEvent: evt });
                    } else {
                        this.onRowInteractionEnd.emit({ row: interactionElement, originalEvent: evt });
                    }
                });
                (cell ? this.cellEndListenerFn : this.rowEndListenerFn).push(endFn);
            });
        }
    }

    /**
     * @hidden
     * @internal
     * Check if the tag name is grid cell
     */
    private isGridCell(tag: string): boolean {
        return tag.toLowerCase() === 'igx-grid-cell' ||
            tag.toLowerCase() === 'igx-tree-grid-cell' ||
            tag.toLowerCase() === 'igx-hierarchical-grid-cell';
    }

    /**
     * @hidden
     * @internal
     * Get the grid which contains the grid interaction directive
     */
    private extractGrid(rowIndex: number, rowNode: any): IgxGridBaseDirective {
        let grid: IgxGridBaseDirective;
        if (this.rowIsland) {
            // the directive is applied to igx-row-island and should interact with grid representing that island
            const childGrids = this.rowIsland.rowIslandAPI.getChildGrids().filter(child => {
                const row = child.getRowByIndex(rowIndex);
                return row && row.nativeElement === rowNode;
            });
            grid = childGrids.length > 0 ? childGrids[0] : null;
        } else {
            grid = this.grid;
        }

        return grid;
    }

    ngOnDestroy() {
        this.cellStartListenerFn.forEach(fn => {
            fn();
        });
        this.cellEndListenerFn.forEach(fn => {
            fn();
        });
        this.rowStartListenerFn.forEach(fn => {
            fn();
        });
        this.rowEndListenerFn.forEach(fn => {
            fn();
        });
    }
}

/**
 * @hidden
 */
@NgModule({
    declarations: [IgxGridInteractionDirective],
    exports: [IgxGridInteractionDirective]
})
export class IgxGridInteractionModule { }
