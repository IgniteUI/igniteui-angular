import { TestBed, waitForAsync } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { ViewChild, Component, TemplateRef } from '@angular/core';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { IgxPaginatorComponent, IgxPaginatorModule } from './paginator.component';
import { configureTestSuite } from '../test-utils/configure-suite';
import { GridFunctions } from '../test-utils/grid-functions.spec';
import { ControlsFunction } from '../test-utils/controls-functions.spec';
import { first } from 'rxjs/operators';

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
    it('should calculate number of pages correctly', () => {
        const fix = TestBed.createComponent(DefaultPaginatorComponent);
        fix.detectChanges();
        const paginator = fix.componentInstance.paginator;

        let totalPages = paginator.totalPages;
        expect(totalPages).toBe(3);

        paginator.perPage = 10;

        fix.detectChanges();
        totalPages = paginator.totalPages;
        expect(totalPages).toBe(5);
    });

    it('should change current page to equal last page, after changing perPage', () => {
        const fix = TestBed.createComponent(DefaultPaginatorComponent);
        fix.detectChanges();
        const paginator = fix.componentInstance.paginator;

        paginator.paginate(paginator.totalPages - 1);
        paginator.perPage = paginator.totalRecords / 2;

        fix.detectChanges();
        const page = paginator.page;
        expect(page).toBe(1);
    });

    it('should disable go to first page when paginator is on first page', () => {
        const fix = TestBed.createComponent(DefaultPaginatorComponent);
        fix.detectChanges();
        const paginator = fix.componentInstance.paginator;

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
        const fix = TestBed.createComponent(DefaultPaginatorComponent);
        fix.detectChanges();
        const paginator = fix.componentInstance.paginator;

        const goToLastPageButton = fix.debugElement.query(By.css('button:last-child')).nativeElement;

        expect(goToLastPageButton.className.includes('igx-button--disabled')).toBe(false);

        paginator.paginate(paginator.totalPages - 1);
        fix.detectChanges();

        expect(goToLastPageButton.className.includes('igx-button--disabled')).toBe(true);

        paginator.previousPage();
        fix.detectChanges();

        expect(goToLastPageButton.className.includes('igx-button--disabled')).toBe(false);
    });


    it('should disable all buttons in the paginate if perPage > total records', () => {
        const fix = TestBed.createComponent(DefaultPaginatorComponent);
        fix.detectChanges();
        const paginator = fix.componentInstance.paginator;

        paginator.perPage = 100;
        fix.detectChanges();

        const pagingButtons =  GridFunctions.getPagingButtons(fix.nativeElement);
        pagingButtons.forEach(element => {
            expect(element.className.includes('igx-button--disabled')).toBe(true);
        });
    });

    it('should be able to set custom pagination template', () => {
        const fix = TestBed.createComponent(DefaultPaginatorComponent);
        fix.detectChanges();

        fix.componentInstance.setCustomPager();
        fix.detectChanges();

        const customPaging = fix.debugElement.query(By.css('#numberPager')).nativeElement;
        const prevBtn = fix.debugElement.query(By.css('.customPrev'));
        const nextBtn = fix.debugElement.query(By.css('.customNext'));
        const currPage = fix.debugElement.query(By.css('.currPage'));

        expect(customPaging).toBeDefined();
        expect(prevBtn.properties.disabled).toBeTrue();
        expect(currPage.nativeElement.innerText).toEqual('0');
        expect(nextBtn.properties.disabled).toBeFalse();
    });

    it('should be able to operate correctly with paging api from custom template', () => {
        const fix = TestBed.createComponent(DefaultPaginatorComponent);
        fix.detectChanges();

        fix.componentInstance.setCustomPager();
        fix.detectChanges();

        const nextBtn = fix.debugElement.query(By.css('.customNext'));

        nextBtn.nativeElement.click();
        fix.detectChanges();

        let currPage = fix.debugElement.query(By.css('.currPage'));

        expect(currPage.nativeElement.innerText).toEqual('1');
        expect(nextBtn.properties.disabled).toBeFalse();

        nextBtn.nativeElement.click();
        fix.detectChanges();

        currPage = fix.debugElement.query(By.css('.currPage'));

        expect(currPage.nativeElement.innerText).toEqual('2');
        expect(nextBtn.properties.disabled).toBeTrue();
    });

    it('paging and pagingDone events should be emitted correctly', () => {
        const fix = TestBed.createComponent(DefaultPaginatorComponent);
        fix.detectChanges();

        const paginator = fix.componentInstance.paginator;

        spyOn(paginator.paging, 'emit').and.callThrough();
        spyOn(paginator.pagingDone, 'emit').and.callThrough();
        const allBtns = fix.debugElement.queryAll(By.css('.igx-button '));

        const prevBtn = allBtns[1];
        const nextBtn = allBtns[2];
        const lastBtn = allBtns[3];

        nextBtn.nativeElement.click();
        fix.detectChanges();

        lastBtn.nativeElement.click();
        fix.detectChanges();

        expect(paginator.paging.emit).toHaveBeenCalledWith({current: 1, next: 2, cancel: false});
        expect(paginator.pagingDone.emit).toHaveBeenCalledWith({current: 2, previous: 1});
        expect(paginator.paging.emit).toHaveBeenCalledTimes(2);
        expect(paginator.pagingDone.emit).toHaveBeenCalledTimes(2);

        paginator.paging.pipe(first()).subscribe(args => {
            args.cancel = true;
        });

        prevBtn.nativeElement.click();
        fix.detectChanges();

        expect(paginator.paging.emit).toHaveBeenCalledTimes(3);
        expect(paginator.pagingDone.emit).toHaveBeenCalledTimes(2);
    });

    it('pageChange event should be emitted correctly', () => {
        const fix = TestBed.createComponent(DefaultPaginatorComponent);
        fix.detectChanges();

        const paginator = fix.componentInstance.paginator;
        spyOn(paginator.pageChange, 'emit').and.callThrough();
        const allBtns = fix.debugElement.queryAll(By.css('.igx-button '));
        const nextBtn = allBtns[2];

        nextBtn.nativeElement.click();
        fix.detectChanges();

        expect(paginator.pageChange.emit).toHaveBeenCalledTimes(1);

        paginator.paging.pipe(first()).subscribe(args => {
            args.cancel = true;
        });

        nextBtn.nativeElement.click();
        fix.detectChanges();

        expect(paginator.pageChange.emit).toHaveBeenCalledTimes(1);
    });

    it('perPageChange event should be emitted correctly', () => {
        const fix = TestBed.createComponent(DefaultPaginatorComponent);
        fix.detectChanges();

        const paginator = fix.componentInstance.paginator;
        spyOn(paginator.perPageChange, 'emit').and.callThrough();

        paginator.perPage = 3;

        expect(paginator.perPageChange.emit).toHaveBeenCalledTimes(1);
    });

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

        const pagingButtons = GridFunctions.getPagingButtons(fix.nativeElement);
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
    template: `
        <igx-paginator [totalRecords]="42"></igx-paginator>
        <ng-template #customPager let-api>
            <div class="igx-grid__footer">
                <div id="numberPager" class="igx-paginator" style="justify-content: center;">
                    <button class="customPrev" [disabled]="api.isFirstPageDisabled" (click)="api.previousPage()" igxButton="flat">
                        PREV
                    </button>
                    <span class="currPage" style="margin-left:10px; margin-right: 10px"> {{api.page}} </span>
                    <button class="customNext" [disabled]="api.isLastPageDisabled" (click)="api.nextPage()" igxButton="flat">
                        NEXT
                    </button>
                </div>
            </div>
        </ng-template>`
})
export class DefaultPaginatorComponent {
    @ViewChild(IgxPaginatorComponent, { static: true }) public paginator: IgxPaginatorComponent;
    @ViewChild('customPager', { read: TemplateRef, static: true }) public customPager: TemplateRef<any>;

    public setCustomPager() {
        this.paginator.paginationTemplate = this.customPager;
    }
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
