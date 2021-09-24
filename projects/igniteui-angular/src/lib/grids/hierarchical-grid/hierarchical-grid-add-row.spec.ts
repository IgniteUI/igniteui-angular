import { TestBed, fakeAsync } from '@angular/core/testing';
import { IgxHierarchicalGridModule, IgxHierarchicalGridComponent } from './public_api';
import { configureTestSuite } from '../../test-utils/configure-suite';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { IgxActionStripModule, IgxActionStripComponent } from '../../action-strip/public_api';
import { IgxHierarchicalGridActionStripComponent } from '../../test-utils/hierarchical-grid-components.spec';
import { wait } from '../../test-utils/ui-interactions.spec';

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
        TestBed.configureTestingModule({
            declarations: [
                IgxHierarchicalGridActionStripComponent
            ],
            imports: [IgxHierarchicalGridModule, NoopAnimationsModule, IgxActionStripModule]
        });
    }));

    describe(' Basic', () => {
        beforeEach(fakeAsync(/** height/width setter rAF */() => {
            fixture = TestBed.createComponent(IgxHierarchicalGridActionStripComponent);
            fixture.detectChanges();
            hierarchicalGrid = fixture.componentInstance.hgrid;
            _actionStrip = fixture.componentInstance.actionStrip;
        }));

        it('Should collapse an expanded record when beginAddRow is called for it', () => {
            const row = hierarchicalGrid.rowList.first;
            hierarchicalGrid.expandRow(row.rowID);
            fixture.detectChanges();
            expect(row.expanded).toBeTrue();

            row.beginAddRow();
            fixture.detectChanges();
            expect(row.expanded).toBeFalse();
            expect(hierarchicalGrid.gridAPI.get_row_by_index(1).addRowUI).toBeTrue();
        });

        it('Should allow the expansion of a newly added (commited) record', async () => {
            const row = hierarchicalGrid.rowList.first;
            hierarchicalGrid.expandRow(row.rowID);
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
            const newRow = hierarchicalGrid.rowList.find(r => r.rowID === newRowData[hierarchicalGrid.primaryKey]);
            expect(newRow.expanded).toBeFalse();
            hierarchicalGrid.expandRow(newRow.rowID);
            fixture.detectChanges();
            expect(newRow.expanded).toBeTrue();
        });
    });
});
