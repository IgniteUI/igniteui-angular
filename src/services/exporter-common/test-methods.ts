
import { TestBed } from "@angular/core/testing";
import { IgxGridComponent } from "../../grid/grid.component";
import { GridDeclarationComponent } from "./components-declarations";

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
}
