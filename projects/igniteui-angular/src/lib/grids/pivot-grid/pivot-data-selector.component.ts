import { AfterViewInit, Component, HostBinding, Input } from "@angular/core";
import { DisplayDensity } from "../../core/displayDensity";
import { PivotGridType } from "../common/grid.interface";
import { IgxPivotDateDimension } from "./pivot-grid-dimensions";
import { IPivotDimension } from "./pivot-grid.interface";

@Component({
    selector: "igx-pivot-data-selector",
    templateUrl: "./pivot-data-selector.component.html",
})
export class IgxPivotDataSelectorComponent implements AfterViewInit {
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
    public selected: IPivotDimension[] = [this.dimensions[0], this.dimensions[1], this.dimensions[2]];

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

    public ngAfterViewInit() {
        console.log(this.grid.values);
        // this.dimensions = this.grid.rowDimensions;
        this.selected = [
            this.dimensions[0],
            this.dimensions[1],
            this.dimensions[2],
        ];
    }
}
