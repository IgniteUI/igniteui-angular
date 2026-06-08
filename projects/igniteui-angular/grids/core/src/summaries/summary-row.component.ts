import {
    Component,
    Input,
    ViewChildren,
    QueryList,
    HostBinding,
    ViewChild,
    ElementRef,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    DoCheck,
    inject
} from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { IgxSummaryCellComponent } from './summary-cell.component';
import { GridType, IGX_GRID_BASE } from '../common/grid.interface';
import { IgxGridNotGroupedPipe } from '../common/pipes';
import { IgxForOfSyncService, IgxGridForOfDirective } from 'igniteui-angular/directives';
import { ColumnType, IgxSummaryResult, trackByIdentity } from 'igniteui-angular/core';


@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'igx-grid-summary-row',
    templateUrl: './summary-row.component.html',
    providers: [IgxForOfSyncService],
    imports: [NgTemplateOutlet, IgxGridForOfDirective, IgxSummaryCellComponent, IgxGridNotGroupedPipe]
})
export class IgxSummaryRowComponent implements DoCheck  {
    public grid = inject<GridType>(IGX_GRID_BASE);
    public element = inject<ElementRef<HTMLElement>>(ElementRef);
    public cdr = inject(ChangeDetectorRef);


    @Input()
    public summaries: Map<string, IgxSummaryResult[]>;

    @Input()
    public gridID;

    @Input()
    public index: number;

    @Input()
    public firstCellIndentation = -1;

    @HostBinding('attr.data-rowIndex')
    public get dataRowIndex() {
        return this.index;
    }

    public get minHeight() {
        return this.grid.summaryRowHeight - 1;
    }

    @ViewChildren(IgxSummaryCellComponent, { read: IgxSummaryCellComponent })
    public _summaryCells: QueryList<IgxSummaryCellComponent>;

    public get summaryCells(): QueryList<IgxSummaryCellComponent> {
        const res = new QueryList<IgxSummaryCellComponent>();
        if (!this._summaryCells) {
            return res;
        }
        const cList = this._summaryCells.filter(c => c.nativeElement.isConnected);
        res.reset(cList);
        return res;
    }
    public set summaryCells(cells) { }

    /**
     * @hidden
     */
    @ViewChild('igxDirRef', { read: IgxGridForOfDirective })
    public virtDirRow: IgxGridForOfDirective<ColumnType, ColumnType[]>;

    public ngDoCheck() {
        this.cdr.markForCheck();
    }

    public get nativeElement() {
        return this.element.nativeElement;
    }

    public getColumnSummaries(columnName: string) {
        if (!this.summaries.get(columnName)) {
            return [];
        }
        return this.summaries.get(columnName);

    }

    /**
     * @hidden
     * @internal
     */
    public isCellActive(visibleColumnIndex) {
        const node = this.grid.navigation.activeNode;
        return node ? node.row === this.index && node.column === visibleColumnIndex : false;
    }

    /**
     * @hidden
     */
    public get pinnedColumns(): ColumnType[] {
        return this.grid.pinnedColumns;
    }


    /**
     * @hidden
     */
    public get pinnedStartColumns(): ColumnType[] {
        return this.grid.pinnedStartColumns;
    }


    /**
     * @hidden
     */
    public get pinnedEndColumns(): ColumnType[] {
        return this.grid.pinnedEndColumns;
    }

    /**
     * @hidden
     */
    public get unpinnedColumns(): ColumnType[] {
        return this.grid.unpinnedColumns;
    }

    public getContext(row, cols) {
        return {
            $implicit: row,
            columns: cols
        };
    }

    /** state persistence switching all pinned columns resets collection */
    protected trackPinnedColumn = trackByIdentity;
}
