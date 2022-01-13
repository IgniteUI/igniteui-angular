import { Component, HostBinding, Input } from "@angular/core";
import { IDropDroppedEventArgs, IgxAppendDropStrategy, IPivotConfiguration, PivotDimensionType } from "igniteui-angular";
import { DisplayDensity } from "../../core/displayDensity";
import { PivotGridType } from "../common/grid.interface";
// import { IgxPivotDateDimension } from "./pivot-grid-dimensions";
import { IPivotDimension } from "./pivot-grid.interface";
import { SortingDirection } from '../../data-operations/sorting-strategy';

interface IDataSelectorPanel {
    name: string;
    type?: PivotDimensionType;
    dataKey: string;
    icon: string;
    actions: { icon: string }[];
    itemKey: string;
}

@Component({
    selector: "igx-pivot-data-selector",
    templateUrl: "./pivot-data-selector.component.html",
})
export class IgxPivotDataSelectorComponent {
    @HostBinding("class.igx-pivot-data-selector")
    public cssClass = "igx-pivot-data-selector";

    private _grid: PivotGridType;
    public dimensions: IPivotDimension[];
    public dropStrategy = IgxAppendDropStrategy;

    /**
     * @hidden @internal
     */
    public _panels: IDataSelectorPanel[] = [
        {
            name: "Filters",
            type: PivotDimensionType.Filter,
            dataKey: "filterDimensions",
            icon: "filter_list",
            actions: [{
                icon: "drag_handle"
            }],
            itemKey: "memberName",
        },
        {
            name: "Columns",
            type: PivotDimensionType.Column,
            dataKey: "columnDimensions",
            icon: "view_column",
            actions: [
                {
                    icon: "drag_handle",
                },
            ],
            itemKey: "memberName",
        },
        {
            name: "Rows",
            type: PivotDimensionType.Row,
            dataKey: "rowDimensions",
            icon: "table_rows",
            actions: [
                {
                    icon: "drag_handle",
                },
            ],
            itemKey: "memberName",
        },
        {
            name: "Values",
            dataKey: "values",
            icon: "functions",
            actions: [
                {
                    icon: "functions",
                },
                {
                    icon: "drag_handle",
                },
            ],
            itemKey: "member",
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

    protected getDimensionsByType(dimension: PivotDimensionType) {
        switch (dimension) {
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

    public onItemDropped(event: IDropDroppedEventArgs, dimensionType: PivotDimensionType) {
        const targetDimension = this.getDimensionsByType(dimensionType);
        const itemId = event.drag.element.nativeElement.id;

        const allDims = this.grid.pivotConfiguration.rows
            .concat(this.grid.pivotConfiguration.columns)
            .concat(this.grid.pivotConfiguration.filters);

        const dims = allDims.filter(x => x && x.memberName === itemId);
        if (dims.length === 0) {
            return;
        }

        dims.forEach(dim => {
            dim.enabled = false;
        });

        const targetDimensionItem = targetDimension.find(x => x && x.memberName === itemId);
        if (targetDimensionItem) {
            targetDimensionItem.enabled = true;
        } else {
            const newDim = Object.assign({}, dims[0]);
            newDim.enabled = true;
            targetDimension.push(newDim);
        }

        this.grid.pipeTrigger++;
        this.grid.dimensionsChange.emit({ dimensions: targetDimension, dimensionCollectionType: dimensionType });
    }
}
