import { Component, ViewChild } from '@angular/core';
import { ComponentFixture, TestBed, fakeAsync, tick, waitForAsync } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { configureTestSuite } from '../test-utils/configure-suite';
import { UIInteractions, wait } from '../test-utils/ui-interactions.spec';
import { IgxCalendarComponent } from './public_api';
import { IgxDatePickerComponent } from '../date-picker/public_api';
import { DateRangeType } from '../core/dates';
import { HelperTestFunctions } from '../test-utils/calendar-helper-utils';

describe('Multi-View Calendar - ', () => {
    let fixture: ComponentFixture<any>
    let calendar: any;
    configureTestSuite();

    beforeAll(waitForAsync(() => {
        TestBed.configureTestingModule({
            imports: [
                NoopAnimationsModule,
                MultiViewCalendarSampleComponent,
                MultiViewDatePickerSampleComponent,
                MultiViewNgModelSampleComponent
            ]
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
            expect(HelperTestFunctions.getHiddenDays(fixture, 0).length).toBe(10);
            expect(HelperTestFunctions.getInactiveDays(fixture, 1).length).toBeGreaterThan(1);
            expect(HelperTestFunctions.getHiddenDays(fixture, 1).length).toBe(4);

            calendar.hideOutsideDays = true;
            fixture.detectChanges();

            expect(HelperTestFunctions.getHiddenDays(fixture, 0).length).toBe(HelperTestFunctions.getInactiveDays(fixture, 0).length);
            expect(HelperTestFunctions.getHiddenDays(fixture, 1).length).toBe(HelperTestFunctions.getInactiveDays(fixture, 1).length);
        });

        it('weekStart should be properly set to all month views', () => {
            expect(calendar.weekStart).toBe(0);
            const firstMonth = HelperTestFunctions.getMonthView(fixture, 0);
            let startDay = firstMonth.querySelector(HelperTestFunctions.WEEKSTART_LABEL_CSSCLASS);
            expect(startDay.innerText.trim()).toEqual('S');

            calendar.weekStart = 1;
            fixture.detectChanges();

            expect(calendar.weekStart).toBe(1);
            startDay = firstMonth.querySelector(HelperTestFunctions.WEEKSTART_LABEL_CSSCLASS);
            expect(startDay.innerText.trim()).toEqual('M');

            const secondMonth = HelperTestFunctions.getMonthView(fixture, 1);
            startDay = secondMonth.querySelector(HelperTestFunctions.WEEKSTART_LABEL_CSSCLASS);
            expect(startDay.innerText.trim()).toEqual('M');
        });

        it('calendar can be vertical when monthsViewNumber is set', () => {
            calendar.orientation = 'vertical';
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

        it('selected event should be fired when selecting a date', () => {
            spyOn(calendar.selected, 'emit');
            const viewDate = new Date('2019-09-06');
            calendar.viewDate = viewDate;
            fixture.detectChanges();

            let dateEls = HelperTestFunctions.getMonthViewDates(fixture, 0);
            UIInteractions.simulateClickAndSelectEvent(dateEls[15].firstChild);
            fixture.detectChanges();

            expect(calendar.selected.emit).toHaveBeenCalledTimes(1);
            expect(HelperTestFunctions.getMonthViewSelectedDates(fixture, 0).length).toBe(1);
            expect(HelperTestFunctions.getMonthViewSelectedDates(fixture, 1).length).toBe(0);
            expect(HelperTestFunctions.getMonthViewSelectedDates(fixture, 2).length).toBe(0);

            dateEls = HelperTestFunctions.getMonthViewDates(fixture, 1);
            UIInteractions.simulateClickAndSelectEvent(dateEls[21].firstChild);
            fixture.detectChanges();

            expect(calendar.selected.emit).toHaveBeenCalledTimes(2);
            expect(HelperTestFunctions.getMonthViewSelectedDates(fixture, 0).length).toBe(0);
            expect(HelperTestFunctions.getMonthViewSelectedDates(fixture, 1).length).toBe(1);
            expect(HelperTestFunctions.getMonthViewSelectedDates(fixture, 2).length).toBe(0);

            dateEls = HelperTestFunctions.getMonthViewDates(fixture, 2);
            UIInteractions.simulateClickAndSelectEvent(dateEls[19].firstChild);
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

        it('Verify navigation with arrow up', () => {
            const secondMonthDates = HelperTestFunctions.getMonthViewDates(fixture, 1);
            UIInteractions.simulateMouseDownEvent(secondMonthDates[10].firstChild); // TODO: Use pointerdown for focus & remove
            UIInteractions.simulateClickAndSelectEvent(secondMonthDates[10].firstChild);
            fixture.detectChanges();

            UIInteractions.triggerKeyDownEvtUponElem('ArrowUp', document.activeElement);
            fixture.detectChanges();
            expect(calendar.activeDate.getDate()).toEqual(4);

            UIInteractions.triggerKeyDownEvtUponElem('ArrowUp', document.activeElement);
            fixture.detectChanges();
            expect(calendar.activeDate.getDate()).toEqual(28);

            UIInteractions.triggerKeyDownEvtUponElem('ArrowUp', document.activeElement);
            fixture.detectChanges();
            expect(calendar.activeDate.getDate()).toEqual(21);

            UIInteractions.triggerKeyDownEvtUponElem('ArrowUp', document.activeElement);
            fixture.detectChanges();
            expect(calendar.activeDate.getDate()).toEqual(14);

            UIInteractions.triggerKeyDownEvtUponElem('ArrowUp', document.activeElement);
            fixture.detectChanges();
            expect(calendar.activeDate.getDate()).toEqual(7);

            // Verify months are not changed
            HelperTestFunctions.verifyCalendarSubHeaders(fixture, [oct2019, nov2019, dec2019]);

            UIInteractions.triggerKeyDownEvtUponElem('ArrowUp', document.activeElement);
            fixture.detectChanges();
            expect(calendar.activeDate.getDate()).toEqual(30);

            // Verify months are changed
            HelperTestFunctions.verifyCalendarSubHeaders(fixture, [sept2019, oct2019, nov2019]);
        });

        it('Verify navigation with arrow down', () => {
            const monthDates = HelperTestFunctions.getMonthViewDates(fixture, 1);
            UIInteractions.simulateMouseDownEvent(monthDates[22].firstChild); // TODO: Use pointerdown for focus & remove
            UIInteractions.simulateClickAndSelectEvent(monthDates[22].firstChild);
            fixture.detectChanges();

            UIInteractions.triggerKeyDownEvtUponElem('ArrowDown', document.activeElement);
            fixture.detectChanges();
            expect(calendar.activeDate.getDate()).toEqual(30);

            UIInteractions.triggerKeyDownEvtUponElem('ArrowDown', document.activeElement);
            fixture.detectChanges();
            expect(calendar.activeDate.getDate()).toEqual(7);

            UIInteractions.triggerKeyDownEvtUponElem('ArrowDown', document.activeElement);
            fixture.detectChanges();
            expect(calendar.activeDate.getDate()).toEqual(14);

            UIInteractions.triggerKeyDownEvtUponElem('ArrowDown', document.activeElement);
            fixture.detectChanges();
            expect(calendar.activeDate.getDate()).toEqual(21);

            UIInteractions.triggerKeyDownEvtUponElem('ArrowDown', document.activeElement);
            fixture.detectChanges();
            expect(calendar.activeDate.getDate()).toEqual(28);

            // Verify months are not changed
            HelperTestFunctions.verifyCalendarSubHeaders(fixture, [oct2019, nov2019, dec2019]);

            UIInteractions.triggerKeyDownEvtUponElem('ArrowDown', document.activeElement);
            fixture.detectChanges();
            expect(calendar.activeDate.getDate()).toEqual(4);

            HelperTestFunctions.verifyCalendarSubHeaders(fixture, [nov2019, dec2019, jan2020]);
        });

        it('Verify navigation with arrow left', () => {
            const secondMonthDates = HelperTestFunctions.getMonthViewDates(fixture, 1);
            UIInteractions.simulateMouseDownEvent(secondMonthDates[1].firstChild); // TODO: Use pointerdown for focus & remove
            UIInteractions.simulateClickAndSelectEvent(secondMonthDates[1].firstChild);
            fixture.detectChanges();

            UIInteractions.triggerKeyDownEvtUponElem('ArrowLeft', document.activeElement);
            fixture.detectChanges();
            expect(calendar.activeDate.getDate()).toEqual(1);

            UIInteractions.triggerKeyDownEvtUponElem('ArrowLeft', document.activeElement);
            fixture.detectChanges();
            expect(calendar.activeDate.getDate()).toEqual(31);

            UIInteractions.triggerKeyDownEvtUponElem('ArrowLeft', document.activeElement);
            fixture.detectChanges();
            expect(calendar.activeDate.getDate()).toEqual(30);

            // Go to the first day of the month
            UIInteractions.triggerKeyDownEvtUponElem('Home', document.activeElement);
            fixture.detectChanges();
            expect(calendar.activeDate.getDate()).toEqual(1);

            UIInteractions.triggerKeyDownEvtUponElem('ArrowLeft', document.activeElement);
            fixture.detectChanges();
            expect(calendar.activeDate.getDate()).toEqual(30);

            // Verify months are changed
            HelperTestFunctions.verifyCalendarSubHeaders(fixture, [sept2019, oct2019, nov2019]);
        });

        it('Verify navigation with arrow right', () => {
            const monthDates = HelperTestFunctions.getMonthViewDates(fixture, 1);
            UIInteractions.simulateMouseDownEvent(monthDates[20].firstChild); // TODO: Use pointerdown for focus & remove
            UIInteractions.simulateClickAndSelectEvent(monthDates[20].firstChild);
            fixture.detectChanges();

            UIInteractions.triggerKeyDownEvtUponElem('ArrowRight', document.activeElement);
            fixture.detectChanges();
            expect(calendar.activeDate.getDate()).toEqual(22);

            UIInteractions.triggerKeyDownEvtUponElem('End', document.activeElement);
            fixture.detectChanges();
            expect(calendar.activeDate.getDate()).toEqual(31);

            // Verify months aren't changed
            HelperTestFunctions.verifyCalendarSubHeaders(fixture, [oct2019, nov2019, dec2019]);

            UIInteractions.triggerKeyDownEvtUponElem('ArrowRight', document.activeElement);
            fixture.detectChanges();
            expect(calendar.activeDate.getDate()).toEqual(1);

            // Verify months are changed
            HelperTestFunctions.verifyCalendarSubHeaders(fixture, [nov2019, dec2019, jan2020]);
        });

        it('Verify navigation with arrow up when there are disabled dates', () => {
            calendar.viewDate = new Date(2019, 11, 25);
            calendar.disabledDates = dateRangeDescriptors;
            fixture.detectChanges();

            const secondMonthDates = HelperTestFunctions.getMonthViewDates(fixture, 1);
            UIInteractions.simulateMouseDownEvent(secondMonthDates[27].firstChild); // TODO: Use pointerdown for focus & remove
            UIInteractions.simulateClickAndSelectEvent(secondMonthDates[27].firstChild);
            fixture.detectChanges();

            UIInteractions.triggerKeyDownEvtUponElem('ArrowUp', document.activeElement);
            fixture.detectChanges();
            expect(calendar.activeDate.getDate()).toEqual(14);

            UIInteractions.triggerKeyDownEvtUponElem('ArrowUp', document.activeElement);
            fixture.detectChanges();
            expect(calendar.activeDate.getDate()).toEqual(10);

            // Verify months are not changed
            HelperTestFunctions.verifyCalendarSubHeaders(fixture, [dec2019, jan2020, feb2020]);

            UIInteractions.triggerKeyDownEvtUponElem('ArrowUp', document.activeElement);
            fixture.detectChanges();
            expect(calendar.activeDate.getDate()).toEqual(12);

            // Verify months are changed
            HelperTestFunctions.verifyCalendarSubHeaders(fixture, [nov2019, dec2019, jan2020]);
        });

        it('Verify navigation with arrow down when there are disabled dates', () => {
            calendar.viewDate = new Date(2019, 11, 25);
            calendar.disabledDates = dateRangeDescriptors;
            fixture.detectChanges();

            const secondMonthDates = HelperTestFunctions.getMonthViewDates(fixture, 1);
            UIInteractions.simulateMouseDownEvent(secondMonthDates[16].firstChild); // TODO: Use pointerdown for focus & remove
            UIInteractions.simulateClickAndSelectEvent(secondMonthDates[16].firstChild);
            fixture.detectChanges();

            UIInteractions.triggerKeyDownEvtUponElem('ArrowDown', document.activeElement);
            fixture.detectChanges();
            expect(calendar.activeDate.getDate()).toEqual(31);

            UIInteractions.triggerKeyDownEvtUponElem('ArrowDown', document.activeElement);
            fixture.detectChanges();
            expect(calendar.activeDate.getDate()).toEqual(21);

            UIInteractions.triggerKeyDownEvtUponElem('ArrowDown', document.activeElement);
            fixture.detectChanges();
            expect(calendar.activeDate.getDate()).toEqual(13);

            // Verify months are changed
            HelperTestFunctions.verifyCalendarSubHeaders(fixture, [jan2020, feb2020, march2020]);
        });

        it('Verify navigation with arrow left when there are disabled dates', () => {
            calendar.viewDate = new Date(2019, 11, 25);
            calendar.disabledDates = dateRangeDescriptors;
            fixture.detectChanges();

            const secondMonthDates = HelperTestFunctions.getMonthViewDates(fixture, 1);
            UIInteractions.simulateMouseDownEvent(secondMonthDates[25].firstChild); // TODO: Use pointerdown for focus & remove
            UIInteractions.simulateClickAndSelectEvent(secondMonthDates[25].firstChild);
            fixture.detectChanges();

            UIInteractions.triggerKeyDownEvtUponElem('ArrowLeft', document.activeElement);
            fixture.detectChanges();
            expect(calendar.activeDate.getDate()).toEqual(18);

            UIInteractions.triggerKeyDownEvtUponElem('Home', document.activeElement);
            fixture.detectChanges();
            expect(calendar.activeDate.getDate()).toEqual(9);

            // Verify months are not changed
            HelperTestFunctions.verifyCalendarSubHeaders(fixture, [dec2019, jan2020, feb2020]);

            UIInteractions.triggerKeyDownEvtUponElem('ArrowLeft', document.activeElement);
            fixture.detectChanges();
            expect(calendar.activeDate.getDate()).toEqual(14);

            // Verify months are changed
            HelperTestFunctions.verifyCalendarSubHeaders(fixture, [nov2019, dec2019, jan2020]);
        });

        it('Verify navigation with arrow right when there are disabled dates', () => {
            calendar.viewDate = new Date(2019, 11, 25);
            calendar.disabledDates = dateRangeDescriptors;
            fixture.detectChanges();

            const monthDates = HelperTestFunctions.getMonthViewDates(fixture, 1);
            UIInteractions.simulateMouseDownEvent(monthDates[17].firstChild); // TODO: Use pointerdown for focus & remove
            UIInteractions.simulateClickAndSelectEvent(monthDates[17].firstChild);
            fixture.detectChanges();

            UIInteractions.triggerKeyDownEvtUponElem('ArrowRight', document.activeElement);
            fixture.detectChanges();
            expect(calendar.activeDate.getDate()).toEqual(26);

            UIInteractions.triggerKeyDownEvtUponElem('End', document.activeElement);
            fixture.detectChanges();
            expect(calendar.activeDate.getDate()).toEqual(24);

            // Verify months are not changed
            HelperTestFunctions.verifyCalendarSubHeaders(fixture, [dec2019, jan2020, feb2020]);

            UIInteractions.triggerKeyDownEvtUponElem('ArrowRight', document.activeElement);
            fixture.detectChanges();
            expect(calendar.activeDate.getDate()).toEqual(12);

            // Verify months are changed
            HelperTestFunctions.verifyCalendarSubHeaders(fixture, [jan2020, feb2020, march2020]);
        });

        it('Verify navigation with pageUp', () => {
            const monthDates = HelperTestFunctions.getMonthViewDates(fixture, 1);
            UIInteractions.simulateMouseDownEvent(monthDates[16].firstChild); // TODO: Use pointerdown for focus & remove
            UIInteractions.simulateClickAndSelectEvent(monthDates[16].firstChild);
            fixture.detectChanges();

            UIInteractions.triggerKeyDownEvtUponElem('PageUp', document.activeElement);
            fixture.detectChanges();
            expect(calendar.activeDate.getDate()).toEqual(17);

            // Verify months are changed
            HelperTestFunctions.verifyCalendarSubHeaders(fixture, [sept2019, oct2019, nov2019]);

            UIInteractions.triggerKeyDownEvtUponElem('PageUp', document.activeElement);
            fixture.detectChanges();
            expect(calendar.activeDate.getDate()).toEqual(17);

            // Verify months are changed
            HelperTestFunctions.verifyCalendarSubHeaders(fixture, [aug2019, sept2019, oct2019]);
        });

        it('Verify navigation with pageDown', () => {
            const monthDates = HelperTestFunctions.getMonthViewDates(fixture, 1);
            UIInteractions.simulateMouseDownEvent(monthDates[17].firstChild); // TODO: Use pointerdown for focus & remove
            UIInteractions.simulateClickAndSelectEvent(monthDates[17].firstChild);
            fixture.detectChanges();

            UIInteractions.triggerKeyDownEvtUponElem('PageDown', document.activeElement);
            fixture.detectChanges();
            expect(calendar.activeDate.getDate()).toEqual(18);

            // Verify months are changed
            HelperTestFunctions.verifyCalendarSubHeaders(fixture, [nov2019, dec2019, jan2020]);

            UIInteractions.triggerKeyDownEvtUponElem('PageDown', document.activeElement);
            fixture.detectChanges();
            expect(calendar.activeDate.getDate()).toEqual(18);

            // Verify months are changed
            HelperTestFunctions.verifyCalendarSubHeaders(fixture, [dec2019, jan2020, feb2020]);
        });

        it('Verify navigation with Shift plus pageUp', () => {
            const monthDates = HelperTestFunctions.getMonthViewDates(fixture, 1);
            UIInteractions.simulateMouseDownEvent(monthDates[16].firstChild); // TODO: Use pointerdown for focus & remove
            UIInteractions.simulateClickAndSelectEvent(monthDates[16].firstChild);
            fixture.detectChanges();

            UIInteractions.triggerKeyDownEvtUponElem('PageUp', document.activeElement, true, false, true);
            fixture.detectChanges();

            expect(calendar.activeDate.getDate()).toEqual(17);
            expect(calendar.activeDate.getFullYear()).toEqual(2018);
            HelperTestFunctions.verifyCalendarSubHeaders(fixture, [new Date('2018-10-19'), new Date('2018-11-19'), new Date('2018-12-19')]);

            UIInteractions.triggerKeyDownEvtUponElem('PageUp', document.activeElement, true, false, true);
            fixture.detectChanges();

            expect(calendar.activeDate.getDate()).toEqual(17);
            expect(calendar.activeDate.getFullYear()).toEqual(2017);
            HelperTestFunctions.verifyCalendarSubHeaders(fixture, [new Date('2017-10-19'), new Date('2017-11-19'), new Date('2017-12-19')]);
        });

        it('Verify navigation with Shift plus pageDown', fakeAsync(() => {
            const monthDates = HelperTestFunctions.getMonthViewDates(fixture, 1);
            UIInteractions.simulateMouseDownEvent(monthDates[16].firstChild); // TODO: Use pointerdown for focus & remove
            UIInteractions.simulateClickAndSelectEvent(monthDates[16].firstChild);
            fixture.detectChanges();

            UIInteractions.triggerKeyDownEvtUponElem('PageDown', document.activeElement, true, false, true);
            fixture.detectChanges();

            expect(calendar.activeDate.getDate()).toEqual(17);
            expect(calendar.activeDate.getFullYear()).toEqual(2020);
            HelperTestFunctions.verifyCalendarSubHeaders(fixture, [new Date('2020-10-19'), new Date('2020-11-19'), new Date('2020-12-19')]);

            UIInteractions.triggerKeyDownEvtUponElem('PageDown', document.activeElement, true, false, true);
            fixture.detectChanges();

            expect(calendar.activeDate.getDate()).toEqual(17);
            expect(calendar.activeDate.getFullYear()).toEqual(2021);
            HelperTestFunctions.verifyCalendarSubHeaders(fixture, [oct2021, nov2021, dec2021]);
        }));

        it('Verify navigation with Home and End keys', () => {
            const monthDates = HelperTestFunctions.getMonthViewDates(fixture, 1);
            UIInteractions.simulateMouseDownEvent(monthDates[16].firstChild); // TODO: Use pointerdown for focus & remove
            UIInteractions.simulateClickAndSelectEvent(monthDates[16].firstChild);
            fixture.detectChanges();

            UIInteractions.triggerKeyDownEvtUponElem('Home', document.activeElement, true);
            fixture.detectChanges();
            expect(calendar.activeDate.getDate()).toEqual(1);

            UIInteractions.triggerKeyDownEvtUponElem('End', document.activeElement, true);
            fixture.detectChanges();
            expect(calendar.activeDate.getDate()).toEqual(31);
        });

        it('Verify navigation with Home and End keys when there are disabled dates', () => {
            calendar.disabledDates = [
                { type: DateRangeType.Between, dateRange: [new Date(2019, 9, 1), new Date(2019, 9, 14)] },
                { type: DateRangeType.Between, dateRange: [new Date(2019, 10, 12), new Date(2020, 0, 14)] }
            ];
            fixture.detectChanges();

            const monthDates = HelperTestFunctions.getMonthViewDates(fixture, 1);
            UIInteractions.simulateMouseDownEvent(monthDates[3].firstChild); // TODO: Use pointerdown for focus & remove
            UIInteractions.simulateClickAndSelectEvent(monthDates[3].firstChild);
            fixture.detectChanges();

            UIInteractions.triggerKeyDownEvtUponElem('Home', document.activeElement, true);
            fixture.detectChanges();
            expect(calendar.activeDate.getDate()).toEqual(15);

            UIInteractions.triggerKeyDownEvtUponElem('End', document.activeElement, true);
            fixture.detectChanges();
            expect(calendar.activeDate.getDate()).toEqual(11);
        });

        it('Verify that months increment/decrement continuously on enter keydown', async () => {
            calendar.monthsViewNumber = 2;
            fixture.detectChanges();

            const dates = [
                new Date("2019-10-15"),
                new Date("2019-11-15"),
                new Date("2019-12-15"),
                new Date("2020-1-15"),
                new Date("2020-2-15"),
                new Date("2020-3-15"),
                new Date("2020-4-15"),
            ];

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
        });

        it('Verify that months increment/decrement continuously on mouse down', async () => {
            calendar.monthsViewNumber = 2;
            fixture.detectChanges();

            const dates = [
                new Date("2019-10-15"),
                new Date("2019-11-15"),
                new Date("2019-12-15"),
                new Date("2020-1-15"),
                new Date("2020-2-15"),
                new Date("2020-3-15"),
                new Date("2020-4-15"),
            ];

            HelperTestFunctions.verifyCalendarSubHeaders(fixture, [dates[0], dates[1]]);

            for (let i = 1; i < dates.length - 1; i++) {
                const arrowRight = HelperTestFunctions.getNexArrowElement(fixture);
                UIInteractions.simulateMouseEvent('mousedown', arrowRight, 0, 0);
                await wait(100);
                fixture.detectChanges();

                HelperTestFunctions.verifyCalendarSubHeaders(fixture, [dates[i], dates[i + 1]]);
            }
            for (let index = dates.length - 2; index > 0; index--) {
                const arrowLeft = HelperTestFunctions.getPreviousArrowElement(fixture);
                UIInteractions.simulateMouseEvent('mousedown', arrowLeft, 0, 0);
                await wait(100);
                fixture.detectChanges();

                HelperTestFunctions.verifyCalendarSubHeaders(fixture, [dates[index - 1], dates[index]]);
            }
        });

        it('should be able to select a month after switching to months view', () => {
            const secondMonthPicker = HelperTestFunctions.getCalendarSubHeader(fixture)
                .querySelectorAll(HelperTestFunctions.CALENDAR_DATE_CSSCLASS)[2];

            UIInteractions.simulateMouseDownEvent(secondMonthPicker as HTMLElement);
            fixture.detectChanges();

            const months = HelperTestFunctions.getMonthsFromMonthView(fixture);
            expect(months.length).toBe(12);

            UIInteractions.triggerKeyDownEvtUponElem('ArrowUp', document.activeElement);
            fixture.detectChanges();
            expect(document.activeElement.getAttribute('aria-activeDescendant')).toEqual(months[7].id);

            UIInteractions.triggerKeyDownEvtUponElem('ArrowLeft', document.activeElement);
            fixture.detectChanges();
            expect(document.activeElement.getAttribute('aria-activeDescendant')).toEqual(months[6].id);

            UIInteractions.triggerKeyDownEvtUponElem('ArrowDown', document.activeElement);
            fixture.detectChanges();
            expect(document.activeElement.getAttribute('aria-activeDescendant')).toEqual(months[9].id);

            UIInteractions.triggerKeyDownEvtUponElem('ArrowRight', document.activeElement);
            fixture.detectChanges();
            expect(document.activeElement.getAttribute('aria-activeDescendant')).toEqual(months[10].id);

            UIInteractions.triggerKeyDownEvtUponElem('Enter', document.activeElement);
            fixture.detectChanges();
            HelperTestFunctions.verifyCalendarSubHeaders(fixture, [oct2019, nov2019, dec2019]);
        });

        it('should be able to select a year after switching to years view', () => {
            const secondYearPicker = HelperTestFunctions.getCalendarSubHeader(fixture)
                .querySelectorAll(HelperTestFunctions.CALENDAR_DATE_CSSCLASS)[3];

            UIInteractions.simulateMouseDownEvent(secondYearPicker as HTMLElement);
            fixture.detectChanges();

            const years = HelperTestFunctions.getYearsFromYearView(fixture);
            expect(years.length).toBe(15);

            UIInteractions.triggerKeyDownEvtUponElem('ArrowUp', document.activeElement);
            fixture.detectChanges();
            expect(document.activeElement.getAttribute('aria-activeDescendant')).toEqual(years[6].id);

            UIInteractions.triggerKeyDownEvtUponElem('ArrowLeft', document.activeElement);
            fixture.detectChanges();
            expect(document.activeElement.getAttribute('aria-activeDescendant')).toEqual(years[5].id);

            UIInteractions.triggerKeyDownEvtUponElem('ArrowDown', document.activeElement);
            fixture.detectChanges();
            expect(document.activeElement.getAttribute('aria-activeDescendant')).toEqual(years[8].id);

            UIInteractions.triggerKeyDownEvtUponElem('ArrowRight', document.activeElement);
            fixture.detectChanges();
            expect(document.activeElement.getAttribute('aria-activeDescendant')).toEqual(years[9].id);

            UIInteractions.triggerKeyDownEvtUponElem('Enter', document.activeElement);
            fixture.detectChanges();

            UIInteractions.triggerKeyDownEvtUponElem('Enter', document.activeElement);
            fixture.detectChanges();
            HelperTestFunctions.verifyCalendarSubHeaders(fixture, [sept2019, oct2019, nov2019]);
        });

    });

    describe('Selection tests - ', () => {
        const septemberDate = new Date('2019-09-16');
        const octoberDate = new Date('2019-10-16');
        const novemberDate = new Date('2019-11-16');
        const decemberDate = new Date('2019-12-16');
        beforeEach(fakeAsync(() => {
            fixture = TestBed.createComponent(MultiViewCalendarSampleComponent);
            fixture.detectChanges();
            calendar = fixture.componentInstance.calendar;
            calendar.viewDate = new Date(2019, 8, 1); // 1st September 2019
            tick();
            fixture.detectChanges();
        }));


        it('should select the days in only in of the months in single/multi selection mode', () => {
            spyOn(calendar.selected, 'emit');

            const fistMonthDates = HelperTestFunctions.getMonthViewDates(fixture, 0);
            const secondMonthDates = HelperTestFunctions.getMonthViewDates(fixture, 1);

            UIInteractions.simulateClickAndSelectEvent(fistMonthDates[29].firstChild);
            fixture.detectChanges();

            expect(calendar.selected.emit).toHaveBeenCalledTimes(1);
            expect(HelperTestFunctions.getMonthViewSelectedDates(fixture, 0).length).toBe(1);
            expect(HelperTestFunctions.getMonthViewSelectedDates(fixture, 1).length).toBe(0);

            calendar.selection = 'multi';
            fixture.detectChanges();

            expect(HelperTestFunctions.getMonthViewSelectedDates(fixture, 0).length).toBe(0);
            expect(HelperTestFunctions.getMonthViewSelectedDates(fixture, 1).length).toBe(0);

            UIInteractions.simulateClickAndSelectEvent(secondMonthDates[2].firstChild);
            fixture.detectChanges();
            UIInteractions.simulateClickAndSelectEvent(secondMonthDates[3].firstChild);
            fixture.detectChanges();
            UIInteractions.simulateClickAndSelectEvent(secondMonthDates[28].firstChild);
            fixture.detectChanges();
            UIInteractions.simulateClickAndSelectEvent(secondMonthDates[29].firstChild);
            fixture.detectChanges();

            expect(calendar.selected.emit).toHaveBeenCalledTimes(5);
            expect(HelperTestFunctions.getMonthViewSelectedDates(fixture, 0).length).toBe(0);
            expect(HelperTestFunctions.getMonthViewSelectedDates(fixture, 1).length).toBe(4);
            expect(HelperTestFunctions.getMonthViewSelectedDates(fixture, 2).length).toBe(0);
        });

        it('Multi Selection - select/deselect date in the view', () => {
            spyOn(calendar.selected, 'emit');
            calendar.selection = 'multi';
            fixture.detectChanges();

            const octoberFourth = new Date('2019-10-4');
            const octoberThird = new Date('2019-10-3');
            const secondMonthDates = HelperTestFunctions.getMonthViewDates(fixture, 1);
            UIInteractions.simulateClickAndSelectEvent(secondMonthDates[2].firstChild);
            fixture.detectChanges();

            calendar.selectDate(octoberFourth);
            fixture.detectChanges();

            expect(calendar.selected.emit).toHaveBeenCalledTimes(1);
            expect(HelperTestFunctions.getMonthViewSelectedDates(fixture, 0).length).toBe(0);
            expect(HelperTestFunctions.getMonthViewSelectedDates(fixture, 1).length).toBe(2);

            UIInteractions.simulateClickAndSelectEvent(secondMonthDates[3].firstChild);
            fixture.detectChanges();

            expect(calendar.selected.emit).toHaveBeenCalledTimes(2);
            expect(HelperTestFunctions.getMonthViewSelectedDates(fixture, 0).length).toBe(0);
            expect(HelperTestFunctions.getMonthViewSelectedDates(fixture, 1).length).toBe(1);

            calendar.deselectDate([octoberThird]);
            fixture.detectChanges();

            expect(calendar.selected.emit).toHaveBeenCalledTimes(2);
            expect(HelperTestFunctions.getMonthViewSelectedDates(fixture, 0).length).toBe(0);
            expect(HelperTestFunctions.getMonthViewSelectedDates(fixture, 1).length).toBe(0);
        });

        it('should select/deselect dates in multiple day views with Shift key pressed', () => {
            calendar.selection = 'multi';
            fixture.detectChanges();

            const octoberDates = HelperTestFunctions.getMonthViewDates(fixture, 1);
            const novemberDates = HelperTestFunctions.getMonthViewDates(fixture, 2);
            const october27th = octoberDates[26];
            const november3rd = novemberDates[2];

            UIInteractions.simulateClickAndSelectEvent(october27th.firstChild);
            UIInteractions.simulateClickAndSelectEvent(november3rd.firstChild, true);
            fixture.detectChanges();

            expect(HelperTestFunctions.getMonthViewSelectedDates(fixture, 1).length).toBe(5);
            expect(HelperTestFunctions.getMonthViewSelectedDates(fixture, 2).length).toBe(3);


            UIInteractions.simulateClickAndSelectEvent(october27th.firstChild, true);
            fixture.detectChanges();

            expect(HelperTestFunctions.getMonthViewSelectedDates(fixture, 1).length).toBe(1);
            expect(HelperTestFunctions.getMonthViewSelectedDates(fixture, 2).length).toBe(0);
        });

        it('should select multiple dates should while not creating a range', () => {
            calendar.selection = 'multi';
            fixture.detectChanges();

            calendar.selectDate([
                new Date("2019-10-29"),
                new Date("2019-11-2"),
                new Date("2019-10-31"),
                new Date("2019-11-1"),
                new Date("2019-10-30"),
            ]);
            fixture.detectChanges();

            expect(HelperTestFunctions.getMonthViewSelectedDates(fixture, 1).length).toBe(3);
            expect(HelperTestFunctions.getMonthViewSelectedDates(fixture, 2).length).toBe(2);

            HelperTestFunctions.verifyNoRangeSelectionCreated(fixture, 1);
            HelperTestFunctions.verifyNoRangeSelectionCreated(fixture, 2);

            calendar.selection = 'single';
            fixture.detectChanges();

            calendar.selectDate(new Date('2019-10-29'));
            fixture.detectChanges();

            calendar.selectDate(new Date('2019-10-30'));
            fixture.detectChanges();

            expect(HelperTestFunctions.getMonthViewSelectedDates(fixture, 1).length).toBe(1);
            expect(HelperTestFunctions.getMonthViewSelectedDates(fixture, 2).length).toBe(0);
            HelperTestFunctions.verifyNoRangeSelectionCreated(fixture, 1);
            HelperTestFunctions.verifyNoRangeSelectionCreated(fixture, 2);
        });

        it('outside month days should be hidden when hideOutsideDays is true', () => {
            calendar.monthsViewNumber = 2;
            fixture.detectChanges();

            expect(HelperTestFunctions.getHiddenDays(fixture, 0).length).toBe(12);
            expect(HelperTestFunctions.getHiddenDays(fixture, 1).length).toBe(2);

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

            const inactiveDaysOctober = HelperTestFunctions.getInactiveDays(fixture, 1);
            UIInteractions.simulateClickAndSelectEvent(inactiveDaysOctober[8].firstChild);
            fixture.detectChanges();

            HelperTestFunctions.verifyCalendarSubHeaders(fixture, [novemberDate, decemberDate]);

            const inactiveDaysNovember = HelperTestFunctions.getInactiveDays(fixture, 0);
            UIInteractions.simulateClickAndSelectEvent(inactiveDaysNovember[0].firstChild);
            fixture.detectChanges();

            HelperTestFunctions.verifyCalendarSubHeaders(fixture, [octoberDate, novemberDate]);
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
            UIInteractions.simulateClickAndSelectEvent(secondMonthDates[0].firstChild);
            fixture.detectChanges();

            expect(calendar.selected.emit).toHaveBeenCalledTimes(1);

            UIInteractions.simulateClickAndSelectEvent(secondMonthDates[30].firstChild);
            fixture.detectChanges();
            expect(calendar.selected.emit).toHaveBeenCalledTimes(2);

            HelperTestFunctions.getMonthViewSelectedDates(fixture, 0).forEach((el: HTMLElement) => {
                expect(el.classList.contains(HelperTestFunctions.RANGE_CSSCLASS)).toBeTruthy();
            });

            HelperTestFunctions.getMonthViewSelectedDates(fixture, 1).forEach((el: HTMLElement) => {
                expect(el.classList.contains(HelperTestFunctions.RANGE_CSSCLASS)).toBeTruthy();
            });

            HelperTestFunctions.getMonthViewSelectedDates(fixture, 2).forEach((el: HTMLElement) => {
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
            UIInteractions.simulateClickAndSelectEvent(secondMonthDates[16].firstChild);

            fixture.detectChanges();
            expect(calendar.value[0].getTime()).toEqual(new Date(2019, 9, 10).getTime());
            expect(calendar.daysView.value[0].getTime()).toEqual(new Date(2019, 9, 10).getTime());

            UIInteractions.simulateClickAndSelectEvent(secondMonthDates[17].firstChild);

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
            datePicker.close();
            tick(400);
            fixture.detectChanges();

            datePicker.mode = 'dropdown';
            datePicker.displayMonthsCount = 2;
            tick();
            fixture.detectChanges();

            target = fixture.nativeElement.querySelector(HelperTestFunctions.ICON_CSSCLASS);
            UIInteractions.simulateClickAndSelectEvent(target);
            tick(400);
            fixture.detectChanges();

            overlay = document.querySelector(HelperTestFunctions.OVERLAY_CSSCLASS);
            HelperTestFunctions.verifyMonthsViewNumber(overlay, 2);
            HelperTestFunctions.verifyCalendarSubHeaders(overlay, [new Date('2019-09-16'), new Date('2019-10-16')]);

            // clean up test
            tick(350);
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
            datePicker.close();
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
            expect(HelperTestFunctions.getHiddenDays(overlay, 0).length).toBe(12);
            expect(HelperTestFunctions.getHiddenDays(overlay, 1).length).toBe(11);
            expect(HelperTestFunctions.getHiddenDays(overlay, 2).length).toBe(5);

            // clean up test
            tick(350);
        }));
    });
});

@Component({
    template: `
        <igx-calendar [monthsViewNumber]="monthViews"></igx-calendar>
    `,
    imports: [IgxCalendarComponent]
})
export class MultiViewCalendarSampleComponent {
    @ViewChild(IgxCalendarComponent, { static: true }) public calendar: IgxCalendarComponent;
    public monthViews = 3;
}

@Component({
    template: `
        <igx-date-picker [value]="date" [displayMonthsCount]="monthViews" [hideOutsideDays]="true"></igx-date-picker>
    `,
    imports: [IgxDatePickerComponent]
})
export class MultiViewDatePickerSampleComponent {
    @ViewChild(IgxDatePickerComponent, { static: true }) public datePicker: IgxDatePickerComponent;
    public date = new Date('2019-09-15');
    public monthViews = 3;
}

@Component({
    template: `
        <igx-calendar [monthsViewNumber]="monthViews" selection="multi" [(ngModel)]="model"></igx-calendar>
    `,
    imports: [IgxCalendarComponent, FormsModule]
})
export class MultiViewNgModelSampleComponent {
    @ViewChild(IgxCalendarComponent, { static: true }) public calendar: IgxCalendarComponent;
    public monthViews = 3;
    public model = new Date(2019, 9, 10);
}
