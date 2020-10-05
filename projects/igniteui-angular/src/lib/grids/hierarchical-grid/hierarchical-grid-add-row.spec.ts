import { async, TestBed, fakeAsync } from '@angular/core/testing';
import { IgxHierarchicalGridModule, IgxHierarchicalGridComponent } from './public_api';
import { configureTestSuite } from '../../test-utils/configure-suite';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { IgxActionStripModule, IgxActionStripComponent } from '../../action-strip/public_api';
import { IgxHierarchicalGridEditActionsComponent } from '../../test-utils/hierarchical-grid-components.spec';

describe('IgxTreeGrid - Add Row UI #tGrid', () => {
    configureTestSuite();
    let fix;
    let hierarchicalGrid: IgxHierarchicalGridComponent;
    let actionStrip: IgxActionStripComponent;
    beforeAll(async(() => {
        TestBed.configureTestingModule({
            declarations: [
                IgxHierarchicalGridEditActionsComponent
            ],
            imports: [IgxHierarchicalGridModule, NoopAnimationsModule, IgxActionStripModule]
        })
            .compileComponents();
    }));

    describe(' Basic', () => {
        beforeEach(fakeAsync(/** height/width setter rAF */() => {
            fix = TestBed.createComponent(IgxHierarchicalGridEditActionsComponent);
            fix.detectChanges();
            hierarchicalGrid = fix.componentInstance.treeGrid;
            actionStrip = fix.componentInstance.actionStrip;
        }));

        it('Should collapse an expanded record when beginAddRow is called for it', () => {

        });

        it('Should allow the expansion of a newly added (commited) record', () => {

        });
    });
});
