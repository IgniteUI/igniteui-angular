import { Component, ViewChild } from '@angular/core';
import { TestBed, async, fakeAsync, tick } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { configureTestSuite } from '../test-utils/configure-suite';
import { UIInteractions } from '../test-utils/ui-interactions.spec';
import { IgxCalendarComponent, IgxCalendarModule, WEEKDAYS } from './index';
import { IgxDatePickerComponent, IgxDatePickerModule } from '../date-picker/date-picker.component';
import { DateRangeType } from '../core/dates';


describe('Multi-View Calendar - ', () => {
    let fixture, calendar;
    configureTestSuite();

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [MultiViewCalendarSampleComponent, MultiViewDatePickerSampleComponent],
            imports: [IgxCalendarModule, IgxDatePickerModule, FormsModule, NoopAnimationsModule]
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

            let firstInactiveDays = HelperTestFunctions.getInactiveDays(fixture, 0);
            let hiddenDays = HelperTestFunctions.getHiidenDays(fixture, 0);

            expect(firstInactiveDays.length).toBeGreaterThan(1);
            expect(hiddenDays.length).toBe(0);

            let secondInactiveDays = HelperTestFunctions.getInactiveDays(fixture, 1);
            let secondHiddenDays = HelperTestFunctions.getHiidenDays(fixture, 1);

            expect(secondInactiveDays.length).toBeGreaterThan(1);
            expect(secondHiddenDays.length).toBe(0);

            calendar.hideOutsideDays = true;
            fixture.detectChanges();

            firstInactiveDays = HelperTestFunctions.getInactiveDays(fixture, 0);
            secondInactiveDays = HelperTestFunctions.getInactiveDays(fixture, 1);
            hiddenDays = HelperTestFunctions.getHiidenDays(fixture, 0);
            secondHiddenDays = HelperTestFunctions.getHiidenDays(fixture, 1);

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

            let dateEls = HelperTestFunctions.getMonthViewDates(fixture, 0);
            UIInteractions.simulateClickEvent(dateEls[15]);
            fixture.detectChanges();

            expect(calendar.onSelection.emit).toHaveBeenCalledTimes(1);
            expect(HelperTestFunctions.getMonthViewSelectedDates(fixture, 0).length).toBe(1);
            expect(HelperTestFunctions.getMonthViewSelectedDates(fixture, 1).length).toBe(0);
            expect(HelperTestFunctions.getMonthViewSelectedDates(fixture, 2).length).toBe(0);

            dateEls = HelperTestFunctions.getMonthViewDates(fixture, 1);
            UIInteractions.simulateClickEvent(dateEls[21]);
            fixture.detectChanges();

            expect(calendar.onSelection.emit).toHaveBeenCalledTimes(2);
            expect(HelperTestFunctions.getMonthViewSelectedDates(fixture, 0).length).toBe(0);
            expect(HelperTestFunctions.getMonthViewSelectedDates(fixture, 1).length).toBe(1);
            expect(HelperTestFunctions.getMonthViewSelectedDates(fixture, 2).length).toBe(0);

            dateEls = HelperTestFunctions.getMonthViewDates(fixture, 2);
            UIInteractions.simulateClickEvent(dateEls[19]);
            fixture.detectChanges();

            expect(calendar.onSelection.emit).toHaveBeenCalledTimes(3);
            expect(HelperTestFunctions.getMonthViewSelectedDates(fixture, 0).length).toBe(0);
            expect(HelperTestFunctions.getMonthViewSelectedDates(fixture, 1).length).toBe(0);
            expect(HelperTestFunctions.getMonthViewSelectedDates(fixture, 2).length).toBe(1);
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

    describe('Selection tests - ', () => {
        const septemberDate = new Date('2019-09-16');
        const octoberDate = new Date('2019-10-16');
        const novemberDate = new Date('2019-11-16');
        beforeEach(fakeAsync(() => {
            fixture = TestBed.createComponent(MultiViewCalendarSampleComponent);
            fixture.detectChanges();
            calendar = fixture.componentInstance.calendar;
            calendar.viewDate = new Date(2019, 8, 1); // 1st September 2019
            tick();
            fixture.detectChanges();
        }));


        it('days should be selected in all month views, when hideOutsideDays is false and selection is single/multi', () =>  {
            spyOn(calendar.onSelection, 'emit');
            expect(calendar.hideOutsideDays).toBe(false);
            const fistMonthDates = HelperTestFunctions.getMonthViewDates(fixture, 0);
            const secondMonthDates = HelperTestFunctions.getMonthViewDates(fixture, 1);
            UIInteractions.simulateClickEvent(fistMonthDates[29]);
            fixture.detectChanges();

            expect(calendar.onSelection.emit).toHaveBeenCalledTimes(1);
            expect(HelperTestFunctions.getMonthViewSelectedDates(fixture, 0).length).toBe(1);
            expect(HelperTestFunctions.getMonthViewSelectedDates(fixture, 1).length).toBe(1);

            calendar.selection = 'multi';
            fixture.detectChanges();

            expect(HelperTestFunctions.getMonthViewSelectedDates(fixture, 0).length).toBe(0);
            expect(HelperTestFunctions.getMonthViewSelectedDates(fixture, 1).length).toBe(0);

            UIInteractions.simulateClickEvent(secondMonthDates[2]);
            fixture.detectChanges();
            UIInteractions.simulateClickEvent(secondMonthDates[3]);
            fixture.detectChanges();
            UIInteractions.simulateClickEvent(secondMonthDates[28]);
            fixture.detectChanges();
            UIInteractions.simulateClickEvent(secondMonthDates[29]);
            fixture.detectChanges();

            expect(calendar.onSelection.emit).toHaveBeenCalledTimes(5);
            expect(HelperTestFunctions.getMonthViewSelectedDates(fixture, 0).length).toBe(2);
            expect(HelperTestFunctions.getMonthViewSelectedDates(fixture, 1).length).toBe(4);
            expect(HelperTestFunctions.getMonthViewSelectedDates(fixture, 2).length).toBe(2);

            calendar.hideOutsideDays = true;
            fixture.detectChanges();

            expect(HelperTestFunctions.getMonthViewSelectedDates(fixture, 0).length).toBe(0);
            expect(HelperTestFunctions.getMonthViewSelectedDates(fixture, 1).length).toBe(4);
            expect(HelperTestFunctions.getMonthViewSelectedDates(fixture, 2).length).toBe(0);
        });

        it('Multi Selecion - Select/Deselect date from one view should also select/deselect the date in the another', () =>  {
            spyOn(calendar.onSelection, 'emit');
            expect(calendar.hideOutsideDays).toBe(false);
            calendar.selection = 'multi';
            fixture.detectChanges();

            const octoberfourth = new Date('2019-10-4');
            const octoberthird = new Date('2019-10-3');
            const secondMonthDates = HelperTestFunctions.getMonthViewDates(fixture, 1);
            UIInteractions.simulateClickEvent(secondMonthDates[2]);
            fixture.detectChanges();
            calendar.selectDate(octoberfourth);
            fixture.detectChanges();

            expect(calendar.onSelection.emit).toHaveBeenCalledTimes(1);
            expect(HelperTestFunctions.getMonthViewSelectedDates(fixture, 0).length).toBe(2);
            expect(HelperTestFunctions.getMonthViewSelectedDates(fixture, 1).length).toBe(2);

            UIInteractions.simulateClickEvent(secondMonthDates[3]);
            fixture.detectChanges();

            expect(calendar.onSelection.emit).toHaveBeenCalledTimes(2);
            expect(HelperTestFunctions.getMonthViewSelectedDates(fixture, 0).length).toBe(1);
            expect(HelperTestFunctions.getMonthViewSelectedDates(fixture, 1).length).toBe(1);

            calendar.deselectDate([octoberthird]); // bug
            fixture.detectChanges();

            expect(calendar.onSelection.emit).toHaveBeenCalledTimes(2);
            expect(HelperTestFunctions.getMonthViewSelectedDates(fixture, 0).length).toBe(0);
            expect(HelperTestFunctions.getMonthViewSelectedDates(fixture, 1).length).toBe(0);
        });

        it('Multi/Single Selecion - select multiple dates should not create range', () =>  {
            spyOn(calendar.onSelection, 'emit');
            expect(calendar.hideOutsideDays).toBe(false);
            calendar.selection = 'multi';
            fixture.detectChanges();

            calendar.selectDate([new Date('2019-10-29'), new Date('2019-11-2'), new Date('2019-10-31'),
                new Date('2019-11-1'), new Date('2019-10-30')]);
                fixture.detectChanges();
            expect(HelperTestFunctions.getMonthViewSelectedDates(fixture, 1).length).toBe(5);
            expect(HelperTestFunctions.getMonthViewSelectedDates(fixture, 2).length).toBe(5);
            HelperTestFunctions.verifyNoRangeSelectionCreated(fixture, 1);
            HelperTestFunctions.verifyNoRangeSelectionCreated(fixture, 2);

            calendar.selection = 'single';
            fixture.detectChanges();
            calendar.selectDate(new Date('2019-10-29'));
            fixture.detectChanges();
            calendar.selectDate(new Date('2019-10-30'));
            fixture.detectChanges();

            expect(HelperTestFunctions.getMonthViewSelectedDates(fixture, 1).length).toBe(1);
            expect(HelperTestFunctions.getMonthViewSelectedDates(fixture, 2).length).toBe(1);
            HelperTestFunctions.verifyNoRangeSelectionCreated(fixture, 1);
            HelperTestFunctions.verifyNoRangeSelectionCreated(fixture, 2);
        });

        it('outside month days should be hidden when hideOutsideDays is true', () =>  {
            calendar.monthsViewNumber = 2;
            fixture.detectChanges();

            expect(calendar.hideOutsideDays).toBe(false);
            expect(HelperTestFunctions.getHiidenDays(fixture, 0).length).toBe(0);
            expect(HelperTestFunctions.getHiidenDays(fixture, 1).length).toBe(0);

            calendar.hideOutsideDays = true;
            fixture.detectChanges();

            const firstMonthInactiveDays = HelperTestFunctions.getInactiveDays(fixture, 0).length;
            const secondMonthInactiveDays = HelperTestFunctions.getInactiveDays(fixture, 1).length;
            expect(HelperTestFunctions.getHiidenDays(fixture, 0).length).toBe(firstMonthInactiveDays);
            expect(HelperTestFunctions.getHiidenDays(fixture, 1).length).toBe(secondMonthInactiveDays);

            calendar.selection = 'multi';
            fixture.detectChanges();
            expect(HelperTestFunctions.getHiidenDays(fixture, 0).length).toBe(firstMonthInactiveDays);
            expect(HelperTestFunctions.getHiidenDays(fixture, 1).length).toBe(secondMonthInactiveDays);

            calendar.selection = 'range';
            fixture.detectChanges();
            expect(HelperTestFunctions.getHiidenDays(fixture, 0).length).toBe(firstMonthInactiveDays);
            expect(HelperTestFunctions.getHiidenDays(fixture, 1).length).toBe(secondMonthInactiveDays);
        });

        it('should change days view when selecting an outside day', () => {
            calendar.monthsViewNumber = 2;
            fixture.detectChanges();
            HelperTestFunctions.verifyCalendarSubHeaders(fixture, [septemberDate, octoberDate]);

            const inactiveDays = HelperTestFunctions.getInactiveDays(fixture, 0);
            UIInteractions.simulateClickEvent(inactiveDays[5]);
            fixture.detectChanges();

            HelperTestFunctions.verifyCalendarSubHeaders(fixture, [octoberDate, novemberDate]);

            const inactiveDaysOctober = HelperTestFunctions.getInactiveDays(fixture, 0);
            UIInteractions.simulateClickEvent(inactiveDaysOctober[0]);
            fixture.detectChanges();

            HelperTestFunctions.verifyCalendarSubHeaders(fixture, [septemberDate, octoberDate]);
        });

        it('Single Selection - Verify API methods selectDate and deselectDate', () => {
            expect(calendar.selection).toEqual('single');

            calendar.selectDate(septemberDate);
            fixture.detectChanges();
            expect(HelperTestFunctions.getMonthViewSelectedDates(fixture, 0).length).toBe(1);

            calendar.deselectDate(septemberDate);
            fixture.detectChanges();
            expect(HelperTestFunctions.getMonthViewSelectedDates(fixture, 0).length).toBe(0);

            calendar.selectDate(octoberDate);
            fixture.detectChanges();
            expect(HelperTestFunctions.getMonthViewSelectedDates(fixture, 1).length).toBe(1);

            calendar.deselectDate();
            fixture.detectChanges();
            expect(HelperTestFunctions.getMonthViewSelectedDates(fixture, 1).length).toBe(0);
        });

        it('Multi Selection - Verify API methods selectDate and deselectDate', () => {
            calendar.selection = 'multi';
            fixture.detectChanges();
            expect(calendar.selection).toEqual('multi');

            calendar.selectDate([septemberDate]);
            fixture.detectChanges();
            calendar.selectDate([new Date('2019-09-21')]);
            fixture.detectChanges();

            expect(HelperTestFunctions.getMonthViewSelectedDates(fixture, 0).length).toBe(2);


            calendar.deselectDate([septemberDate, new Date('2019-09-21')]);
            fixture.detectChanges();
            expect(HelperTestFunctions.getMonthViewSelectedDates(fixture, 0).length).toBe(0);

            calendar.selectDate([septemberDate, new Date('2019-10-24'), octoberDate, novemberDate]);
            fixture.detectChanges();

            expect(HelperTestFunctions.getMonthViewSelectedDates(fixture, 1).length).toBe(2); // october
            expect(HelperTestFunctions.getMonthViewSelectedDates(fixture, 0).length).toBe(1); // september
            expect(HelperTestFunctions.getMonthViewSelectedDates(fixture, 2).length).toBe(1); // november

            calendar.deselectDate();
            fixture.detectChanges();
            expect(HelperTestFunctions.getMonthViewSelectedDates(fixture, 1).length).toBe(0); // october
            expect(HelperTestFunctions.getMonthViewSelectedDates(fixture, 0).length).toBe(0); // september
            expect(HelperTestFunctions.getMonthViewSelectedDates(fixture, 2).length).toBe(0); // november
        });

        it('Range Selection - Verify API methods selectDate and deselectDate', () => {
            calendar.selection = 'range';
            calendar.hideOutsideDays = true;
            fixture.detectChanges();
            expect(calendar.selection).toEqual('range');

            calendar.selectDate([octoberDate, septemberDate, novemberDate]);
            fixture.detectChanges();

            expect(HelperTestFunctions.getMonthViewSelectedDates(fixture, 1).length).toBe(31); // october
            expect(HelperTestFunctions.getMonthViewSelectedDates(fixture, 0).length).toBe(15); // september
            expect(HelperTestFunctions.getMonthViewSelectedDates(fixture, 2).length).toBe(16); // november

            calendar.deselectDate([octoberDate, septemberDate, novemberDate]);
            fixture.detectChanges();

            expect(HelperTestFunctions.getMonthViewSelectedDates(fixture, 1).length).toBe(0); // october
            expect(HelperTestFunctions.getMonthViewSelectedDates(fixture, 0).length).toBe(0); // september
            expect(HelperTestFunctions.getMonthViewSelectedDates(fixture, 2).length).toBe(0); // november
        });

        it('ouside days should NOT be selected in all month views, when hideOutsideDays is false and selection is range', () =>  {
            pending('refactoring');
            spyOn(calendar.onSelection, 'emit');
            calendar.selection = 'range';
            fixture.detectChanges();

            const secondMonthDates = HelperTestFunctions.getMonthViewDates(fixture, 1);
            UIInteractions.simulateClickEvent(secondMonthDates[0]);
            fixture.detectChanges();

            expect(calendar.onSelection.emit).toHaveBeenCalledTimes(1);
            expect(HelperTestFunctions.getSelectedDatesInRangeCalendar(fixture, 0).length).toBe(0);
            expect(HelperTestFunctions.getSelectedDatesInRangeCalendar(fixture, 1).length).toBe(1);

            UIInteractions.simulateClickEvent(secondMonthDates[30]);
            fixture.detectChanges();
            expect(calendar.onSelection.emit).toHaveBeenCalledTimes(2);

            expect(HelperTestFunctions.getSelectedDatesInRangeCalendar(fixture, 0).length).toBe(0);
            expect(HelperTestFunctions.getSelectedDatesInRangeCalendar(fixture, 1).length).toBe(31);
            expect(HelperTestFunctions.getSelectedDatesInRangeCalendar(fixture, 2).length).toBe(0);
        });
    });

    describe('DatePicker/Calendar Integration Tests - ', () => {
        let datePicker;
        beforeEach(fakeAsync(() => {
            fixture = TestBed.createComponent(MultiViewDatePickerSampleComponent);
            fixture.detectChanges();
            datePicker = fixture.componentInstance.datePicker;
        }));
        afterEach(() => {
            UIInteractions.clearOverlay();
        });

        it('Verify opening Multi View Calendar from datepicker', fakeAsync(() => {
            let target = fixture.nativeElement.querySelector('.igx-icon');
            UIInteractions.clickElement(target);
            tick(400);
            fixture.detectChanges();

            let overlay = document.querySelector('.igx-overlay');
            HelperTestFunctions.verifyMonthsViewNumber(overlay, 3, new Date('2019-09-16'));
            HelperTestFunctions.verifyCalendarSubHeaders(overlay, [new Date('2019-09-16'), new Date('2019-10-16'), new Date('2019-11-16')]);

            // close the datePicker
            const overlayDiv = document.getElementsByClassName('igx-overlay__wrapper--modal')[0];
            UIInteractions.clickElement(overlayDiv);
            tick(400);
            fixture.detectChanges();

            datePicker.mode = 'dropdown';
            datePicker.monthsViewNumber = 2;
            tick();
            fixture.detectChanges();

            target = fixture.nativeElement.querySelector('.igx-icon');
            UIInteractions.clickElement(target);
            tick(400);
            fixture.detectChanges();

            overlay = document.querySelector('.igx-overlay');
            HelperTestFunctions.verifyMonthsViewNumber(overlay, 2, new Date('2019-09-16'));
            HelperTestFunctions.verifyCalendarSubHeaders(overlay, [new Date('2019-09-16'), new Date('2019-10-16')]);
        }));

        it('Verify setting hideOutsideDays and monthsViewNumber from datepicker', fakeAsync(() => {
            const target = fixture.nativeElement.querySelector('.igx-icon');
            UIInteractions.clickElement(target);
            tick(400);
            fixture.detectChanges();

            expect(datePicker.hideOutsideDays).toBe(true);
            let overlay = document.querySelector('.igx-overlay');
            expect(HelperTestFunctions.getHiidenDays(overlay, 0).length).toBe(HelperTestFunctions.getInactiveDays(overlay, 0).length);
            expect(HelperTestFunctions.getHiidenDays(overlay, 1).length).toBe(HelperTestFunctions.getInactiveDays(overlay, 1).length);
            expect(HelperTestFunctions.getHiidenDays(overlay, 2).length).toBe(HelperTestFunctions.getInactiveDays(overlay, 2).length);

            // close the datePicker
            const overlayDiv = document.getElementsByClassName('igx-overlay__wrapper--modal')[0];
            UIInteractions.clickElement(overlayDiv);
            tick(400);
            fixture.detectChanges();

            datePicker.hideOutsideDays = false;
            tick();
            fixture.detectChanges();

            UIInteractions.clickElement(target);
            tick(400);
            fixture.detectChanges();

            expect(datePicker.hideOutsideDays).toBe(false);
            overlay = document.querySelector('.igx-overlay');
            expect(HelperTestFunctions.getHiidenDays(overlay, 0).length).toBe(0);
            expect(HelperTestFunctions.getHiidenDays(overlay, 1).length).toBe(0);
            expect(HelperTestFunctions.getHiidenDays(overlay, 2).length).toBe(0);
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
        const el = fixture.nativeElement ? fixture.nativeElement : fixture;
        const daysView = el.querySelectorAll(HelperTestFunctions.DAYS_VIEW);
        expect(daysView).toBeDefined();
        expect(daysView.length).toBe(monthsView);
        const monthPickers = HelperTestFunctions.getCalendarSubHeader(el).querySelectorAll('div');
        expect(monthPickers.length).toBe(monthsView + 2); // plus the navigation arrows
        if (!viewDate) {
            const currentDate = el.querySelector(HelperTestFunctions.CURRENT_DATE_CSSCLASS);
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
        expect(date.children[1].innerText.trim()).toEqual(dateParts[2] + ' ' + Number(dateParts[1]));
    }

    public static verifyNoRangeSelectionCreated(fixture, monthNumber: number) {
        expect(HelperTestFunctions.getMonthView(fixture, monthNumber).querySelector('.igx-calendar__date--range')).toBeNull();
        expect(HelperTestFunctions.getMonthView(fixture, monthNumber).querySelector('.igx-calendar__date--first')).toBeNull();
        expect(HelperTestFunctions.getMonthView(fixture, monthNumber).querySelector('.igx-calendar__date--last')).toBeNull();
    }

    public static verifyCalendarSubHeader(fixture, monthNumber: number, viewDate: Date) {
        const monthPickers = HelperTestFunctions.getCalendarSubHeader(fixture).querySelectorAll('div');
        const dateParts = viewDate.toString().split(' '); // weekday month day year
        expect(monthPickers[monthNumber].children[0].innerHTML.trim()).toEqual(dateParts[1]);
        expect(monthPickers[monthNumber].children[1].innerHTML.trim()).toEqual(dateParts[3]);
    }

    public static verifyCalendarSubHeaders(fixture, viewDates: Date[]) {
        const dom = fixture.nativeElement ? fixture.nativeElement : fixture;
        const monthPickers = HelperTestFunctions.getCalendarSubHeader(dom).querySelectorAll('div.ng-star-inserted');
        expect(monthPickers.length).toEqual(viewDates.length);
        for (let index = 0; index < viewDates.length; index++) {
            const dateParts = viewDates[index].toString().split(' '); // weekday month day year
            expect(monthPickers[index].children[0].innerHTML.trim()).toEqual(dateParts[1]);
            expect(monthPickers[index].children[1].innerHTML.trim()).toEqual(dateParts[3]);
        }
    }

    public static getHiidenDays(fixture, monthNumber: number) {
        const monthView = HelperTestFunctions.getMonthView(fixture, monthNumber);
        return monthView.querySelectorAll(HelperTestFunctions.HIDDEN_DAYS_CSSCLASS);
    }

    public static getInactiveDays(fixture, monthNumber: number) {
        const monthView = HelperTestFunctions.getMonthView(fixture, monthNumber);
        return monthView.querySelectorAll(HelperTestFunctions.INACTIVE_DAYS_CSSCLASS);
    }

    public static getCalendarSubHeader(fixture): HTMLElement {
        const element = fixture.nativeElement ? fixture.nativeElement : fixture;
        return element.querySelector('div.igx-calendar-picker');
    }

    public static getMonthView(fixture, monthsViewNumber: number) {
        const domEL = fixture.nativeElement ? fixture.nativeElement : fixture;
        return domEL.querySelectorAll('igx-days-view')[monthsViewNumber];
    }

    public static getMonthViewDates(fixture, monthsViewNumber: number) {
        const month = HelperTestFunctions.getMonthView(fixture, monthsViewNumber);
        return month.querySelectorAll(HelperTestFunctions.DAY_CSSCLASS);
    }

    public static getMonthViewInactiveDates(fixture, monthsViewNumber: number) {
        const month = HelperTestFunctions.getMonthView(fixture, monthsViewNumber);
        return month.querySelectorAll(HelperTestFunctions.INACTIVE_DAYS_CSSCLASS);
    }

    public static getMonthViewSelectedDates(fixture, monthsViewNumber: number) {
        const month = HelperTestFunctions.getMonthView(fixture, monthsViewNumber);
        return month.querySelectorAll(HelperTestFunctions.SELECTED_DATE +
            `:not(${HelperTestFunctions.HIDDEN_DAYS_CSSCLASS})`);
    }

    public static getSelectedDatesInRangeCalendar(fixture, monthsViewNumber: number) {
        const month = HelperTestFunctions.getMonthView(fixture, monthsViewNumber);
        const dates =  month.querySelectorAll(`
            ${HelperTestFunctions.SELECTED_DATE}
            :not(${HelperTestFunctions.HIDDEN_DAYS_CSSCLASS}):not(${HelperTestFunctions.INACTIVE_DAYS_CSSCLASS}),
            ${HelperTestFunctions.SELECTED_DATE}${HelperTestFunctions.INACTIVE_DAYS_CSSCLASS}:not(.igx-calendar__date--range)`);
        return dates;
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

@Component({
    template: `
        <igx-date-picker [value]="date" [monthsViewNumber]="monthViews" [hideOutsideDays]="true"></igx-date-picker>
    `
})
export class MultiViewDatePickerSampleComponent {
    @ViewChild(IgxDatePickerComponent, { static: true }) public datePicker: IgxDatePickerComponent;
    public date = new Date('2019-09-15');
    public monthViews = 3;
}
