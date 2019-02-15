import { Component, ViewChild } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { UIInteractions } from '../../test-utils/ui-interactions.spec';
import { configureTestSuite } from '../../test-utils/configure-suite';
import { IgxMonthPickerComponent } from './month-picker.component';
import { IgxCalendarModule } from '../calendar.module';

describe('IgxMonthPicker', () => {
    configureTestSuite();

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [IgxMonthPickerSampleComponent],
            imports: [FormsModule, NoopAnimationsModule, IgxCalendarModule]
        }).compileComponents();
    });

    it('should initialize a month picker component', () => {
        const fixture = TestBed.createComponent(IgxMonthPickerSampleComponent);
        fixture.detectChanges();

        expect(fixture.componentInstance).toBeDefined();
    });

    it('should initialize a month picker component with `id` property', () => {
        const fixture = TestBed.createComponent(IgxMonthPickerSampleComponent);
        fixture.detectChanges();

        const monthPicker = fixture.componentInstance.monthPicker;

        expect(monthPicker.id).toBe('igx-month-picker-1');

        monthPicker.id = 'custom';
        fixture.detectChanges();

        expect(monthPicker.id).toBe('custom');
    });

    it('should properly render month picker DOM structure', () => {
        const fixture = TestBed.createComponent(IgxMonthPickerSampleComponent);
        fixture.detectChanges();

        const dom = fixture.debugElement;

        const months = dom.queryAll(By.css('.igx-calendar__month'));
        const current = dom.query(By.css('.igx-calendar__month--current'));

        expect(months.length).toEqual(11);
        expect(current.nativeElement.textContent.trim()).toMatch('Feb');

        dom.queryAll(By.css('.igx-calendar-picker__date'))[0].nativeElement.click();
        fixture.detectChanges();

        const years = dom.queryAll(By.css('.igx-calendar__year'));
        const currentYear = dom.query(By.css('.igx-calendar__year--current'));

        expect(years.length).toEqual(6);
        expect(currentYear.nativeElement.textContent.trim()).toMatch('2019');
    });

    it('should properly set @Input properties and setters', () => {
        const fixture = TestBed.createComponent(IgxMonthPickerSampleComponent);
        fixture.detectChanges();

        const instance = fixture.componentInstance;
        const monthPicker = fixture.componentInstance.monthPicker;

        const format = {
            day: '2-digit',
            month: 'long',
            weekday: 'long',
            year: '2-digit'
        };

        expect(monthPicker.value).toBeUndefined();
        expect(monthPicker.viewDate.getDate()).toEqual(instance.viewDate.getDate());
        expect(monthPicker.locale).toEqual('en');

        const today = new Date(Date.now());
        monthPicker.viewDate = today;
        monthPicker.value = today;
        instance.locale = 'fr';
        instance.formatOptions = format;
        fixture.detectChanges();

        expect(monthPicker.locale).toEqual('fr');
        expect(monthPicker.formatOptions.year).toEqual('2-digit');
        expect(monthPicker.value.getDate()).toEqual(today.getDate());
        expect(monthPicker.viewDate.getDate()).toEqual(today.getDate());
    });

    it('should properly set formatOptions and formatViews', () => {
        const fixture = TestBed.createComponent(IgxMonthPickerSampleComponent);
        fixture.detectChanges();

        const dom = fixture.debugElement;
        const monthPicker = fixture.componentInstance.monthPicker;

        const defaultOptions = {
            day: 'numeric',
            month: 'short',
            weekday: 'short',
            year: 'numeric'
        };
        const defaultViews = { day: false, month: true, year: false };

        const yearBtn = dom.query(By.css('.igx-calendar-picker__date'));
        const month = dom.queryAll(By.css('.igx-calendar__month'))[0];

        expect(monthPicker.formatOptions).toEqual(jasmine.objectContaining(defaultOptions));
        expect(monthPicker.formatViews).toEqual(jasmine.objectContaining(defaultViews));
        expect(yearBtn.nativeElement.textContent.trim()).toMatch('2019');
        expect(month.nativeElement.textContent.trim()).toMatch('Jan');

        const formatOptions: any = { month: 'long', year: '2-digit' };
        const formatViews: any = { month: true, year: true };

        monthPicker.formatViews = formatViews;
        monthPicker.formatOptions = formatOptions;
        fixture.detectChanges();

        const march = dom.queryAll(By.css('.igx-calendar__month'))[1];

        expect(monthPicker.formatOptions).toEqual(jasmine.objectContaining(Object.assign(defaultOptions, formatOptions)));
        expect(monthPicker.formatViews).toEqual(jasmine.objectContaining(Object.assign(defaultViews, formatViews)));
        expect(yearBtn.nativeElement.textContent.trim()).toMatch('19');
        expect(march.nativeElement.textContent.trim()).toMatch('March');

        yearBtn.nativeElement.click();
        fixture.detectChanges();
        const year = dom.queryAll(By.css('.igx-calendar__year'))[0];

        expect(year.nativeElement.textContent.trim()).toMatch('16');
    });

    it('should properly set locale', () => {
        const fixture = TestBed.createComponent(IgxMonthPickerSampleComponent);
        fixture.detectChanges();

        const dom = fixture.debugElement;
        const monthPicker = fixture.componentInstance.monthPicker;

        const locale = 'de';
        monthPicker.locale = locale;
        fixture.detectChanges();

        const yearBtn = dom.query(By.css('.igx-calendar-picker__date'));
        const month = dom.queryAll(By.css('.igx-calendar__month'))[1];

        expect(yearBtn.nativeElement.textContent.trim()).toMatch('2019');
        expect(month.nativeElement.textContent.trim()).toMatch('Mär');
    });

    it('should select a month on click', () => {
        const fixture = TestBed.createComponent(IgxMonthPickerSampleComponent);
        fixture.detectChanges();

        const dom = fixture.debugElement;
        const monthPicker = fixture.componentInstance.monthPicker;

        const months = dom.queryAll(By.css('.igx-calendar__month'));

        spyOn(monthPicker.onSelection, 'emit');

        months[1].nativeElement.click();
        fixture.detectChanges();

        const currentMonth = dom.query(By.css('.igx-calendar__month--current'));

        expect(monthPicker.onSelection.emit).toHaveBeenCalled();
        expect(currentMonth.nativeElement.textContent.trim()).toEqual('Mar');

        const nextDay = new Date(2019, 2, 7);
        expect(fixture.componentInstance.model.getDate()).toEqual(nextDay.getDate());
    });

    it('should select a month through API', () => {
        const fixture = TestBed.createComponent(IgxMonthPickerSampleComponent);
        fixture.detectChanges();

        const dom = fixture.debugElement;
        const monthPicker = fixture.componentInstance.monthPicker;

        const nextDay = new Date(2022, 3, 14);

        monthPicker.selectDate(nextDay);
        fixture.detectChanges();

        const currentMonth = dom.query(By.css('.igx-calendar__month--current'));
        const yearBtn = dom.query(By.css('.igx-calendar-picker__date'));

        expect(currentMonth.nativeElement.textContent.trim()).toEqual('Apr');
        expect(yearBtn.nativeElement.textContent.trim()).toMatch('2019');
    });

    it('should navigate to the previous/next year.', () => {
        const fixture = TestBed.createComponent(IgxMonthPickerSampleComponent);
        fixture.detectChanges();

        const dom = fixture.debugElement;
        const monthPicker = fixture.componentInstance.monthPicker;


        const prev = dom.query(By.css('.igx-calendar-picker__prev'));
        const next = dom.query(By.css('.igx-calendar-picker__next'));
        const yearBtn = dom.query(By.css('.igx-calendar-picker__date'));

        expect(yearBtn.nativeElement.textContent.trim()).toMatch('2019');

        prev.nativeElement.click();
        fixture.detectChanges();

        expect(monthPicker.viewDate.getFullYear()).toEqual(2018);
        expect(yearBtn.nativeElement.textContent.trim()).toMatch('2018');

        next.nativeElement.click();
        next.nativeElement.click();
        next.nativeElement.click();
        fixture.detectChanges();

        expect(monthPicker.viewDate.getFullYear()).toEqual(2021);
        expect(yearBtn.nativeElement.textContent.trim()).toMatch('2021');
    });

    it('should navigate to the previous/next year via KB.', () => {
        const fixture = TestBed.createComponent(IgxMonthPickerSampleComponent);
        fixture.detectChanges();

        const dom = fixture.debugElement;
        const monthPicker = fixture.componentInstance.monthPicker;

        const prev = dom.query(By.css('.igx-calendar-picker__prev'));
        const next = dom.query(By.css('.igx-calendar-picker__next'));
        const yearBtn = dom.query(By.css('.igx-calendar-picker__date'));

        expect(yearBtn.nativeElement.textContent.trim()).toMatch('2019');

        prev.nativeElement.focus();

        expect(prev.nativeElement).toBe(document.activeElement);

        UIInteractions.simulateKeyDownEvent(prev.nativeElement, 'Enter');
        fixture.detectChanges();

        expect(monthPicker.viewDate.getFullYear()).toEqual(2018);
        expect(yearBtn.nativeElement.textContent.trim()).toMatch('2018');

        next.nativeElement.focus();

        expect(next.nativeElement).toBe(document.activeElement);

        UIInteractions.simulateKeyDownEvent(next.nativeElement, 'Enter');
        UIInteractions.simulateKeyDownEvent(next.nativeElement, 'Enter');
        UIInteractions.simulateKeyDownEvent(next.nativeElement, 'Enter');
        fixture.detectChanges();

        expect(monthPicker.viewDate.getFullYear()).toEqual(2021);
        expect(yearBtn.nativeElement.textContent.trim()).toMatch('2021');
    });

    it('should open years view, navigate through and select an year via KB.', () => {
        const fixture = TestBed.createComponent(IgxMonthPickerSampleComponent);
        fixture.detectChanges();

        const dom = fixture.debugElement;
        const monthPicker = fixture.componentInstance.monthPicker;

        let year = dom.query(By.css('.igx-calendar-picker__date'));
        year.nativeElement.focus();

        expect(year.nativeElement).toBe(document.activeElement);

        UIInteractions.simulateKeyDownEvent(document.activeElement, 'Enter');
        fixture.detectChanges();

        let currentYear = dom.query(By.css('.igx-calendar__year--current'));

        UIInteractions.simulateKeyDownEvent(currentYear.nativeElement, 'ArrowDown');
        fixture.detectChanges();

        currentYear = dom.query(By.css('.igx-calendar__year--current'));
        expect(currentYear.nativeElement.textContent.trim()).toMatch('2020');

        UIInteractions.simulateKeyDownEvent(currentYear.nativeElement, 'ArrowUp');
        UIInteractions.simulateKeyDownEvent(currentYear.nativeElement, 'ArrowUp');
        fixture.detectChanges();

        currentYear = dom.query(By.css('.igx-calendar__year--current'));
        expect(currentYear.nativeElement.textContent.trim()).toMatch('2018');

        UIInteractions.simulateKeyDownEvent(currentYear.nativeElement, 'Enter');
        fixture.detectChanges();

        year = dom.query(By.css('.igx-calendar-picker__date'));

        expect(monthPicker.viewDate.getFullYear()).toEqual(2018);
        expect(year.nativeElement.textContent.trim()).toMatch('2018');
    });

    it('should navigate through and select a month via KB.', () => {
        const fixture = TestBed.createComponent(IgxMonthPickerSampleComponent);
        fixture.detectChanges();

        const dom = fixture.debugElement;
        const monthPicker = fixture.componentInstance.monthPicker;

        const months = dom.queryAll(By.css('.igx-calendar__month'));
        const currentMonth = dom.query(By.css('.igx-calendar__month--current'));

        expect(months.length).toEqual(11);
        expect(currentMonth.nativeElement.textContent.trim()).toMatch('Feb');

        UIInteractions.simulateKeyDownEvent(currentMonth.nativeElement, 'Home');
        fixture.detectChanges();

        expect(document.activeElement.textContent.trim()).toMatch('Jan');

        UIInteractions.simulateKeyDownEvent(currentMonth.nativeElement, 'End');
        fixture.detectChanges();

        expect(document.activeElement.textContent.trim()).toMatch('Dec');

        UIInteractions.simulateKeyDownEvent(document.activeElement, 'ArrowLeft');
        fixture.detectChanges();

        UIInteractions.simulateKeyDownEvent(document.activeElement, 'ArrowUp');
        fixture.detectChanges();

        UIInteractions.simulateKeyDownEvent(document.activeElement, 'ArrowRight');
        fixture.detectChanges();

        expect(document.activeElement.textContent.trim()).toMatch('Sep');

        UIInteractions.simulateKeyDownEvent(document.activeElement, 'Enter');
        fixture.detectChanges();

        expect(monthPicker.viewDate.getMonth()).toEqual(8);
    });
});

@Component({
    template: `<igx-month-picker [(ngModel)]="model"
                          [viewDate]="viewDate"
                          [formatOptions]="formatOptions"
                          [locale]="locale">
                </igx-month-picker>`
})
export class IgxMonthPickerSampleComponent {
    public model: Date = new Date(2019, 1, 7);
    public viewDate = new Date(2019, 1, 7);
    public locale = 'en';

    formatOptions = {
        day: 'numeric',
        month: 'short',
        weekday: 'short',
        year: 'numeric'
    };

    @ViewChild(IgxMonthPickerComponent) public monthPicker: IgxMonthPickerComponent;
}
