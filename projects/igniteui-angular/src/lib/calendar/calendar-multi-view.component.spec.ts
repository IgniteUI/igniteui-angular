import { Component, ViewChild } from '@angular/core';
import { TestBed, fakeAsync, tick, waitForAsync } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { configureTestSuite } from '../test-utils/configure-suite';
import { UIInteractions, wait } from '../test-utils/ui-interactions.spec';
import { IgxCalendarComponent, IgxCalendarModule } from './public_api';
import { IgxDatePickerComponent, IgxDatePickerModule } from '../date-picker/date-picker.component';
import { DateRangeType } from '../core/dates';
import { HelperTestFunctions } from './calendar-helper-utils';

describe('Multi-View Calendar - ', () => {
    let fixture; let calendar;
    configureTestSuite();

    beforeAll(waitForAsync(() => {
        TestBed.configureTestingModule({
            declarations: [MultiViewCalendarSampleComponent, MultiViewDatePickerSampleComponent, MultiViewNgModelSampleComponent],
            imports: [IgxCalendarModule, IgxDatePickerModule, FormsModule, NoopAnimationsModule]
        }).compileComponents();
    }));

    describe('Base Tests - ', () => {
        beforeEach(waitForAsync(() => {
            fixture = TestBed.createComponent(MultiViewCalendarSampleComponent);
            fixture.detectChanges();
            calendar = fixture.componentInstance.calendar;
        }));

        it('should render properly when monthsViewNumber is initially set or changed runtime', () => {
            const today = new Date(Date.now());

            expect(calendar.monthsViewNumber).toBe(3);
            HelperTestFunctions.verifyMonthsViewNumber(fixture, 3, true);
            HelperTestFunctions.verifyCalendarHeader(fixture, today);

            calendar.monthsViewNumber = 4;
            fixture.detectChanges();

            expect(calendar.monthsViewNumber).toBe(4);
            HelperTestFunctions.verifyMonthsViewNumber(fixture, 4, true);
            HelperTestFunctions.verifyCalendarHeader(fixture, today);

            calendar.monthsViewNumber = 2;
            fixture.detectChanges();

            expect(calendar.monthsViewNumber).toBe(2);
            HelperTestFunctions.verifyMonthsViewNumber(fixture, 2, true);
            HelperTestFunctions.verifyCalendarHeader(fixture, today);
        });

        it('should  render properly if set monthsViewNumber to a value < 1', () => {
            expect(calendar.monthsViewNumber).toBe(3);
            HelperTestFunctions.verifyMonthsViewNumber(fixture, 3, true);

            calendar.monthsViewNumber = 0;
            fixture.detectChanges();

            expect(calendar.monthsViewNumber).toBe(3);
            HelperTestFunctions.verifyMonthsViewNumber(fixture, 3, true);

            calendar.monthsViewNumber = -3;
            fixture.detectChanges();

            expect(calendar.monthsViewNumber).toBe(3);
            HelperTestFunctions.verifyMonthsViewNumber(fixture, 3, true);
        });

        it('should change months views when viewDate is changed', () => {
            const dates = [new Date('2019-06-19'), new Date('2019-07-19'), new Date('2019-08-19')];
            const today = new Date(Date.now());
            expect(calendar.monthsViewNumber).toBe(3);
            HelperTestFunctions.verifyMonthsViewNumber(fixture, 3, true);

            calendar.viewDate = dates[0];
            fixture.detectChanges();

            expect(calendar.monthsViewNumber).toBe(3);
            HelperTestFunctions.verifyMonthsViewNumber(fixture, 3);
            HelperTestFunctions.verifyCalendarHeader(fixture, today);
            HelperTestFunctions.verifyCalendarSubHeaders(fixture, dates);
        });

        it('should be able to change hideOutsideDays property runtime', () => {
            calendar.viewDate = new Date('2019-07-19');
            fixture.detectChanges();

            expect(calendar.hideOutsideDays).toBe(false);
            calendar.monthsViewNumber = 2;
            fixture.detectChanges();

            expect(calendar.monthsViewNumber).toBe(2);
            expect(HelperTestFunctions.getInactiveDays(fixture, 0).length).toBeGreaterThan(1);
            expect(HelperTestFunctions.getHiddenDays(fixture, 0).length).toBe(0);
            expect(HelperTestFunctions.getInactiveDays(fixture, 1).length).toBeGreaterThan(1);
            expect(HelperTestFunctions.getHiddenDays(fixture, 1).length).toBe(0);

            calendar.hideOutsideDays = true;
            fixture.detectChanges();

            expect(HelperTestFunctions.getHiddenDays(fixture, 0).length).toBe(HelperTestFunctions.getInactiveDays(fixture, 0).length);
            expect(HelperTestFunctions.getHiddenDays(fixture, 1).length).toBe(HelperTestFunctions.getInactiveDays(fixture, 1).length);
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

            const verticalCalendar = fixture.nativeElement.querySelector(HelperTestFunctions.VERTICAL_CALENDAR_CSSCLASS);
            expect(verticalCalendar).not.toBeNull();
            const today = new Date(Date.now());

            expect(calendar.monthsViewNumber).toBe(3);
            HelperTestFunctions.verifyMonthsViewNumber(fixture, 3, true);
            HelperTestFunctions.verifyCalendarHeader(fixture, today);

            calendar.monthsViewNumber = 2;
            fixture.detectChanges();

            expect(calendar.monthsViewNumber).toBe(2);
            HelperTestFunctions.verifyMonthsViewNumber(fixture, 2, true);
            HelperTestFunctions.verifyCalendarHeader(fixture, today);
        });

        it('selected event should be fired when select a date', () => {
            spyOn(calendar.selected, 'emit');
            const viewDate = new Date('2019-09-06');
            calendar.viewDate = viewDate;
            fixture.detectChanges();

            let dateEls = HelperTestFunctions.getMonthViewDates(fixture, 0);
            UIInteractions.simulateClickEvent(dateEls[15]);
            fixture.detectChanges();

            expect(calendar.selected.emit).toHaveBeenCalledTimes(1);
            expect(HelperTestFunctions.getMonthViewSelectedDates(fixture, 0).length).toBe(1);
            expect(HelperTestFunctions.getMonthViewSelectedDates(fixture, 1).length).toBe(0);
            expect(HelperTestFunctions.getMonthViewSelectedDates(fixture, 2).length).toBe(0);

            dateEls = HelperTestFunctions.getMonthViewDates(fixture, 1);
            UIInteractions.simulateClickEvent(dateEls[21]);
            fixture.detectChanges();

            expect(calendar.selected.emit).toHaveBeenCalledTimes(2);
            expect(HelperTestFunctions.getMonthViewSelectedDates(fixture, 0).length).toBe(0);
            expect(HelperTestFunctions.getMonthViewSelectedDates(fixture, 1).length).toBe(1);
            expect(HelperTestFunctions.getMonthViewSelectedDates(fixture, 2).length).toBe(0);

            dateEls = HelperTestFunctions.getMonthViewDates(fixture, 2);
            UIInteractions.simulateClickEvent(dateEls[19]);
            fixture.detectChanges();

            expect(calendar.selected.emit).toHaveBeenCalledTimes(3);
            expect(HelperTestFunctions.getMonthViewSelectedDates(fixture, 0).length).toBe(0);
            expect(HelperTestFunctions.getMonthViewSelectedDates(fixture, 1).length).toBe(0);
            expect(HelperTestFunctions.getMonthViewSelectedDates(fixture, 2).length).toBe(1);
        });
    });

    describe('KB Navigation test - ', () => {
        const aug2019 = new Date('2019-08-19');
        const sept2019 = new Date('2019-09-19');
        const oct2019 = new Date('2019-10-19');
        const nov2019 = new Date('2019-11-19');
        const dec2019 = new Date('2019-12-19');
        const jan2020 = new Date('2020-1-19');
        const feb2020 = new Date('2020-2-19');
        const march2020 = new Date('2020-3-19');
        const april2020 = new Date('2020-4-19');
        const may2020 = new Date('2020-5-19');
        const oct2021 = new Date('2021-10-19');
        const nov2021 = new Date('2021-11-19');
        const dec2021 = new Date('2021-12-19');

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

            UIInteractions.triggerKeyDownEvtUponElem('ArrowUp', secondMonthDates[10]);
            fixture.detectChanges();
            tick();

            expect(document.activeElement).toEqual(secondMonthDates[3]);

            UIInteractions.triggerKeyDownEvtUponElem('ArrowUp', secondMonthDates[3]);
            fixture.detectChanges();
            tick();

            let firstMonthDates = HelperTestFunctions.getMonthViewDates(fixture, 0);
            expect(document.activeElement).toEqual(firstMonthDates[27]);

            UIInteractions.triggerKeyDownEvtUponElem('ArrowUp', firstMonthDates[27]);
            fixture.detectChanges();
            tick();

            expect(document.activeElement).toEqual(firstMonthDates[20]);

            UIInteractions.triggerKeyDownEvtUponElem('ArrowUp', firstMonthDates[20]);
            fixture.detectChanges();
            tick();

            expect(document.activeElement).toEqual(firstMonthDates[13]);
            UIInteractions.triggerKeyDownEvtUponElem('ArrowUp', firstMonthDates[13]);
            fixture.detectChanges();
            tick();

            expect(document.activeElement).toEqual(firstMonthDates[6]);
            // Verify months are not changed
            HelperTestFunctions.verifyCalendarSubHeaders(fixture, [oct2019, nov2019, dec2019]);

            UIInteractions.triggerKeyDownEvtUponElem('ArrowUp', firstMonthDates[6]);
            fixture.detectChanges();
            tick(600);

            firstMonthDates = HelperTestFunctions.getMonthViewDates(fixture, 0);

            // The focus should not be stolen by the selected date
            expect(document.activeElement).toEqual(firstMonthDates[29]);
            // Verify months are changed
            HelperTestFunctions.verifyCalendarSubHeaders(fixture, [sept2019, oct2019, nov2019]);
        }));

        it('Verify navigation with arrow down', fakeAsync(() => {
            let monthDates = HelperTestFunctions.getMonthViewDates(fixture, 1);
            UIInteractions.simulateClickEvent(monthDates[22]);
            fixture.detectChanges();
            tick();

            UIInteractions.triggerKeyDownEvtUponElem('ArrowDown', monthDates[22]);
            fixture.detectChanges();
            tick();

            expect(document.activeElement).toEqual(monthDates[29]);
            UIInteractions.triggerKeyDownEvtUponElem('ArrowDown', monthDates[29]);
            fixture.detectChanges();

            monthDates = HelperTestFunctions.getMonthViewDates(fixture, 2);
            expect(document.activeElement).toEqual(monthDates[6]);

            UIInteractions.triggerKeyDownEvtUponElem('ArrowDown', monthDates[5]);
            fixture.detectChanges();
            tick();

            expect(document.activeElement).toEqual(monthDates[12]);

            UIInteractions.triggerKeyDownEvtUponElem('ArrowDown', monthDates[12]);
            fixture.detectChanges();
            tick();

            expect(document.activeElement).toEqual(monthDates[19]);
            UIInteractions.triggerKeyDownEvtUponElem('ArrowDown', monthDates[19]);
            fixture.detectChanges();
            tick();

            expect(document.activeElement).toEqual(monthDates[26]);
            // Verify months are not changed
            HelperTestFunctions.verifyCalendarSubHeaders(fixture, [oct2019, nov2019, dec2019]);
            UIInteractions.triggerKeyDownEvtUponElem('ArrowDown', monthDates[26]);
            fixture.detectChanges();
            tick(600);

            monthDates = HelperTestFunctions.getMonthViewDates(fixture, 0);
            expect(document.activeElement).toEqual(monthDates[2]);
            // TODO: Consider issue #5913
            HelperTestFunctions.verifyCalendarSubHeaders(fixture, [jan2020, feb2020, march2020]);
        }));

        it('Verify navigation with arrow left', fakeAsync(() => {
            const secondMonthDates = HelperTestFunctions.getMonthViewDates(fixture, 1);
            UIInteractions.simulateClickEvent(secondMonthDates[1]);
            fixture.detectChanges();
            tick();

            UIInteractions.triggerKeyDownEvtUponElem('ArrowLeft', secondMonthDates[1]);
            fixture.detectChanges();
            tick();

            expect(document.activeElement).toEqual(secondMonthDates[0]);
            UIInteractions.triggerKeyDownEvtUponElem('ArrowLeft', secondMonthDates[0]);
            fixture.detectChanges();
            tick();

            let firstMonthDates = HelperTestFunctions.getMonthViewDates(fixture, 0);
            expect(document.activeElement).toEqual(firstMonthDates[30]);

            for (let index = 30; index > 0; index--) {
                UIInteractions.triggerKeyDownEvtUponElem('ArrowLeft', firstMonthDates[index]);
                fixture.detectChanges();
                tick();

                expect(document.activeElement).toEqual(firstMonthDates[index - 1]);
            }

            // Verify months are not changed
            HelperTestFunctions.verifyCalendarSubHeaders(fixture, [oct2019, nov2019, dec2019]);
            UIInteractions.triggerKeyDownEvtUponElem('ArrowLeft', firstMonthDates[0]);
            fixture.detectChanges();
            tick(600);

            firstMonthDates = HelperTestFunctions.getMonthViewDates(fixture, 0);
            expect(document.activeElement).toEqual(firstMonthDates[29]);
            // Verify months are changed
            HelperTestFunctions.verifyCalendarSubHeaders(fixture, [sept2019, oct2019, nov2019]);
        }));

        it('Verify navigation with arrow right', fakeAsync(() => {
            let monthDates = HelperTestFunctions.getMonthViewDates(fixture, 1);
            UIInteractions.simulateClickEvent(monthDates[20]);
            fixture.detectChanges();
            tick();

            calendar.selectDate(new Date('2020-2-19'));
            tick();
            fixture.detectChanges();

            for (let index = 20; index < 29; index++) {
                UIInteractions.triggerKeyDownEvtUponElem('ArrowRight', monthDates[index]);
                fixture.detectChanges();
                tick();
                expect(document.activeElement).toEqual(monthDates[index + 1]);
            }
            UIInteractions.triggerKeyDownEvtUponElem('ArrowRight', monthDates[29]);
            fixture.detectChanges();
            tick();

            monthDates = HelperTestFunctions.getMonthViewDates(fixture, 2);
            expect(document.activeElement).toEqual(monthDates[0]);

            for (let index = 0; index < 30; index++) {
                UIInteractions.triggerKeyDownEvtUponElem('ArrowRight', monthDates[index]);
                fixture.detectChanges();
                tick();
                expect(document.activeElement).toEqual(monthDates[index + 1]);
            }

            // Verify months are not changed
            HelperTestFunctions.verifyCalendarSubHeaders(fixture, [oct2019, nov2019, dec2019]);
            UIInteractions.triggerKeyDownEvtUponElem('ArrowRight', monthDates[30]);
            fixture.detectChanges();
            tick(600);

            // TODO: Consider issue #5913
            monthDates = HelperTestFunctions.getMonthViewDates(fixture, 0);
            expect(document.activeElement).toEqual(monthDates[0]);
            // Verify months are changed
            HelperTestFunctions.verifyCalendarSubHeaders(fixture, [jan2020, feb2020, march2020]);
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

            UIInteractions.triggerKeyDownEvtUponElem('ArrowUp', secondMonthDates[27]);
            fixture.detectChanges();
            tick();

            expect(document.activeElement).toEqual(secondMonthDates[13]);

            UIInteractions.triggerKeyDownEvtUponElem('ArrowUp', secondMonthDates[13]);
            fixture.detectChanges();
            tick();

            let firstMonthDates = HelperTestFunctions.getMonthViewDates(fixture, 0);
            expect(document.activeElement).toEqual(firstMonthDates[9]);
            // Verify months are not changed
            HelperTestFunctions.verifyCalendarSubHeaders(fixture, [dec2019, jan2020, feb2020]);

            UIInteractions.triggerKeyDownEvtUponElem('ArrowUp', firstMonthDates[9]);
            fixture.detectChanges();
            tick(600);

            firstMonthDates = HelperTestFunctions.getMonthViewDates(fixture, 0);
            expect(document.activeElement).toEqual(firstMonthDates[11]);
            // Verify months are changed
            HelperTestFunctions.verifyCalendarSubHeaders(fixture, [nov2019, dec2019, jan2020]);
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

            UIInteractions.triggerKeyDownEvtUponElem('ArrowDown', secondMonthDates[16]);
            fixture.detectChanges();
            tick();

            expect(document.activeElement).toEqual(secondMonthDates[30]);

            UIInteractions.triggerKeyDownEvtUponElem('ArrowDown', secondMonthDates[30]);
            fixture.detectChanges();
            tick();

            let monthDates = HelperTestFunctions.getMonthViewDates(fixture, 2);
            expect(document.activeElement).toEqual(monthDates[20]);

            UIInteractions.triggerKeyDownEvtUponElem('ArrowDown', monthDates[20]);
            fixture.detectChanges();
            tick(600);

            monthDates = HelperTestFunctions.getMonthViewDates(fixture, 0);
            expect(document.activeElement).toEqual(monthDates[12]);
            // Verify months are changed
            HelperTestFunctions.verifyCalendarSubHeaders(fixture, [march2020, april2020, new Date('2020-5-19')]);
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

            UIInteractions.triggerKeyDownEvtUponElem('ArrowLeft', secondMonthDates[25]);
            fixture.detectChanges();
            tick();

            expect(document.activeElement).toEqual(secondMonthDates[17]);

            for (let index = 17; index > 11; index--) {
                UIInteractions.triggerKeyDownEvtUponElem('ArrowLeft', secondMonthDates[index]);
                fixture.detectChanges();
                tick();

                expect(document.activeElement).toEqual(secondMonthDates[index - 1]);
            }
            UIInteractions.triggerKeyDownEvtUponElem('ArrowLeft', secondMonthDates[11]);
            fixture.detectChanges();
            tick();

            let firstMonthDates = HelperTestFunctions.getMonthViewDates(fixture, 0);
            expect(document.activeElement).toEqual(firstMonthDates[13]);

            for (let index = 13; index > 8; index--) {
                UIInteractions.triggerKeyDownEvtUponElem('ArrowLeft', firstMonthDates[index]);
                fixture.detectChanges();
                tick();

                expect(document.activeElement).toEqual(firstMonthDates[index - 1]);
            }

            // Verify months are not changed
            HelperTestFunctions.verifyCalendarSubHeaders(fixture, [dec2019, jan2020, feb2020]);
            UIInteractions.triggerKeyDownEvtUponElem('ArrowLeft', firstMonthDates[8]);
            fixture.detectChanges();
            tick(600);

            firstMonthDates = HelperTestFunctions.getMonthViewDates(fixture, 0);
            expect(document.activeElement).toEqual(firstMonthDates[13]);
            // Verify months are changed
            HelperTestFunctions.verifyCalendarSubHeaders(fixture, [nov2019, dec2019, jan2020]);
        }));

        it('Verify navigation with arrow right when there are disabled dates', fakeAsync(() => {
            calendar.viewDate = new Date(2019, 11, 25);
            calendar.disabledDates = dateRangeDescriptors;
            fixture.detectChanges();
            tick();

            let monthDates = HelperTestFunctions.getMonthViewDates(fixture, 1);
            UIInteractions.simulateClickEvent(monthDates[17]);
            fixture.detectChanges();
            tick();

            UIInteractions.triggerKeyDownEvtUponElem('ArrowRight', monthDates[17]);
            fixture.detectChanges();
            tick();

            expect(document.activeElement).toEqual(monthDates[25]);

            for (let index = 25; index < 30; index++) {
                UIInteractions.triggerKeyDownEvtUponElem('ArrowRight', monthDates[index]);
                fixture.detectChanges();
                tick();
                expect(document.activeElement).toEqual(monthDates[index + 1]);
            }
            UIInteractions.triggerKeyDownEvtUponElem('ArrowRight', monthDates[30]);
            fixture.detectChanges();
            tick();

            monthDates = HelperTestFunctions.getMonthViewDates(fixture, 2);
            expect(document.activeElement).toEqual(monthDates[15]);

            for (let index = 15; index < 23; index++) {
                UIInteractions.triggerKeyDownEvtUponElem('ArrowRight', monthDates[index]);
                fixture.detectChanges();
                tick();
                expect(document.activeElement).toEqual(monthDates[index + 1]);
            }

            // Verify months are not changed
            HelperTestFunctions.verifyCalendarSubHeaders(fixture, [dec2019, jan2020, feb2020]);

            UIInteractions.triggerKeyDownEvtUponElem('ArrowRight', monthDates[23]);
            fixture.detectChanges();
            tick(600);

            monthDates = HelperTestFunctions.getMonthViewDates(fixture, 0);
            expect(document.activeElement).toEqual(monthDates[11]);
            // Verify months are changed
            HelperTestFunctions.verifyCalendarSubHeaders(fixture, [march2020, april2020, may2020]);
        }));

        it('Verify tabindex is correct when navigating with arrow keys', fakeAsync(() => {
            calendar.hideOutsideDays = true;
            fixture.detectChanges();

            let dates = HelperTestFunctions.getMonthViewDates(fixture, 0);
            UIInteractions.simulateClickEvent(dates[0]);
            fixture.detectChanges();
            tick();

            UIInteractions.triggerKeyDownEvtUponElem('ArrowDown', dates[0]);
            fixture.detectChanges();
            tick();
            dates = HelperTestFunctions.getMonthViewDates(fixture, 0);
            expect(document.activeElement).toEqual(dates[7]);
            expect(dates[7].tabIndex).toBe(0);

            UIInteractions.triggerKeyDownEvtUponElem('ArrowUp', dates[7]);
            fixture.detectChanges();
            tick();
            dates = HelperTestFunctions.getMonthViewDates(fixture, 0);
            expect(document.activeElement).toEqual(dates[0]);
            expect(dates[0].tabIndex).toBe(0);

            UIInteractions.triggerKeyDownEvtUponElem('ArrowRight', dates[0]);
            fixture.detectChanges();
            tick();
            dates = HelperTestFunctions.getMonthViewDates(fixture, 0);
            expect(document.activeElement).toEqual(dates[1]);
            expect(dates[1].tabIndex).toBe(0);

            UIInteractions.triggerKeyDownEvtUponElem('ArrowLeft', dates[1]);
            fixture.detectChanges();
            tick();
            dates = HelperTestFunctions.getMonthViewDates(fixture, 0);
            expect(document.activeElement).toEqual(dates[0]);
            expect(dates[0].tabIndex).toBe(0);
        }));


        it('Verify navigation with pageUp', fakeAsync(() => {
            let monthDates = HelperTestFunctions.getMonthViewDates(fixture, 1);
            UIInteractions.simulateClickEvent(monthDates[16]);
            fixture.detectChanges();
            tick();

            UIInteractions.triggerKeyDownEvtUponElem('ArrowRight', monthDates[16]);
            fixture.detectChanges();

            expect(document.activeElement).toEqual(monthDates[17]);

            UIInteractions.triggerKeyDownEvtUponElem('PageUp', monthDates[17]);
            fixture.detectChanges();
            tick(600);

            monthDates = HelperTestFunctions.getMonthViewDates(fixture, 1);
            expect(document.activeElement).toEqual(monthDates[17]);
            // Verify months are changed
            fixture.detectChanges();
            HelperTestFunctions.verifyCalendarSubHeaders(fixture, [sept2019, oct2019, nov2019]);

            UIInteractions.triggerKeyDownEvtUponElem('PageUp', monthDates[17]);
            fixture.detectChanges();
            tick(600);

            monthDates = HelperTestFunctions.getMonthViewDates(fixture, 1);
            expect(document.activeElement).toEqual(monthDates[17]);
            // Verify months are changed
            HelperTestFunctions.verifyCalendarSubHeaders(fixture, [aug2019, sept2019, oct2019]);
        }));
        it('Verify navigation with pageDown', fakeAsync(() => {
            let monthDates = HelperTestFunctions.getMonthViewDates(fixture, 1);
            UIInteractions.simulateClickEvent(monthDates[17]);
            fixture.detectChanges();
            tick();

            UIInteractions.triggerKeyDownEvtUponElem('ArrowRight', monthDates[17]);
            fixture.detectChanges();

            expect(document.activeElement).toEqual(monthDates[18]);

            UIInteractions.triggerKeyDownEvtUponElem('PageDown', monthDates[18]);
            fixture.detectChanges();
            tick(600);

            monthDates = HelperTestFunctions.getMonthViewDates(fixture, 1);
            expect(document.activeElement).toEqual(monthDates[18]);
            // Verify months are changed
            fixture.detectChanges();
            HelperTestFunctions.verifyCalendarSubHeaders(fixture, [nov2019, dec2019, jan2020]);

            UIInteractions.triggerKeyDownEvtUponElem('PageDown', monthDates[18]);
            fixture.detectChanges();
            tick(600);

            monthDates = HelperTestFunctions.getMonthViewDates(fixture, 1);
            expect(document.activeElement).toEqual(monthDates[18]);
            // Verify months are changed
            HelperTestFunctions.verifyCalendarSubHeaders(fixture, [dec2019, jan2020, feb2020]);
        }));

        it('Verify navigation with Shift plus pageUp', fakeAsync(() => {
            let monthDates = HelperTestFunctions.getMonthViewDates(fixture, 1);
            UIInteractions.simulateClickEvent(monthDates[16]);
            fixture.detectChanges();
            tick();

            UIInteractions.triggerKeyDownEvtUponElem('ArrowRight', monthDates[16]);
            fixture.detectChanges();

            expect(document.activeElement).toEqual(monthDates[17]);

            UIInteractions.triggerKeyDownEvtUponElem('PageUp', monthDates[17], true, false, true);
            fixture.detectChanges();
            tick(600);

            monthDates = HelperTestFunctions.getMonthViewDates(fixture, 1);
            expect(document.activeElement).toEqual(monthDates[17]);
            fixture.detectChanges();
            HelperTestFunctions.verifyCalendarSubHeaders(fixture, [new Date('2018-10-19'), new Date('2018-11-19'), new Date('2018-12-19')]);

            UIInteractions.triggerKeyDownEvtUponElem('PageUp', monthDates[17], true, false, true);
            fixture.detectChanges();
            tick(600);

            monthDates = HelperTestFunctions.getMonthViewDates(fixture, 1);
            expect(document.activeElement).toEqual(monthDates[17]);
            HelperTestFunctions.verifyCalendarSubHeaders(fixture, [new Date('2017-10-19'), new Date('2017-11-19'), new Date('2017-12-19')]);
        }));

        it('Verify navigation with Shift plus pageDown', fakeAsync(() => {
            let monthDates = HelperTestFunctions.getMonthViewDates(fixture, 1);
            UIInteractions.simulateClickEvent(monthDates[16]);
            fixture.detectChanges();
            tick();

            UIInteractions.triggerKeyDownEvtUponElem('ArrowRight', monthDates[16]);
            fixture.detectChanges();

            expect(document.activeElement).toEqual(monthDates[17]);

            UIInteractions.triggerKeyDownEvtUponElem('PageDown', monthDates[17], true, false, true);
            fixture.detectChanges();
            tick(600);

            monthDates = HelperTestFunctions.getMonthViewDates(fixture, 1);
            expect(document.activeElement).toEqual(monthDates[17]);
            fixture.detectChanges();
            HelperTestFunctions.verifyCalendarSubHeaders(fixture, [new Date('2020-10-19'), new Date('2020-11-19'), new Date('2020-12-19')]);

            UIInteractions.triggerKeyDownEvtUponElem('PageDown', monthDates[17], true, false, true);
            fixture.detectChanges();
            tick(600);

            monthDates = HelperTestFunctions.getMonthViewDates(fixture, 1);
            expect(document.activeElement).toEqual(monthDates[17]);
            HelperTestFunctions.verifyCalendarSubHeaders(fixture, [oct2021, nov2021, dec2021]);
        }));

        it('Verify tab index of disabled dates and outside dates', fakeAsync(() => {
            calendar.disabledDates = [
                { type: DateRangeType.Between, dateRange: [new Date(2019, 9, 7), new Date(2019, 9, 14)] }];
            calendar.hideOutsideDays = true;
            fixture.detectChanges();

            let monthDates = HelperTestFunctions.getMonthViewDates(fixture, 0);
            for (let index = 6; index < 14; index++) {
                expect(monthDates[index].tabIndex).toEqual(-1);

            }
            let inactiveDates = HelperTestFunctions.getMonthViewInactiveDates(fixture, 0);
            inactiveDates.forEach(date => {
                expect(date.tabIndex).toEqual(-1);
            });

            calendar.hideOutsideDays = false;
            calendar.disabledDates = [];
            fixture.detectChanges();
            inactiveDates = HelperTestFunctions.getMonthViewInactiveDates(fixture, 0);
            inactiveDates.forEach(date => {
                expect(date.tabIndex).toEqual(-1);
            });

            monthDates = HelperTestFunctions.getMonthViewDates(fixture, 0);
            for (let index = 6; index < 14; index++) {
                expect(monthDates[index].tabIndex).toEqual(-1);

            }

            expect(monthDates[0].tabIndex).toEqual(0);
        }));

        it('Verify navigation with Home and End keys and check the tabindex', fakeAsync(() => {
            let monthDates = HelperTestFunctions.getMonthViewDates(fixture, 1);
            UIInteractions.simulateClickEvent(monthDates[16]);
            fixture.detectChanges();
            tick();

            UIInteractions.triggerKeyDownEvtUponElem('Home', monthDates[16], true);
            fixture.detectChanges();
            tick();

            monthDates = HelperTestFunctions.getMonthViewDates(fixture, 0);
            expect(document.activeElement).toEqual(monthDates[0]);
            expect(monthDates[0].tabIndex).toEqual(0);


            UIInteractions.triggerKeyDownEvtUponElem('End', monthDates[0], true);
            fixture.detectChanges();
            tick();

            monthDates = HelperTestFunctions.getMonthViewDates(fixture, 2);
            expect(document.activeElement).toEqual(monthDates[monthDates.length - 1]);
            expect(monthDates[monthDates.length - 1].tabIndex).toEqual(0);

        }));

        it('Verify navigation with Home and End keys when there are disabled dates', fakeAsync(() => {
            calendar.disabledDates = [
                { type: DateRangeType.Between, dateRange: [new Date(2019, 9, 1), new Date(2019, 9, 14)] },
                { type: DateRangeType.Between, dateRange: [new Date(2019, 10, 12), new Date(2020, 0, 14)] }
            ];
            fixture.detectChanges();

            let monthDates = HelperTestFunctions.getMonthViewDates(fixture, 1);
            UIInteractions.simulateClickEvent(monthDates[3]);
            fixture.detectChanges();
            tick();

            UIInteractions.triggerKeyDownEvtUponElem('Home', monthDates[3], true);
            fixture.detectChanges();
            tick();

            monthDates = HelperTestFunctions.getMonthViewDates(fixture, 0);
            expect(document.activeElement).toEqual(monthDates[14]);

            UIInteractions.triggerKeyDownEvtUponElem('End', monthDates[14], true);
            fixture.detectChanges();
            tick();

            monthDates = HelperTestFunctions.getMonthViewDates(fixture, 1);
            expect(document.activeElement).toEqual(monthDates[10]);
        }));

        it('Verify that months increment/decrement continuously on enter keydown', (async () => {
            calendar.monthsViewNumber = 2;
            await wait(100);
            fixture.detectChanges();
            const dates = [new Date('2019-10-15'), new Date('2019-11-15'), new Date('2019-12-15'),
            new Date('2020-1-15'), new Date('2020-2-15'), new Date('2020-3-15'), new Date('2020-4-15')];

            HelperTestFunctions.verifyCalendarSubHeaders(fixture, [dates[0], dates[1]]);

            for (let i = 1; i < dates.length - 1; i++) {
                const arrowRight = HelperTestFunctions.getNexArrowElement(fixture);
                UIInteractions.triggerKeyDownEvtUponElem('Enter', arrowRight);
                fixture.detectChanges();
                await wait(100);
                fixture.detectChanges();

                HelperTestFunctions.verifyCalendarSubHeaders(fixture, [dates[i], dates[i + 1]]);
            }
             for (let index = dates.length - 2; index > 0; index--) {
                const arrowLeft = HelperTestFunctions.getPreviousArrowElement(fixture);
                UIInteractions.triggerKeyDownEvtUponElem('Enter', arrowLeft);
                fixture.detectChanges();
                await wait(200);
                fixture.detectChanges();
                HelperTestFunctions.verifyCalendarSubHeaders(fixture, [dates[index - 1], dates[index]]);
            }
        }));

        it('Verify that months increment/decrement continuously on mouse down', (fakeAsync(() => {
            calendar.monthsViewNumber = 2;
            tick(100);
            fixture.detectChanges();
            const dates = [new Date('2019-10-15'), new Date('2019-11-15'), new Date('2019-12-15'),
            new Date('2020-1-15'), new Date('2020-2-15'), new Date('2020-3-15'), new Date('2020-4-15')];

            HelperTestFunctions.verifyCalendarSubHeaders(fixture, [dates[0], dates[1]]);

            for (let i = 1; i < dates.length - 1; i++) {
                const arrowRight = HelperTestFunctions.getNexArrowElement(fixture);
                UIInteractions.simulateMouseEvent('mousedown', arrowRight, 0, 0);
                tick(100);
                fixture.detectChanges();

                HelperTestFunctions.verifyCalendarSubHeaders(fixture, [dates[i], dates[i + 1]]);
            }
            for (let index = dates.length - 2; index > 0; index--) {
                const arrowLeft = HelperTestFunctions.getPreviousArrowElement(fixture);
                UIInteractions.simulateMouseEvent('mousedown', arrowLeft, 0, 0);
                tick(100);
                fixture.detectChanges();

                HelperTestFunctions.verifyCalendarSubHeaders(fixture, [dates[index - 1], dates[index]]);
            }
        })));

        it('When navigating to a new month the selected date should not steal the focus', (fakeAsync(() => {
            calendar.monthsViewNumber = 2;
            tick(100);
            fixture.detectChanges();
            const dates = [new Date('2019-10-15'), new Date('2019-11-15'), new Date('2019-12-15')];

            HelperTestFunctions.verifyCalendarSubHeaders(fixture, [dates[0], dates[1]]);

            const arrowRight = HelperTestFunctions.getNexArrowElement(fixture);
            arrowRight.focus();

            expect(document.activeElement).toEqual(arrowRight);

            calendar.selectDate(dates[2]);
            fixture.detectChanges();

            UIInteractions.triggerKeyDownEvtUponElem('Enter', arrowRight);
            tick(100);
            fixture.detectChanges();

            HelperTestFunctions.verifyCalendarSubHeaders(fixture, [dates[1], dates[2]]);
            expect(document.activeElement).toEqual(arrowRight);
        })));

        it('When select a new month - should come at correct position', fakeAsync(() => {
            const secondMonthPicker = HelperTestFunctions.getCalendarSubHeader(fixture)
                .querySelectorAll(HelperTestFunctions.CALENDAR_DATE_CSSCLASS)[2];
            UIInteractions.triggerKeyDownEvtUponElem('Enter', secondMonthPicker);
            fixture.detectChanges();
            tick(100);
            const months = HelperTestFunctions.getMonthsFromMonthView(fixture);
            expect(months.length).toBe(12);
            expect(document.activeElement).toEqual(months[10]);

            UIInteractions.triggerKeyDownEvtUponElem('ArrowUp', months[10]);
            fixture.detectChanges();
            tick(100);
            expect(document.activeElement).toEqual(months[7]);

            UIInteractions.triggerKeyDownEvtUponElem('ArrowLeft', months[7]);
            fixture.detectChanges();
            tick(100);
            expect(document.activeElement).toEqual(months[6]);

            UIInteractions.triggerKeyDownEvtUponElem('ArrowDown', months[6]);
            fixture.detectChanges();
            tick(100);
            expect(document.activeElement).toEqual(months[9]);

            UIInteractions.triggerKeyDownEvtUponElem('ArrowRight', months[9]);
            fixture.detectChanges();
            tick(100);
            expect(document.activeElement).toEqual(months[10]);

            UIInteractions.triggerKeyDownEvtUponElem('ArrowRight', months[10]);
            fixture.detectChanges();
            tick(100);
            expect(document.activeElement).toEqual(months[11]);

            UIInteractions.triggerKeyDownEvtUponElem('Enter', months[11]);
            fixture.detectChanges();
            tick(100);
            HelperTestFunctions.verifyCalendarSubHeaders(fixture, [new Date('2019-11-12'), new Date('2019-12-1'), new Date('2020-1-2')]);
        }));

        it('When select a new year - should come at correct position', fakeAsync(() => {
            calendar.viewDate = new Date('2019-12-12');
            tick();
            fixture.detectChanges();
            HelperTestFunctions.verifyCalendarSubHeaders(fixture, [new Date('2019-12-12'), new Date('2020-1-1'), new Date('2020-2-2')]);

            const secondYearPicker = HelperTestFunctions.getCalendarSubHeader(fixture)
                .querySelectorAll(HelperTestFunctions.CALENDAR_DATE_CSSCLASS)[3];
            UIInteractions.triggerKeyDownEvtUponElem('Enter', secondYearPicker);
            fixture.detectChanges();
            tick(150);
            fixture.detectChanges();

            let years = HelperTestFunctions.getYearsFromYearView(fixture);
            expect(years.length).toBe(7);
            expect(Number(years[3].innerText)).toEqual(2020);

            for (let i = 1; i < 4; i++) {
                UIInteractions.triggerKeyDownEvtUponElem('ArrowUp', years[3]);
                tick(100);
                fixture.detectChanges();

                years = HelperTestFunctions.getYearsFromYearView(fixture);
                expect(Number(years[3].innerText)).toEqual(2020 - i);
            }

            for (let i = 1; i < 5; i++) {
                UIInteractions.triggerKeyDownEvtUponElem('ArrowDown', years[3]);
                tick(100);
                fixture.detectChanges();

                years = HelperTestFunctions.getYearsFromYearView(fixture);
                expect(Number(years[3].innerText)).toEqual(2017 + i);
            }
            UIInteractions.triggerKeyDownEvtUponElem('Enter', years[3]);
            tick(100);
            fixture.detectChanges();

            HelperTestFunctions.verifyCalendarSubHeaders(fixture, [new Date('2020-12-12'), new Date('2021-1-1'), new Date('2021-2-2')]);
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


        it('days should be selected in all month views, when hideOutsideDays is false and selection is single/multi', () => {
            spyOn(calendar.selected, 'emit');
            expect(calendar.hideOutsideDays).toBe(false);
            const fistMonthDates = HelperTestFunctions.getMonthViewDates(fixture, 0);
            const secondMonthDates = HelperTestFunctions.getMonthViewDates(fixture, 1);
            UIInteractions.simulateClickEvent(fistMonthDates[29]);
            fixture.detectChanges();

            expect(calendar.selected.emit).toHaveBeenCalledTimes(1);
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

            expect(calendar.selected.emit).toHaveBeenCalledTimes(5);
            expect(HelperTestFunctions.getMonthViewSelectedDates(fixture, 0).length).toBe(2);
            expect(HelperTestFunctions.getMonthViewSelectedDates(fixture, 1).length).toBe(4);
            expect(HelperTestFunctions.getMonthViewSelectedDates(fixture, 2).length).toBe(2);

            calendar.hideOutsideDays = true;
            fixture.detectChanges();

            expect(HelperTestFunctions.getMonthViewSelectedDates(fixture, 0).length).toBe(0);
            expect(HelperTestFunctions.getMonthViewSelectedDates(fixture, 1).length).toBe(4);
            expect(HelperTestFunctions.getMonthViewSelectedDates(fixture, 2).length).toBe(0);
        });

        it('Multi Selection - Select/Deselect date from one view should also select/deselect the date in the another', () => {
            spyOn(calendar.selected, 'emit');
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

            expect(calendar.selected.emit).toHaveBeenCalledTimes(1);
            expect(HelperTestFunctions.getMonthViewSelectedDates(fixture, 0).length).toBe(2);
            expect(HelperTestFunctions.getMonthViewSelectedDates(fixture, 1).length).toBe(2);

            UIInteractions.simulateClickEvent(secondMonthDates[3]);
            fixture.detectChanges();

            expect(calendar.selected.emit).toHaveBeenCalledTimes(2);
            expect(HelperTestFunctions.getMonthViewSelectedDates(fixture, 0).length).toBe(1);
            expect(HelperTestFunctions.getMonthViewSelectedDates(fixture, 1).length).toBe(1);

            calendar.deselectDate([octoberthird]);
            fixture.detectChanges();

            expect(calendar.selected.emit).toHaveBeenCalledTimes(2);
            expect(HelperTestFunctions.getMonthViewSelectedDates(fixture, 0).length).toBe(0);
            expect(HelperTestFunctions.getMonthViewSelectedDates(fixture, 1).length).toBe(0);
        });

        it('Multi/Single Selection - select multiple dates should not create range', () => {
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

        it('outside month days should be hidden when hideOutsideDays is true', () => {
            calendar.monthsViewNumber = 2;
            fixture.detectChanges();

            expect(calendar.hideOutsideDays).toBe(false);
            expect(HelperTestFunctions.getHiddenDays(fixture, 0).length).toBe(0);
            expect(HelperTestFunctions.getHiddenDays(fixture, 1).length).toBe(0);

            calendar.hideOutsideDays = true;
            fixture.detectChanges();

            const firstMonthInactiveDays = HelperTestFunctions.getInactiveDays(fixture, 0).length;
            const secondMonthInactiveDays = HelperTestFunctions.getInactiveDays(fixture, 1).length;
            expect(HelperTestFunctions.getHiddenDays(fixture, 0).length).toBe(firstMonthInactiveDays);
            expect(HelperTestFunctions.getHiddenDays(fixture, 1).length).toBe(secondMonthInactiveDays);

            calendar.selection = 'multi';
            fixture.detectChanges();
            expect(HelperTestFunctions.getHiddenDays(fixture, 0).length).toBe(firstMonthInactiveDays);
            expect(HelperTestFunctions.getHiddenDays(fixture, 1).length).toBe(secondMonthInactiveDays);

            calendar.selection = 'range';
            fixture.detectChanges();
            expect(HelperTestFunctions.getHiddenDays(fixture, 0).length).toBe(firstMonthInactiveDays);
            expect(HelperTestFunctions.getHiddenDays(fixture, 1).length).toBe(secondMonthInactiveDays);
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

        it('outside days should NOT be selected in all month views, when hideOutsideDays is false and selection is range', () => {
            spyOn(calendar.selected, 'emit');
            calendar.selection = 'range';
            fixture.detectChanges();

            const secondMonthDates = HelperTestFunctions.getMonthViewDates(fixture, 1);
            UIInteractions.simulateClickEvent(secondMonthDates[0]);
            fixture.detectChanges();

            expect(calendar.selected.emit).toHaveBeenCalledTimes(1);

            // TODO: check is this is by design
            /* HelperTestFunctions.getMonthViewSelectedDates(fixture, 0).forEach((el) => {
                expect(el.classList.contains(HelperTestFunctions.RANGE_CSSCLASS)).toBeTruthy();
            });
            HelperTestFunctions.getMonthViewSelectedDates(fixture, 1).forEach((el) => {
                expect(el.classList.contains(HelperTestFunctions.RANGE_CSSCLASS)).toBeTruthy();
            }); */

            UIInteractions.simulateClickEvent(secondMonthDates[30]);
            fixture.detectChanges();

            expect(calendar.selected.emit).toHaveBeenCalledTimes(2);
            HelperTestFunctions.getMonthViewSelectedDates(fixture, 0).forEach((el) => {
                expect(el.classList.contains(HelperTestFunctions.RANGE_CSSCLASS)).toBeTruthy();
            });
            HelperTestFunctions.getMonthViewSelectedDates(fixture, 1).forEach((el) => {
                expect(el.classList.contains(HelperTestFunctions.RANGE_CSSCLASS)).toBeTruthy();
            });
            HelperTestFunctions.getMonthViewSelectedDates(fixture, 2).forEach((el) => {
                expect(el.classList.contains(HelperTestFunctions.RANGE_CSSCLASS)).toBeTruthy();
            });
        });
    });

    describe('Selection tests with ngModel - ', () => {
        beforeEach(fakeAsync(() => {
            fixture = TestBed.createComponent(MultiViewNgModelSampleComponent);
            fixture.detectChanges();
            calendar = fixture.componentInstance.calendar;
            calendar.viewDate = new Date(2019, 8, 1); // 1st September 2019
            tick();
            fixture.detectChanges();
        }));

        it('Should be able to select/deselect dates in multi mode', () => {
            const secondMonthDates = HelperTestFunctions.getMonthViewDates(fixture, 1);
            UIInteractions.simulateClickEvent(secondMonthDates[16]);

            fixture.detectChanges();
            expect(calendar.value[0].getTime()).toEqual(new Date(2019, 9, 10).getTime());
            expect(calendar.daysView.value[0].getTime()).toEqual(new Date(2019, 9, 10).getTime());

            UIInteractions.simulateClickEvent(secondMonthDates[17]);

            fixture.detectChanges();
            expect(calendar.value[0].getTime()).toEqual(new Date(2019, 9, 10).getTime());
            expect(calendar.value[1].getTime()).toEqual(new Date(2019, 9, 17).getTime());
            expect(calendar.value[2].getTime()).toEqual(new Date(2019, 9, 18).getTime());

            expect(calendar.daysView.value[0].getTime()).toEqual(new Date(2019, 9, 10).getTime());
            expect(calendar.daysView.value[1].getTime()).toEqual(new Date(2019, 9, 17).getTime());
            expect(calendar.daysView.value[2].getTime()).toEqual(new Date(2019, 9, 18).getTime());
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
            let target = fixture.nativeElement.querySelector(HelperTestFunctions.ICON_CSSCLASS);
            UIInteractions.simulateClickAndSelectEvent(target);
            tick(400);
            fixture.detectChanges();

            let overlay = document.querySelector(HelperTestFunctions.OVERLAY_CSSCLASS);
            HelperTestFunctions.verifyMonthsViewNumber(overlay, 3);
            HelperTestFunctions.verifyCalendarSubHeaders(overlay, [new Date('2019-09-16'), new Date('2019-10-16'), new Date('2019-11-16')]);

            // close the datePicker
            const overlayDiv = document.getElementsByClassName(HelperTestFunctions.MODAL_OVERLAY_CSSCLASS)[0];
            UIInteractions.simulateClickAndSelectEvent(overlayDiv);
            tick(400);
            fixture.detectChanges();

            datePicker.mode = 'dropdown';
            datePicker.monthsViewNumber = 2;
            tick();
            fixture.detectChanges();

            target = fixture.nativeElement.querySelector(HelperTestFunctions.ICON_CSSCLASS);
            UIInteractions.simulateClickAndSelectEvent(target);
            tick(400);
            fixture.detectChanges();

            overlay = document.querySelector(HelperTestFunctions.OVERLAY_CSSCLASS);
            HelperTestFunctions.verifyMonthsViewNumber(overlay, 2);
            HelperTestFunctions.verifyCalendarSubHeaders(overlay, [new Date('2019-09-16'), new Date('2019-10-16')]);
        }));

        it('Verify setting hideOutsideDays and monthsViewNumber from datepicker', fakeAsync(() => {
            const target = fixture.nativeElement.querySelector(HelperTestFunctions.ICON_CSSCLASS);
            UIInteractions.simulateClickAndSelectEvent(target);
            tick(400);
            fixture.detectChanges();

            expect(datePicker.hideOutsideDays).toBe(true);
            let overlay = document.querySelector(HelperTestFunctions.OVERLAY_CSSCLASS);
            expect(HelperTestFunctions.getHiddenDays(overlay, 0).length).toBe(HelperTestFunctions.getInactiveDays(overlay, 0).length);
            expect(HelperTestFunctions.getHiddenDays(overlay, 1).length).toBe(HelperTestFunctions.getInactiveDays(overlay, 1).length);
            expect(HelperTestFunctions.getHiddenDays(overlay, 2).length).toBe(HelperTestFunctions.getInactiveDays(overlay, 2).length);

            // close the datePicker
            const overlayDiv = document.getElementsByClassName(HelperTestFunctions.MODAL_OVERLAY_CSSCLASS)[0];
            UIInteractions.simulateClickAndSelectEvent(overlayDiv);
            tick(400);
            fixture.detectChanges();

            datePicker.hideOutsideDays = false;
            tick();
            fixture.detectChanges();

            UIInteractions.simulateClickAndSelectEvent(target);
            tick(400);
            fixture.detectChanges();

            expect(datePicker.hideOutsideDays).toBe(false);
            overlay = document.querySelector(HelperTestFunctions.OVERLAY_CSSCLASS);
            expect(HelperTestFunctions.getHiddenDays(overlay, 0).length).toBe(0);
            expect(HelperTestFunctions.getHiddenDays(overlay, 1).length).toBe(0);
            expect(HelperTestFunctions.getHiddenDays(overlay, 2).length).toBe(0);
        }));

    });
});

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

@Component({
    template: `
        <igx-calendar [monthsViewNumber]="monthViews" selection="multi" [(ngModel)]="model"></igx-calendar>
    `
})
export class MultiViewNgModelSampleComponent {
    @ViewChild(IgxCalendarComponent, { static: true }) public calendar: IgxCalendarComponent;
    public monthViews = 3;
    public model = new Date(2019, 9, 10);
}
