import { Component, ViewChild } from '@angular/core';
import { TestBed, async } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { configureTestSuite } from '../test-utils/configure-suite';
import { UIInteractions } from '../test-utils/ui-interactions.spec';
import { IgxCalendarComponent, IgxCalendarModule, WEEKDAYS } from './index';


describe('Multi-View Calendar - ', () => {
    let fixture, calendar;
    configureTestSuite();

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [MultiViewCalendarSampleComponent],
            imports: [IgxCalendarModule, FormsModule, NoopAnimationsModule]
        }).compileComponents();
    }));

    describe('Base Tests - ', () => {
        beforeEach(async(() => {
            fixture = TestBed.createComponent(MultiViewCalendarSampleComponent);
            fixture.detectChanges();
            calendar = fixture.componentInstance.calendar;
        }));

        it('should render properly when monthsViewNumber is initally set or changed runtime', () => {
            const today = new Date(Date.now());

            expect(calendar.monthsViewNumber).toBe(3);
            HelperTestFunctions.verifyMonthsViewNumber(fixture, 3);
            HelperTestFunctions.verifyCalendarHeader(fixture, today);

            calendar.monthsViewNumber = 4;
            fixture.detectChanges();

            expect(calendar.monthsViewNumber).toBe(4);
            HelperTestFunctions.verifyMonthsViewNumber(fixture, 4);
            HelperTestFunctions.verifyCalendarHeader(fixture, today);

            calendar.monthsViewNumber = 2;
            fixture.detectChanges();

            expect(calendar.monthsViewNumber).toBe(2);
            HelperTestFunctions.verifyMonthsViewNumber(fixture, 2);
            HelperTestFunctions.verifyCalendarHeader(fixture, today);
        });

        it('should  render properly if set monthsViewNumber to a value < 1', () => {
            pending('this should be fixed');
            expect(calendar.monthsViewNumber).toBe(3);
            HelperTestFunctions.verifyMonthsViewNumber(fixture, 3);

            calendar.monthsViewNumber = 0;
            fixture.detectChanges();

            expect(calendar.monthsViewNumber).toBe(3);
            HelperTestFunctions.verifyMonthsViewNumber(fixture, 3);

            calendar.monthsViewNumber = -3;
            fixture.detectChanges();

            expect(calendar.monthsViewNumber).toBe(3);
            HelperTestFunctions.verifyMonthsViewNumber(fixture, 3);
        });

        it('should change months views when viewDate is changed', () => {
            const dateJun = new Date('2019-06-19');
            const dateJul = new Date('2019-07-19');
            const dateAug = new Date('2019-08-19');
            const today = new Date(Date.now());
            expect(calendar.monthsViewNumber).toBe(3);
            HelperTestFunctions.verifyMonthsViewNumber(fixture, 3);

            calendar.viewDate = dateJun;
            fixture.detectChanges();

            expect(calendar.monthsViewNumber).toBe(3);
            HelperTestFunctions.verifyMonthsViewNumber(fixture, 3, dateJun);
            HelperTestFunctions.verifyCalendarHeader(fixture, today);
            HelperTestFunctions.verifyCalendarSubHeader(fixture, 1, dateJun);
            HelperTestFunctions.verifyCalendarSubHeader(fixture, 2, dateJul);
            HelperTestFunctions.verifyCalendarSubHeader(fixture, 3, dateAug);
        });

        it('should be able to change hideOutsideDays property runtime', () => {
            expect(calendar.hideOutsideDays).toBe(false);
            calendar.monthsViewNumber = 2;
            fixture.detectChanges();

            expect(calendar.monthsViewNumber).toBe(2);

            const firstDayView = HelperTestFunctions.getMonthView(fixture, 0);
            let firstInactiveDays = firstDayView.querySelectorAll(HelperTestFunctions.INACTIVE_DAYS_CSSCLASS);
            let hiddenDays = firstDayView.querySelectorAll(HelperTestFunctions.HIDDEN_DAYS_CSSCLASS);

            expect(firstInactiveDays.length).toBeGreaterThan(1);
            expect(hiddenDays.length).toBe(0);

            const secondDayView = HelperTestFunctions.getMonthView(fixture, 1);
            let secondInactiveDays = secondDayView.querySelectorAll(HelperTestFunctions.INACTIVE_DAYS_CSSCLASS);
            let secondHiddenDays = secondDayView.querySelectorAll(HelperTestFunctions.HIDDEN_DAYS_CSSCLASS);

            expect(secondInactiveDays.length).toBeGreaterThan(1);
            expect(secondHiddenDays.length).toBe(0);

            calendar.hideOutsideDays = true;
            fixture.detectChanges();

            firstInactiveDays = firstDayView.querySelectorAll(HelperTestFunctions.INACTIVE_DAYS_CSSCLASS);
            secondInactiveDays = secondDayView.querySelectorAll(HelperTestFunctions.INACTIVE_DAYS_CSSCLASS);
            hiddenDays = firstDayView.querySelectorAll(HelperTestFunctions.HIDDEN_DAYS_CSSCLASS);
            secondHiddenDays = secondDayView.querySelectorAll(HelperTestFunctions.HIDDEN_DAYS_CSSCLASS);

            expect(hiddenDays.length).toBe(firstInactiveDays.length);
            expect(secondHiddenDays.length).toBe(secondInactiveDays.length);
        });

        it('weeekStart should be properly set to all month views', () => {
            expect(calendar.weekStart).toBe(0);
            const firstMonth = HelperTestFunctions.getMonthView(fixture, 0);
            let startDay = firstMonth.querySelector(HelperTestFunctions.WEEKSTART_LABEL_CSSCLASS);
            expect(startDay.innerText.trim()).toEqual('Sun');

            calendar.weekStart = 1;
            fixture.detectChanges();

            expect(calendar.weekStart).toBe(1);
            startDay = firstMonth.querySelector(HelperTestFunctions.WEEKSTART_LABEL_CSSCLASS);
            expect(startDay.innerText.trim()).toEqual('Mon');

            const secondMonth = HelperTestFunctions.getMonthView(fixture, 1);
            startDay = secondMonth.querySelector(HelperTestFunctions.WEEKSTART_LABEL_CSSCLASS);
            expect(startDay.innerText.trim()).toEqual('Mon');
        });

        it('calendar can be vertical when monthsViewNumber is set', () => {
            calendar.vertical = true;
            fixture.detectChanges();

            const verticalCalendar = fixture.nativeElement.querySelector(HelperTestFunctions.VERICAL_CALENDAR_CSSCLASS);
            expect(verticalCalendar).not.toBeNull();
            const today = new Date(Date.now());

            expect(calendar.monthsViewNumber).toBe(3);
            HelperTestFunctions.verifyMonthsViewNumber(fixture, 3);
            HelperTestFunctions.verifyCalendarHeader(fixture, today);

            calendar.monthsViewNumber = 2;
            fixture.detectChanges();

            expect(calendar.monthsViewNumber).toBe(2);
            HelperTestFunctions.verifyMonthsViewNumber(fixture, 2);
            HelperTestFunctions.verifyCalendarHeader(fixture, today);
        });

        it('onSelection event should be fired when select a date', () => {
            spyOn(calendar.onSelection, 'emit');
            const viewDate = new Date('2019-09-06');
            calendar.viewDate = viewDate;
            fixture.detectChanges();

            const firstMonth = HelperTestFunctions.getMonthView(fixture, 0);
            const secondMonth = HelperTestFunctions.getMonthView(fixture, 1);
            const thirdMonth = HelperTestFunctions.getMonthView(fixture, 2);

            let dateEls = firstMonth.querySelectorAll(HelperTestFunctions.DAY_CSSCLASS);
            UIInteractions.simulateClickEvent(dateEls[15]);
            fixture.detectChanges();

            expect(calendar.onSelection.emit).toHaveBeenCalledTimes(1);
            expect(firstMonth.querySelector(HelperTestFunctions.SELECTED_DATE)).not.toBeNull();
            expect(secondMonth.querySelector(HelperTestFunctions.SELECTED_DATE)).toBeNull();
            expect(thirdMonth.querySelector(HelperTestFunctions.SELECTED_DATE)).toBeNull();

            dateEls = secondMonth.querySelectorAll(HelperTestFunctions.DAY_CSSCLASS);
            UIInteractions.simulateClickEvent(dateEls[21]);
            fixture.detectChanges();

            expect(calendar.onSelection.emit).toHaveBeenCalledTimes(2);
            expect(firstMonth.querySelector(HelperTestFunctions.SELECTED_DATE)).toBeNull();
            expect(secondMonth.querySelector(HelperTestFunctions.SELECTED_DATE)).not.toBeNull();
            expect(thirdMonth.querySelector(HelperTestFunctions.SELECTED_DATE)).toBeNull();

            dateEls = thirdMonth.querySelectorAll(HelperTestFunctions.DAY_CSSCLASS);
            UIInteractions.simulateClickEvent(dateEls[19]);
            fixture.detectChanges();

            expect(calendar.onSelection.emit).toHaveBeenCalledTimes(3);
            expect(firstMonth.querySelector(HelperTestFunctions.SELECTED_DATE)).toBeNull();
            expect(secondMonth.querySelector(HelperTestFunctions.SELECTED_DATE)).toBeNull();
            expect(thirdMonth.querySelector(HelperTestFunctions.SELECTED_DATE)).not.toBeNull();

        });
    });

    describe('KB Navigation test - ', () => {
        beforeEach(async(() => {
            fixture = TestBed.createComponent(MultiViewCalendarSampleComponent);
            fixture.detectChanges();
            calendar = fixture.componentInstance.calendar;
        }));


    });


});

class HelperTestFunctions {
    public static CURRENT_DATE_CSSCLASS = '.igx-calendar__date--current';
    public static DAYS_VIEW = 'igx-days-view';
    public static CALENDAR = 'igx-calendar';
    public static CALENDAR_HEADER_CSSCLASS = '.igx-calendar__header';
    public static CALENDAR_HEADER_YEAR_CSSCLASS = '.igx-calendar__header-year';
    public static CALENDAR_HEADER_DATE_CSSCLASS = '.igx-calendar__header-date';
    public static INACTIVE_DAYS_CSSCLASS = '.igx-calendar__date--inactive';
    public static HIDDEN_DAYS_CSSCLASS = '.igx-calendar__date--hidden';
    public static WEEKSTART_LABEL_CSSCLASS = '.igx-calendar__label';
    public static VERICAL_CALENDAR_CSSCLASS = '.igx-calendar--vertical';
    public static DAY_CSSCLASS = '.igx-calendar__date';
    public static SELECTED_DATE = '.igx-calendar__date--selected';

    public static verifyMonthsViewNumber(fixture, monthsView: number, viewDate?: Date) {
        const daysView = fixture.nativeElement.querySelectorAll(HelperTestFunctions.DAYS_VIEW);
        expect(daysView).toBeDefined();
        expect(daysView.length).toBe(monthsView);
        const monthPickers = HelperTestFunctions.getCalendarSubHeader(fixture).querySelectorAll('div');
        expect(monthPickers.length).toBe(monthsView + 2); // plus the navigation arrows
        if (!viewDate) {
            const currentDate = fixture.nativeElement.querySelector(HelperTestFunctions.CURRENT_DATE_CSSCLASS);
            expect(currentDate).not.toBeNull();
        }
    }

    public static verifyCalendarHeader(fixture, selectedDate: Date) {
        const daysView = fixture.nativeElement.querySelector(HelperTestFunctions.CALENDAR_HEADER_CSSCLASS);
        expect(daysView).not.toBeNull();
        const year = fixture.nativeElement.querySelector(HelperTestFunctions.CALENDAR_HEADER_YEAR_CSSCLASS);
        expect(year).not.toBeNull();
        expect(Number(year.innerText)).toEqual(selectedDate.getFullYear());
        const date = fixture.nativeElement.querySelector(HelperTestFunctions.CALENDAR_HEADER_DATE_CSSCLASS);
        expect(date).not.toBeNull();
        const dateParts = selectedDate.toUTCString().split(' '); // (weekday, date month year)
        expect(date.children[0].innerText.trim()).toEqual(dateParts[0]);
        expect(date.children[1].innerText.trim()).toEqual(dateParts[2] + ' ' + dateParts[1]);
    }

    public static verifyCalendarSubHeader(fixture, monthNumber: number, viewDate: Date) {
        const monthPickers = HelperTestFunctions.getCalendarSubHeader(fixture).querySelectorAll('div');
        const dateParts = viewDate.toString().split(' '); // weekday month day year
        expect(monthPickers[monthNumber].children[0].innerHTML.trim()).toEqual(dateParts[1]);
        expect(monthPickers[monthNumber].children[1].innerHTML.trim()).toEqual(dateParts[3]);
    }

    public static getCalendarSubHeader(fixture): HTMLElement {
        return fixture.nativeElement.querySelector('div.igx-calendar-picker');
    }

    public static getMonthView(fixture, monthsViewNumber: number) {
        return fixture.nativeElement.querySelectorAll('igx-days-view')[monthsViewNumber];
    }
}

@Component({
    template: `
        <igx-calendar [monthsViewNumber]="monthViews"></igx-calendar>
    `
})
export class MultiViewCalendarSampleComponent {
    @ViewChild(IgxCalendarComponent, { static: true }) public calendar: IgxCalendarComponent;
    public monthViews = 3;
}
