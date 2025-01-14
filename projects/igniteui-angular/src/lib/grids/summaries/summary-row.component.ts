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
    Inject
} from '@angular/core';
import { IgxSummaryResult } from './grid-summary';
import { IgxSummaryCellComponent } from './summary-cell.component';
import { IgxGridForOfDirective } from '../../directives/for-of/for_of.directive';
import { IgxForOfSyncService } from '../../directives/for-of/for_of.sync.service';
import { ColumnType, GridType, IGX_GRID_BASE } from '../common/grid.interface';
import { IgxGridNotGroupedPipe } from '../common/pipes';
import { NgIf, NgTemplateOutlet, NgFor } from '@angular/common';


@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'igx-grid-summary-row',
    templateUrl: './summary-row.component.html',
    providers: [IgxForOfSyncService],
    imports: [NgIf, NgTemplateOutlet, IgxGridForOfDirective, IgxSummaryCellComponent, NgFor, IgxGridNotGroupedPipe]
})
export class IgxSummaryRowComponent implements DoCheck  {

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

    constructor(@Inject(IGX_GRID_BASE) public grid: GridType,
                public element: ElementRef<HTMLElement>,
                public cdr: ChangeDetectorRef) {}

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
    public get unpinnedColumns(): ColumnType[] {
        return this.grid.unpinnedColumns;
    }

    public getContext(row) {
        return {
            $implicit: row
        };
    }
}
