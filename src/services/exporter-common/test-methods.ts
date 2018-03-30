
import { TestBed } from "@angular/core/testing";
import { IgxGridComponent } from "../../grid/grid.component";
import { STRING_FILTERS } from "../../main";
import { GridDeclarationComponent } from "./components-declarations";
import { IgxExporterOptionsBase } from "./exporter-options-base";

export class TestMethods {

    public static async testRawData(myGrid: IgxGridComponent, action: (grid) => void) {
        const fix = TestBed.createComponent(GridDeclarationComponent);
        fix.detectChanges();
        myGrid = fix.componentInstance.grid1;

        fix.whenStable().then(() => {
            expect(myGrid.rowList.length).toEqual(10, "Invalid number of rows initialized!");
            action(myGrid);
        });
    }

    /* Creates an instance of GridDeclarationComponent; If filterParams is not specified,
    applies the following filter: ["JobTitle", "Senior", STRING_FILTERS.contains, true]. */
    public static createGridAndFilter(...filterParams: any[]) {
        const fix = TestBed.createComponent(GridDeclarationComponent);
        fix.detectChanges();
        const myGrid = fix.componentInstance.grid1;

        filterParams = (filterParams.length === 0) ?
                        ["JobTitle", "Senior", STRING_FILTERS.contains, true] : filterParams;

        myGrid.filter(...filterParams);
        fix.detectChanges();

        return { fixture: fix, grid: myGrid };
    }

    /* Creates an instance of GridDeclarationComponent and pins the columns with the specified indices. */
    public static createGridAndPinColumn(...colIndices: any[]) {
        const fix = TestBed.createComponent(GridDeclarationComponent);
        fix.detectChanges();

        const myGrid = fix.componentInstance.grid1;

        // Pin columns
        colIndices.forEach((i) => {
            myGrid.columns[i].pin();
        });

        return { fixture: fix, grid: myGrid };
    }

}
