import { Component, ViewChild } from '@angular/core';
import { async, TestBed, } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import {
    Calendar, IgxCalendarComponent, IgxCalendarModule, isLeap, IgxCalendarDateDirective,
    monthRange, weekDay, WEEKDAYS } from './index';
import { UIInteractions } from '../test-utils/ui-interactions.spec';
import { DateRangeDescriptor, DateRangeType } from '../core/dates/dateRange';

describe('IgxCalendar', () => {
    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [IgxCalendarSampleComponent, IgxCalendaRangeComponent],
            imports: [IgxCalendarModule, FormsModule, NoopAnimationsModule]
        });
    });

    // Calendar Model Tests
    it('should create proper calendar model', () => {
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

    it('should receive correct values from utility functions', () => {
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

    describe('Rendered Component', () => {
        let fixture;
        beforeEach(
            async(() => {
                TestBed.configureTestingModule({
                    declarations: [IgxCalendarSampleComponent],
                    imports: [IgxCalendarModule, FormsModule, NoopAnimationsModule]
                }).compileComponents()
                .then(() => {
                    fixture = TestBed.createComponent(IgxCalendarSampleComponent);
                    fixture.detectChanges();
                 });
            })
        );

        it('should initialize a calendar component', () => {
            expect(fixture.componentInstance).toBeDefined();
        });

        it('should initialize a calendar component with `id` property', () => {
            const domCalendar = fixture.debugElement.query(By.css('igx-calendar')).nativeElement;

            expect(fixture.componentInstance.calendar.id).toBe('igx-calendar-1');
            expect(domCalendar.id).toBe('igx-calendar-1');

            fixture.componentInstance.calendar.id = 'customCalendar';
            fixture.detectChanges();

            expect(fixture.componentInstance.calendar.id).toBe('customCalendar');
            expect(domCalendar.id).toBe('customCalendar');
        });

        it('should properly set @Input properties and setters', () => {
            const calendar = fixture.componentInstance.calendar;

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

        it('should properly set formatOptions and formatViews', () => {
            fixture = TestBed.createComponent(IgxCalendarSampleComponent);
            fixture.componentInstance.viewDate = new Date(2018, 8, 17);
            fixture.componentInstance.model = new Date();
            fixture.detectChanges();

            const calendar = fixture.componentInstance.calendar;
            const dom = fixture.debugElement;
            const defaultOptions = {
                day: 'numeric',
                month: 'short',
                weekday: 'short',
                year: 'numeric'
            };
            const defaultViews = { day: false, month: true, year: false};
            const bodyMonth = dom.query(By.css('.date .date__el'));
            const headerYear = dom.query(By.css('.igx-calendar__header-year'));
            const bodyYear = dom.queryAll(By.css('.date .date__el'))[1];
            const headerWeekday = dom.queryAll(By.css('.igx-calendar__header-date span'))[0];
            const headerDate = dom.queryAll(By.css('.igx-calendar__header-date span'))[1];

            calendar.selectDate(calendar.viewDate);
            fixture.detectChanges();

            expect(calendar.formatOptions).toEqual(jasmine.objectContaining(defaultOptions));
            expect(calendar.formatViews).toEqual(jasmine.objectContaining(defaultViews));
            expect(headerYear.nativeElement.textContent.trim()).toMatch('2018');
            expect(headerWeekday.nativeElement.textContent.trim()).toMatch('Mon');
            expect(headerDate.nativeElement.textContent.trim()).toMatch('Sep 17');
            expect(bodyYear.nativeElement.textContent.trim()).toMatch('2018');
            expect(bodyMonth.nativeElement.textContent.trim()).toMatch('Sep');

            // change formatOptions and formatViews
            const formatOptions: any = { month: 'long', year: '2-digit' };
            const formatViews: any = { month: true, year: true};
            calendar.formatOptions = formatOptions;
            calendar.formatViews = formatViews;
            fixture.detectChanges();

            expect(calendar.formatOptions).toEqual(jasmine.objectContaining(Object.assign(defaultOptions, formatOptions)));
            expect(calendar.formatViews).toEqual(jasmine.objectContaining(Object.assign(defaultViews, formatViews)));
            expect(headerYear.nativeElement.textContent.trim()).toMatch('18');
            expect(headerWeekday.nativeElement.textContent.trim()).toMatch('Mon');
            expect(headerDate.nativeElement.textContent.trim()).toMatch('September 17');
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
            expect(headerWeekday.nativeElement.textContent.trim()).toMatch('Mon');
            expect(headerDate.nativeElement.textContent.trim()).toMatch('September 17');
            expect(bodyYear.nativeElement.textContent.trim()).toMatch('2018');
            expect(bodyMonth.nativeElement.textContent.trim()).toMatch('8');
        });

        it('should properly render calendar DOM structure', async(() => {
            const calendar = fixture.componentInstance.calendar;
            const today = new Date(Date.now());
            calendar.viewDate = today;
            fixture.detectChanges();
            const dom = fixture.debugElement;
            const calendarRows = dom.queryAll(By.css('.igx-calendar__body-row'));

            // 6 weeks + week header
            expect(calendarRows.length).toEqual(7);

            // 7 calendar rows * 7 elements in each
            expect(
                dom.queryAll(By.css('.igx-calendar__body-row > span')).length
            ).toEqual(49);

            // Today class applied
            expect(
                dom
                    .query(By.css('.igx-calendar__date--current'))
                    .nativeElement.textContent.trim()
            ).toMatch(today.getDate().toString());

            fixture.whenStable().then(() => {
                // Hide calendar header when not single selection
                calendar.selection = 'multi';
                return fixture.whenStable();
            }).then(() => {
                fixture.detectChanges();
                const calendarHeader = dom.query(By.css('.igx-calendar__header'));
                expect(calendarHeader).toBeFalsy();
            });
        }));

        it('Calendar DOM structure - year view | month view', () => {
            const calendar = fixture.componentInstance.calendar;
            const dom = fixture.debugElement;

            const collection = dom.queryAll(By.css('.date__el'));
            const monthButton = collection[0];
            const yearButton = collection[1];

            monthButton.triggerEventHandler('click', {});
            fixture.detectChanges();

            expect(dom.query(By.css('.igx-calendar__body-row--wrap'))).toBeDefined();
            const months = dom.queryAll(By.css('.igx-calendar__month'));
            const currentMonth = dom.query(By.css('.igx-calendar__month--current'));

            expect(months.length).toEqual(11);
            expect(currentMonth.nativeElement.textContent.trim()).toMatch('Jun');

            months[0].triggerEventHandler('click', { target: months[0].nativeElement });
            fixture.detectChanges();

            expect(calendar.viewDate.getMonth()).toEqual(0);

            yearButton.triggerEventHandler('click', {});
            fixture.detectChanges();

            expect(dom.query(By.css('.igx-calendar__body-column'))).toBeDefined();
            const years = dom.queryAll(By.css('.igx-calendar__year'));
            const currentYear = dom.query(By.css('.igx-calendar__year--current'));

            expect(years.length).toEqual(6);
            expect(currentYear.nativeElement.textContent.trim()).toMatch('2017');

            years[0].triggerEventHandler('click', { target: years[0].nativeElement });
            fixture.detectChanges();

            expect(calendar.viewDate.getFullYear()).toEqual(2014);
        });

        it('Calendar selection - single with event', async(() => {
            const calendar = fixture.componentInstance.calendar;
            const dom = fixture.debugElement;

            fixture.whenStable().then(() => {
                fixture.detectChanges();
                const target = dom.query(By.css('.igx-calendar__date--selected'));
                const weekDiv = target.parent;
                const weekDays = weekDiv.queryAll(By.css('span'));
                const nextDay = new Date(2017, 5, 14);

                expect((calendar.value as Date).toDateString()).toMatch(
                    new Date(2017, 5, 13).toDateString()
                );

                spyOn(calendar.onSelection, 'emit');

                // Select 14th
                weekDays[3].triggerEventHandler('click', {});

                fixture.detectChanges();

                expect(calendar.onSelection.emit).toHaveBeenCalled();
                expect((calendar.value as Date).toDateString()).toMatch(
                    nextDay.toDateString()
                );
                expect(
                    weekDays[3].nativeElement.classList.contains(
                        'igx-calendar__date--selected'
                    )
                ).toBe(true);
                expect(
                    (fixture.componentInstance.model as Date).toDateString()
                ).toMatch(nextDay.toDateString());
                expect(
                    target.nativeElement.classList.contains(
                        'igx-calendar__date--selected'
                    )
                ).toBe(false);
            });
        }));

        it('Calendar selection - outside of current month - 1', async(() => {
            const calendar = fixture.componentInstance.calendar;
            const dom = fixture.debugElement;

            fixture.whenStable().then(() => {
                fixture.detectChanges();
                const parent = dom.query(
                    By.css('.igx-calendar__body-row:last-child')
                );
                const target = parent.queryAll(By.css('span')).pop();

                target.triggerEventHandler('click', {});
                fixture.detectChanges();

                expect(
                    (fixture.componentInstance.model as Date).toDateString()
                ).toMatch(new Date(2017, 6, 8).toDateString());
                expect(
                    dom
                        .query(By.css('.igx-calendar__header-date'))
                        .nativeElement.textContent.includes('Jul')
                ).toBe(true);
            });
        }));

        it('Calendar selection - outside of current month - 2', async(() => {
            const calendar = fixture.componentInstance.calendar;
            const dom = fixture.debugElement;

            fixture.whenStable().then(() => {
                fixture.detectChanges();
                const parent = dom.queryAll(By.css('.igx-calendar__body-row'))[1];
                const target = parent.queryAll(By.css('span')).shift();

                target.triggerEventHandler('click', {});
                fixture.detectChanges();

                expect(
                    (fixture.componentInstance.model as Date).toDateString()
                ).toMatch(new Date(2017, 4, 28).toDateString());
                expect(
                    dom
                        .query(By.css('.igx-calendar__header-date'))
                        .nativeElement.textContent.includes('May')
                ).toBe(true);
            });
        }));

        it('Calendar selection - single through API', async(() => {
            const calendar = fixture.componentInstance.calendar;
            const dom = fixture.debugElement;
            fixture.whenStable().then(() => {
                fixture.detectChanges();
                const target = dom.query(By.css('.igx-calendar__date--selected'));
                const weekDiv = target.parent;
                const weekDays = weekDiv.queryAll(By.css('span'));
                const nextDay = new Date(2017, 5, 14);

                expect((calendar.value as Date).toDateString()).toMatch(
                    new Date(2017, 5, 13).toDateString()
                );

                calendar.selectDate(new Date(2017, 5, 14));
                fixture.detectChanges();

                expect((calendar.value as Date).toDateString()).toMatch(
                    nextDay.toDateString()
                );
                expect(
                    weekDays[3].nativeElement.classList.contains(
                        'igx-calendar__date--selected'
                    )
                ).toBe(true);
                expect(
                    (fixture.componentInstance.model as Date).toDateString()
                ).toMatch(nextDay.toDateString());
                expect(
                    target.nativeElement.classList.contains(
                        'igx-calendar__date--selected'
                    )
                ).toBe(false);
            });
        }));

        it('Calendar selection - multiple with event', async(() => {
            const calendar = fixture.componentInstance.calendar;
            const dom = fixture.debugElement;

            fixture.whenStable().then(() => {
                fixture.detectChanges();
                const target = dom.query(By.css('.igx-calendar__date--selected'));
                const weekDiv = target.parent;
                const weekDays = weekDiv.queryAll(By.css('span'));

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

                weekDays.forEach((el) => {
                    el.triggerEventHandler('click', {});
                    fixture.detectChanges();
                });

                expect((calendar.value as Date[]).length).toEqual(7);
                expect((fixture.componentInstance.model as Date[]).length).toEqual(
                    7
                );
                weekDays.forEach((el) => {
                    expect(
                        el.nativeElement.classList.contains(
                            'igx-calendar__date--selected'
                        )
                    ).toBe(true);
                });

                // Deselect last day
                weekDays[weekDays.length - 1].triggerEventHandler('click', {});
                fixture.detectChanges();

                expect((calendar.value as Date[]).length).toEqual(6);
                expect((fixture.componentInstance.model as Date[]).length).toEqual(
                    6
                );
                expect(
                    weekDays[weekDays.length - 1].nativeElement.classList.contains(
                        'igx-calendar__date--selected'
                    )
                ).toBe(false);
            });
        }));

        it('Calendar selection - multiple through API', async(() => {
            const calendar = fixture.componentInstance.calendar;
            const dom = fixture.debugElement;

            fixture.whenStable().then(() => {
                fixture.detectChanges();
                const target = dom.query(By.css('.igx-calendar__date--selected'));
                const weekDiv = target.parent;
                const weekDays = weekDiv.queryAll(By.css('span'));

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
                expect(
                    weekDays[weekDays.length - 1].nativeElement.classList.contains(
                        'igx-calendar__date--selected'
                    )
                ).toBe(true);

                // Multiple dates
                calendar.selectDate([new Date(2017, 5, 11), new Date(2017, 5, 12)]);
                fixture.detectChanges();

                expect((fixture.componentInstance.model as Date[]).length).toEqual(
                    3
                );
                expect((calendar.value as Date[]).length).toEqual(3);
                // 11th June
                expect(
                    weekDays[0].nativeElement.classList.contains(
                        'igx-calendar__date--selected'
                    )
                ).toBe(true);
                // 12th June
                expect(
                    weekDays[1].nativeElement.classList.contains(
                        'igx-calendar__date--selected'
                    )
                ).toBe(true);
            });
        }));

        it('Calendar selection - range with event', async(() => {
            const calendar = fixture.componentInstance.calendar;
            const dom = fixture.debugElement;

            fixture.whenStable().then(() => {
                fixture.detectChanges();
                const target = dom.query(By.css('.igx-calendar__date--selected'));
                const weekDiv = target.parent;
                const weekDays = weekDiv.queryAll(By.css('span'));

                calendar.selection = 'range';
                fixture.detectChanges();

                const lastDay = new Date(2017, 5, 17);
                const firstDay = new Date(2017, 5, 11);

                // Toggle range selection...
                weekDays[0].triggerEventHandler('click', {});
                fixture.detectChanges();

                expect((fixture.componentInstance.model as Date[]).length).toEqual(
                    1
                );
                expect((calendar.value as Date[]).length).toEqual(1);
                expect(
                    (fixture.componentInstance.model as Date[])[0].toDateString()
                ).toMatch(firstDay.toDateString());
                expect(
                    weekDays[0].nativeElement.classList.contains(
                        'igx-calendar__date--selected'
                    )
                ).toBe(true);

                // ...and cancel it
                weekDays[0].triggerEventHandler('click', {});
                fixture.detectChanges();

                expect((fixture.componentInstance.model as Date[]).length).toEqual(
                    0
                );
                expect((calendar.value as Date[]).length).toEqual(0);
                expect(
                    weekDays[0].nativeElement.classList.contains(
                        'igx-calendar__date--selected'
                    )
                ).toBe(false);

                // Toggle range selection...
                weekDays[0].triggerEventHandler('click', {});
                fixture.detectChanges();

                // ...and complete it
                weekDays[weekDays.length - 1].triggerEventHandler('click', {});
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
                    expect(
                        el.nativeElement.classList.contains(
                            'igx-calendar__date--selected'
                        )
                    ).toBe(true);
                });
            });
        }));

        it('Calendar selection - range through API', async(() => {
            const calendar = fixture.componentInstance.calendar;
            const dom = fixture.debugElement;

            fixture.whenStable().then(() => {
                fixture.detectChanges();
                const target = dom.query(By.css('.igx-calendar__date--selected'));
                const weekDiv = target.parent;
                const weekDays = weekDiv.queryAll(By.css('span'));

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
                    expect(
                        el.nativeElement.classList.contains(
                            'igx-calendar__date--selected'
                        )
                    ).toBe(true);
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
                    expect(
                        weekDays[i].nativeElement.classList.contains(
                            'igx-calendar__date--selected'
                        )
                    ).toBe(true);
                }
            });
        }));

        it('Calendar keyboard navigation - PageUp/PageDown', () => {
            const calendar = fixture.componentInstance.calendar;
            const dom = fixture.debugElement;
            const component = dom.query(By.css('.igx-calendar'));

            UIInteractions.simulateKeyDownEvent(component.nativeElement, 'PageUp');
            fixture.detectChanges();
            expect(calendar.viewDate.getMonth()).toEqual(4);

            calendar.viewDate = new Date(2017, 5, 13);
            fixture.detectChanges();
            UIInteractions.simulateKeyDownEvent(component.nativeElement, 'PageDown');
            fixture.detectChanges();

            expect(calendar.viewDate.getMonth()).toEqual(6);

            UIInteractions.simulateKeyDownEvent(component.nativeElement, 'Shift.PageUp');
            fixture.detectChanges();

            expect(calendar.viewDate.getFullYear()).toEqual(2016);

            calendar.viewDate = new Date(2017, 5, 13);
            fixture.detectChanges();

            UIInteractions.simulateKeyDownEvent(component.nativeElement, 'Shift.PageDown');
            fixture.detectChanges();

            expect(calendar.viewDate.getFullYear()).toEqual(2018);
        });

        it('Calendar keyboard navigation - Home/End/Enter', async(() => {
            fixture.whenStable().then(() => {
                fixture.detectChanges();
                const calendar = fixture.componentInstance.calendar;
                const dom = fixture.debugElement;
                const component = dom.query(By.css('.igx-calendar'));

                const days = calendar.dates.filter((day) => day.isCurrentMonth);
                const firstDay = days[0];
                const lastDay = days[days.length - 1];

                UIInteractions.simulateKeyDownEvent(component.nativeElement, 'Home');
                fixture.detectChanges();

                expect(document.activeElement.textContent).toMatch(firstDay.nativeElement.textContent);
                expect(document.activeElement.textContent.trim()).toMatch('1');

                UIInteractions.simulateKeyDownEvent(component.nativeElement, 'End');
                fixture.detectChanges();

                expect(document.activeElement.textContent).toMatch(lastDay.nativeElement.textContent);
                expect(document.activeElement.textContent.trim()).toMatch('30');

                UIInteractions.simulateKeyDownEvent(firstDay.nativeElement, 'Enter');
                fixture.detectChanges();

                expect((calendar.value as Date).toDateString()).toMatch(new Date(2017, 5, 1).toDateString());
            });
        }));

        it('Calendar keyboard navigation - Arrow keys', async(() => {
            fixture.whenStable().then(() => {
                const calendar = fixture.componentInstance.calendar;
                const dom = fixture.debugElement;
                const component = dom.query(By.css('.igx-calendar'));

                const days = calendar.dates.filter((day) => day.isCurrentMonth);
                const firstDay = days[0];

                UIInteractions.simulateKeyDownEvent(component.nativeElement, 'Home');
                fixture.detectChanges();

                expect(document.activeElement.textContent).toMatch(firstDay.nativeElement.textContent);
                expect(document.activeElement.textContent.trim()).toMatch('1');

                UIInteractions.simulateKeyDownEvent(document.activeElement, 'ArrowDown');
                fixture.detectChanges();

                expect(document.activeElement.textContent.trim()).toMatch('8');

                UIInteractions.simulateKeyDownEvent(document.activeElement, 'ArrowLeft');
                fixture.detectChanges();

                expect(document.activeElement.textContent.trim()).toMatch('7');

                UIInteractions.simulateKeyDownEvent(document.activeElement, 'ArrowRight');
                fixture.detectChanges();

                expect(document.activeElement.textContent.trim()).toMatch('8');

                UIInteractions.simulateKeyDownEvent(document.activeElement, 'ArrowUp');
                fixture.detectChanges();

                expect(document.activeElement.textContent.trim()).toMatch('1');
            });
        }));

        it('Calendar date should persist the focus when select date in the (next/prev) month.', ((done) => {
            const component = fixture.debugElement.query(By.css('.igx-calendar'));
            const calendar = fixture.componentInstance.calendar;
            const calendarMonth = calendar.getCalendarMonth;
            let value = calendarMonth[0][4];

            UIInteractions.triggerKeyDownEvtUponElem('Home', component.nativeElement, true);
            fixture.detectChanges();

            let date = calendar.dates.find((d) => d.date.date.toString() === value.date.toString()).nativeElement;
            UIInteractions.simulateKeyDownEvent(date, 'Enter');
            fixture.detectChanges();
            expect(document.activeElement).toBe(date);

            value = calendarMonth[4][6];
            date = calendar.dates.find((d) => d.date.date.toString() === value.date.toString()).nativeElement;

            UIInteractions.simulateKeyDownEvent(date, 'Enter');
            fixture.detectChanges();
            setTimeout(() => {
                fixture.detectChanges();
                date = calendar.dates.find((d) => d.date.date.toString() === value.date.toString()).nativeElement;
                expect(document.activeElement).toBe(date);
                UIInteractions.triggerKeyDownEvtUponElem('ArrowRight', document.activeElement, true);
                fixture.detectChanges();
                setTimeout(() => {
                    fixture.detectChanges();
                    expect(document.activeElement.textContent.trim()).toMatch('2');
                    done();
                }, 500);
            }, 500);
        }));
    });

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

    it('Should disable previous month with "before" date descriptor', async(() => {
        DateRangesPropertiesTester.testPreviousMonthRangeAsync(
            DateRangesPropertiesTester.assignDisableDatesDescriptors,
            DateRangesPropertiesTester.testDisabledDates
        );
    }));

    it('Should be able to change disable dates runtime.', () => {
        DateRangesPropertiesTester.testRangeUpdateRuntime(
            DateRangesPropertiesTester.assignDisableDatesDescriptors,
            DateRangesPropertiesTester.testDisabledDates
        );
    });

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

    it('Should mark as special previous month with "before" date descriptor', async(() => {
        DateRangesPropertiesTester.testPreviousMonthRangeAsync(
            DateRangesPropertiesTester.assignSpecialDatesDescriptors,
            DateRangesPropertiesTester.testSpecialDates
        );
    }));

    it('Should be able to change special dates runtime.', () => {
        DateRangesPropertiesTester.testRangeUpdateRuntime(
            DateRangesPropertiesTester.assignSpecialDatesDescriptors,
            DateRangesPropertiesTester.testSpecialDates
        );
    });

    it('Should navigate to first enabled date when using "home" key.', async(() => {
        const fixture = TestBed.createComponent(IgxCalendarSampleComponent);
        const debugEl = fixture.debugElement;
        const calendar = fixture.componentInstance.calendar;
        const dateRangeDescriptors: DateRangeDescriptor[] = [];
        const specificDates = [new Date(2017, 5, 1), new Date(2017, 5, 2)];
        dateRangeDescriptors.push({ type: DateRangeType.Specific, dateRange: specificDates },
            {type: DateRangeType.Weekends});
        calendar.disabledDates = dateRangeDescriptors;
        fixture.detectChanges();

        fixture.whenStable().then(() => {
            const calendarNativeElement = debugEl.query(By.css('.igx-calendar')).nativeElement;
            UIInteractions.simulateKeyDownEvent(calendarNativeElement, 'Home');
            fixture.detectChanges();

            const date = calendar.dates.filter(
                d => getDate(d).getTime() === new Date(2017, 5, 5).getTime())[0];
            expect(date.nativeElement).toBe(document.activeElement);
        });
    }));

    it('Should navigate to last enabled date when using "end" key.', async(() => {
        const fixture = TestBed.createComponent(IgxCalendarSampleComponent);
        const debugEl = fixture.debugElement;
        const calendar = fixture.componentInstance.calendar;
        const dateRangeDescriptors: DateRangeDescriptor[] = [];
        const rangeDates = [new Date(2017, 5, 28), new Date(2017, 5, 30)];
        dateRangeDescriptors.push({ type: DateRangeType.Between, dateRange: rangeDates },
            {type: DateRangeType.Specific, dateRange: [new Date(2017, 5, 27)]});
        calendar.disabledDates = dateRangeDescriptors;
        fixture.detectChanges();

        fixture.whenStable().then(() => {
            const calendarNativeElement = debugEl.query(By.css('.igx-calendar')).nativeElement;
            UIInteractions.simulateKeyDownEvent(calendarNativeElement, 'End');
            fixture.detectChanges();

            const date = calendar.dates.filter(
                d => getDate(d).getTime() === new Date(2017, 5, 26).getTime())[0];
            expect(date.nativeElement).toBe(document.activeElement);
        });
    }));

    it('Should navigate to first enabled date when using "arrow up" key.', async(() => {
        const fixture = TestBed.createComponent(IgxCalendarSampleComponent);
        const debugEl = fixture.debugElement;
        const calendar = fixture.componentInstance.calendar;
        const dateRangeDescriptors: DateRangeDescriptor[] = [];
        const specificDates = [new Date(2017, 5, 23), new Date(2017, 5, 16)];
        dateRangeDescriptors.push({ type: DateRangeType.Specific, dateRange: specificDates },
            { type: DateRangeType.Weekends });
        calendar.disabledDates = dateRangeDescriptors;
        fixture.detectChanges();

        fixture.whenStable().then(() => {
            const calendarNativeElement = debugEl.query(By.css('.igx-calendar')).nativeElement;
            UIInteractions.simulateKeyDownEvent(calendarNativeElement, 'End');
            fixture.detectChanges();

            UIInteractions.simulateKeyDownEvent(document.activeElement, 'ArrowUp');
                fixture.detectChanges();

            const date = calendar.dates.filter(
                d => getDate(d).getTime() === new Date(2017, 5, 9).getTime())[0];
            expect(date.nativeElement).toBe(document.activeElement);
        });
    }));

    it('Should navigate to first enabled date when using "arrow down" key.', async(() => {
        const fixture = TestBed.createComponent(IgxCalendarSampleComponent);
        const debugEl = fixture.debugElement;
        const calendar = fixture.componentInstance.calendar;
        const dateRangeDescriptors: DateRangeDescriptor[] = [];
        const specificDates = [new Date(2017, 5, 8), new Date(2017, 5, 15)];
        dateRangeDescriptors.push({ type: DateRangeType.Specific, dateRange: specificDates},
            { type: DateRangeType.Weekends });
        calendar.disabledDates = dateRangeDescriptors;
        fixture.detectChanges();

        fixture.whenStable().then(() => {
            const calendarNativeElement = debugEl.query(By.css('.igx-calendar')).nativeElement;
            UIInteractions.simulateKeyDownEvent(calendarNativeElement, 'Home');
            fixture.detectChanges();

            UIInteractions.simulateKeyDownEvent(document.activeElement, 'ArrowDown');
                fixture.detectChanges();

            const date = calendar.dates.filter(
                d => getDate(d).getTime() === new Date(2017, 5, 22).getTime())[0];
            expect(date.nativeElement).toBe(document.activeElement);
        });
    }));

    it('Should navigate to first enabled date when using "arrow left" key.', async(() => {
        const fixture = TestBed.createComponent(IgxCalendarSampleComponent);
        const debugEl = fixture.debugElement;
        const calendar = fixture.componentInstance.calendar;
        const dateRangeDescriptors: DateRangeDescriptor[] = [];
        const rangeDates = [new Date(2017, 5, 2), new Date(2017, 5, 29)];
        dateRangeDescriptors.push({ type: DateRangeType.Between, dateRange: rangeDates });
        calendar.disabledDates = dateRangeDescriptors;
        fixture.detectChanges();

        fixture.whenStable().then(() => {
            const calendarNativeElement = debugEl.query(By.css('.igx-calendar')).nativeElement;
            UIInteractions.simulateKeyDownEvent(calendarNativeElement, 'End');
            fixture.detectChanges();

            UIInteractions.simulateKeyDownEvent(document.activeElement, 'ArrowLeft');
                fixture.detectChanges();

            const date = calendar.dates.filter(
                d => getDate(d).getTime() === new Date(2017, 5, 1).getTime())[0];
            expect(date.nativeElement).toBe(document.activeElement);
        });
    }));

    it('Should navigate to first enabled date when using "arrow right" key.', async(() => {
        const fixture = TestBed.createComponent(IgxCalendarSampleComponent);
        const debugEl = fixture.debugElement;
        const calendar = fixture.componentInstance.calendar;
        const dateRangeDescriptors: DateRangeDescriptor[] = [];
        const rangeDates = [new Date(2017, 5, 2), new Date(2017, 5, 29)];
        dateRangeDescriptors.push({ type: DateRangeType.Between, dateRange: rangeDates });
        calendar.disabledDates = dateRangeDescriptors;
        fixture.detectChanges();

        fixture.whenStable().then(() => {
            const calendarNativeElement = debugEl.query(By.css('.igx-calendar')).nativeElement;
            UIInteractions.simulateKeyDownEvent(calendarNativeElement, 'Home');
            fixture.detectChanges();

            UIInteractions.simulateKeyDownEvent(document.activeElement, 'ArrowRight');
                fixture.detectChanges();

            const date = calendar.dates.filter(
                d => getDate(d).getTime() === new Date(2017, 5, 30).getTime())[0];
            expect(date.nativeElement).toBe(document.activeElement);
        });
    }));

    it('Should not select disabled dates when having "range" selection', async(() => {
        const fixture = TestBed.createComponent(IgxCalendaRangeComponent);
        const calendar = fixture.componentInstance.calendar;
        const dateRangeDescriptors: DateRangeDescriptor[] = [];
        const rangeDates = [new Date(2017, 5, 10), new Date(2017, 5, 15)];
        dateRangeDescriptors.push({ type: DateRangeType.Between, dateRange: rangeDates });
        calendar.disabledDates = dateRangeDescriptors;
        calendar.selection = 'range';
        fixture.detectChanges();

        fixture.whenStable().then(() => {
            const fromDate = calendar.dates.filter(
                d => getDate(d).getTime() === new Date(2017, 5, 5).getTime())[0];
            fromDate.nativeElement.click();
            fixture.detectChanges();

            const toDate = calendar.dates.filter(
                d => getDate(d).getTime() === new Date(2017, 5, 20).getTime())[0];
            toDate.nativeElement.click();
            fixture.detectChanges();

            const selectedDates = calendar.dates.toArray().filter(d => {
                const dateTime = getDate(d).getTime();
                return (dateTime >= new Date(2017, 5, 5).getTime() &&
                        dateTime <= new Date(2017, 5, 9).getTime()) ||
                        (dateTime >= new Date(2017, 5, 16).getTime() &&
                        dateTime <= new Date(2017, 5, 20).getTime());
            });

            selectedDates.forEach(d => {
                expect(d.selected).toBe(true);
                expect(d.isSelectedCSS).toBe(true);
            });

            const notSelectedDates = calendar.dates.toArray().filter(d => {
                const dateTime = getDate(d).getTime();
                return dateTime >= new Date(2017, 5, 10).getTime() &&
                        dateTime <= new Date(2017, 5, 15).getTime();
            });

            notSelectedDates.forEach(d => {
                expect(d.selected).toBe(false);
                expect(d.isSelectedCSS).toBe(false);
            });
        });
    }));
});

@Component({
    template: `
        <igx-calendar [viewDate]="viewDate" [(ngModel)]="model"></igx-calendar>
    `
})
export class IgxCalendarSampleComponent {
    public model: Date | Date[] = new Date(2017, 5, 13);
    public viewDate = new Date(2017, 5, 13);
    @ViewChild(IgxCalendarComponent) public calendar: IgxCalendarComponent;
}

@Component({
    template: `
        <igx-calendar [viewDate]="viewDate" selection="range"></igx-calendar>
    `
})
export class IgxCalendaRangeComponent {
    public viewDate = new Date(2017, 5, 13);
    @ViewChild(IgxCalendarComponent) public calendar: IgxCalendarComponent;
}

class DateTester {
    // tests whether a date is disabled or not
    static testDatesAvailability(dates: IgxCalendarDateDirective[], disabled: boolean) {
        for (const date of dates) {
            expect(date.isDisabled).toBe(disabled,
                date.date.date.toLocaleDateString() + ' is not disabled');
            expect(date.isDisabledCSS).toBe(disabled,
                date.date.date.toLocaleDateString() + ' is not with disabled style');
        }
    }

    // tests whether a dates is special or not
    static testDatesSpeciality(dates: IgxCalendarDateDirective[], special: boolean): void {
        for (const date of dates) {
            expect(date.isSpecial).toBe(special);
            expect(date.isSpecialCSS).toBe(special);
        }
    }
}

type assignDateRangeDescriptors = (component: IgxCalendarComponent,
    dateRangeDescriptors: DateRangeDescriptor[]) => void;
type testDatesRange = (inRange: IgxCalendarDateDirective[],
    outOfRange: IgxCalendarDateDirective[]) => void;

class DateRangesPropertiesTester {
    static testAfter(assignFunc: assignDateRangeDescriptors,
        testRangesFunc: testDatesRange) {
        const fixture = TestBed.createComponent(IgxCalendarSampleComponent);
        const calendar = fixture.componentInstance.calendar;
        const dateRangeDescriptors: DateRangeDescriptor[] = [];
        const afterDate = new Date(2017, 5, 13);
        const afterDateRangeDescriptor: DateRangeDescriptor = {
            type: DateRangeType.After, dateRange:  [afterDate] };
        dateRangeDescriptors.push(afterDateRangeDescriptor);
        assignFunc(calendar, dateRangeDescriptors);
        fixture.detectChanges();

        const dates = calendar.dates.toArray();
        const inRangeDates = dates.filter(d => getDate(d).getTime() > afterDate.getTime());
        const outOfRangeDates = dates.filter(d => getDate(d).getTime() <= afterDate.getTime());
        testRangesFunc(inRangeDates, outOfRangeDates);
    }

    static testBefore(assignFunc: assignDateRangeDescriptors,
        testRangesFunc: testDatesRange) {
        const fixture = TestBed.createComponent(IgxCalendarSampleComponent);
        const calendar = fixture.componentInstance.calendar;
        const dateRangeDescriptors: DateRangeDescriptor[] = [];
        const beforeDate = new Date(2017, 5, 13);
        const beforeDateRangeDescriptor: DateRangeDescriptor = {
            type: DateRangeType.Before, dateRange: [beforeDate] };
        dateRangeDescriptors.push(beforeDateRangeDescriptor);
        assignFunc(calendar, dateRangeDescriptors);
        fixture.detectChanges();

        const dates = calendar.dates.toArray();
        const inRangeDates = dates.filter(d => getDate(d).getTime() < beforeDate.getTime());
        const outOfRangeDates = dates.filter(d => getDate(d).getTime() >= beforeDate.getTime());
        testRangesFunc(inRangeDates, outOfRangeDates);
    }

    static testBetweenWithMinDateFirst(assignFunc: assignDateRangeDescriptors,
        testRangesFunc: testDatesRange) {
        this.testBetween(assignFunc, testRangesFunc,
            new Date(2017, 5, 13), new Date(2017, 5, 20));
    }

    static testBetweenWithMaxDateFirst(assignFunc: assignDateRangeDescriptors,
        testRangesFunc: testDatesRange) {
        this.testBetween(assignFunc, testRangesFunc,
            new Date(2017, 5, 20), new Date(2017, 5, 13));
    }

    static testBetweenWithMinMaxTheSame(assignFunc: assignDateRangeDescriptors,
        testRangesFunc: testDatesRange) {
        this.testBetween(assignFunc, testRangesFunc,
            new Date(2017, 5, 20), new Date(2017, 5, 20));
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

        const dates = calendar.dates.toArray();
        const inRangeDates = dates.filter(d => getDate(d).getTime() >= betweenMin.getTime() &&
            getDate(d).getTime() <= betweenMax.getTime());
        const outOfRangeDates = dates.filter(d => getDate(d).getTime() < betweenMin.getTime() &&
            getDate(d).getTime() > betweenMax.getTime());
        testRangesFunc(inRangeDates, outOfRangeDates);
    }

    static testSpecific(assignFunc: assignDateRangeDescriptors,
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
        const dates = calendar.dates.toArray();
        const inRangeDates = dates.filter(d => specificDatesSet.has(getDate(d).getTime()));
        const outOfRangeDates = dates.filter(d => !specificDatesSet.has(getDate(d).getTime()));
        testRangesFunc(inRangeDates, outOfRangeDates);
    }

    static testWeekdays(assignFunc: assignDateRangeDescriptors,
        testRangesFunc: testDatesRange) {
        const fixture = TestBed.createComponent(IgxCalendarSampleComponent);
        const calendar = fixture.componentInstance.calendar;
        const dateRangeDescriptors: DateRangeDescriptor[] =
            [{ type: DateRangeType.Weekdays }];
        assignFunc(calendar, dateRangeDescriptors);
        fixture.detectChanges();

        const dates = calendar.dates.toArray();
        const inRangeDates = dates.filter(d => d.date.date.getDay() !== 0 &&
            d.date.date.getDay() !== 6);
        const outOfRangeDates = dates.filter(d => d.date.date.getDay() === 0 ||
           d.date.date.getDay() === 6);
        testRangesFunc(inRangeDates, outOfRangeDates);
    }

    static testWeekends(assignFunc: assignDateRangeDescriptors,
        testRangesFunc: testDatesRange) {
        const fixture = TestBed.createComponent(IgxCalendarSampleComponent);
        const calendar = fixture.componentInstance.calendar;
        const dateRangeDescriptors: DateRangeDescriptor[] =
            [{ type: DateRangeType.Weekends }];
        assignFunc(calendar, dateRangeDescriptors);
        fixture.detectChanges();

        const dates = calendar.dates.toArray();
        const inRangeDates = dates.filter(d => d.date.date.getDay() === 0 ||
            d.date.date.getDay() === 6);
        const outOfRangeDates = dates.filter(d => d.date.date.getDay() !== 0 &&
            d.date.date.getDay() !== 6);
        testRangesFunc(inRangeDates, outOfRangeDates);
    }

    static testOverlappingBetweens(assignFunc: assignDateRangeDescriptors,
        testRangesFunc: testDatesRange) {
        const fixture = TestBed.createComponent(IgxCalendarSampleComponent);
        const calendar = fixture.componentInstance.calendar;
        const dateRangeDescriptors: DateRangeDescriptor[] = [];
        const firstBetweenMin = new Date(2017, 5, 5);
        const firstBetweenMax = new Date(2017, 5, 10);
        const secondBetweenMin = new Date(2017, 5, 7);
        const secondBetweenMax = new Date(2017, 5, 15);
        dateRangeDescriptors.push(
            {type: DateRangeType.Between, dateRange: [firstBetweenMin, firstBetweenMax] });
        dateRangeDescriptors.push(
            { type: DateRangeType.Between, dateRange: [secondBetweenMin, secondBetweenMax] });
        assignFunc(calendar, dateRangeDescriptors);
        fixture.detectChanges();

        const dates = calendar.dates.toArray();
        const inRangeDates = dates.filter(d => getDate(d).getTime() >= firstBetweenMin.getTime() &&
            getDate(d).getTime() <= secondBetweenMax.getTime());
        const outOfRangeDates = dates.filter(d => getDate(d).getTime() < firstBetweenMin.getTime() &&
            getDate(d).getTime() > secondBetweenMax.getTime());
        testRangesFunc(inRangeDates, outOfRangeDates);
    }

    static testMultipleRanges(assignFunc: assignDateRangeDescriptors,
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

        const dates = calendar.dates.toArray();
        const enabledDateTime = new Date(2017, 5, 29).getTime();
        const inRangesDates = dates.filter(d => getDate(d).getTime() !== enabledDateTime);
        const outOfRangeDates = dates.filter(d => getDate(d).getTime() === enabledDateTime);
        testRangesFunc(inRangesDates, outOfRangeDates);
    }

    static testRangeUpdateRuntime(assignFunc: assignDateRangeDescriptors,
        testRangesFunc: testDatesRange) {
        const fixture = TestBed.createComponent(IgxCalendarSampleComponent);
        const calendar = fixture.componentInstance.calendar;
        const dateRangeDescriptors: DateRangeDescriptor[] = [];
        const specificDate = new Date(2017, 5, 15);
        dateRangeDescriptors.push({ type: DateRangeType.Specific, dateRange: [specificDate] });
        assignFunc(calendar, dateRangeDescriptors);
        fixture.detectChanges();

        const dates = calendar.dates.toArray();
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

    static testPreviousMonthRangeAsync(assignFunc: assignDateRangeDescriptors,
        testRangesFunc: testDatesRange) {
        const fixture = TestBed.createComponent(IgxCalendarSampleComponent);
        const calendar = fixture.componentInstance.calendar;
        const dateRangeDescriptors: DateRangeDescriptor[] = [];
        const beforeDate = new Date(2017, 5, 13);
        dateRangeDescriptors.push({ type: DateRangeType.Before, dateRange: [beforeDate] });
        assignFunc(calendar, dateRangeDescriptors);
        fixture.detectChanges();

        fixture.whenStable().then(() => {
            const debugEl = fixture.debugElement;
            const calendarNativeElement = debugEl.query(By.css('.igx-calendar')).nativeElement;
            UIInteractions.simulateKeyDownEvent(calendarNativeElement, 'PageUp');
            fixture.detectChanges();
            testRangesFunc(calendar.dates.toArray(), []);
        });
    }

    static assignDisableDatesDescriptors(component: IgxCalendarComponent,
        dateRangeDescriptors: DateRangeDescriptor[]) {
        component.disabledDates = dateRangeDescriptors;
    }

    static testDisabledDates(inRange: IgxCalendarDateDirective[],
        outOfRange: IgxCalendarDateDirective[]) {
        DateTester.testDatesAvailability(inRange, true);
        DateTester.testDatesAvailability(outOfRange, false);
    }

    static assignSpecialDatesDescriptors(component: IgxCalendarComponent,
        dateRangeDescriptors: DateRangeDescriptor[]) {
        component.specialDates = dateRangeDescriptors;
    }

    static testSpecialDates(inRange: IgxCalendarDateDirective[],
        outOfRange: IgxCalendarDateDirective[]) {
        DateTester.testDatesSpeciality(inRange, true);
        DateTester.testDatesSpeciality(outOfRange, false);
    }
}

function getDate(dateDirective: IgxCalendarDateDirective) {
    const fullDate = dateDirective.date.date;
    const date = new Date(fullDate.getFullYear(), fullDate.getMonth(), fullDate.getDate());
    return date;
}
