import { useAnimation } from "@angular/animations";
import {
    ChangeDetectorRef,
    Component,
    HostBinding,
    Input,
    Renderer2
} from "@angular/core";
import { first } from "rxjs/operators";
import { fadeIn, fadeOut } from "../../animations/fade";
import { DisplayDensity } from "../../core/displayDensity";
import { GridColumnDataType } from "../../data-operations/data-util";
import { SortingDirection } from "../../data-operations/sorting-strategy";
import {
    IDragBaseEventArgs,
    IDragGhostBaseEventArgs,
    IDropBaseEventArgs,
    IDropDroppedEventArgs
} from "../../directives/drag-drop/drag-drop.directive";
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
    IgxPivotAggregate,
    IgxPivotDateAggregate,
    IgxPivotTimeAggregate
} from "./pivot-grid-aggregate";
import {
    IPivotAggregator,
    IPivotDimension,
    IPivotValue,
    PivotDimensionType
} from "./pivot-grid.interface";
import { PivotUtil } from './pivot-util';

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

@Component({
    selector: "igx-pivot-data-selector",
    templateUrl: "./pivot-data-selector.component.html",
})
export class IgxPivotDataSelectorComponent {
    private _grid: PivotGridType;
    private _dropDelta = 0;

    @HostBinding("class.igx-pivot-data-selector")
    public cssClass = "igx-pivot-data-selector";
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
    public dims: IPivotDimension[];
    /** @hidden @internal */
    public values: IPivotValue[];

    constructor(private renderer: Renderer2, private cdr: ChangeDetectorRef) {}

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
            sortable: false,
            dragChannels: ["Filters", "Columns", "Rows"],
        },
        {
            name: "Columns",
            i18n: 'igx_grid_pivot_selector_columns',
            type: PivotDimensionType.Column,
            dataKey: "columnDimensions",
            icon: "view_column",
            itemKey: "memberName",
            sortable: true,
            dragChannels: ["Filters", "Columns", "Rows"],
        },
        {
            name: "Rows",
            i18n: 'igx_grid_pivot_selector_rows',
            type: PivotDimensionType.Row,
            dataKey: "rowDimensions",
            icon: "table_rows",
            itemKey: "memberName",
            sortable: true,
            dragChannels: ["Filters", "Columns", "Rows"],
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
            dragChannels: ["Values"],
        },
    ];

    /**
     * @hidden @internal
     */
    public get displayDensity(): DisplayDensity {
        return this.grid?.displayDensity;
    }

    /**
     * An @Input property that sets the grid.
     */
    @Input()
    public set grid(value: PivotGridType) {
        this._grid = value;
        this.dims = [
            ...this._grid.pivotConfiguration.columns,
            ...this._grid.pivotConfiguration.rows,
            ...this._grid.pivotConfiguration.filters,
        ];
        this.values = this._grid.pivotConfiguration.values;
    }

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

        if (!dimension.sortDirection) {
            dimension.sortDirection = SortingDirection.None;
        }

        dimension.sortDirection =
            dimension.sortDirection + 1 > SortingDirection.Desc
                ? SortingDirection.None
                : dimension.sortDirection + 1;
        // apply same sort direction to children.
        let dim = dimension;

        while (dim.childLevel) {
            dim.childLevel.sortDirection = dimension.sortDirection;
            dim = dim.childLevel;
        }

        this.grid.pipeTrigger++;
        this.grid.cdr.markForCheck();

        if (dimensionType === PivotDimensionType.Column) {
            this.grid.setupColumns();
        }
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
        const dimensions = this.grid.pivotConfiguration.rows
            .concat(this.grid.pivotConfiguration.columns)
            .concat(this.grid.pivotConfiguration.filters)
            .filter((x) => x && x.memberName === itemId);

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
    public onItemDragMove(event: IDragBaseEventArgs) {
        const clientRect =
            event.owner.element.nativeElement.getBoundingClientRect();
        this._dropDelta = Math.round(
            (event.pageY - event.startY) / clientRect.height
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
}
