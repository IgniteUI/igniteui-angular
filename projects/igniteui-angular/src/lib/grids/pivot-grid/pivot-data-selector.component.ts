import { Component, HostBinding, Input } from "@angular/core";
import { DisplayDensity } from "../../core/displayDensity";
import { PivotGridType } from "../common/grid.interface";
import { IgxPivotDateDimension } from "./pivot-grid-dimensions";
import { IPivotDimension } from "./pivot-grid.interface";

interface IDataSelectorPanel {
    name: string;
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
    public dimensions: IPivotDimension[] = [
        {
            memberName: "Country",
            enabled: true,
        },
        new IgxPivotDateDimension(
            {
                memberName: "Date",
                enabled: true,
            },
            {
                months: false,
            }
        ),
        {
            memberFunction: () => "All",
            memberName: "AllProducts",
            enabled: true,
            childLevel: {
                memberFunction: (data) => data.ProductCategory,
                memberName: "ProductCategory",
                enabled: true,
            },
        },
        {
            memberName: "AllSeller",
            memberFunction: () => "All Sellers",
            enabled: true,
            childLevel: {
                enabled: true,
                memberName: "SellerName",
            },
        },
    ];

    /**
     * @hidden @internal
     */
    public _panels: IDataSelectorPanel[] = [
        {
            name: "Filters",
            dataKey: "filterDimensions",
            icon: "filter_list",
            actions: [],
            itemKey: "memberName",
        },
        {
            name: "Columns",
            dataKey: "columnDimensions",
            icon: "view_column",
            actions: [
                {
                    icon: "arrow_downward",
                },
                {
                    icon: "drag_handle",
                },
            ],
            itemKey: "memberName",
        },
        {
            name: "Rows",
            dataKey: "rowDimensions",
            icon: "table_rows",
            actions: [
                {
                    icon: "arrow_downward",
                },
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
}
