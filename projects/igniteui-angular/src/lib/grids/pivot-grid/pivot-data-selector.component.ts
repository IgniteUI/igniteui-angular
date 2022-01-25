import { Component, HostBinding, Input } from "@angular/core";
import { IDragBaseEventArgs, IDropDroppedEventArgs, PivotDimensionType } from "igniteui-angular";
import { DisplayDensity } from "../../core/displayDensity";
import { PivotGridType } from "../common/grid.interface";
import { IPivotDimension } from "./pivot-grid.interface";
import { SortingDirection } from '../../data-operations/sorting-strategy';

interface IDataSelectorPanel {
    name: string;
    type?: PivotDimensionType;
    dataKey: string;
    icon: string;
    itemKey: string;
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

    /**
     * @hidden @internal
     */
    public _panels: IDataSelectorPanel[] = [
        {
            name: "Filters",
            type: PivotDimensionType.Filter,
            dataKey: "filterDimensions",
            icon: "filter_list",
            itemKey: "memberName",
            sortable: false,
            dragChannels: ["Filters", "Columns", "Rows"]
        },
        {
            name: "Columns",
            type: PivotDimensionType.Column,
            dataKey: "columnDimensions",
            icon: "view_column",
            itemKey: "memberName",
            sortable: true,
            dragChannels: ["Filters", "Columns", "Rows"]
        },
        {
            name: "Rows",
            type: PivotDimensionType.Row,
            dataKey: "rowDimensions",
            icon: "table_rows",
            itemKey: "memberName",
            sortable: true,
            dragChannels: ["Filters", "Columns", "Rows"]
        },
        {
            name: "Values",
            dataKey: "values",
            icon: "functions",
            itemKey: "member",
            sortable: false,
            dragChannels: ["Values"]
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
    public set grid(grid: PivotGridType) {
        this._grid = grid;
    }

    /**
     * Returns the grid.
     */
    public get grid(): PivotGridType {
        return this._grid;
    }

    public onItemSort(_: Event, dimension: IPivotDimension, dimensionType: PivotDimensionType) {
        if(!this._panels.find((panel: IDataSelectorPanel) => panel.type === dimensionType).sortable) return;

        if (!dimension.sortDirection) {
            dimension.sortDirection = SortingDirection.None;
        }

        dimension.sortDirection = dimension.sortDirection + 1 > SortingDirection.Desc ?
            SortingDirection.None : dimension.sortDirection + 1;
        // apply same sort direction to children.
        let dim = dimension;

        while (dim.childLevel) {
            dim.childLevel.sortDirection = dimension.sortDirection;
            dim = dim.childLevel;
        }

        this.grid.pipeTrigger++;

        if (dimensionType === PivotDimensionType.Column) {
            this.grid.setupColumns();
        }
    }

    protected getDimensionsByType(dimensionType: PivotDimensionType) {
        switch (dimensionType) {
            case PivotDimensionType.Row:
                if (!this.grid.pivotConfiguration.rows) {
                    this.grid.pivotConfiguration.rows = [];
                }
                return this.grid.pivotConfiguration.rows;
            case PivotDimensionType.Column:
                if (!this.grid.pivotConfiguration.columns) {
                    this.grid.pivotConfiguration.columns = [];
                }
                return this.grid.pivotConfiguration.columns;
            case PivotDimensionType.Filter:
                if (!this.grid.pivotConfiguration.filters) {
                    this.grid.pivotConfiguration.filters = [];
                }
                return this.grid.pivotConfiguration.filters;
            default:
                return null;
        }
    }

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

    public onItemDragMove(event: IDragBaseEventArgs) {
        const clientRect = event.owner.element.nativeElement.getBoundingClientRect();
        this._dropDelta =  Math.round((event.pageY - event.startY) / clientRect.height);
    }

    public onItemDropped(event: IDropDroppedEventArgs, dimensionType: PivotDimensionType) {
        const dimension = this.getDimensionsByType(dimensionType);
        const dimensionState = this.getDimensionState(dimensionType);
        const itemId = event.drag.element.nativeElement.id;
        const dimensionItem = dimension.find(x => x.memberName === itemId);
        const itemIndex = dimension?.findIndex(x => x?.memberName === itemId) !== -1 ?
            dimension?.findIndex(x => x.memberName === itemId) : dimension?.length;
        const dimensions = this.grid.pivotConfiguration.rows
            .concat(this.grid.pivotConfiguration.columns)
            .concat(this.grid.pivotConfiguration.filters)
            .filter(x => x && x.memberName === itemId);

        const reorder = dimensionState.findIndex(item => item.memberName === itemId) !== -1;;
        let targetIndex = dimension.length;

        if(reorder) {
            targetIndex = itemIndex + this._dropDelta < 0 ? 0 : itemIndex + this._dropDelta;
        }

        dimensions.forEach(item => {
            item.enabled = false;
        });

        if (dimensionItem) {
            dimensionItem.enabled = true;
            dimension.splice(itemIndex, 1);
            dimension.splice(targetIndex , 0, dimensionItem);
        } else {
            const newDim = Object.assign({}, dimensions[0]);
            newDim.enabled = true;
            dimension.splice(targetIndex, 0, newDim);
        }

        this.grid.pipeTrigger++;
        this.grid.dimensionsChange.emit({ dimensions: dimension, dimensionCollectionType: dimensionType });
    }
}
