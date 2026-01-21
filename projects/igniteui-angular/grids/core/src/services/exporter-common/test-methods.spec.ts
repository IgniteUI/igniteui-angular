
import { TestBed } from '@angular/core/testing';
import { GridIDNameJobTitleComponent } from '../../../../../test-utils/grid-samples.spec';
import { wait } from '../../../../../test-utils/ui-interactions.spec';
import { IgxGridComponent } from 'igniteui-angular/grids/grid';
import { IgxStringFilteringOperand } from 'igniteui-angular/core';
import { expect } from 'vitest';

export class TestMethods {

    public static async testRawData(myGrid: IgxGridComponent, action: (grid) => Promise<void>) {
        const fix = TestBed.createComponent(GridIDNameJobTitleComponent);
        fix.detectChanges();
        await wait(16);
        myGrid = fix.componentInstance.grid;

        expect(myGrid.rowList.length, 'Invalid number of rows initialized!').toEqual(10);
        await action(myGrid);
    }

    /* Creates an instance of GridDeclarationComponent; If filterParams is not specified,
    applies the following filter: ["JobTitle", "Senior", IgxStringFilteringOperand.instance().condition('contains'), true]. */
    public static async createGridAndFilter(...filterParams: any[]) {
        const fix = TestBed.createComponent(GridIDNameJobTitleComponent);
        fix.detectChanges();
        await wait(16);
        const myGrid = fix.componentInstance.grid;

        filterParams = (filterParams.length === 0) ?
            ['JobTitle', 'Senior', IgxStringFilteringOperand.instance().condition('contains'), true] : filterParams;

        myGrid.filter(filterParams[0], filterParams[1], filterParams[2], filterParams[3]);
        fix.detectChanges();

        return { fixture: fix, grid: myGrid };
    }

    /* Creates an instance of GridDeclarationComponent and pins the columns with the specified indices. */
    public static async createGridAndPinColumn(...colIndices: any[]) {
        const fix = TestBed.createComponent(GridIDNameJobTitleComponent);
        fix.detectChanges();
        await wait(16);

        const myGrid = fix.componentInstance.grid;
        // Pin columns
        colIndices.forEach((i) => {
            myGrid.columnList.get(i).pinned = true;
        });

        await wait(16);

        return { fixture: fix, grid: myGrid };
    }
}
