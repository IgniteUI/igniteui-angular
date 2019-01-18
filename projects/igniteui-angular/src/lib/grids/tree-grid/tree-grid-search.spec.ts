import { async, TestBed } from '@angular/core/testing';
import { IgxTreeGridComponent } from './tree-grid.component';
import { IgxTreeGridModule } from './index';
import { TreeGridFunctions } from '../../test-utils/tree-grid-functions.spec';
import { IgxTreeGridSearchComponent, IgxTreeGridPrimaryForeignKeyComponent } from '../../test-utils/tree-grid-components.spec';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { configureTestSuite } from '../../test-utils/configure-suite';


describe('IgxTreeGrid - search API', () => {
    configureTestSuite();
    let fix;
    let treeGrid: IgxTreeGridComponent;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [
                IgxTreeGridSearchComponent,
                IgxTreeGridPrimaryForeignKeyComponent
            ],
            imports: [IgxTreeGridModule, NoopAnimationsModule]
        }).compileComponents();
    }));

    describe('Child Collection', () => {
        beforeEach(() => {
            fix = TestBed.createComponent(IgxTreeGridSearchComponent);
            fix.detectChanges();
            treeGrid = fix.componentInstance.treeGrid;
        });

    });

    describe('Primary/Foreign key', () => {
        beforeEach(() => {
            fix = TestBed.createComponent(IgxTreeGridPrimaryForeignKeyComponent);
            fix.detectChanges();
            treeGrid = fix.componentInstance.treeGrid;
        });

    });
});
