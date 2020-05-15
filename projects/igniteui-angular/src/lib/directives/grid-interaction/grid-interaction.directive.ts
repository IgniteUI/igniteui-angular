import { Directive, Input, Output, Renderer2, NgModule, EventEmitter, AfterViewInit, Inject, Self, ViewChild, forwardRef, Optional } from '@angular/core';
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

export class IgxGridInteractionDirective implements AfterViewInit {

    @Input('igxCellInteraction') cellInteractions: IInteractionConfig;
    @Input('igxRowInteraction') rowInteraction: IInteractionConfig;

    @Output() cellInteractionStart = new EventEmitter<ICellInteractionArgs>();
    @Output() cellInteractionEnd = new EventEmitter<ICellInteractionArgs>();
    @Output() rowInteractionStart = new EventEmitter<IRowInteractionArgs>();
    @Output() rowInteractionEnd = new EventEmitter<IRowInteractionArgs>();

    private cellStartListenerFn: Array<() => void> = [];
    private cellEndListenerFn: Array<() => void> = [];
    private rowStartListenerFn: Array<() => void> = [];
    private rowEndListenerFn: Array<() => void> = [];

    constructor(private renderer: Renderer2,
        @Inject(IgxGridBaseDirective) private grid: IgxGridBaseDirective,
        @Optional() @Self() @Inject(IgxRowIslandComponent) private rowIsland?: IgxRowIslandComponent) { }

    ngAfterViewInit() {
        if (this.cellInteractions) {
            this.cellInteractions.start.forEach(() => {
                // const cellStartFn = this.renderer.listen(this.grid.nativeElement, interaction, (evt) => {
                //     if (evt.target.tagName.toLowerCase() === 'igx-grid-cell' ||
                //         evt.target.tagName.toLowerCase() === 'igx-tree-grid-cell' ||
                //         evt.target.tagName.toLowerCase() === 'igx-hierarchical-grid-cell') {
                //         const rowIndex = parseInt(evt.target.getAttribute("data-rowindex"), 10);
                //         const visibleIndex = parseInt(evt.target.getAttribute("data-visibleindex"), 10);
                //         const cell = this.grid.getCellByColumnVisibleIndex(rowIndex, visibleIndex);
                //         this.cellInteractionStart.emit({ cell: cell, originalEvent: evt });
                //         this.cellInteractions.end.forEach(interaction => {
                //             const cellEndFn = this.renderer.listen(cell.nativeElement, interaction, (evt) => {
                //                 this.cellInteractionEnd.emit({ cell: cell, originalEvent: evt });
                //             });
                //             this.cellEndListenerFn.push(cellEndFn);
                //         });
                //     }
                // });
                // this.cellStartListenerFn.push(cellStartFn);
            });
            // this.cellInteractions.end.forEach(interaction => {
            //     this.renderer.listen(this.grid.nativeElement, interaction, (evt) => {
            //         if (evt.target.tagName.toLowerCase() === 'igx-grid-cell' ||
            //             evt.target.tagName.toLowerCase() === 'igx-tree-grid-cell' ||
            //             evt.target.tagName.toLowerCase() === 'igx-hierarchical-grid-cell') {
            //             const rowIndex = parseInt(evt.target.getAttribute("data-rowindex"), 10);
            //             const visibleIndex = parseInt(evt.target.getAttribute("data-visibleindex"), 10);
            //             const cell = this.grid.getCellByColumnVisibleIndex(rowIndex, visibleIndex);
            //             this.cellInteractionEnd.emit({ cell: cell, originalEvent: evt });
            //         }
            //     });
            // });
        }

        if (this.rowInteraction) {
            this.rowInteraction.start.forEach(interaction => {
                const rowStartFn = this.renderer.listen(this.grid.nativeElement, interaction, (evt) => {
                    if (this.isGridCell(evt.target.tagName.toLowerCase())) {
                        const rowNode = evt.target.parentNode.parentNode;
                        const rowIndex = parseInt(evt.target.getAttribute("data-rowindex"), 10);
                        let grid;
                        if (this.rowIsland) {
                            // the directive is applied to igx-row-island and should interact with grid representing that island
                            const childGrids = this.rowIsland.rowIslandAPI.getChildGrids().filter(grid => {
                                const row = grid.getRowByIndex(rowIndex);
                                return row && row.nativeElement === rowNode;
                            });
                            grid = childGrids.length > 0 ? childGrids[0] : null;
                        } else {
                            grid = this.grid;
                        }

                        if (grid) {
                            const row = grid.getRowByIndex(rowIndex);
                            if (row && row.nativeElement === rowNode) {
                                this.rowInteractionStart.emit({ row: row, originalEvent: evt });
                                this.rowInteraction.end.forEach(interaction => {
                                    const rowEndFn = this.renderer.listen(row.nativeElement, interaction, (evt) => {
                                        this.rowInteractionEnd.emit({ row: row, originalEvent: evt });
                                    });
                                    this.rowEndListenerFn.push(rowEndFn);
                                });
                            }
                        }
                    }
                });
                this.rowStartListenerFn.push(rowStartFn);
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
     * Make sure the row in the specified grid corresponds to the target element
     */
    private isTargetRow(rowIndex, grid, rowNode) {
        const row = grid.getRowByIndex(rowIndex);
        return row && row.nativeElement === rowNode;
    }

    ngOnDestroy() {
        this.cellStartListenerFn.forEach(fn => {
            fn();
        });
        this.cellEndListenerFn.forEach(fn => {
            fn();
        })
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