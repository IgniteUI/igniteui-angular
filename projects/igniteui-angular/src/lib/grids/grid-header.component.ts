import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    DoCheck,
    ElementRef,
    HostBinding,
    HostListener,
    Input,
    NgZone,
    OnInit,
    Inject,
    OnDestroy,
    NgModuleRef
} from '@angular/core';
import { DataType } from '../data-operations/data-util';
import { SortingDirection } from '../data-operations/sorting-expression.interface';
import { GridBaseAPIService } from './api.service';
import { IgxColumnComponent } from './column.component';
import { IgxGridBaseComponent } from './grid-base.component';
import { IgxFilteringService } from './filtering/grid-filtering.service';
import { IGridDataBindable } from './grid';
import { IgxColumnResizingService } from './grid-column-resizing.service';
import { IgxOverlayService } from '../services/overlay/overlay';
import { IgxGridExcelStyleFilteringComponent } from './filtering/excel-style/grid.excel-style-filtering.component';
import { OverlaySettings, PositionSettings, VerticalAlignment, HorizontalAlignment } from '../services/overlay/utilities';
import { ConnectedPositioningStrategy } from '../services/overlay/position/connected-positioning-strategy';
import { CloseScrollStrategy } from '../services/overlay/scroll/close-scroll-strategy';
import { useAnimation } from '@angular/animations';
import { fadeIn, fadeOut } from 'igniteui-angular';
import { filter, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';

/**
 * @hidden
 */
@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    preserveWhitespaces: false,
    selector: 'igx-grid-header',
    templateUrl: './grid-header.component.html'
})
export class IgxGridHeaderComponent implements DoCheck, OnInit, OnDestroy {

    private _componentOverlayId: string;
    private _filterMenuPositionSettings: PositionSettings;
    private _filterMenuOverlaySettings: OverlaySettings;
    private _destroy$ = new Subject<boolean>();

    @Input()
    public column: IgxColumnComponent;

    @Input()
    public gridID: string;

    @HostBinding('class')
    get styleClasses(): string {
        const defaultClasses = [
            'igx-grid__th--fw',
            this.column.headerClasses
        ];

        const classList = {
            'igx-grid__th': !this.column.columnGroup,
            'asc': this.ascending,
            'desc': this.descending,
            'igx-grid__th--number': this.column.dataType === DataType.Number,
            'igx-grid__th--sortable': this.column.sortable,
            'igx-grid__th--filtrable': this.column.filterable && this.grid.filteringService.isFilterRowVisible,
            'igx-grid__th--sorted': this.sorted
        };

        Object.entries(classList).forEach(([klass, value]) => {
            if (value) {
                defaultClasses.push(klass);
            }
        });
        return defaultClasses.join(' ');
    }

    @HostBinding('style.height.px')
    get height() {
        if (this.grid.hasColumnGroups) {
            return (this.grid.maxLevelHeaderDepth + 1 - this.column.level) * this.grid.defaultRowHeight;
        }
        return null;
    }

    get ascending() {
        return this.sortDirection === SortingDirection.Asc;
    }

    get descending() {
        return this.sortDirection === SortingDirection.Desc;
    }

    get sortingIcon(): string {
        if (this.sortDirection !== SortingDirection.None) {
            // arrow_downward and arrow_upward
            // are material icons ligature strings
            return this.sortDirection === SortingDirection.Asc ? 'arrow_upward' : 'arrow_downward';
        }
        return 'arrow_upward';
    }

    get sorted() {
        return this.sortDirection !== SortingDirection.None;
    }

    get dragged() {
        return this.column === this.column.grid.draggedColumn;
    }

    get filterIconClassName() {
        return this.column.filteringExpressionsTree ? 'igx-excel-filter__icon--filtered' : 'igx-excel-filter__icon';
    }

    @HostBinding('attr.role')
    public hostRole = 'columnheader';

    @HostBinding('attr.tabindex')
    public tabindex = -1;

    @HostBinding('attr.id')
    get headerID() {
        return `${this.gridID}_${this.column.field}`;
    }

    protected sortDirection = SortingDirection.None;

    constructor(
        public gridAPI: GridBaseAPIService<IgxGridBaseComponent & IGridDataBindable>,
        public colResizingService: IgxColumnResizingService,
        public cdr: ChangeDetectorRef,
        public elementRef: ElementRef,
        public zone: NgZone,
        private _filteringService: IgxFilteringService,
        private _moduleRef: NgModuleRef<any>,
        @Inject(IgxOverlayService) private _overlayService: IgxOverlayService
    ) { }

    public ngOnInit() {
        this.initFilteringSettings();
    }

    public ngDoCheck() {
        this.getSortDirection();
        this.cdr.markForCheck();
    }

    ngOnDestroy(): void {
        this._destroy$.next(true);
        this._destroy$.complete();

        if (this._componentOverlayId) {
            this._overlayService.hide(this._componentOverlayId);
        }
    }

    @HostListener('click', ['$event'])
    public onClick(event) {
        if (!this.colResizingService.isColumnResizing) {
            event.stopPropagation();
            if (this.grid.filteringService.isFilterRowVisible) {
                if (this.column.filterable && !this.column.columnGroup &&
                    !this.grid.filteringService.isFilterComplex(this.column.field)) {
                    this.grid.filteringService.filteredColumn = this.column;
                }
            } else if (this.column.sortable) {
                this.triggerSort();
            }
        }
    }

    public onFilteringIconClick(event) {
        event.stopPropagation();

        this.toggleFilterDropdown();
    }

    get grid(): any {
        return this.gridAPI.get(this.gridID);
    }

    protected getSortDirection() {
        const expr = this.gridAPI.get(this.gridID).sortingExpressions.find((x) => x.fieldName === this.column.field);
        this.sortDirection = expr ? expr.dir : SortingDirection.None;
    }

    public onSortingIconClick(event) {
        if (this.grid.filteringService.isFilterRowVisible) {
            event.stopPropagation();
            this.triggerSort();
        }
    }

    private triggerSort() {
        const groupingExpr = this.grid.groupingExpressions ?
            this.grid.groupingExpressions.find((expr) => expr.fieldName === this.column.field) : null;
        const sortDir = groupingExpr ?
            this.sortDirection + 1 > SortingDirection.Desc ? SortingDirection.Asc : SortingDirection.Desc
            : this.sortDirection + 1 > SortingDirection.Desc ? SortingDirection.None : this.sortDirection + 1;
        this.sortDirection = sortDir;
        this.grid.sort({ fieldName: this.column.field, dir: this.sortDirection, ignoreCase: this.column.sortingIgnoreCase,
            strategy: this.column.sortStrategy });
    }

    private toggleFilterDropdown() {
        if (!this._componentOverlayId) {
            const headerTarget = this.elementRef.nativeElement;

            const gridRect = this.grid.nativeElement.getBoundingClientRect();
            const headerRect = headerTarget.getBoundingClientRect();

            let x = headerRect.left;
            let x1 = gridRect.left + gridRect.width;
            x += window.pageXOffset;
            x1 += window.pageXOffset;
            if (Math.abs(x - x1) < 300) {
                this._filterMenuOverlaySettings.positionStrategy.settings.horizontalDirection = HorizontalAlignment.Left;
                this._filterMenuOverlaySettings.positionStrategy.settings.horizontalStartPoint = HorizontalAlignment.Right;
            } else {
                this._filterMenuOverlaySettings.positionStrategy.settings.horizontalDirection = HorizontalAlignment.Right;
                this._filterMenuOverlaySettings.positionStrategy.settings.horizontalStartPoint = HorizontalAlignment.Left;
            }

            this._filterMenuOverlaySettings.positionStrategy.settings.target = headerTarget;
            this._filterMenuOverlaySettings.outlet = this.grid.outlet;

            this._componentOverlayId =
                this._overlayService.attach(IgxGridExcelStyleFilteringComponent, this._filterMenuOverlaySettings, this._moduleRef);
            this._overlayService.show(this._componentOverlayId, this._filterMenuOverlaySettings);
        }
    }

    private initFilteringSettings() {
        this._filterMenuPositionSettings = {
            verticalStartPoint: VerticalAlignment.Bottom,
            openAnimation: useAnimation(fadeIn, {
                params: {
                    duration: '250ms'
                }
            }),
            closeAnimation: useAnimation(fadeOut, {
                params: {
                    duration: '200ms'
                }
            })
        };

        this._filterMenuOverlaySettings = {
            closeOnOutsideClick: true,
            modal: false,
            positionStrategy: new ConnectedPositioningStrategy(this._filterMenuPositionSettings),
            scrollStrategy: new CloseScrollStrategy()
        };

        this._overlayService.onOpening.pipe(
            filter((overlay) => overlay.id === this._componentOverlayId),
            takeUntil(this._destroy$)).subscribe((eventArgs) => {
                this.onOverlayOpening(eventArgs);
            });

        this._overlayService.onOpened.pipe(
            filter((overlay) => overlay.id === this._componentOverlayId),
            takeUntil(this._destroy$)).subscribe((eventArgs) => {
                this.onOverlayOpened(eventArgs);
            });

        this._overlayService.onClosed.pipe(
            filter(overlay => overlay.id === this._componentOverlayId),
            takeUntil(this._destroy$)).subscribe(() => {
                this.onOverlayClosed();
            });
    }

    private onOverlayOpening(eventArgs) {
        const instance = eventArgs.componentRef.instance as IgxGridExcelStyleFilteringComponent;
        if (instance) {
            instance.initialize(this.column, this._filteringService, this._overlayService, eventArgs.id);
        }
    }

    private onOverlayOpened(eventArgs) {
        const instance = eventArgs.componentRef.instance as IgxGridExcelStyleFilteringComponent;
        if (instance) {
            instance.toggleDropdown(this._filterMenuOverlaySettings);
        }
    }

    private onOverlayClosed() {
        this._componentOverlayId = null;
    }
}
