import { async, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { IgxTreeGridModule } from './index';
import {
    IgxTreeGridSummariesComponent,
    IgxTreeGridSummariesKeyComponent,
    IgxTreeGridCustomSummariesComponent
} from '../../test-utils/tree-grid-components.spec';
import { configureTestSuite } from '../../test-utils/configure-suite';
import { HelperUtils } from '../../test-utils/helper-utils.spec';
import { wait } from '../../test-utils/ui-interactions.spec';
import { IgxNumberFilteringOperand } from 'igniteui-angular';

describe('IgxTreeGrid - Summaries', () => {
    configureTestSuite();
    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [
                IgxTreeGridSummariesComponent,
                IgxTreeGridSummariesKeyComponent,
                IgxTreeGridCustomSummariesComponent
            ],
            imports: [
                BrowserAnimationsModule,
                IgxTreeGridModule]
        })
            .compileComponents();
    }));

    describe('', () => {
        let fix;
        let treeGrid;
        beforeEach(() => {
            fix = TestBed.createComponent(IgxTreeGridSummariesKeyComponent);
            fix.detectChanges();
            treeGrid = fix.componentInstance.treeGrid;
        });

        it('should render summaries for all the rows when have parentKey', () => {
            verifyTreeBaseSummaries(fix);
            expect(HelperUtils.getAllVisbleSummariesLength(fix)).toEqual(1);
            // Expand second row and verify summaries
            treeGrid.toggleRow(treeGrid.getRowByIndex(1).rowID);
            fix.detectChanges();

            verifyTreeBaseSummaries(fix);
            verifySummaryForRow847(fix, 4);
            expect(HelperUtils.getAllVisbleSummariesLength(fix)).toEqual(2);

            // Expand child row and verify summaries
            treeGrid.toggleRow(treeGrid.getRowByIndex(3).rowID);
            fix.detectChanges();

            expect(HelperUtils.getAllVisbleSummariesLength(fix)).toEqual(3);

            verifyTreeBaseSummaries(fix);
            verifySummaryForRow663(fix, 5);
            verifySummaryForRow847(fix, 6);
        });

        it('should render summaries on top when position is top ', () => {
            treeGrid.summaryPosition = 'top';
            fix.detectChanges();

            verifyTreeBaseSummaries(fix);
            expect(HelperUtils.getAllVisbleSummariesLength(fix)).toEqual(1);
            // Expand first row and verify summaries
            treeGrid.toggleRow(treeGrid.getRowByIndex(0).rowID);
            fix.detectChanges();

            verifyTreeBaseSummaries(fix);
            verifySummaryForRow147(fix, 1);
            expect(HelperUtils.getAllVisbleSummariesLength(fix)).toEqual(2);

            // Expand second row and verify summaries
            treeGrid.toggleRow(treeGrid.getRowByIndex(5).rowID);
            fix.detectChanges();

            verifyTreeBaseSummaries(fix);
            verifySummaryForRow847(fix, 6);
            expect(HelperUtils.getAllVisbleSummariesLength(fix)).toEqual(3);

            // Expand first row child and verify summaries
            treeGrid.toggleRow(treeGrid.getRowByIndex(4).rowID);
            fix.detectChanges();

            verifySummaryForRow317(fix, 5);
            expect(HelperUtils.getAllVisbleSummariesLength(fix)).toEqual(3);
        });

        it('should be able to change summaryPosition at runtime', () => {
            treeGrid.expandAll();
            fix.detectChanges();

            verifyTreeBaseSummaries(fix);
            expect(HelperUtils.getAllVisbleSummariesLength(fix)).toEqual(3);
            expect(HelperUtils.getAllVisbleSummariesRowIndexes(fix)).toEqual([0, 6, 7]);

            treeGrid.summaryPosition = 'top';
            fix.detectChanges();

            verifyTreeBaseSummaries(fix);
            expect(HelperUtils.getAllVisbleSummariesLength(fix)).toEqual(3);

            expect(HelperUtils.getAllVisbleSummariesRowIndexes(fix)).toEqual([0, 1, 5]);

            treeGrid.summaryPosition = 'bottom';
            fix.detectChanges();

            expect(HelperUtils.getAllVisbleSummariesLength(fix)).toEqual(3);

            expect(HelperUtils.getAllVisbleSummariesRowIndexes(fix)).toEqual([0, 6, 7]);
        });

        it('should be able to change summaryCalculationMode at runtime', async () => {
            treeGrid.expandAll();
            fix.detectChanges();

            verifyTreeBaseSummaries(fix);
            expect(HelperUtils.getAllVisbleSummariesLength(fix)).toEqual(3);

            expect(HelperUtils.getAllVisbleSummariesRowIndexes(fix)).toEqual([0, 6, 7]);

            treeGrid.summaryCalculationMode = 'rootLevelOnly';
            fix.detectChanges();
            await wait(50);

            verifyTreeBaseSummaries(fix);
            expect(HelperUtils.getAllVisbleSummariesLength(fix)).toEqual(1);

            treeGrid.summaryCalculationMode = 'childLevelsOnly';
            fix.detectChanges();
            await wait(50);

            expect(HelperUtils.getAllVisbleSummariesLength(fix)).toEqual(2);
            expect(HelperUtils.getAllVisbleSummariesRowIndexes(fix)).toEqual([6, 7]);
            const summaryRow = HelperUtils.getSummaryRowByDataRowIndex(fix, 0);
            expect(summaryRow).toBeNull();

            treeGrid.summaryCalculationMode = 'rootAndChildLevels';
            fix.detectChanges();
            await wait(50);

            verifyTreeBaseSummaries(fix);
            expect(HelperUtils.getAllVisbleSummariesLength(fix)).toEqual(3);
            expect(HelperUtils.getAllVisbleSummariesRowIndexes(fix)).toEqual([0, 6, 7]);
        });

        it('should be able to enable/disable summaries at runtime', () => {
            treeGrid.expandAll();
            fix.detectChanges();

            treeGrid.getColumnByName('Age').hasSummary = false;
            fix.detectChanges();

            HelperUtils.verifyVisbleSummariesHeight(fix, 3);

            let summaries = HelperUtils.getAllVisbleSummaries(fix);
            summaries.forEach(summary => {
                HelperUtils.verifyColumnSummaries(summary, 0, [], []);
                HelperUtils.verifyColumnSummaries(summary, 1, ['Count'], []);
                HelperUtils.verifyColumnSummaries(summary, 2, ['Count', 'Earliest', 'Latest'], []);
                HelperUtils.verifyColumnSummaries(summary, 3, [], []);
                HelperUtils.verifyColumnSummaries(summary, 4, ['Count'], []);
            });

            // Disable all summaries
            treeGrid.getColumnByName('Name').hasSummary = false;
            treeGrid.getColumnByName('HireDate').hasSummary = false;
            treeGrid.getColumnByName('OnPTO').hasSummary = false;
            fix.detectChanges();
            expect(HelperUtils.getAllVisbleSummariesLength(fix)).toEqual(0);

            treeGrid.collapseAll();
            fix.detectChanges();

            treeGrid.getColumnByName('Name').hasSummary = true;
            fix.detectChanges();

            treeGrid.toggleRow(treeGrid.getRowByIndex(0).rowID);
            fix.detectChanges();

            expect(HelperUtils.getAllVisbleSummariesLength(fix)).toEqual(2);
            summaries = HelperUtils.getAllVisbleSummaries(fix);
            summaries.forEach(summary => {
                HelperUtils.verifyColumnSummaries(summary, 0, [], []);
                HelperUtils.verifyColumnSummaries(summary, 1, ['Count'], []);
                HelperUtils.verifyColumnSummaries(summary, 2, [], []);
                HelperUtils.verifyColumnSummaries(summary, 3, [], []);
                HelperUtils.verifyColumnSummaries(summary, 4, [], []);
            });
            HelperUtils.verifyVisbleSummariesHeight(fix, 1);
        });

        it('should be able to enable/disable summaries with API', () => {
            treeGrid.disableSummaries([{ fieldName: 'Age' }, { fieldName: 'HireDate' }]);
            fix.detectChanges();

            HelperUtils.verifyVisbleSummariesHeight(fix, 1);

            treeGrid.toggleRow(treeGrid.getRowByIndex(0).rowID);
            fix.detectChanges();

            let summaries = HelperUtils.getAllVisbleSummaries(fix);
            summaries.forEach(summary => {
                HelperUtils.verifyColumnSummaries(summary, 0, [], []);
                HelperUtils.verifyColumnSummaries(summary, 1, ['Count'], []);
                HelperUtils.verifyColumnSummaries(summary, 2, [], []);
                HelperUtils.verifyColumnSummaries(summary, 3, [], []);
                HelperUtils.verifyColumnSummaries(summary, 4, ['Count'], []);
            });

            HelperUtils.verifyVisbleSummariesHeight(fix, 1);

            treeGrid.disableSummaries('Name');
            treeGrid.disableSummaries('OnPTO');
            fix.detectChanges();

            expect(HelperUtils.getAllVisbleSummariesLength(fix)).toEqual(0);

            treeGrid.enableSummaries('HireDate');
            fix.detectChanges();

            expect(HelperUtils.getAllVisbleSummariesLength(fix)).toEqual(2);

            HelperUtils.verifyVisbleSummariesHeight(fix, 3);

            summaries = HelperUtils.getAllVisbleSummaries(fix);
            summaries.forEach(summary => {
                HelperUtils.verifyColumnSummaries(summary, 0, [], []);
                HelperUtils.verifyColumnSummaries(summary, 1, [], []);
                HelperUtils.verifyColumnSummaries(summary, 2, ['Count', 'Earliest', 'Latest'], []);
                HelperUtils.verifyColumnSummaries(summary, 3, [], []);
                HelperUtils.verifyColumnSummaries(summary, 4, [], []);
            });

            let summaryRow = HelperUtils.getSummaryRowByDataRowIndex(fix, 4);
            HelperUtils.verifyColumnSummaries(summaryRow, 2, ['Count', 'Earliest', 'Latest'], ['3', 'Jul 19, 2009', 'Sep 18, 2014']);

            treeGrid.enableSummaries([{ fieldName: 'Age' }, { fieldName: 'ID' }]);
            fix.detectChanges();

            HelperUtils.verifyVisbleSummariesHeight(fix, 5);

            summaries = HelperUtils.getAllVisbleSummaries(fix);
            summaries.forEach(summary => {
                HelperUtils.verifyColumnSummaries(summary, 0, ['Count', 'Min', 'Max', 'Sum', 'Avg'], []);
                HelperUtils.verifyColumnSummaries(summary, 1, [], []);
                HelperUtils.verifyColumnSummaries(summary, 2, ['Count', 'Earliest', 'Latest'], []);
                HelperUtils.verifyColumnSummaries(summary, 3, ['Count', 'Min', 'Max', 'Sum', 'Avg'], []);
                HelperUtils.verifyColumnSummaries(summary, 4, [], []);
            });

            summaryRow = HelperUtils.getSummaryRowByDataRowIndex(fix, 4);
            HelperUtils.verifyColumnSummaries(summaryRow, 3, ['Count', 'Min', 'Max', 'Sum', 'Avg'], ['3', '29', '43', '103', '34.333']);

            summaryRow = HelperUtils.getSummaryRowByDataRowIndex(fix, 0);
            HelperUtils.verifyColumnSummaries(summaryRow, 3, ['Count', 'Min', 'Max', 'Sum', 'Avg'], ['4', '42', '61', '207', '51.75']);
        });

        it('should be able to change summary operant at runtime', () => {
            treeGrid.expandAll();
            fix.detectChanges();

            HelperUtils.verifyVisbleSummariesHeight(fix, 5);

            treeGrid.getColumnByName('Age').summaries = fix.componentInstance.ageSummaryTest;
            fix.detectChanges();

            HelperUtils.verifyVisbleSummariesHeight(fix, 6);

            let summaryRow = HelperUtils.getSummaryRowByDataRowIndex(fix, 7);
            HelperUtils.verifyColumnSummaries(summaryRow, 3,
                ['Count', 'Min', 'Max', 'Sum', 'Avg', 'Test'], ['3', '29', '43', '103', '34.333', '2']);

            summaryRow = HelperUtils.getSummaryRowByDataRowIndex(fix, 6);
            HelperUtils.verifyColumnSummaries(summaryRow, 3,
                ['Count', 'Min', 'Max', 'Sum', 'Avg', 'Test'], ['2', '35', '44', '79', '39.5', '1']);

            summaryRow = HelperUtils.getSummaryRowByDataRowIndex(fix, 0);
            HelperUtils.verifyColumnSummaries(summaryRow, 3,
                ['Count', 'Min', 'Max', 'Sum', 'Avg', 'Test'], ['4', '42', '61', '207', '51.75', '0']);
        });

        it('should be able to change summary operant with API', () => {
            treeGrid.expandAll();
            fix.detectChanges();

            HelperUtils.verifyVisbleSummariesHeight(fix, 5);

            treeGrid.enableSummaries([{ fieldName: 'Age', customSummary: fix.componentInstance.ageSummary }]);
            fix.detectChanges();

            HelperUtils.verifyVisbleSummariesHeight(fix, 3);

            let summaryRow = HelperUtils.getSummaryRowByDataRowIndex(fix, 7);
            HelperUtils.verifyColumnSummaries(summaryRow, 3, ['Count', 'Sum', 'Avg'], ['3', '103', '34.33']);

            summaryRow = HelperUtils.getSummaryRowByDataRowIndex(fix, 6);
            HelperUtils.verifyColumnSummaries(summaryRow, 3, ['Count', 'Sum', 'Avg'], ['2', '79', '39.5']);

            summaryRow = HelperUtils.getSummaryRowByDataRowIndex(fix, 0);
            HelperUtils.verifyColumnSummaries(summaryRow, 3, ['Count', 'Sum', 'Avg'], ['4', '207', '51.75']);
        });

        it('Hiding: should render correct summaries when show/hide a colomn', () => {
            treeGrid.expandAll();
            fix.detectChanges();

            treeGrid.getColumnByName('Age').hidden = true;
            fix.detectChanges();

            let summaries = HelperUtils.getAllVisbleSummaries(fix);
            summaries.forEach(summary => {
                HelperUtils.verifyColumnSummaries(summary, 0, [], []);
                HelperUtils.verifyColumnSummaries(summary, 1, ['Count'], []);
                HelperUtils.verifyColumnSummaries(summary, 2, ['Count', 'Earliest', 'Latest'], []);
                HelperUtils.verifyColumnSummaries(summary, 3, ['Count'], []);
            });

            HelperUtils.verifyVisbleSummariesHeight(fix, 3);

            treeGrid.getColumnByName('Name').hidden = true;
            treeGrid.getColumnByName('HireDate').hidden = true;
            treeGrid.getColumnByName('OnPTO').hidden = true;
            fix.detectChanges();
            expect(HelperUtils.getAllVisbleSummariesLength(fix)).toEqual(0);

            treeGrid.getColumnByName('HireDate').hidden = false;
            treeGrid.getColumnByName('OnPTO').hidden = false;
            fix.detectChanges();

            summaries = HelperUtils.getAllVisbleSummaries(fix);
            summaries.forEach(summary => {
                HelperUtils.verifyColumnSummaries(summary, 0, [], []);
                HelperUtils.verifyColumnSummaries(summary, 1, ['Count', 'Earliest', 'Latest'], []);
                HelperUtils.verifyColumnSummaries(summary, 2, ['Count'], []);
            });

            HelperUtils.verifyVisbleSummariesHeight(fix, 3);

            let summaryRow = HelperUtils.getSummaryRowByDataRowIndex(fix, 7);
            HelperUtils.verifyColumnSummaries(summaryRow, 2, ['Count'], ['3']);

            summaryRow = HelperUtils.getSummaryRowByDataRowIndex(fix, 6);
            HelperUtils.verifyColumnSummaries(summaryRow, 2, ['Count'], ['2']);

            summaryRow = HelperUtils.getSummaryRowByDataRowIndex(fix, 0);
            HelperUtils.verifyColumnSummaries(summaryRow, 2, ['Count'], ['4']);
        });

        it('Filtering: should render correct summaries when filter and found only childs', () => {
            treeGrid.filter('ID', 12, IgxNumberFilteringOperand.instance().condition('lessThanOrEqualTo'));
            fix.detectChanges();

            expect(HelperUtils.getAllVisbleSummariesLength(fix)).toEqual(2);
            let summaryRow = HelperUtils.getSummaryRowByDataRowIndex(fix, 2);
            HelperUtils.verifyColumnSummaries(summaryRow, 1, ['Count'], ['1']);
            HelperUtils.verifyColumnSummaries(summaryRow, 2, ['Count', 'Earliest', 'Latest'], ['1', 'Dec 18, 2007', 'Dec 18, 2007']);
            HelperUtils.verifyColumnSummaries(summaryRow, 3, ['Count', 'Min', 'Max', 'Sum', 'Avg'], ['1', '50', '50', '50', '50']);

            summaryRow = HelperUtils.getSummaryRowByDataRowIndex(fix, 0);
            verifySummaryIsEmpty(summaryRow);
        });

        it('Filtering: should render correct summaries when filter and no results are found', () => {
            treeGrid.filter('ID', 0, IgxNumberFilteringOperand.instance().condition('lessThanOrEqualTo'));
            fix.detectChanges();

            expect(HelperUtils.getAllVisbleSummariesLength(fix)).toEqual(1);
            const summaryRow = HelperUtils.getSummaryRowByDataRowIndex(fix, 0);
            verifySummaryIsEmpty(summaryRow);
        });

        it('Filtering: should render correct summaries when filter', () => {
            treeGrid.filter('ID', 17, IgxNumberFilteringOperand.instance().condition('lessThanOrEqualTo'));
            fix.detectChanges();

            expect(HelperUtils.getAllVisbleSummariesLength(fix)).toEqual(3);

            let summaryRow = HelperUtils.getSummaryRowByDataRowIndex(fix, 5);
            HelperUtils.verifyColumnSummaries(summaryRow, 1, ['Count'], ['1']);
            HelperUtils.verifyColumnSummaries(summaryRow, 2, ['Count', 'Earliest', 'Latest'], ['1', 'Dec 18, 2007', 'Dec 18, 2007']);
            HelperUtils.verifyColumnSummaries(summaryRow, 3, ['Count', 'Min', 'Max', 'Sum', 'Avg'], ['1', '50', '50', '50', '50']);

            summaryRow = HelperUtils.getSummaryRowByDataRowIndex(fix, 2);
            HelperUtils.verifyColumnSummaries(summaryRow, 1, ['Count'], ['1']);
            HelperUtils.verifyColumnSummaries(summaryRow, 2, ['Count', 'Earliest', 'Latest'], ['1', 'May 4, 2014', 'May 4, 2014']);
            HelperUtils.verifyColumnSummaries(summaryRow, 3, ['Count', 'Min', 'Max', 'Sum', 'Avg'], ['1', '44', '44', '44', '44']);

            summaryRow = HelperUtils.getSummaryRowByDataRowIndex(fix, 0);
            HelperUtils.verifyColumnSummaries(summaryRow, 1, ['Count'], ['1']);
            HelperUtils.verifyColumnSummaries(summaryRow, 3, ['Count', 'Min', 'Max', 'Sum', 'Avg'], ['1', '61', '61', '61', '61']);
            HelperUtils.verifyColumnSummaries(summaryRow, 2, ['Count', 'Earliest', 'Latest'], ['1', 'Feb 1, 2010', 'Feb 1, 2010']);
        });

        it('Paging: should render correct summaries when paging is enable and position is buttom', () => {
            treeGrid.paging = true;
            treeGrid.perPage = 4;
            fix.detectChanges();

            expect(HelperUtils.getAllVisbleSummariesLength(fix)).toEqual(1);
            verifyTreeBaseSummaries(fix);

            treeGrid.toggleRow(treeGrid.getRowByIndex(0).rowID);
            fix.detectChanges();

            expect(HelperUtils.getAllVisbleSummariesLength(fix)).toEqual(2);
            verifyTreeBaseSummaries(fix);
            verifySummaryForRow147(fix, 4);

            treeGrid.toggleRow(treeGrid.getRowByIndex(3).rowID);
            fix.detectChanges();

            expect(HelperUtils.getAllVisbleSummariesLength(fix)).toEqual(1);

            treeGrid.page = 1;
            fix.detectChanges();

            expect(HelperUtils.getAllVisbleSummariesLength(fix)).toEqual(3);
            verifyTreeBaseSummaries(fix);
            verifySummaryForRow147(fix, 3);
            verifySummaryForRow317(fix, 2);
        });

        it('Paging: should render correct summaries when paging is enable and position is top', () => {
            treeGrid.paging = true;
            treeGrid.perPage = 4;
            treeGrid.summaryPosition = 'top';
            fix.detectChanges();

            expect(HelperUtils.getAllVisbleSummariesLength(fix)).toEqual(1);
            verifyTreeBaseSummaries(fix);

            treeGrid.toggleRow(treeGrid.getRowByIndex(0).rowID);
            fix.detectChanges();

            expect(HelperUtils.getAllVisbleSummariesLength(fix)).toEqual(2);
            verifyTreeBaseSummaries(fix);
            verifySummaryForRow147(fix, 1);

            treeGrid.toggleRow(treeGrid.getRowByIndex(4).rowID);
            fix.detectChanges();

            expect(HelperUtils.getAllVisbleSummariesLength(fix)).toEqual(3);
            verifySummaryForRow317(fix, 5);
            verifySummaryForRow147(fix, 1);

            treeGrid.page = 1;
            fix.detectChanges();

            expect(HelperUtils.getAllVisbleSummariesLength(fix)).toEqual(1);
            verifyTreeBaseSummaries(fix);

            treeGrid.toggleRow(treeGrid.getRowByIndex(2).rowID);
            fix.detectChanges();

            expect(HelperUtils.getAllVisbleSummariesLength(fix)).toEqual(2);
            verifySummaryForRow847(fix, 3);
        });

        it('CRUD: Add root node', () => {
            treeGrid.expandAll();
            fix.detectChanges();

            const newRow = {
                ID: 777,
                ParentID: -1,
                Name: 'New Employee',
                HireDate: new Date(2019, 3, 3),
                Age: 19
            };
            treeGrid.addRow(newRow);
            fix.detectChanges();

            const summaryRow = HelperUtils.getSummaryRowByDataRowIndex(fix, 0);
            HelperUtils.verifyColumnSummaries(summaryRow, 1, ['Count'], ['5']);
            HelperUtils.verifyColumnSummaries(summaryRow, 2, ['Count', 'Earliest', 'Latest'], ['5', 'Apr 20, 2008', 'Apr 3, 2019']);
            HelperUtils.verifyColumnSummaries(summaryRow, 3, ['Count', 'Min', 'Max', 'Sum', 'Avg'], ['5', '19', '61', '226', '45.2']);
            HelperUtils.verifyColumnSummaries(summaryRow, 4, ['Count'], ['5']);

            verifySummaryForRow147(fix, 7);
        });

        it('CRUD: Add child node', () => {
            treeGrid.expandAll();
            fix.detectChanges();

            const newRow = {
                ID: 777,
                ParentID: 147,
                Name: 'New Employee',
                HireDate: new Date(2019, 3, 3),
                Age: 19
            };
            treeGrid.addRow(newRow);
            fix.detectChanges();

            const summaryRow = HelperUtils.getSummaryRowByDataRowIndex(fix, 8);
            HelperUtils.verifyColumnSummaries(summaryRow, 1, ['Count'], ['4']);
            HelperUtils.verifyColumnSummaries(summaryRow, 2, ['Count', 'Earliest', 'Latest'], ['4', 'Jul 19, 2009', 'Apr 3, 2019']);
            HelperUtils.verifyColumnSummaries(summaryRow, 4, ['Count'], ['4']);

            verifyTreeBaseSummaries(fix);
        });

        it('CRUD: delete root node', () => {
            treeGrid.expandAll();
            fix.detectChanges();

            treeGrid.deleteRow(treeGrid.getRowByIndex(0).rowID);
            fix.detectChanges();

            const summaryRow = HelperUtils.getSummaryRowByDataRowIndex(fix, 0);
            HelperUtils.verifyColumnSummaries(summaryRow, 1, ['Count'], ['3']);
            HelperUtils.verifyColumnSummaries(summaryRow, 2, ['Count', 'Earliest', 'Latest'], ['3', 'Feb 1, 2010', 'Feb 22, 2014']);
            HelperUtils.verifyColumnSummaries(summaryRow, 3, ['Count', 'Min', 'Max', 'Sum', 'Avg'], ['3', '42', '61', '152', '50.667']);
            HelperUtils.verifyColumnSummaries(summaryRow, 4, ['Count'], ['3']);

            verifySummaryForRow847(fix, 5);
        });

        it('CRUD: delete all root nodes', () => {
            treeGrid.toggleRow(treeGrid.getRowByIndex(0).rowID);
            fix.detectChanges();

            treeGrid.toggleRow(treeGrid.getRowByIndex(5).rowID);
            fix.detectChanges();

            expect(HelperUtils.getAllVisbleSummariesLength(fix)).toEqual(3);

            treeGrid.deleteRow(treeGrid.getRowByIndex(5).rowID);
            fix.detectChanges();

            let summaryRow = HelperUtils.getSummaryRowByDataRowIndex(fix, 0);
            HelperUtils.verifyColumnSummaries(summaryRow, 1, ['Count'], ['3']);
            expect(HelperUtils.getAllVisbleSummariesLength(fix)).toEqual(2);

            treeGrid.deleteRow(treeGrid.getRowByIndex(5).rowID);
            fix.detectChanges();

            summaryRow = HelperUtils.getSummaryRowByDataRowIndex(fix, 0);
            HelperUtils.verifyColumnSummaries(summaryRow, 1, ['Count'], ['2']);

            treeGrid.deleteRow(treeGrid.getRowByIndex(5).rowID);
            fix.detectChanges();

            summaryRow = HelperUtils.getSummaryRowByDataRowIndex(fix, 0);
            HelperUtils.verifyColumnSummaries(summaryRow, 1, ['Count'], ['1']);

            treeGrid.deleteRow(treeGrid.getRowByIndex(0).rowID);
            fix.detectChanges();

            expect(HelperUtils.getAllVisbleSummariesLength(fix)).toEqual(1);
            summaryRow = HelperUtils.getSummaryRowByDataRowIndex(fix, 0);
            verifySummaryIsEmpty(summaryRow);
        });

        it('CRUD: delete child node', () => {
            treeGrid.toggleRow(treeGrid.getRowByIndex(0).rowID);
            fix.detectChanges();

            treeGrid.toggleRow(treeGrid.getRowByIndex(3).rowID);
            fix.detectChanges();

            expect(HelperUtils.getAllVisbleSummariesLength(fix)).toEqual(3);

            treeGrid.deleteRow(treeGrid.getRowByIndex(3).rowID);
            fix.detectChanges();

            expect(HelperUtils.getAllVisbleSummariesLength(fix)).toEqual(2);
            verifyTreeBaseSummaries(fix);

            const summaryRow = HelperUtils.getSummaryRowByDataRowIndex(fix, 3);
            HelperUtils.verifyColumnSummaries(summaryRow, 1, ['Count'], ['2']);
            HelperUtils.verifyColumnSummaries(summaryRow, 2, ['Count', 'Earliest', 'Latest'], ['2', 'Jul 19, 2009', 'Jul 3, 2011']);
            HelperUtils.verifyColumnSummaries(summaryRow, 3, ['Count', 'Min', 'Max', 'Sum', 'Avg'], ['2', '29', '43', '72', '36']);
            HelperUtils.verifyColumnSummaries(summaryRow, 4, ['Count'], ['2']);

            treeGrid.deleteRow(treeGrid.getRowByIndex(2).rowID);
            fix.detectChanges();

            treeGrid.deleteRow(treeGrid.getRowByIndex(1).rowID);
            fix.detectChanges();

            expect(HelperUtils.getAllVisbleSummariesLength(fix)).toEqual(1);
            verifyTreeBaseSummaries(fix);
        });

        it('CRUD: Update root node', () => {
            const newRow = {
                ID: 147,
                ParentID: -1,
                Name: 'New Employee',
                HireDate: new Date(2019, 3, 3),
                Age: 19
            };
            treeGrid.getRowByKey(147).update(newRow);
            fix.detectChanges();

            const summaryRow = HelperUtils.getSummaryRowByDataRowIndex(fix, 0);
            HelperUtils.verifyColumnSummaries(summaryRow, 0, [], []);
            HelperUtils.verifyColumnSummaries(summaryRow, 1, ['Count'], ['4']);
            HelperUtils.verifyColumnSummaries(summaryRow, 2, ['Count', 'Earliest', 'Latest'], ['4', 'Feb 1, 2010', 'Apr 3, 2019']);
            HelperUtils.verifyColumnSummaries(summaryRow, 3, ['Count', 'Min', 'Max', 'Sum', 'Avg'], ['4', '19', '61', '171', '42.75']);
            HelperUtils.verifyColumnSummaries(summaryRow, 4, ['Count'], ['4']);
        });

        it('CRUD: Update child node', () => {
            treeGrid.toggleRow(treeGrid.getRowByIndex(1).rowID);
            fix.detectChanges();

            treeGrid.toggleRow(treeGrid.getRowByIndex(3).rowID);
            fix.detectChanges();

            const newRow = {
                ID: 663,
                ParentID: 847,
                Name: 'New Employee',
                HireDate: new Date(2019, 3, 3),
                Age: 19
            };
            treeGrid.getRowByKey(663).update(newRow);
            fix.detectChanges();

            verifyTreeBaseSummaries(fix);

            let summaryRow = HelperUtils.getSummaryRowByDataRowIndex(fix, 6);
            HelperUtils.verifyColumnSummaries(summaryRow, 0, [], []);
            HelperUtils.verifyColumnSummaries(summaryRow, 1, ['Count'], ['2']);
            HelperUtils.verifyColumnSummaries(summaryRow, 2, ['Count', 'Earliest', 'Latest'], ['2', 'May 4, 2014', 'Apr 3, 2019']);
            HelperUtils.verifyColumnSummaries(summaryRow, 3, ['Count', 'Min', 'Max', 'Sum', 'Avg'], ['2', '19', '44', '63', '31.5']);
            HelperUtils.verifyColumnSummaries(summaryRow, 4, ['Count'], ['2']);

            summaryRow = HelperUtils.getSummaryRowByDataRowIndex(fix, 5);
            HelperUtils.verifyColumnSummaries(summaryRow, 0, [], []);
            HelperUtils.verifyColumnSummaries(summaryRow, 1, ['Count'], ['1']);
            HelperUtils.verifyColumnSummaries(summaryRow, 2, ['Count', 'Earliest', 'Latest'], ['1', 'Apr 22, 2010', 'Apr 22, 2010']);
            HelperUtils.verifyColumnSummaries(summaryRow, 3, ['Count', 'Min', 'Max', 'Sum', 'Avg'], ['1', '39', '39', '39', '39']);
            HelperUtils.verifyColumnSummaries(summaryRow, 4, ['Count'], ['1']);
        });
    });

    it('should render correct custom summaries', () => {
        const fix = TestBed.createComponent(IgxTreeGridCustomSummariesComponent);
        fix.detectChanges();
        const treeGrid = fix.componentInstance.treeGrid;
        treeGrid.expandAll();
        fix.detectChanges();

        HelperUtils.verifyVisbleSummariesHeight(fix, 3);

        let summaryRow = HelperUtils.getSummaryRowByDataRowIndex(fix, 7);
        HelperUtils.verifyColumnSummaries(summaryRow, 3, ['Count', 'Sum', 'Avg'], ['3', '103', '34.33']);

        summaryRow = HelperUtils.getSummaryRowByDataRowIndex(fix, 6);
        HelperUtils.verifyColumnSummaries(summaryRow, 3, ['Count', 'Sum', 'Avg'], ['2', '79', '39.5']);

        summaryRow = HelperUtils.getSummaryRowByDataRowIndex(fix, 0);
        HelperUtils.verifyColumnSummaries(summaryRow, 3, ['Count', 'Sum', 'Avg'], ['4', '207', '51.75']);
    });

    it('should render summaries for all the rows', () => {
        const fix = TestBed.createComponent(IgxTreeGridSummariesComponent);
        fix.detectChanges();
        const treeGrid = fix.componentInstance.treeGrid;

        verifyTreeBaseSummaries(fix);
        expect(HelperUtils.getAllVisbleSummariesLength(fix)).toEqual(1);

        treeGrid.toggleRow(treeGrid.getRowByIndex(1).rowID);
        fix.detectChanges();

        verifyTreeBaseSummaries(fix);
        verifySummaryForRow847(fix, 4);
        expect(HelperUtils.getAllVisbleSummariesLength(fix)).toEqual(2);

        treeGrid.toggleRow(treeGrid.getRowByIndex(3).rowID);
        fix.detectChanges();

        expect(HelperUtils.getAllVisbleSummariesLength(fix)).toEqual(3);

        verifyTreeBaseSummaries(fix);
        verifySummaryForRow663(fix, 5);
        verifySummaryForRow847(fix, 6);
    });

    function verifySummaryForRow147(fixture, vissibleIndex) {
        const summaryRow = HelperUtils.getSummaryRowByDataRowIndex(fixture, vissibleIndex);
        HelperUtils.verifyColumnSummaries(summaryRow, 0, [], []);
        HelperUtils.verifyColumnSummaries(summaryRow, 1, ['Count'], ['3']);
        HelperUtils.verifyColumnSummaries(summaryRow, 2, ['Count', 'Earliest', 'Latest'], ['3', 'Jul 19, 2009', 'Sep 18, 2014']);
        HelperUtils.verifyColumnSummaries(summaryRow, 3, ['Count', 'Min', 'Max', 'Sum', 'Avg'], ['3', '29', '43', '103', '34.333']);
        HelperUtils.verifyColumnSummaries(summaryRow, 4, ['Count'], ['3']);
    }

    function verifySummaryForRow317(fixture, vissibleIndex) {
        const summaryRow = HelperUtils.getSummaryRowByDataRowIndex(fixture, vissibleIndex);
        HelperUtils.verifyColumnSummaries(summaryRow, 0, [], []);
        HelperUtils.verifyColumnSummaries(summaryRow, 1, ['Count'], ['2']);
        HelperUtils.verifyColumnSummaries(summaryRow, 2, ['Count', 'Earliest', 'Latest'], ['2', 'Nov 11, 2009', 'Oct 17, 2015']);
        HelperUtils.verifyColumnSummaries(summaryRow, 3, ['Count', 'Min', 'Max', 'Sum', 'Avg'], ['2', '35', '44', '79', '39.5']);
        HelperUtils.verifyColumnSummaries(summaryRow, 4, ['Count'], ['2']);
    }

    function verifySummaryForRow847(fixture, vissibleIndex) {
        const summaryRow = HelperUtils.getSummaryRowByDataRowIndex(fixture, vissibleIndex);
        HelperUtils.verifyColumnSummaries(summaryRow, 0, [], []);
        HelperUtils.verifyColumnSummaries(summaryRow, 1, ['Count'], ['2']);
        HelperUtils.verifyColumnSummaries(summaryRow, 2, ['Count', 'Earliest', 'Latest'], ['2', 'May 4, 2014', 'Dec 9, 2017']);
        HelperUtils.verifyColumnSummaries(summaryRow, 3, ['Count', 'Min', 'Max', 'Sum', 'Avg'], ['2', '25', '44', '69', '34.5']);
        HelperUtils.verifyColumnSummaries(summaryRow, 4, ['Count'], ['2']);
    }

    function verifySummaryForRow663(fixture, vissibleIndex) {
        const summaryRow = HelperUtils.getSummaryRowByDataRowIndex(fixture, vissibleIndex);
        HelperUtils.verifyColumnSummaries(summaryRow, 0, [], []);
        HelperUtils.verifyColumnSummaries(summaryRow, 1, ['Count'], ['1']);
        HelperUtils.verifyColumnSummaries(summaryRow, 2, ['Count', 'Earliest', 'Latest'], ['1', 'Apr 22, 2010', 'Apr 22, 2010']);
        HelperUtils.verifyColumnSummaries(summaryRow, 3, ['Count', 'Min', 'Max', 'Sum', 'Avg'], ['1', '39', '39', '39', '39']);
        HelperUtils.verifyColumnSummaries(summaryRow, 4, ['Count'], ['1']);
    }

    function verifySummaryIsEmpty(summaryRow) {
        HelperUtils.verifyColumnSummaries(summaryRow, 0, [], []);
        HelperUtils.verifyColumnSummaries(summaryRow, 1, ['Count'], ['0']);
        HelperUtils.verifyColumnSummaries(summaryRow, 2, ['Count', 'Earliest', 'Latest'], ['0', '', '']);
        HelperUtils.verifyColumnSummaries(summaryRow, 3, ['Count', 'Min', 'Max', 'Sum', 'Avg'], ['0', '0', '0', '0', '0']);
        HelperUtils.verifyColumnSummaries(summaryRow, 4, ['Count'], ['0']);
    }

    function verifyTreeBaseSummaries(fixture) {
        const summaryRow = HelperUtils.getSummaryRowByDataRowIndex(fixture, 0);
        HelperUtils.verifyColumnSummaries(summaryRow, 0, [], []);
        HelperUtils.verifyColumnSummaries(summaryRow, 1, ['Count'], ['4']);
        HelperUtils.verifyColumnSummaries(summaryRow, 2, ['Count', 'Earliest', 'Latest'], ['4', 'Apr 20, 2008', 'Feb 22, 2014']);
        HelperUtils.verifyColumnSummaries(summaryRow, 3, ['Count', 'Min', 'Max', 'Sum', 'Avg'], ['4', '42', '61', '207', '51.75']);
        HelperUtils.verifyColumnSummaries(summaryRow, 4, ['Count'], ['4']);
    }
});
