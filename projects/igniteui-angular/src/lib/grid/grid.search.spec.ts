import {
    Component,
    ViewChild
} from '@angular/core';

import { async, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { IgxGridComponent } from './grid.component';
import { IgxGridModule } from './index';
import { SortingDirection } from '../data-operations/sorting-expression.interface';
import { IgxStringFilteringOperand } from '../../public_api';
import { IForOfState } from '../directives/for-of/for_of.directive';

describe('IgxGrid - search API', () => {
    const CELL_CSS_CLASS = '.igx-grid__td';

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [
                SimpleGridComponent,
                ScrollableGridComponent,
                PagingGridComponent,
                HiddenColumnsGridComponent,
                GridWithAvatarComponent,
                UnsearchableColumnsGridComponent,
                GroupableGridComponent
            ],
            imports: [IgxGridModule.forRoot()]
        }).compileComponents();
    }));

    it('Should clear all highlights', () => {
        const fix = TestBed.createComponent(SimpleGridComponent);
        fix.detectChanges();

        const component: SimpleGridComponent = fix.debugElement.componentInstance;
        const count = component.gridSearch.findNext('software');
        fix.detectChanges();
        let spans = fix.debugElement.nativeElement.querySelectorAll('.' + component.highlightClass);
        expect(spans.length).toBe(5);
        expect(count).toBe(5);

        component.gridSearch.clearSearch();
        fix.detectChanges();
        spans = fix.debugElement.nativeElement.querySelectorAll('.' + component.highlightClass);
        expect(spans.length).toBe(0);
    });

    it('findNext highlights the correct cells', () => {
        const fix = TestBed.createComponent(SimpleGridComponent);
        fix.detectChanges();

        const component: SimpleGridComponent = fix.debugElement.componentInstance;
        let count = component.gridSearch.findNext('developer');
        fix.detectChanges();
        let spans = fix.debugElement.nativeElement.querySelectorAll('.' + component.highlightClass);
        expect(spans.length).toBe(4);
        expect(count).toBe(4);

        let activeSpan = fix.debugElement.nativeElement.querySelector('.' + component.activeClass);
        expect(activeSpan).toBe(spans[0]);

        count = component.gridSearch.findNext('developer');
        fix.detectChanges();
        spans = fix.debugElement.nativeElement.querySelectorAll('.' + component.highlightClass);
        activeSpan = fix.debugElement.nativeElement.querySelector('.' + component.activeClass);
        expect(activeSpan).toBe(spans[1]);

        count = component.gridSearch.findNext('developer');
        fix.detectChanges();
        spans = fix.debugElement.nativeElement.querySelectorAll('.' + component.highlightClass);
        activeSpan = fix.debugElement.nativeElement.querySelector('.' + component.activeClass);
        expect(activeSpan).toBe(spans[2]);

        count = component.gridSearch.findNext('developer');
        fix.detectChanges();
        spans = fix.debugElement.nativeElement.querySelectorAll('.' + component.highlightClass);
        activeSpan = fix.debugElement.nativeElement.querySelector('.' + component.activeClass);
        expect(activeSpan).toBe(spans[3]);

        count = component.gridSearch.findNext('developer');
        fix.detectChanges();
        spans = fix.debugElement.nativeElement.querySelectorAll('.' + component.highlightClass);
        activeSpan = fix.debugElement.nativeElement.querySelector('.' + component.activeClass);
        expect(activeSpan).toBe(spans[0]);
    });

    it('findPrev highlights the correct cells', () => {
        const fix = TestBed.createComponent(SimpleGridComponent);
        fix.detectChanges();

        const component: SimpleGridComponent = fix.debugElement.componentInstance;
        let count = component.gridSearch.findNext('developer');
        fix.detectChanges();
        let spans = fix.debugElement.nativeElement.querySelectorAll('.' + component.highlightClass);
        expect(spans.length).toBe(4);
        expect(count).toBe(4);

        let activeSpan = fix.debugElement.nativeElement.querySelector('.' + component.activeClass);
        expect(activeSpan).toBe(spans[0]);

        count = component.gridSearch.findPrev('developer');
        fix.detectChanges();
        spans = fix.debugElement.nativeElement.querySelectorAll('.' + component.highlightClass);
        activeSpan = fix.debugElement.nativeElement.querySelector('.' + component.activeClass);
        expect(activeSpan).toBe(spans[3]);

        count = component.gridSearch.findPrev('developer');
        fix.detectChanges();
        spans = fix.debugElement.nativeElement.querySelectorAll('.' + component.highlightClass);
        activeSpan = fix.debugElement.nativeElement.querySelector('.' + component.activeClass);
        expect(activeSpan).toBe(spans[2]);

        count = component.gridSearch.findPrev('developer');
        fix.detectChanges();
        spans = fix.debugElement.nativeElement.querySelectorAll('.' + component.highlightClass);
        activeSpan = fix.debugElement.nativeElement.querySelector('.' + component.activeClass);
        expect(activeSpan).toBe(spans[1]);

        count = component.gridSearch.findPrev('developer');
        fix.detectChanges();
        spans = fix.debugElement.nativeElement.querySelectorAll('.' + component.highlightClass);
        activeSpan = fix.debugElement.nativeElement.querySelector('.' + component.activeClass);
        expect(activeSpan).toBe(spans[0]);
    });

    it('findPrev and findNext work properly for case sensitive seaches', () => {
        const fix = TestBed.createComponent(SimpleGridComponent);
        fix.detectChanges();

        const component: SimpleGridComponent = fix.debugElement.componentInstance;
        let count = component.gridSearch.findNext('Developer', true);
        fix.detectChanges();
        let spans = fix.debugElement.nativeElement.querySelectorAll('.' + component.highlightClass);
        expect(spans.length).toBe(3);
        expect(count).toBe(3);

        let activeSpan = fix.debugElement.nativeElement.querySelector('.' + component.activeClass);
        expect(activeSpan).toBe(spans[0]);

        count = component.gridSearch.findPrev('Developer', true);
        fix.detectChanges();
        spans = fix.debugElement.nativeElement.querySelectorAll('.' + component.highlightClass);
        activeSpan = fix.debugElement.nativeElement.querySelector('.' + component.activeClass);
        expect(activeSpan).toBe(spans[2]);

        count = component.gridSearch.findNext('Developer', true);
        fix.detectChanges();
        spans = fix.debugElement.nativeElement.querySelectorAll('.' + component.highlightClass);
        activeSpan = fix.debugElement.nativeElement.querySelector('.' + component.activeClass);
        expect(activeSpan).toBe(spans[0]);

        count = component.gridSearch.findNext('Developer', true);
        fix.detectChanges();
        spans = fix.debugElement.nativeElement.querySelectorAll('.' + component.highlightClass);
        activeSpan = fix.debugElement.nativeElement.querySelector('.' + component.activeClass);
        expect(activeSpan).toBe(spans[1]);

        count = component.gridSearch.findPrev('developer', true);
        fix.detectChanges();
        spans = fix.debugElement.nativeElement.querySelectorAll('.' + component.highlightClass);
        activeSpan = fix.debugElement.nativeElement.querySelector('.' + component.activeClass);

        expect(activeSpan).toBe(null);
        expect(count).toBe(0);
        expect(spans.length).toBe(0);
    });

    it('findNext scrolls to cells out of view', (done) => {
        const fix = TestBed.createComponent(ScrollableGridComponent);
        fix.detectChanges();

        const component: ScrollableGridComponent = fix.debugElement.componentInstance;
        fix.detectChanges();

        find(component.gridSearch, '30', component.gridSearch.findNext).then(() => {
            const verticalVirtDir = component.gridSearch.verticalScrollContainer;
            expect(isInView(29, verticalVirtDir.state)).toBeTruthy();

            find(component.gridSearch, '1887', component.gridSearch.findNext).then(() => {
                component.gridSearch.cdr.detectChanges();
                expect(isInView(3, component.gridSearch.rowList.first.virtDirRow.state)).toBeTruthy();
                done();
            });
        });
    });

    it('findPrev scrolls to cells out of view', (done) => {
        const fix = TestBed.createComponent(ScrollableGridComponent);
        fix.detectChanges();

        const component: ScrollableGridComponent = fix.debugElement.componentInstance;
        fix.detectChanges();

        find(component.gridSearch, '30', component.gridSearch.findPrev).then(() => {
            const verticalVirtDir = component.gridSearch.verticalScrollContainer;
            expect(isInView(29, verticalVirtDir.state)).toBeTruthy();

            find(component.gridSearch, '1887', component.gridSearch.findPrev).then(() => {
                const horizontalVirtDir = component.gridSearch.rowList.first.virtDirRow;
                expect(isInView(3, horizontalVirtDir.state)).toBeTruthy();
                done();
            });
        });
    });

    it('should keep the active highlight when active cell enters and exits edit mode', async(() => {
        const fix = TestBed.createComponent(ScrollableGridComponent);
        fix.detectChanges();

        const grid = fix.componentInstance.gridSearch;
        const rv = fix.debugElement.query(By.css(CELL_CSS_CLASS));
        const cell = grid.getCellByColumn(0, 'ID');

        let activeHighlight = rv.nativeElement.querySelector('.' + fix.componentInstance.activeClass);
        expect(activeHighlight !== null).toBeFalsy();

        cell.column.editable = true;

        grid.findNext('1');
        fix.detectChanges();

        fix.whenStable().then(() => {
            activeHighlight = rv.nativeElement.querySelector('.' + fix.componentInstance.activeClass);
            expect(activeHighlight !== null).toBeTruthy();

            rv.nativeElement.dispatchEvent(new Event('focus'));
        }).then(() => {
            rv.triggerEventHandler('dblclick', {});
            return fix.whenStable();
        }).then(() => {
            fix.detectChanges();
            expect(cell.inEditMode).toBe(true);
            rv.triggerEventHandler('keydown.escape', null);
        }).then(() => {
            activeHighlight = rv.nativeElement.querySelector('.' + fix.componentInstance.activeClass);
            expect(activeHighlight !== null).toBeTruthy();
        });
    }));

    it('should update highlights when a new value is entered', async(() => {
        const fix = TestBed.createComponent(ScrollableGridComponent);
        fix.detectChanges();

        const grid = fix.componentInstance.gridSearch;
        const rv = fix.debugElement.query(By.css(CELL_CSS_CLASS));
        const cell = grid.getCellByColumn(0, 'ID');
        let activeHighlight = rv.nativeElement.querySelector('.' + fix.componentInstance.activeClass);
        expect(activeHighlight !== null).toBeFalsy();

        cell.column.editable = true;

        grid.findNext('1');
        fix.detectChanges();

        fix.whenStable().then(() => {
            activeHighlight = rv.nativeElement.querySelector('.' + fix.componentInstance.activeClass);
            expect(activeHighlight !== null).toBeTruthy();

            rv.nativeElement.dispatchEvent(new Event('focus'));
        }).then(() => {
            rv.triggerEventHandler('dblclick', {});
            return fix.whenStable();
        }).then(() => {
            fix.detectChanges();
            expect(cell.inEditMode).toBe(true);

            const inputElem: HTMLInputElement = rv.nativeElement.querySelector('input') as HTMLInputElement;
            inputElem.value = '11';

            return fix.whenStable();
        }).then(() => {
            fix.detectChanges();
            const inputElem: HTMLInputElement = rv.nativeElement.querySelector('input') as HTMLInputElement;

            cell.update(inputElem.value);
            grid.cdr.detectChanges();
            return fix.whenStable();
        }).then(() => {
            fix.detectChanges();

            activeHighlight = rv.nativeElement.querySelector('.' + fix.componentInstance.activeClass);
            const highlights = rv.nativeElement.querySelectorAll('.' + fix.componentInstance.highlightClass);
            expect(highlights.length).toBe(2);
            expect(activeHighlight).toBe(highlights[0]);
        });
    }));

    it('should update highlights when the cell value is cleared', async(() => {
        const fix = TestBed.createComponent(ScrollableGridComponent);
        fix.detectChanges();

        const grid = fix.componentInstance.gridSearch;
        const rv = fix.debugElement.queryAll(By.css(CELL_CSS_CLASS))[1];
        const rv2 = fix.debugElement.queryAll(By.css(CELL_CSS_CLASS))[2];
        const cell = grid.getCellByColumn(0, 'Name');

        let activeHighlight = rv.nativeElement.querySelector('.' + fix.componentInstance.activeClass);
        expect(activeHighlight !== null).toBeFalsy();

        cell.column.editable = true;

        grid.findNext('c');
        fix.detectChanges();

        fix.whenStable().then(() => {
            activeHighlight = rv.nativeElement.querySelector('.' + fix.componentInstance.activeClass);
            expect(activeHighlight !== null).toBeTruthy();

            rv.nativeElement.dispatchEvent(new Event('focus'));
        }).then(() => {
            rv.triggerEventHandler('dblclick', {});
            return fix.whenStable();
        }).then(() => {
            fix.detectChanges();
            expect(cell.inEditMode).toBe(true);

            const inputElem: HTMLInputElement = rv.nativeElement.querySelector('input') as HTMLInputElement;
            inputElem.value = '';

            return fix.whenStable();
        }).then(() => {
            fix.detectChanges();
            const inputElem: HTMLInputElement = rv.nativeElement.querySelector('input') as HTMLInputElement;

            cell.update(inputElem.value);
            grid.cdr.detectChanges();
            return fix.whenStable();
        }).then(() => {
            fix.detectChanges();

            activeHighlight = rv.nativeElement.querySelector('.' + fix.componentInstance.activeClass);
            let highlights = rv.nativeElement.querySelectorAll('.' + fix.componentInstance.highlightClass);
            expect(highlights.length).toBe(0);
            expect(activeHighlight).toBe(null);

            activeHighlight = rv2.nativeElement.querySelector('.' + fix.componentInstance.activeClass);
            highlights = rv2.nativeElement.querySelectorAll('.' + fix.componentInstance.highlightClass);
            expect(highlights.length).toBe(1);
            expect(activeHighlight).toBe(highlights[0]);
        });
    }));

    xit('Should update the active highlight when sorting', async(() => {
        const fix = TestBed.createComponent(ScrollableGridComponent);
        fix.detectChanges();

        const grid = fix.componentInstance.gridSearch;
        const allCells = fix.debugElement.queryAll(By.css(CELL_CSS_CLASS));
        const rv = allCells[1];
        const cell = grid.getCellByColumn(0, 'Name');

        let activeHighlight = rv.nativeElement.querySelector('.' + fix.componentInstance.activeClass);
        expect(activeHighlight !== null).toBeFalsy();

        cell.column.sortable = true;

        grid.findNext('casey');
        grid.findNext('casey');

        fix.detectChanges();

        fix.whenStable().then(() => {
            grid.sort({fieldName: 'Name', dir: SortingDirection.Asc});
            return fix.whenStable();
        }).then(() => {
            fix.detectChanges();

            activeHighlight = rv.nativeElement.querySelector('.' + fix.componentInstance.activeClass);
            const highlights = rv.nativeElement.querySelectorAll('.' + fix.componentInstance.highlightClass);
            expect(highlights.length).toBe(1);
            expect(activeHighlight).toBe(highlights[0]);

            grid.sort({fieldName: 'Name', dir: SortingDirection.Desc});
            grid.findNext('casey');

            return fix.whenStable();
        }).then(() => {
            fix.detectChanges();

            const scrolledCell = grid.getCellByColumn(grid.data.length - 1, 'Name');

            activeHighlight = scrolledCell.nativeElement.querySelector('.' + fix.componentInstance.activeClass);
            const highlights = scrolledCell.nativeElement.querySelectorAll('.' + fix.componentInstance.highlightClass);

            expect(highlights.length).toBe(1);
            expect(activeHighlight).toBe(highlights[0]);
        });
    }));

    it('Should scroll properly when using paging', async(() => {
        const fix = TestBed.createComponent(PagingGridComponent);
        fix.detectChanges();

        const grid = fix.componentInstance.gridSearch;

        grid.findNext('casey');
        grid.findNext('casey');
        grid.findNext('casey');

        fix.detectChanges();

        fix.whenStable().then(() => {
            const highlight = grid.nativeElement.querySelector('.' + fix.componentInstance.activeClass);
            expect(highlight != null).toBeTruthy();
            expect(grid.page).toBe(1);

            grid.findPrev('casey');
        }).then(() => {
            fix.detectChanges();

            const highlight = grid.nativeElement.querySelector('.' + fix.componentInstance.activeClass);
            expect(highlight != null).toBeTruthy();
            expect(grid.page).toBe(0);
        });
    }));

    xit('Should update highlight when setting perPage option', async(() => {
        const fix = TestBed.createComponent(PagingGridComponent);
        fix.detectChanges();

        const grid = fix.componentInstance.gridSearch;

        grid.findNext('casey');
        grid.findNext('casey');
        fix.detectChanges();

        fix.whenStable().then(() => {
            const highlight = grid.nativeElement.querySelector('.' + fix.componentInstance.activeClass);
            expect(highlight != null).toBeTruthy();
            expect(grid.page).toBe(0);

            grid.perPage = 10;
        }).then(() => {
            fix.detectChanges();

            const highlight = grid.nativeElement.querySelector('.' + fix.componentInstance.activeClass);
            expect(highlight).toBeNull();
            expect(grid.page).toBe(0);

            grid.page = 1;
            grid.verticalScrollContainer.scrollTo(0);

            return fix.whenStable();
        }).then(() => {
            fix.detectChanges();
            requestAnimationFrame(() => {
                const highlight = grid.nativeElement.querySelector('.' + fix.componentInstance.activeClass);
                expect(highlight != null).toBeTruthy();
            });
        });
    }));

    it('Active highlight should be updated when filtering is applied', async(() => {
        const fix = TestBed.createComponent(ScrollableGridComponent);
        fix.detectChanges();

        const grid = fix.componentInstance.gridSearch;

        grid.findNext('casey');
        grid.findNext('casey');

        fix.detectChanges();

        fix.whenStable().then(() => {
            grid.filter('JobTitle', 'Vice', IgxStringFilteringOperand.instance().condition('contains'));
            fix.detectChanges();
            return fix.whenStable();
        }).then(() => {
            fix.detectChanges();
            requestAnimationFrame(() => {
                const activeHighlight = grid.nativeElement.querySelector('.' + fix.componentInstance.activeClass);
                const highlights = grid.nativeElement.querySelectorAll('.' + fix.componentInstance.highlightClass);
                expect(highlights.length).toBe(3);
                expect(activeHighlight).toBe(highlights[1]);
            });
        });
    }));

    it('Hidden columns shouldn\'t be part of the search', async(() => {
        const fix = TestBed.createComponent(HiddenColumnsGridComponent);
        fix.detectChanges();

        const grid = fix.componentInstance.gridSearch;

        grid.findNext('casey');

        fix.detectChanges();

        fix.whenStable().then(() => {
            const activeHighlight = grid.nativeElement.querySelector('.' + fix.componentInstance.activeClass);
            const highlights = grid.nativeElement.querySelectorAll('.' + fix.componentInstance.highlightClass);
            expect(highlights.length).toBe(0);
            expect(activeHighlight).toBe(null);
        });
    }));

    it('Search should honor the visible columns order', async(() => {
        const fix = TestBed.createComponent(HiddenColumnsGridComponent);
        fix.detectChanges();

        const grid = fix.componentInstance.gridSearch;
        const cell = grid.getCellByColumn(0, 'HireDate');

        grid.findNext('1');

        fix.detectChanges();

        fix.whenStable().then(() => {
            const activeHighlight = cell.nativeElement.querySelector('.' + fix.componentInstance.activeClass);
            const highlights = cell.nativeElement.querySelectorAll('.' + fix.componentInstance.highlightClass);
            expect(highlights.length).toBe(5);
            expect(activeHighlight).toBe(highlights[0]);
        });
    }));

    it('Active highlight should be updated when a column is pinned/unpinned', async(() => {
        const fix = TestBed.createComponent(SimpleGridComponent);
        fix.detectChanges();

        const grid = fix.componentInstance.gridSearch;
        let cellName = grid.getCellByColumn(0, 'Name');
        let activeHighlight: any;
        let highlights: any[];

        grid.findNext('casey');
        fix.whenStable().then(() => {
            fix.detectChanges();
            cellName = grid.getCellByColumn(0, 'Name');
            activeHighlight = cellName.nativeElement.querySelector('.' + fix.componentInstance.activeClass);
            highlights = cellName.nativeElement.querySelectorAll('.' + fix.componentInstance.highlightClass);
            expect(highlights.length).toBe(1);
            expect(activeHighlight).toBe(highlights[0]);
            grid.columns[1].pinned = true;

            return fix.whenStable();
        }).then(() => {
            fix.detectChanges();
            cellName = grid.getCellByColumn(0, 'Name');
            activeHighlight = cellName.nativeElement.querySelector('.' + fix.componentInstance.activeClass);
            highlights = cellName.nativeElement.querySelectorAll('.' + fix.componentInstance.highlightClass);
            expect(highlights.length).toBe(1);
            expect(activeHighlight).toBe(highlights[0]);

            grid.columns[1].pinned = false;

            return fix.whenStable();
        }).then(() => {
            fix.detectChanges();
            cellName = grid.getCellByColumn(0, 'Name');
            activeHighlight = cellName.nativeElement.querySelector('.' + fix.componentInstance.activeClass);
            highlights = cellName.nativeElement.querySelectorAll('.' + fix.componentInstance.highlightClass);
            expect(highlights.length).toBe(1);
            expect(activeHighlight).toBe(highlights[0]);
        });
    }));

    it('Active highlight should be updated when a column is hidden/shown', async(() => {
        const fix = TestBed.createComponent(SimpleGridComponent);
        fix.detectChanges();

        const grid = fix.componentInstance.gridSearch;
        let cellName = grid.getCellByColumn(0, 'Name');
        let activeHighlight: any;
        let highlights: any[];

        grid.findNext('casey');
        fix.whenStable().then(() => {
            fix.detectChanges();

            activeHighlight = cellName.nativeElement.querySelector('.' + fix.componentInstance.activeClass);
            highlights = cellName.nativeElement.querySelectorAll('.' + fix.componentInstance.highlightClass);
            expect(highlights.length).toBe(1);
            expect(activeHighlight).toBe(highlights[0]);
            grid.columns[0].hidden = true;

            return fix.whenStable();
        }).then(() => {
            fix.detectChanges();
            cellName = grid.getCellByColumn(0, 'Name');
            activeHighlight = cellName.nativeElement.querySelector('.' + fix.componentInstance.activeClass);
            highlights = cellName.nativeElement.querySelectorAll('.' + fix.componentInstance.highlightClass);
            expect(highlights.length).toBe(1);
            expect(activeHighlight).toBe(highlights[0]);

            grid.columns[0].hidden = false;

            return fix.whenStable();
        }).then(() => {
            fix.detectChanges();
            cellName = grid.getCellByColumn(0, 'Name');
            activeHighlight = cellName.nativeElement.querySelector('.' + fix.componentInstance.activeClass);
            highlights = cellName.nativeElement.querySelectorAll('.' + fix.componentInstance.highlightClass);
            expect(highlights.length).toBe(1);
            expect(activeHighlight).toBe(highlights[0]);
        });
    }));

    it('Clear filter properly updates the highlights', async(() => {
        const fix = TestBed.createComponent(SimpleGridComponent);
        fix.detectChanges();

        const grid = fix.componentInstance.gridSearch;
        let gilbertoDirectorCell = grid.getCellByColumn(1, 'JobTitle');
        let tanyaDirectorCell = grid.getCellByColumn(2, 'JobTitle');
        let activeHighlight: any;
        let highlights: any[];

        grid.findNext('director');

        fix.whenStable().then(() => {
            fix.detectChanges();
            gilbertoDirectorCell = grid.getCellByColumn(1, 'JobTitle');
            activeHighlight = gilbertoDirectorCell.nativeElement.querySelector('.' + fix.componentInstance.activeClass);
            highlights = gilbertoDirectorCell.nativeElement.querySelectorAll('.' + fix.componentInstance.highlightClass);
            expect(highlights.length).toBe(1);
            expect(activeHighlight).toBe(highlights[0]);

            grid.filter('Name', 'Tanya', IgxStringFilteringOperand.instance().condition('contains'));
            fix.detectChanges();

            return fix.whenStable();
        }).then(() => {
            fix.detectChanges();
            tanyaDirectorCell = grid.getCellByColumn(0, 'JobTitle');
            activeHighlight = tanyaDirectorCell.nativeElement.querySelector('.' + fix.componentInstance.activeClass);
            highlights = tanyaDirectorCell.nativeElement.querySelectorAll('.' + fix.componentInstance.highlightClass);
            expect(highlights.length).toBe(1);
            expect(activeHighlight).toBe(highlights[0]);

            grid.clearFilter();

            return fix.whenStable();
        }).then(() => {
            fix.detectChanges();
            tanyaDirectorCell = grid.getCellByColumn(2, 'JobTitle');
            activeHighlight = tanyaDirectorCell.nativeElement.querySelector('.' + fix.componentInstance.activeClass);
            highlights = tanyaDirectorCell.nativeElement.querySelectorAll('.' + fix.componentInstance.highlightClass);
            expect(highlights.length).toBe(1);
            expect(activeHighlight).toBe(highlights[0]);

            grid.findNext('Director');
            return fix.whenStable();
        }).then(() => {
            fix.detectChanges();
            gilbertoDirectorCell = grid.getCellByColumn(1, 'JobTitle');
            activeHighlight = gilbertoDirectorCell.nativeElement.querySelector('.' + fix.componentInstance.activeClass);
            highlights = gilbertoDirectorCell.nativeElement.querySelectorAll('.' + fix.componentInstance.highlightClass);
            expect(highlights.length).toBe(1);
            expect(activeHighlight).toBe(highlights[0]);
        });
    }));

    xit('Highlights should be properly updated when a row is deleted', async(() => {
        const fix = TestBed.createComponent(SimpleGridComponent);
        fix.detectChanges();

        const grid = fix.componentInstance.gridSearch;
        let jackSoftwareCell = grid.getCellByColumn(3, 'JobTitle');
        let celiaSoftwareCell = grid.getCellByColumn(4, 'JobTitle');
        let leslieSoftwareCell = grid.getCellByColumn(8, 'JobTitle');
        let activeHighlight: any;
        let highlights: any[];

        grid.findNext('software');

        fix.whenStable().then(() => {
            fix.detectChanges();
            jackSoftwareCell = grid.getCellByColumn(3, 'JobTitle');
            activeHighlight = jackSoftwareCell.nativeElement.querySelector('.' + fix.componentInstance.activeClass);
            highlights = jackSoftwareCell.nativeElement.querySelectorAll('.' + fix.componentInstance.highlightClass);
            expect(highlights.length).toBe(1);
            expect(activeHighlight).toBe(highlights[0]);

            grid.deleteRow(3);
            grid.cdr.detectChanges();

            return fix.whenStable();
        }).then(() => {
            fix.detectChanges();
            celiaSoftwareCell = grid.getCellByColumn(3, 'JobTitle');
            activeHighlight = celiaSoftwareCell.nativeElement.querySelector('.' + fix.componentInstance.activeClass);
            highlights = celiaSoftwareCell.nativeElement.querySelectorAll('.' + fix.componentInstance.highlightClass);
            expect(highlights.length).toBe(1);
            expect(activeHighlight).toBe(highlights[0]);

            grid.findPrev('software');

            return fix.whenStable();
        }).then(() => {
            fix.detectChanges();
            leslieSoftwareCell = grid.getCellByColumn(7, 'JobTitle');
            activeHighlight = leslieSoftwareCell.nativeElement.querySelector('.' + fix.componentInstance.activeClass);
            highlights = leslieSoftwareCell.nativeElement.querySelectorAll('.' + fix.componentInstance.highlightClass);
            expect(highlights.length).toBe(1);
            expect(activeHighlight).toBe(highlights[0]);
        });
    }));

    it('Highlights should be properly updated when a row is added', async(() => {
        const fix = TestBed.createComponent(SimpleGridComponent);
        fix.detectChanges();

        const grid = fix.componentInstance.gridSearch;
        const tanyaDirectorCell = grid.getCellByColumn(2, 'JobTitle');
        let activeHighlight: any;
        let highlights: any[];

        grid.findNext('director');
        grid.findNext('director');

        fix.whenStable().then(() => {
            fix.detectChanges();

            activeHighlight = tanyaDirectorCell.nativeElement.querySelector('.' + fix.componentInstance.activeClass);
            highlights = tanyaDirectorCell.nativeElement.querySelectorAll('.' + fix.componentInstance.highlightClass);
            expect(highlights.length).toBe(1);
            expect(activeHighlight).toBe(highlights[0]);

            grid.addRow({
                ID: 11,
                Name: 'John Doe',
                JobTitle: 'Director',
                HireDate: new Date()
            });

            return fix.whenStable();
        }).then(() => {
            fix.detectChanges();

            activeHighlight = tanyaDirectorCell.nativeElement.querySelector('.' + fix.componentInstance.activeClass);
            highlights = tanyaDirectorCell.nativeElement.querySelectorAll('.' + fix.componentInstance.highlightClass);
            expect(highlights.length).toBe(1);
            expect(activeHighlight).toBe(highlights[0]);

            grid.findNext('director');

            return fix.whenStable();
        }).then(() => {
            fix.detectChanges();
            const johnDirectorCell = grid.getCellByColumn(10, 'JobTitle');

            activeHighlight = johnDirectorCell.nativeElement.querySelector('.' + fix.componentInstance.activeClass);
            highlights = johnDirectorCell.nativeElement.querySelectorAll('.' + fix.componentInstance.highlightClass);
            expect(highlights.length).toBe(1);
            expect(activeHighlight).toBe(highlights[0]);
        });
    }));

    it('Cells with no text should be excluded from the search', () => {
        const fix = TestBed.createComponent(GridWithAvatarComponent);
        fix.detectChanges();

        const grid = fix.componentInstance.gridSearch;
        const matches = grid.findNext('https');
        expect(matches).toBe(0);
    });

    it('Unsearchable column should not interfere with active highlight for other columns on its right', () => {
        const fix = TestBed.createComponent(UnsearchableColumnsGridComponent);
        fix.detectChanges();

        const component: UnsearchableColumnsGridComponent = fix.componentInstance;
        const count = component.gridSearch.findNext('Software');
        fix.detectChanges();
        let spans = fix.debugElement.nativeElement.querySelectorAll('.' + component.highlightClass);
        expect(spans.length).toBe(5);
        expect(count).toBe(5);

        let activeSpan = fix.debugElement.nativeElement.querySelector('.' + component.activeClass);
        expect(activeSpan).toBe(spans[0]);

        component.gridSearch.findNext('Software');
        fix.detectChanges();

        spans = fix.debugElement.nativeElement.querySelectorAll('.' + component.highlightClass);
        activeSpan = fix.debugElement.nativeElement.querySelector('.' + component.activeClass);
        expect(activeSpan).toBe(spans[1]);
    });

    it('Should be able to navigate through highlights with grouping enabled', () => {
        const fix = TestBed.createComponent(GroupableGridComponent);
        fix.detectChanges();

        const grid = fix.componentInstance.gridSearch;
        grid.groupBy({
            fieldName: 'JobTitle',
            dir: SortingDirection.Asc
        });

        grid.findNext('Software');
        fix.detectChanges();

        let spans = fix.debugElement.nativeElement.querySelectorAll('.' + fix.componentInstance.highlightClass);
        let highlight = fix.debugElement.nativeElement.querySelector('.' + fix.componentInstance.activeClass);
        expect(spans.length).toBe(5);
        expect(highlight).toBe(spans[0]);

        grid.findNext('Software');
        grid.findNext('Software');
        fix.detectChanges();

        spans = fix.debugElement.nativeElement.querySelectorAll('.' + fix.componentInstance.highlightClass);
        highlight = fix.debugElement.nativeElement.querySelector('.' + fix.componentInstance.activeClass);
        expect(spans.length).toBe(5);
        expect(highlight).toBe(spans[2]);

        grid.findPrev('Software');
        fix.detectChanges();

        spans = fix.debugElement.nativeElement.querySelectorAll('.' + fix.componentInstance.highlightClass);
        highlight = fix.debugElement.nativeElement.querySelector('.' + fix.componentInstance.activeClass);
        expect(spans.length).toBe(5);
        expect(highlight).toBe(spans[1]);

        grid.findPrev('Software');
        grid.findPrev('Software');
        fix.detectChanges();

        spans = fix.debugElement.nativeElement.querySelectorAll('.' + fix.componentInstance.highlightClass);
        highlight = fix.debugElement.nativeElement.querySelector('.' + fix.componentInstance.activeClass);
        expect(spans.length).toBe(5);
        expect(highlight).toBe(spans[4]);

    });

    it('Should be able to react to changes in grouping', () => {
        const fix = TestBed.createComponent(GroupableGridComponent);
        fix.detectChanges();

        const grid = fix.componentInstance.gridSearch;
        grid.groupBy({
            fieldName: 'JobTitle',
            dir: SortingDirection.Asc
        });

        let cell = grid.getCellByColumn(1, 'JobTitle');
        grid.findNext('software');

        let highlight = cell.nativeElement.querySelector('.' + fix.componentInstance.activeClass);
        expect(highlight !== null).toBeTruthy();

        grid.clearGrouping();
        fix.detectChanges();

        cell = grid.getCellByColumn(6, 'JobTitle');
        highlight = cell.nativeElement.querySelector('.' + fix.componentInstance.activeClass);
        expect(highlight !== null).toBeTruthy();

        grid.groupBy([{
            fieldName: 'JobTitle',
            dir: SortingDirection.Asc
        }, {
            fieldName: 'Company',
            dir: SortingDirection.Desc
        }]);

        fix.detectChanges();

        cell = grid.getCellByColumn(4, 'JobTitle');
        highlight = cell.nativeElement.querySelector('.' + fix.componentInstance.activeClass);
        expect(highlight !== null).toBeTruthy();

        grid.groupBy({
            fieldName: 'JobTitle',
            dir: SortingDirection.Desc
        });

        grid.findNext('software');
        fix.detectChanges();
        cell = grid.getCellByColumn(5, 'JobTitle');
        highlight = cell.nativeElement.querySelector('.' + fix.componentInstance.activeClass);
        expect(highlight !== null).toBeTruthy();
    });

    it('Should be able to navigate through highlights with grouping and paging enabled', () => {
        const fix = TestBed.createComponent(GroupableGridComponent);
        fix.detectChanges();

        const component = fix.componentInstance;
        const grid = component.gridSearch;
        grid.groupBy({
            fieldName: 'JobTitle',
            dir: SortingDirection.Asc
        });
        component.paging = true;

        fix.detectChanges();

        grid.findNext('Software');
        fix.detectChanges();

        let spans = fix.debugElement.nativeElement.querySelectorAll('.' + fix.componentInstance.highlightClass);
        let highlight = fix.debugElement.nativeElement.querySelector('.' + fix.componentInstance.activeClass);

        expect(spans.length).toBe(2);
        expect(highlight).toBe(spans[0]);
        expect(grid.page).toBe(0);

        grid.findPrev('Software');
        fix.detectChanges();

        spans = fix.debugElement.nativeElement.querySelectorAll('.' + fix.componentInstance.highlightClass);
        highlight = fix.debugElement.nativeElement.querySelector('.' + fix.componentInstance.activeClass);

        expect(spans.length).toBe(3);
        expect(highlight).toBe(spans[2]);
        expect(grid.page).toBe(1);

        grid.findPrev('Software');
        grid.findPrev('Software');
        fix.detectChanges();

        spans = fix.debugElement.nativeElement.querySelectorAll('.' + fix.componentInstance.highlightClass);
        highlight = fix.debugElement.nativeElement.querySelector('.' + fix.componentInstance.activeClass);

        expect(spans.length).toBe(3);
        expect(highlight).toBe(spans[0]);
        expect(grid.page).toBe(1);
    });

    it('Should be able to properly handle perPage changes with gouping and paging', () => {
        const fix = TestBed.createComponent(GroupableGridComponent);
        fix.detectChanges();

        const component = fix.componentInstance;
        const grid = component.gridSearch;
        grid.groupBy({
            fieldName: 'JobTitle',
            dir: SortingDirection.Asc
        });
        component.paging = true;
        component.perPage = 10;

        grid.findNext('Software');
        grid.findNext('Software');
        grid.findNext('Software');
        fix.detectChanges();

        let spans = fix.debugElement.nativeElement.querySelectorAll('.' + fix.componentInstance.highlightClass);
        let highlight = fix.debugElement.nativeElement.querySelector('.' + fix.componentInstance.activeClass);

        expect(spans.length).toBe(5);
        expect(highlight).toBe(spans[2]);
        expect(grid.page).toBe(0);

        component.perPage = 5;
        fix.detectChanges();

        spans = fix.debugElement.nativeElement.querySelectorAll('.' + fix.componentInstance.highlightClass);
        highlight = fix.debugElement.nativeElement.querySelector('.' + fix.componentInstance.activeClass);

        expect(spans.length).toBe(2);
        expect(highlight).toBeNull();
        expect(grid.page).toBe(0);

        grid.page = 1;
        fix.detectChanges();

        spans = fix.debugElement.nativeElement.querySelectorAll('.' + fix.componentInstance.highlightClass);
        highlight = fix.debugElement.nativeElement.querySelector('.' + fix.componentInstance.activeClass);

        expect(spans.length).toBe(3);
        expect(highlight).toBe(spans[0]);
        expect(grid.page).toBe(1);
    });

    it('Should be able to properly handle navigating through collapsed rows', () => {
        const fix = TestBed.createComponent(GroupableGridComponent);
        fix.detectChanges();

        const component = fix.componentInstance;
        const grid = component.gridSearch;
        grid.groupBy({
            fieldName: 'JobTitle',
            dir: SortingDirection.Asc
        });

        grid.findNext('software');
        grid.findNext('software');
        grid.findNext('software');

        grid.toggleGroup(grid.groupsRecords[0]);

        let spans = fix.debugElement.nativeElement.querySelectorAll('.' + fix.componentInstance.highlightClass);
        let highlight = fix.debugElement.nativeElement.querySelector('.' + fix.componentInstance.activeClass);

        expect(spans.length).toBe(3);
        expect(highlight).toBe(spans[0]);

        grid.findNext('software');
        grid.findNext('software');
        grid.findNext('software');

        spans = fix.debugElement.nativeElement.querySelectorAll('.' + fix.componentInstance.highlightClass);
        highlight = fix.debugElement.nativeElement.querySelector('.' + fix.componentInstance.activeClass);

        expect(spans.length).toBe(5);
        expect(highlight).toBe(spans[0]);
        expect(grid.isExpandedGroup(grid.groupsRecords[0])).toBeTruthy();
    });

    it('Should be able to properly handle navigating through collapsed rows with paging', () => {
        const fix = TestBed.createComponent(GroupableGridComponent);
        fix.detectChanges();

        const component = fix.componentInstance;
        const grid = component.gridSearch;
        grid.groupBy({
            fieldName: 'JobTitle',
            dir: SortingDirection.Asc
        });

        component.perPage = 5;
        component.paging = true;
        fix.detectChanges();

        grid.findNext('software');
        grid.findNext('software');

        grid.toggleGroup(grid.groupsRecords[0]);
        grid.findNext('software');

        fix.detectChanges();
        let spans = fix.debugElement.nativeElement.querySelectorAll('.' + fix.componentInstance.highlightClass);
        let highlight = fix.debugElement.nativeElement.querySelector('.' + fix.componentInstance.activeClass);

        expect(spans.length).toBe(3);
        expect(highlight).toBe(spans[0]);
        expect(grid.page).toBe(1);

        grid.findNext('software');
        grid.findNext('software');
        grid.findNext('software');
        fix.detectChanges();

        spans = fix.debugElement.nativeElement.querySelectorAll('.' + fix.componentInstance.highlightClass);
        highlight = fix.debugElement.nativeElement.querySelector('.' + fix.componentInstance.activeClass);

        expect(spans.length).toBe(2);
        expect(highlight).toBe(spans[0]);
        expect(grid.isExpandedGroup(grid.groupsRecords[0])).toBeTruthy();
        expect(grid.page).toBe(0);

    });

    it('Active highlight should be preserved when all rows are filtered out', async(() => {
        const fix = TestBed.createComponent(ScrollableGridComponent);
        fix.detectChanges();

        const grid = fix.componentInstance.gridSearch;

        grid.findNext('casey');
        grid.findNext('casey');

        fix.detectChanges();

        fix.whenStable().then(() => {
            grid.filter('Name', 'zxxz', IgxStringFilteringOperand.instance().condition('contains'));
            fix.detectChanges();
            return fix.whenStable();
        }).then(() => {
            fix.detectChanges();
            const activeHighlight = grid.nativeElement.querySelector('.' + fix.componentInstance.activeClass);
            const highlights = grid.nativeElement.querySelectorAll('.' + fix.componentInstance.highlightClass);
            expect(highlights.length).toBe(0);
            expect(activeHighlight).toBeNull();

            return fix.whenStable();
        }).then(() => {
            grid.clearFilter('Name');
            fix.detectChanges();
            requestAnimationFrame(() => {
                const activeHighlight = grid.nativeElement.querySelector('.' + fix.componentInstance.activeClass);
                const highlights = grid.nativeElement.querySelectorAll('.' + fix.componentInstance.highlightClass);
                expect(highlights.length).toBe(1);
                expect(activeHighlight).toBe(highlights[0]);
            });
        });
    }));

    it('Active highlight should be preserved when a column is moved', async(() => {
        const fix = TestBed.createComponent(ScrollableGridComponent);
        fix.detectChanges();

        const grid = fix.componentInstance.gridSearch;
        grid.findNext('casey');

        fix.detectChanges();

        fix.whenStable().then(() => {
            const columns = grid.columnList.toArray();
            grid.moveColumn(columns[0], columns[1]);
            fix.detectChanges();
            return fix.whenStable();
        }).then(() => {
            fix.detectChanges();

            const activeHighlight = grid.nativeElement.querySelector('.' + fix.componentInstance.activeClass);
            const highlights = grid.nativeElement.querySelectorAll('.' + fix.componentInstance.highlightClass);
            expect(highlights.length).toBe(1);
            expect(activeHighlight).toBe(highlights[0]);
        });
    }));

    it('Should exit edit mode and search a cell', () => {
        const fix = TestBed.createComponent(SimpleGridComponent);
        fix.detectChanges();

        const grid = fix.componentInstance.gridSearch;
        const cell = grid.getCellByColumn(0, 'Name');

        cell.column.editable = true;
        cell.inEditMode = true;
        fix.detectChanges();

        grid.findNext('casey');
        fix.detectChanges();

        const highlights = cell.nativeElement.querySelectorAll('.' + fix.componentInstance.highlightClass);
        const activeHighlight = cell.nativeElement.querySelector('.' + fix.componentInstance.activeClass);

        expect(cell.inEditMode).toBeFalsy();
        expect(highlights.length).toBe(1);
        expect(activeHighlight).toBe(highlights[0]);

    });

    function find(grid: IgxGridComponent, text: string, findFunc: Function) {
        const promise = new Promise((resolve) => {
            let horizontalSubscription, verticalSubsription = null;

            verticalSubsription = grid.verticalScrollContainer.onChunkLoad.subscribe((state) => {
                horizontalSubscription.unsubscribe();
                verticalSubsription.unsubscribe();
                resolve(state);
            });

            horizontalSubscription = grid.rowList.first.virtDirRow.onChunkLoad.subscribe((state) => {
                horizontalSubscription.unsubscribe();
                verticalSubsription.unsubscribe();
                resolve(state);
            });

            findFunc.call(grid, text);
        });

        return promise;
    }

    function isInView(index, state: IForOfState): boolean {
        return index > state.startIndex && index <= state.startIndex + state.chunkSize;
    }

});

@Component({
    template: `
        <igx-grid #gridSearch [data]="data">
            <igx-column field="ID"></igx-column>
            <igx-column field="Name"></igx-column>
            <igx-column field="JobTitle"></igx-column>
            <igx-column field="HireDate"></igx-column>
        </igx-grid>
    `
})
export class SimpleGridComponent {
    public data = [
        { ID: 1, Name: 'Casey Houston', JobTitle: 'Vice President', HireDate: '2017-06-19T11:43:07.714Z' },
        { ID: 2, Name: 'Gilberto Todd', JobTitle: 'Director', HireDate: '2015-12-18T11:23:17.714Z' },
        { ID: 3, Name: 'Tanya Bennett', JobTitle: 'Director', HireDate: '2005-11-18T11:23:17.714Z' },
        { ID: 4, Name: 'Jack Simon', JobTitle: 'Software Developer', HireDate: '2008-12-18T11:23:17.714Z' },
        { ID: 5, Name: 'Celia Martinez', JobTitle: 'Senior Software DEVELOPER', HireDate: '2007-12-19T11:23:17.714Z' },
        { ID: 6, Name: 'Erma Walsh', JobTitle: 'CEO', HireDate: '2016-12-18T11:23:17.714Z' },
        { ID: 7, Name: 'Debra Morton', JobTitle: 'Associate Software Developer', HireDate: '2005-11-19T11:23:17.714Z' },
        { ID: 8, Name: 'Erika Wells', JobTitle: 'Software Development Team Lead', HireDate: '2005-10-14T11:23:17.714Z' },
        { ID: 9, Name: 'Leslie Hansen', JobTitle: 'Associate Software Developer', HireDate: '2013-10-10T11:23:17.714Z' },
        { ID: 10, Name: 'Eduardo Ramirez', JobTitle: 'Manager', HireDate: '2011-11-28T11:23:17.714Z' }
    ];

    @ViewChild('gridSearch', { read: IgxGridComponent })
    public gridSearch: IgxGridComponent;

    public highlightClass = 'igx-highlight';
    public activeClass = 'igx-highlight__active';
}

@Component({
    template: `
        <igx-grid #gridSearch [data]="data" height="500px" width="500px" columnWidth="200">
            <igx-column field="ID" sortable="true"></igx-column>
            <igx-column field="Name" sortable="true"></igx-column>
            <igx-column field="JobTitle" sortable="true"></igx-column>
            <igx-column field="HireDate" sortable="true"></igx-column>
        </igx-grid>
    `
})
export class ScrollableGridComponent {
    public data = [
        { ID: 1, Name: 'Casey Houston', JobTitle: 'Vice President', HireDate: '2017-06-19T11:43:07.714Z' },
        { ID: 2, Name: 'Gilberto Todd', JobTitle: 'Director', HireDate: '2015-12-18T11:23:17.714Z' },
        { ID: 3, Name: 'Tanya Bennett', JobTitle: 'Director', HireDate: '2005-11-18T11:23:17.714Z' },
        { ID: 4, Name: 'Jack Simon', JobTitle: 'Software Developer', HireDate: '2008-12-18T11:23:17.714Z' },
        { ID: 5, Name: 'Celia Martinez', JobTitle: 'Senior Software DEVELOPER', HireDate: '2007-12-19T11:23:17.714Z' },
        { ID: 6, Name: 'Erma Walsh', JobTitle: 'CEO', HireDate: '2016-12-18T11:23:17.714Z' },
        { ID: 7, Name: 'Debra Morton', JobTitle: 'Associate Software Developer', HireDate: '2005-11-19T11:23:17.714Z' },
        { ID: 8, Name: 'Erika Wells', JobTitle: 'Software Development Team Lead', HireDate: '2005-10-14T11:23:17.714Z' },
        { ID: 9, Name: 'Leslie Hansen', JobTitle: 'Associate Software Developer', HireDate: '2013-10-10T11:23:17.714Z' },
        { ID: 10, Name: 'Eduardo Ramirez', JobTitle: 'Manager', HireDate: '2011-11-28T11:23:17.714Z' },
        { ID: 11, Name: 'Casey Houston', JobTitle: 'Vice President', HireDate: '2017-06-19T11:43:07.714Z' },
        { ID: 12, Name: 'Gilberto Todd', JobTitle: 'Director', HireDate: '2015-12-18T11:23:17.714Z' },
        { ID: 13, Name: 'Tanya Bennett', JobTitle: 'Director', HireDate: '2005-11-18T11:23:17.714Z' },
        { ID: 14, Name: 'Jack Simon', JobTitle: 'Software Developer', HireDate: '2008-12-18T11:23:17.714Z' },
        { ID: 15, Name: 'Celia Martinez', JobTitle: 'Senior Software DEVELOPER', HireDate: '2007-12-19T11:23:17.714Z' },
        { ID: 16, Name: 'Erma Walsh', JobTitle: 'CEO', HireDate: '2016-12-18T11:23:17.714Z' },
        { ID: 17, Name: 'Debra Morton', JobTitle: 'Associate Software Developer', HireDate: '2005-11-19T11:23:17.714Z' },
        { ID: 18, Name: 'Erika Wells', JobTitle: 'Software Development Team Lead', HireDate: '2005-10-14T11:23:17.714Z' },
        { ID: 19, Name: 'Leslie Hansen', JobTitle: 'Associate Software Developer', HireDate: '2013-10-10T11:23:17.714Z' },
        { ID: 20, Name: 'Eduardo Ramirez', JobTitle: 'Manager', HireDate: '2011-11-28T11:23:17.714Z' },
        { ID: 21, Name: 'Casey Houston', JobTitle: 'Vice President', HireDate: '2017-06-19T11:43:07.714Z' },
        { ID: 22, Name: 'Gilberto Todd', JobTitle: 'Director', HireDate: '2015-12-18T11:23:17.714Z' },
        { ID: 23, Name: 'Tanya Bennett', JobTitle: 'Director', HireDate: '2005-11-18T11:23:17.714Z' },
        { ID: 24, Name: 'Jack Simon', JobTitle: 'Software Developer', HireDate: '2008-12-18T11:23:17.714Z' },
        { ID: 25, Name: 'Celia Martinez', JobTitle: 'Senior Software DEVELOPER', HireDate: '2007-12-19T11:23:17.714Z' },
        { ID: 26, Name: 'Erma Walsh', JobTitle: 'CEO', HireDate: '2016-12-18T11:23:17.714Z' },
        { ID: 27, Name: 'Debra Morton', JobTitle: 'Associate Software Developer', HireDate: '2005-11-19T11:23:17.714Z' },
        { ID: 28, Name: 'Erika Wells', JobTitle: 'Software Development Team Lead', HireDate: '2005-10-14T11:23:17.714Z' },
        { ID: 29, Name: 'Leslie Hansen', JobTitle: 'Associate Software Developer', HireDate: '2013-10-10T11:23:17.714Z' },
        { ID: 30, Name: 'Eduardo Ramirez', JobTitle: 'Manager', HireDate: '1887-11-28T11:23:17.714Z' }
    ];

    @ViewChild('gridSearch', { read: IgxGridComponent })
    public gridSearch: IgxGridComponent;

    public highlightClass = 'igx-highlight';
    public activeClass = 'igx-highlight__active';
}

@Component({
    template: `
        <igx-grid #gridSearch [data]="data" height="500px" width="500px" columnWidth="200" paging="true">
            <igx-column field="ID" sortable="true"></igx-column>
            <igx-column field="Name" sortable="true"></igx-column>
            <igx-column field="JobTitle" sortable="true"></igx-column>
            <igx-column field="HireDate" sortable="true"></igx-column>
        </igx-grid>
    `
})
export class PagingGridComponent {
    public data = [
        { ID: 1, Name: 'Casey Houston', JobTitle: 'Vice President', HireDate: '2017-06-19T11:43:07.714Z' },
        { ID: 2, Name: 'Gilberto Todd', JobTitle: 'Director', HireDate: '2015-12-18T11:23:17.714Z' },
        { ID: 3, Name: 'Tanya Bennett', JobTitle: 'Director', HireDate: '2005-11-18T11:23:17.714Z' },
        { ID: 4, Name: 'Jack Simon', JobTitle: 'Software Developer', HireDate: '2008-12-18T11:23:17.714Z' },
        { ID: 5, Name: 'Celia Martinez', JobTitle: 'Senior Software DEVELOPER', HireDate: '2007-12-19T11:23:17.714Z' },
        { ID: 6, Name: 'Erma Walsh', JobTitle: 'CEO', HireDate: '2016-12-18T11:23:17.714Z' },
        { ID: 7, Name: 'Debra Morton', JobTitle: 'Associate Software Developer', HireDate: '2005-11-19T11:23:17.714Z' },
        { ID: 8, Name: 'Erika Wells', JobTitle: 'Software Development Team Lead', HireDate: '2005-10-14T11:23:17.714Z' },
        { ID: 9, Name: 'Leslie Hansen', JobTitle: 'Associate Software Developer', HireDate: '2013-10-10T11:23:17.714Z' },
        { ID: 10, Name: 'Eduardo Ramirez', JobTitle: 'Manager', HireDate: '2011-11-28T11:23:17.714Z' },
        { ID: 11, Name: 'Casey Houston', JobTitle: 'Vice President', HireDate: '2017-06-19T11:43:07.714Z' },
        { ID: 12, Name: 'Gilberto Todd', JobTitle: 'Director', HireDate: '2015-12-18T11:23:17.714Z' },
        { ID: 13, Name: 'Tanya Bennett', JobTitle: 'Director', HireDate: '2005-11-18T11:23:17.714Z' },
        { ID: 14, Name: 'Jack Simon', JobTitle: 'Software Developer', HireDate: '2008-12-18T11:23:17.714Z' },
        { ID: 15, Name: 'Celia Martinez', JobTitle: 'Senior Software DEVELOPER', HireDate: '2007-12-19T11:23:17.714Z' },
        { ID: 16, Name: 'Erma Walsh', JobTitle: 'CEO', HireDate: '2016-12-18T11:23:17.714Z' },
        { ID: 17, Name: 'Debra Morton', JobTitle: 'Associate Software Developer', HireDate: '2005-11-19T11:23:17.714Z' },
        { ID: 18, Name: 'Erika Wells', JobTitle: 'Software Development Team Lead', HireDate: '2005-10-14T11:23:17.714Z' },
        { ID: 19, Name: 'Leslie Hansen', JobTitle: 'Associate Software Developer', HireDate: '2013-10-10T11:23:17.714Z' },
        { ID: 20, Name: 'Eduardo Ramirez', JobTitle: 'Manager', HireDate: '2011-11-28T11:23:17.714Z' },
        { ID: 21, Name: 'Casey Houston', JobTitle: 'Vice President', HireDate: '2017-06-19T11:43:07.714Z' },
        { ID: 22, Name: 'Gilberto Todd', JobTitle: 'Director', HireDate: '2015-12-18T11:23:17.714Z' },
        { ID: 23, Name: 'Tanya Bennett', JobTitle: 'Director', HireDate: '2005-11-18T11:23:17.714Z' },
        { ID: 24, Name: 'Jack Simon', JobTitle: 'Software Developer', HireDate: '2008-12-18T11:23:17.714Z' },
        { ID: 25, Name: 'Celia Martinez', JobTitle: 'Senior Software DEVELOPER', HireDate: '2007-12-19T11:23:17.714Z' },
        { ID: 26, Name: 'Erma Walsh', JobTitle: 'CEO', HireDate: '2016-12-18T11:23:17.714Z' },
        { ID: 27, Name: 'Debra Morton', JobTitle: 'Associate Software Developer', HireDate: '2005-11-19T11:23:17.714Z' },
        { ID: 28, Name: 'Erika Wells', JobTitle: 'Software Development Team Lead', HireDate: '2005-10-14T11:23:17.714Z' },
        { ID: 29, Name: 'Leslie Hansen', JobTitle: 'Associate Software Developer', HireDate: '2013-10-10T11:23:17.714Z' },
        { ID: 30, Name: 'Eduardo Ramirez', JobTitle: 'Manager', HireDate: '1887-11-28T11:23:17.714Z' }
    ];

    @ViewChild('gridSearch', { read: IgxGridComponent })
    public gridSearch: IgxGridComponent;

    public highlightClass = 'igx-highlight';
    public activeClass = 'igx-highlight__active';
}

@Component({
    template: `
        <igx-grid #gridSearch [data]="data">
            <igx-column field="ID"></igx-column>
            <igx-column field="Name" hidden="true"></igx-column>
            <igx-column field="JobTitle"></igx-column>
            <igx-column field="HireDate" pinned="true"></igx-column>
        </igx-grid>
    `
})
export class HiddenColumnsGridComponent {
    public data = [
        { ID: 1, Name: 'Casey Houston', JobTitle: 'Vice President', HireDate: '2017-06-19T11:43:07.714Z' },
        { ID: 2, Name: 'Gilberto Todd', JobTitle: 'Director', HireDate: '2015-12-18T11:23:17.714Z' },
        { ID: 3, Name: 'Tanya Bennett', JobTitle: 'Director', HireDate: '2005-11-18T11:23:17.714Z' },
        { ID: 4, Name: 'Jack Simon', JobTitle: 'Software Developer', HireDate: '2008-12-18T11:23:17.714Z' },
        { ID: 5, Name: 'Celia Martinez', JobTitle: 'Senior Software DEVELOPER', HireDate: '2007-12-19T11:23:17.714Z' },
        { ID: 6, Name: 'Erma Walsh', JobTitle: 'CEO', HireDate: '2016-12-18T11:23:17.714Z' },
        { ID: 7, Name: 'Debra Morton', JobTitle: 'Associate Software Developer', HireDate: '2005-11-19T11:23:17.714Z' },
        { ID: 8, Name: 'Erika Wells', JobTitle: 'Software Development Team Lead', HireDate: '2005-10-14T11:23:17.714Z' },
        { ID: 9, Name: 'Leslie Hansen', JobTitle: 'Associate Software Developer', HireDate: '2013-10-10T11:23:17.714Z' },
        { ID: 10, Name: 'Eduardo Ramirez', JobTitle: 'Manager', HireDate: '2011-11-28T11:23:17.714Z' }
    ];

    @ViewChild('gridSearch', { read: IgxGridComponent })
    public gridSearch: IgxGridComponent;

    public highlightClass = 'igx-highlight';
    public activeClass = 'igx-highlight__active';
}

@Component({
    template: `
    <igx-grid #gridSearch id="gridSearch" [data]="data" [autoGenerate]="false" height="600px"
    width="1000px" columnWidth="300">
        <igx-column [field]="'Name'" dataType="string"></igx-column>
        <igx-column [field]="'Avatar'" header="Photo" [searchable]="false">
            <ng-template igxCell let-cell="cell">
                <div class="cell__inner avatar-cell">
                    <img [src]="cell.row.rowData.Avatar" width="30px" height="30px"/>
                </div>
            </ng-template>
        </igx-column>
    </igx-grid>
    `
})
export class GridWithAvatarComponent {
    public data = [
        {
            Name: 'Person 1',
            Avatar: 'https://randomuser.me/api/portraits/men/43.jpg'
        },
        {
            Name: 'Person 2',
            Avatar: 'https://randomuser.me/api/portraits/women/66.jpg'
        },
        {
            Name: 'Person 3',
            Avatar: 'https://randomuser.me/api/portraits/men/92.jpg'
        }
    ];

    @ViewChild('gridSearch', { read: IgxGridComponent })
    public gridSearch: IgxGridComponent;

    public highlightClass = 'igx-highlight';
    public activeClass = 'igx-highlight__active';
}

@Component({
    template: `
        <igx-grid #gridSearch [data]="data">
            <igx-column field="ID"></igx-column>
            <igx-column field="Name" [searchable]='false'></igx-column>
            <igx-column field="JobTitle"></igx-column>
            <igx-column field="Company" [searchable]='false'></igx-column>
        </igx-grid>
    `
})
export class UnsearchableColumnsGridComponent {
    public data = [
        { ID: 1, Name: 'Casey Houston', JobTitle: 'Vice President', Company: 'Company A' },
        { ID: 2, Name: 'Gilberto Todd', JobTitle: 'Director', Company: 'Company C' },
        { ID: 3, Name: 'Tanya Bennett', JobTitle: 'Director', Company: 'Company A' },
        { ID: 4, Name: 'Jack Simon', JobTitle: 'Software Developer', Company: 'Company D' },
        { ID: 5, Name: 'Celia Martinez', JobTitle: 'Senior Software DEVELOPER', Company: 'Company B' },
        { ID: 6, Name: 'Erma Walsh', JobTitle: 'CEO', Company: 'Company C' },
        { ID: 7, Name: 'Debra Morton', JobTitle: 'Associate Software Developer', Company: 'Company B' },
        { ID: 8, Name: 'Erika Wells', JobTitle: 'Software Development Team Lead', Company: 'Company A' },
        { ID: 9, Name: 'Leslie Hansen', JobTitle: 'Associate Software Developer', Company: 'Company D' },
        { ID: 10, Name: 'Eduardo Ramirez', JobTitle: 'Manager', Company: 'Company E' }
    ];

    @ViewChild('gridSearch', { read: IgxGridComponent })
    public gridSearch: IgxGridComponent;

    public highlightClass = 'igx-highlight';
    public activeClass = 'igx-highlight__active';
}

@Component({
    template: `
        <igx-grid #gridSearch [paging]="paging" [perPage]="perPage" [data]="data">
            <igx-column [groupable]="true"  field="ID"></igx-column>
            <igx-column [groupable]="true" field="Name" [searchable]='false'></igx-column>
            <igx-column [groupable]="true" field="JobTitle"></igx-column>
            <igx-column [groupable]="true" field="Company" [searchable]='false'></igx-column>
        </igx-grid>
    `
})
export class GroupableGridComponent {
    public data = [
        { ID: 1, Name: 'Casey Houston', JobTitle: 'Vice President', Company: 'Company A' },
        { ID: 2, Name: 'Gilberto Todd', JobTitle: 'Director', Company: 'Company C' },
        { ID: 3, Name: 'Tanya Bennett', JobTitle: 'Director', Company: 'Company A' },
        { ID: 4, Name: 'Jack Simon', JobTitle: 'Software Developer', Company: 'Company D' },
        { ID: 5, Name: 'Celia Martinez', JobTitle: 'Senior Software DEVELOPER', Company: 'Company B' },
        { ID: 6, Name: 'Erma Walsh', JobTitle: 'CEO', Company: 'Company C' },
        { ID: 7, Name: 'Debra Morton', JobTitle: 'Associate Software Developer', Company: 'Company B' },
        { ID: 8, Name: 'Erika Wells', JobTitle: 'Software Development Team Lead', Company: 'Company A' },
        { ID: 9, Name: 'Leslie Hansen', JobTitle: 'Associate Software Developer', Company: 'Company D' },
        { ID: 10, Name: 'Eduardo Ramirez', JobTitle: 'Manager', Company: 'Company E' }
    ];

    @ViewChild('gridSearch', { read: IgxGridComponent })
    public gridSearch: IgxGridComponent;

    public highlightClass = 'igx-highlight';
    public activeClass = 'igx-highlight__active';

    public perPage = 6;
    public paging = false;
}

