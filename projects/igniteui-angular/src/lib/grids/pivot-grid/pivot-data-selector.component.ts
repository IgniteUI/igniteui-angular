import { useAnimation } from "@angular/animations";
import {
    ChangeDetectorRef,
    Component,
    EventEmitter,
    HostBinding,
    Input,
    Output,
    Renderer2,
    booleanAttribute
} from "@angular/core";
import { first } from "rxjs/operators";
import { SortingDirection } from "../../data-operations/sorting-strategy";
import { IDragBaseEventArgs, IDragGhostBaseEventArgs, IDragMoveEventArgs, IDropBaseEventArgs, IDropDroppedEventArgs, IgxDropDirective, IgxDragDirective, IgxDragHandleDirective } from "../../directives/drag-drop/drag-drop.directive";
import { ISelectionEventArgs } from "../../drop-down/drop-down.common";
import { IgxDropDownComponent } from "../../drop-down/drop-down.component";
import {
    AbsoluteScrollStrategy,
    AutoPositionStrategy,
    OverlaySettings,
    PositionSettings,
    VerticalAlignment
} from "../../services/public_api";
import { ColumnType, PivotGridType } from "../common/grid.interface";
import {
    IPivotAggregator,
    IPivotDimension,
    IPivotValue,
    PivotDimensionType
} from "./pivot-grid.interface";
import { PivotUtil } from './pivot-util';
import { IgxFilterPivotItemsPipe } from "./pivot-grid.pipes";
import { IgxDropDownItemComponent } from "../../drop-down/drop-down-item.component";
import { IgxDropDownItemNavigationDirective } from "../../drop-down/drop-down-navigation.directive";
import { IgxExpansionPanelBodyComponent } from "../../expansion-panel/expansion-panel-body.component";
import { IgxChipComponent } from "../../chips/chip.component";
import { IgxExpansionPanelTitleDirective } from "../../expansion-panel/expansion-panel.directives";
import { IgxExpansionPanelHeaderComponent } from "../../expansion-panel/expansion-panel-header.component";
import { IgxExpansionPanelComponent } from "../../expansion-panel/expansion-panel.component";
import { IgxAccordionComponent } from "../../accordion/accordion.component";
import { IgxCheckboxComponent } from "../../checkbox/checkbox.component";
import { IgxListItemComponent } from "../../list/list-item.component";
import { NgFor, NgIf } from "@angular/common";
import { IgxListComponent } from "../../list/list.component";
import { IgxInputDirective } from "../../directives/input/input.directive";
import { IgxPrefixDirective } from "../../directives/prefix/prefix.directive";
import { IgxIconComponent } from "../../icon/icon.component";
import { IgxInputGroupComponent } from "../../input-group/input-group.component";
import { fadeIn, fadeOut } from 'igniteui-angular/animations';
import { Size } from '../common/enums';

interface IDataSelectorPanel {
    name: string;
    i18n: string;
    type?: PivotDimensionType;
    dataKey: string;
    icon: string;
    itemKey: string;
    displayKey?: string;
    sortable: boolean;
    dragChannels: string[];
}

/* blazorIndirectRender
   blazorComponent */
/* wcElementTag: igc-pivot-data-selector */
/**
 * Pivot Data Selector provides means to configure the pivot state of the Pivot Grid via a vertical panel UI
 *
 * @igxModule IgxPivotGridModule
 * @igxGroup Grids & Lists
 * @igxKeywords data selector, pivot, grid
 * @igxTheme pivot-data-selector-theme
 * @remarks
 * The Ignite UI Data Selector has a searchable list with the grid data columns,
 * there are also four expandable areas underneath for filters, rows, columns, and values
 * is used for grouping and aggregating simple flat data into a pivot table.
 * @example
 * ```html
 * <igx-pivot-grid #grid1 [data]="data" [pivotConfiguration]="configuration">
 * </igx-pivot-grid>
 * <igx-pivot-data-selector [grid]="grid1"></igx-pivot-data-selector>
 * ```
 */
@Component({
    selector: "igx-pivot-data-selector",
    templateUrl: "./pivot-data-selector.component.html",
    imports: [IgxInputGroupComponent, IgxIconComponent, IgxPrefixDirective, IgxInputDirective, IgxListComponent, NgFor, IgxListItemComponent, IgxCheckboxComponent, IgxAccordionComponent, IgxExpansionPanelComponent, IgxExpansionPanelHeaderComponent, IgxDropDirective, IgxExpansionPanelTitleDirective, IgxChipComponent, IgxExpansionPanelBodyComponent, NgIf, IgxDragDirective, IgxDropDownItemNavigationDirective, IgxDragHandleDirective, IgxDropDownComponent, IgxDropDownItemComponent, IgxFilterPivotItemsPipe]
})
export class IgxPivotDataSelectorComponent {

    /**
     * Gets/sets whether the columns panel is expanded
     * Get
     * ```typescript
     *  const columnsPanelState: boolean = this.dataSelector.columnsExpanded;
     * ```
     * Set
     * ```html
     * <igx-pivot-data-selector [grid]="grid1" [columnsExpanded]="columnsPanelState"></igx-pivot-data-selector>
     * ```
     *
     * Two-way data binding:
     * ```html
     * <igx-pivot-data-selector [grid]="grid1" [(columnsExpanded)]="columnsPanelState"></igx-pivot-data-selector>
     * ```
     */
    @Input({ transform: booleanAttribute })
    public columnsExpanded = true;

    /**
     * @hidden
     */
    @Output()
    public columnsExpandedChange = new EventEmitter<boolean>();

    /**
     * Gets/sets whether the rows panel is expanded
     * Get
     * ```typescript
     *  const rowsPanelState: boolean = this.dataSelector.rowsExpanded;
     * ```
     * Set
     * ```html
     * <igx-pivot-data-selector [grid]="grid1" [rowsExpanded]="rowsPanelState"></igx-pivot-data-selector>
     * ```
     *
     * Two-way data binding:
     * ```html
     * <igx-pivot-data-selector [grid]="grid1" [(rowsExpanded)]="rowsPanelState"></igx-pivot-data-selector>
     * ```
     */
    @Input({ transform: booleanAttribute })
    public rowsExpanded = true;

    /**
     * @hidden
     */
    @Output()
    public rowsExpandedChange = new EventEmitter<boolean>();

    /**
     * Gets/sets whether the filters panel is expanded
     * Get
     * ```typescript
     *  const filtersPanelState: boolean = this.dataSelector.filtersExpanded;
     * ```
     * Set
     * ```html
     * <igx-pivot-data-selector [grid]="grid1" [filtersExpanded]="filtersPanelState"></igx-pivot-data-selector>
     * ```
     *
     * Two-way data binding:
     * ```html
     * <igx-pivot-data-selector [grid]="grid1" [(filtersExpanded)]="filtersPanelState"></igx-pivot-data-selector>
     * ```
     */
    @Input({ transform: booleanAttribute })
    public filtersExpanded = true;

    /**
     * @hidden
     */
    @Output()
    public filtersExpandedChange = new EventEmitter<boolean>();

    /**
     * Gets/sets whether the values panel is expanded
     * Get
     * ```typescript
     *  const valuesPanelState: boolean = this.dataSelector.valuesExpanded;
     * ```
     * Set
     * ```html
     * <igx-pivot-data-selector [grid]="grid1" [valuesExpanded]="valuesPanelState"></igx-pivot-data-selector>
     * ```
     *
     * Two-way data binding:
     * ```html
     * <igx-pivot-data-selector [grid]="grid1" [(valuesExpanded)]="valuesPanelState"></igx-pivot-data-selector>
     * ```
     */
    @Input({ transform: booleanAttribute })
    public valuesExpanded = true;

    /**
     * @hidden
     */
    @Output()
    public valuesExpandedChange = new EventEmitter<boolean>();

    private _grid: PivotGridType;
    private _dropDelta = 0;

    /** @hidden @internal **/
    @HostBinding("class.igx-pivot-data-selector")
    public cssClass = "igx-pivot-data-selector";

    @HostBinding("style.--ig-size")
    protected get size(): Size {
        return this.grid?.gridSize;
    }

    /** @hidden @internal **/
    public dimensions: IPivotDimension[];

    private _subMenuPositionSettings: PositionSettings = {
        verticalStartPoint: VerticalAlignment.Bottom,
        closeAnimation: undefined,
    };

    private _subMenuOverlaySettings: OverlaySettings = {
        closeOnOutsideClick: true,
        modal: false,
        positionStrategy: new AutoPositionStrategy(
            this._subMenuPositionSettings
        ),
        scrollStrategy: new AbsoluteScrollStrategy(),
    };

    /* blazorSuppress */
    public animationSettings = {
        closeAnimation: useAnimation(fadeOut, {
            params: {
                duration: "0ms",
            },
        }),
        openAnimation: useAnimation(fadeIn, {
            params: {
                duration: "0ms",
            },
        }),
    };

    /** @hidden @internal */
    public aggregateList: IPivotAggregator[] = [];
    /** @hidden @internal */
    public value: IPivotValue;
    /** @hidden @internal */
    public ghostText: string;
    /** @hidden @internal */
    public ghostWidth: number;
    /** @hidden @internal */
    public dropAllowed: boolean;
    /** @hidden @internal */
    public get dims(): IPivotDimension[] {
        return this._grid?.allDimensions || [];
    }
    /** @hidden @internal */
    public get values(): IPivotValue[] {
        return this._grid?.pivotConfiguration.values || [];
    }

    constructor(private renderer: Renderer2, private cdr: ChangeDetectorRef) { }

    /**
     * @hidden @internal
     */
    public _panels: IDataSelectorPanel[] = [
        {
            name: "Filters",
            i18n: 'igx_grid_pivot_selector_filters',
            type: PivotDimensionType.Filter,
            dataKey: "filterDimensions",
            icon: "filter_list",
            itemKey: "memberName",
            displayKey: 'displayName',
            sortable: false,
            dragChannels: ["Filters", "Columns", "Rows"]
        },
        {
            name: "Columns",
            i18n: 'igx_grid_pivot_selector_columns',
            type: PivotDimensionType.Column,
            dataKey: "columnDimensions",
            icon: "view_column",
            itemKey: "memberName",
            displayKey: 'displayName',
            sortable: true,
            dragChannels: ["Filters", "Columns", "Rows"]
        },
        {
            name: "Rows",
            i18n: 'igx_grid_pivot_selector_rows',
            type: PivotDimensionType.Row,
            dataKey: "rowDimensions",
            icon: "table_rows",
            itemKey: "memberName",
            displayKey: 'displayName',
            sortable: true,
            dragChannels: ["Filters", "Columns", "Rows"]
        },
        {
            name: "Values",
            i18n: 'igx_grid_pivot_selector_values',
            type: null,
            dataKey: "values",
            icon: "functions",
            itemKey: "member",
            displayKey: 'displayName',
            sortable: false,
            dragChannels: ["Values"]
        },
    ];


    /* treatAsRef */
    /**
     * Sets the grid.
     */
    @Input()
    public set grid(value: PivotGridType) {
        this._grid = value;
    }

    /* treatAsRef */
    /**
     * Returns the grid.
     */
    public get grid(): PivotGridType {
        return this._grid;
    }

    /**
     * @hidden
     * @internal
     */
    public onItemSort(
        _: Event,
        dimension: IPivotDimension,
        dimensionType: PivotDimensionType
    ) {
        if (
            !this._panels.find(
                (panel: IDataSelectorPanel) => panel.type === dimensionType
            ).sortable
        )
            return;

        const startDirection = dimension.sortDirection || SortingDirection.None;
        const direction = startDirection + 1 > SortingDirection.Desc ?
            SortingDirection.None : startDirection + 1;
        this.grid.sortDimension(dimension, direction);
    }

    /**
     * @hidden
     * @internal
     */
    public onFilteringIconPointerDown(event: PointerEvent) {
        event.stopPropagation();
        event.preventDefault();
    }

    /**
     * @hidden
     * @internal
     */
    public onFilteringIconClick(event: MouseEvent, dimension: IPivotDimension) {
        event.stopPropagation();
        event.preventDefault();

        let dim = dimension;
        let col: ColumnType;

        while (dim) {
            col = this.grid.dimensionDataColumns.find(
                (x) => x.field === dim.memberName
            );
            if (col) {
                break;
            } else {
                dim = dim.childLevel;
            }
        }

        this.grid.filteringService.toggleFilterDropdown(event.target, col);
    }

    /**
     * @hidden
     * @internal
     */
    protected getDimensionState(dimensionType: PivotDimensionType) {
        switch (dimensionType) {
            case PivotDimensionType.Row:
                return this.grid.rowDimensions;
            case PivotDimensionType.Column:
                return this.grid.columnDimensions;
            case PivotDimensionType.Filter:
                return this.grid.filterDimensions;
            default:
                return null;
        }
    }

    /**
     * @hidden
     * @internal
     */
    protected moveValueItem(itemId: string) {
        const aggregation = this.grid.pivotConfiguration.values;
        const valueIndex =
            aggregation.findIndex((x) => x.member === itemId) !== -1
                ? aggregation?.findIndex((x) => x.member === itemId)
                : aggregation.length;
        const newValueIndex =
            valueIndex + this._dropDelta < 0 ? 0 : valueIndex + this._dropDelta;

        const aggregationItem = aggregation.find(
            (x) => x.member === itemId || x.displayName === itemId
        );

        if (aggregationItem) {
            this.grid.moveValue(aggregationItem, newValueIndex);
            this.grid.valuesChange.emit({
                values: this.grid.pivotConfiguration.values,
            });
        }
    }

    /**
     * @hidden
     * @internal
     */
    public onItemDropped(
        event: IDropDroppedEventArgs,
        dimensionType: PivotDimensionType
    ) {
        if (!this.dropAllowed) {
            return;
        }

        const dimension = this.grid.getDimensionsByType(dimensionType);
        const dimensionState = this.getDimensionState(dimensionType);
        const itemId = event.drag.element.nativeElement.id;
        const targetId = event.owner.element.nativeElement.id;
        const dimensionItem = dimension?.find((x) => x.memberName === itemId);
        const itemIndex =
            dimension?.findIndex((x) => x?.memberName === itemId) !== -1
                ? dimension?.findIndex((x) => x.memberName === itemId)
                : dimension?.length;
        const dimensions = this.grid.allDimensions.filter((x) => x && x.memberName === itemId);

        const reorder =
            dimensionState?.findIndex((item) => item.memberName === itemId) !==
            -1;

        let targetIndex =
            targetId !== ""
                ? dimension?.findIndex((x) => x.memberName === targetId)
                : dimension?.length;

        if (!dimension) {
            this.moveValueItem(itemId);
        }

        if (reorder) {
            targetIndex =
                itemIndex + this._dropDelta < 0
                    ? 0
                    : itemIndex + this._dropDelta;
        }

        if (dimensionItem) {
            this.grid.moveDimension(dimensionItem, dimensionType, targetIndex);
        } else {
            const newDim = dimensions.find((x) => x.memberName === itemId);
            this.grid.moveDimension(newDim, dimensionType, targetIndex);
        }

        this.grid.dimensionsChange.emit({
            dimensions: dimension,
            dimensionCollectionType: dimensionType,
        });
    }

    /**
     * @hidden
     * @internal
     */
    protected updateDropDown(
        value: IPivotValue,
        dropdown: IgxDropDownComponent
    ) {
        this.value = value;
        dropdown.width = "200px";
        this.aggregateList = PivotUtil.getAggregateList(value, this.grid);
        this.cdr.detectChanges();
        dropdown.open(this._subMenuOverlaySettings);
    }

    /**
     * @hidden
     * @internal
     */
    public onSummaryClick(
        event: MouseEvent,
        value: IPivotValue,
        dropdown: IgxDropDownComponent
    ) {
        this._subMenuOverlaySettings.target =
            event.currentTarget as HTMLElement;

        if (dropdown.collapsed) {
            this.updateDropDown(value, dropdown);
        } else {
            // close for previous chip
            dropdown.close();
            dropdown.closed.pipe(first()).subscribe(() => {
                this.updateDropDown(value, dropdown);
            });
        }
    }

    /**
     * @hidden
     * @internal
     */
    public onAggregationChange(event: ISelectionEventArgs) {
        if (!this.isSelected(event.newSelection.value)) {
            this.value.aggregate = event.newSelection.value;
            this.grid.pipeTrigger++;
            this.grid.cdr.markForCheck();
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
    public ghostCreated(event: IDragGhostBaseEventArgs, value: string) {
        const { width: itemWidth } =
            event.owner.element.nativeElement.getBoundingClientRect();
        this.ghostWidth = itemWidth;
        this.ghostText = value;
        this.renderer.setStyle(
            event.owner.element.nativeElement,
            "position",
            "absolute"
        );
        this.renderer.setStyle(
            event.owner.element.nativeElement,
            "visibility",
            "hidden"
        );
    }

    /**
     * @hidden
     * @internal
     */
    public toggleItem(item: IPivotDimension | IPivotValue) {
        if (item as IPivotValue) {
            this.grid.toggleValue(item as IPivotValue);
        }

        if (item as IPivotDimension) {
            this.grid.toggleDimension(item as IPivotDimension);
        }
    }

    /**
     * @hidden
     * @internal
     */
    public onPanelEntry(event: IDropBaseEventArgs, panel: string) {
        this.dropAllowed = event.dragData.gridID === this.grid.id && event.dragData.selectorChannels?.some(
            (channel: string) => channel === panel
        );
    }

    /**
     * @hidden
     * @internal
     */
    public onItemDragMove(event: IDragMoveEventArgs) {
        const clientRect =
            event.owner.element.nativeElement.getBoundingClientRect();
        this._dropDelta = Math.round(
            (event.nextPageY - event.startY) / clientRect.height
        );
    }

    /**
     * @hidden
     * @internal
     */
    public onItemDragEnd(event: IDragBaseEventArgs) {
        this.renderer.setStyle(
            event.owner.element.nativeElement,
            "position",
            "static"
        );
        this.renderer.setStyle(
            event.owner.element.nativeElement,
            "visibility",
            "visible"
        );
    }

    /**
     * @hidden
     * @internal
     */
    public onItemDragOver(event: IDropBaseEventArgs) {
        if (this.dropAllowed) {
            this.renderer.addClass(
                event.owner.element.nativeElement,
                "igx-drag--push"
            );
        }
    }

    /**
     * @hidden
     * @internal
     */
    public onItemDragLeave(event: IDropBaseEventArgs) {
        if (this.dropAllowed) {
            this.renderer.removeClass(
                event.owner.element.nativeElement,
                "igx-drag--push"
            );
        }
    }

    /**
     * @hidden
     * @internal
     */
    public getPanelCollapsed(panelType: PivotDimensionType): boolean {
        switch (panelType) {
            case PivotDimensionType.Column:
                return !this.columnsExpanded;
            case PivotDimensionType.Filter:
                return !this.filtersExpanded;
            case PivotDimensionType.Row:
                return !this.rowsExpanded;
            default:
                return !this.valuesExpanded;
        }
    }

    /**
     * @hidden
     * @internal
     */
    public onCollapseChange(value: boolean, panelType: PivotDimensionType): void {
        switch (panelType) {
            case PivotDimensionType.Column:
                this.columnsExpanded = !value;
                this.columnsExpandedChange.emit(this.columnsExpanded);
                break;
            case PivotDimensionType.Filter:
                this.filtersExpanded = !value;
                this.filtersExpandedChange.emit(this.filtersExpanded);
                break;
            case PivotDimensionType.Row:
                this.rowsExpanded = !value;
                this.rowsExpandedChange.emit(this.rowsExpanded);
                break;
            default:
                this.valuesExpanded = !value;
                this.valuesExpandedChange.emit(this.valuesExpanded)
        }
    }
}
