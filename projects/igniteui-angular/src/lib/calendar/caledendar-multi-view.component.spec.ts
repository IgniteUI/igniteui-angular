import { Component, ViewChild } from '@angular/core';
import { TestBed, async, fakeAsync, tick, flush } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { configureTestSuite } from '../test-utils/configure-suite';
import { UIInteractions } from '../test-utils/ui-interactions.spec';
import { IgxCalendarComponent, IgxCalendarModule, WEEKDAYS } from './index';
import { DateRangeType } from '../core/dates';


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

        it('should render properly when monthsViewNumber is initially set or changed runtime', () => {
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
            HelperTestFunctions.verifyCalendarSubHeaders(fixture, [dateJun, dateJul, dateAug]);
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

        it('weekStart should be properly set to all month views', () => {
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
        const date1 = new Date('2019-09-19');
        const date2 = new Date('2019-10-19');
        const date3 = new Date('2019-11-19');
        const date4 = new Date('2019-12-19');
        const date5 = new Date('2020-1-19');

        const dateRangeDescriptors = [
            { type: DateRangeType.Between, dateRange: [new Date(2019, 10, 15), new Date(2019, 11, 8)] },
            { type: DateRangeType.Between, dateRange: [new Date(2019, 11, 15), new Date(2020, 0, 11)] },
            { type: DateRangeType.Between, dateRange: [new Date(2020, 0, 19), new Date(2020, 0, 25)] },
            { type: DateRangeType.Between, dateRange: [new Date(2020, 1, 1), new Date(2020, 1, 15)] },
            { type: DateRangeType.Between, dateRange: [new Date(2020, 1, 25), new Date(2020, 2, 11)] }];

        beforeEach(fakeAsync(() => {
            fixture = TestBed.createComponent(MultiViewCalendarSampleComponent);
            fixture.detectChanges();
            calendar = fixture.componentInstance.calendar;
            const viewDate = new Date(2019, 9, 25);
            calendar.viewDate = viewDate;
            tick();
            fixture.detectChanges();
        }));

        it('Verify navigation with arrow up', fakeAsync(() => {
            const secondMonthDates = HelperTestFunctions.getMonthViewDates(fixture, 1);
            UIInteractions.simulateClickEvent(secondMonthDates[10]);
            fixture.detectChanges();
            tick();

            UIInteractions.simulateKeyDownEvent(secondMonthDates[10], 'ArrowUp');
            fixture.detectChanges();
            tick();

            expect(document.activeElement).toEqual(secondMonthDates[3]);

            UIInteractions.simulateKeyDownEvent(secondMonthDates[3], 'ArrowUp');
            fixture.detectChanges();
            tick();

            let firstMonthDates = HelperTestFunctions.getMonthViewDates(fixture, 0);
            expect(document.activeElement).toEqual(firstMonthDates[27]);

            UIInteractions.simulateKeyDownEvent(firstMonthDates[27], 'ArrowUp');
            fixture.detectChanges();
            tick();

            expect(document.activeElement).toEqual(firstMonthDates[20]);

            UIInteractions.simulateKeyDownEvent(firstMonthDates[20], 'ArrowUp');
            fixture.detectChanges();
            tick();

            expect(document.activeElement).toEqual(firstMonthDates[13]);

            UIInteractions.simulateKeyDownEvent(firstMonthDates[13], 'ArrowUp');
            fixture.detectChanges();
            tick();

            expect(document.activeElement).toEqual(firstMonthDates[6]);
            // Verify months are not changed
            HelperTestFunctions.verifyCalendarSubHeaders(fixture, [date2, date3, date4]);

            UIInteractions.simulateKeyDownEvent(firstMonthDates[6], 'ArrowUp');
            fixture.detectChanges();
            tick(600);

            firstMonthDates = HelperTestFunctions.getMonthViewDates(fixture, 0);
            expect(document.activeElement).toEqual(firstMonthDates[29]);
            // Verify months are changed
            HelperTestFunctions.verifyCalendarSubHeaders(fixture, [date1, date2, date3]);
        }));

        it('Verify navigation with arrow down', fakeAsync(() => {
            let monthDates = HelperTestFunctions.getMonthViewDates(fixture, 1);
            UIInteractions.simulateClickEvent(monthDates[22]);
            fixture.detectChanges();
            tick();

            UIInteractions.simulateKeyDownEvent(monthDates[22], 'ArrowDown');
            fixture.detectChanges();
            tick();

            expect(document.activeElement).toEqual(monthDates[29]);
            UIInteractions.simulateKeyDownEvent(monthDates[29], 'ArrowDown');
            fixture.detectChanges();
            tick();

            monthDates = HelperTestFunctions.getMonthViewDates(fixture, 2);
            expect(document.activeElement).toEqual(monthDates[5]);

            UIInteractions.simulateKeyDownEvent(monthDates[5], 'ArrowDown');
            fixture.detectChanges();
            tick();

            expect(document.activeElement).toEqual(monthDates[12]);

            UIInteractions.simulateKeyDownEvent(monthDates[12], 'ArrowDown');
            fixture.detectChanges();
            tick();

            expect(document.activeElement).toEqual(monthDates[19]);

            UIInteractions.simulateKeyDownEvent(monthDates[19], 'ArrowDown');
            fixture.detectChanges();
            tick();

            expect(document.activeElement).toEqual(monthDates[26]);
            // Verify months are not changed
            HelperTestFunctions.verifyCalendarSubHeaders(fixture, [date2, date3, date4]);

            UIInteractions.simulateKeyDownEvent(monthDates[26], 'ArrowDown');
            fixture.detectChanges();
            tick(600);

            monthDates = HelperTestFunctions.getMonthViewDates(fixture, 2);
            expect(document.activeElement).toEqual(monthDates[2]);
            // Verify months are changed
            HelperTestFunctions.verifyCalendarSubHeaders(fixture, [date3, date4, date5]);
        }));

        it('Verify navigation with arrow left', fakeAsync(() => {
            const secondMonthDates = HelperTestFunctions.getMonthViewDates(fixture, 1);
            UIInteractions.simulateClickEvent(secondMonthDates[1]);
            fixture.detectChanges();
            tick();

            UIInteractions.simulateKeyDownEvent(secondMonthDates[1], 'ArrowLeft');
            fixture.detectChanges();
            tick();

            expect(document.activeElement).toEqual(secondMonthDates[0]);

            UIInteractions.simulateKeyDownEvent(secondMonthDates[0], 'ArrowLeft');
            fixture.detectChanges();
            tick();

            let firstMonthDates = HelperTestFunctions.getMonthViewDates(fixture, 0);
            expect(document.activeElement).toEqual(firstMonthDates[30]);

            for (let index = 30; index > 0; index--) {
                UIInteractions.simulateKeyDownEvent(firstMonthDates[index], 'ArrowLeft');
                fixture.detectChanges();
                tick();

                expect(document.activeElement).toEqual(firstMonthDates[index - 1]);
            }

            // Verify months are not changed
            HelperTestFunctions.verifyCalendarSubHeaders(fixture, [date2, date3, date4]);

            UIInteractions.simulateKeyDownEvent(firstMonthDates[0], 'ArrowLeft');
            fixture.detectChanges();
            tick(600);

            firstMonthDates = HelperTestFunctions.getMonthViewDates(fixture, 0);
            expect(document.activeElement).toEqual(firstMonthDates[29]);
            // Verify months are changed
            HelperTestFunctions.verifyCalendarSubHeaders(fixture, [date1, date2, date3]);
        }));

        it('Verify navigation with arrow right', fakeAsync(() => {
            let monthDates = HelperTestFunctions.getMonthViewDates(fixture, 1);
            UIInteractions.simulateClickEvent(monthDates[20]);
            fixture.detectChanges();
            tick();

            for (let index = 20; index < 29; index++) {
                UIInteractions.simulateKeyDownEvent(monthDates[index], 'ArrowRight');
                fixture.detectChanges();
                tick();
                expect(document.activeElement).toEqual(monthDates[index + 1]);
            }

            UIInteractions.simulateKeyDownEvent(monthDates[29], 'ArrowRight');
            fixture.detectChanges();
            tick();

            monthDates = HelperTestFunctions.getMonthViewDates(fixture, 2);
            expect(document.activeElement).toEqual(monthDates[0]);

            for (let index = 0; index < 30; index++) {
                UIInteractions.simulateKeyDownEvent(monthDates[index], 'ArrowRight');
                fixture.detectChanges();
                tick();
                expect(document.activeElement).toEqual(monthDates[index + 1]);
            }

            // Verify months are not changed
            HelperTestFunctions.verifyCalendarSubHeaders(fixture, [date2, date3, date4]);

            UIInteractions.simulateKeyDownEvent(monthDates[30], 'ArrowRight');
            fixture.detectChanges();
            tick(600);

            monthDates = HelperTestFunctions.getMonthViewDates(fixture, 2);
            expect(document.activeElement).toEqual(monthDates[0]);
            // Verify months are changed
            HelperTestFunctions.verifyCalendarSubHeaders(fixture, [date3, date4, date5]);
        }));


        it('Verify navigation with arrow up when there are disabled dates', fakeAsync(() => {
            calendar.viewDate = new Date(2019, 11, 25);
            calendar.disabledDates = dateRangeDescriptors;
            fixture.detectChanges();
            tick();

            const secondMonthDates = HelperTestFunctions.getMonthViewDates(fixture, 1);
            UIInteractions.simulateClickEvent(secondMonthDates[27]);
            fixture.detectChanges();
            tick();

            UIInteractions.simulateKeyDownEvent(secondMonthDates[27], 'ArrowUp');
            fixture.detectChanges();
            tick();

            expect(document.activeElement).toEqual(secondMonthDates[13]);

            UIInteractions.simulateKeyDownEvent(secondMonthDates[13], 'ArrowUp');
            fixture.detectChanges();
            tick();

            let firstMonthDates = HelperTestFunctions.getMonthViewDates(fixture, 0);
            expect(document.activeElement).toEqual(firstMonthDates[9]);
            // Verify months are not changed
            HelperTestFunctions.verifyCalendarSubHeaders(fixture, [date2, date3, date4]);

            UIInteractions.simulateKeyDownEvent(secondMonthDates[9], 'ArrowUp');
            fixture.detectChanges();
            tick(600);

            firstMonthDates = HelperTestFunctions.getMonthViewDates(fixture, 0);
            expect(document.activeElement).toEqual(firstMonthDates[11]);
            // Verify months are changed
            HelperTestFunctions.verifyCalendarSubHeaders(fixture, [date1, date2, date3]);
        }));

        it('Verify navigation with arrow down when there are disabled dates', fakeAsync(() => {
            calendar.viewDate = new Date(2019, 11, 25);
            calendar.disabledDates = dateRangeDescriptors;
            fixture.detectChanges();
            tick();

            const secondMonthDates = HelperTestFunctions.getMonthViewDates(fixture, 1);
            UIInteractions.simulateClickEvent(secondMonthDates[16]);
            fixture.detectChanges();
            tick();

            UIInteractions.simulateKeyDownEvent(secondMonthDates[16], 'ArrowDown');
            fixture.detectChanges();
            tick();

            expect(document.activeElement).toEqual(secondMonthDates[30]);

            UIInteractions.simulateKeyDownEvent(secondMonthDates[30], 'ArrowDown');
            fixture.detectChanges();
            tick();

            let monthDates = HelperTestFunctions.getMonthViewDates(fixture, 2);
            expect(document.activeElement).toEqual(monthDates[15]);
            // Verify months are not changed
            HelperTestFunctions.verifyCalendarSubHeaders(fixture, [date2, date3, date4]);

            UIInteractions.simulateKeyDownEvent(secondMonthDates[20], 'ArrowDown');
            fixture.detectChanges();
            tick(600);

            monthDates = HelperTestFunctions.getMonthViewDates(fixture, 2);
            expect(document.activeElement).toEqual(monthDates[12]);
            // Verify months are changed
            HelperTestFunctions.verifyCalendarSubHeaders(fixture, [date3, date4, date5]);
        }));

        it('Verify navigation with arrow left when there are disabled dates', fakeAsync(() => {
            calendar.viewDate = new Date(2019, 11, 25);
            calendar.disabledDates = dateRangeDescriptors;
            fixture.detectChanges();
            tick();

            const secondMonthDates = HelperTestFunctions.getMonthViewDates(fixture, 1);
            UIInteractions.simulateClickEvent(secondMonthDates[25]);
            fixture.detectChanges();
            tick();

            UIInteractions.simulateKeyDownEvent(secondMonthDates[25], 'ArrowLeft');
            fixture.detectChanges();
            tick();

            expect(document.activeElement).toEqual(secondMonthDates[17]);

            for (let index = 17; index > 11; index--) {
                UIInteractions.simulateKeyDownEvent(secondMonthDates[index], 'ArrowLeft');
                fixture.detectChanges();
                tick();

                expect(document.activeElement).toEqual(secondMonthDates[index - 1]);
            }

            UIInteractions.simulateKeyDownEvent(secondMonthDates[11], 'ArrowLeft');
            fixture.detectChanges();
            tick();

            let firstMonthDates = HelperTestFunctions.getMonthViewDates(fixture, 0);
            expect(document.activeElement).toEqual(firstMonthDates[13]);

            for (let index = 13; index > 8; index--) {
                UIInteractions.simulateKeyDownEvent(firstMonthDates[index], 'ArrowLeft');
                fixture.detectChanges();
                tick();

                expect(document.activeElement).toEqual(firstMonthDates[index - 1]);
            }

            // Verify months are not changed
            HelperTestFunctions.verifyCalendarSubHeaders(fixture, [date2, date3, date4]);

            UIInteractions.simulateKeyDownEvent(firstMonthDates[8], 'ArrowLeft');
            fixture.detectChanges();
            tick(600);

            firstMonthDates = HelperTestFunctions.getMonthViewDates(fixture, 0);
            expect(document.activeElement).toEqual(firstMonthDates[29]);
            // Verify months are changed
            HelperTestFunctions.verifyCalendarSubHeaders(fixture, [date1, date2, date3]);
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

    public static verifyCalendarSubHeaders(fixture, viewDates: Date[]) {
        const monthPickers = HelperTestFunctions.getCalendarSubHeader(fixture).querySelectorAll('div.ng-star-inserted');
        expect(monthPickers.length).toEqual(viewDates.length);
        for (let index = 0; index < viewDates.length; index++) {
            const dateParts = viewDates[index].toString().split(' '); // weekday month day year
            expect(monthPickers[index].children[0].innerHTML.trim()).toEqual(dateParts[1]);
            expect(monthPickers[index].children[1].innerHTML.trim()).toEqual(dateParts[3]);
        }
    }

    public static getCalendarSubHeader(fixture): HTMLElement {
        return fixture.nativeElement.querySelector('div.igx-calendar-picker');
    }

    public static getMonthView(fixture, monthsViewNumber: number) {
        return fixture.nativeElement.querySelectorAll('igx-days-view')[monthsViewNumber];
    }

    public static getMonthViewDates(fixture, monthsViewNumber: number) {
        const month = HelperTestFunctions.getMonthView(fixture, monthsViewNumber);
        return month.querySelectorAll(HelperTestFunctions.DAY_CSSCLASS);
    }

    public static getMonthViewSelectedDates(fixture, monthsViewNumber: number) {
        const month = HelperTestFunctions.getMonthView(fixture, monthsViewNumber);
        return month.querySelectorAll(HelperTestFunctions.SELECTED_DATE);
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
