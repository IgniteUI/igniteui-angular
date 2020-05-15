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
import { IgxGridCellComponent } from '../../grids/cell.component';
import { IgxGridBaseDirective } from '../../grids';
import { RowType } from '../../grids/common/row.interface';
import { IgxRowIslandComponent } from '../../grids/hierarchical-grid';

export interface IInteractionConfig {
    start: Array<string>;
    end: Array<string>;
}

export interface ICellInteractionArgs {
    cell: IgxGridCellComponent;
    originalEvent: Event;
}

export interface IRowInteractionArgs {
    row: RowType;
    originalEvent: Event;
}

@Directive({
    selector: '[igxCellInteraction],[igxRowInteraction]'
})

export class IgxGridInteractionDirective implements AfterViewInit, OnDestroy {

    @Input('igxCellInteraction') cellInteraction: IInteractionConfig;
    @Input('igxRowInteraction') rowInteraction: IInteractionConfig;

    @Output() onCellInteractionStart = new EventEmitter<ICellInteractionArgs>();
    @Output() onCellInteractionEnd = new EventEmitter<ICellInteractionArgs>();
    @Output() onRowInteractionStart = new EventEmitter<IRowInteractionArgs>();
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
                const startFn = this.renderer.listen(this.grid.nativeElement, startEvent, (evt) => {
                    const target = evt.target;
                    if (this.isGridCell(target.tagName.toLowerCase())) {
                        const rowNode = target.parentNode.parentNode;
                        const rowIndex = parseInt(target.getAttribute('data-rowindex'), 10);
                        const visibleIndex = parseInt(target.getAttribute('data-visibleindex'), 10);
                        const cell = this.grid.getCellByColumnVisibleIndex(rowIndex, visibleIndex);

                        grid = this.extractGrid(rowIndex, rowNode);

                        if (grid) {
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
