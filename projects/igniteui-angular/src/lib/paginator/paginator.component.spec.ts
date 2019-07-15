import { async, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { ViewChild, Component } from '@angular/core';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { IgxPaginatorComponent, IgxPaginatorModule } from './paginator.component';
import { configureTestSuite } from '../test-utils/configure-suite';

describe('IgxPaginator with default settings', () => {
    configureTestSuite();
    beforeEach(async(() => {
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

        const pagingButtons = fix.nativeElement.querySelectorAll('.igx-grid-paginator__pager > button');
        pagingButtons.forEach(element => {
            expect(element.className.includes('igx-button--disabled')).toBe(true);
        });
    });

});

describe('IgxPaginator with custom settings', () => {
    configureTestSuite();
    beforeEach(async(() => {
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
        const selectList = fix.debugElement.query(By.css('.igx-drop-down__list--select'));
        selectList.children[3].nativeElement.click();

        fix.detectChanges();
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
        const selectLabel = paginator.selectLabel;

        expect(selectLabel).toEqual('Per page');
    });

    it('should disable the dropdown and pager buttons if set to false through input', () => {
        const fix = TestBed.createComponent(DisabledPaginatorComponent);
        fix.detectChanges();

        const select = fix.debugElement.query(By.css('igx-select')).nativeElement;
        const selectDisabled = select.getAttribute('ng-reflect-is-disabled');

        const pagingButtons = fix.nativeElement.querySelectorAll('.igx-grid-paginator__pager > button');
        pagingButtons.forEach(element => {
            expect(element.className.includes('igx-button--disabled')).toBe(true);
        });

        expect(selectDisabled).toBeTruthy();
    });

    it('should hide the dropdown and pager if set to false through input', () => {
        const fix = TestBed.createComponent(HiddenPaginatorComponent);
        fix.detectChanges();

        const select = fix.debugElement.query(By.css('.igx-grid-paginator__select')).nativeElement;
        const selectHidden = select.hasAttribute('hidden');

        const pager = fix.debugElement.query(By.css('.igx-grid-paginator__pager')).nativeElement;
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
        [selectLabel]="'Per page'"
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
