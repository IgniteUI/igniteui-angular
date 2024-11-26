import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    ElementRef,
    Inject,
    OnChanges,
    QueryList,
    Renderer2,
    ViewChild,
    SimpleChanges,
    ViewChildren
} from '@angular/core';
import { IBaseChipEventArgs, IgxChipComponent } from '../../chips/chip.component';
import { IgxChipsAreaComponent } from '../../chips/chips-area.component';
import { SortingDirection } from '../../data-operations/sorting-strategy';
import { IgxGridForOfDirective } from '../../directives/for-of/for_of.directive';
import { ISelectionEventArgs } from '../../drop-down/drop-down.common';
import { IgxDropDownComponent } from '../../drop-down/drop-down.component';
import { AbsoluteScrollStrategy, AutoPositionStrategy, OverlaySettings, PositionSettings, VerticalAlignment } from '../../services/public_api';
import { ColumnType, IGX_GRID_BASE, PivotGridType } from '../common/grid.interface';
import { IgxGridHeaderGroupComponent } from '../headers/grid-header-group.component';
import { IgxGridHeaderRowComponent } from '../headers/grid-header-row.component';
import { DropPosition } from '../moving/moving.service';
import { IPivotAggregator, IPivotDimension, IPivotValue, PivotDimensionType } from './pivot-grid.interface';
import { PivotUtil } from './pivot-util';
import { IgxGridTopLevelColumns } from '../common/pipes';
import { IgxHeaderGroupWidthPipe, IgxHeaderGroupStylePipe } from '../headers/pipes';
import { IgxExcelStyleSearchComponent } from '../filtering/excel-style/excel-style-search.component';
import { IgxGridExcelStyleFilteringComponent, IgxExcelStyleColumnOperationsTemplateDirective, IgxExcelStyleFilterOperationsTemplateDirective } from '../filtering/excel-style/excel-style-filtering.component';
import { IgxDropDownItemComponent } from '../../drop-down/drop-down-item.component';
import { IgxDropDownItemNavigationDirective } from '../../drop-down/drop-down-navigation.directive';
import { IgxSuffixDirective } from '../../directives/suffix/suffix.directive';
import { IgxBadgeComponent } from '../../badge/badge.component';
import { IgxPrefixDirective } from '../../directives/prefix/prefix.directive';
import { IgxIconComponent } from '../../icon/icon.component';
import { IgxDropDirective } from '../../directives/drag-drop/drag-drop.directive';
import { NgIf, NgFor, NgTemplateOutlet, NgClass, NgStyle } from '@angular/common';
import { IgxPivotRowHeaderGroupComponent } from './pivot-row-header-group.component';
import { IgxPivotRowDimensionHeaderGroupComponent } from './pivot-row-dimension-header-group.component';

/**
 *
 * For all intents & purposes treat this component as what a <thead> usually is in the default <table> element.
 *
 * This container holds the pivot grid header elements and their behavior/interactions.
 *
 * @hidden @internal
 */
@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'igx-pivot-header-row',
    templateUrl: './pivot-header-row.component.html',
    imports: [NgIf, IgxDropDirective, IgxChipsAreaComponent, NgFor, IgxChipComponent, IgxIconComponent,
        IgxPrefixDirective, IgxBadgeComponent, IgxSuffixDirective, IgxDropDownItemNavigationDirective,
        NgTemplateOutlet, IgxGridHeaderGroupComponent, NgClass, NgStyle, IgxGridForOfDirective,
        IgxDropDownComponent, IgxDropDownItemComponent, IgxGridExcelStyleFilteringComponent,
        IgxExcelStyleColumnOperationsTemplateDirective, IgxExcelStyleFilterOperationsTemplateDirective,
        IgxExcelStyleSearchComponent, IgxHeaderGroupWidthPipe, IgxHeaderGroupStylePipe, IgxGridTopLevelColumns,
        IgxPivotRowHeaderGroupComponent]
})
export class IgxPivotHeaderRowComponent extends IgxGridHeaderRowComponent implements OnChanges {
    public aggregateList: IPivotAggregator[] = [];

    public value: IPivotValue;
    public filterDropdownDimensions: Set<any> = new Set<any>();
    public filterAreaDimensions: Set<any> = new Set<any>();
    private _dropPos = DropPosition.AfterDropTarget;
    private valueData: Map<string, IPivotAggregator[]>;
    private _subMenuPositionSettings: PositionSettings = {
        verticalStartPoint: VerticalAlignment.Bottom,
        closeAnimation: undefined
    };
    private _subMenuOverlaySettings: OverlaySettings = {
        closeOnOutsideClick: true,
        modal: false,
        positionStrategy: new AutoPositionStrategy(this._subMenuPositionSettings),
        scrollStrategy: new AbsoluteScrollStrategy()
    };

    /**
     * @hidden @internal
     */
    @ViewChild('esf') public esf: any;

    /**
     * @hidden @internal
     */
    @ViewChild('filterAreaHidden', { static: false }) public filterArea;

    /**
     * @hidden @internal
     */
    @ViewChild('filterIcon') public filtersButton;

    /**
     * @hidden @internal
     */
    @ViewChild('dropdownChips') public dropdownChips;

    /**
     * @hidden @internal
     */
    @ViewChild('pivotFilterContainer') public pivotFilterContainer;

    /**
     * @hidden @internal
     */
    @ViewChild('pivotRowContainer') public pivotRowContainer;

    /**
    * @hidden
    * @internal
    */
    @ViewChildren('notifyChip')
    public notificationChips: QueryList<IgxChipComponent>;

    /**
    * @hidden
    * @internal
    * The virtualized part of the header row containing the unpinned header groups.
    */
    @ViewChildren('headerVirtualContainer', { read: IgxGridForOfDirective })
    public headerContainers: QueryList<IgxGridForOfDirective<ColumnType, ColumnType[]>>;

    /**
    * @hidden
    * @internal
    */
    @ViewChildren('rowDimensionHeaders')
    public rowDimensionHeaders: QueryList<IgxPivotRowDimensionHeaderGroupComponent>;

    public override get headerForOf() {
        return this.headerContainers?.last;
    }

    constructor(
        @Inject(IGX_GRID_BASE) public override grid: PivotGridType,
        ref: ElementRef<HTMLElement>,
        cdr: ChangeDetectorRef,
        protected renderer: Renderer2,
    ) {
        super(ref, cdr);
    }

    /**
    * @hidden
    * @internal
    * Default is a single empty level since default depth is 1
    */
    public columnDimensionsByLevel: any[] = [[]];

    /**
    * @hidden @internal
    */
    public get isFiltersButton(): boolean {
        let chipsWidth = 0;
        this.filterDropdownDimensions.clear();
        this.filterAreaDimensions.clear();
        if (this.filterArea?.chipsList && this.filterArea.chipsList.length !== 0) {
            const styles = getComputedStyle(this.pivotFilterContainer.nativeElement);
            const containerPaddings = parseFloat(styles.paddingLeft) + parseFloat(styles.paddingRight);
            chipsWidth += containerPaddings + (this.filtersButton && this.filterArea?.chipsList.length > 1 ? this.filtersButton.el.nativeElement.getBoundingClientRect().width : 0);
            this.filterArea.chipsList.forEach(chip => {
                const dim = this.grid.filterDimensions.find(x => x.memberName === chip.id);
                if (dim) {
                    // 8 px margin between chips
                    const currentChipWidth = chip.nativeElement.getBoundingClientRect().width + 8;
                    if (chipsWidth + currentChipWidth < this.grid.pivotRowWidths) {
                        this.filterAreaDimensions.add(dim);
                    } else {
                        this.filterDropdownDimensions.add(dim);
                    }
                    chipsWidth += currentChipWidth;
                }
            });
            return this.filterDropdownDimensions.size > 0;
        }
        return false;
    }

    /**
    * @hidden
    * @internal
    */
    public get totalDepth() {
        const columnDimensions = this.grid.columnDimensions;
        if (columnDimensions.length === 0) {
            return 1;
        }
        let totalDepth = columnDimensions.map(x => PivotUtil.getDimensionDepth(x) + 1).reduce((acc, val) => acc + val);
        if (this.grid.hasMultipleValues) {
            totalDepth += 1;
        }
        return totalDepth;
    }

    /**
    * @hidden
    * @internal
    */
    public get maxContainerHeight() {
        return this.totalDepth * this.grid.renderedRowHeight;
    }

    /**
    * @hidden
    * @internal
    */
    public calcHeight(col: ColumnType, index: number) {
        return !col.columnGroup && col.level < this.totalDepth && col.level === index ? (this.totalDepth - col.level) * this.grid.rowHeight : this.grid.rowHeight;
    }

    /**
    * @hidden
    * @internal
    */
    public isDuplicateOfExistingParent(col: ColumnType, lvl: number) {
        const parentCollection = lvl > 0 ? this.columnDimensionsByLevel[lvl - 1] : [];
        const duplicate = parentCollection.indexOf(col) !== -1;

        return duplicate;
    }

    /**
    * @hidden
    * @internal
    */
    public isMultiRow(col: ColumnType, lvl: number) {
        const isLeaf = !col.columnGroup;
        return isLeaf && lvl !== this.totalDepth - 1;
    }

    /**
    * @hidden
    * @internal
    */
    public populateColumnDimensionsByLevel() {
        const res = [];
        for (let i = 0; i < this.totalDepth; i++) {
            res[i] = [];
        }
        const cols = this.unpinnedColumnCollection;
        // populate column dimension matrix recursively
        this.populateDimensionRecursively(cols.filter(x => x.level === 0), 0, res);
        this.columnDimensionsByLevel = res;
    }

    protected populateDimensionRecursively(currentLevelColumns: ColumnType[], level = 0, res: any[]) {
        currentLevelColumns.forEach(col => {
            if (res[level]) {
                res[level].push(col);
                if (col.columnGroup && col.children.length > 0) {
                    const visibleColumns = col.children.toArray().filter(x => !x.hidden);
                    this.populateDimensionRecursively(visibleColumns, level + 1, res);
                } else if (level < this.totalDepth - 1) {
                    for (let i = level + 1; i <= this.totalDepth - 1; i++) {
                        res[i].push(col);
                    }
                }
            }
        });
    }

    /**
    * @hidden
    * @internal
    */
    public ngOnChanges(changes: SimpleChanges) {
        if (changes.unpinnedColumnCollection) {
            this.populateColumnDimensionsByLevel();
        }
    }

    /**
    * @hidden
    * @internal
    */
    public onDimDragStart(event, area) {
        this.cdr.detectChanges();
        for (const chip of this.notificationChips) {
            const parent = chip.nativeElement.parentElement;
            if (area.chipsList.toArray().indexOf(chip) === -1 &&
                parent.children.length > 0 &&
                parent.children.item(0).id !== 'empty') {
                chip.nativeElement.hidden = false;
                parent.parentElement.scrollTo({ left: chip.nativeElement.offsetLeft });
            }
        }
    }

    /**
    * @hidden
    * @internal
    */
    public onDimDragEnd() {
        for (const chip of this.notificationChips) {
            chip.nativeElement.hidden = true;
        }
    }

    /**
    * @hidden
    * @internal
    */
    public getAreaHeight(area: IgxChipsAreaComponent) {
        const chips = area.chipsList;
        return chips && chips.length > 0 ? chips.first.nativeElement.offsetHeight : 0;
    }

    /**
    * @hidden
    * @internal
    */
    public rowRemoved(event: IBaseChipEventArgs) {
        const row = this.grid.pivotConfiguration.rows.find(x => x.memberName === event.owner.id);
        this.grid.toggleDimension(row);
    }

    /**
    * @hidden
    * @internal
    */
    public columnRemoved(event: IBaseChipEventArgs) {
        const col = this.grid.pivotConfiguration.columns.find(x => x.memberName === event.owner.id);
        this.grid.toggleDimension(col);
    }

    /**
    * @hidden
    * @internal
    */
    public valueRemoved(event: IBaseChipEventArgs) {
        const value = this.grid.pivotConfiguration.values.find(x => x.member === event.owner.id || x.displayName === event.owner.id);
        this.grid.toggleValue(value);
    }

    /**
    * @hidden
    * @internal
    */
    public filterRemoved(event: IBaseChipEventArgs) {
        const filter = this.grid.pivotConfiguration.filters.find(x => x.memberName === event.owner.id);
        this.grid.toggleDimension(filter);
        if (this.filterDropdownDimensions.size > 0) {
            this.onFiltersAreaDropdownClick({ target: this.filtersButton.el.nativeElement }, undefined, false);
        } else {
            this.grid.filteringService.hideESF();
        }
    }

    public onFiltersSelectionChanged(event?: IBaseChipEventArgs) {
        this.dropdownChips.chipsList.forEach(chip => {
            if (chip.id !== event.owner.id) {
                chip.selected = false
            }
        });
        this.onFiltersAreaDropdownClick({ target: this.filtersButton.el.nativeElement }, this.grid.filterDimensions.find(dim => dim.memberName === event.owner.id), false);
    }

    /**
    * @hidden
    * @internal
    */
    public onFilteringIconPointerDown(event) {
        event.stopPropagation();
        event.preventDefault();
    }

    /**
    * @hidden
    * @internal
    */
    public onFilteringIconClick(event, dimension) {
        event.stopPropagation();
        event.preventDefault();
        const dim = dimension;
        const col = this.grid.dimensionDataColumns.find(x => x.field === dim.memberName || x.field === dim.member);
        this.grid.filteringService.toggleFilterDropdown(event.target, col);
    }

    /**
    * @hidden
    * @internal
    */
    public onSummaryClick(eventArgs, value: IPivotValue, dropdown: IgxDropDownComponent, chip: IgxChipComponent) {
        this._subMenuOverlaySettings.target = eventArgs.currentTarget;
        this.updateDropDown(value, dropdown, chip);
    }

    /**
     * @hidden @internal
     */
    public onFiltersAreaDropdownClick(event, dimension?, shouldReattach = true) {
        const dim = dimension || this.filterDropdownDimensions.values().next().value;
        const col = this.grid.dimensionDataColumns.find(x => x.field === dim.memberName || x.field === dim.member);
        if (shouldReattach) {
            this.dropdownChips.chipsList.forEach(chip => {
                chip.selected = false
            });
            this.dropdownChips.chipsList.first.selected = true;
        }
        this.grid.filteringService.toggleFiltersESF(this.esf, event.target, col, shouldReattach);
    }

    /**
    * @hidden
    * @internal
    */
    public onAggregationChange(event: ISelectionEventArgs) {
        if (!this.isSelected(event.newSelection.value)) {
            this.value.aggregate = event.newSelection.value;
            this.grid.pipeTrigger++;
        }
    }

    /**
    * @hidden
    * @internal
    */
    public isSelected(val: IPivotAggregator) {
        return this.value.aggregate.key === val.key;
    }

    /**
    * @hidden
    * @internal
    */
    public onChipSort(_event, dimension: IPivotDimension) {
        if (dimension.sortable === undefined || dimension.sortable) {
            const startDirection = dimension.sortDirection || SortingDirection.None;
            const direction = startDirection + 1 > SortingDirection.Desc ?
                SortingDirection.None : startDirection + 1;
            this.grid.sortDimension(dimension, direction);
        }
    }

    /**
    * @hidden
    * @internal
    */
    public onDimDragOver(event, dimension?: PivotDimensionType) {
        if (!event.dragChip || !event.dragChip.data?.pivotArea) return;
        const typeMismatch = dimension !== undefined ? this.grid.pivotConfiguration.values.find(x => x.member === event.dragChip.id
            || x.displayName === event.dragChip.id) :
            !this.grid.pivotConfiguration.values.find(x => x.member === event.dragChip.id || x.displayName === event.dragChip.id);
        if (typeMismatch) {
            // cannot drag between dimensions and value
            return;
        }
        // if we are in the left half of the chip, drop on the left
        // else drop on the right of the chip
        const clientRect = event.owner.nativeElement.getBoundingClientRect();
        const pos = clientRect.width / 2;

        this._dropPos = event.originalEvent.offsetX > pos ? DropPosition.AfterDropTarget : DropPosition.BeforeDropTarget;
        if (this._dropPos === DropPosition.AfterDropTarget) {
            event.owner.nativeElement.previousElementSibling.style.visibility = 'hidden';
            event.owner.nativeElement.nextElementSibling.style.visibility = '';
        } else {
            event.owner.nativeElement.nextElementSibling.style.visibility = 'hidden';
            event.owner.nativeElement.previousElementSibling.style.visibility = '';
        }
    }

    /**
    * @hidden
    * @internal
    */
    public onDimDragLeave(event) {
        event.owner.nativeElement.previousElementSibling.style.visibility = 'hidden';
        event.owner.nativeElement.nextElementSibling.style.visibility = 'hidden';
        this._dropPos = DropPosition.AfterDropTarget;
    }

    /**
    * @hidden
    * @internal
    */
    public onAreaDragLeave(event, area) {
        const dataChips = area.chipsList.toArray().filter(x => this.notificationChips.toArray().indexOf(x) === -1);
        dataChips.forEach(element => {
            if (element.nativeElement.previousElementSibling) {
                element.nativeElement.previousElementSibling.style.visibility = 'hidden';
            }
            if (element.nativeElement.nextElementSibling) {
                element.nativeElement.nextElementSibling.style.visibility = 'hidden';
            }
        });
    }

    /**
    * @hidden
    * @internal
    */
    public onValueDrop(event, area) {
        if (!(event.dragChip && event.dragChip.data?.pivotArea) && !(event.dragData?.chip && !!event.dragData.chip.data.pivotArea)) return;
        //values can only be reordered
        const values = this.grid.pivotConfiguration.values;
        const dragId = event.dragChip?.id || event.dragData?.chip.id;
        const chipsArray = area.chipsList.toArray();
        let chipIndex = chipsArray.indexOf(event.owner) !== -1 ? chipsArray.indexOf(event.owner) : chipsArray.length;
        chipIndex = this._dropPos === DropPosition.AfterDropTarget ? chipIndex + 1 : chipIndex;
        const value = values.find(x => x.member === dragId || x.displayName === dragId);
        if (value) {
            const dragChipIndex = chipsArray.indexOf(event.dragChip || event.dragData.chip);
            this.grid.moveValue(value, dragChipIndex >= chipIndex ? chipIndex : chipIndex - 1);
        }
    }

    /**
    * @hidden
    * @internal
    */
    public onDimDrop(event, area, dimensionType: PivotDimensionType) {
        if (!(event.dragChip && event.dragChip.data?.pivotArea) && !(event.dragData?.chip && !!event.dragData.chip.data.pivotArea)) return;
        const dragId = event.dragChip?.id || event.dragData?.chip.id;
        const currentDim = this.grid.getDimensionsByType(dimensionType);
        const chipsArray = area.chipsList.toArray();
        const chip = chipsArray.find(x => x.id === dragId);
        const isNewChip = chip === undefined;
        const isReorder = event.owner.id !== undefined;
        //const chipIndex = chipsArray.indexOf(event.owner) !== -1 ? chipsArray.indexOf(event.owner) : chipsArray.length;
        const chipIndex = currentDim.findIndex(x => x.memberName === event.owner.id) !== -1 ?
            currentDim.findIndex(x => x.memberName === event.owner.id) : currentDim.length;
        const targetIndex = this._dropPos === DropPosition.AfterDropTarget ? chipIndex + 1 : chipIndex;
        if (isNewChip) {
            // chip moved from an external collection
            const dim = this.grid.allDimensions.find(x => x && x.memberName === dragId);
            if (!dim) {
                // you have dragged something that is not a dimension
                return;
            }
            this.grid.moveDimension(dim, dimensionType, targetIndex);
        } else if (isReorder) {
            // chip from same collection, reordered.
            const newDim = currentDim.find(x => x.memberName === dragId);
            const dragChipIndex = currentDim.findIndex(x => x.memberName === dragId);
            this.grid.moveDimension(newDim, dimensionType, dragChipIndex > chipIndex ? targetIndex : targetIndex - 1);
        }
        this.grid.pipeTrigger++;
        this.grid.dimensionsChange.emit({ dimensions: currentDim, dimensionCollectionType: dimensionType });
        // clean states
        this.onDimDragEnd();
        this.onAreaDragLeave(event, area);
    }

    protected updateDropDown(value: IPivotValue, dropdown: IgxDropDownComponent, chip: IgxChipComponent) {
        this.value = value;
        dropdown.width = chip.nativeElement.clientWidth + 'px';
        this.aggregateList = PivotUtil.getAggregateList(value, this.grid);
        this.cdr.detectChanges();
        dropdown.open(this._subMenuOverlaySettings);
    }

    protected getRowDimensionColumn(dim: IPivotDimension): ColumnType {
        return this.grid.dimensionDataColumns ? this.grid.dimensionDataColumns.find((col) => col.field === dim.memberName) : null;
    }
}
