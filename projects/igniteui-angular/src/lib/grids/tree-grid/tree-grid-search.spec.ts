import { async, TestBed } from '@angular/core/testing';
import { IgxTreeGridComponent } from './tree-grid.component';
import { IgxTreeGridModule } from './index';
import { TreeGridFunctions } from '../../test-utils/tree-grid-functions.spec';
import { IgxTreeGridSearchComponent, IgxTreeGridPrimaryForeignKeyComponent } from '../../test-utils/tree-grid-components.spec';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { configureTestSuite } from '../../test-utils/configure-suite';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

const HIGHLIGHT_CLASS = 'igx-highlight';
const ACTIVE_CLASS = 'igx-highlight__active';

describe('IgxTreeGrid - search API', () => {
    configureTestSuite();
    let fix;
    let fixNativeElement;
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
            fixNativeElement = fix.debugElement.nativeElement;
            treeGrid = fix.componentInstance.treeGrid;

            treeGrid.getColumnByName('JobTitle').autosize();
        });

        it('Search highlights should work for tree cells', () => {
            const searchCount = treeGrid.findNext('QA');

            const spans = getHighlightSpans(fixNativeElement);
            const activeSpan = getActiveSpan(fixNativeElement);

            // TODO            
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

function getHighlightSpans(parent: HTMLElement) {
    return parent.querySelectorAll('.' + HIGHLIGHT_CLASS);
}

function getActiveSpan(parent: HTMLElement) {
    return parent.querySelector('.' + ACTIVE_CLASS);
}
