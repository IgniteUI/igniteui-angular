import { Component, ViewChild } from '@angular/core';
import { TestBed, tick, fakeAsync, flush, waitForAsync } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import {
    Calendar, IgxCalendarComponent, IgxCalendarModule, isLeap,
    monthRange, weekDay, WEEKDAYS
} from './public_api';
import { UIInteractions } from '../test-utils/ui-interactions.spec';
import { DateRangeDescriptor, DateRangeType } from '../core/dates/dateRange';

import { configureTestSuite } from '../test-utils/configure-suite';
import { IgxDayItemComponent } from './days-view/day-item.component';
import { HelperTestFunctions } from './calendar-helper-utils';
import { IgxCalendarView } from './month-picker-base';
import { IViewDateChangeEventArgs } from './calendar-base';

describe('IgxCalendar - ', () => {

    it('Should create proper calendar model', () => {
        const calendar = new Calendar();
        expect(calendar.firstWeekDay).toEqual(WEEKDAYS.SUNDAY);
        expect(calendar.weekdays()).toEqual([0, 1, 2, 3, 4, 5, 6]);

        const weeks = calendar.monthdatescalendar(2017, 5);
        const firstWeek = weeks[0];
        const lastWeek = weeks[weeks.length - 1];

        expect(firstWeek[0].date.toDateString()).toMatch(
            new Date(2017, 4, 28).toDateString()
        );
        expect(lastWeek[lastWeek.length - 1].date.toDateString()).toMatch(
            new Date(2017, 6, 1).toDateString()
        );

        // 2017 June with first day set to Sunday
        let dates = calendar.monthdates(2017, 5);
        expect(dates[0].date.toDateString()).toMatch(
            new Date(2017, 4, 28).toDateString()
        );
        expect(dates[dates.length - 1].date.toDateString()).toMatch(
            new Date(2017, 6, 1).toDateString()
        );
        expect(dates.length).toEqual(35);

        // 2017 June with first day set to Sunday and extra week
        dates = calendar.monthdates(2017, 5, true);
        expect(dates.length).toEqual(42);
        expect(dates[0].date.toDateString()).toMatch(
            new Date(2017, 4, 28).toDateString()
        );
        expect(dates[dates.length - 1].date.toDateString()).toMatch(
            new Date(2017, 6, 8).toDateString()
        );

        calendar.firstWeekDay = WEEKDAYS.FRIDAY;
        expect(calendar.firstWeekDay).toEqual(WEEKDAYS.FRIDAY);
        expect(calendar.weekdays()).toEqual([5, 6, 0, 1, 2, 3, 4]);

        // 2017 June with first day set to Friday
        dates = calendar.monthdates(2017, 5);
        expect(dates[0].date.toDateString()).toMatch(
            new Date(2017, 4, 26).toDateString()
        );
        expect(dates[dates.length - 1].date.toDateString()).toMatch(
            new Date(2017, 6, 6).toDateString()
        );
        expect(dates.length).toEqual(42);

        // Leap year tests - 2016
        calendar.firstWeekDay = WEEKDAYS.SUNDAY;
        dates = calendar.monthdates(2016, 1);
        expect(dates[0].date.toDateString()).toMatch(
            new Date(2016, 0, 31).toDateString()
        );
        expect(dates[dates.length - 1].date.toDateString()).toMatch(
            new Date(2016, 2, 5).toDateString()
        );
        expect(dates.length).toEqual(35);
    });

    it('Should receive correct values from utility functions', () => {
        const calendar = new Calendar();

        // Leap year
        expect(isLeap(2017)).toBe(false);
        expect(isLeap(2016)).toBe(true);

        // monthRange
        expect(() => monthRange(2017, -1)).toThrow();
        expect(() => monthRange(2017, 12)).toThrow();
        expect(monthRange(2017, 5)).toEqual([weekDay(2017, 5, 1), 30]);
        expect(monthRange(2016, 1)).toEqual([weekDay(2016, 1, 1), 29]); // Leap year

        // Calendar timedelta
        const startDate = new Date(2017, 0, 1, 0, 0, 0);

        // Year timedelta
        let newDate = calendar.timedelta(startDate, 'year', 1);
        expect(newDate.getFullYear()).toEqual(2018);
        newDate = calendar.timedelta(startDate, 'year', -1);
        expect(newDate.getFullYear()).toEqual(2016);

        // Quarter timedelta
        newDate = calendar.timedelta(startDate, 'quarter', 1);
        expect(newDate.getMonth()).toEqual(3);
        newDate = calendar.timedelta(startDate, 'quarter', -1);
        expect(newDate.getFullYear()).toEqual(2016);
        expect(newDate.getMonth()).toEqual(9);

        // Month timedelta
        newDate = calendar.timedelta(startDate, 'month', 1);
        expect(newDate.getMonth()).toEqual(1);
        newDate = calendar.timedelta(startDate, 'month', -1);
        expect(newDate.getFullYear()).toEqual(2016);
        expect(newDate.getMonth()).toEqual(11);

        // Week timedelta
        newDate = calendar.timedelta(startDate, 'week', 1);
        expect(newDate.getDate()).toEqual(8);
        newDate = calendar.timedelta(startDate, 'week', -1);
        expect(newDate.getFullYear()).toEqual(2016);
        expect(newDate.getDate()).toEqual(25);

        // Day timedelta
        newDate = calendar.timedelta(startDate, 'day', 3);
        expect(newDate.getDate()).toEqual(4);
        expect(calendar.timedelta(startDate, 'day', 7).toDateString()).toEqual(
            calendar.timedelta(startDate, 'week', 1).toDateString()
        );
        newDate = calendar.timedelta(startDate, 'day', -3);
        expect(newDate.getFullYear()).toEqual(2016);
        expect(newDate.getDate()).toEqual(29);

        // Hour timedelta
        newDate = calendar.timedelta(startDate, 'hour', 1);
        expect(newDate.getHours()).toEqual(1);
        newDate = calendar.timedelta(startDate, 'hour', 24);
        expect(newDate.getDate()).toEqual(2);
        expect(newDate.getHours()).toEqual(0);
        newDate = calendar.timedelta(startDate, 'hour', -1);
        expect(newDate.getHours()).toEqual(23);
        expect(newDate.getDate()).toEqual(31);
        expect(newDate.getFullYear()).toEqual(2016);

        // Minute timedelta
        newDate = calendar.timedelta(startDate, 'minute', 60);
        expect(newDate.getHours()).toEqual(1);
        newDate = calendar.timedelta(startDate, 'minute', 24 * 60);
        expect(newDate.getDate()).toEqual(2);
        expect(newDate.getHours()).toEqual(0);
        newDate = calendar.timedelta(startDate, 'minute', -60);
        expect(newDate.getHours()).toEqual(23);
        expect(newDate.getDate()).toEqual(31);
        expect(newDate.getFullYear()).toEqual(2016);

        // Seconds timedelta
        newDate = calendar.timedelta(startDate, 'second', 3600);
        expect(newDate.getHours()).toEqual(1);
        newDate = calendar.timedelta(startDate, 'second', 24 * 3600);
        expect(newDate.getDate()).toEqual(2);
        expect(newDate.getHours()).toEqual(0);
        newDate = calendar.timedelta(startDate, 'second', -3600);
        expect(newDate.getHours()).toEqual(23);
        expect(newDate.getDate()).toEqual(31);
        expect(newDate.getFullYear()).toEqual(2016);

        // Throws on invalid interval
        expect(() => calendar.timedelta(startDate, 'nope', 1)).toThrow();
    });

    describe('', () => {
        configureTestSuite();
        beforeAll(waitForAsync(() => {
            TestBed.configureTestingModule({
                declarations: [IgxCalendarSampleComponent, IgxCalendarRangeComponent, IgxCalendarDisabledSpecialDatesComponent,
                IgxCalendarValueComponent],
                imports: [IgxCalendarModule, FormsModule, NoopAnimationsModule]
            }).compileComponents();
        }));

        describe('Rendered Component - ', () => {
            let fixture; let calendar; let dom;
            beforeEach(
                waitForAsync(() => {
                    fixture = TestBed.createComponent(IgxCalendarSampleComponent);
                    fixture.detectChanges();
                    calendar = fixture.componentInstance.calendar;
                    dom = fixture.debugElement;
                })
            );

            it('Should initialize a calendar component', () => {
                expect(fixture.componentInstance).toBeDefined();
            });

            it('Should initialize a calendar component with `id` property', () => {
                const domCalendar = dom.query(By.css(HelperTestFunctions.CALENDAR)).nativeElement;

                expect(calendar.id).toContain('igx-calendar-');
                expect(domCalendar.id).toContain('igx-calendar-');

                calendar.id = 'customCalendar';
                fixture.detectChanges();

                expect(calendar.id).toBe('customCalendar');
                expect(domCalendar.id).toBe('customCalendar');
            });

            it('Should properly set @Input properties and setters', () => {
                expect(calendar.weekStart).toEqual(WEEKDAYS.SUNDAY);
                expect(calendar.selection).toEqual('single');

                const today = new Date(Date.now());
                calendar.viewDate = today;
                fixture.detectChanges();

                calendar.weekStart = WEEKDAYS.MONDAY;
                expect(calendar.weekStart).toEqual(1);

                calendar.value = new Date(today);
                fixture.detectChanges();
                expect(
                    (fixture.componentInstance.model as Date).toDateString()
                ).toMatch(today.toDateString());
                expect((calendar.value as Date).toDateString()).toMatch(
                    today.toDateString()
                );

                expect(() => (calendar.selection = 'non-existant')).toThrow();
            });

            it('Should properly set formatOptions and formatViews', () => {
                fixture.componentInstance.viewDate = new Date(2018, 8, 17);
                fixture.componentInstance.model = new Date();
                fixture.detectChanges();

                const defaultOptions = {
                    day: 'numeric',
                    month: 'short',
                    weekday: 'short',
                    year: 'numeric'
                };
                const defaultViews = { day: false, month: true, year: false };
                const bodyMonth = dom.query(By.css(HelperTestFunctions.CALENDAR_DATE_CSSCLASS));
                const headerYear = dom.query(By.css(HelperTestFunctions.CALENDAR_HEADER_YEAR_CSSCLASS));
                const bodyYear = dom.queryAll(By.css(HelperTestFunctions.CALENDAR_DATE_CSSCLASS))[1];
                const headerWeekday = dom.queryAll(By.css(`${HelperTestFunctions.CALENDAR_HEADER_DATE_CSSCLASS} span`))[0];
                const headerDate = dom.queryAll(By.css(`${HelperTestFunctions.CALENDAR_HEADER_DATE_CSSCLASS} span`))[1];

                calendar.selectDate(calendar.viewDate);
                fixture.detectChanges();

                expect(calendar.formatOptions).toEqual(jasmine.objectContaining(defaultOptions));
                expect(calendar.formatViews).toEqual(jasmine.objectContaining(defaultViews));
                expect(headerYear.nativeElement.textContent.trim()).toMatch('2018');
                expect(headerWeekday.nativeElement.textContent.trim()).toMatch('Sat');
                expect(headerDate.nativeElement.textContent.trim()).toMatch('Sep 1');
                expect(bodyYear.nativeElement.textContent.trim()).toMatch('2018');
                expect(bodyMonth.nativeElement.textContent.trim()).toMatch('Sep');

                // change formatOptions and formatViews
                const formatOptions: any = { month: 'long', year: '2-digit' };
                const formatViews: any = { month: true, year: true };
                calendar.formatOptions = formatOptions;
                calendar.formatViews = formatViews;
                fixture.detectChanges();

                expect(calendar.formatOptions).toEqual(jasmine.objectContaining(Object.assign(defaultOptions, formatOptions)));
                expect(calendar.formatViews).toEqual(jasmine.objectContaining(Object.assign(defaultViews, formatViews)));
                expect(headerYear.nativeElement.textContent.trim()).toMatch('18');
                expect(headerWeekday.nativeElement.textContent.trim()).toMatch('Sat');
                expect(headerDate.nativeElement.textContent.trim()).toMatch('September 1');
                expect(bodyYear.nativeElement.textContent.trim()).toMatch('18');
                expect(bodyMonth.nativeElement.textContent.trim()).toMatch('September');

                // change formatOptions and formatViews
                formatOptions.year = 'numeric';
                formatViews.day = true;
                formatViews.month = false;
                calendar.formatOptions = formatOptions;
                calendar.formatViews = formatViews;
                fixture.detectChanges();

                expect(calendar.formatOptions).toEqual(jasmine.objectContaining(Object.assign(defaultOptions, formatOptions)));
                expect(calendar.formatViews).toEqual(jasmine.objectContaining(Object.assign(defaultViews, formatViews)));
                expect(headerYear.nativeElement.textContent.trim()).toMatch('2018');
                expect(headerWeekday.nativeElement.textContent.trim()).toMatch('Sat');
                expect(headerDate.nativeElement.textContent.trim()).toMatch('September 1');
                expect(bodyYear.nativeElement.textContent.trim()).toMatch('2018');
                expect(bodyMonth.nativeElement.textContent.trim()).toMatch('8');
            });

            it('Should show right month when value is set', () => {
                fixture = TestBed.createComponent(IgxCalendarValueComponent);
                fixture.detectChanges();
                calendar = fixture.componentInstance.calendar;

                expect(calendar.weekStart).toEqual(WEEKDAYS.SUNDAY);
                expect(calendar.selection).toEqual('single');
                expect(calendar.viewDate.getMonth()).toEqual(calendar.value.getMonth());

                const date = new Date(2020, 8, 28);
                calendar.viewDate = date;
                fixture.detectChanges();

                expect(calendar.viewDate.getMonth()).toEqual(date.getMonth());

                calendar.value = new Date(2020, 9, 15);
                fixture.detectChanges();

                expect(calendar.viewDate.getMonth()).toEqual(date.getMonth());
            });

            it('Should properly set locale', () => {
                fixture.componentInstance.viewDate = new Date(2018, 8, 17);
                fixture.componentInstance.model = new Date();
                fixture.detectChanges();

                const bodyMonth = dom.query(By.css(HelperTestFunctions.CALENDAR_DATE_CSSCLASS));
                const headerYear = dom.query(By.css(HelperTestFunctions.CALENDAR_HEADER_YEAR_CSSCLASS));
                const bodyYear = dom.queryAll(By.css(HelperTestFunctions.CALENDAR_DATE_CSSCLASS))[1];
                const headerWeekday = dom.queryAll(By.css(`${HelperTestFunctions.CALENDAR_HEADER_DATE_CSSCLASS} span`))[0];
                const headerDate = dom.queryAll(By.css(`${HelperTestFunctions.CALENDAR_HEADER_DATE_CSSCLASS} span`))[1];
                let bodyWeekday = dom.query(By.css(HelperTestFunctions.WEEKSTART_LABEL_CSSCLASS));

                calendar.selectDate(calendar.viewDate);
                fixture.detectChanges();

                expect(headerYear.nativeElement.textContent.trim()).toMatch('2018');
                expect(headerWeekday.nativeElement.textContent.trim()).toMatch('Sat');
                expect(headerDate.nativeElement.textContent.trim()).toMatch('Sep 1');
                expect(bodyYear.nativeElement.textContent.trim()).toMatch('2018');
                expect(bodyMonth.nativeElement.textContent.trim()).toMatch('Sep');
                expect(bodyWeekday.nativeElement.textContent.trim()).toMatch('Sun');

                // change formatOptions and formatViews
                const locale = 'fr';
                calendar.locale = locale;
                fixture.detectChanges();

                bodyWeekday = dom.query(By.css(HelperTestFunctions.WEEKSTART_LABEL_CSSCLASS));
                expect(calendar.locale).toEqual(locale);
                expect(headerYear.nativeElement.textContent.trim()).toMatch('18');
                expect(headerWeekday.nativeElement.textContent.trim()).toMatch('sam.,');
                expect(headerDate.nativeElement.textContent.trim()).toMatch('1 sept.');
                expect(bodyYear.nativeElement.textContent.trim()).toMatch('18');
                expect(bodyMonth.nativeElement.textContent.trim()).toMatch('sept.');
                expect(bodyWeekday.nativeElement.textContent.trim()).toMatch('Dim.');
            });

            it('Should properly render calendar DOM structure', () => {
                const today = new Date(Date.now());
                calendar.viewDate = today;
                fixture.detectChanges();
                const calendarRows = dom.queryAll(By.css(HelperTestFunctions.CALENDAR_ROW_CSSCLASS));

                // 6 weeks + week header
                expect(calendarRows.length).toEqual(7);

                // 6 calendar rows * 7 elements in each
                expect(
                    dom.queryAll(By.css(`${HelperTestFunctions.CALENDAR_ROW_CSSCLASS} > igx-day-item`)).length
                ).toEqual(42);
                expect(
                    dom.queryAll(By.css(`${HelperTestFunctions.CALENDAR_ROW_CSSCLASS} > span`)).length
                ).toEqual(7);

                // Today class applied
                expect(
                    dom
                        .query(By.css(HelperTestFunctions.CURRENT_DATE_CSSCLASS))
                        .nativeElement.textContent.trim()
                ).toMatch(today.getDate().toString());

                // Hide calendar header when not single selection
                calendar.selection = 'multi';
                fixture.detectChanges();

                const calendarHeader = dom.query(By.css(HelperTestFunctions.CALENDAR_HEADER_CSSCLASS));
                expect(calendarHeader).toBeFalsy();
            });

            it('Should properly render calendar DOM with week numbers enabled', () => {
                const today = new Date(Date.now());
                calendar.viewDate = today;
                calendar.showWeekNumbers = true;
                fixture.detectChanges();

                const calendarRows = dom.queryAll(By.css(HelperTestFunctions.CALENDAR_ROW_CSSCLASS));
                expect(calendarRows.length).toEqual(7);

                // 6 calendar rows * 8 elements in each
                expect(
                    dom.queryAll(By.css(`${HelperTestFunctions.CALENDAR_ROW_CSSCLASS} > igx-day-item`)).length +
                    dom.queryAll(By.css(`${HelperTestFunctions.CALENDAR_ROW_CSSCLASS} >
                        ${HelperTestFunctions.CALENDAR_WEEK_NUMBER_CLASS}`)).length
                ).toEqual(48);
                expect(
                    dom.queryAll(By.css(`${HelperTestFunctions.CALENDAR_ROW_CSSCLASS} > span`)).length +
                    dom.queryAll(
                        By.css(`${HelperTestFunctions.CALENDAR_ROW_CSSCLASS} > ${HelperTestFunctions.CALENDAR_WEEK_NUMBER_LABEL_CLASS}`)
                    ).length
                ).toEqual(8);

            });

            it('Week numbers should appear as first column', () => {
                const firstWeekOfTheYear = new Date(2020, 0, 5);
                calendar.viewDate = firstWeekOfTheYear;
                calendar.showWeekNumbers = true;
                fixture.detectChanges();

                const calendarRows = dom.queryAll(By.css(`${HelperTestFunctions.CALENDAR_ROW_CSSCLASS}`));

                const maxWeeks = 52;
                calendarRows.forEach((row, idx) => {
                    const firstRowItem = row.nativeElement.children[0];
                    if (idx === 0) {
                        expect(firstRowItem.firstChild.innerText).toEqual('Wk');
                    } else {
                        expect(firstRowItem.firstChild.innerText).toEqual((idx === 1 ? maxWeeks : idx - 1).toString());
                    }
                });
            });

            it('Calendar DOM structure - year view | month view', () => {
                dom.queryAll(By.css(HelperTestFunctions.CALENDAR_DATE_CSSCLASS))[0].nativeElement.click();
                fixture.detectChanges();

                expect(dom.query(By.css(HelperTestFunctions.CALENDAR_ROW_WRAP_CSSCLASS))).toBeDefined();
                const months = dom.queryAll(By.css(HelperTestFunctions.MONTH_CSSCLASS));
                const currentMonth = dom.query(By.css(HelperTestFunctions.CURRENT_MONTH_CSSCLASS));

                expect(months.length).toEqual(11);
                expect(currentMonth.nativeElement.textContent.trim()).toMatch('Jun');

                months[0].nativeElement.click();
                fixture.detectChanges();

                expect(calendar.viewDate.getMonth()).toEqual(0);

                dom.queryAll(By.css(HelperTestFunctions.CALENDAR_DATE_CSSCLASS))[1].nativeElement.click();
                fixture.detectChanges();

                expect(dom.query(By.css(HelperTestFunctions.CALENDAR_COLUMN_CSSCLASS))).toBeDefined();
                const years = dom.queryAll(By.css(HelperTestFunctions.YEAR_CSSCLASS));
                const currentYear = dom.query(By.css(HelperTestFunctions.CURRENT_YEAR_CSSCLASS));

                expect(years.length).toEqual(6);
                expect(currentYear.nativeElement.textContent.trim()).toMatch('2017');

                years[0].triggerEventHandler('click', { target: years[0].nativeElement });
                fixture.detectChanges();

                expect(calendar.viewDate.getFullYear()).toEqual(2014);
            });

            it('Calendar selection - single with event', () => {
                fixture.detectChanges();

                const target = dom.query(By.css(HelperTestFunctions.SELECTED_DATE_CSSCLASS));
                const weekDiv = target.parent;
                const weekDays = weekDiv.queryAll(By.css(HelperTestFunctions.DAY_CSSCLASS));

                const nextDay = new Date(2017, 5, 14);

                expect((calendar.value as Date).toDateString()).toMatch(
                    new Date(2017, 5, 13).toDateString()
                );

                spyOn(calendar.selected, 'emit');

                // Select 14th
                weekDays[3].nativeElement.click();
                fixture.detectChanges();

                expect(calendar.selected.emit).toHaveBeenCalled();
                expect((calendar.value as Date).toDateString()).toMatch(
                    nextDay.toDateString()
                );
                HelperTestFunctions.verifyDateSelected(weekDays[3]);
                expect(
                    (fixture.componentInstance.model as Date).toDateString()
                ).toMatch(nextDay.toDateString());
                HelperTestFunctions.verifyDateNotSelected(target);
            });

            it('Calendar selection - outside of current month - 1', () => {
                const parent = dom.query(
                    By.css(`${HelperTestFunctions.CALENDAR_ROW_CSSCLASS}:last-child`)
                );
                const parentDates = parent.queryAll(By.css(HelperTestFunctions.INACTIVE_DAYS_CSSCLASS));
                const target = parentDates[parentDates.length - 1];

                target.nativeElement.click();
                fixture.detectChanges();

                expect(
                    (fixture.componentInstance.model as Date).toDateString()
                ).toMatch(new Date(2017, 6, 8).toDateString());
                expect(
                    dom
                        .query(By.css(HelperTestFunctions.CALENDAR_HEADER_DATE_CSSCLASS))
                        .nativeElement.textContent.includes('Jul')
                ).toBe(true);
            });

            it('Calendar selection - outside of current month - 2', () => {
                const parent = dom.queryAll(By.css(HelperTestFunctions.CALENDAR_ROW_CSSCLASS))[1];
                const target = parent.queryAll(By.css(HelperTestFunctions.INACTIVE_DAYS_CSSCLASS))[0];

                target.nativeElement.click();
                fixture.detectChanges();

                expect(
                    (fixture.componentInstance.model as Date).toDateString()
                ).toMatch(new Date(2017, 4, 28).toDateString());
                expect(
                    dom
                        .query(By.css(HelperTestFunctions.CALENDAR_HEADER_DATE_CSSCLASS))
                        .nativeElement.textContent.includes('May')
                ).toBe(true);
            });

            it('Calendar selection - single through API', () => {
                fixture.detectChanges();

                const target = dom.query(By.css(HelperTestFunctions.SELECTED_DATE_CSSCLASS));
                const weekDiv = target.parent;
                const weekDays = weekDiv.queryAll(By.css(HelperTestFunctions.DAY_CSSCLASS));
                const nextDay = new Date(2017, 5, 14);

                expect((calendar.value as Date).toDateString()).toMatch(
                    new Date(2017, 5, 13).toDateString()
                );

                calendar.selectDate(new Date(2017, 5, 14));
                fixture.detectChanges();

                expect((calendar.value as Date).toDateString()).toMatch(
                    nextDay.toDateString()
                );
                HelperTestFunctions.verifyDateSelected(weekDays[3]);
                expect(
                    (fixture.componentInstance.model as Date).toDateString()
                ).toMatch(nextDay.toDateString());
                HelperTestFunctions.verifyDateNotSelected(target);
            });

            it('Calendar selection - multiple with event', () => {
                fixture.detectChanges();

                const target = dom.query(By.css(HelperTestFunctions.SELECTED_DATE_CSSCLASS));
                const weekDiv = target.parent;
                const weekDays = weekDiv.queryAll(By.css(HelperTestFunctions.DAY_CSSCLASS));

                calendar.selection = 'multi';
                fixture.detectChanges();

                expect(calendar.value instanceof Array).toBeTruthy();
                expect(
                    fixture.componentInstance.model instanceof Array
                ).toBeTruthy();
                expect((calendar.value as Date[]).length).toEqual(0);
                expect((fixture.componentInstance.model as Date[]).length).toEqual(
                    0
                );

                for (const days of weekDays) {
                    days.nativeElement.click();
                    fixture.detectChanges();
                }

                expect((calendar.value as Date[]).length).toEqual(7);
                expect((fixture.componentInstance.model as Date[]).length).toEqual(
                    7
                );
                weekDays.forEach((el) => {
                    HelperTestFunctions.verifyDateSelected(el);
                });

                // Deselect last day
                weekDays[weekDays.length - 1].nativeElement.click();
                fixture.detectChanges();

                expect((calendar.value as Date[]).length).toEqual(6);
                expect((fixture.componentInstance.model as Date[]).length).toEqual(
                    6
                );
                HelperTestFunctions.verifyDateNotSelected(weekDays[weekDays.length - 1]);
            });

            it('Calendar selection - multiple through API', () => {
                fixture.detectChanges();

                const target = dom.query(By.css(HelperTestFunctions.SELECTED_DATE_CSSCLASS));
                const weekDiv = target.parent;
                const weekDays = weekDiv.queryAll(By.css(HelperTestFunctions.DAY_CSSCLASS));

                calendar.selection = 'multi';
                fixture.detectChanges();

                const lastDay = new Date(2017, 5, 17);

                // Single date
                calendar.selectDate(lastDay);
                fixture.detectChanges();

                expect(
                    (fixture.componentInstance.model as Date[])[0].toDateString()
                ).toMatch(lastDay.toDateString());
                expect(calendar.value[0].toDateString()).toMatch(
                    lastDay.toDateString()
                );
                HelperTestFunctions.verifyDateSelected(weekDays[weekDays.length - 1]);

                // Multiple dates
                calendar.selectDate([new Date(2017, 5, 11), new Date(2017, 5, 12)]);
                fixture.detectChanges();

                expect((fixture.componentInstance.model as Date[]).length).toEqual(
                    3
                );
                expect((calendar.value as Date[]).length).toEqual(3);
                // 11th June
                HelperTestFunctions.verifyDateSelected(weekDays[0]);
                // 12th June
                HelperTestFunctions.verifyDateSelected(weekDays[1]);
            });

            it('Calendar selection - range with event', () => {
                fixture.detectChanges();

                const target = dom.query(By.css(HelperTestFunctions.SELECTED_DATE_CSSCLASS));
                const weekDiv = target.parent;
                const weekDays = weekDiv.queryAll(By.css(HelperTestFunctions.DAY_CSSCLASS));

                calendar.selection = 'range';
                fixture.detectChanges();

                const lastDay = new Date(2017, 5, 17);
                const firstDay = new Date(2017, 5, 11);

                // Toggle range selection...
                weekDays[0].nativeElement.click();
                fixture.detectChanges();

                expect((fixture.componentInstance.model as Date[]).length).toEqual(
                    1
                );
                expect((calendar.value as Date[]).length).toEqual(1);
                expect(
                    (fixture.componentInstance.model as Date[])[0].toDateString()
                ).toMatch(firstDay.toDateString());
                HelperTestFunctions.verifyDateSelected(weekDays[0]);

                // ...and cancel it
                weekDays[0].nativeElement.click();
                fixture.detectChanges();

                expect((fixture.componentInstance.model as Date[]).length).toEqual(
                    0
                );
                expect((calendar.value as Date[]).length).toEqual(0);
                HelperTestFunctions.verifyDateNotSelected(weekDays[0]);

                // Toggle range selection...
                weekDays[0].nativeElement.click();
                fixture.detectChanges();

                // ...and complete it
                weekDays[weekDays.length - 1].nativeElement.click();
                fixture.detectChanges();

                expect((fixture.componentInstance.model as Date[]).length).toEqual(
                    7
                );
                expect((calendar.value as Date[]).length).toEqual(7);
                expect(calendar.value[0].toDateString()).toMatch(
                    firstDay.toDateString()
                );
                expect(
                    calendar.value[
                        (calendar.value as Date[]).length - 1
                    ].toDateString()
                ).toMatch(lastDay.toDateString());
                weekDays.forEach((el) => {
                    HelperTestFunctions.verifyDateSelected(el);
                });
            });

            it('Calendar selection - range through API', () => {
                fixture.detectChanges();

                const target = dom.query(By.css(HelperTestFunctions.SELECTED_DATE_CSSCLASS));
                const weekDiv = target.parent;
                const weekDays = weekDiv.queryAll(By.css(HelperTestFunctions.DAY_CSSCLASS));

                calendar.selection = 'range';
                fixture.detectChanges();

                const lastDay = new Date(2017, 5, 17);
                const midDay = new Date(2017, 5, 14);
                const firstDay = new Date(2017, 5, 11);

                calendar.selectDate([firstDay, lastDay]);
                fixture.detectChanges();

                expect((fixture.componentInstance.model as Date[]).length).toEqual(
                    7
                );
                expect((calendar.value as Date[]).length).toEqual(7);
                expect(calendar.value[0].toDateString()).toMatch(
                    firstDay.toDateString()
                );
                expect(
                    calendar.value[
                        (calendar.value as Date[]).length - 1
                    ].toDateString()
                ).toMatch(lastDay.toDateString());
                weekDays.forEach((el) => {
                    HelperTestFunctions.verifyDateSelected(el);
                });

                calendar.selectDate([firstDay, midDay]);
                fixture.detectChanges();

                expect((fixture.componentInstance.model as Date[]).length).toEqual(
                    4
                );
                expect((calendar.value as Date[]).length).toEqual(4);
                expect(calendar.value[0].toDateString()).toMatch(
                    firstDay.toDateString()
                );
                expect(
                    calendar.value[
                        (calendar.value as Date[]).length - 1
                    ].toDateString()
                ).toMatch(midDay.toDateString());
                for (const i of [0, 1, 2, 3]) {
                    HelperTestFunctions.verifyDateSelected(weekDays[i]);
                }

                // Select with only one day
                calendar.selectDate([lastDay]);
                fixture.detectChanges();

                expect((calendar.value as Date[]).length).toEqual(1);
                expect(calendar.value[0].toDateString()).toMatch(lastDay.toDateString());
                HelperTestFunctions.verifyDateSelected(weekDays[6]);

                // Select with array of 3 days
                calendar.selectDate([midDay, lastDay, firstDay]);
                fixture.detectChanges();

                expect((fixture.componentInstance.model as Date[]).length).toEqual(
                    7
                );
                expect((calendar.value as Date[]).length).toEqual(7);
                expect(calendar.value[0].toDateString()).toMatch(
                    firstDay.toDateString()
                );
                expect(
                    calendar.value[
                        (calendar.value as Date[]).length - 1
                    ].toDateString()
                ).toMatch(lastDay.toDateString());
                weekDays.forEach((el) => {
                    HelperTestFunctions.verifyDateSelected(el);
                });
            });

            it('Calendar keyboard navigation - PageUp/PageDown', fakeAsync(() => {
                const component = dom.query(By.css(HelperTestFunctions.CALENDAR_CSSCLASS));

                UIInteractions.triggerKeyDownEvtUponElem('PageUp', component.nativeElement);
                fixture.detectChanges();
                tick(100);
                expect(calendar.viewDate.getMonth()).toEqual(4);

                calendar.viewDate = new Date(2017, 5, 13);
                fixture.detectChanges();
                UIInteractions.triggerKeyDownEvtUponElem('PageDown', component.nativeElement);
                fixture.detectChanges();
                tick(100);

                expect(calendar.viewDate.getMonth()).toEqual(6);
                UIInteractions.triggerKeyDownEvtUponElem('PageUp', component.nativeElement, true, false, true);
                fixture.detectChanges();
                tick(100);

                expect(calendar.viewDate.getFullYear()).toEqual(2016);

                calendar.viewDate = new Date(2017, 5, 13);
                fixture.detectChanges();

                UIInteractions.triggerKeyDownEvtUponElem('PageDown', component.nativeElement, true, false, true);
                fixture.detectChanges();
                tick(100);

                expect(calendar.viewDate.getFullYear()).toEqual(2018);
            }));

            it('Calendar keyboard navigation - Home/End/Enter', () => {
                const component = dom.query(By.css(HelperTestFunctions.CALENDAR_CSSCLASS));

                const days = calendar.daysView.dates.filter((day) => day.isCurrentMonth);
                const firstDay = days[0];
                const lastDay = days[days.length - 1];

                UIInteractions.triggerKeyDownEvtUponElem('Home', component.nativeElement);
                fixture.detectChanges();

                expect(document.activeElement.textContent).toMatch(firstDay.nativeElement.textContent);
                expect(document.activeElement.textContent.trim()).toMatch('1');

                UIInteractions.triggerKeyDownEvtUponElem('End', component.nativeElement);
                fixture.detectChanges();

                expect(document.activeElement.textContent).toMatch(lastDay.nativeElement.textContent);
                expect(document.activeElement.textContent.trim()).toMatch('30');

                UIInteractions.triggerKeyDownEvtUponElem('Enter', firstDay.nativeElement);
                fixture.detectChanges();

                expect((calendar.value as Date).toDateString()).toMatch(new Date(2017, 5, 1).toDateString());
            });

            it('Calendar keyboard navigation - Arrow keys', () => {
                const component = dom.query(By.css(HelperTestFunctions.CALENDAR_CSSCLASS));

                const days = calendar.daysView.dates.filter((day) => day.isCurrentMonth);
                const firstDay = days[0];

                UIInteractions.triggerKeyDownEvtUponElem('Home', component.nativeElement);
                fixture.detectChanges();

                expect(document.activeElement.textContent).toMatch(firstDay.nativeElement.textContent);
                expect(document.activeElement.textContent.trim()).toMatch('1');

                UIInteractions.triggerKeyDownEvtUponElem('ArrowDown', document.activeElement);
                fixture.detectChanges();

                expect(document.activeElement.textContent.trim()).toMatch('8');

                UIInteractions.triggerKeyDownEvtUponElem('ArrowLeft', document.activeElement);

                fixture.detectChanges();

                expect(document.activeElement.textContent.trim()).toMatch('7');

                UIInteractions.triggerKeyDownEvtUponElem('ArrowRight', document.activeElement);
                fixture.detectChanges();

                expect(document.activeElement.textContent.trim()).toMatch('8');

                UIInteractions.triggerKeyDownEvtUponElem('ArrowUp', document.activeElement);
                fixture.detectChanges();

                expect(document.activeElement.textContent.trim()).toMatch('1');
            });

            it('Calendar date should persist the focus when select date in the (next/prev) month.', fakeAsync(() => {
                const component = dom.query(By.css(HelperTestFunctions.CALENDAR_CSSCLASS));
                const calendarMonth = calendar.daysView.getCalendarMonth;
                let value = calendarMonth[0][4];

                UIInteractions.triggerKeyDownEvtUponElem('Home', component.nativeElement, true);

                let date = calendar.daysView.dates.find((d) => d.date.date.toString() === value.date.toString()).nativeElement;
                UIInteractions.triggerKeyDownEvtUponElem('Enter', date);
                fixture.detectChanges();
                flush();

                expect(document.activeElement).toBe(date);

                value = calendarMonth[4][6];
                date = calendar.daysView.dates.find((d) => d.date.date.toString() === value.date.toString()).nativeElement;

                UIInteractions.triggerKeyDownEvtUponElem('Enter', date);
                fixture.detectChanges();
                flush();

                date = calendar.daysView.dates.find((d) => d.date.date.toString() === value.date.toString()).nativeElement;
                expect(document.activeElement).toBe(date);
                UIInteractions.triggerKeyDownEvtUponElem('ArrowRight', document.activeElement, true);

                expect(document.activeElement.textContent.trim()).toMatch('2');
            }));

            it('Should navigate to first enabled date when using "home" key.', fakeAsync(() => {
                const dateRangeDescriptors: DateRangeDescriptor[] = [];
                const specificDates = [new Date(2017, 5, 1), new Date(2017, 5, 2)];
                dateRangeDescriptors.push({ type: DateRangeType.Specific, dateRange: specificDates },
                    { type: DateRangeType.Weekends });
                calendar.disabledDates = dateRangeDescriptors;
                fixture.detectChanges();
                flush();

                const calendarNativeElement = dom.query(By.css(HelperTestFunctions.CALENDAR_CSSCLASS)).nativeElement;
                UIInteractions.triggerKeyDownEvtUponElem('Home', calendarNativeElement);
                fixture.detectChanges();

                const date = calendar.daysView.dates.filter(
                    d => getDate(d).getTime() === new Date(2017, 5, 5).getTime())[0];
                expect(date.nativeElement).toBe(document.activeElement);
            }));

            it('Should navigate to last enabled date when using "end" key.', fakeAsync(() => {
                const dateRangeDescriptors: DateRangeDescriptor[] = [];
                const rangeDates = [new Date(2017, 5, 28), new Date(2017, 5, 30)];
                dateRangeDescriptors.push({ type: DateRangeType.Between, dateRange: rangeDates },
                    { type: DateRangeType.Specific, dateRange: [new Date(2017, 5, 27)] });
                calendar.disabledDates = dateRangeDescriptors;
                fixture.detectChanges();
                flush();

                const calendarNativeElement = dom.query(By.css(HelperTestFunctions.CALENDAR_CSSCLASS)).nativeElement;
                UIInteractions.triggerKeyDownEvtUponElem('End', calendarNativeElement);
                fixture.detectChanges();

                const date = calendar.daysView.dates.filter(
                    d => getDate(d).getTime() === new Date(2017, 5, 26).getTime())[0];
                expect(date.nativeElement).toBe(document.activeElement);
            }));

            it('Should navigate to first enabled date when using "arrow up" key.', fakeAsync(() => {
                const dateRangeDescriptors: DateRangeDescriptor[] = [];
                const specificDates = [new Date(2017, 5, 23), new Date(2017, 5, 16)];
                dateRangeDescriptors.push({ type: DateRangeType.Specific, dateRange: specificDates },
                    { type: DateRangeType.Weekends });
                calendar.disabledDates = dateRangeDescriptors;
                fixture.detectChanges();
                flush();

                const calendarNativeElement = dom.query(By.css(HelperTestFunctions.CALENDAR_CSSCLASS)).nativeElement;
                UIInteractions.triggerKeyDownEvtUponElem('End', calendarNativeElement);
                fixture.detectChanges();

                UIInteractions.triggerKeyDownEvtUponElem('ArrowUp', document.activeElement);
                fixture.detectChanges();

                const date = calendar.daysView.dates.filter(
                    d => getDate(d).getTime() === new Date(2017, 5, 9).getTime())[0];
                expect(date.nativeElement).toBe(document.activeElement);
            }));

            it('Should navigate to first enabled date when using "arrow down" key.', fakeAsync(() => {
                const dateRangeDescriptors: DateRangeDescriptor[] = [];
                const specificDates = [new Date(2017, 5, 8), new Date(2017, 5, 15)];
                dateRangeDescriptors.push({ type: DateRangeType.Specific, dateRange: specificDates },
                    { type: DateRangeType.Weekends });
                calendar.disabledDates = dateRangeDescriptors;
                fixture.detectChanges();
                flush();

                const calendarNativeElement = dom.query(By.css(HelperTestFunctions.CALENDAR_CSSCLASS)).nativeElement;
                UIInteractions.triggerKeyDownEvtUponElem('Home', calendarNativeElement);
                fixture.detectChanges();

                UIInteractions.triggerKeyDownEvtUponElem('ArrowDown', document.activeElement);
                fixture.detectChanges();

                const date = calendar.daysView.dates.filter(
                    d => getDate(d).getTime() === new Date(2017, 5, 22).getTime())[0];
                expect(date.nativeElement).toBe(document.activeElement);
            }));

            it('Should navigate to first enabled date when using "arrow left" key.', fakeAsync(() => {
                const dateRangeDescriptors: DateRangeDescriptor[] = [];
                const rangeDates = [new Date(2017, 5, 2), new Date(2017, 5, 29)];
                dateRangeDescriptors.push({ type: DateRangeType.Between, dateRange: rangeDates });
                calendar.disabledDates = dateRangeDescriptors;
                fixture.detectChanges();
                flush();

                const calendarNativeElement = dom.query(By.css(HelperTestFunctions.CALENDAR_CSSCLASS)).nativeElement;
                UIInteractions.triggerKeyDownEvtUponElem('End', calendarNativeElement);
                fixture.detectChanges();

                UIInteractions.triggerKeyDownEvtUponElem('ArrowLeft', document.activeElement);
                fixture.detectChanges();

                const date = calendar.daysView.dates.filter(
                    d => getDate(d).getTime() === new Date(2017, 5, 1).getTime())[0];
                expect(date.nativeElement).toBe(document.activeElement);
            }));

            it('Should navigate to first enabled date when using "arrow right" key.', fakeAsync(() => {
                const dateRangeDescriptors: DateRangeDescriptor[] = [];
                const rangeDates = [new Date(2017, 5, 2), new Date(2017, 5, 29)];
                dateRangeDescriptors.push({ type: DateRangeType.Between, dateRange: rangeDates });
                calendar.disabledDates = dateRangeDescriptors;
                fixture.detectChanges();
                flush();

                const calendarNativeElement = dom.query(By.css(HelperTestFunctions.CALENDAR_CSSCLASS)).nativeElement;
                UIInteractions.triggerKeyDownEvtUponElem('Home', calendarNativeElement);
                fixture.detectChanges();

                UIInteractions.triggerKeyDownEvtUponElem('ArrowRight', document.activeElement);
                fixture.detectChanges();

                const date = calendar.daysView.dates.filter(
                    d => getDate(d).getTime() === new Date(2017, 5, 30).getTime())[0];
                expect(date.nativeElement).toBe(document.activeElement);
            }));

            it('Should not select disabled dates when having "range" selection', () => {
                const dateRangeDescriptors: DateRangeDescriptor[] = [];
                const rangeDates = [new Date(2017, 5, 10), new Date(2017, 5, 15)];
                dateRangeDescriptors.push({ type: DateRangeType.Between, dateRange: rangeDates });
                calendar.disabledDates = dateRangeDescriptors;
                calendar.selection = 'range';
                fixture.detectChanges();

                const fromDate = calendar.daysView.dates.filter(
                    d => getDate(d).getTime() === new Date(2017, 5, 5).getTime())[0];
                fromDate.nativeElement.click();
                fixture.detectChanges();

                const toDate = calendar.daysView.dates.filter(
                    d => getDate(d).getTime() === new Date(2017, 5, 20).getTime())[0];
                toDate.nativeElement.click();
                fixture.detectChanges();

                const selectedDates = calendar.daysView.dates.toArray().filter(d => {
                    const dateTime = getDate(d).getTime();
                    return (dateTime >= new Date(2017, 5, 5).getTime() &&
                        dateTime <= new Date(2017, 5, 9).getTime()) ||
                        (dateTime >= new Date(2017, 5, 16).getTime() &&
                            dateTime <= new Date(2017, 5, 20).getTime());
                });

                selectedDates.forEach(d => {
                    expect(d.selected).toBe(true);
                });

                const notSelectedDates = calendar.daysView.dates.toArray().filter(d => {
                    const dateTime = getDate(d).getTime();
                    return dateTime >= new Date(2017, 5, 10).getTime() &&
                        dateTime <= new Date(2017, 5, 15).getTime();
                });

                notSelectedDates.forEach(d => {
                    expect(d.selected).toBe(false);
                });
            });
        });

        describe('Disabled dates - ', () => {
            it('Should disable date when using "After" date descriptor.', () => {
                DateRangesPropertiesTester.testAfter(
                    DateRangesPropertiesTester.assignDisableDatesDescriptors,
                    DateRangesPropertiesTester.testDisabledDates);
            });

            it('Should disable date when using "Before" date descriptor.', () => {
                DateRangesPropertiesTester.testBefore(
                    DateRangesPropertiesTester.assignDisableDatesDescriptors,
                    DateRangesPropertiesTester.testDisabledDates
                );
            });

            it('Should disable date when using "Between" date descriptor with min date declared first.', () => {
                DateRangesPropertiesTester.testBetweenWithMinDateFirst(
                    DateRangesPropertiesTester.assignDisableDatesDescriptors,
                    DateRangesPropertiesTester.testDisabledDates
                );
            });

            it('Should disable date when using "Between" date descriptor with max date declared first.', () => {
                DateRangesPropertiesTester.testBetweenWithMaxDateFirst(
                    DateRangesPropertiesTester.assignDisableDatesDescriptors,
                    DateRangesPropertiesTester.testDisabledDates
                );
            });

            it('Should disable date when using "Between" date descriptor with min and max the same.', () => {
                DateRangesPropertiesTester.testBetweenWithMinMaxTheSame(
                    DateRangesPropertiesTester.assignDisableDatesDescriptors,
                    DateRangesPropertiesTester.testDisabledDates
                );
            });

            it('Should disable date when using overlapping "Between" ranges.', () => {
                DateRangesPropertiesTester.testOverlappingBetweens(
                    DateRangesPropertiesTester.assignDisableDatesDescriptors,
                    DateRangesPropertiesTester.testDisabledDates
                );
            });

            it('Should disable date when using "Specific" date descriptor.', () => {
                DateRangesPropertiesTester.testSpecific(
                    DateRangesPropertiesTester.assignDisableDatesDescriptors,
                    DateRangesPropertiesTester.testDisabledDates
                );
            });

            it('Should disable date when using "Weekdays" date descriptor.', () => {
                DateRangesPropertiesTester.testWeekdays(
                    DateRangesPropertiesTester.assignDisableDatesDescriptors,
                    DateRangesPropertiesTester.testDisabledDates
                );
            });

            it('Should disable date when using "Weekends" date descriptor.', () => {
                DateRangesPropertiesTester.testWeekends(
                    DateRangesPropertiesTester.assignDisableDatesDescriptors,
                    DateRangesPropertiesTester.testDisabledDates
                );
            });

            it('Should disable dates when using multiple ranges.', () => {
                DateRangesPropertiesTester.testMultipleRanges(
                    DateRangesPropertiesTester.assignDisableDatesDescriptors,
                    DateRangesPropertiesTester.testDisabledDates
                );
            });

            it('Should disable previous month with "before" date descriptor', () => {
                DateRangesPropertiesTester.testPreviousMonthRange(
                    DateRangesPropertiesTester.assignDisableDatesDescriptors,
                    DateRangesPropertiesTester.testDisabledDates
                );
            });

            it('Should be able to change disable dates runtime.', () => {
                DateRangesPropertiesTester.testRangeUpdateRuntime(
                    DateRangesPropertiesTester.assignDisableDatesDescriptors,
                    DateRangesPropertiesTester.testDisabledDates
                );
            });
        });

        describe('Special dates - ', () => {
            it('Should mark date as special when using "After" date descriptor.', () => {
                DateRangesPropertiesTester.testAfter(
                    DateRangesPropertiesTester.assignSpecialDatesDescriptors,
                    DateRangesPropertiesTester.testSpecialDates
                );
            });

            it('Should mark date as special when using "Before" date descriptor.', () => {
                DateRangesPropertiesTester.testBefore(
                    DateRangesPropertiesTester.assignSpecialDatesDescriptors,
                    DateRangesPropertiesTester.testSpecialDates
                );
            });

            it('Should mark date as special when using "Between" date descriptor with min date declared first.', () => {
                DateRangesPropertiesTester.testBetweenWithMinDateFirst(
                    DateRangesPropertiesTester.assignSpecialDatesDescriptors,
                    DateRangesPropertiesTester.testSpecialDates
                );
            });

            it('Should mark date as special when using "Between" date descriptor with max date declared first.', () => {
                DateRangesPropertiesTester.testBetweenWithMaxDateFirst(
                    DateRangesPropertiesTester.assignSpecialDatesDescriptors,
                    DateRangesPropertiesTester.testSpecialDates
                );
            });

            it('Should mark date as special when using "Between" date descriptor with min and max the same.', () => {
                DateRangesPropertiesTester.testBetweenWithMinMaxTheSame(
                    DateRangesPropertiesTester.assignSpecialDatesDescriptors,
                    DateRangesPropertiesTester.testSpecialDates
                );
            });

            it('Should mark date as special when using overlapping "Between" ranges.', () => {
                DateRangesPropertiesTester.testOverlappingBetweens(
                    DateRangesPropertiesTester.assignSpecialDatesDescriptors,
                    DateRangesPropertiesTester.testSpecialDates
                );
            });

            it('Should mark date as special when using "Specific" date descriptor.', () => {
                DateRangesPropertiesTester.testSpecific(
                    DateRangesPropertiesTester.assignSpecialDatesDescriptors,
                    DateRangesPropertiesTester.testSpecialDates
                );
            });

            it('Should mark date as special when using "Weekdays" date descriptor.', () => {
                DateRangesPropertiesTester.testWeekdays(
                    DateRangesPropertiesTester.assignSpecialDatesDescriptors,
                    DateRangesPropertiesTester.testSpecialDates
                );
            });

            it('Should mark date as special when using "Weekends" date descriptor.', () => {
                DateRangesPropertiesTester.testWeekends(
                    DateRangesPropertiesTester.assignSpecialDatesDescriptors,
                    DateRangesPropertiesTester.testSpecialDates
                );
            });

            it('Should mark dates as special when using multiple ranges.', () => {
                DateRangesPropertiesTester.testMultipleRanges(
                    DateRangesPropertiesTester.assignSpecialDatesDescriptors,
                    DateRangesPropertiesTester.testSpecialDates
                );
            });

            it('Should mark as special previous month with "before" date descriptor', () => {
                DateRangesPropertiesTester.testPreviousMonthRange(
                    DateRangesPropertiesTester.assignSpecialDatesDescriptors,
                    DateRangesPropertiesTester.testSpecialDates
                );
            });

            it('Should be able to change special dates runtime.', () => {
                DateRangesPropertiesTester.testRangeUpdateRuntime(
                    DateRangesPropertiesTester.assignSpecialDatesDescriptors,
                    DateRangesPropertiesTester.testSpecialDates
                );
            });
        });

        describe('Disabled special dates - ', () => {
            let fixture; let calendar;

            beforeEach(waitForAsync(() => {
                fixture = TestBed.createComponent(IgxCalendarDisabledSpecialDatesComponent);
                fixture.detectChanges();
                calendar = fixture.componentInstance.calendar;
            }));

            it('Should be able to set disabled and active dates as @Input', () => {
                expect(calendar.specialDates).toEqual(
                    [{ type: DateRangeType.Between, dateRange: [new Date(2017, 5, 1), new Date(2017, 5, 6)] }]);
                expect(calendar.disabledDates).toEqual(
                    [{ type: DateRangeType.Between, dateRange: [new Date(2017, 5, 23), new Date(2017, 5, 29)] }]);
                let specialDates = calendar.daysView.dates.toArray().filter(d => {
                    const dateTime = getDate(d).getTime();
                    return (dateTime >= new Date(2017, 5, 1).getTime() &&
                        dateTime <= new Date(2017, 5, 6).getTime());
                });

                specialDates.forEach(d => {
                    expect(d.isSpecial).toBe(true);
                });

                let disabledDates = calendar.daysView.dates.toArray().filter(d => {
                    const dateTime = getDate(d).getTime();
                    return (dateTime >= new Date(2017, 5, 23).getTime() &&
                        dateTime <= new Date(2017, 5, 29).getTime());
                });

                disabledDates.forEach(d => {
                    expect(d.isDisabled).toBe(true);
                    expect(d.isDisabledCSS).toBe(true);
                });

                // change Inputs
                fixture.componentInstance.disabledDates = [{ type: DateRangeType.Before, dateRange: [new Date(2017, 5, 10)] }];
                fixture.componentInstance.specialDates = [{ type: DateRangeType.After, dateRange: [new Date(2017, 5, 19)] }];
                fixture.detectChanges();

                expect(calendar.disabledDates).toEqual([{ type: DateRangeType.Before, dateRange: [new Date(2017, 5, 10)] }]);
                expect(calendar.specialDates).toEqual([{ type: DateRangeType.After, dateRange: [new Date(2017, 5, 19)] }]);
                specialDates = calendar.daysView.dates.toArray().filter(d => {
                    const dateTime = getDate(d).getTime();
                    return (dateTime >= new Date(2017, 5, 20).getTime());
                });

                specialDates.forEach(d => {
                    expect(d.isSpecial).toBe(true);
                });

                disabledDates = calendar.daysView.dates.toArray().filter(d => {
                    const dateTime = getDate(d).getTime();
                    return (dateTime <= new Date(2017, 5, 9).getTime());
                });

                disabledDates.forEach(d => {
                    expect(d.isDisabled).toBe(true);
                    expect(d.isDisabledCSS).toBe(true);
                });
            });

            it('Should not select date from model, if it is part of disabled dates', () => {
                expect(calendar.value).toBeFalsy();
            });

            it('Should not select date from model in range selection, if model passes null', () => {
                calendar.selection = 'range';
                fixture.componentInstance.model = null;
                fixture.detectChanges();

                expect((calendar.value as Date[]).length).toEqual(0);
            });
        });

        describe('Select and deselect dates - ', () => {
            let fixture; let calendar; let ci;
            beforeEach(
                waitForAsync(() => {
                    fixture = TestBed.createComponent(IgxCalendarSampleComponent);
                    fixture.detectChanges();
                    ci = fixture.componentInstance;
                    calendar = ci.calendar;
                })
            );

            it('Deselect using API. Should deselect in "single" selection mode.', () => {
                const date = calendar.viewDate;
                calendar.selectDate(date);
                fixture.detectChanges();

                let selectedDate = calendar.value;
                expect(selectedDate).toEqual(date);

                calendar.deselectDate(date);
                fixture.detectChanges();

                selectedDate = calendar.value;
                expect(selectedDate).toBe(null);

                // Deselect with date different than selected date
                calendar.selectDate(date);
                fixture.detectChanges();

                selectedDate = calendar.value;
                expect(selectedDate).toEqual(date);

                const dateToDeselect = new Date(date);
                dateToDeselect.setDate(dateToDeselect.getDate() + 5);

                calendar.deselectDate(dateToDeselect);
                fixture.detectChanges();

                selectedDate = calendar.value;
                expect(selectedDate).toEqual(date);
            });

            it('Deselect using API. Should deselect in "multi" selection mode.', () => {
                calendar.selection = 'multi';
                fixture.detectChanges();

                const year = calendar.viewDate.getFullYear();
                const month = calendar.viewDate.getMonth();
                const dates = [];
                const datesCount = 10;
                for (let i = 0; i < datesCount; i++) {
                    dates.push(new Date(year, month, i + 1));
                }

                fixture.detectChanges();
                calendar.selectDate(dates);

                fixture.detectChanges();
                const evenDates = dates.filter(d => d.getDate() % 2 === 0);
                calendar.deselectDate(evenDates);

                fixture.detectChanges();
                const oddDates = dates.filter(d => d.getDate() % 2 !== 0);
                let selectedDates: Date[] = calendar.value as Date[];
                expect(selectedDates.length).toBe(5);
                for (const selectedDate of selectedDates) {
                    const fdate = oddDates.some((date: Date) => date.getTime() === selectedDate.getTime());
                    expect(fdate).toBeTruthy();
                }

                // Deselect with array not included in the selected dates
                calendar.deselectDate(evenDates);
                fixture.detectChanges();
                selectedDates = calendar.value as Date[];
                expect(selectedDates.length).toBe(5);
                for (const selectedDate of selectedDates) {
                    const fdate = oddDates.some((date: Date) => date.getTime() === selectedDate.getTime());
                    expect(fdate).toBeTruthy();
                }

                // Deselect one date included in the selected dates
                calendar.deselectDate([oddDates[0]]);
                fixture.detectChanges();
                selectedDates = calendar.value as Date[];
                expect(selectedDates.length).toBe(4);
                for (const selectedDate of selectedDates) {
                    const fdate = oddDates.some((date: Date) => date.getTime() === selectedDate.getTime());
                    expect(fdate).toBeTruthy();
                }

                // Deselect with array with all dates included in the selected dates
                calendar.deselectDate(oddDates);
                fixture.detectChanges();
                selectedDates = calendar.value as Date[];
                expect(selectedDates.length).toBe(0);
            });

            it('Deselect using API. Should deselect in "range" selection mode when period is not included in the selected dates', () => {
                ci.model = [];
                calendar.selection = 'range';
                fixture.detectChanges();

                const startDate = calendar.viewDate;
                const endDate = new Date(calendar.viewDate);
                endDate.setDate(endDate.getDate() + 5);
                const startDateDeselect = new Date(startDate);
                startDateDeselect.setDate(startDate.getDate() - 7);
                const endDateDeselect = new Date(endDate);
                endDateDeselect.setDate(startDate.getDate() - 3);

                calendar.selectDate([startDate, endDate]);
                fixture.detectChanges();

                let selectedDates: Date[] = calendar.value as Date[];
                expect(selectedDates.length).toBe(6);
                expect(selectedDates[0]).toEqual(startDate);
                expect(selectedDates[5]).toEqual(endDate);

                // Deselect with range which is not included in the selected dates
                calendar.deselectDate([startDateDeselect, endDateDeselect]);
                fixture.detectChanges();

                selectedDates = calendar.value as Date[];
                expect(selectedDates.length).toBe(6);
                expect(selectedDates[0]).toEqual(startDate);
                expect(selectedDates[5]).toEqual(endDate);
            });

            it('Deselect using API. Should deselect in "range" selection mode when period is not included.', () => {
                ci.model = [];
                calendar.selection = 'range';
                fixture.detectChanges();

                const startDate = calendar.viewDate;
                const endDate = new Date(calendar.viewDate);
                endDate.setDate(endDate.getDate() + 5);

                calendar.selectDate([startDate, endDate]);
                fixture.detectChanges();

                let selectedDates: Date[] = calendar.value as Date[];
                expect(selectedDates.length).toBe(6);
                expect(selectedDates[0]).toEqual(startDate);
                expect(selectedDates[5]).toEqual(endDate);

                // Deselect with range is includes the selection
                let startDateDeselect = new Date(startDate);
                startDateDeselect.setDate(startDate.getDate() - 7);
                let endDateDeselect = new Date(endDate);
                endDateDeselect.setDate(endDate.getDate() + 5);

                calendar.deselectDate([startDateDeselect, endDateDeselect]);
                fixture.detectChanges();

                selectedDates = calendar.value as Date[];
                expect(selectedDates.length).toBe(0);

                // Deselect with range which includes the beginning of the selection
                calendar.selectDate([startDate, endDate]);
                fixture.detectChanges();

                selectedDates = calendar.value as Date[];
                expect(selectedDates.length).toBe(6);

                startDateDeselect = new Date(startDate);
                startDateDeselect.setDate(startDate.getDate() - 7);
                endDateDeselect = new Date(endDate);
                endDateDeselect.setDate(endDate.getDate() - 2);
                calendar.deselectDate([startDateDeselect, endDateDeselect]);
                fixture.detectChanges();

                selectedDates = calendar.value as Date[];
                expect(selectedDates.length).toBe(0);

                // Deselect with range which includes the end of the selection
                calendar.selectDate([startDate, endDate]);
                fixture.detectChanges();

                selectedDates = calendar.value as Date[];
                expect(selectedDates.length).toBe(6);

                startDateDeselect = new Date(startDate);
                startDateDeselect.setDate(startDate.getDate() + 2);
                endDateDeselect = new Date(endDate);
                endDateDeselect.setDate(endDate.getDate() + 5);
                calendar.deselectDate([startDateDeselect, endDateDeselect]);
                fixture.detectChanges();

                selectedDates = calendar.value as Date[];
                expect(selectedDates.length).toBe(0);

                // Deselect with range which is inside the selection
                calendar.selectDate([startDate, endDate]);
                fixture.detectChanges();

                selectedDates = calendar.value as Date[];
                expect(selectedDates.length).toBe(6);

                startDateDeselect = new Date(startDate);
                startDateDeselect.setDate(startDate.getDate() + 1);
                endDateDeselect = new Date(endDate);
                endDateDeselect.setDate(endDate.getDate() - 1);
                calendar.deselectDate([startDateDeselect, endDateDeselect]);
                fixture.detectChanges();

                selectedDates = calendar.value as Date[];
                expect(selectedDates.length).toBe(0);
            });

            it('Deselect using API. Should deselect in "range" with array of dates.', () => {
                ci.model = [];
                calendar.selection = 'range';
                fixture.detectChanges();

                const startDate = calendar.viewDate;
                const endDate = new Date(calendar.viewDate);
                endDate.setDate(endDate.getDate() + 5);
                const endDateDeselect = new Date(endDate);
                endDateDeselect.setDate(endDate.getDate() - 1);
                const midDateDeselect = new Date(endDate);

                // Deselect with range with only one date
                calendar.selectDate([startDate, endDate]);
                fixture.detectChanges();

                let selectedDates = calendar.value as Date[];
                expect(selectedDates.length).toBe(6);

                let startDateDeselect = new Date(startDate);
                startDateDeselect.setDate(startDate.getDate() - 5);
                calendar.deselectDate([startDateDeselect]);
                fixture.detectChanges();

                selectedDates = calendar.value as Date[];
                expect(selectedDates.length).toBe(6);

                startDateDeselect = new Date(startDate);
                startDateDeselect.setDate(startDate.getDate() + 2);
                calendar.deselectDate([startDateDeselect]);
                fixture.detectChanges();

                selectedDates = calendar.value as Date[];
                expect(selectedDates.length).toBe(0);

                // Deselect with array of dates
                calendar.selectDate([startDate, endDate]);
                fixture.detectChanges();

                selectedDates = calendar.value as Date[];
                expect(selectedDates.length).toBe(6);

                startDateDeselect = new Date(startDate);
                startDateDeselect.setDate(startDate.getDate() - 10);

                midDateDeselect.setDate(endDate.getDate() + 3);
                calendar.deselectDate([midDateDeselect, endDateDeselect, startDateDeselect]);
                fixture.detectChanges();

                selectedDates = calendar.value as Date[];
                expect(selectedDates.length).toBe(0);
            });

            it('Deselect using API. Should deselect all in "single" mode.', () => {
                const date = calendar.viewDate;
                calendar.selectDate(date);
                fixture.detectChanges();

                let selectedDate = calendar.value;
                expect(selectedDate).toEqual(date);

                calendar.deselectDate();
                fixture.detectChanges();

                selectedDate = calendar.value;
                expect(selectedDate).toBe(null);
            });

            it('Deselect using API. Should deselect all in "multi" mode.', () => {
                calendar.selection = 'multi';
                fixture.detectChanges();

                const year = calendar.viewDate.getFullYear();
                const month = calendar.viewDate.getMonth();
                const dates = [];
                const datesCount = 10;
                for (let i = 0; i < datesCount; i++) {
                    dates.push(new Date(year, month, i + 1));
                }

                calendar.selectDate(dates);
                fixture.detectChanges();

                calendar.deselectDate();
                fixture.detectChanges();

                expect(calendar.value).toEqual([]);
            });

            it('Deselect using API. Should deselect all in "range" mode.', () => {
                calendar.selection = 'range';
                fixture.detectChanges();

                const startDate = calendar.viewDate;
                const endDate = new Date(calendar.viewDate);
                endDate.setDate(endDate.getDate() + 7);

                calendar.selectDate(startDate);
                fixture.detectChanges();

                calendar.selectDate(endDate);
                fixture.detectChanges();

                calendar.deselectDate();
                fixture.detectChanges();

                expect(calendar.value).toEqual([]);
            });
        });

        describe('Advanced KB Navigation - ', () => {
            let fixture; let calendar; let dom;

            beforeEach(waitForAsync(() => {
                fixture = TestBed.createComponent(IgxCalendarSampleComponent);
                fixture.detectChanges();
                calendar = fixture.componentInstance.calendar;
                dom = fixture.debugElement;
            }));

            it('Should navigate to the previous/next month via KB.', fakeAsync(() => {
                const prev = dom.queryAll(By.css(HelperTestFunctions.CALENDAR_PREV_BUTTON_CSSCLASS))[0];
                prev.nativeElement.focus();

                expect(prev.nativeElement).toBe(document.activeElement);
                UIInteractions.triggerKeyDownEvtUponElem('Enter', prev.nativeElement);
                tick(100);
                fixture.detectChanges();

                expect(calendar.viewDate.getMonth()).toEqual(4);
                const next = dom.queryAll(By.css(HelperTestFunctions.CALENDAR_NEXT_BUTTON_CSSCLASS))[0];
                next.nativeElement.focus();
                expect(next.nativeElement).toBe(document.activeElement);

                UIInteractions.triggerKeyDownEvtUponElem('Enter', next.nativeElement);

                fixture.detectChanges();
                tick(100);
                UIInteractions.triggerKeyDownEvtUponElem('Enter', next.nativeElement);
                tick(100);
                fixture.detectChanges();


                expect(calendar.viewDate.getMonth()).toEqual(6);
            }));

            it('Should open years view, navigate through and select an year via KB.', fakeAsync(() => {
                const year = dom.queryAll(By.css(HelperTestFunctions.CALENDAR_DATE_CSSCLASS))[1];
                year.nativeElement.focus();

                expect(year.nativeElement).toBe(document.activeElement);

                spyOn(calendar.activeViewChanged, 'emit').and.callThrough();

                UIInteractions.triggerKeyDownEvtUponElem('Enter', document.activeElement);
                fixture.detectChanges();
                tick();

                expect(calendar.activeViewChanged.emit).toHaveBeenCalledTimes(1);
                expect(calendar.activeViewChanged.emit).toHaveBeenCalledWith(IgxCalendarView.Decade);

                const years = dom.queryAll(By.css(HelperTestFunctions.YEAR_CSSCLASS));
                let currentYear = dom.query(By.css(HelperTestFunctions.CURRENT_YEAR_CSSCLASS));

                expect(years.length).toEqual(6);
                expect(currentYear.nativeElement.textContent.trim()).toMatch('2017');

                UIInteractions.triggerKeyDownEvtUponElem('ArrowDown', currentYear.nativeElement);
                fixture.detectChanges();

                currentYear = dom.query(By.css(HelperTestFunctions.CURRENT_YEAR_CSSCLASS));
                expect(currentYear.nativeElement.textContent.trim()).toMatch('2018');

                UIInteractions.triggerKeyDownEvtUponElem('ArrowUp', currentYear.nativeElement);
                UIInteractions.triggerKeyDownEvtUponElem('ArrowUp', currentYear.nativeElement);
                fixture.detectChanges();

                currentYear = dom.query(By.css(HelperTestFunctions.CURRENT_YEAR_CSSCLASS));
                expect(currentYear.nativeElement.textContent.trim()).toMatch('2016');

                const previousValue = fixture.componentInstance.calendar.viewDate;
                spyOn(calendar.viewDateChanged, 'emit').and.callThrough();

                UIInteractions.triggerKeyDownEvtUponElem('Enter', currentYear.nativeElement);

                fixture.detectChanges();
                tick();

                const eventArgs: IViewDateChangeEventArgs = { previousValue, currentValue: fixture.componentInstance.calendar.viewDate };
                expect(calendar.viewDateChanged.emit).toHaveBeenCalledTimes(1);
                expect(calendar.viewDateChanged.emit).toHaveBeenCalledWith(eventArgs);
                expect(calendar.viewDate.getFullYear()).toEqual(2016);
            }));

            it('Should open months view, navigate through and select a month via KB.', fakeAsync(() => {
                const month = dom.queryAll(By.css(HelperTestFunctions.CALENDAR_DATE_CSSCLASS))[0];
                month.nativeElement.focus();
                spyOn(calendar.activeViewChanged, 'emit').and.callThrough();

                expect(month.nativeElement).toBe(document.activeElement);

                UIInteractions.triggerKeyDownEvtUponElem('Enter', document.activeElement);
                fixture.detectChanges();
                tick();

                expect(calendar.activeViewChanged.emit).toHaveBeenCalledTimes(1);
                expect(calendar.activeViewChanged.emit).toHaveBeenCalledWith(IgxCalendarView.Year);

                const months = dom.queryAll(By.css(HelperTestFunctions.MONTH_CSSCLASS));
                const currentMonth = dom.query(By.css(HelperTestFunctions.CURRENT_MONTH_CSSCLASS));

                expect(months.length).toEqual(11);
                expect(currentMonth.nativeElement.textContent.trim()).toMatch('Jun');

                UIInteractions.triggerKeyDownEvtUponElem('Home', currentMonth.nativeElement);
                fixture.detectChanges();

                expect(document.activeElement.textContent.trim()).toMatch('Jan');

                UIInteractions.triggerKeyDownEvtUponElem('End', document.activeElement);
                fixture.detectChanges();

                expect(document.activeElement.textContent.trim()).toMatch('Dec');

                UIInteractions.triggerKeyDownEvtUponElem('ArrowLeft', document.activeElement);
                fixture.detectChanges();

                UIInteractions.triggerKeyDownEvtUponElem('ArrowUp', document.activeElement);
                fixture.detectChanges();

                UIInteractions.triggerKeyDownEvtUponElem('ArrowRight', document.activeElement);
                fixture.detectChanges();

                expect(document.activeElement.textContent.trim()).toMatch('Sep');

                const previousValue = fixture.componentInstance.calendar.viewDate;
                spyOn(calendar.viewDateChanged, 'emit').and.callThrough();

                UIInteractions.triggerKeyDownEvtUponElem('Enter', document.activeElement);
                fixture.detectChanges();
                tick();

                const eventArgs: IViewDateChangeEventArgs = { previousValue, currentValue: fixture.componentInstance.calendar.viewDate };
                expect(calendar.viewDateChanged.emit).toHaveBeenCalledTimes(1);
                expect(calendar.viewDateChanged.emit).toHaveBeenCalledWith(eventArgs);
                expect(calendar.viewDate.getMonth()).toEqual(8);
            }));

            it('Should navigate to the first enabled date from the previous month when using "arrow up" key.', fakeAsync(() => {
                const dateRangeDescriptors: DateRangeDescriptor[] = [];
                const specificDates = [
                    new Date(2017, 4, 25),
                    new Date(2017, 4, 11)
                ];

                dateRangeDescriptors.push({ type: DateRangeType.Specific, dateRange: specificDates });

                calendar.disabledDates = dateRangeDescriptors;
                fixture.detectChanges();
                flush();

                const calendarNativeElement = dom.query(By.css(HelperTestFunctions.CALENDAR_CSSCLASS)).nativeElement;

                UIInteractions.triggerKeyDownEvtUponElem('Home', calendarNativeElement);
                fixture.detectChanges();
                UIInteractions.triggerKeyDownEvtUponElem('ArrowUp', document.activeElement);
                fixture.detectChanges();
                flush();

                let date = calendar.daysView.dates.find(d => getDate(d).getTime() === new Date(2017, 4, 18).getTime());
                expect(date.nativeElement).toBe(document.activeElement);

                UIInteractions.triggerKeyDownEvtUponElem('ArrowUp', document.activeElement);
                fixture.detectChanges();
                UIInteractions.triggerKeyDownEvtUponElem('ArrowUp', document.activeElement);
                fixture.detectChanges();
                flush();

                date = calendar.daysView.dates.find(d => getDate(d).getTime() === new Date(2017, 3, 27).getTime());
                expect(date.nativeElement).toBe(document.activeElement);
            }));

            it('Should navigate to the first enabled date from the previous month when using "arrow left" key.', fakeAsync(() => {
                const dateRangeDescriptors: DateRangeDescriptor[] = [];
                const specificDates = [
                    new Date(2017, 4, 27),
                    new Date(2017, 4, 25)
                ];

                dateRangeDescriptors.push({ type: DateRangeType.Specific, dateRange: specificDates });

                calendar.disabledDates = dateRangeDescriptors;
                fixture.detectChanges();
                flush();

                const calendarNativeElement = dom.query(By.css(HelperTestFunctions.CALENDAR_CSSCLASS)).nativeElement;

                UIInteractions.triggerKeyDownEvtUponElem('Home', calendarNativeElement);
                UIInteractions.triggerKeyDownEvtUponElem('ArrowLeft', document.activeElement);
                fixture.detectChanges();
                flush();
                UIInteractions.triggerKeyDownEvtUponElem('ArrowLeft', document.activeElement);
                UIInteractions.triggerKeyDownEvtUponElem('ArrowLeft', document.activeElement);
                UIInteractions.triggerKeyDownEvtUponElem('ArrowLeft', document.activeElement);
                UIInteractions.triggerKeyDownEvtUponElem('ArrowLeft', document.activeElement);
                fixture.detectChanges();
                flush();

                let date = calendar.daysView.dates.find(d => getDate(d).getTime() === new Date(2017, 4, 26).getTime());
                expect(date.nativeElement).toBe(document.activeElement);

                UIInteractions.triggerKeyDownEvtUponElem('Home', calendarNativeElement);
                UIInteractions.triggerKeyDownEvtUponElem('ArrowLeft', document.activeElement);
                fixture.detectChanges();
                flush();
                UIInteractions.triggerKeyDownEvtUponElem('ArrowLeft', document.activeElement);
                fixture.detectChanges();
                flush();

                date = calendar.daysView.dates.find(d => getDate(d).getTime() === new Date(2017, 3, 29).getTime());
                expect(date.nativeElement).toBe(document.activeElement);
            }));

            it('Should navigate to the first enabled date from the next month when using "arrow down" key.', fakeAsync(() => {
                const dateRangeDescriptors: DateRangeDescriptor[] = [];
                const specificDates = [
                    new Date(2017, 6, 14),
                    new Date(2017, 6, 28)
                ];

                dateRangeDescriptors.push({ type: DateRangeType.Specific, dateRange: specificDates });

                calendar.disabledDates = dateRangeDescriptors;
                fixture.detectChanges();

                const calendarNativeElement = dom.query(By.css(HelperTestFunctions.CALENDAR_CSSCLASS)).nativeElement;

                UIInteractions.triggerKeyDownEvtUponElem('End', calendarNativeElement);
                UIInteractions.triggerKeyDownEvtUponElem('ArrowDown', document.activeElement);
                fixture.detectChanges();
                flush();
                UIInteractions.triggerKeyDownEvtUponElem('ArrowDown', document.activeElement);
                fixture.detectChanges();
                flush();

                let date = calendar.daysView.dates.find(d => getDate(d).getTime() === new Date(2017, 6, 21).getTime());
                expect(date.nativeElement).toBe(document.activeElement);

                UIInteractions.triggerKeyDownEvtUponElem('ArrowDown', document.activeElement);
                fixture.detectChanges();
                flush();
                UIInteractions.triggerKeyDownEvtUponElem('ArrowDown', document.activeElement);
                fixture.detectChanges();
                flush();

                date = calendar.daysView.dates.find(d => getDate(d).getTime() === new Date(2017, 7, 11).getTime());
                expect(date.nativeElement).toBe(document.activeElement);
            }));

            it('Should navigate to the first enabled date from the next month when using "arrow right" key.', fakeAsync(() => {
                const dateRangeDescriptors: DateRangeDescriptor[] = [];
                const specificDates = [
                    new Date(2017, 6, 9),
                    new Date(2017, 6, 10)
                ];

                dateRangeDescriptors.push({ type: DateRangeType.Specific, dateRange: specificDates });

                calendar.disabledDates = dateRangeDescriptors;

                const calendarNativeElement = dom.query(By.css(HelperTestFunctions.CALENDAR_CSSCLASS)).nativeElement;

                UIInteractions.triggerKeyDownEvtUponElem('End', calendarNativeElement);
                UIInteractions.triggerKeyDownEvtUponElem('ArrowDown', document.activeElement);
                fixture.detectChanges();
                flush();
                UIInteractions.triggerKeyDownEvtUponElem('ArrowRight', document.activeElement);
                UIInteractions.triggerKeyDownEvtUponElem('ArrowRight', document.activeElement);
                fixture.detectChanges();
                flush();

                let date = calendar.daysView.dates.find(d => getDate(d).getTime() === new Date(2017, 6, 11).getTime());
                expect(date.nativeElement).toBe(document.activeElement);

                date = calendar.daysView.dates.find(d => getDate(d).getTime() === new Date(2017, 7, 5).getTime());
                date.nativeElement.focus();

                UIInteractions.triggerKeyDownEvtUponElem('ArrowRight', document.activeElement);
                fixture.detectChanges();
                flush();

                date = calendar.daysView.dates.find(d => getDate(d).getTime() === new Date(2017, 7, 6).getTime());
                expect(date.nativeElement).toBe(document.activeElement);
            }));

            it('Should preserve the active date on (shift) pageup and pagedown.', fakeAsync(() => {
                const calendarNativeElement = dom.query(By.css(HelperTestFunctions.CALENDAR_CSSCLASS)).nativeElement;

                UIInteractions.triggerKeyDownEvtUponElem('Home', calendarNativeElement);

                let date = calendar.daysView.dates.find(d => getDate(d).getTime() === new Date(2017, 5, 1).getTime());
                expect(date.nativeElement).toBe(document.activeElement);

                UIInteractions.triggerKeyDownEvtUponElem('PageUp', document.activeElement);
                fixture.detectChanges();
                flush();

                date = calendar.daysView.dates.find(d => getDate(d).getTime() === new Date(2017, 4, 1).getTime());
                expect(date.nativeElement).toBe(document.activeElement);

                UIInteractions.triggerKeyDownEvtUponElem('PageDown', document.activeElement);
                fixture.detectChanges();
                flush();

                date = calendar.daysView.dates.find(d => getDate(d).getTime() === new Date(2017, 5, 1).getTime());
                expect(date.nativeElement).toBe(document.activeElement);

                UIInteractions.triggerKeyDownEvtUponElem('PageUp', document.activeElement, true, false, true);
                fixture.detectChanges();
                flush();

                date = calendar.daysView.dates.find(d => getDate(d).getTime() === new Date(2016, 5, 1).getTime());
                expect(date.nativeElement).toBe(document.activeElement);

                UIInteractions.triggerKeyDownEvtUponElem('PageDown', document.activeElement, true, false, true);
                fixture.detectChanges();
                flush();

                date = calendar.daysView.dates.find(d => getDate(d).getTime() === new Date(2017, 5, 1).getTime());
                expect(date.nativeElement).toBe(document.activeElement);
            }));
        });

        describe('Continuous month increment/decrement - ', () => {
            let fixture; let dom; let calendar; let prevMonthBtn; let nextMonthBtn;

            beforeEach(waitForAsync(() => {
                fixture = TestBed.createComponent(IgxCalendarSampleComponent);
                fixture.detectChanges();
                dom = fixture.debugElement;
                calendar = fixture.componentInstance.calendar;

                prevMonthBtn = dom.queryAll(By.css(HelperTestFunctions.CALENDAR_PREV_BUTTON_CSSCLASS))[0].nativeElement;
                nextMonthBtn = dom.queryAll(By.css(HelperTestFunctions.CALENDAR_NEXT_BUTTON_CSSCLASS))[0].nativeElement;

            }));

            it('Should increment/decrement months continuously on mousedown.', fakeAsync(() => {
                expect(calendar.viewDate.getMonth()).toEqual(5);
                // Have no idea how this test worked before,
                // changing expectation based on my udnerstanding of that the test does
                UIInteractions.simulateMouseEvent('mousedown', prevMonthBtn, 0, 0);
                tick(900);
                UIInteractions.simulateMouseEvent('mouseup', prevMonthBtn, 0, 0);
                fixture.detectChanges();
                expect(calendar.viewDate.getMonth()).toEqual(4);

                UIInteractions.simulateMouseEvent('mousedown', nextMonthBtn, 0, 0);
                tick(900);
                UIInteractions.simulateMouseEvent('mouseup', nextMonthBtn, 0, 0);
                fixture.detectChanges();
                flush();
                expect(calendar.viewDate.getMonth()).toEqual(5);
            }));

            it('Should increment/decrement months continuously on enter keydown.', fakeAsync(() => {
                expect(calendar.viewDate.getMonth()).toEqual(5);

                prevMonthBtn.focus();
                UIInteractions.triggerKeyDownEvtUponElem('Enter', prevMonthBtn);
                tick(800);
                fixture.detectChanges();
                expect(calendar.viewDate.getMonth()).toEqual(4);

                nextMonthBtn.focus();
                UIInteractions.triggerKeyDownEvtUponElem('Enter', nextMonthBtn);
                tick(800);
                fixture.detectChanges();
                expect(calendar.viewDate.getMonth()).toEqual(5);
            }));
        });
    });
});

@Component({
    template: `
        <igx-calendar [viewDate]="viewDate" [(ngModel)]="model"></igx-calendar>
    `
})
export class IgxCalendarSampleComponent {
    @ViewChild(IgxCalendarComponent, { static: true }) public calendar: IgxCalendarComponent;
    public model: Date | Date[] = new Date(2017, 5, 13);
    public viewDate = new Date(2017, 5, 13);
}

@Component({
    template: `
        <igx-calendar [viewDate]="viewDate" selection="range"></igx-calendar>
    `
})
export class IgxCalendarRangeComponent {
    @ViewChild(IgxCalendarComponent, { static: true }) public calendar: IgxCalendarComponent;
    public viewDate = new Date(2017, 5, 13);
}

@Component({
    template: `
        <igx-calendar [viewDate]="viewDate" [(ngModel)]="model" [disabledDates]="disabledDates" [specialDates]="specialDates">
        </igx-calendar>
    `
})
export class IgxCalendarDisabledSpecialDatesComponent {
    @ViewChild(IgxCalendarComponent, { static: true }) public calendar: IgxCalendarComponent;
    public model: Date | Date[] = new Date(2017, 5, 23);
    public viewDate = new Date(2017, 5, 13);
    public specialDates = [{ type: DateRangeType.Between, dateRange: [new Date(2017, 5, 1), new Date(2017, 5, 6)] }];
    public disabledDates = [{ type: DateRangeType.Between, dateRange: [new Date(2017, 5, 23), new Date(2017, 5, 29)] }];
}

@Component({
    template: `
        <igx-calendar [value]="value"></igx-calendar>
    `
})
export class IgxCalendarValueComponent {
    @ViewChild(IgxCalendarComponent, { static: true }) public calendar: IgxCalendarComponent;
    public value = new Date(2020, 7, 13);
}

class DateTester {
    // tests whether a date is disabled or not
    public static testDatesAvailability(dates: IgxDayItemComponent[], disabled: boolean) {
        for (const date of dates) {
            expect(date.isDisabled).toBe(disabled,
                date.date.date.toLocaleDateString() + ' is not disabled');
            expect(date.isDisabledCSS).toBe(disabled,
                date.date.date.toLocaleDateString() + ' is not with disabled style');
        }
    }

    // tests whether a dates is special or not
    public static testDatesSpeciality(dates: IgxDayItemComponent[], special: boolean): void {
        for (const date of dates) {
            expect(date.isSpecial).toBe(special);
        }
    }
}

type assignDateRangeDescriptors = (component: IgxCalendarComponent,
    dateRangeDescriptors: DateRangeDescriptor[]) => void;
type testDatesRange = (inRange: IgxDayItemComponent[],
    outOfRange: IgxDayItemComponent[]) => void;

class DateRangesPropertiesTester {
    public static testAfter(assignFunc: assignDateRangeDescriptors,
        testRangesFunc: testDatesRange) {
        const fixture = TestBed.createComponent(IgxCalendarSampleComponent);
        const calendar = fixture.componentInstance.calendar;
        const dateRangeDescriptors: DateRangeDescriptor[] = [];
        const afterDate = new Date(2017, 5, 13);
        const afterDateRangeDescriptor: DateRangeDescriptor = {
            type: DateRangeType.After, dateRange: [afterDate]
        };
        dateRangeDescriptors.push(afterDateRangeDescriptor);
        assignFunc(calendar, dateRangeDescriptors);
        fixture.detectChanges();

        const dates = calendar.daysView.dates.toArray();
        const inRangeDates = dates.filter(d => getDate(d).getTime() > afterDate.getTime());
        const outOfRangeDates = dates.filter(d => getDate(d).getTime() <= afterDate.getTime());
        testRangesFunc(inRangeDates, outOfRangeDates);
    }

    public static testBefore(assignFunc: assignDateRangeDescriptors,
        testRangesFunc: testDatesRange) {
        const fixture = TestBed.createComponent(IgxCalendarSampleComponent);
        const calendar = fixture.componentInstance.calendar;
        const dateRangeDescriptors: DateRangeDescriptor[] = [];
        const beforeDate = new Date(2017, 5, 13);
        const beforeDateRangeDescriptor: DateRangeDescriptor = {
            type: DateRangeType.Before, dateRange: [beforeDate]
        };
        dateRangeDescriptors.push(beforeDateRangeDescriptor);
        assignFunc(calendar, dateRangeDescriptors);
        fixture.detectChanges();

        const dates = calendar.daysView.dates.toArray();
        const inRangeDates = dates.filter(d => getDate(d).getTime() < beforeDate.getTime());
        const outOfRangeDates = dates.filter(d => getDate(d).getTime() >= beforeDate.getTime());
        testRangesFunc(inRangeDates, outOfRangeDates);
    }

    public static testBetweenWithMinDateFirst(assignFunc: assignDateRangeDescriptors,
        testRangesFunc: testDatesRange) {
        this.testBetween(assignFunc, testRangesFunc,
            new Date(2017, 5, 13), new Date(2017, 5, 20));
    }

    public static testBetweenWithMaxDateFirst(assignFunc: assignDateRangeDescriptors,
        testRangesFunc: testDatesRange) {
        this.testBetween(assignFunc, testRangesFunc,
            new Date(2017, 5, 20), new Date(2017, 5, 13));
    }

    public static testBetweenWithMinMaxTheSame(assignFunc: assignDateRangeDescriptors,
        testRangesFunc: testDatesRange) {
        this.testBetween(assignFunc, testRangesFunc,
            new Date(2017, 5, 20), new Date(2017, 5, 20));
    }

    public static testSpecific(assignFunc: assignDateRangeDescriptors,
        testRangesFunc: testDatesRange) {
        const fixture = TestBed.createComponent(IgxCalendarSampleComponent);
        const calendar = fixture.componentInstance.calendar;
        const dateRangeDescriptors: DateRangeDescriptor[] = [];
        const specificDates = [new Date(2017, 5, 1), new Date(2017, 5, 10),
        new Date(2017, 5, 20), new Date(2017, 5, 21), new Date(2017, 5, 22)];
        dateRangeDescriptors.push({ type: DateRangeType.Specific, dateRange: specificDates });
        assignFunc(calendar, dateRangeDescriptors);
        fixture.detectChanges();

        const specificDatesSet = new Set<number>();
        specificDates.map(d => specificDatesSet.add(d.getTime()));
        const dates = calendar.daysView.dates.toArray();
        const inRangeDates = dates.filter(d => specificDatesSet.has(getDate(d).getTime()));
        const outOfRangeDates = dates.filter(d => !specificDatesSet.has(getDate(d).getTime()));
        testRangesFunc(inRangeDates, outOfRangeDates);
    }

    public static testWeekdays(assignFunc: assignDateRangeDescriptors,
        testRangesFunc: testDatesRange) {
        const fixture = TestBed.createComponent(IgxCalendarSampleComponent);
        const calendar = fixture.componentInstance.calendar;
        const dateRangeDescriptors: DateRangeDescriptor[] =
            [{ type: DateRangeType.Weekdays }];
        assignFunc(calendar, dateRangeDescriptors);
        fixture.detectChanges();

        const dates = calendar.daysView.dates.toArray();
        const inRangeDates = dates.filter(d => d.date.date.getDay() !== 0 &&
            d.date.date.getDay() !== 6);
        const outOfRangeDates = dates.filter(d => d.date.date.getDay() === 0 ||
            d.date.date.getDay() === 6);
        testRangesFunc(inRangeDates, outOfRangeDates);
    }

    public static testWeekends(assignFunc: assignDateRangeDescriptors,
        testRangesFunc: testDatesRange) {
        const fixture = TestBed.createComponent(IgxCalendarSampleComponent);
        const calendar = fixture.componentInstance.calendar;
        const dateRangeDescriptors: DateRangeDescriptor[] =
            [{ type: DateRangeType.Weekends }];
        assignFunc(calendar, dateRangeDescriptors);
        fixture.detectChanges();

        const dates = calendar.daysView.dates.toArray();
        const inRangeDates = dates.filter(d => d.date.date.getDay() === 0 ||
            d.date.date.getDay() === 6);
        const outOfRangeDates = dates.filter(d => d.date.date.getDay() !== 0 &&
            d.date.date.getDay() !== 6);
        testRangesFunc(inRangeDates, outOfRangeDates);
    }

    public static testOverlappingBetweens(assignFunc: assignDateRangeDescriptors,
        testRangesFunc: testDatesRange) {
        const fixture = TestBed.createComponent(IgxCalendarSampleComponent);
        const calendar = fixture.componentInstance.calendar;
        const dateRangeDescriptors: DateRangeDescriptor[] = [];
        const firstBetweenMin = new Date(2017, 5, 5);
        const firstBetweenMax = new Date(2017, 5, 10);
        const secondBetweenMin = new Date(2017, 5, 7);
        const secondBetweenMax = new Date(2017, 5, 15);
        dateRangeDescriptors.push(
            { type: DateRangeType.Between, dateRange: [firstBetweenMin, firstBetweenMax] });
        dateRangeDescriptors.push(
            { type: DateRangeType.Between, dateRange: [secondBetweenMin, secondBetweenMax] });
        assignFunc(calendar, dateRangeDescriptors);
        fixture.detectChanges();

        const dates = calendar.daysView.dates.toArray();
        const inRangeDates = dates.filter(d => getDate(d).getTime() >= firstBetweenMin.getTime() &&
            getDate(d).getTime() <= secondBetweenMax.getTime());
        const outOfRangeDates = dates.filter(d => getDate(d).getTime() < firstBetweenMin.getTime() &&
            getDate(d).getTime() > secondBetweenMax.getTime());
        testRangesFunc(inRangeDates, outOfRangeDates);
    }

    public static testMultipleRanges(assignFunc: assignDateRangeDescriptors,
        testRangesFunc: testDatesRange) {
        const fixture = TestBed.createComponent(IgxCalendarSampleComponent);
        const calendar = fixture.componentInstance.calendar;
        const dateRangeDescriptors: DateRangeDescriptor[] = [];
        dateRangeDescriptors.push(
            { type: DateRangeType.Before, dateRange: [new Date(2017, 5, 1)] });
        dateRangeDescriptors.push(
            { type: DateRangeType.After, dateRange: [new Date(2017, 5, 29)] });
        dateRangeDescriptors.push(
            { type: DateRangeType.Weekends });
        dateRangeDescriptors.push(
            { type: DateRangeType.Between, dateRange: [new Date(2017, 5, 1), new Date(2017, 5, 16)] });
        dateRangeDescriptors.push(
            { type: DateRangeType.Between, dateRange: [new Date(2017, 5, 5), new Date(2017, 5, 28)] });
        assignFunc(calendar, dateRangeDescriptors);
        fixture.detectChanges();

        const dates = calendar.daysView.dates.toArray();
        const enabledDateTime = new Date(2017, 5, 29).getTime();
        const inRangesDates = dates.filter(d => getDate(d).getTime() !== enabledDateTime);
        const outOfRangeDates = dates.filter(d => getDate(d).getTime() === enabledDateTime);
        testRangesFunc(inRangesDates, outOfRangeDates);
    }

    public static testRangeUpdateRuntime(assignFunc: assignDateRangeDescriptors,
        testRangesFunc: testDatesRange) {
        const fixture = TestBed.createComponent(IgxCalendarSampleComponent);
        const calendar = fixture.componentInstance.calendar;
        const dateRangeDescriptors: DateRangeDescriptor[] = [];
        const specificDate = new Date(2017, 5, 15);
        dateRangeDescriptors.push({ type: DateRangeType.Specific, dateRange: [specificDate] });
        assignFunc(calendar, dateRangeDescriptors);
        fixture.detectChanges();

        const dates = calendar.daysView.dates.toArray();
        let inRangesDates = dates.filter(d => getDate(d).getTime() === specificDate.getTime());
        let outOfRangesDates = dates.filter(d => getDate(d).getTime() !== specificDate.getTime());
        testRangesFunc(inRangesDates, outOfRangesDates);

        const newSpecificDate = new Date(2017, 5, 16);
        const newDateRangeDescriptors: DateRangeDescriptor[] = [];
        newDateRangeDescriptors.push({ type: DateRangeType.Specific, dateRange: [newSpecificDate] });
        assignFunc(calendar, newDateRangeDescriptors);
        fixture.detectChanges();

        inRangesDates = dates.filter(d => getDate(d).getTime() === newSpecificDate.getTime());
        outOfRangesDates = dates.filter(d => getDate(d).getTime() !== newSpecificDate.getTime());
        testRangesFunc(inRangesDates, outOfRangesDates);
    }

    public static testPreviousMonthRange(assignFunc: assignDateRangeDescriptors,
        testRangesFunc: testDatesRange) {
        const fixture = TestBed.createComponent(IgxCalendarSampleComponent);
        const calendar = fixture.componentInstance.calendar;
        const dateRangeDescriptors: DateRangeDescriptor[] = [];
        const beforeDate = new Date(2017, 5, 13);
        dateRangeDescriptors.push({ type: DateRangeType.Before, dateRange: [beforeDate] });
        assignFunc(calendar, dateRangeDescriptors);
        fixture.detectChanges();
        const debugEl = fixture.debugElement;
        const calendarNativeElement = debugEl.query(By.css(HelperTestFunctions.CALENDAR_CSSCLASS)).nativeElement;
        UIInteractions.triggerKeyDownEvtUponElem('PageUp', calendarNativeElement);
        fixture.detectChanges();
        testRangesFunc(calendar.daysView.dates.toArray(), []);
    }

    public static assignDisableDatesDescriptors(component: IgxCalendarComponent,
        dateRangeDescriptors: DateRangeDescriptor[]) {
        component.disabledDates = dateRangeDescriptors;
    }

    public static testDisabledDates(inRange: IgxDayItemComponent[],
        outOfRange: IgxDayItemComponent[]) {
        DateTester.testDatesAvailability(inRange, true);
        DateTester.testDatesAvailability(outOfRange, false);
    }

    public static assignSpecialDatesDescriptors(component: IgxCalendarComponent,
        dateRangeDescriptors: DateRangeDescriptor[]) {
        component.specialDates = dateRangeDescriptors;
    }

    public static testSpecialDates(inRange: IgxDayItemComponent[],
        outOfRange: IgxDayItemComponent[]) {
        DateTester.testDatesSpeciality(inRange, true);
        DateTester.testDatesSpeciality(outOfRange, false);
    }

    private static testBetween(assignFunc: assignDateRangeDescriptors,
        testRangesFunc: testDatesRange, firstDate: Date, secondDate: Date) {
        const fixture = TestBed.createComponent(IgxCalendarSampleComponent);
        const calendar = fixture.componentInstance.calendar;
        const dateRangeDescriptors: DateRangeDescriptor[] = [];
        const betweenMin = firstDate.getTime() > secondDate.getTime() ? secondDate : firstDate;
        const betweenMax = firstDate.getTime() > secondDate.getTime() ? firstDate : secondDate;
        dateRangeDescriptors.push(
            { type: DateRangeType.Between, dateRange: [betweenMax, betweenMin] });
        assignFunc(calendar, dateRangeDescriptors);
        fixture.detectChanges();

        const dates = calendar.daysView.dates.toArray();
        const inRangeDates = dates.filter(d => getDate(d).getTime() >= betweenMin.getTime() &&
            getDate(d).getTime() <= betweenMax.getTime());
        const outOfRangeDates = dates.filter(d => getDate(d).getTime() < betweenMin.getTime() &&
            getDate(d).getTime() > betweenMax.getTime());
        testRangesFunc(inRangeDates, outOfRangeDates);
    }
}

const getDate = (dateDirective: IgxDayItemComponent) => {
    const fullDate = dateDirective.date.date;
    const date = new Date(fullDate.getFullYear(), fullDate.getMonth(), fullDate.getDate());
    return date;
};
