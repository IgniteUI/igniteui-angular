import { async, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { configureTestSuite } from '../../test-utils/configure-suite';
import {
    IgxTreeGridSelectionKeyComponent,
    IgxTreeGridSelectionComponent
} from '../../test-utils/tree-grid-components.spec';
import { IgxTreeGridModule } from '.';
import { HelperUtils } from '../../test-utils/helper-utils.spec';


describe('IgxTreeGrid - Multi Cell selection', () => {
    configureTestSuite();

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [
                IgxTreeGridSelectionKeyComponent,
                IgxTreeGridSelectionComponent
            ],
            imports: [NoopAnimationsModule, IgxTreeGridModule]
        }).compileComponents();
    }));

    describe('Flat Data', () => {
        let fix;
        let treeGrid;

        beforeEach(() => {
            fix = TestBed.createComponent(IgxTreeGridSelectionKeyComponent);
            fix.detectChanges();
            treeGrid = fix.componentInstance.treeGrid;
        });

        it('Should select a region', () => {
            verifySelectingRegion(fix, treeGrid);
        });
    });

    describe('ChildDataKey', () => {
        let fix;
        let treeGrid;

        beforeEach(() => {
            fix = TestBed.createComponent(IgxTreeGridSelectionComponent);
            fix.detectChanges();
            treeGrid = fix.componentInstance.treeGrid;
        });

        it('Should select a region', () => {
            verifySelectingRegion(fix, treeGrid);
        });
    });

    function verifySelectingRegion(fix, treeGrid) {
        const selectionChangeSpy = spyOn<any>(treeGrid.onRangeSelection, 'emit').and.callThrough();
        const range1 = { rowStart: 0, rowEnd: 6, columnStart: 'ID', columnEnd: 'Age' };
        const range2 = { rowStart: 11, rowEnd: 16, columnStart: 'ID', columnEnd: 'OnPTO' };
        const expectedData1 = [
            { ID: 147, Name: 'John Winchester', Age: 55 },
            { ID: 475, Name: 'Michael Langdon', Age: 43 },
            { ID: 957, Name: 'Thomas Hardy', Age: 29 },
            { ID: 317, Name: 'Monica Reyes', Age: 31 },
            { ID: 711, Name: 'Roland Mendel', Age: 35 },
            { ID: 998, Name: 'Sven Ottlieb', Age: 44 },
            { ID: 847, Name: 'Ana Sanders', Age: 42 }
        ];
        const expectedData2 = [
            { ID: 15, Name: 'Antonio Moreno', Age: 44, OnPTO: true},
            { ID: 17, Name: 'Yang Wang', Age: 61, OnPTO: false},
            { ID: 12, Name: 'Pedro Afonso', Age: 50, OnPTO: false},
            { ID: 109, Name: 'Patricio Simpson', Age: 25, OnPTO: false},
            { ID: 99, Name: 'Francisco Chang', Age: 39, OnPTO: true},
            { ID: 299, Name: 'Peter Lewis', Age: 25, OnPTO: false }
        ];
        treeGrid.selectRange(range1);
        fix.detectChanges();

        HelperUtils.verifyCellsRegionSelected(treeGrid, 0, 6, 0, 2);
        HelperUtils.verifySelectedRange(treeGrid, 0, 6, 0, 2);
        expect(selectionChangeSpy).toHaveBeenCalledTimes(0);
        expect(treeGrid.getSelectedData()).toEqual(expectedData1);

        treeGrid.selectRange();
        fix.detectChanges();

        HelperUtils.verifyCellsRegionSelected(treeGrid, 0, 6, 0, 2, false);
        expect(selectionChangeSpy).toHaveBeenCalledTimes(0);
        expect(treeGrid.getSelectedRanges().length).toBe(0);

        treeGrid.selectRange(range2);
        fix.detectChanges();

        HelperUtils.verifySelectedRange(treeGrid, 11, 16, 0, 3);
        expect(selectionChangeSpy).toHaveBeenCalledTimes(0);
        expect(treeGrid.getSelectedData()).toEqual(expectedData2);
    }
});
