import { fakeAsync, TestBed, tick, waitForAsync } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { ViewChild, Component } from '@angular/core';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { IgxPaginatorComponent, IgxPaginatorModule } from './paginator.component';
import { configureTestSuite } from '../test-utils/configure-suite';
import { BUTTON_DISABLED_CLASS, PaginatorFunctions, PAGER_CLASS } from '../test-utils/paginator-functions.spec';
import { ControlsFunction } from '../test-utils/controls-functions.spec';
import { IPagingEventArgs } from './interfaces';

const verifyPager = (fix, perPage, pagerText, buttonsVisibility) => {
    const paginator: IgxPaginatorComponent = fix.componentInstance.paginator;
    const element = paginator.nativeElement;

    expect(paginator.perPage).toEqual(perPage, 'Invalid number of perpage');

    if (pagerText != null) {
        expect(element.querySelector(PAGER_CLASS)).toBeDefined();
        expect(element.querySelectorAll('igx-select').length).toEqual(1);
        expect(element.querySelector('.igx-paginator__pager > div').textContent).toMatch(pagerText);
    }
    if (buttonsVisibility != null && buttonsVisibility.length === 4) {
        const pagingButtons = PaginatorFunctions.getPagingButtons(element);
        expect(pagingButtons.length).toEqual(4);
        expect(pagingButtons[0].className.includes(BUTTON_DISABLED_CLASS)).toBe(buttonsVisibility[0]);
        expect(pagingButtons[1].className.includes(BUTTON_DISABLED_CLASS)).toBe(buttonsVisibility[1]);
        expect(pagingButtons[2].className.includes(BUTTON_DISABLED_CLASS)).toBe(buttonsVisibility[2]);
        expect(pagingButtons[3].className.includes(BUTTON_DISABLED_CLASS)).toBe(buttonsVisibility[3]);
    }
};

describe('IgxPaginator with default settings', () => {
    configureTestSuite();
    beforeAll(waitForAsync(() => {
        TestBed.configureTestingModule({
            declarations: [
                DefaultPaginatorComponent
            ],
            imports: [IgxPaginatorModule, NoopAnimationsModule]
        }).compileComponents();
    }));

    let fix;
    let paginator: IgxPaginatorComponent;

    beforeEach(fakeAsync(() => {
        fix = TestBed.createComponent(DefaultPaginatorComponent);
        fix.detectChanges();
        paginator = fix.componentInstance.paginator;
    }));

    it('should calculate number of pages correctly', () => {
        fix = TestBed.createComponent(DefaultPaginatorComponent);
        fix.detectChanges();
        paginator = fix.componentInstance.paginator;
        let totalPages = paginator.totalPages;
        expect(totalPages).toBe(3);

        paginator.perPage = 10;

        fix.detectChanges();
        totalPages = paginator.totalPages;
        expect(totalPages).toBe(5);
    });

    it('should paginate data UI', () => {
        spyOn(paginator.paging, 'emit').and.callThrough();
        spyOn(paginator.pagingDone, 'emit').and.callThrough();

        const sub = paginator.paging.subscribe((e: IPagingEventArgs) => {
            e.newPage = newPage ? newPage : e.newPage;
            e.cancel = cancelEvent;
        });

        verifyPager(fix, 15, '1\xA0of\xA03', [true, true, false, false]);

        // Go to next page
        PaginatorFunctions.navigateToNextPage(paginator.nativeElement);
        fix.detectChanges();
        verifyPager(fix, 15, '2\xA0of\xA03', [false, false, false, false]);
        expect(paginator.paging.emit).toHaveBeenCalledTimes(1);
        expect(paginator.pagingDone.emit).toHaveBeenCalledTimes(1);

        // Go to last page
        PaginatorFunctions.navigateToLastPage(paginator.nativeElement);
        fix.detectChanges();
        verifyPager(fix, 15, '3\xA0of\xA03', [false, false, true, true]);
        expect(paginator.paging.emit).toHaveBeenCalledTimes(2);
        expect(paginator.pagingDone.emit).toHaveBeenCalledTimes(2);

        // Go to previous page
        PaginatorFunctions.navigateToPrevPage(paginator.nativeElement);
        fix.detectChanges();
        verifyPager(fix, 15, '2\xA0of\xA03', [false, false, false, false]);
        expect(paginator.paging.emit).toHaveBeenCalledTimes(3);
        expect(paginator.pagingDone.emit).toHaveBeenCalledTimes(3);

        // Go to first page
        PaginatorFunctions.navigateToFirstPage(paginator.nativeElement);
        fix.detectChanges();
        verifyPager(fix, 15, '1\xA0of\xA03', [true, true, false, false]);
        expect(paginator.paging.emit).toHaveBeenCalledTimes(4);
        expect(paginator.pagingDone.emit).toHaveBeenCalledTimes(4);

        // change page in event
        const newPage = 2;
        PaginatorFunctions.navigateToNextPage(paginator.nativeElement);
        fix.detectChanges();
        verifyPager(fix, 15, '3\xA0of\xA03', [false, false, true, true]);
        expect(paginator.paging.emit).toHaveBeenCalledTimes(5);
        expect(paginator.pagingDone.emit).toHaveBeenCalledTimes(5);

        // cancel event
        const cancelEvent = true;
        PaginatorFunctions.navigateToFirstPage(paginator.nativeElement);
        fix.detectChanges();
        verifyPager(fix, 15, '3\xA0of\xA03', [false, false, true, true]);
        expect(paginator.paging.emit).toHaveBeenCalledTimes(6);
        expect(paginator.pagingDone.emit).toHaveBeenCalledTimes(5);

        sub.unsubscribe();
    });

    it('change paging settings UI', () => {
        expect(paginator.perPage).toEqual(15, 'Invalid page size');

        verifyPager(fix, 15, '1\xA0of\xA03', []);

        // Change page size
        PaginatorFunctions.clickOnPageSelectElement(fix);
        fix.detectChanges();
        ControlsFunction.clickDropDownItem(fix, 0);

        expect(paginator.perPage).toEqual(5, 'Invalid page size');
        verifyPager(fix, 5, '1\xA0of\xA09', []);
    });

    it('should be able to set totalRecords', () => {
        fix = TestBed.createComponent(DefaultPaginatorComponent);
        fix.detectChanges();
        paginator = fix.componentInstance.paginator;
        paginator.perPage = 5;
        fix.detectChanges();

        expect(paginator.perPage).toEqual(5, 'Invalid page size');
        expect(paginator.totalRecords).toBe(42);
        verifyPager(fix, 5, '1\xA0of\xA09', []);

        paginator.totalRecords = 4;
        fix.detectChanges();

        expect(paginator.perPage).toEqual(5, 'Invalid page size');
        expect(paginator.totalRecords).toBe(4);
        verifyPager(fix, 5, '1\xA0of\xA01', []);
    });

    it('should change current page to equal last page, after changing perPage', () => {
        fix = TestBed.createComponent(DefaultPaginatorComponent);
        fix.detectChanges();
        paginator = fix.componentInstance.paginator;
        spyOn(paginator.paging, 'emit');
        spyOn(paginator.pagingDone, 'emit');

        fix.detectChanges();

        paginator.paginate(paginator.totalPages - 1);
        fix.detectChanges();

        expect(paginator.paging.emit).toHaveBeenCalledTimes(1);
        expect(paginator.pagingDone.emit).toHaveBeenCalledTimes(1);

        paginator.perPage = paginator.totalRecords / 2;
        fix.detectChanges();

        expect(paginator.paging.emit).toHaveBeenCalledTimes(2);
        expect(paginator.pagingDone.emit).toHaveBeenCalledTimes(2);

        const page = paginator.page;
        expect(page).toBe(1);
    });

    it('should disable go to first page when paginator is on first page', () => {
        const goToFirstPageButton = fix.debugElement.query(By.css('button')).nativeElement;

        expect(goToFirstPageButton.className.includes('igx-button--disabled')).toBe(true);

        paginator.nextPage();
        fix.detectChanges();

        expect(goToFirstPageButton.className.includes('igx-button--disabled')).toBe(false);

        paginator.previousPage();
        fix.detectChanges();

        expect(goToFirstPageButton.className.includes('igx-button--disabled')).toBe(true);
    });

    it('should disable go to last page button when paginator is on last page', () => {
        const goToLastPageButton = fix.debugElement.query(By.css('button:last-child')).nativeElement;

        expect(goToLastPageButton.className.includes('igx-button--disabled')).toBe(false);

        paginator.paginate(paginator.totalPages - 1);
        fix.detectChanges();

        expect(goToLastPageButton.className.includes('igx-button--disabled')).toBe(true);

        paginator.previousPage();
        fix.detectChanges();

        expect(goToLastPageButton.className.includes('igx-button--disabled')).toBe(false);
    });

    it('"paginate" method should paginate correctly', () => {
        const page = (index: number) => paginator.paginate(index);
        let desiredPageIndex = 2;
        page(2);
        fix.detectChanges();

        expect(paginator.page).toBe(desiredPageIndex);

        // non-existent page, should not paginate
        page(-2);
        fix.detectChanges();
        expect(paginator.page).toBe(desiredPageIndex);

        // non-existent page, should not paginate
        page(666);
        fix.detectChanges();
        expect(paginator.page).toBe(desiredPageIndex);

        // first page
        desiredPageIndex = 0;
        page(desiredPageIndex);
        fix.detectChanges();
        expect(paginator.page).toBe(desiredPageIndex);

        // last page
        desiredPageIndex = paginator.totalPages - 1;
        page(desiredPageIndex);
        fix.detectChanges();
        expect(paginator.page).toBe(desiredPageIndex);

        // last page + 1, should not paginate
        page(paginator.totalPages);
        fix.detectChanges();
        expect(paginator.page).toBe(desiredPageIndex);
    });

    it('"page" property should paginate correctly', () => {
        const page = (index: number) => paginator.page = index;
        let desiredPageIndex = 2;
        page(2);
        fix.detectChanges();

        expect(paginator.page).toBe(desiredPageIndex);

        // non-existent page, should not paginate
        page(-2);
        fix.detectChanges();
        expect(paginator.page).toBe(desiredPageIndex);

        // non-existent page, should not paginate
        page(666);
        fix.detectChanges();
        expect(paginator.page).toBe(desiredPageIndex);

        // first page
        desiredPageIndex = 0;
        page(desiredPageIndex);
        fix.detectChanges();
        expect(paginator.page).toBe(desiredPageIndex);

        // last page
        desiredPageIndex = paginator.totalPages - 1;
        page(desiredPageIndex);
        fix.detectChanges();
        expect(paginator.page).toBe(desiredPageIndex);

        // last page + 1, should not paginate
        page(paginator.totalPages);
        fix.detectChanges();
        expect(paginator.page).toBe(desiredPageIndex);
    });

    it('should disable all buttons in the paginate if perPage > total records', () => {
        fix = TestBed.createComponent(DefaultPaginatorComponent);
        fix.detectChanges();
        paginator = fix.componentInstance.paginator;
        paginator.perPage = 100;
        fix.detectChanges();

        const pagingButtons = PaginatorFunctions.getPagingButtons(fix.nativeElement);
        pagingButtons.forEach(element => {
            expect(element.className.includes('igx-button--disabled')).toBe(true);
        });
    });

    it('change paging pages per page API', fakeAsync(() => {
        spyOn(paginator.paging, 'emit');
        spyOn(paginator.pagingDone, 'emit');

        paginator.perPage = 2;
        tick();
        fix.detectChanges();

        paginator.page = 1;
        tick();
        fix.detectChanges();

        expect(paginator.perPage).toEqual(2, 'Invalid page size');
        verifyPager(fix, 2, '2\xA0of\xA021', [false, false, false, false]);

        // Change page size to be 5
        paginator.perPage = 5;
        tick();
        fix.detectChanges();
        verifyPager(fix, 5, '2\xA0of\xA09', [false, false, false, false]);

        // Change page size to be 33
        paginator.perPage = 33;
        tick();
        fix.detectChanges();
        verifyPager(fix, 33, '2\xA0of\xA02', [false, false, true, true]);

        // Change page size to be negative
        paginator.perPage = -7;
        tick();
        fix.detectChanges();
        expect(paginator.paging.emit).toHaveBeenCalledTimes(0);
        expect(paginator.pagingDone.emit).toHaveBeenCalledTimes(0);
        verifyPager(fix, 33, '2\xA0of\xA02', [false, false, true, true]);
    }));

});

describe('IgxPaginator with custom settings', () => {
    configureTestSuite();
    beforeAll(waitForAsync(() => {
        TestBed.configureTestingModule({
            declarations: [
                CustomizedPaginatorComponent,
                DisabledPaginatorComponent,
                HiddenPaginatorComponent
            ],
            imports: [IgxPaginatorModule, NoopAnimationsModule]
        }).compileComponents();
    }));

    it('should calculate correctly pages when custom select options are given', () => {
        const fix = TestBed.createComponent(CustomizedPaginatorComponent);
        fix.detectChanges();
        const paginator = fix.componentInstance.paginator;

        let totalPages = paginator.totalPages;
        expect(totalPages).toBe(4);

        const select = fix.debugElement.query(By.css('igx-select')).nativeElement;
        select.click();
        fix.detectChanges();

        ControlsFunction.clickDropDownItem(fix, 3);

        totalPages = paginator.totalPages;
        expect(totalPages).toBe(1);
    });

    it('should add perPage in the select options if not already there', () => {
        const fix = TestBed.createComponent(CustomizedPaginatorComponent);
        fix.detectChanges();
        const paginator = fix.componentInstance.paginator;
        const selectOptions = paginator.selectOptions;

        expect(selectOptions).toEqual([3, 7, 10, 25, 40]);
    });

    it('should be able to render custom select label', () => {
        const fix = TestBed.createComponent(CustomizedPaginatorComponent);
        fix.detectChanges();
        const paginator = fix.componentInstance.paginator;
        paginator.resourceStrings.igx_paginator_label = 'Per page';

        fix.detectChanges();
        expect(paginator.resourceStrings.igx_paginator_label).toEqual('Per page');
    });

    it('should disable the dropdown and pager buttons if set to false through input', () => {
        const fix = TestBed.createComponent(DisabledPaginatorComponent);
        fix.detectChanges();

        const select = fix.debugElement.query(By.css('igx-select')).nativeElement;
        const selectDisabled = select.getAttribute('ng-reflect-is-disabled');

        const pagingButtons = PaginatorFunctions.getPagingButtons(fix.nativeElement);
        pagingButtons.forEach(element => {
            expect(element.className.includes('igx-button--disabled')).toBe(true);
        });

        expect(selectDisabled).toBeTruthy();
    });

    it('should hide the dropdown and pager if set to false through input', () => {
        const fix = TestBed.createComponent(HiddenPaginatorComponent);
        fix.detectChanges();

        const select = fix.debugElement.query(By.css('.igx-paginator__select')).nativeElement;
        const selectHidden = select.hasAttribute('hidden');

        const pager = fix.debugElement.query(By.css('.igx-paginator__pager')).nativeElement;
        const pagerHidden = pager.hasAttribute('hidden');

        expect(selectHidden).toBeTruthy();
        expect(pagerHidden).toBeTruthy();
    });
});
@Component({
    template: `<igx-paginator [totalRecords]="42"></igx-paginator>`
})
export class DefaultPaginatorComponent {
    @ViewChild(IgxPaginatorComponent, { static: true }) public paginator: IgxPaginatorComponent;
}
@Component({
    template: `<igx-paginator
        [totalRecords]="25"
        [selectOptions]="[3,10,25,40]"
        [perPage]="7"
        >
        </igx-paginator>`
})
export class CustomizedPaginatorComponent {
    @ViewChild(IgxPaginatorComponent, { static: true }) public paginator: IgxPaginatorComponent;
}

@Component({
    template: `<igx-paginator
        [pagerEnabled]="false"
        [dropdownEnabled]="false"
        >
        </igx-paginator>`
})
export class DisabledPaginatorComponent {
    @ViewChild(IgxPaginatorComponent, { static: true }) public paginator: IgxPaginatorComponent;
}

@Component({
    template: `<igx-paginator
        [pagerHidden]="true"
        [dropdownHidden]="true"
        >
        </igx-paginator>`
})
export class HiddenPaginatorComponent {
    @ViewChild(IgxPaginatorComponent, { static: true }) public paginator: IgxPaginatorComponent;
}
