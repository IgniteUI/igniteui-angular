import { TestBed } from '@angular/core/testing';
import { IgxHierarchicalGridComponent } from './public_api';
import { configureTestSuite } from '../../test-utils/configure-suite';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { IgxActionStripComponent } from '../../action-strip/public_api';
import { IgxHierarchicalGridActionStripComponent } from '../../test-utils/hierarchical-grid-components.spec';
import { wait } from '../../test-utils/ui-interactions.spec';
import { By } from '@angular/platform-browser';

describe('IgxHierarchicalGrid - Add Row UI #tGrid', () => {
    let fixture;
    let hierarchicalGrid: IgxHierarchicalGridComponent;
    let _actionStrip: IgxActionStripComponent;
    const endTransition = () => {
        // transition end needs to be simulated
        const animationElem = fixture.nativeElement.querySelector('.igx-grid__tr--inner');
        const endEvent = new AnimationEvent('animationend');
        animationElem.dispatchEvent(endEvent);
    };
    configureTestSuite((() => {
        return TestBed.configureTestingModule({
            imports: [NoopAnimationsModule, IgxHierarchicalGridActionStripComponent]
        });
    }));

    describe(' Basic', () => {
        beforeEach(() => {
            fixture = TestBed.createComponent(IgxHierarchicalGridActionStripComponent);
            fixture.detectChanges();
            hierarchicalGrid = fixture.componentInstance.hgrid;
            _actionStrip = fixture.componentInstance.actionStrip;
        });

        it('Should collapse an expanded record when beginAddRow is called for it', () => {
            const row = hierarchicalGrid.rowList.first;
            hierarchicalGrid.expandRow(row.key);
            fixture.detectChanges();
            expect(row.expanded).toBeTrue();

            row.beginAddRow();
            fixture.detectChanges();
            expect(row.expanded).toBeFalse();
            expect(hierarchicalGrid.gridAPI.get_row_by_index(1).addRowUI).toBeTrue();
        });

        it('Should allow the expansion of a newly added (commited) record', async () => {
            const row = hierarchicalGrid.rowList.first;
            hierarchicalGrid.expandRow(row.key);
            fixture.detectChanges();
            expect(row.expanded).toBeTrue();

            row.beginAddRow();
            fixture.detectChanges();
            endTransition();
            expect(row.expanded).toBeFalse();

            expect(hierarchicalGrid.gridAPI.get_row_by_index(1).addRowUI).toBeTrue();
            hierarchicalGrid.gridAPI.crudService.endEdit(true);
            fixture.detectChanges();
            hierarchicalGrid.addRowSnackbar.triggerAction();
            fixture.detectChanges();

            await wait(100);
            fixture.detectChanges();

            const newRowData = hierarchicalGrid.data[hierarchicalGrid.data.length - 1];
            const newRow = hierarchicalGrid.rowList.find(r => r.key === newRowData[hierarchicalGrid.primaryKey]);
            expect(newRow.expanded).toBeFalse();
            hierarchicalGrid.expandRow(newRow.key);
            fixture.detectChanges();
            expect(newRow.expanded).toBeTrue();
        });

        it('Should allow adding to child grid for parent row that has null/undefined child collection.', async () => {
            const data = [ { ID: '1',  ProductName: 'Product: A'}];
            hierarchicalGrid.data = data;
            fixture.detectChanges();

            hierarchicalGrid.expandRow('1');
            fixture.detectChanges();

            const child1Grids = fixture.debugElement.queryAll(By.css('igx-child-grid-row'));
            const child1Grid = child1Grids[0].query(By.css('igx-hierarchical-grid'));
            const childComponent: IgxHierarchicalGridComponent = child1Grid.componentInstance;
            const childDataToAdd = { ID: '2',  ProductName: 'ChildProduct: A'};
            childComponent.addRow(childDataToAdd);
            fixture.detectChanges();
            expect(data[0]['childData1'].length).toBe(1);
            expect(data[0]['childData1'][0]).toBe(childDataToAdd);
        });
    });
});
