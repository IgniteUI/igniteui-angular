
import { TestBed } from '@angular/core/testing';
import { IgxGridComponent } from '../../grids/grid/grid.component';
import { IgxExporterOptionsBase } from './exporter-options-base';
import { IgxStringFilteringOperand } from '../../../public_api';
import { GridIDNameJobTitleComponent } from '../../test-utils/grid-samples.spec';

export class TestMethods {

    public static testRawData(myGrid: IgxGridComponent, action: (grid) => void) {
        const fix = TestBed.createComponent(GridIDNameJobTitleComponent);
        fix.detectChanges();
        myGrid = fix.componentInstance.grid;

        expect(myGrid.rowList.length).toEqual(10, 'Invalid number of rows initialized!');
        action(myGrid);
    }

    /* Creates an instance of GridDeclarationComponent; If filterParams is not specified,
    applies the following filter: ["JobTitle", "Senior", IgxStringFilteringOperand.instance().condition('contains'), true]. */
    public static createGridAndFilter(...filterParams: any[]) {
        const fix = TestBed.createComponent(GridIDNameJobTitleComponent);
        fix.detectChanges();
        const myGrid = fix.componentInstance.grid;

        filterParams = (filterParams.length === 0) ?
                        ['JobTitle', 'Senior', IgxStringFilteringOperand.instance().condition('contains'), true] : filterParams;

        myGrid.filter(filterParams[0], filterParams[1], filterParams[2], filterParams[3]);
        fix.detectChanges();

        return { fixture: fix, grid: myGrid };
    }

    /* Creates an instance of GridDeclarationComponent and pins the columns with the specified indices. */
    public static createGridAndPinColumn(...colIndices: any[]) {
        const fix = TestBed.createComponent(GridIDNameJobTitleComponent);
        fix.detectChanges();

        const myGrid = fix.componentInstance.grid;

        // Pin columns
        colIndices.forEach((i) => {
            myGrid.columns[i].pinned = true;
        });

        return { fixture: fix, grid: myGrid };
    }

}
