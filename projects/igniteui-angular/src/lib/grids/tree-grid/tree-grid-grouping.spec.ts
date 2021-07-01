import { TestBed, fakeAsync, tick, waitForAsync } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { DefaultSortingStrategy } from 'igniteui-angular';
import { configureTestSuite } from '../../test-utils/configure-suite';
import { setupGridScrollDetection } from '../../test-utils/helper-utils.spec';
import { IgxTreeGridGroupByAreaTestComponent, IgxTreeGridGroupingComponent } from '../../test-utils/tree-grid-components.spec';
import { IgxTreeGridGroupByAreaComponent } from '../grouping/tree-grid-group-by-area.component';
import { IgxTreeGridModule } from './public_api';
import { IgxTreeGridComponent } from './tree-grid.component';

describe('IgxTreeGrid', () => {
    configureTestSuite();

    beforeAll(waitForAsync(() => {
        TestBed.configureTestingModule({
            declarations: [IgxTreeGridGroupingComponent, IgxTreeGridGroupByAreaTestComponent],
            imports: [
                BrowserAnimationsModule,
                IgxTreeGridModule
            ]
        }).compileComponents();
    }));

    let fix;
    let treeGrid: IgxTreeGridComponent;
    let groupByArea: IgxTreeGridGroupByAreaComponent;

    const DROP_AREA_MSG = 'Drag a column header and drop it here to group by that column.';
    describe(' GroupByArea Standalone', ()=> {

        beforeEach(waitForAsync(/** height/width setter rAF */() => {
            fix = TestBed.createComponent(IgxTreeGridGroupByAreaTestComponent);
            fix.detectChanges();

            groupByArea = fix.componentInstance.groupByArea;
            treeGrid = fix.componentInstance.treeGrid;
        }));

        it('loads successfully', fakeAsync(() => {
            const groupByAreaElement = fix.debugElement.nativeElement.querySelector('igx-tree-grid-group-by-area');
            const chipsAreaElement = groupByAreaElement.querySelector('igx-chips-area');

            expect(groupByAreaElement).toBeDefined();
            expect(chipsAreaElement.children.length).toEqual(1);

            const dropAreaElement = chipsAreaElement.children[0];
            expect(dropAreaElement.children.length).toEqual(2);

            const iconElement = dropAreaElement.querySelector('igx-icon');
            expect(iconElement).toBeDefined();
            expect(iconElement.innerText).toEqual('group_work');

            const spanElement = dropAreaElement.querySelector('span');
            expect(spanElement).toBeDefined();
            expect(spanElement.innerText).toEqual(DROP_AREA_MSG);
        }));

        it ('has the expected default properties\' values', fakeAsync(() => {
            expect(groupByArea).toBeDefined();
            expect(groupByArea.grid).toEqual(treeGrid);
            expect(groupByArea.expressions).toEqual([]);
            expect(groupByArea.hideGroupedColumns).toBeFalse();
            expect(groupByArea.dropAreaMessage).toMatch(DROP_AREA_MSG);
            expect(groupByArea.dropAreaTemplate).toBeUndefined();
            expect(groupByArea.dropAreaVisible).toBeTrue();
        }));

        it('allows changing the drop area message', fakeAsync(() => {
            const dropMsg = 'New drop message';
            groupByArea.dropAreaMessage = dropMsg;
            fix.detectChanges();
            tick();

            expect(groupByArea.dropAreaMessage).toEqual(dropMsg);
            expect(fix.debugElement.nativeElement.querySelector('.igx-drop-area__text').innerText).toEqual(dropMsg);
        }));

        it('allows setting the `hideGroupedColumns` property', fakeAsync(() => {
            groupByArea.hideGroupedColumns = true;
            fix.detectChanges();
            tick();

            expect(groupByArea.hideGroupedColumns).toBeTrue();
        }));
    });

    describe('', () => {
        beforeEach(waitForAsync(/** height/width setter rAF */() => {
            fix = TestBed.createComponent(IgxTreeGridGroupingComponent);
            fix.detectChanges();
            treeGrid = fix.componentInstance.treeGrid;
            groupByArea = fix.componentInstance.groupByArea;
            setupGridScrollDetection(fix, treeGrid);
        }));

        it ('GroupByArea has the expected properties\' values set', fakeAsync(() => {
            expect(groupByArea).toBeDefined();
            expect(groupByArea.expressions.length).toEqual(2);
            expect(groupByArea.grid).toEqual(treeGrid);
            expect(groupByArea.hideGroupedColumns).toBeFalse();
            expect(groupByArea.dropAreaMessage).toMatch(DROP_AREA_MSG);
            expect(groupByArea.dropAreaTemplate).toBeUndefined();
            expect(groupByArea.dropAreaVisible).toBeFalse();
        }));

        it('is loaded grouped by two fields.', fakeAsync(() => {
            // treeGrid.expandAll();
            // tick();

            const groupArea = fix.debugElement.nativeElement.querySelector('igx-tree-grid-group-by-area');
            expect(groupArea).toBeDefined();
            const chips = fix.debugElement.nativeElement.querySelectorAll('igx-chip');
            expect(chips.length).toBe(2);
        }));

        it('shows a new group chip when adding a grouping expression', fakeAsync(() => {
            const groupingExpressions = fix.componentInstance.groupingExpressions;
            expect(groupByArea.expressions).toEqual(groupingExpressions);
            let chips = getChips(fix);

            expect(chips.length).toEqual(2);
            expect(chips[0].id).toEqual('OnPTO');
            expect(chips[1].id).toEqual('HireDate');

            groupingExpressions.push({ fieldName: 'JobTitle', dir: 2, ignoreCase: true, strategy: DefaultSortingStrategy.instance()});
            fix.detectChanges();
            tick();

            chips = getChips(fix);
            expect(chips.length).toEqual(3);
            expect(chips[2].id).toEqual('JobTitle');
        }));

        it('removes a group chip when removing a grouping expression', fakeAsync(() => {
            const groupingExpressions = fix.componentInstance.groupingExpressions;
            groupingExpressions.pop();
            fix.detectChanges();

            expect(groupByArea.expressions.length).toEqual(1);
            expect(getChips(fix).length).toEqual(1);
            expect(getChips(fix)[0].id).toEqual('OnPTO');
        }));

        it('group columns stay visible by default', fakeAsync(() => {
            expect(treeGrid.getColumnByName('OnPTO').hidden).toBeFalse();
            expect(treeGrid.getColumnByName('HireDate').hidden).toBeFalse();

        }));

        it('hides the grouped by column when hideGroupedColumns=true', fakeAsync(() => {
            const groupingExpressions = fix.componentInstance.groupingExpressions;
            groupByArea.hideGroupedColumns = true;
            fix.detectChanges();

            expect(treeGrid.getColumnByName('HireDate').hidden).toBeTrue();

            groupingExpressions.pop();
            fix.detectChanges();
            tick(16);
            expect(treeGrid.getColumnByName('HireDate').hidden).toBeFalse();
        }));

    });

    const getChips = (fixture) => {
        const chipsAreaElement = fixture.debugElement.nativeElement.querySelector('igx-chips-area');
        return chipsAreaElement.querySelectorAll('igx-chip');
    };
});
