import {
    AfterViewInit,
    Directive,
    EventEmitter,
    Output,
    Input,
    OnInit,
    OnDestroy,
    inject
} from '@angular/core';
import { AbsoluteScrollStrategy, AutoPositionStrategy, HorizontalAlignment, IgxOverlayService, OverlayCancelableEventArgs, OverlaySettings, VerticalAlignment } from 'igniteui-angular/core';
import { IgxGridComponent } from 'igniteui-angular/grids/grid';
import { IColumnSelectionEventArgs } from 'igniteui-angular/grids/core';
import { merge, Subject } from 'rxjs';
import { debounceTime, filter, takeUntil } from 'rxjs/operators';
import { IgxChartIntegrationDirective } from '../directives/chart-integration/chart-integration.directive';
import { IgxConditionalFormattingDirective } from '../directives/conditional-formatting/conditional-formatting.directive';
import { IgxContextMenuComponent } from './context-menu.component';

@Directive({
    selector: '[igxContextMenu]',
})
export class IgxContextMenuDirective implements OnInit, AfterViewInit, OnDestroy {
    @Input() public displayCreationTab: boolean = true;
    @Output() public buttonClose = new EventEmitter<any>();

    public formatters = [];
    public charts = [];
    public gridResizeNotify = new Subject<void>();
    private contentObserver: ResizeObserver;
    private _range;
    private _id;
    private _collapsed = true;
    private destroy$ = new Subject<boolean>();
    private _analyticsBtnSettings: OverlaySettings = {
        closeOnOutsideClick: false,
        modal: false
    };

    public readonly grid = inject(IgxGridComponent);
    public readonly textFormatter = inject(IgxConditionalFormattingDirective, { optional: true });
    public readonly chartsDirective = inject(IgxChartIntegrationDirective, { optional: true });
    private readonly overlayService = inject(IgxOverlayService);

    constructor() { }

    public ngOnInit() {
        this.gridResizeNotify.pipe(takeUntil(this.destroy$))
            .subscribe(() => {
                if (this._id && !this._collapsed) {
                    this.renderButton();
                }
            });
    }

    public ngAfterViewInit() {
        this.setUpGridListeners();
        if (this.textFormatter) {
            this.textFormatter.formattersReady.pipe(takeUntil(this.destroy$))
                .subscribe(names => this.formatters = names);
        }
        if (this.chartsDirective) {
            this.chartsDirective.chartTypesDetermined.pipe(takeUntil(this.destroy$))
                .subscribe((args) => this.charts = args.chartsForCreation);
        }
        this.overlayService.opening.pipe(takeUntil(this.destroy$))
            .subscribe((args: OverlayCancelableEventArgs) => {
                if (args.componentRef) {
                    const instance = (args.componentRef.instance as IgxContextMenuComponent);
                    instance.contextDirective = this;
                }
            });
    }

    public ngOnDestroy(): void {
        this.destroy$.next(true);
        this.destroy$.complete();
        if (!this._collapsed) {
            this.close();
        }
    }

    private setUpGridListeners() {
        this.contentObserver = new ResizeObserver(() => this.gridResizeNotify.next());
        this.contentObserver.observe(this.grid.nativeElement);

        this.grid.columnSelectionChanging.pipe(debounceTime(100))
            .subscribe((args: IColumnSelectionEventArgs) => {
                if (args.newSelection && args.oldSelection && !this._collapsed) {
                    this.close();
                }
                this.grid.clearCellSelection();
                this.chartsDirective.chartData = this.grid.getSelectedColumnsData();
                if (!this._collapsed) {
                    this.buttonClose.emit();
                }
                this.renderHeaderButton();
            });

        this.grid.rangeSelected.pipe(takeUntil(this.destroy$), debounceTime(200))
            .subscribe((args) => {
                this._range = args;
                if (this.chartsDirective) {
                    if (this.grid.getSelectedRanges().length === 1) {
                        this.chartsDirective.chartData = this.grid.getSelectedData();
                    } else {
                        this.chartsDirective.chartData = [];
                    }
                }
                if (!this._collapsed) {
                    this.buttonClose.emit();
                }
                this.renderButton();
            });
        merge(
            this.grid.verticalScrollContainer.chunkLoad,
            this.grid.parentVirtDir.chunkLoad,
            this.grid.filteringDone,
            this.grid.columnResized,
            this.grid.columnVisibilityChanged.pipe(debounceTime(200))
        ).pipe(
            filter(() => this._range), takeUntil(this.destroy$)).subscribe(() => {
                this.buttonClose.emit();
                this.renderButton();
            });
        merge(this.grid.selected, this.grid.groupingDone).pipe(
            takeUntil(this.destroy$)).subscribe((args: any) => {
                if (this.grid.selectedCells.length < 2 || args.expressions) {
                    this._range = undefined;
                    this.close();
                }
            });
    }

    private renderButton() {
        if (!this._range) {
            return;
        }
        let rowIndex = this._range.rowEnd;
        let colIndex = +this._range.columnEnd;
        while (colIndex >= this._range.columnStart && !this.grid.navigation.isColumnFullyVisible(colIndex)) {
            colIndex--;
        }
        while (rowIndex >= this._range.rowStart && this.grid.navigation.shouldPerformVerticalScroll(rowIndex, -1)) {
            rowIndex--;
        }
        const field = this.grid.visibleColumns[colIndex] ? this.grid.visibleColumns[colIndex].field : '';
        const cell = this.grid.gridAPI.get_cell_by_index(rowIndex, field);
        if (!cell || !this.isWithInRange(cell.row.key, cell.column.index - 1)) {
            this.close();
            return;
        }
        this._analyticsBtnSettings.positionStrategy = new AutoPositionStrategy({
            horizontalDirection: HorizontalAlignment.Right,
            horizontalStartPoint: HorizontalAlignment.Right,
            verticalStartPoint: VerticalAlignment.Bottom,
            verticalDirection: VerticalAlignment.Bottom, closeAnimation: null
        });
        this._analyticsBtnSettings.target = cell.nativeElement;
        this._analyticsBtnSettings.scrollStrategy = new AbsoluteScrollStrategy();
        const info = this.overlayService.getOverlayById(this._id);
        if (info) {
            info.settings.positionStrategy = this._analyticsBtnSettings.positionStrategy;
        }
        if (this._collapsed) {
            this.show();
        } else {
            this.overlayService.reposition(this._id);
        }
    }

    private renderHeaderButton() {
        const selectedColumns = this.grid.selectedColumns();
        if (selectedColumns.length === 0) {
            return;
        }

        this._analyticsBtnSettings.positionStrategy = new AutoPositionStrategy({
            horizontalDirection: HorizontalAlignment.Right,
            horizontalStartPoint: HorizontalAlignment.Right,
            verticalStartPoint: VerticalAlignment.Bottom,
            verticalDirection: VerticalAlignment.Bottom, closeAnimation: null
        });

        const selectedColumnsIndexes = selectedColumns.map(c => c.visibleIndex).sort((a, b) => a - b);
        let colIndex = selectedColumnsIndexes[selectedColumnsIndexes.length - 1];

        while (selectedColumnsIndexes.length) {
            if (this.grid.navigation.isColumnFullyVisible(colIndex)) {
                break;
            }
            selectedColumnsIndexes.pop();
            colIndex = selectedColumnsIndexes[selectedColumnsIndexes.length - 1];
        }

        if (!selectedColumnsIndexes.length) {
            return;
        }

        const col = selectedColumns.find(c => c.visibleIndex === colIndex);

        if (!col) {
            return;
        }

        const headerCell = col.headerCell.nativeElement;
        this._analyticsBtnSettings.target = headerCell;
        this._analyticsBtnSettings.scrollStrategy = new AbsoluteScrollStrategy();
        const info = this.overlayService.getOverlayById(this._id);
        if (info) {
            info.settings.positionStrategy = this._analyticsBtnSettings.positionStrategy;
        }
        if (this._collapsed) {
            this.show();
        } else {
            this.overlayService.reposition(this._id);
        }
    }

    private show() {
        if (!this._collapsed) {
            return;
        }
        this._collapsed = false;
        this._id = this._id ? this._id :
            this.overlayService.attach(IgxContextMenuComponent, this._analyticsBtnSettings);
        this.overlayService.show(this._id);
    }

    private close() {
        if (this._collapsed) {
            return;
        }
        this._collapsed = true;
        this.overlayService.hide(this._id);
        this.buttonClose.emit();
        this._id = undefined;
    }

    private isWithInRange(rInex, cIndex) {
        return rInex >= this._range.rowStart && rInex <= this._range.rowEnd
            && cIndex >= this._range.columnStart && cIndex <= this._range.columnEnd;
    }
}
