import { TestBed, fakeAsync, tick, waitForAsync } from '@angular/core/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { configureTestSuite } from '../../test-utils/configure-suite';
import { setupGridScrollDetection } from '../../test-utils/helper-utils.spec';
import { IgxTreeGridGroupingComponent } from '../../test-utils/tree-grid-components.spec';
import { IgxTreeGridModule } from './public_api';

describe('IgxTreeGrid Grouping', () => {
    configureTestSuite();

    beforeAll(waitForAsync(() => {
        TestBed.configureTestingModule({
            declarations: [IgxTreeGridGroupingComponent],
            imports: [
                BrowserAnimationsModule,
                IgxTreeGridModule
            ]
        }).compileComponents();
    }));

    let fix;
    let treeGrid;

    beforeEach(waitForAsync(/** height/width setter rAF */() => {
        fix = TestBed.createComponent(IgxTreeGridGroupingComponent);
        fix.detectChanges();
        treeGrid = fix.componentInstance.treeGrid;
        setupGridScrollDetection(fix, treeGrid);
    }));

    it('should load the grid grouped by two fields.', fakeAsync(() => {
        treeGrid.expandAll();
        tick();

        const groupArea = fix.debugElement.nativeElement.querySelector('igx-group-area');
        expect(groupArea).toBeDefined();
        const chipsArea = fix.debugElement.nativeElement.querySelector('igx-chips-area');
        expect(chipsArea).toBeDefined();
        const chips = fix.debugElement.nativeElement.querySelectorAll('igx-chip');
        expect(chips.length).toBe(2);
    }));
});
