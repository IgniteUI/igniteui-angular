import { Component, ViewChild } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { UIInteractions } from '../../test-utils/ui-interactions.spec';
import { configureTestSuite } from '../../test-utils/configure-suite';
import { IgxMonthPickerComponent } from './month-picker.component';
import { IFormattingOptions, IgxCalendarView } from '../calendar';

describe('IgxMonthPicker', () => {
    configureTestSuite();

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [NoopAnimationsModule, IgxMonthPickerSampleComponent]
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

        const months = dom.queryAll(By.css('.igx-calendar-view__item'));
        const current = dom.query(By.css('.igx-calendar-view__item--selected'));

        expect(months.length).toEqual(12);
        expect(current.nativeElement.textContent.trim()).toMatch('Feb');

        const yearBtn = dom.query(By.css('.igx-calendar-picker__date'));
        UIInteractions.simulateMouseDownEvent(yearBtn.nativeElement);
        fixture.detectChanges();

        const years = dom.queryAll(By.css('.igx-calendar-view__item'));
        const currentYear = dom.query(By.css('.igx-calendar-view__item--selected'));

        expect(years.length).toEqual(15);
        expect(currentYear.nativeElement.textContent.trim()).toMatch('2019');
    });

    it('should properly render month picker rowheader elements', () => {
        const fixture = TestBed.createComponent(IgxMonthPickerSampleComponent);
        fixture.detectChanges();

        const dom = fixture.debugElement;
        const prev = dom.query(By.css('.igx-calendar-picker__prev'));
        const next = dom.query(By.css('.igx-calendar-picker__next'));

        expect(prev.nativeElement.getAttribute('aria-label')).toEqual('Previous Year');
        expect(prev.nativeElement.getAttribute('role')).toEqual('button');
        expect(prev.nativeElement.getAttribute('data-action')).toEqual('prev');

        expect(next.nativeElement.getAttribute('aria-label')).toEqual('Next Year');
        expect(next.nativeElement.getAttribute('role')).toEqual('button');
        expect(next.nativeElement.getAttribute('data-action')).toEqual('next');
    });

    it('should properly set @Input properties and setters', () => {
        const fixture = TestBed.createComponent(IgxMonthPickerSampleComponent);
        fixture.detectChanges();

        const instance = fixture.componentInstance;
        const monthPicker = fixture.componentInstance.monthPicker;

        const format: IFormattingOptions = {
            day: '2-digit',
            month: 'long',
            weekday: 'long',
            year: '2-digit'
        };

        expect(monthPicker.value).toBeUndefined();
        expect(monthPicker.viewDate.getDate()).toEqual(1);
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
        expect(monthPicker.viewDate.getDate()).toEqual(1);
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
        const month = dom.queryAll(By.css('.igx-calendar-view__item'))[0];

        expect(monthPicker.formatOptions).toEqual(jasmine.objectContaining(defaultOptions));
        expect(monthPicker.formatViews).toEqual(jasmine.objectContaining(defaultViews));
        expect(yearBtn.nativeElement.textContent.trim()).toMatch('2019');
        expect(month.nativeElement.textContent.trim()).toMatch('Jan');

        const formatOptions: any = { month: 'long', year: '2-digit' };
        const formatViews: any = { month: true, year: true };

        monthPicker.formatViews = formatViews;
        monthPicker.formatOptions = formatOptions;
        fixture.detectChanges();

        const march = dom.queryAll(By.css('.igx-calendar-view__item'))[2];

        expect(monthPicker.formatOptions).toEqual(jasmine.objectContaining(Object.assign(defaultOptions, formatOptions)));
        expect(monthPicker.formatViews).toEqual(jasmine.objectContaining(Object.assign(defaultViews, formatViews)));
        expect(yearBtn.nativeElement.textContent.trim()).toMatch('19');
        expect(march.nativeElement.textContent.trim()).toMatch('March');

        UIInteractions.simulateMouseDownEvent(yearBtn.nativeElement);
        fixture.detectChanges();
        const year = dom.queryAll(By.css('.igx-calendar-view__item'))[0];

        expect(year.nativeElement.textContent.trim()).toMatch('10');
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
        const month = dom.queryAll(By.css('.igx-calendar-view__item'))[2];

        expect(yearBtn.nativeElement.textContent.trim()).toMatch('2019');
        expect(month.nativeElement.textContent.trim()).toMatch('Mär');
    });

    it('should select a month on mousedown', () => {
        const fixture = TestBed.createComponent(IgxMonthPickerSampleComponent);
        fixture.detectChanges();

        const dom = fixture.debugElement;
        const monthPicker = fixture.componentInstance.monthPicker;

        const months = dom.queryAll(By.css('.igx-calendar-view__item'));

        spyOn(monthPicker.selected, 'emit');

        UIInteractions.simulateMouseDownEvent(months[2].nativeElement.firstChild);
        fixture.detectChanges();

        const currentMonth = dom.query(By.css('.igx-calendar-view__item--selected'));

        expect(monthPicker.selected.emit).toHaveBeenCalled();
        expect(currentMonth.nativeElement.textContent.trim()).toEqual('Mar');

        const nextDay = new Date(2019, 2, 1);
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

        const currentMonth = dom.query(By.css('.igx-calendar-view__item--selected'));
        const yearBtn = dom.query(By.css('.igx-calendar-picker__date'));

        expect(currentMonth.nativeElement.textContent.trim()).toEqual('Apr');
        expect(yearBtn.nativeElement.textContent.trim()).toMatch('2022');
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

        UIInteractions.simulateMouseDownEvent(prev.nativeElement);
        fixture.detectChanges();

        expect(monthPicker.viewDate.getFullYear()).toEqual(2018);
        expect(yearBtn.nativeElement.textContent.trim()).toMatch('2018');

        for (let i = 0; i < 3; i++) {
            UIInteractions.simulateMouseDownEvent(next.nativeElement);
        }

        fixture.detectChanges();

        expect(monthPicker.viewDate.getFullYear()).toEqual(2021);
        expect(yearBtn.nativeElement.textContent.trim()).toMatch('2021');
    });

    it('should navigate to the previous/next years.', () => {
        const fixture = TestBed.createComponent(IgxMonthPickerSampleComponent);
        fixture.detectChanges();

        const dom = fixture.debugElement;
        const monthPicker = fixture.componentInstance.monthPicker;
        const yearBtn = dom.query(By.css('.igx-calendar-picker__date'));
        UIInteractions.simulateMouseDownEvent(yearBtn.nativeElement);
        fixture.detectChanges();

        const prev = dom.query(By.css('.igx-calendar-picker__prev'));
        const next = dom.query(By.css('.igx-calendar-picker__next'));
        UIInteractions.simulateMouseDownEvent(next.nativeElement);
        fixture.detectChanges();

        expect(monthPicker.viewDate.getFullYear()).toEqual(2034);

        UIInteractions.simulateMouseDownEvent(prev.nativeElement);
        fixture.detectChanges();
        expect(monthPicker.viewDate.getFullYear()).toEqual(2019);
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

        UIInteractions.triggerKeyDownEvtUponElem('Enter', prev.nativeElement);
        fixture.detectChanges();

        expect(monthPicker.viewDate.getFullYear()).toEqual(2018);
        expect(yearBtn.nativeElement.textContent.trim()).toMatch('2018');

        next.nativeElement.focus();

        expect(next.nativeElement).toBe(document.activeElement);

        UIInteractions.triggerKeyDownEvtUponElem('Enter', next.nativeElement);
        UIInteractions.triggerKeyDownEvtUponElem('Enter', next.nativeElement);
        UIInteractions.triggerKeyDownEvtUponElem('Enter', next.nativeElement);
        fixture.detectChanges();

        expect(monthPicker.viewDate.getFullYear()).toEqual(2021);
        expect(yearBtn.nativeElement.textContent.trim()).toMatch('2021');
    });

    it('should navigate to the previous/next year via arrowLeft and arrowRight', () => {
        const fixture = TestBed.createComponent(IgxMonthPickerSampleComponent);
        fixture.detectChanges();

        const monthPicker = fixture.componentInstance.monthPicker;
        monthPicker.activeView = IgxCalendarView.Decade;
        fixture.detectChanges();

        const wrapper = fixture.debugElement.query(By.css('.igx-calendar__wrapper'));
        wrapper.nativeElement.focus();

        UIInteractions.triggerKeyDownEvtUponElem('ArrowLeft', wrapper.nativeElement);
        UIInteractions.triggerKeyDownEvtUponElem('Enter', wrapper.nativeElement);
        fixture.detectChanges();

        expect(monthPicker.viewDate.getFullYear()).toEqual(2018);

        UIInteractions.triggerKeyDownEvtUponElem('ArrowRight', wrapper.nativeElement);
        UIInteractions.triggerKeyDownEvtUponElem('Enter', wrapper.nativeElement);
        fixture.detectChanges();

        expect(monthPicker.viewDate.getFullYear()).toEqual(2018);
    });

    it('should not emit selected when navigating to the next year', () => {
        const fixture = TestBed.createComponent(IgxMonthPickerSampleComponent);
        fixture.detectChanges();

        const dom = fixture.debugElement;
        const monthPicker = fixture.componentInstance.monthPicker;
        spyOn(monthPicker.selected, 'emit').and.callThrough();

        const next = dom.query(By.css('.igx-calendar-picker__next'));
        let yearBtn = dom.query(By.css('.igx-calendar-picker__date'));
        expect(yearBtn.nativeElement.textContent.trim()).toMatch('2019');

        UIInteractions.simulateMouseDownEvent(next.nativeElement);
        fixture.detectChanges();

        UIInteractions.triggerKeyDownEvtUponElem('Enter', next.nativeElement);
        fixture.detectChanges();

        expect(monthPicker.selected.emit).toHaveBeenCalledTimes(0);
        yearBtn = dom.query(By.css('.igx-calendar-picker__date'));
        expect(yearBtn.nativeElement.textContent.trim()).toMatch('2021');
    });

    it('should not emit selected when navigating to the previous year', () => {
        const fixture = TestBed.createComponent(IgxMonthPickerSampleComponent);
        fixture.detectChanges();

        const dom = fixture.debugElement;
        const monthPicker = fixture.componentInstance.monthPicker;
        spyOn(monthPicker.selected, 'emit').and.callThrough();

        const prev = dom.query(By.css('.igx-calendar-picker__prev'));
        let yearBtn = dom.query(By.css('.igx-calendar-picker__date'));
        expect(yearBtn.nativeElement.textContent.trim()).toMatch('2019');

        UIInteractions.triggerKeyDownEvtUponElem('Enter', prev.nativeElement);
        fixture.detectChanges();

        UIInteractions.simulateMouseDownEvent(prev.nativeElement);
        fixture.detectChanges();

        expect(monthPicker.selected.emit).toHaveBeenCalledTimes(0);
        yearBtn = dom.query(By.css('.igx-calendar-picker__date'));
        expect(yearBtn.nativeElement.textContent.trim()).toMatch('2017');
    });

    it('should not emit selected when changing the year', () => {
        const fixture = TestBed.createComponent(IgxMonthPickerSampleComponent);
        fixture.detectChanges();

        const dom = fixture.debugElement;
        const monthPicker = fixture.componentInstance.monthPicker;
        spyOn(monthPicker.selected, 'emit').and.callThrough();

        let yearBtn = dom.query(By.css('.igx-calendar-picker__date'));
        expect(yearBtn.nativeElement.textContent.trim()).toMatch('2019');

        UIInteractions.simulateMouseDownEvent(yearBtn.nativeElement);
        fixture.detectChanges();

        const year = dom.query(By.css('.igx-calendar-view__item'));

        UIInteractions.simulateMouseDownEvent(year.nativeElement);
        fixture.detectChanges();

        expect(monthPicker.selected.emit).toHaveBeenCalledTimes(0);
        yearBtn = dom.query(By.css('.igx-calendar-picker__date'));
        expect(yearBtn.nativeElement.textContent.trim()).toMatch('2010');
    });

    it('should open years view, navigate through and select an year via KB.', () => {
        const fixture = TestBed.createComponent(IgxMonthPickerSampleComponent);
        fixture.detectChanges();

        const dom = fixture.debugElement;
        const monthPicker = fixture.componentInstance.monthPicker;
        monthPicker.activeView = IgxCalendarView.Decade;
        const wrapper = dom.query(By.css('.igx-calendar__wrapper'));
        wrapper.nativeElement.focus();
        fixture.detectChanges();

        let selectedYear = dom.query(By.css('.igx-calendar-view__item--selected'));
        expect(selectedYear.nativeElement.textContent.trim()).toMatch('2019');

        UIInteractions.triggerKeyDownEvtUponElem('ArrowDown' , document.activeElement);
        fixture.detectChanges();

        selectedYear = dom.query(By.css('.igx-calendar-view__item--selected'));
        expect(selectedYear.nativeElement.textContent.trim()).toMatch('2022');

        UIInteractions.triggerKeyDownEvtUponElem('ArrowUp' , document.activeElement);
        UIInteractions.triggerKeyDownEvtUponElem('ArrowUp' , document.activeElement);
        fixture.detectChanges();

        selectedYear = dom.query(By.css('.igx-calendar-view__item--selected'));
        expect(selectedYear.nativeElement.textContent.trim()).toMatch('2016');

        UIInteractions.triggerKeyDownEvtUponElem('Enter' , document.activeElement);
        fixture.detectChanges();

        expect(monthPicker.viewDate.getFullYear()).toEqual(2016);
    });

    it('should navigate through and select a month via KB.', () => {
        const fixture = TestBed.createComponent(IgxMonthPickerSampleComponent);
        fixture.detectChanges();

        const dom = fixture.debugElement;
        const monthPicker = fixture.componentInstance.monthPicker;

        const months = dom.queryAll(By.css('.igx-calendar-view__item'));
        let currentMonth = dom.query(By.css('.igx-calendar-view__item--selected'));

        expect(months.length).toEqual(12);
        expect(currentMonth.nativeElement.textContent.trim()).toMatch('Feb');

        const monthsView = dom.query(By.css('igx-months-view'));
        monthsView.nativeElement.focus();
        expect(monthsView.nativeElement).toBe(document.activeElement);

        UIInteractions.triggerKeyDownEvtUponElem('Home' , document.activeElement);
        fixture.detectChanges();
        currentMonth = dom.query(By.css('.igx-calendar-view__item--selected'));

        expect(months.at(0).nativeElement.classList).toContain('igx-calendar-view__item--selected');
        expect(currentMonth.nativeElement.textContent.trim()).toMatch('Jan');

        UIInteractions.triggerKeyDownEvtUponElem('End' , currentMonth.nativeElement );
        fixture.detectChanges();
        currentMonth = dom.query(By.css('.igx-calendar-view__item--selected'));

        expect(months.at(-1).nativeElement.classList).toContain('igx-calendar-view__item--selected');
        expect(currentMonth.nativeElement.textContent.trim()).toMatch('Dec');

        UIInteractions.triggerKeyDownEvtUponElem('ArrowLeft' , document.activeElement );
        fixture.detectChanges();

        UIInteractions.triggerKeyDownEvtUponElem('ArrowUp' , document.activeElement );
        fixture.detectChanges();

        UIInteractions.triggerKeyDownEvtUponElem('ArrowRight' , document.activeElement );
        fixture.detectChanges();
        currentMonth = dom.query(By.css('.igx-calendar-view__item--selected'));

        expect(currentMonth.nativeElement.textContent.trim()).toMatch('Sep');
        UIInteractions.triggerKeyDownEvtUponElem('Enter' , document.activeElement );
        fixture.detectChanges();

        expect(monthPicker.viewDate.getMonth()).toEqual(8);
    });

    it('should update the view date and throw viewDateChanged event on page changes', () => {
        const fixture = TestBed.createComponent(IgxMonthPickerSampleComponent);
        const monthPicker = fixture.componentInstance.monthPicker;
        spyOn(monthPicker.viewDateChanged, 'emit');
        fixture.detectChanges();

        const dom = fixture.debugElement;
        const view = dom.query(By.css('igx-months-view'));
        view.nativeElement.focus();
        fixture.detectChanges();

        // Change the current page to the previous year using keyboard navigation
        UIInteractions.triggerEventHandlerKeyDown('Home', view);
        UIInteractions.triggerEventHandlerKeyDown('ArrowLeft', view);
        fixture.detectChanges();

        expect(monthPicker.viewDateChanged.emit).toHaveBeenCalled();
        expect(monthPicker.viewDate.getFullYear()).toEqual(2018);

        // Change the current page to the next year using keyboard
        UIInteractions.triggerEventHandlerKeyDown('ArrowRight', view);
        fixture.detectChanges();

        expect(monthPicker.viewDateChanged.emit).toHaveBeenCalled();
        expect(monthPicker.viewDate.getFullYear()).toEqual(2019);
    });

    it('should emit an activeViewChanged event whenever the view changes', () => {
        const fixture = TestBed.createComponent(IgxMonthPickerSampleComponent);
        const monthPicker = fixture.componentInstance.monthPicker;
        spyOn(monthPicker.activeViewChanged, 'emit');
        fixture.detectChanges();

        const dom = fixture.debugElement;
        const yearBtn = dom.query(By.css('.igx-calendar-picker__date'));

        UIInteractions.simulateMouseDownEvent(yearBtn.nativeElement);
        fixture.detectChanges();

        expect(monthPicker.activeViewChanged.emit).toHaveBeenCalled();
        expect(monthPicker.activeView).toEqual('decade');

        const selectedYear = dom.query(By.css('.igx-calendar-view__item--selected'));
        UIInteractions.simulateMouseDownEvent(selectedYear.nativeElement.firstChild);
        fixture.detectChanges();

        expect(monthPicker.activeViewChanged.emit).toHaveBeenCalled();
        expect(monthPicker.activeView).toEqual('year');
    });

    it('should emit viewDateChanged event when changing year with arrow buttons', () => {
        const fixture = TestBed.createComponent(IgxMonthPickerSampleComponent);
        const monthPicker = fixture.componentInstance.monthPicker;
        spyOn(monthPicker.viewDateChanged, 'emit');

        fixture.detectChanges();

        const dom = fixture.debugElement;
        const prev = dom.query(By.css('.igx-calendar-picker__prev'));
        const next = dom.query(By.css('.igx-calendar-picker__next'));

        UIInteractions.simulateMouseDownEvent(prev.nativeElement);
        fixture.detectChanges();

        expect(monthPicker.viewDateChanged.emit).toHaveBeenCalledWith({
            previousValue: new Date(2019, 1, 1),
            currentValue: new Date(2018, 1, 1)
        });

        UIInteractions.simulateMouseDownEvent(next.nativeElement);
        UIInteractions.simulateMouseDownEvent(next.nativeElement);
        fixture.detectChanges();

        expect(monthPicker.viewDateChanged.emit).toHaveBeenCalledWith({
            previousValue: new Date(2018, 1, 1),
            currentValue: new Date(2019, 1, 1)
        });
    });
});

@Component({
    template: `<igx-month-picker [(ngModel)]="model"
                          [viewDate]="viewDate"
                          [formatOptions]="formatOptions"
                          [locale]="locale">
                </igx-month-picker>`,
    imports: [FormsModule, IgxMonthPickerComponent]
})
export class IgxMonthPickerSampleComponent {
    @ViewChild(IgxMonthPickerComponent, { static: true }) public monthPicker: IgxMonthPickerComponent;

    public model: Date = new Date(2019, 1, 7);
    public viewDate = new Date(2019, 1, 7);
    public locale = 'en';

    public formatOptions: IFormattingOptions = {
        day: 'numeric',
        month: 'short',
        weekday: 'short',
        year: 'numeric'
    };
}
