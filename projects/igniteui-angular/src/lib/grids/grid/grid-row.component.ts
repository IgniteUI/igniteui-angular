import { Component, forwardRef, ChangeDetectionStrategy,
     ElementRef, ChangeDetectorRef, HostBinding, ViewChildren, QueryList } from '@angular/core';
import { IgxGridComponent } from './grid.component';
import { IgxRowDirective } from '../row.directive';
import { GridBaseAPIService } from '../api.service';
import { IgxGridSelectionService, IgxGridCRUDService } from '../selection/selection.service';

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    preserveWhitespaces: false,
    selector: 'igx-grid-row',
    templateUrl: './grid-row.component.html',
    providers: [{ provide: IgxRowDirective, useExisting: forwardRef(() => IgxGridRowComponent) }]
})
export class IgxGridRowComponent extends IgxRowDirective<IgxGridComponent> {

    // R.K. TODO: Remove
    constructor(
        public gridAPI: GridBaseAPIService<IgxGridComponent>,
        public crudService: IgxGridCRUDService,
        public selectionService: IgxGridSelectionService,
        public element: ElementRef,
        public cdr: ChangeDetectorRef) {
            // D.P. constructor duplication due to es6 compilation, might be obsolete in the future
            super(gridAPI, crudService, selectionService, element, cdr);
        }

    @ViewChildren('cell')
    private _cells: QueryList<any>;

    public get cells() {
        const res = new QueryList<any>();
        if (!this._cells) {
            return res;
        }
        const cList = this._cells.toArray().sort((item1, item2) => item1.column.visibleIndex - item2.column.visibleIndex);
        res.reset(cList);
        return res;
    }

    public set cells(cells) {

    }

    @HostBinding('class.igx-grid__tr--mrl')
    get hasColumnLayouts(): boolean {
        return this.grid.hasColumnLayouts;
    }

    getContext(col, row) {
        return {
            $implicit: col,
            row: row
        };
    }

    get expanded() {
        const pk = this.grid.primaryKey;
        const rowID = pk ? this.rowData[pk] : this.rowData;
        return this.grid.expansionStates.get(rowID);
    }
}
