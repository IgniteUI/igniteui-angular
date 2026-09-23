import { Component, DebugElement, LOCALE_ID, ViewChild, ChangeDetectionStrategy } from "@angular/core";
import {
    TestBed,
    tick,
    fakeAsync,
    flush,
    waitForAsync,
    ComponentFixture,
} from "@angular/core/testing";
import { FormsModule } from "@angular/forms";
import { By } from "@angular/platform-browser";
import { NoopAnimationsModule } from "@angular/platform-browser/animations";

import { registerLocaleData } from "@angular/common";
import localeFr from "@angular/common/locales/fr";

import {
    Calendar,
    IgxCalendarComponent,
    IgxCalendarHeaderTemplateDirective,
    IgxCalendarHeaderTitleTemplateDirective,
    IgxCalendarSubheaderTemplateDirective,
    IgxCalendarView,
    isLeap,
    IViewDateChangeEventArgs,
    monthRange,
    range,
    weekDay,
} from "./public_api";
import { getCurrentI18n, setCurrentI18n } from "igniteui-i18n-core";
import { UIInteractions } from "../../../test-utils/ui-interactions.spec";
import {
    DateRangeDescriptor,
    DateRangeType,
} from "../../../core/src/core/dates/dateRange";

import { IgxDayItemComponent } from "./days-view/day-item.component";
import { HelperTestFunctions } from "../../../test-utils/calendar-helper-utils";
import { WEEKDAYS } from "../../../core/src/core/enums";

describe("IgxCalendar - ", () => {
    registerLocaleData(localeFr);

    it("Should receive correct values from utility functions", () => {
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
        let newDate = calendar.timedelta(startDate, "year", 1);
        expect(newDate.getFullYear()).toEqual(2018);
        newDate = calendar.timedelta(startDate, "year", -1);
        expect(newDate.getFullYear()).toEqual(2016);

        // Quarter timedelta
        newDate = calendar.timedelta(startDate, "quarter", 1);
        expect(newDate.getMonth()).toEqual(3);
        newDate = calendar.timedelta(startDate, "quarter", -1);
        expect(newDate.getFullYear()).toEqual(2016);
        expect(newDate.getMonth()).toEqual(9);

        // Month timedelta
        newDate = calendar.timedelta(startDate, "month", 1);
        expect(newDate.getMonth()).toEqual(1);
        newDate = calendar.timedelta(startDate, "month", -1);
        expect(newDate.getFullYear()).toEqual(2016);
        expect(newDate.getMonth()).toEqual(11);

        // Week timedelta
        newDate = calendar.timedelta(startDate, "week", 1);
        expect(newDate.getDate()).toEqual(8);
        newDate = calendar.timedelta(startDate, "week", -1);
        expect(newDate.getFullYear()).toEqual(2016);
        expect(newDate.getDate()).toEqual(25);

        // Day timedelta
        newDate = calendar.timedelta(startDate, "day", 3);
        expect(newDate.getDate()).toEqual(4);
        expect(calendar.timedelta(startDate, "day", 7).toDateString()).toEqual(
            calendar.timedelta(startDate, "week", 1).toDateString(),
        );
        newDate = calendar.timedelta(startDate, "day", -3);
        expect(newDate.getFullYear()).toEqual(2016);
        expect(newDate.getDate()).toEqual(29);

        // Hour timedelta
        newDate = calendar.timedelta(startDate, "hour", 1);
        expect(newDate.getHours()).toEqual(1);
        newDate = calendar.timedelta(startDate, "hour", 24);
        expect(newDate.getDate()).toEqual(2);
        expect(newDate.getHours()).toEqual(0);
        newDate = calendar.timedelta(startDate, "hour", -1);
        expect(newDate.getHours()).toEqual(23);
        expect(newDate.getDate()).toEqual(31);
        expect(newDate.getFullYear()).toEqual(2016);

        // Minute timedelta
        newDate = calendar.timedelta(startDate, "minute", 60);
        expect(newDate.getHours()).toEqual(1);
        newDate = calendar.timedelta(startDate, "minute", 24 * 60);
        expect(newDate.getDate()).toEqual(2);
        expect(newDate.getHours()).toEqual(0);
        newDate = calendar.timedelta(startDate, "minute", -60);
        expect(newDate.getHours()).toEqual(23);
        expect(newDate.getDate()).toEqual(31);
        expect(newDate.getFullYear()).toEqual(2016);

        // Seconds timedelta
        newDate = calendar.timedelta(startDate, "second", 3600);
        expect(newDate.getHours()).toEqual(1);
        newDate = calendar.timedelta(startDate, "second", 24 * 3600);
        expect(newDate.getDate()).toEqual(2);
        expect(newDate.getHours()).toEqual(0);
        newDate = calendar.timedelta(startDate, "second", -3600);
        expect(newDate.getHours()).toEqual(23);
        expect(newDate.getDate()).toEqual(31);
        expect(newDate.getFullYear()).toEqual(2016);

        // Throws on invalid interval
        expect(() => calendar.timedelta(startDate, "nope", 1)).toThrow();
    });

    it("Should roll over to the last day of the month when the target month is shorter", () => {
        const calendar = new Calendar();

        expect(calendar.timedelta(new Date(2017, 0, 31), "month", 1)).toEqual(new Date(2017, 1, 28));
        expect(calendar.timedelta(new Date(2016, 0, 31), "month", 1)).toEqual(new Date(2016, 1, 29));
        expect(calendar.timedelta(new Date(2016, 1, 29), "year", 1)).toEqual(new Date(2017, 1, 28));
        expect(calendar.timedelta(new Date(2017, 4, 31), "quarter", 1)).toEqual(new Date(2017, 7, 31));
        expect(calendar.timedelta(new Date(2017, 2, 31), "month", -1)).toEqual(new Date(2017, 1, 28));
    });

    it("Should generate number ranges with the range utility function", () => {
        expect(range(5, undefined)).toEqual([0, 1, 2, 3, 4]);
        expect(range(2, 6)).toEqual([2, 3, 4, 5]);
        expect(range(0, 10, 3)).toEqual([0, 3, 6, 9]);
        expect(range(5, 0, -2)).toEqual([5, 3, 1]);
        expect(range(3, 3)).toEqual([]);
    });

    describe("Basic -", () => {

        beforeEach(waitForAsync(() => {
            TestBed.configureTestingModule({
                imports: [
                    NoopAnimationsModule,
                    IgxCalendarSampleComponent,
                    IgxCalendarRangeComponent,
                    IgxCalendarDisabledSpecialDatesComponent,
                    IgxCalendarValueComponent,
                    IgxCalendarTemplatesComponent,
                    IgxCalendarRangeValueComponent,
                ],
            }).compileComponents();
        }));

        describe("Calendar - ", () => {
            let fixture: ComponentFixture<any>;
            let calendar: IgxCalendarComponent;
            let dom: DebugElement;

            beforeEach(waitForAsync(() => {
                fixture = TestBed.createComponent(IgxCalendarSampleComponent);

                fixture.detectChanges();
                calendar = fixture.componentInstance.calendar;
                dom = fixture.debugElement;
            }));
            afterEach(() => {
                fixture = undefined;
                calendar = undefined;
                dom = undefined;
            });

            it("Should initialize a calendar component", () => {
                expect(fixture.componentInstance).toBeDefined();
            });

            it("Should initialize a calendar component with `id` property", () => {
                const domCalendar = dom.query(
                    By.css(HelperTestFunctions.CALENDAR),
                ).nativeElement;

                expect(calendar.id).toContain("igx-calendar-");
                expect(domCalendar.id).toContain("igx-calendar-");

                calendar.id = "customCalendar";
                fixture.detectChanges();

                expect(calendar.id).toBe("customCalendar");
                expect(domCalendar.id).toBe("customCalendar");
            });

            it("Should properly set @Input properties and setters", () => {
                const today = new Date(Date.now());

                expect(calendar.weekStart).toEqual(WEEKDAYS.SUNDAY);
                expect(calendar.selection).toEqual("single");

                calendar.viewDate = today;
                fixture.detectChanges();

                calendar.weekStart = WEEKDAYS.MONDAY;
                expect(calendar.weekStart).toEqual(1);

                calendar.value = new Date(today);
                fixture.detectChanges();

                expect(
                    (fixture.componentInstance.model as Date).toDateString(),
                ).toMatch(today.toDateString());
                expect((calendar.value as Date).toDateString()).toMatch(
                    today.toDateString(),
                );

                expect(() => (calendar.selection = "non-existant")).toThrow();

                const todayIsoDate = new Date(Date.now()).toISOString();

                calendar.viewDate = todayIsoDate;
                fixture.detectChanges();

                calendar.value = new Date(todayIsoDate);
                fixture.detectChanges();

                expect(
                    (fixture.componentInstance.model as Date).toDateString(),
                ).toMatch(new Date(todayIsoDate).toDateString());
                expect((calendar.value as Date).toDateString()).toMatch(
                    new Date(todayIsoDate).toDateString(),
                );
            });

            describe("Rendered Component - ", () => {
                it("Should properly set formatOptions and formatViews", () => {
                    fixture.componentInstance.viewDate = new Date(2018, 8, 17);
                    fixture.componentInstance.model = new Date();
                    fixture.detectChanges();

                    const defaultOptions = {
                        day: "numeric",
                        month: "long",
                        weekday: "narrow",
                        year: "numeric",
                    };
                    const defaultViews = {
                        day: false,
                        month: true,
                        year: false,
                    };
                    const bodyMonth = dom.query(
                        By.css(HelperTestFunctions.CALENDAR_DATE_CSSCLASS),
                    );
                    const headerTitle = dom.query(
                        By.css(
                            HelperTestFunctions.CALENDAR_HEADER_YEAR_CSSCLASS,
                        ),
                    );
                    const bodyYear = dom.queryAll(
                        By.css(HelperTestFunctions.CALENDAR_DATE_CSSCLASS),
                    )[1];
                    const headerWeekday = dom.queryAll(
                        By.css(
                            `${HelperTestFunctions.CALENDAR_HEADER_DATE_CSSCLASS} span`,
                        ),
                    )[0];
                    const headerDate = dom.queryAll(
                        By.css(
                            `${HelperTestFunctions.CALENDAR_HEADER_DATE_CSSCLASS} span`,
                        ),
                    )[1];

                    calendar.selectDate(calendar.viewDate);
                    fixture.detectChanges();

                    expect(calendar.formatOptions).toEqual(
                        jasmine.objectContaining(defaultOptions),
                    );
                    expect(calendar.formatViews).toEqual(
                        jasmine.objectContaining(defaultViews),
                    );
                    expect(
                        headerTitle.nativeElement.textContent.trim(),
                    ).toMatch("Select Date");
                    expect(
                        headerWeekday.nativeElement.textContent.trim(),
                    ).toMatch("S");
                    expect(headerDate.nativeElement.textContent.trim()).toMatch(
                        "Sep 1",
                    );
                    expect(bodyYear.nativeElement.textContent.trim()).toMatch(
                        "2018",
                    );
                    expect(bodyMonth.nativeElement.textContent.trim()).toMatch(
                        "Sep",
                    );

                    // change formatOptions and formatViews
                    const formatOptions: any = {
                        month: "long",
                        year: "2-digit",
                    };
                    const formatViews: any = { month: true, year: true };
                    calendar.formatOptions = formatOptions;
                    calendar.formatViews = formatViews;
                    fixture.detectChanges();

                    expect(calendar.formatOptions).toEqual(
                        jasmine.objectContaining(
                            Object.assign(defaultOptions, formatOptions),
                        ),
                    );
                    expect(calendar.formatViews).toEqual(
                        jasmine.objectContaining(
                            Object.assign(defaultViews, formatViews),
                        ),
                    );
                    expect(
                        headerTitle.nativeElement.textContent.trim(),
                    ).toMatch("Select Date");
                    expect(
                        headerWeekday.nativeElement.textContent.trim(),
                    ).toMatch("S");
                    expect(headerDate.nativeElement.textContent.trim()).toMatch(
                        "Sep 1",
                    );
                    expect(bodyYear.nativeElement.textContent.trim()).toMatch(
                        "18",
                    );
                    expect(bodyMonth.nativeElement.textContent.trim()).toMatch(
                        "September",
                    );

                    // change formatOptions and formatViews
                    formatOptions.year = "numeric";
                    formatViews.day = true;
                    formatViews.month = false;
                    calendar.formatOptions = formatOptions;
                    calendar.formatViews = formatViews;
                    fixture.detectChanges();

                    expect(calendar.formatOptions).toEqual(
                        jasmine.objectContaining(
                            Object.assign(defaultOptions, formatOptions),
                        ),
                    );
                    expect(calendar.formatViews).toEqual(
                        jasmine.objectContaining(
                            Object.assign(defaultViews, formatViews),
                        ),
                    );
                    expect(
                        headerTitle.nativeElement.textContent.trim(),
                    ).toMatch("Select Date");
                    expect(
                        headerWeekday.nativeElement.textContent.trim(),
                    ).toMatch("S");
                    expect(headerDate.nativeElement.textContent.trim()).toMatch(
                        "Sep 1",
                    );
                    expect(bodyYear.nativeElement.textContent.trim()).toMatch(
                        "2018",
                    );
                    expect(bodyMonth.nativeElement.textContent.trim()).toMatch(
                        "8",
                    );
                });

                it("Should show right month when value is set", () => {
                    fixture = TestBed.createComponent(
                        IgxCalendarValueComponent,
                    );
                    fixture.detectChanges();
                    calendar = fixture.componentInstance.calendar;

                    expect(calendar.weekStart).toEqual(WEEKDAYS.SUNDAY);
                    expect(calendar.selection).toEqual("single");
                    expect(calendar.viewDate.getMonth()).toEqual(
                        (calendar.value as Date).getMonth(),
                    );

                    const date = new Date(2020, 8, 28);
                    calendar.viewDate = date;
                    fixture.detectChanges();

                    expect(calendar.viewDate.getMonth()).toEqual(
                        date.getMonth(),
                    );

                    calendar.value = new Date(2020, 9, 15);
                    fixture.detectChanges();

                    expect(calendar.viewDate.getMonth()).toEqual(
                        date.getMonth(),
                    );

                    const isoStringDate = new Date(2020, 10, 10).toISOString();
                    calendar.viewDate = isoStringDate;
                    fixture.detectChanges();
                    expect(calendar.viewDate.getMonth()).toEqual(
                        new Date(isoStringDate).getMonth(),
                    );

                    calendar.value = new Date(2020, 11, 15).toISOString();
                    fixture.detectChanges();

                    expect(calendar.viewDate.getMonth()).toEqual(
                        new Date(isoStringDate).getMonth(),
                    );
                });

                it("Should properly set locale", () => {
                    fixture.componentInstance.viewDate = new Date(2018, 8, 17);
                    fixture.componentInstance.model = new Date();
                    fixture.detectChanges();

                    const bodyMonth = dom.query(
                        By.css(HelperTestFunctions.CALENDAR_DATE_CSSCLASS),
                    );
                    const headerTitle = dom.query(
                        By.css(
                            HelperTestFunctions.CALENDAR_HEADER_YEAR_CSSCLASS,
                        ),
                    );
                    const bodyYear = dom.queryAll(
                        By.css(HelperTestFunctions.CALENDAR_DATE_CSSCLASS),
                    )[1];
                    const headerWeekday = dom.queryAll(
                        By.css(
                            `${HelperTestFunctions.CALENDAR_HEADER_DATE_CSSCLASS} span`,
                        ),
                    )[0];
                    const headerDate = dom.queryAll(
                        By.css(
                            `${HelperTestFunctions.CALENDAR_HEADER_DATE_CSSCLASS} span`,
                        ),
                    )[1];
                    let bodyWeekday = dom.query(
                        By.css(HelperTestFunctions.WEEKSTART_LABEL_CSSCLASS),
                    );

                    calendar.selectDate(calendar.viewDate);
                    fixture.detectChanges();

                    expect(
                        headerTitle.nativeElement.textContent.trim(),
                    ).toMatch("Select Date");
                    expect(
                        headerWeekday.nativeElement.textContent.trim(),
                    ).toMatch("S");
                    expect(headerDate.nativeElement.textContent.trim()).toMatch(
                        "Sep 1",
                    );
                    expect(bodyYear.nativeElement.textContent.trim()).toMatch(
                        "2018",
                    );
                    expect(bodyMonth.nativeElement.textContent.trim()).toMatch(
                        "September",
                    );
                    expect(
                        bodyWeekday.nativeElement.textContent.trim(),
                    ).toMatch("S");

                    // change formatOptions and formatViews
                    const locale = "fr";
                    calendar.locale = locale;
                    fixture.detectChanges();

                    bodyWeekday = dom.query(
                        By.css(HelperTestFunctions.WEEKSTART_LABEL_CSSCLASS),
                    );
                    expect(calendar.locale).toEqual(locale);
                    expect(
                        headerTitle.nativeElement.textContent.trim(),
                    ).toMatch("Select Date");
                    expect(
                        headerWeekday.nativeElement.textContent.trim(),
                    ).toMatch("sam.,");
                    expect(headerDate.nativeElement.textContent.trim()).toMatch(
                        "1 sept.",
                    );
                    expect(bodyYear.nativeElement.textContent.trim()).toMatch(
                        "18",
                    );
                    expect(bodyMonth.nativeElement.textContent.trim()).toMatch(
                        "sept.",
                    );
                    expect(
                        bodyWeekday.nativeElement.textContent.trim(),
                    ).toMatch("L");
                });

                it("Should default to today date when invalid date is passed", () => {
                    fixture = TestBed.createComponent(
                        IgxCalendarValueComponent,
                    );
                    fixture.detectChanges();
                    calendar = fixture.componentInstance.calendar;

                    const today = new Date().setHours(0, 0, 0, 0);
                    calendar.value = new Date(NaN);
                    fixture.detectChanges();

                    expect(calendar.value.getTime()).toEqual(today);

                    calendar.value = undefined;
                    fixture.detectChanges();

                    expect((calendar.value as Date).getTime()).toEqual(today);

                    calendar.value = new Date("1989-5s-dd");
                    fixture.detectChanges();

                    expect(calendar.value.getTime()).toEqual(today);
                });

                it("Should properly render calendar DOM structure", () => {
                    const today = new Date(Date.now());
                    calendar.viewDate = today;
                    fixture.detectChanges();
                    const calendarRows = dom.queryAll(
                        By.css(HelperTestFunctions.CALENDAR_ROW_CSSCLASS),
                    );

                    // 6 weeks + week header
                    expect(calendarRows.length).toEqual(7);

                    // 6 calendar rows * 7 elements in each
                    expect(
                        dom.queryAll(
                            By.css(
                                `${HelperTestFunctions.CALENDAR_ROW_CSSCLASS} > igx-day-item`,
                            ),
                        ).length,
                    ).toEqual(42);
                    expect(
                        dom.queryAll(
                            By.css(
                                `${HelperTestFunctions.CALENDAR_ROW_CSSCLASS} > span`,
                            ),
                        ).length,
                    ).toEqual(7);

                    // Today class applied
                    expect(
                        dom
                            .query(
                                By.css(
                                    HelperTestFunctions.CURRENT_DATE_CSSCLASS,
                                ),
                            )
                            .nativeElement.textContent.trim(),
                    ).toMatch(today.getDate().toString());

                    // Hide calendar header when not single selection
                    calendar.selection = "multi";
                    fixture.detectChanges();

                    const calendarHeader = dom.query(
                        By.css(HelperTestFunctions.CALENDAR_HEADER_CSSCLASS),
                    );
                    expect(calendarHeader).toBeFalsy();
                });

                it("Should properly render calendar DOM with week numbers enabled", () => {
                    const today = new Date(Date.now());
                    calendar.viewDate = today;
                    calendar.showWeekNumbers = true;
                    fixture.detectChanges();

                    const calendarRows = dom.queryAll(
                        By.css(HelperTestFunctions.CALENDAR_ROW_CSSCLASS),
                    );
                    expect(calendarRows.length).toEqual(7);

                    // 6 calendar rows * 8 elements in each
                    expect(
                        dom.queryAll(
                            By.css(
                                `${HelperTestFunctions.CALENDAR_ROW_CSSCLASS} > igx-day-item`,
                            ),
                        ).length +
                        dom.queryAll(
                            By.css(`${HelperTestFunctions.CALENDAR_ROW_CSSCLASS} >
                            ${HelperTestFunctions.CALENDAR_WEEK_NUMBER_CLASS}`),
                        ).length,
                    ).toEqual(48);

                    expect(
                        dom.queryAll(
                            By.css(
                                `${HelperTestFunctions.CALENDAR_ROW_CSSCLASS} > span`,
                            ),
                        ).length +
                        dom.queryAll(
                            By.css(
                                `${HelperTestFunctions.CALENDAR_ROW_CSSCLASS} > ${HelperTestFunctions.CALENDAR_WEEK_NUMBER_LABEL_CLASS}`,
                            ),
                        ).length,
                    ).toEqual(8);
                });

                it("Week numbers should appear as first column", () => {
                    const firstWeekOfTheYear = new Date(2017, 0, 5);
                    calendar.viewDate = firstWeekOfTheYear;
                    calendar.showWeekNumbers = true;
                    fixture.detectChanges();

                    const calendarRows = dom.queryAll(
                        By.css(`${HelperTestFunctions.CALENDAR_ROW_CSSCLASS}`),
                    );

                    const expectedWeeks = ["W", "1", "2", "3", "4", "5", "6"];

                    calendarRows.forEach((row, idx) => {
                        const firstRowItem = row.nativeElement.children[0];
                        expect(firstRowItem.firstChild.innerText).toEqual(
                            expectedWeeks[idx],
                        );
                    });
                });

                it("should display the correct week numbers in the first column", () => {
                    const firstDayOfMar = new Date(2023, 2, 1);
                    calendar.viewDate = firstDayOfMar;
                    calendar.weekStart = 0;
                    calendar.showWeekNumbers = true;
                    fixture.detectChanges();

                    const calendarRowsMar = dom.queryAll(
                        By.css(`${HelperTestFunctions.CALENDAR_ROW_CSSCLASS}`),
                    );

                    calendarRowsMar.forEach((row, idx) => {
                        const firstRowItem = row.nativeElement.children[0];
                        if (idx === 5) {
                            expect(firstRowItem.firstChild.innerText).toEqual(
                                "13",
                            );
                        }
                    });

                    const firstDayOfOct = new Date(2023, 9, 1);
                    calendar.viewDate = firstDayOfOct;
                    fixture.detectChanges();

                    const calendarRowsOct = dom.queryAll(
                        By.css(`${HelperTestFunctions.CALENDAR_ROW_CSSCLASS}`),
                    );

                    calendarRowsOct.forEach((row, idx) => {
                        const firstRowItem = row.nativeElement.children[0];
                        if (idx === 5) {
                            expect(firstRowItem.firstChild.innerText).toEqual(
                                "44",
                            );
                        }
                    });

                    const firstDayOfDec = new Date(2023, 11, 1);
                    calendar.viewDate = firstDayOfDec;
                    fixture.detectChanges();

                    const calendarRowsDec = dom.queryAll(
                        By.css(`${HelperTestFunctions.CALENDAR_ROW_CSSCLASS}`),
                    );

                    calendarRowsDec.forEach((row, idx) => {
                        const firstRowItem = row.nativeElement.children[0];
                        if (idx === 6) {
                            // With simple counting for Sunday start, expect 53
                            expect(firstRowItem.firstChild.innerText).toEqual(
                                "53",
                            );
                        }
                    });
                });

                it("Calendar DOM structure - year view | month view", () => {
                    calendar.activeView = "year";
                    fixture.detectChanges();

                    expect(
                        dom.query(
                            By.css(
                                HelperTestFunctions.CALENDAR_ROW_WRAP_CSSCLASS,
                            ),
                        ),
                    ).toBeDefined();
                    const months = dom.queryAll(
                        By.css(HelperTestFunctions.MONTH_CSSCLASS),
                    );
                    const currentMonth = dom.query(
                        By.css(HelperTestFunctions.CURRENT_MONTH_CSSCLASS),
                    );

                    expect(months.length).toEqual(12);
                    expect(
                        currentMonth.nativeElement.textContent.trim(),
                    ).toMatch("June");

                    months[0].nativeElement.dispatchEvent(
                        new Event("mousedown"),
                    );

                    fixture.detectChanges();
                    expect(calendar.viewDate.getMonth()).toEqual(0);

                    calendar.activeView = "decade";
                    fixture.detectChanges();

                    const years = dom.queryAll(
                        By.css(HelperTestFunctions.YEAR_CSSCLASS),
                    );
                    const currentYear = dom.query(
                        By.css(HelperTestFunctions.CURRENT_YEAR_CSSCLASS),
                    );

                    expect(years.length).toEqual(15);
                    expect(
                        currentYear.nativeElement.textContent.trim(),
                    ).toMatch("2017");

                    years[0].nativeElement.dispatchEvent(
                        new Event("mousedown"),
                    );
                    fixture.detectChanges();

                    expect(calendar.viewDate.getFullYear()).toEqual(2010);
                });

                it("Calendar selection - single with event", () => {
                    fixture.detectChanges();

                    const target = dom.query(
                        By.css(HelperTestFunctions.SELECTED_DATE_CSSCLASS),
                    );
                    const weekDiv = target.parent;
                    const weekDays = weekDiv.queryAll(
                        By.css(HelperTestFunctions.DAY_CSSCLASS),
                    );
                    const nextDay = new Date(2017, 5, 14);

                    expect((calendar.value as Date).toDateString()).toMatch(
                        new Date(2017, 5, 13).toDateString(),
                    );

                    spyOn(calendar.selected, "emit");

                    // Select 14th
                    const dateElement = weekDays[3].nativeElement.firstChild;

                    dateElement.click();
                    fixture.detectChanges();

                    expect(calendar.selected.emit).toHaveBeenCalled();
                    expect((calendar.value as Date).toDateString()).toMatch(
                        nextDay.toDateString(),
                    );

                    HelperTestFunctions.verifyDateSelected(weekDays[3]);
                    expect(
                        (
                            fixture.componentInstance.model as Date
                        ).toDateString(),
                    ).toMatch(nextDay.toDateString());
                    HelperTestFunctions.verifyDateNotSelected(target);
                });

                it("Calendar selection - outside of current month - next month", () => {
                    const parent = dom.query(
                        By.css(
                            `${HelperTestFunctions.CALENDAR_ROW_CSSCLASS}:last-child`,
                        ),
                    );
                    const parentDates = parent.queryAll(
                        By.css(HelperTestFunctions.INACTIVE_DAYS_CSSCLASS),
                    );
                    const target = parentDates[parentDates.length - 1];

                    target.nativeElement.firstChild.click();
                    fixture.detectChanges();

                    expect(
                        (
                            fixture.componentInstance.model as Date
                        ).toDateString(),
                    ).toMatch(new Date(2017, 6, 8).toDateString());

                    expect(
                        dom
                            .query(
                                By.css(
                                    HelperTestFunctions.CALENDAR_HEADER_DATE_CSSCLASS,
                                ),
                            )
                            .nativeElement.textContent.includes("Jul"),
                    ).toBe(true);
                });

                it("Calendar selection - outside of current month - previous month", () => {
                    const parent = dom.queryAll(
                        By.css(HelperTestFunctions.CALENDAR_ROW_CSSCLASS),
                    )[1];
                    const target = parent.queryAll(
                        By.css(HelperTestFunctions.INACTIVE_DAYS_CSSCLASS),
                    )[0];

                    target.nativeElement.firstChild.click();
                    fixture.detectChanges();

                    expect(
                        (
                            fixture.componentInstance.model as Date
                        ).toDateString(),
                    ).toMatch(new Date(2017, 4, 28).toDateString());
                    expect(
                        dom
                            .query(
                                By.css(
                                    HelperTestFunctions.CALENDAR_HEADER_DATE_CSSCLASS,
                                ),
                            )
                            .nativeElement.textContent.includes("May"),
                    ).toBe(true);
                });

                it("Calendar selection - single through API", () => {
                    fixture.detectChanges();

                    const target = dom.query(
                        By.css(HelperTestFunctions.SELECTED_DATE_CSSCLASS),
                    );
                    const weekDiv = target.parent;
                    const weekDays = weekDiv.queryAll(
                        By.css(HelperTestFunctions.DAY_CSSCLASS),
                    );
                    let nextDay = new Date(2017, 5, 14);

                    expect((calendar.value as Date).toDateString()).toMatch(
                        new Date(2017, 5, 13).toDateString(),
                    );

                    calendar.selectDate(new Date(2017, 5, 14));
                    fixture.detectChanges();

                    expect((calendar.value as Date).toDateString()).toMatch(
                        nextDay.toDateString(),
                    );
                    HelperTestFunctions.verifyDateSelected(weekDays[3]);
                    expect(
                        (fixture.componentInstance.model as Date).toDateString(),
                    ).toMatch(nextDay.toDateString());
                    HelperTestFunctions.verifyDateNotSelected(target);

                    nextDay = new Date(2017, 6, 15);
                    calendar.selectDate(new Date(2017, 6, 15).toISOString());
                    fixture.detectChanges();

                    expect((calendar.value as Date).toDateString()).toMatch(
                        nextDay.toDateString(),
                    );
                });

                it("Calendar selection - multiple with event", () => {
                    fixture.detectChanges();

                    const target = dom.query(
                        By.css(HelperTestFunctions.SELECTED_DATE_CSSCLASS),
                    );
                    const weekDiv = target.parent;
                    const weekDays = weekDiv.queryAll(
                        By.css(HelperTestFunctions.DAY_CSSCLASS),
                    );

                    calendar.selection = "multi";
                    fixture.detectChanges();

                    expect(calendar.value instanceof Array).toBeTruthy();
                    expect(
                        fixture.componentInstance.model instanceof Array,
                    ).toBeTruthy();
                    expect((calendar.value as Date[]).length).toEqual(0);
                    expect(
                        (fixture.componentInstance.model as Date[]).length,
                    ).toEqual(0);

                    for (const day of weekDays) {
                        day.nativeElement.firstChild.click();
                        fixture.detectChanges();
                    }

                    expect((calendar.value as Date[]).length).toEqual(7);
                    expect(
                        (fixture.componentInstance.model as Date[]).length,
                    ).toEqual(7);
                    weekDays.forEach((el) => {
                        HelperTestFunctions.verifyDateSelected(el);
                    });

                    // Deselect last day
                    weekDays.at(-1).nativeElement.firstChild.click();
                    fixture.detectChanges();

                    expect((calendar.value as Date[]).length).toEqual(6);

                    expect(
                        (fixture.componentInstance.model as Date[]).length,
                    ).toEqual(6);
                    HelperTestFunctions.verifyDateNotSelected(
                        weekDays.at(-1)
                    );
                });

                it("Calendar selection - multiple through API", () => {
                    fixture.detectChanges();

                    const target = dom.query(
                        By.css(HelperTestFunctions.SELECTED_DATE_CSSCLASS),
                    );
                    const weekDiv = target.parent;
                    const weekDays = weekDiv.queryAll(
                        By.css(HelperTestFunctions.DAY_CSSCLASS),
                    );

                    calendar.selection = "multi";
                    fixture.detectChanges();

                    const lastDay = new Date(2017, 5, 17);

                    // Single date
                    calendar.selectDate(lastDay);
                    fixture.detectChanges();

                    expect(
                        (
                            fixture.componentInstance.model as Date[]
                        )[0].toDateString(),
                    ).toMatch(lastDay.toDateString());
                    expect(calendar.value[0].toDateString()).toMatch(
                        lastDay.toDateString(),
                    );
                    HelperTestFunctions.verifyDateSelected(
                        weekDays[weekDays.length - 1],
                    );

                    // Multiple dates
                    calendar.selectDate([
                        new Date(2017, 5, 11),
                        new Date(2017, 5, 12),
                    ]);
                    fixture.detectChanges();

                    expect(
                        (fixture.componentInstance.model as Date[]).length,
                    ).toEqual(3);
                    expect((calendar.value as Date[]).length).toEqual(3);

                    // 11th June
                    HelperTestFunctions.verifyDateSelected(weekDays[0]);
                    // 12th June
                    HelperTestFunctions.verifyDateSelected(weekDays[1]);
                });

                it("Calendar selection - range with event", () => {
                    fixture.detectChanges();

                    const target = dom.query(
                        By.css(HelperTestFunctions.SELECTED_DATE_CSSCLASS),
                    );
                    const weekDiv = target.parent;
                    const weekDays = weekDiv.queryAll(
                        By.css(HelperTestFunctions.DAY_CSSCLASS),
                    );

                    calendar.selection = "range";
                    fixture.detectChanges();

                    const lastDay = new Date(2017, 5, 17);
                    const firstDay = new Date(2017, 5, 11);

                    // Start range selection...
                    weekDays[0].nativeElement.firstChild.click();
                    fixture.detectChanges();

                    expect(
                        (fixture.componentInstance.model as Date[]).length,
                    ).toEqual(1);
                    expect((calendar.value as Date[]).length).toEqual(1);
                    expect(
                        (
                            fixture.componentInstance.model as Date[]
                        )[0].toDateString(),
                    ).toMatch(firstDay.toDateString());
                    HelperTestFunctions.verifyDateSelected(weekDays[0]);

                    // ...and cancel it
                    weekDays[0].nativeElement.firstChild.click();
                    fixture.detectChanges();

                    expect(
                        (fixture.componentInstance.model as Date[]).length,
                    ).toEqual(0);
                    expect((calendar.value as Date[]).length).toEqual(0);
                    HelperTestFunctions.verifyDateNotSelected(weekDays[0]);

                    // Start range selection...
                    weekDays.at(0).nativeElement.firstChild.click();
                    fixture.detectChanges();

                    // ...and complete it
                    weekDays.at(-1).nativeElement.firstChild.click();
                    fixture.detectChanges();


                    expect(
                        (fixture.componentInstance.model as Date[]).length,
                    ).toEqual(7);
                    expect((calendar.value as Date[]).length).toEqual(7);
                    expect(calendar.value[0].toDateString()).toMatch(
                        firstDay.toDateString(),
                    );
                    expect(
                        calendar.value[
                            (calendar.value as Date[]).length - 1
                        ].toDateString(),
                    ).toMatch(lastDay.toDateString());
                    weekDays.forEach((el) => {
                        HelperTestFunctions.verifyDateSelected(el);
                    });
                });

                it("Calendar selection - range through API", () => {
                    fixture.detectChanges();

                    const target = dom.query(
                        By.css(HelperTestFunctions.SELECTED_DATE_CSSCLASS),
                    );
                    const weekDiv = target.parent;
                    const weekDays = weekDiv.queryAll(
                        By.css(HelperTestFunctions.DAY_CSSCLASS),
                    );

                    calendar.selection = "range";
                    fixture.detectChanges();

                    const lastDay = new Date(2017, 5, 17);
                    const midDay = new Date(2017, 5, 14);
                    const firstDay = new Date(2017, 5, 11);

                    calendar.selectDate([firstDay, lastDay]);
                    fixture.detectChanges();

                    expect(
                        (fixture.componentInstance.model as Date[]).length,
                    ).toEqual(7);
                    expect((calendar.value as Date[]).length).toEqual(7);
                    expect(calendar.value[0].toDateString()).toMatch(
                        firstDay.toDateString(),
                    );
                    expect(
                        calendar.value[
                            (calendar.value as Date[]).length - 1
                        ].toDateString(),
                    ).toMatch(lastDay.toDateString());
                    weekDays.forEach((el) => {
                        HelperTestFunctions.verifyDateSelected(el);
                    });

                    calendar.selectDate([firstDay, midDay]);
                    fixture.detectChanges();

                    expect(
                        (fixture.componentInstance.model as Date[]).length,
                    ).toEqual(4);
                    expect((calendar.value as Date[]).length).toEqual(4);
                    expect(calendar.value[0].toDateString()).toMatch(
                        firstDay.toDateString(),
                    );
                    expect(
                        calendar.value[
                            (calendar.value as Date[]).length - 1
                        ].toDateString(),
                    ).toMatch(midDay.toDateString());
                    for (const i of [0, 1, 2, 3]) {
                        HelperTestFunctions.verifyDateSelected(weekDays[i]);
                    }

                    // Select with only one day
                    calendar.selectDate([lastDay]);
                    fixture.detectChanges();

                    expect((calendar.value as Date[]).length).toEqual(1);
                    expect(calendar.value[0].toDateString()).toMatch(
                        lastDay.toDateString(),
                    );
                    HelperTestFunctions.verifyDateSelected(weekDays[6]);

                    // Select with array of 3 days
                    calendar.selectDate([midDay, lastDay, firstDay]);
                    fixture.detectChanges();

                    expect(
                        (fixture.componentInstance.model as Date[]).length,
                    ).toEqual(7);
                    expect((calendar.value as Date[]).length).toEqual(7);
                    expect(calendar.value[0].toDateString()).toMatch(
                        firstDay.toDateString(),
                    );
                    expect(
                        calendar.value[
                            (calendar.value as Date[]).length - 1
                        ].toDateString(),
                    ).toMatch(lastDay.toDateString());
                    weekDays.forEach((el) => {
                        HelperTestFunctions.verifyDateSelected(el);
                    });
                });
            });

            describe("Keyboard Navigation - ", () => {
                let component: DebugElement;

                beforeEach(waitForAsync(() => {
                    component = dom.query(
                        By.css(HelperTestFunctions.CALENDAR_WRAPPER_CLASS),
                    );
                    component.nativeElement.focus();
                }));

                it("Calendar keyboard navigation - PageUp/PageDown", () => {
                    UIInteractions.triggerKeyDownEvtUponElem(
                        "PageUp",
                        component.nativeElement,
                    );

                    fixture.detectChanges();
                    expect(calendar.viewDate.getMonth()).toEqual(4);

                    calendar.viewDate = new Date(2017, 5, 13);
                    fixture.detectChanges();
                    UIInteractions.triggerKeyDownEvtUponElem(
                        "PageDown",
                        component.nativeElement,
                    );
                    fixture.detectChanges();

                    expect(calendar.viewDate.getMonth()).toEqual(6);

                    UIInteractions.triggerKeyDownEvtUponElem(
                        "PageUp",
                        component.nativeElement,
                        true,
                        false,
                        true,
                    );
                    fixture.detectChanges();
                    expect(calendar.viewDate.getFullYear()).toEqual(2016);

                    calendar.viewDate = new Date(2017, 5, 13);
                    fixture.detectChanges();

                    UIInteractions.triggerKeyDownEvtUponElem(
                        "PageDown",
                        component.nativeElement,
                        true,
                        false,
                        true,
                    );
                    fixture.detectChanges();
                    expect(calendar.viewDate.getFullYear()).toEqual(2018);
                });

                it("Calendar keyboard navigation - Home/End/Enter", () => {
                    const days = calendar.daysView.dates.filter(
                        (day) => day.isCurrentMonth,
                    );
                    const firstDay = days.at(0);
                    const lastDay = days.at(-1);

                    UIInteractions.triggerKeyDownEvtUponElem(
                        "Home",
                        component.nativeElement,
                    );
                    fixture.detectChanges();
                    expect(calendar.activeDate.getDate().toString()).toEqual(firstDay.nativeElement.textContent.trim());

                    UIInteractions.triggerKeyDownEvtUponElem(
                        "End",
                        component.nativeElement,
                    );
                    fixture.detectChanges();
                    expect(calendar.activeDate.getDate().toString()).toEqual(lastDay.nativeElement.textContent.trim());

                    UIInteractions.triggerKeyDownEvtUponElem(
                        "Enter",
                        component.nativeElement,
                    );
                    fixture.detectChanges();

                    expect(calendar.value).toEqual(lastDay.date.native);
                });

                it("Calendar keyboard navigation - Arrow keys", () => {
                    // Initial active date must be the first if no date is selected
                    // and no prior user interaction has been made
                    calendar.activeDate = new Date(2017, 1, 1);
                    expect(calendar.activeDate.getDate()).toEqual(1);

                    // Go to the next row
                    UIInteractions.triggerKeyDownEvtUponElem(
                        "ArrowDown",
                        component.nativeElement
                    );

                    fixture.detectChanges();
                    expect(calendar.activeDate.getDate()).toEqual(8);

                    // Go to the left
                    UIInteractions.triggerKeyDownEvtUponElem(
                        "ArrowLeft",
                        component.nativeElement
                    );

                    fixture.detectChanges();
                    expect(calendar.activeDate.getDate()).toEqual(7);

                    // Go to the right
                    UIInteractions.triggerKeyDownEvtUponElem(
                        "ArrowRight",
                        document.activeElement,
                    );

                    fixture.detectChanges();
                    expect(calendar.activeDate.getDate()).toEqual(8);

                    // Go up a row
                    UIInteractions.triggerKeyDownEvtUponElem(
                        "ArrowUp",
                        document.activeElement,
                    );

                    fixture.detectChanges();
                    expect(calendar.activeDate.getDate()).toEqual(1);
                });

                it("Calendar should persist focus when navigating between prev/next month.", () => {
                    UIInteractions.triggerKeyDownEvtUponElem(
                        "Home",
                        component.nativeElement,
                    );
                    fixture.detectChanges();

                    // Ensure first of month day is active
                    expect(calendar.activeDate.getDate()).toEqual(1);

                    // Navigate to the previous month by pressing Arrow Left
                    UIInteractions.triggerKeyDownEvtUponElem(
                        "ArrowLeft",
                        component.nativeElement,
                    );
                    fixture.detectChanges();
                    expect(calendar.viewDate.getMonth()).toEqual(calendar.activeDate.getMonth());
                    expect(calendar.activeDate.getDate()).toEqual(31);
                    expect(document.activeElement).toBe(component.nativeElement);

                    // Select the active date by pressing Enter
                    UIInteractions.triggerKeyDownEvtUponElem("Enter", component.nativeElement);

                    fixture.detectChanges();
                    expect(calendar.value).toEqual(calendar.activeDate);

                    // Go to the next month
                    UIInteractions.triggerKeyDownEvtUponElem(
                        "ArrowRight",
                        document.activeElement,
                    );
                    fixture.detectChanges();

                    expect(calendar.value).not.toEqual(calendar.activeDate);
                    expect(calendar.viewDate.getMonth()).toEqual(calendar.activeDate.getMonth());
                    expect(calendar.activeDate.getDate()).toEqual(1);
                    expect(document.activeElement).toBe(component.nativeElement);

                    UIInteractions.triggerKeyDownEvtUponElem('Enter', component.nativeElement);
                    fixture.detectChanges();
                    expect(calendar.value).toEqual(calendar.activeDate);
                });

                it('Should navigate to first enabled date when using "home" key.', () => {
                    const dateRangeDescriptors: DateRangeDescriptor[] = [];
                    const specificDates = [
                        new Date(2017, 5, 1),
                        new Date(2017, 5, 2),
                    ];
                    dateRangeDescriptors.push(
                        { type: DateRangeType.Specific, dateRange: specificDates },
                        { type: DateRangeType.Weekends },
                    );
                    calendar.disabledDates = dateRangeDescriptors;
                    fixture.detectChanges();

                    UIInteractions.triggerKeyDownEvtUponElem(
                        "Home",
                        component.nativeElement,
                    );
                    fixture.detectChanges();
                    expect(calendar.activeDate.getDate()).toEqual(5);
                });

                it('Should navigate to last enabled date when using "end" key.', () => {
                    const dateRangeDescriptors: DateRangeDescriptor[] = [];
                    const rangeDates = [
                        new Date(2017, 5, 28),
                        new Date(2017, 5, 30),
                    ];
                    dateRangeDescriptors.push(
                        { type: DateRangeType.Between, dateRange: rangeDates },
                        {
                            type: DateRangeType.Specific,
                            dateRange: [new Date(2017, 5, 27)],
                        },
                    );
                    calendar.disabledDates = dateRangeDescriptors;
                    fixture.detectChanges();

                    UIInteractions.triggerKeyDownEvtUponElem(
                        "End",
                        component.nativeElement,
                    );
                    fixture.detectChanges();
                    expect(calendar.activeDate.getDate()).toEqual(26);
                });

                it('Should navigate to first enabled date when using "arrow up" key.', () => {
                    const dateRangeDescriptors: DateRangeDescriptor[] = [];
                    const specificDates = [
                        new Date(2017, 5, 23),
                        new Date(2017, 5, 16),
                    ];
                    dateRangeDescriptors.push(
                        { type: DateRangeType.Specific, dateRange: specificDates },
                        { type: DateRangeType.Weekends },
                    );
                    calendar.disabledDates = dateRangeDescriptors;
                    fixture.detectChanges();

                    UIInteractions.triggerKeyDownEvtUponElem(
                        "End",
                        component.nativeElement,
                    );
                    fixture.detectChanges();

                    UIInteractions.triggerKeyDownEvtUponElem(
                        "ArrowUp",
                        document.activeElement,
                    );
                    fixture.detectChanges();
                    expect(calendar.activeDate.getDate()).toEqual(9);
                });

                it('Should navigate to first enabled date when using "arrow down" key.', () => {
                    const dateRangeDescriptors: DateRangeDescriptor[] = [];
                    const specificDates = [
                        new Date(2017, 5, 8),
                        new Date(2017, 5, 15),
                    ];
                    dateRangeDescriptors.push(
                        { type: DateRangeType.Specific, dateRange: specificDates },
                        { type: DateRangeType.Weekends },
                    );
                    calendar.disabledDates = dateRangeDescriptors;
                    fixture.detectChanges();

                    UIInteractions.triggerKeyDownEvtUponElem(
                        "Home",
                        component.nativeElement,
                    );
                    fixture.detectChanges();

                    UIInteractions.triggerKeyDownEvtUponElem(
                        "ArrowDown",
                        document.activeElement,
                    );
                    fixture.detectChanges();
                    expect(calendar.activeDate.getDate()).toEqual(22);
                });

                it('Should navigate to first enabled date when using "arrow left" key.', () => {
                    const dateRangeDescriptors: DateRangeDescriptor[] = [];
                    const rangeDates = [
                        new Date(2017, 5, 2),
                        new Date(2017, 5, 29),
                    ];
                    dateRangeDescriptors.push({
                        type: DateRangeType.Between,
                        dateRange: rangeDates,
                    });
                    calendar.disabledDates = dateRangeDescriptors;
                    fixture.detectChanges();

                    UIInteractions.triggerKeyDownEvtUponElem(
                        "End",
                        component.nativeElement,
                    );
                    fixture.detectChanges();

                    UIInteractions.triggerKeyDownEvtUponElem(
                        "ArrowLeft",
                        component.nativeElement,
                    );
                    fixture.detectChanges();
                    expect(calendar.activeDate.getDate()).toEqual(1);
                });

                it('Should navigate to first enabled date when using "arrow right" key.', () => {
                    const dateRangeDescriptors: DateRangeDescriptor[] = [];
                    const rangeDates = [
                        new Date(2017, 5, 2),
                        new Date(2017, 5, 29),
                    ];
                    dateRangeDescriptors.push({
                        type: DateRangeType.Between,
                        dateRange: rangeDates,
                    });
                    calendar.disabledDates = dateRangeDescriptors;
                    fixture.detectChanges();
                    UIInteractions.triggerKeyDownEvtUponElem(
                        "Home",
                        component.nativeElement,
                    );
                    fixture.detectChanges();

                    UIInteractions.triggerKeyDownEvtUponElem(
                        "ArrowRight",
                        document.activeElement,
                    );
                    fixture.detectChanges();
                    expect(calendar.activeDate.getDate()).toEqual(30);
                });

                it('Should not select disabled dates when having "range" selection', () => {
                    const dateRangeDescriptors: DateRangeDescriptor[] = [];
                    const rangeDates = [
                        new Date(2017, 5, 10),
                        new Date(2017, 5, 15),
                    ];
                    dateRangeDescriptors.push({
                        type: DateRangeType.Between,
                        dateRange: rangeDates,
                    });
                    calendar.disabledDates = dateRangeDescriptors;
                    calendar.selection = "range";
                    fixture.detectChanges();

                    // Select range using keyboard events
                    const fromDate = calendar.daysView.dates.filter(
                        (d) =>
                            getDate(d).getTime() === new Date(2017, 5, 5).getTime(),
                    )[0];
                    UIInteractions.simulateClickAndSelectEvent(fromDate.nativeElement.firstChild);
                    fixture.detectChanges();

                    const toDate = calendar.daysView.dates.filter(
                        (d) =>
                            getDate(d).getTime() ===
                            new Date(2017, 5, 20).getTime(),
                    )[0];
                    UIInteractions.simulateClickAndSelectEvent(toDate.nativeElement.firstChild);
                    fixture.detectChanges();

                    // Check selection
                    const selectedDates = calendar.daysView.dates
                        .toArray()
                        .filter((d) => {
                            const dateTime = getDate(d).getTime();
                            return (
                                (dateTime >= new Date(2017, 5, 5).getTime() &&
                                    dateTime <= new Date(2017, 5, 9).getTime()) ||
                                (dateTime >= new Date(2017, 5, 16).getTime() &&
                                    dateTime <= new Date(2017, 5, 20).getTime())
                            );
                        });

                    selectedDates.forEach((d) => {
                        expect(d.selected).toBe(true);
                    });

                    const notSelectedDates = calendar.daysView.dates
                        .toArray()
                        .filter((d) => {
                            const dateTime = getDate(d).getTime();
                            return (
                                dateTime >= new Date(2017, 5, 10).getTime() &&
                                dateTime <= new Date(2017, 5, 15).getTime()
                            );
                        });

                    notSelectedDates.forEach((d) => {
                        expect(d.selected).toBe(false);
                    });
                });
            });

            describe("Disabled dates - ", () => {
                it('Should disable date when using "After" date descriptor.', () => {
                    DateRangesPropertiesTester.testAfter(
                        DateRangesPropertiesTester.assignDisableDatesDescriptors,
                        DateRangesPropertiesTester.testDisabledDates,
                    );
                });

                it('Should disable date when using "Before" date descriptor.', () => {
                    DateRangesPropertiesTester.testBefore(
                        DateRangesPropertiesTester.assignDisableDatesDescriptors,
                        DateRangesPropertiesTester.testDisabledDates,
                    );
                });

                it('Should disable date when using "Between" date descriptor with min date declared first.', () => {
                    DateRangesPropertiesTester.testBetweenWithMinDateFirst(
                        DateRangesPropertiesTester.assignDisableDatesDescriptors,
                        DateRangesPropertiesTester.testDisabledDates,
                    );
                });

                it('Should disable date when using "Between" date descriptor with max date declared first.', () => {
                    DateRangesPropertiesTester.testBetweenWithMaxDateFirst(
                        DateRangesPropertiesTester.assignDisableDatesDescriptors,
                        DateRangesPropertiesTester.testDisabledDates,
                    );
                });

                it('Should disable date when using "Between" date descriptor with min and max the same.', () => {
                    DateRangesPropertiesTester.testBetweenWithMinMaxTheSame(
                        DateRangesPropertiesTester.assignDisableDatesDescriptors,
                        DateRangesPropertiesTester.testDisabledDates,
                    );
                });

                it('Should disable date when using overlapping "Between" ranges.', () => {
                    DateRangesPropertiesTester.testOverlappingBetweens(
                        DateRangesPropertiesTester.assignDisableDatesDescriptors,
                        DateRangesPropertiesTester.testDisabledDates,
                    );
                });

                it('Should disable date when using "Specific" date descriptor.', () => {
                    DateRangesPropertiesTester.testSpecific(
                        DateRangesPropertiesTester.assignDisableDatesDescriptors,
                        DateRangesPropertiesTester.testDisabledDates,
                    );
                });

                it('Should disable date when using "Weekdays" date descriptor.', () => {
                    DateRangesPropertiesTester.testWeekdays(
                        DateRangesPropertiesTester.assignDisableDatesDescriptors,
                        DateRangesPropertiesTester.testDisabledDates,
                    );
                });

                it('Should disable date when using "Weekends" date descriptor.', () => {
                    DateRangesPropertiesTester.testWeekends(
                        DateRangesPropertiesTester.assignDisableDatesDescriptors,
                        DateRangesPropertiesTester.testDisabledDates,
                    );
                });

                it("Should disable dates when using multiple ranges.", () => {
                    DateRangesPropertiesTester.testMultipleRanges(
                        DateRangesPropertiesTester.assignDisableDatesDescriptors,
                        DateRangesPropertiesTester.testDisabledDates,
                    );
                });

                it("Should be able to change disable dates runtime.", () => {
                    DateRangesPropertiesTester.testRangeUpdateRuntime(
                        DateRangesPropertiesTester.assignDisableDatesDescriptors,
                        DateRangesPropertiesTester.testDisabledDates,
                    );
                });

                it('Should disable previous month with "before" date descriptor', () => {
                    DateRangesPropertiesTester.testPreviousMonthRange(
                        DateRangesPropertiesTester.assignDisableDatesDescriptors,
                        DateRangesPropertiesTester.testDisabledDates,
                    );
                });
            });

            describe("Special dates - ", () => {
                it('Should mark date as special when using "After" date descriptor.', () => {
                    DateRangesPropertiesTester.testAfter(
                        DateRangesPropertiesTester.assignSpecialDatesDescriptors,
                        DateRangesPropertiesTester.testSpecialDates,
                    );
                });

                it('Should mark date as special when using "Before" date descriptor.', () => {
                    DateRangesPropertiesTester.testBefore(
                        DateRangesPropertiesTester.assignSpecialDatesDescriptors,
                        DateRangesPropertiesTester.testSpecialDates,
                    );
                });

                it('Should mark date as special when using "Between" date descriptor with min date declared first.', () => {
                    DateRangesPropertiesTester.testBetweenWithMinDateFirst(
                        DateRangesPropertiesTester.assignSpecialDatesDescriptors,
                        DateRangesPropertiesTester.testSpecialDates,
                    );
                });

                it('Should mark date as special when using "Between" date descriptor with max date declared first.', () => {
                    DateRangesPropertiesTester.testBetweenWithMaxDateFirst(
                        DateRangesPropertiesTester.assignSpecialDatesDescriptors,
                        DateRangesPropertiesTester.testSpecialDates,
                    );
                });

                it('Should mark date as special when using "Between" date descriptor with min and max the same.', () => {
                    DateRangesPropertiesTester.testBetweenWithMinMaxTheSame(
                        DateRangesPropertiesTester.assignSpecialDatesDescriptors,
                        DateRangesPropertiesTester.testSpecialDates,
                    );
                });

                it('Should mark date as special when using overlapping "Between" ranges.', () => {
                    DateRangesPropertiesTester.testOverlappingBetweens(
                        DateRangesPropertiesTester.assignSpecialDatesDescriptors,
                        DateRangesPropertiesTester.testSpecialDates,
                    );
                });

                it('Should mark date as special when using "Specific" date descriptor.', () => {
                    DateRangesPropertiesTester.testSpecific(
                        DateRangesPropertiesTester.assignSpecialDatesDescriptors,
                        DateRangesPropertiesTester.testSpecialDates,
                    );
                });

                it('Should mark date as special when using "Weekdays" date descriptor.', () => {
                    DateRangesPropertiesTester.testWeekdays(
                        DateRangesPropertiesTester.assignSpecialDatesDescriptors,
                        DateRangesPropertiesTester.testSpecialDates,
                    );
                });

                it('Should mark date as special when using "Weekends" date descriptor.', () => {
                    DateRangesPropertiesTester.testWeekends(
                        DateRangesPropertiesTester.assignSpecialDatesDescriptors,
                        DateRangesPropertiesTester.testSpecialDates,
                    );
                });

                it("Should mark dates as special when using multiple ranges.", () => {
                    DateRangesPropertiesTester.testMultipleRanges(
                        DateRangesPropertiesTester.assignSpecialDatesDescriptors,
                        DateRangesPropertiesTester.testSpecialDates,
                    );
                });

                it('Should mark as special previous month with "before" date descriptor', () => {
                    DateRangesPropertiesTester.testPreviousMonthRange(
                        DateRangesPropertiesTester.assignSpecialDatesDescriptors,
                        DateRangesPropertiesTester.testSpecialDates,
                    );
                });

                it("Should be able to change special dates runtime.", () => {
                    DateRangesPropertiesTester.testRangeUpdateRuntime(
                        DateRangesPropertiesTester.assignSpecialDatesDescriptors,
                        DateRangesPropertiesTester.testSpecialDates,
                    );
                });
            });

            describe("Disabled special dates - ", () => {
                beforeEach(waitForAsync(() => {
                    fixture = TestBed.createComponent(
                        IgxCalendarDisabledSpecialDatesComponent,
                    );
                    fixture.detectChanges();
                    calendar = fixture.componentInstance.calendar;
                }));

                it("Should be able to set disabled and active dates as @Input", () => {
                    expect(calendar.specialDates).toEqual([
                        {
                            type: DateRangeType.Between,
                            dateRange: [new Date(2017, 5, 1), new Date(2017, 5, 6)],
                        },
                    ]);
                    expect(calendar.disabledDates).toEqual([
                        {
                            type: DateRangeType.Between,
                            dateRange: [
                                new Date(2017, 5, 23),
                                new Date(2017, 5, 29),
                            ],
                        },
                    ]);
                    let specialDates = calendar.daysView.dates
                        .toArray()
                        .filter((d) => {
                            const dateTime = getDate(d).getTime();
                            return (
                                dateTime >= new Date(2017, 5, 1).getTime() &&
                                dateTime <= new Date(2017, 5, 6).getTime()
                            );
                        });

                    specialDates.forEach((d) => {
                        expect(d.isSpecial).toBe(true);
                    });

                    let disabledDates = calendar.daysView.dates
                        .toArray()
                        .filter((d) => {
                            const dateTime = getDate(d).getTime();
                            return (
                                dateTime >= new Date(2017, 5, 23).getTime() &&
                                dateTime <= new Date(2017, 5, 29).getTime()
                            );
                        });

                    disabledDates.forEach((d) => {
                        expect(d.isDisabled).toBe(true);
                        expect(d.isDisabledCSS).toBe(true);
                    });

                    // change Inputs
                    fixture.componentInstance.disabledDates = [
                        {
                            type: DateRangeType.Before,
                            dateRange: [new Date(2017, 5, 10)],
                        },
                    ];
                    fixture.componentInstance.specialDates = [
                        {
                            type: DateRangeType.After,
                            dateRange: [new Date(2017, 5, 19)],
                        },
                    ];
                    fixture.detectChanges();

                    expect(calendar.disabledDates).toEqual([
                        {
                            type: DateRangeType.Before,
                            dateRange: [new Date(2017, 5, 10)],
                        },
                    ]);
                    expect(calendar.specialDates).toEqual([
                        {
                            type: DateRangeType.After,
                            dateRange: [new Date(2017, 5, 19)],
                        },
                    ]);

                    specialDates = calendar.daysView.dates.toArray().filter((d) => {
                        const dateTime = getDate(d).getTime();
                        return dateTime >= new Date(2017, 5, 20).getTime();
                    });

                    specialDates.forEach((d) => {
                        if (!d.isInactive) {
                            expect(d.isSpecial).toBe(true);
                        }
                    });

                    disabledDates = calendar.daysView.dates
                        .toArray()
                        .filter((d) => {
                            const dateTime = getDate(d).getTime();
                            return dateTime <= new Date(2017, 5, 9).getTime();
                        });

                    disabledDates.forEach((d) => {
                        expect(d.isDisabled).toBe(true);
                        expect(d.isDisabledCSS).toBe(true);
                    });
                });

                it("Should not select date from model, if it is part of disabled dates", () => {
                    // Changed per WC alignment task #16131 - calendar should not block selection of dates through API/model
                    expect(calendar.value).toBeTruthy();
                });

                it("Should not select date from model in range selection, if model passes null", () => {
                    calendar.selection = "range";
                    fixture.componentInstance.model = null;
                    fixture.detectChanges();

                    expect((calendar.value as Date[]).length).toEqual(0);
                });
            });

            describe("Select and deselect dates - ", () => {
                let ci: any;

                beforeEach(waitForAsync(() => {
                    fixture = TestBed.createComponent(IgxCalendarSampleComponent);
                    fixture.detectChanges();
                    ci = fixture.componentInstance;
                    calendar = ci.calendar;
                }));

                it('Deselect using API. Should deselect in "single" selection mode.', () => {
                    const date = calendar.viewDate;
                    calendar.selectDate(date);
                    fixture.detectChanges();
                    expect(calendar.value).toEqual(date);

                    calendar.deselectDate(date);
                    fixture.detectChanges();
                    expect(calendar.value).toBeUndefined();

                    // Deselect with date different than selected date
                    calendar.selectDate(date);
                    fixture.detectChanges();
                    expect(calendar.value).toEqual(date);


                    const dateToDeselect = new Date(date);
                    dateToDeselect.setDate(dateToDeselect.getDate() + 5);

                    calendar.deselectDate(dateToDeselect);
                    fixture.detectChanges();
                    expect(calendar.value).toEqual(date);

                    // Select date with ISOString as value
                    const isoDate = new Date(2024, 10, 10).toISOString();
                    calendar.selectDate(isoDate);
                    fixture.detectChanges();
                    expect(calendar.value).toEqual(new Date(isoDate));

                    calendar.deselectDate(isoDate);
                    fixture.detectChanges();
                    expect(calendar.value).toBeUndefined();

                    // Deselect with date different than selected date
                    calendar.selectDate(isoDate);
                    fixture.detectChanges();
                    expect(calendar.value).toEqual(new Date(isoDate));

                    calendar.deselectDate(new Date(2024, 10, 11).toISOString());
                    fixture.detectChanges();
                    expect(calendar.value).toEqual(new Date(isoDate));
                });

                it('Deselect using API. Should deselect in "multi" selection mode.', () => {
                    calendar.selection = "multi";
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
                    const evenDates = dates.filter((d) => d.getDate() % 2 === 0);
                    calendar.deselectDate(evenDates);

                    fixture.detectChanges();
                    const oddDates = dates.filter((d) => d.getDate() % 2 !== 0);
                    let selectedDates: Date[] = calendar.value as Date[];

                    expect(selectedDates.length).toBe(5);
                    for (const selectedDate of selectedDates) {
                        const fdate = oddDates.some(
                            (date: Date) =>
                                date.getTime() === selectedDate.getTime(),
                        );
                        expect(fdate).toBeTruthy();
                    }

                    // Deselect with array not included in the selected dates
                    calendar.deselectDate(evenDates);
                    fixture.detectChanges();
                    selectedDates = calendar.value as Date[];
                    expect(selectedDates.length).toBe(5);
                    for (const selectedDate of selectedDates) {
                        const fdate = oddDates.some(
                            (date: Date) =>
                                date.getTime() === selectedDate.getTime(),
                        );
                        expect(fdate).toBeTruthy();
                    }

                    // Deselect one date included in the selected dates
                    calendar.deselectDate([oddDates[0]]);
                    fixture.detectChanges();
                    selectedDates = calendar.value as Date[];
                    expect(selectedDates.length).toBe(4);
                    for (const selectedDate of selectedDates) {
                        const fdate = oddDates.some(
                            (date: Date) =>
                                date.getTime() === selectedDate.getTime(),
                        );
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
                    calendar.selection = "range";
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
                    calendar.selection = "range";
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
                    calendar.selection = "range";
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
                    calendar.deselectDate([
                        midDateDeselect,
                        endDateDeselect,
                        startDateDeselect,
                    ]);
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
                    expect(selectedDate).toBeUndefined();
                });

                it('Deselect using API. Should deselect all in "multi" mode.', () => {
                    calendar.selection = "multi";
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
                    calendar.selection = "range";
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

                it("Should extend the range when selecting a date outside of it with shift click.", () => {
                    calendar.selection = "range";
                    fixture.detectChanges();

                    const days = calendar.daysView.dates.filter(
                        (day) => day.isCurrentMonth,
                    );
                    const june11th = days[10];
                    const june13th = days[12];
                    const june15th = days[14];
                    const june17th = days[16];

                    let calendarValue: Date[];

                    // range selection from June 13th to June 15th
                    UIInteractions.simulateClickAndSelectEvent(june13th.nativeElement.firstChild);
                    UIInteractions.simulateClickAndSelectEvent(june15th.nativeElement.firstChild);
                    fixture.detectChanges();

                    calendarValue = calendar.value as Date[];
                    expect(calendarValue.length).toEqual(3);
                    expect(calendarValue[0].toDateString()).toMatch(
                        new Date(2017, 5, 13).toDateString(),
                    );
                    expect(
                        calendarValue[calendarValue.length - 1].toDateString(),
                    ).toMatch(new Date(2017, 5, 15).toDateString());

                    // extend the range to June 17th (June 13th - June 17th)
                    UIInteractions.simulateClickAndSelectEvent(june17th.nativeElement.firstChild, true);
                    fixture.detectChanges();

                    calendarValue = calendar.value as Date[];
                    expect(calendarValue.length).toEqual(5);
                    expect(
                        calendarValue[calendarValue.length - 1].toDateString(),
                    ).toMatch(new Date(2017, 5, 17).toDateString());

                    // extend the range to June 11th (June 11th - June 17th)
                    UIInteractions.simulateClickAndSelectEvent(june11th.nativeElement.firstChild, true);
                    fixture.detectChanges();

                    calendarValue = calendar.value as Date[];
                    expect(calendarValue.length).toEqual(7);
                    expect(calendarValue[0].toDateString()).toMatch(
                        new Date(2017, 5, 11).toDateString(),
                    );
                });

                it("Should shorten the range when selecting a date inside of it with shift click.", () => {
                    calendar.selection = "range";
                    fixture.detectChanges();

                    const days = calendar.daysView.dates.filter(
                        (day) => day.isCurrentMonth,
                    );
                    const june11th = days[10];
                    const june13th = days[12];
                    const june15th = days[14];
                    const june17th = days[16];

                    let calendarValue: Date[];

                    // range selection from June 13th to June 17th
                    UIInteractions.simulateClickAndSelectEvent(june13th.nativeElement.firstChild);
                    UIInteractions.simulateClickAndSelectEvent(june17th.nativeElement.firstChild);
                    fixture.detectChanges();

                    calendarValue = calendar.value as Date[];
                    expect(calendarValue.length).toEqual(5);
                    expect(calendarValue[0].toDateString()).toMatch(
                        new Date(2017, 5, 13).toDateString(),
                    );
                    expect(
                        calendarValue[calendarValue.length - 1].toDateString(),
                    ).toMatch(new Date(2017, 5, 17).toDateString());

                    // shorten the range to June 15th (June 13th - June 15th)
                    UIInteractions.simulateClickAndSelectEvent(june15th.nativeElement.firstChild, true);
                    fixture.detectChanges();

                    calendarValue = calendar.value as Date[];
                    expect(calendarValue.length).toEqual(3);
                    expect(
                        calendarValue[calendarValue.length - 1].toDateString(),
                    ).toMatch(new Date(2017, 5, 15).toDateString());

                    // extend the range to June 11th (June 11th - June 15th)
                    UIInteractions.simulateClickAndSelectEvent(june11th.nativeElement.firstChild, true);
                    fixture.detectChanges();

                    calendarValue = calendar.value as Date[];
                    expect(calendarValue.length).toEqual(5);
                    expect(calendarValue[0].toDateString()).toMatch(
                        new Date(2017, 5, 11).toDateString(),
                    );
                    expect(
                        calendarValue[calendarValue.length - 1].toDateString(),
                    ).toMatch(new Date(2017, 5, 15).toDateString());

                    // shorten the range to June 13th (June 13th - June 15th)
                    UIInteractions.simulateClickAndSelectEvent(june13th.nativeElement.firstChild, true);
                    fixture.detectChanges();

                    calendarValue = calendar.value as Date[];
                    expect(calendarValue.length).toEqual(3);
                    expect(calendarValue[0].toDateString()).toMatch(
                        new Date(2017, 5, 13).toDateString(),
                    );
                });

                it('Should select all dates from last selected to shift clicked date in "multi" mode.', () => {
                    calendar.selection = "multi";
                    fixture.detectChanges();

                    const days = calendar.daysView.dates.filter(
                        (day) => day.isCurrentMonth,
                    );
                    const june11th = days[10];
                    const june13th = days[12];
                    const june15th = days[14];
                    const june17th = days[16];

                    // select June 13th and June 15th
                    UIInteractions.simulateClickAndSelectEvent(june13th.nativeElement.firstChild);
                    UIInteractions.simulateClickAndSelectEvent(june15th.nativeElement.firstChild);
                    fixture.detectChanges();
                    expect((calendar.value as Date[]).length).toEqual(2);

                    // select all dates from June 15th to June 17th
                    UIInteractions.simulateClickAndSelectEvent(june17th.nativeElement.firstChild, true);
                    fixture.detectChanges();
                    expect((calendar.value as Date[]).length).toEqual(4);

                    let expected = [
                        new Date(2017, 5, 13),
                        new Date(2017, 5, 15),
                        new Date(2017, 5, 16),
                        new Date(2017, 5, 17),
                    ];

                    expect(JSON.stringify(calendar.value as Date[])).toEqual(
                        JSON.stringify(expected),
                    );

                    // select all dates from June 17th (last selected) to June 11th
                    UIInteractions.simulateClickAndSelectEvent(june11th.nativeElement.firstChild, true);
                    fixture.detectChanges();
                    expect((calendar.value as Date[]).length).toEqual(7);

                    const year = calendar.viewDate.getFullYear();
                    const month = calendar.viewDate.getMonth();
                    expected = [];

                    for (let i = 11; i <= 17; i++) {
                        expected.push(new Date(year, month, i));
                    }

                    expect(JSON.stringify(calendar.value as Date[])).toEqual(
                        JSON.stringify(expected),
                    );
                });

                it('Should deselect all dates from last clicked to shift clicked date in "multi" mode.', () => {
                    calendar.selection = "multi";
                    fixture.detectChanges();

                    const days = calendar.daysView.dates.filter(
                        (day) => day.isCurrentMonth,
                    );
                    const june11th = days[10];
                    const june13th = days[12];
                    const june15th = days[14];
                    const june17th = days[16];

                    const year = calendar.viewDate.getFullYear();
                    const month = calendar.viewDate.getMonth();
                    const dates = [];

                    for (let i = 11; i <= 17; i++) {
                        dates.push(new Date(year, month, i));
                    }

                    calendar.selectDate(dates);
                    fixture.detectChanges();
                    expect((calendar.value as Date[]).length).toEqual(7);

                    // deselect all dates from June 11th (last clicked) to June 13th
                    UIInteractions.simulateClickAndSelectEvent(june11th.nativeElement.firstChild);
                    UIInteractions.simulateClickAndSelectEvent(june13th.nativeElement.firstChild, true);
                    fixture.detectChanges();
                    expect((calendar.value as Date[]).length).toEqual(5);
                    expect(JSON.stringify(calendar.value as Date[])).toEqual(
                        JSON.stringify(dates.slice(2)),
                    );

                    // deselect all dates from June 17th (last clicked) to June 15th
                    UIInteractions.simulateClickAndSelectEvent(june17th.nativeElement.firstChild);
                    UIInteractions.simulateClickAndSelectEvent(june15th.nativeElement.firstChild, true);
                    fixture.detectChanges();
                    expect((calendar.value as Date[]).length).toEqual(3);
                    expect(JSON.stringify(calendar.value as Date[])).toEqual(
                        JSON.stringify(dates.slice(2, 5)),
                    );
                });
            });

            describe("Advanced KB Navigation - ", () => {
                beforeEach(waitForAsync(() => {
                    fixture = TestBed.createComponent(IgxCalendarSampleComponent);
                    fixture.detectChanges();
                    calendar = fixture.componentInstance.calendar;
                    dom = fixture.debugElement;
                }));

                it("Should navigate to the previous/next month via KB.", fakeAsync(() => {
                    const prev = dom.queryAll(
                        By.css(HelperTestFunctions.CALENDAR_PREV_BUTTON_CSSCLASS),
                    )[0];
                    prev.nativeElement.focus();

                    expect(prev.nativeElement).toBe(document.activeElement);
                    UIInteractions.triggerKeyDownEvtUponElem(
                        "Enter",
                        prev.nativeElement,
                    );
                    fixture.detectChanges();
                    tick(100);

                    expect(calendar.viewDate.getMonth()).toEqual(4);
                    const next = dom.queryAll(
                        By.css(HelperTestFunctions.CALENDAR_NEXT_BUTTON_CSSCLASS),
                    )[0];
                    next.nativeElement.focus();
                    expect(next.nativeElement).toBe(document.activeElement);

                    UIInteractions.triggerKeyDownEvtUponElem(
                        "Enter",
                        next.nativeElement,
                    );

                    fixture.detectChanges();
                    tick(100);
                    UIInteractions.triggerKeyDownEvtUponElem(
                        "Enter",
                        next.nativeElement,
                    );
                    tick(100);
                    fixture.detectChanges();

                    expect(calendar.viewDate.getMonth()).toEqual(6);
                }));

                it("Should open years view, navigate through and select an year via KB.", fakeAsync(() => {
                    const year = dom.queryAll(
                        By.css(HelperTestFunctions.CALENDAR_DATE_CSSCLASS),
                    )[1];
                    year.nativeElement.focus();

                    expect(year.nativeElement).toBe(document.activeElement);

                    spyOn(calendar.activeViewChanged, "emit").and.callThrough();

                    UIInteractions.triggerKeyDownEvtUponElem(
                        "Enter",
                        document.activeElement,
                    );
                    fixture.detectChanges();
                    tick();

                    expect(calendar.activeViewChanged.emit).toHaveBeenCalledTimes(
                        1,
                    );
                    expect(calendar.activeViewChanged.emit).toHaveBeenCalledWith(
                        IgxCalendarView.Decade,
                    );

                    const years = dom.queryAll(
                        By.css(HelperTestFunctions.YEAR_CSSCLASS),
                    );
                    let currentYear = dom.query(
                        By.css(HelperTestFunctions.CURRENT_YEAR_CSSCLASS),
                    );

                    expect(years.length).toEqual(15);
                    expect(currentYear.nativeElement.textContent.trim()).toMatch(
                        "2017",
                    );

                    UIInteractions.triggerKeyDownEvtUponElem(
                        "ArrowRight",
                        document.activeElement,
                    );
                    fixture.detectChanges();

                    currentYear = dom.query(
                        By.css(HelperTestFunctions.CURRENT_YEAR_CSSCLASS),
                    );
                    expect(currentYear.nativeElement.textContent.trim()).toMatch(
                        "2018",
                    );

                    UIInteractions.triggerKeyDownEvtUponElem(
                        "ArrowLeft",
                        document.activeElement,
                    );
                    UIInteractions.triggerKeyDownEvtUponElem(
                        "ArrowLeft",
                        document.activeElement,
                    );
                    fixture.detectChanges();

                    currentYear = dom.query(
                        By.css(HelperTestFunctions.CURRENT_YEAR_CSSCLASS),
                    );
                    expect(currentYear.nativeElement.textContent.trim()).toMatch(
                        "2016",
                    );

                    const previousValue =
                        fixture.componentInstance.calendar.viewDate;
                    spyOn(calendar.viewDateChanged, "emit").and.callThrough();

                    // Should open the year view
                    UIInteractions.triggerKeyDownEvtUponElem(
                        "Enter",
                        document.activeElement,
                    );

                    fixture.detectChanges();
                    tick();

                    const eventArgs: IViewDateChangeEventArgs = {
                        previousValue,
                        currentValue: fixture.componentInstance.calendar.viewDate,
                    };
                    expect(calendar.viewDateChanged.emit).toHaveBeenCalledTimes(1);
                    expect(calendar.viewDateChanged.emit).toHaveBeenCalledWith(
                        eventArgs,
                    );
                    expect(calendar.viewDate.getFullYear()).toEqual(2016);
                }));

                it("Should open months view, navigate through and select a month via KB.", fakeAsync(() => {
                    const month = dom.queryAll(
                        By.css(HelperTestFunctions.CALENDAR_DATE_CSSCLASS),
                    )[0];
                    month.nativeElement.focus();
                    spyOn(calendar.activeViewChanged, "emit").and.callThrough();

                    expect(month.nativeElement).toBe(document.activeElement);

                    UIInteractions.triggerKeyDownEvtUponElem(
                        "Enter",
                        document.activeElement,
                    );
                    fixture.detectChanges();
                    tick();

                    expect(calendar.activeViewChanged.emit).toHaveBeenCalledTimes(
                        1,
                    );
                    expect(calendar.activeViewChanged.emit).toHaveBeenCalledWith(
                        IgxCalendarView.Year,
                    );

                    const months = dom.queryAll(
                        By.css(HelperTestFunctions.MONTH_CSSCLASS),
                    );
                    const currentMonth = dom.query(
                        By.css(HelperTestFunctions.CURRENT_MONTH_CSSCLASS),
                    );

                    expect(months.length).toEqual(12);
                    expect(currentMonth.nativeElement.textContent.trim()).toMatch(
                        "June",
                    );

                    UIInteractions.triggerKeyDownEvtUponElem(
                        "Home",
                        document.activeElement,
                    );
                    fixture.detectChanges();

                    expect(document.activeElement.textContent.trim()).toMatch(
                        "January",
                    );

                    UIInteractions.triggerKeyDownEvtUponElem(
                        "End",
                        document.activeElement,
                    );
                    fixture.detectChanges();

                    expect(document.activeElement.textContent.trim()).toMatch(
                        "December",
                    );

                    UIInteractions.triggerKeyDownEvtUponElem(
                        "ArrowLeft",
                        document.activeElement,
                    );
                    fixture.detectChanges();

                    UIInteractions.triggerKeyDownEvtUponElem(
                        "ArrowUp",
                        document.activeElement,
                    );
                    fixture.detectChanges();

                    UIInteractions.triggerKeyDownEvtUponElem(
                        "ArrowRight",
                        document.activeElement,
                    );
                    fixture.detectChanges();

                    expect(document.activeElement.textContent.trim()).toMatch(
                        "September",
                    );

                    const previousValue =
                        fixture.componentInstance.calendar.viewDate;
                    spyOn(calendar.viewDateChanged, "emit").and.callThrough();

                    UIInteractions.triggerKeyDownEvtUponElem(
                        "Enter",
                        document.activeElement,
                    );
                    fixture.detectChanges();

                    tick();

                    const eventArgs: IViewDateChangeEventArgs = {
                        previousValue,
                        currentValue: fixture.componentInstance.calendar.viewDate,
                    };
                    expect(calendar.viewDateChanged.emit).toHaveBeenCalledTimes(1);
                    expect(calendar.viewDateChanged.emit).toHaveBeenCalledWith(
                        eventArgs,
                    );
                    expect(calendar.viewDate.getMonth()).toEqual(8);
                }));

                it('Should navigate to the first enabled date from the previous month when using "arrow up" key.', () => {
                    const dateRangeDescriptors: DateRangeDescriptor[] = [];
                    const specificDates = [
                        new Date(2017, 4, 25),
                        new Date(2017, 4, 11),
                    ];

                    dateRangeDescriptors.push({
                        type: DateRangeType.Specific,
                        dateRange: specificDates,
                    });

                    calendar.disabledDates = dateRangeDescriptors;
                    fixture.detectChanges();

                    const calendarNativeElement = dom.query(
                        By.css(HelperTestFunctions.CALENDAR_WRAPPER_CLASS),
                    ).nativeElement;
                    calendarNativeElement.focus();

                    UIInteractions.triggerKeyDownEvtUponElem(
                        "Home",
                        calendarNativeElement,
                    );
                    fixture.detectChanges();

                    UIInteractions.triggerKeyDownEvtUponElem(
                        "ArrowUp",
                        document.activeElement,
                    );
                    fixture.detectChanges();

                    let date = new Date(2017, 4, 18);
                    expect(calendar.activeDate).toEqual(date);

                    UIInteractions.triggerKeyDownEvtUponElem(
                        "ArrowUp",
                        document.activeElement,
                    );
                    fixture.detectChanges();

                    UIInteractions.triggerKeyDownEvtUponElem(
                        "ArrowUp",
                        document.activeElement,
                    );
                    fixture.detectChanges();

                    date = new Date(2017, 3, 27);
                    expect(calendar.activeDate).toEqual(date);
                });

                it('Should navigate to the first enabled date from the previous month when using "arrow left" key.', () => {
                    const dateRangeDescriptors: DateRangeDescriptor[] = [];
                    const specificDates = [
                        new Date(2017, 4, 27),
                        new Date(2017, 4, 25),
                    ];

                    dateRangeDescriptors.push({
                        type: DateRangeType.Specific,
                        dateRange: specificDates,
                    });

                    calendar.disabledDates = dateRangeDescriptors;
                    fixture.detectChanges();

                    const calendarNativeElement = dom.query(
                        By.css(HelperTestFunctions.CALENDAR_WRAPPER_CLASS),
                    ).nativeElement;
                    calendarNativeElement.focus();

                    UIInteractions.triggerKeyDownEvtUponElem(
                        "Home",
                        calendarNativeElement,
                    );
                    UIInteractions.triggerKeyDownEvtUponElem(
                        "ArrowLeft",
                        document.activeElement,
                    );
                    fixture.detectChanges();

                    UIInteractions.triggerKeyDownEvtUponElem(
                        "ArrowLeft",
                        document.activeElement,
                    );
                    UIInteractions.triggerKeyDownEvtUponElem(
                        "ArrowLeft",
                        document.activeElement,
                    );
                    UIInteractions.triggerKeyDownEvtUponElem(
                        "ArrowLeft",
                        document.activeElement,
                    );
                    UIInteractions.triggerKeyDownEvtUponElem(
                        "ArrowLeft",
                        document.activeElement,
                    );
                    fixture.detectChanges();

                    let date = new Date(2017, 4, 26);
                    expect(calendar.activeDate).toEqual(date);

                    UIInteractions.triggerKeyDownEvtUponElem(
                        "Home",
                        calendarNativeElement,
                    );
                    UIInteractions.triggerKeyDownEvtUponElem(
                        "ArrowLeft",
                        document.activeElement,
                    );
                    fixture.detectChanges();
                    UIInteractions.triggerKeyDownEvtUponElem(
                        "ArrowLeft",
                        document.activeElement,
                    );
                    fixture.detectChanges();

                    date = new Date(2017, 3, 29);
                    expect(date).toEqual(date);
                });

                it('Should navigate to the first enabled date from the next month when using "arrow down" key.', () => {
                    const dateRangeDescriptors: DateRangeDescriptor[] = [];
                    const specificDates = [
                        new Date(2017, 6, 14),
                        new Date(2017, 6, 28),
                    ];

                    dateRangeDescriptors.push({
                        type: DateRangeType.Specific,
                        dateRange: specificDates,
                    });

                    calendar.disabledDates = dateRangeDescriptors;
                    fixture.detectChanges();

                    const calendarNativeElement = dom.query(
                        By.css(HelperTestFunctions.CALENDAR_WRAPPER_CLASS),
                    ).nativeElement;
                    calendarNativeElement.focus();

                    UIInteractions.triggerKeyDownEvtUponElem(
                        "End",
                        calendarNativeElement,
                    );
                    UIInteractions.triggerKeyDownEvtUponElem(
                        "ArrowDown",
                        document.activeElement,
                    );
                    fixture.detectChanges();
                    UIInteractions.triggerKeyDownEvtUponElem(
                        "ArrowDown",
                        document.activeElement,
                    );
                    fixture.detectChanges();

                    let date = new Date(2017, 6, 21);
                    expect(calendar.activeDate).toEqual(date);

                    UIInteractions.triggerKeyDownEvtUponElem(
                        "ArrowDown",
                        document.activeElement,
                    );
                    fixture.detectChanges();
                    UIInteractions.triggerKeyDownEvtUponElem(
                        "ArrowDown",
                        document.activeElement,
                    );
                    fixture.detectChanges();

                    date = new Date(2017, 7, 11);
                    expect(calendar.activeDate).toEqual(date);
                });

                it('Should navigate to the first enabled date from the next month when using "arrow right" key.', () => {
                    const dateRangeDescriptors: DateRangeDescriptor[] = [];
                    const specificDates = [
                        new Date(2017, 6, 9),
                        new Date(2017, 6, 10),
                    ];

                    dateRangeDescriptors.push({
                        type: DateRangeType.Specific,
                        dateRange: specificDates,
                    });

                    calendar.disabledDates = dateRangeDescriptors;

                    const calendarNativeElement = dom.query(
                        By.css(HelperTestFunctions.CALENDAR_WRAPPER_CLASS),
                    ).nativeElement;
                    calendarNativeElement.focus();

                    UIInteractions.triggerKeyDownEvtUponElem(
                        "End",
                        calendarNativeElement,
                    );
                    UIInteractions.triggerKeyDownEvtUponElem(
                        "ArrowDown",
                        document.activeElement,
                    );
                    fixture.detectChanges();
                    UIInteractions.triggerKeyDownEvtUponElem(
                        "ArrowRight",
                        document.activeElement,
                    );
                    UIInteractions.triggerKeyDownEvtUponElem(
                        "ArrowRight",
                        document.activeElement,
                    );
                    fixture.detectChanges();

                    let date = new Date(2017, 6, 11);
                    expect(calendar.activeDate).toEqual(date);

                    calendar.activeDate = new Date(2017, 7, 5);
                    UIInteractions.triggerKeyDownEvtUponElem(
                        "ArrowRight",
                        document.activeElement,
                    );
                    fixture.detectChanges();

                    date = new Date(2017, 7, 6);
                    expect(calendar.activeDate).toEqual(date);
                });

                it("Should preserve the active date on (shift) pageup and pagedown.", () => {
                    const calendarNativeElement = dom.query(
                        By.css(HelperTestFunctions.CALENDAR_WRAPPER_CLASS),
                    ).nativeElement;
                    calendarNativeElement.focus();

                    UIInteractions.triggerKeyDownEvtUponElem(
                        "Home",
                        calendarNativeElement,
                    );

                    let date = new Date(2017, 5, 1);
                    expect(calendar.activeDate).toEqual(date);

                    UIInteractions.triggerKeyDownEvtUponElem(
                        "PageUp",
                        document.activeElement,
                    );
                    fixture.detectChanges();

                    date = new Date(2017, 4, 1);
                    expect(calendar.activeDate).toEqual(date);

                    UIInteractions.triggerKeyDownEvtUponElem(
                        "PageDown",
                        document.activeElement,
                    );
                    fixture.detectChanges();

                    date = new Date(2017, 5, 1);
                    expect(calendar.activeDate).toEqual(date);

                    UIInteractions.triggerKeyDownEvtUponElem(
                        "PageUp",
                        document.activeElement,
                        true,
                        false,
                        true,
                    );
                    fixture.detectChanges();

                    date = new Date(2016, 5, 1);
                    expect(calendar.activeDate).toEqual(date);

                    UIInteractions.triggerKeyDownEvtUponElem(
                        "PageDown",
                        document.activeElement,
                        true,
                        false,
                        true,
                    );
                    fixture.detectChanges();

                    date = new Date(2017, 5, 1);
                    expect(calendar.activeDate).toEqual(date);
                });
            });

        });

        describe("Continuous month increment/decrement - ", () => {
            let fixture: ComponentFixture<IgxCalendarSampleComponent>;
            let dom: DebugElement;
            let calendar: IgxCalendarComponent;
            let prevMonthBtn: HTMLElement;
            let nextMonthBtn: HTMLElement;

            beforeEach(waitForAsync(() => {
                TestBed.overrideProvider(LOCALE_ID, { useValue: "fr" });
                fixture = TestBed.createComponent(IgxCalendarSampleComponent);
                fixture.detectChanges();
                dom = fixture.debugElement;
                calendar = fixture.componentInstance.calendar;

                prevMonthBtn = dom.queryAll(
                    By.css(HelperTestFunctions.CALENDAR_PREV_BUTTON_CSSCLASS),
                )[0].nativeElement;
                nextMonthBtn = dom.queryAll(
                    By.css(HelperTestFunctions.CALENDAR_NEXT_BUTTON_CSSCLASS),
                )[0].nativeElement;
            }));

            it("Should increment/decrement months continuously on mousedown.", fakeAsync(() => {
                expect(calendar.viewDate.getMonth()).toEqual(5);
                // Have no idea how this test worked before,
                // changing expectation based on my udnerstanding of that the test does
                UIInteractions.simulateMouseEvent(
                    "mousedown",
                    prevMonthBtn,
                    0,
                    0,
                );
                tick();
                UIInteractions.simulateMouseEvent(
                    "mouseup",
                    prevMonthBtn,
                    0,
                    0,
                );
                fixture.detectChanges();
                expect(calendar.viewDate.getMonth()).toEqual(4);

                UIInteractions.simulateMouseEvent(
                    "mousedown",
                    nextMonthBtn,
                    0,
                    0,
                );
                tick();
                UIInteractions.simulateMouseEvent(
                    "mouseup",
                    nextMonthBtn,
                    0,
                    0,
                );
                fixture.detectChanges();
                flush();
                expect(calendar.viewDate.getMonth()).toEqual(5);
            }));

            it("Should increment/decrement months continuously on enter keydown.", fakeAsync(() => {
                expect(calendar.viewDate.getMonth()).toEqual(5);

                prevMonthBtn.focus();
                UIInteractions.triggerKeyDownEvtUponElem("Enter", prevMonthBtn);
                tick(100);
                fixture.detectChanges();
                expect(calendar.viewDate.getMonth()).toEqual(4);

                nextMonthBtn.focus();
                UIInteractions.triggerKeyDownEvtUponElem("Enter", nextMonthBtn);
                tick(100);
                fixture.detectChanges();
                expect(calendar.viewDate.getMonth()).toEqual(5);
            }));

            it("Should prioritize weekStart property over locale.", fakeAsync(() => {
                calendar.locale = "en";
                fixture.detectChanges();
                expect(calendar.weekStart).toEqual(0);

                calendar.weekStart = WEEKDAYS.FRIDAY;
                expect(calendar.weekStart).toEqual(5);

                calendar.locale = "fr";
                fixture.detectChanges();

                expect(calendar.weekStart).toEqual(5);
                flush();
            }));

            it("Should throw error when setting incorrect locale", fakeAsync(() => {
                let errorThrown;
                try {
                    calendar.locale = "frrr";
                    fixture.detectChanges();
                } catch(err) {
                    errorThrown = err;
                }

                expect(errorThrown).not.toBeUndefined();
                flush();
            }));

            it("Should setting the global LOCALE_ID, Calendar must be displayed per current locale.", fakeAsync(() => {
                // Verify locale is set respecting the globally LOCALE_ID provider
                expect(calendar.locale).toEqual("fr");

                // Verify Calendar is displayed per FR locale
                fixture.componentInstance.viewDate = new Date(2022, 5, 23);
                fixture.componentInstance.model = new Date();
                fixture.detectChanges();

                const defaultOptions = {
                    day: "numeric",
                    month: "long",
                    weekday: "narrow",
                    year: "numeric",
                };
                const defaultViews = { day: false, month: true, year: false };
                const bodyMonth = dom.query(
                    By.css(HelperTestFunctions.CALENDAR_DATE_CSSCLASS),
                );
                const headerYear = dom.query(
                    By.css(HelperTestFunctions.CALENDAR_HEADER_YEAR_CSSCLASS),
                );
                const bodyYear = dom.queryAll(
                    By.css(HelperTestFunctions.CALENDAR_DATE_CSSCLASS),
                )[1];
                const headerWeekday = dom.queryAll(
                    By.css(
                        `${HelperTestFunctions.CALENDAR_HEADER_DATE_CSSCLASS} span`,
                    ),
                )[0];
                const headerDate = dom.queryAll(
                    By.css(
                        `${HelperTestFunctions.CALENDAR_HEADER_DATE_CSSCLASS} span`,
                    ),
                )[1];

                calendar.selectDate(calendar.viewDate);
                fixture.detectChanges();

                expect(calendar.formatOptions).toEqual(
                    jasmine.objectContaining(defaultOptions),
                );
                expect(calendar.formatViews).toEqual(
                    jasmine.objectContaining(defaultViews),
                );
                expect(headerYear.nativeElement.textContent.trim()).toMatch(
                    "Select Date",
                );
                expect(headerWeekday.nativeElement.textContent.trim()).toMatch(
                    "mer",
                );
                expect(headerDate.nativeElement.textContent.trim()).toMatch(
                    "1 juin",
                );
                expect(bodyYear.nativeElement.textContent.trim()).toMatch(
                    "2022",
                );
                expect(bodyMonth.nativeElement.textContent.trim()).toMatch(
                    "juin",
                );

                flush();
            }));
        });

        describe("Views, templates and API - ", () => {
            let fixture: ComponentFixture<IgxCalendarSampleComponent>;
            let dom: DebugElement;
            let calendar: IgxCalendarComponent;

            const pageButton = (selector: string): HTMLElement =>
                dom.query(By.css(selector)).nativeElement;

            const clickPageButton = (selector: string) => {
                const button = pageButton(selector);
                UIInteractions.simulateMouseEvent("mousedown", button, 0, 0);
                UIInteractions.simulateMouseEvent("mouseup", button, 0, 0);
                fixture.detectChanges();
            };

            const currentMonthDays = () =>
                calendar.daysView.dates.filter((day) => day.isCurrentMonth);

            beforeEach(waitForAsync(() => {
                fixture = TestBed.createComponent(IgxCalendarSampleComponent);
                fixture.detectChanges();
                dom = fixture.debugElement;
                calendar = fixture.componentInstance.calendar;
            }));

            it("Should render custom header title, header and subheader templates", async () => {
                const templatesFixture = TestBed.createComponent(IgxCalendarTemplatesComponent);
                templatesFixture.detectChanges();
                await templatesFixture.whenStable();
                templatesFixture.detectChanges();

                const templatesDom = templatesFixture.debugElement;
                const templatesCalendar = templatesFixture.componentInstance.calendar;

                expect(templatesCalendar.headerTitleTemplate).not.toBeNull();
                expect(templatesCalendar.headerTemplate).not.toBeNull();
                expect(templatesCalendar.subheaderTemplate).not.toBeNull();

                const headerYear = templatesDom.query(By.css(HelperTestFunctions.CALENDAR_HEADER_YEAR_CSSCLASS));
                const headerDate = templatesDom.query(By.css(HelperTestFunctions.CALENDAR_HEADER_DATE_CSSCLASS));
                expect(headerYear.nativeElement.textContent.trim()).toBe("Title 2017");
                expect(headerDate.nativeElement.textContent.trim()).toBe("Header June");

                let subheaders = templatesDom.queryAll(By.css(".custom-subheader"));
                expect(subheaders.length).toBe(1);
                expect(subheaders[0].nativeElement.textContent.trim()).toBe("Subheader 2017");

                templatesCalendar.activeView = IgxCalendarView.Year;
                templatesFixture.detectChanges();

                subheaders = templatesDom.queryAll(By.css(".custom-subheader"));
                expect(subheaders.length).toBe(1);
                expect(subheaders[0].nativeElement.textContent.trim()).toBe("Subheader 2017");

                templatesCalendar.activeView = IgxCalendarView.Decade;
                templatesFixture.detectChanges();

                subheaders = templatesDom.queryAll(By.css(".custom-subheader"));
                expect(subheaders.length).toBe(1);
                expect(subheaders[0].nativeElement.textContent.trim()).toBe("Subheader 2017");
            });

            it("Should render the Date.getMonth() value in the month button and the months view when months are not formatted", () => {
                calendar.formatViews = { month: false };
                fixture.detectChanges();

                // June
                const monthButton = dom.query(By.css(HelperTestFunctions.CALENDAR_DATE_CSSCLASS));
                expect(monthButton.nativeElement.textContent.trim()).toBe("5");

                calendar.activeView = IgxCalendarView.Year;
                fixture.detectChanges();

                const months = dom.queryAll(By.css(HelperTestFunctions.MONTH_CSSCLASS));
                expect(months[0].nativeElement.textContent.trim()).toBe("0");
                expect(months[5].nativeElement.textContent.trim()).toBe("5");
            });

            it("Should expose the view date formatting context", () => {
                const context = calendar.context.$implicit as any;

                expect(context.date).toEqual(calendar.viewDate);
                expect(context.month.value).toBe("June");
                expect(context.year.value).toBe("2017");
            });

            it("Should navigate between years with the page buttons in the year view", () => {
                calendar.activeView = IgxCalendarView.Year;
                fixture.detectChanges();

                clickPageButton(HelperTestFunctions.CALENDAR_NEXT_BUTTON_CSSCLASS);
                expect(calendar.viewDate.getFullYear()).toBe(2018);
                expect(calendar.viewDate.getMonth()).toBe(5);

                clickPageButton(HelperTestFunctions.CALENDAR_PREV_BUTTON_CSSCLASS);
                clickPageButton(HelperTestFunctions.CALENDAR_PREV_BUTTON_CSSCLASS);
                expect(calendar.viewDate.getFullYear()).toBe(2016);
                expect(calendar.activeView).toBe(IgxCalendarView.Year);
            });

            it("Should navigate between decades with the page buttons in the decade view", () => {
                calendar.activeView = IgxCalendarView.Decade;
                fixture.detectChanges();

                clickPageButton(HelperTestFunctions.CALENDAR_NEXT_BUTTON_CSSCLASS);
                expect(calendar.viewDate.getFullYear()).toBe(2032);

                clickPageButton(HelperTestFunctions.CALENDAR_PREV_BUTTON_CSSCLASS);
                clickPageButton(HelperTestFunctions.CALENDAR_PREV_BUTTON_CSSCLASS);
                expect(calendar.viewDate.getFullYear()).toBe(2002);
                expect(calendar.activeView).toBe(IgxCalendarView.Decade);
            });

            it("Should ignore keyboard page requests opposite to the current scroll direction", () => {
                const initialViewDate = calendar.viewDate;

                calendar.pageScrollDirection = "next" as any;
                calendar.previousPage(true);
                expect(calendar.viewDate).toEqual(initialViewDate);

                calendar.pageScrollDirection = "prev" as any;
                calendar.nextPage(true);
                expect(calendar.viewDate).toEqual(initialViewDate);

                calendar.pageScrollDirection = "none" as any;
                calendar.nextPage(true);
                expect(calendar.viewDate.getMonth()).toBe(6);
            });

            it("Should move the active date to the new month when an activation key is released on a page button", fakeAsync(() => {
                const nextButton = pageButton(HelperTestFunctions.CALENDAR_NEXT_BUTTON_CSSCLASS);
                const isInViewMonth = () =>
                    calendar.activeDate.getFullYear() === calendar.viewDate.getFullYear() &&
                    calendar.activeDate.getMonth() === calendar.viewDate.getMonth();

                nextButton.focus();
                UIInteractions.triggerKeyDownEvtUponElem("Enter", nextButton);
                tick(100);
                fixture.detectChanges();

                expect(calendar.viewDate.getMonth()).toBe(6);
                // paging through the keyboard keeps the active date until the key is released
                expect(isInViewMonth()).toBe(false);

                nextButton.dispatchEvent(new KeyboardEvent("keyup", { key: "Enter", bubbles: true }));
                tick(100);
                fixture.detectChanges();

                expect(isInViewMonth()).toBe(true);
                expect(calendar.pageScrollDirection).toBe("none" as any);
                flush();
            }));

            it("Should move to the first and last year of the decade with Home and End", () => {
                calendar.activeView = IgxCalendarView.Decade;
                fixture.detectChanges();

                const wrapper = dom.query(By.css(HelperTestFunctions.CALENDAR_WRAPPER_CLASS)).nativeElement;
                wrapper.focus();
                fixture.detectChanges();

                const years = calendar.dacadeView.viewItems.toArray();

                UIInteractions.triggerKeyDownEvtUponElem("Home", wrapper);
                fixture.detectChanges();
                expect(calendar.dacadeView.date.getFullYear()).toBe(years.at(0).value.getFullYear());
                expect(years.at(0).nativeElement.classList).toContain("igx-calendar-view-item--selected");

                UIInteractions.triggerKeyDownEvtUponElem("End", wrapper);
                fixture.detectChanges();
                expect(calendar.dacadeView.date.getFullYear()).toBe(years.at(-1).value.getFullYear());
                expect(years.at(-1).nativeElement.classList).toContain("igx-calendar-view-item--selected");
            });

            it("Should update the view date when keyboard navigation leaves the months of the year view", () => {
                calendar.activeView = IgxCalendarView.Year;
                fixture.detectChanges();

                const wrapper = dom.query(By.css(HelperTestFunctions.CALENDAR_WRAPPER_CLASS)).nativeElement;
                wrapper.focus();
                fixture.detectChanges();

                UIInteractions.triggerKeyDownEvtUponElem("Home", wrapper);
                UIInteractions.triggerKeyDownEvtUponElem("ArrowLeft", wrapper);
                fixture.detectChanges();

                expect(calendar.viewDate.getFullYear()).toBe(2016);
                expect(calendar.monthsView.date.getFullYear()).toBe(2016);
                expect(calendar.monthsView.date.getMonth()).toBe(11);
            });

            it("Should update the view date when keyboard navigation leaves the years of the decade view", () => {
                calendar.activeView = IgxCalendarView.Decade;
                fixture.detectChanges();

                const wrapper = dom.query(By.css(HelperTestFunctions.CALENDAR_WRAPPER_CLASS)).nativeElement;
                wrapper.focus();
                fixture.detectChanges();

                const lastYear = calendar.dacadeView.viewItems.last.value.getFullYear();

                UIInteractions.triggerKeyDownEvtUponElem("End", wrapper);
                UIInteractions.triggerKeyDownEvtUponElem("ArrowRight", wrapper);
                fixture.detectChanges();

                expect(calendar.viewDate.getFullYear()).toBe(lastYear + 1);
                expect(calendar.dacadeView.date.getFullYear()).toBe(lastYear + 1);
            });

            it("Should merge custom resource strings with the default ones", () => {
                const nextButton = pageButton(HelperTestFunctions.CALENDAR_NEXT_BUTTON_CSSCLASS);
                const prevButton = pageButton(HelperTestFunctions.CALENDAR_PREV_BUTTON_CSSCLASS);
                const defaultNextLabel = nextButton.getAttribute("aria-label");
                const defaultNextYear = calendar.resourceStrings.igx_calendar_next_year;

                calendar.resourceStrings = { igx_calendar_previous_month: "Custom previous" };
                fixture.detectChanges();

                expect(calendar.resourceStrings.igx_calendar_previous_month).toBe("Custom previous");
                expect(calendar.resourceStrings.igx_calendar_next_year).toBe(defaultNextYear);
                expect(prevButton.getAttribute("aria-label")).toBe("Custom previous, May");
                expect(nextButton.getAttribute("aria-label")).toBe(defaultNextLabel);
            });

            it("Should format a list of years with formattedYears", () => {
                const years = [new Date(2017, 5, 13), new Date(2020, 0, 1)] as unknown as Date;

                expect(calendar.formattedYears(years)).toBe("2017 - 2020");

                calendar.formatOptions = { year: "2-digit" };
                calendar.formatViews = { year: true };

                expect(calendar.formattedYears(years)).toBe("17 - 20");
            });

            it("Should ignore arrays passed as a view date", () => {
                const initialViewDate = calendar.viewDate;

                calendar.viewDate = [new Date(2020, 0, 1)] as any;
                fixture.detectChanges();

                expect(calendar.viewDate).toEqual(initialViewDate);
            });

            it("Should select and deselect dates passed as ISO strings", () => {
                calendar.selectDate("2017-06-20");
                fixture.detectChanges();

                expect((calendar.value as Date).toDateString()).toBe(new Date(2017, 5, 20).toDateString());

                calendar.deselectDate("2017-06-20");
                fixture.detectChanges();

                expect(calendar.value).toBeUndefined();
            });

            it("Should check disabled dates passed as ISO strings", () => {
                expect(calendar.isDateDisabled("2017-06-24")).toBe(false);

                const disabledFixture = TestBed.createComponent(IgxCalendarDisabledSpecialDatesComponent);
                disabledFixture.detectChanges();
                const disabledCalendar = disabledFixture.componentInstance.calendar;

                expect(disabledCalendar.isDateDisabled("2017-06-24")).toBe(true);
                expect(disabledCalendar.isDateDisabled("2017-06-20")).toBe(false);
            });

            it("Should select a range picked from the end date backwards", () => {
                calendar.selection = "range";
                fixture.detectChanges();

                const days = currentMonthDays();
                UIInteractions.simulateClickAndSelectEvent(days[14].nativeElement.firstChild);
                UIInteractions.simulateClickAndSelectEvent(days[12].nativeElement.firstChild);
                fixture.detectChanges();

                const value = calendar.value as Date[];
                expect(value.length).toBe(3);
                expect(value[0].toDateString()).toBe(new Date(2017, 5, 13).toDateString());
                expect(value.at(-1).toDateString()).toBe(new Date(2017, 5, 15).toDateString());
            });

            it("Should toggle the range start when the same date is shift clicked", () => {
                calendar.selection = "range";
                fixture.detectChanges();

                const june13th = currentMonthDays()[12].nativeElement.firstChild;

                UIInteractions.simulateClickAndSelectEvent(june13th);
                fixture.detectChanges();
                expect((calendar.value as Date[]).length).toBe(1);

                UIInteractions.simulateClickAndSelectEvent(june13th, true);
                fixture.detectChanges();
                expect((calendar.value as Date[]).length).toBe(0);

                UIInteractions.simulateClickAndSelectEvent(june13th, true);
                fixture.detectChanges();
                expect((calendar.value as Date[]).length).toBe(1);
                expect((calendar.value as Date[])[0].toDateString()).toBe(new Date(2017, 5, 13).toDateString());
            });

            it("Should complete a started range with shift click in both directions", () => {
                calendar.selection = "range";
                fixture.detectChanges();

                let days = currentMonthDays();
                UIInteractions.simulateClickAndSelectEvent(days[12].nativeElement.firstChild);
                UIInteractions.simulateClickAndSelectEvent(days[16].nativeElement.firstChild, true);
                fixture.detectChanges();

                let value = calendar.value as Date[];
                expect(value.length).toBe(5);
                expect(value[0].toDateString()).toBe(new Date(2017, 5, 13).toDateString());
                expect(value.at(-1).toDateString()).toBe(new Date(2017, 5, 17).toDateString());

                calendar.deselectDate();
                fixture.detectChanges();

                days = currentMonthDays();
                UIInteractions.simulateClickAndSelectEvent(days[12].nativeElement.firstChild);
                UIInteractions.simulateClickAndSelectEvent(days[9].nativeElement.firstChild, true);
                fixture.detectChanges();

                value = calendar.value as Date[];
                expect(value.length).toBe(4);
                expect(value[0].toDateString()).toBe(new Date(2017, 5, 10).toDateString());
                expect(value.at(-1).toDateString()).toBe(new Date(2017, 5, 13).toDateString());
            });

            it("Should preview the range while hovering dates after the range start is picked", () => {
                calendar.selection = "range";
                fixture.detectChanges();

                const days = currentMonthDays();
                const inner = (index: number) => days[index].nativeElement.firstChild as HTMLElement;
                const classes = (index: number) => days[index].nativeElement.classList as DOMTokenList;
                const hover = (index: number) => {
                    inner(index).dispatchEvent(new MouseEvent("mouseenter"));
                    fixture.detectChanges();
                };
                const leave = (index: number) => {
                    inner(index).dispatchEvent(new MouseEvent("mouseleave"));
                    fixture.detectChanges();
                };

                // June 13th starts the range
                UIInteractions.simulateClickAndSelectEvent(inner(12));
                fixture.detectChanges();

                // preview forwards to June 17th
                hover(16);
                expect(calendar.daysView.previewRangeDate.toDateString()).toBe(new Date(2017, 5, 17).toDateString());
                expect(classes(12)).toContain("igx-day-item--first");
                expect(classes(16)).toContain("igx-day-item--last");
                for (const index of [13, 14, 15, 16]) {
                    expect(classes(index)).toContain("igx-day-item--range-preview");
                }
                expect(classes(17)).not.toContain("igx-day-item--range-preview");
                expect(days[16].nativeElement.getAttribute("aria-label"))
                    .toBe(`${new Date(2017, 5, 17).toDateString()}, ${calendar.resourceStrings.igx_calendar_range_end}`);

                leave(16);
                expect(calendar.daysView.previewRangeDate).toBeUndefined();
                expect(classes(16)).not.toContain("igx-day-item--range-preview");
                expect(classes(16)).not.toContain("igx-day-item--last");

                // preview backwards to June 10th
                hover(9);
                expect(classes(9)).toContain("igx-day-item--first");
                expect(classes(12)).toContain("igx-day-item--last");
                expect(classes(10)).toContain("igx-day-item--range-preview");
                expect(days[9].nativeElement.getAttribute("aria-label"))
                    .toBe(`${new Date(2017, 5, 10).toDateString()}, ${calendar.resourceStrings.igx_calendar_range_start}`);

                // hovering the range start itself does not preview a range
                leave(9);
                hover(12);
                expect(calendar.daysView.previewRangeDate).toBeUndefined();
            });

            it("Should ignore empty values passed to selectDate", async () => {
                await fixture.whenStable();
                const initialValue = calendar.value;
                spyOn(calendar.selected, "emit");

                calendar.selectDate(null);
                calendar.selectDate(undefined);
                calendar.selectDate([]);
                fixture.detectChanges();

                expect(calendar.value).toEqual(initialValue);
                expect(fixture.componentInstance.model).toEqual(new Date(2017, 5, 13));
                expect(calendar.selected.emit).not.toHaveBeenCalled();
            });

            it("Should do nothing when deselecting with no selected dates", () => {
                const rangeFixture = TestBed.createComponent(IgxCalendarRangeComponent);
                rangeFixture.detectChanges();
                const rangeCalendar = rangeFixture.componentInstance.calendar;

                const initialValue = rangeCalendar.value;
                expect(initialValue ?? []).toEqual([]);

                expect(() => rangeCalendar.deselectDate(new Date(2017, 5, 13))).not.toThrow();
                expect(() => rangeCalendar.deselectDate()).not.toThrow();
                expect(rangeCalendar.value).toEqual(initialValue);
            });

            it("Should show the month of the earliest date when a range value is bound without a view date", () => {
                const rangeFixture = TestBed.createComponent(IgxCalendarRangeValueComponent);
                rangeFixture.detectChanges();
                const rangeCalendar = rangeFixture.componentInstance.calendar;

                expect(rangeCalendar.viewDate.getFullYear()).toBe(2018);
                expect(rangeCalendar.viewDate.getMonth()).toBe(2);
                const value = rangeCalendar.value as Date[];
                expect(value[0]).toEqual(new Date(2018, 2, 5));
                expect(value.at(-1)).toEqual(new Date(2018, 3, 20));
            });

            it("Should keep custom resource strings when the global locale changes", () => {
                const initialLocale = getCurrentI18n();
                calendar.resourceStrings = { igx_calendar_previous_month: "Custom previous" };
                fixture.detectChanges();

                try {
                    setCurrentI18n("fr");
                    fixture.detectChanges();

                    expect(calendar.resourceStrings.igx_calendar_previous_month).toBe("Custom previous");
                    expect(pageButton(HelperTestFunctions.CALENDAR_PREV_BUTTON_CSSCLASS).getAttribute("aria-label"))
                        .toMatch(/^Custom previous, /);
                } finally {
                    setCurrentI18n(initialLocale);
                }
            });

            it("Should keep the range when deselecting only empty values", () => {
                calendar.selection = "range";
                calendar.selectDate([new Date(2017, 5, 13), new Date(2017, 5, 15)]);
                fixture.detectChanges();

                calendar.deselectDate([null]);
                fixture.detectChanges();

                expect((calendar.value as Date[]).length).toBe(3);
            });

            it("Should follow the global locale when no locale is set", () => {
                const initialLocale = getCurrentI18n();
                calendar.activeView = IgxCalendarView.Year;
                fixture.detectChanges();

                try {
                    setCurrentI18n("fr");
                    fixture.detectChanges();

                    expect(calendar.locale).toBe("fr");
                    expect(calendar.weekStart).toBe(WEEKDAYS.MONDAY);
                } finally {
                    setCurrentI18n(initialLocale);
                }

                fixture.detectChanges();
                expect(calendar.locale).toBe(initialLocale);
            });

            it("Should keep an explicitly set locale when the global locale changes", () => {
                const initialLocale = getCurrentI18n();
                calendar.locale = "en";
                fixture.detectChanges();

                try {
                    setCurrentI18n("fr");
                    fixture.detectChanges();

                    expect(calendar.locale).toBe("en");
                    expect(calendar.weekStart).toBe(WEEKDAYS.SUNDAY);
                } finally {
                    setCurrentI18n(initialLocale);
                }
            });
        });
    });
});

@Component({
    template: `
        <igx-calendar [viewDate]="viewDate" [(ngModel)]="model"></igx-calendar>
    `,
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [IgxCalendarComponent, FormsModule]
})
export class IgxCalendarSampleComponent {
    @ViewChild(IgxCalendarComponent, { static: true })
    public calendar: IgxCalendarComponent;
    public model: Date | Date[] = new Date(2017, 5, 13);
    public viewDate = new Date(2017, 5, 13);
}

@Component({
    template: `
        <igx-calendar [viewDate]="viewDate" selection="range"></igx-calendar>
    `,
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [IgxCalendarComponent]
})
export class IgxCalendarRangeComponent {
    @ViewChild(IgxCalendarComponent, { static: true })
    public calendar: IgxCalendarComponent;
    public viewDate = new Date(2017, 5, 13);
}

@Component({
    template: `
        <igx-calendar
            [viewDate]="viewDate"
            [(ngModel)]="model"
            [disabledDates]="disabledDates"
            [specialDates]="specialDates"
        >
        </igx-calendar>
    `,
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [IgxCalendarComponent, FormsModule]
})
export class IgxCalendarDisabledSpecialDatesComponent {
    @ViewChild(IgxCalendarComponent, { static: true })
    public calendar: IgxCalendarComponent;
    public model: Date | Date[] = new Date(2017, 5, 23);
    public viewDate = new Date(2017, 5, 13);
    public specialDates = [
        {
            type: DateRangeType.Between,
            dateRange: [new Date(2017, 5, 1), new Date(2017, 5, 6)],
        },
    ];
    public disabledDates = [
        {
            type: DateRangeType.Between,
            dateRange: [new Date(2017, 5, 23), new Date(2017, 5, 29)],
        },
    ];
}

@Component({
    template: ` <igx-calendar [value]="value"></igx-calendar> `,
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [IgxCalendarComponent]
})
export class IgxCalendarValueComponent {
    @ViewChild(IgxCalendarComponent, { static: true })
    public calendar: IgxCalendarComponent;
    public value = new Date(2020, 7, 13);
}

@Component({
    template: `
        <igx-calendar [viewDate]="viewDate" [(ngModel)]="model">
            <ng-template igxCalendarHeaderTitle let-format>
                <span class="custom-header-title">Title {{ format.year.value }}</span>
            </ng-template>
            <ng-template igxCalendarHeader let-format>
                <span class="custom-header">Header {{ format.month.value }}</span>
            </ng-template>
            <ng-template igxCalendarSubheader let-format>
                <span class="custom-subheader">Subheader {{ format.date.getFullYear() }}</span>
            </ng-template>
        </igx-calendar>
    `,
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [
        IgxCalendarComponent,
        IgxCalendarHeaderTitleTemplateDirective,
        IgxCalendarHeaderTemplateDirective,
        IgxCalendarSubheaderTemplateDirective,
        FormsModule
    ]
})
export class IgxCalendarTemplatesComponent {
    @ViewChild(IgxCalendarComponent, { static: true })
    public calendar: IgxCalendarComponent;
    public model = new Date(2017, 5, 13);
    public viewDate = new Date(2017, 5, 13);
}

@Component({
    template: `<igx-calendar selection="range" [value]="value"></igx-calendar>`,
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [IgxCalendarComponent]
})
export class IgxCalendarRangeValueComponent {
    @ViewChild(IgxCalendarComponent, { static: true })
    public calendar: IgxCalendarComponent;
    public value = [new Date(2018, 3, 20), new Date(2018, 2, 5)];
}

class DateTester {
    // tests whether a date is disabled or not
    public static testDatesAvailability(
        dates: IgxDayItemComponent[],
        disabled: boolean,
    ) {
        for (const day of dates) {
            expect(day.isDisabled).toBe(
                disabled,
                day.date.native.toLocaleDateString() + " is not disabled",
            );
            expect(day.isDisabledCSS).toBe(
                disabled,
                day.date.native.toLocaleDateString() +
                    " is not with disabled style",
            );
        }
    }

    // tests whether a dates is special or not
    public static testDatesSpeciality(
        dates: IgxDayItemComponent[],
        special: boolean,
    ): void {
        for (const date of dates) {
            if (!date.isInactive) {
                expect(date.isSpecial).toBe(special);
            }
        }
    }
}

type assignDateRangeDescriptors = (
    component: IgxCalendarComponent,
    dateRangeDescriptors: DateRangeDescriptor[],
) => void;
type testDatesRange = (
    inRange: IgxDayItemComponent[],
    outOfRange: IgxDayItemComponent[],
) => void;

class DateRangesPropertiesTester {
    public static testAfter(
        assignFunc: assignDateRangeDescriptors,
        testRangesFunc: testDatesRange,
    ) {
        const fixture = TestBed.createComponent(IgxCalendarSampleComponent);
        const calendar = fixture.componentInstance.calendar;
        const dateRangeDescriptors: DateRangeDescriptor[] = [];
        const afterDate = new Date(2017, 5, 13);
        const afterDateRangeDescriptor: DateRangeDescriptor = {
            type: DateRangeType.After,
            dateRange: [afterDate],
        };
        dateRangeDescriptors.push(afterDateRangeDescriptor);
        assignFunc(calendar, dateRangeDescriptors);
        fixture.detectChanges();

        const dates = calendar.daysView.dates.toArray();
        const inRangeDates = dates.filter(
            (d) => getDate(d).getTime() > afterDate.getTime(),
        );
        const outOfRangeDates = dates.filter(
            (d) => getDate(d).getTime() <= afterDate.getTime(),
        );
        testRangesFunc(inRangeDates, outOfRangeDates);
    }

    public static testBefore(
        assignFunc: assignDateRangeDescriptors,
        testRangesFunc: testDatesRange,
    ) {
        const fixture = TestBed.createComponent(IgxCalendarSampleComponent);
        const calendar = fixture.componentInstance.calendar;
        const dateRangeDescriptors: DateRangeDescriptor[] = [];
        const beforeDate = new Date(2017, 5, 13);
        const beforeDateRangeDescriptor: DateRangeDescriptor = {
            type: DateRangeType.Before,
            dateRange: [beforeDate],
        };
        dateRangeDescriptors.push(beforeDateRangeDescriptor);
        assignFunc(calendar, dateRangeDescriptors);
        fixture.detectChanges();

        const dates = calendar.daysView.dates.toArray();
        const inRangeDates = dates.filter(
            (d) => getDate(d).getTime() < beforeDate.getTime(),
        );
        const outOfRangeDates = dates.filter(
            (d) => getDate(d).getTime() >= beforeDate.getTime(),
        );
        testRangesFunc(inRangeDates, outOfRangeDates);
    }

    public static testBetweenWithMinDateFirst(
        assignFunc: assignDateRangeDescriptors,
        testRangesFunc: testDatesRange,
    ) {
        this.testBetween(
            assignFunc,
            testRangesFunc,
            new Date(2017, 5, 13),
            new Date(2017, 5, 20),
        );
    }

    public static testBetweenWithMaxDateFirst(
        assignFunc: assignDateRangeDescriptors,
        testRangesFunc: testDatesRange,
    ) {
        this.testBetween(
            assignFunc,
            testRangesFunc,
            new Date(2017, 5, 20),
            new Date(2017, 5, 13),
        );
    }

    public static testBetweenWithMinMaxTheSame(
        assignFunc: assignDateRangeDescriptors,
        testRangesFunc: testDatesRange,
    ) {
        this.testBetween(
            assignFunc,
            testRangesFunc,
            new Date(2017, 5, 20),
            new Date(2017, 5, 20),
        );
    }

    public static testSpecific(
        assignFunc: assignDateRangeDescriptors,
        testRangesFunc: testDatesRange,
    ) {
        const fixture = TestBed.createComponent(IgxCalendarSampleComponent);
        const calendar = fixture.componentInstance.calendar;
        const dateRangeDescriptors: DateRangeDescriptor[] = [];
        const specificDates = [
            new Date(2017, 5, 1),
            new Date(2017, 5, 10),
            new Date(2017, 5, 20),
            new Date(2017, 5, 21),
            new Date(2017, 5, 22),
        ];
        dateRangeDescriptors.push({
            type: DateRangeType.Specific,
            dateRange: specificDates,
        });
        assignFunc(calendar, dateRangeDescriptors);
        fixture.detectChanges();

        const specificDatesSet = new Set<number>();
        specificDates.map((d) => specificDatesSet.add(d.getTime()));
        const dates = calendar.daysView.dates.toArray();
        const inRangeDates = dates.filter((d) =>
            specificDatesSet.has(getDate(d).getTime()),
        );
        const outOfRangeDates = dates.filter(
            (d) => !specificDatesSet.has(getDate(d).getTime()),
        );
        testRangesFunc(inRangeDates, outOfRangeDates);
    }

    public static testWeekdays(
        assignFunc: assignDateRangeDescriptors,
        testRangesFunc: testDatesRange,
    ) {
        const fixture = TestBed.createComponent(IgxCalendarSampleComponent);
        const calendar = fixture.componentInstance.calendar;
        const dateRangeDescriptors: DateRangeDescriptor[] = [
            { type: DateRangeType.Weekdays },
        ];
        assignFunc(calendar, dateRangeDescriptors);
        fixture.detectChanges();

        const dates = calendar.daysView.dates.toArray();
        const inRangeDates = dates.filter(
            (d) => d.date.day !== 0 && d.date.day !== 6,
        );
        const outOfRangeDates = dates.filter(
            (d) => d.date.day === 0 || d.date.day === 6,
        );
        testRangesFunc(inRangeDates, outOfRangeDates);
    }

    public static testWeekends(
        assignFunc: assignDateRangeDescriptors,
        testRangesFunc: testDatesRange,
    ) {
        const fixture = TestBed.createComponent(IgxCalendarSampleComponent);
        const calendar = fixture.componentInstance.calendar;
        const dateRangeDescriptors: DateRangeDescriptor[] = [
            { type: DateRangeType.Weekends },
        ];
        assignFunc(calendar, dateRangeDescriptors);
        fixture.detectChanges();

        const dates = calendar.daysView.dates.toArray();
        const inRangeDates = dates.filter(
            (d) => d.date.day === 0 || d.date.day === 6,
        );
        const outOfRangeDates = dates.filter(
            (d) => d.date.day !== 0 && d.date.day !== 6,
        );
        testRangesFunc(inRangeDates, outOfRangeDates);
    }

    public static testOverlappingBetweens(
        assignFunc: assignDateRangeDescriptors,
        testRangesFunc: testDatesRange,
    ) {
        const fixture = TestBed.createComponent(IgxCalendarSampleComponent);
        const calendar = fixture.componentInstance.calendar;
        const dateRangeDescriptors: DateRangeDescriptor[] = [];
        const firstBetweenMin = new Date(2017, 5, 5);
        const firstBetweenMax = new Date(2017, 5, 10);
        const secondBetweenMin = new Date(2017, 5, 7);
        const secondBetweenMax = new Date(2017, 5, 15);
        dateRangeDescriptors.push({
            type: DateRangeType.Between,
            dateRange: [firstBetweenMin, firstBetweenMax],
        });
        dateRangeDescriptors.push({
            type: DateRangeType.Between,
            dateRange: [secondBetweenMin, secondBetweenMax],
        });
        assignFunc(calendar, dateRangeDescriptors);
        fixture.detectChanges();

        const dates = calendar.daysView.dates.toArray();
        const inRangeDates = dates.filter(
            (d) =>
                getDate(d).getTime() >= firstBetweenMin.getTime() &&
                getDate(d).getTime() <= secondBetweenMax.getTime(),
        );
        const outOfRangeDates = dates.filter(
            (d) =>
                getDate(d).getTime() < firstBetweenMin.getTime() &&
                getDate(d).getTime() > secondBetweenMax.getTime(),
        );
        testRangesFunc(inRangeDates, outOfRangeDates);
    }

    public static testMultipleRanges(
        assignFunc: assignDateRangeDescriptors,
        testRangesFunc: testDatesRange,
    ) {
        const fixture = TestBed.createComponent(IgxCalendarSampleComponent);
        const calendar = fixture.componentInstance.calendar;
        const dateRangeDescriptors: DateRangeDescriptor[] = [];
        dateRangeDescriptors.push({
            type: DateRangeType.Before,
            dateRange: [new Date(2017, 5, 1)],
        });
        dateRangeDescriptors.push({
            type: DateRangeType.After,
            dateRange: [new Date(2017, 5, 29)],
        });
        dateRangeDescriptors.push({ type: DateRangeType.Weekends });
        dateRangeDescriptors.push({
            type: DateRangeType.Between,
            dateRange: [new Date(2017, 5, 1), new Date(2017, 5, 16)],
        });
        dateRangeDescriptors.push({
            type: DateRangeType.Between,
            dateRange: [new Date(2017, 5, 5), new Date(2017, 5, 28)],
        });
        assignFunc(calendar, dateRangeDescriptors);
        fixture.detectChanges();

        const dates = calendar.daysView.dates.toArray();
        const enabledDateTime = new Date(2017, 5, 29).getTime();
        const inRangesDates = dates.filter(
            (d) => getDate(d).getTime() !== enabledDateTime,
        );
        const outOfRangeDates = dates.filter(
            (d) => getDate(d).getTime() === enabledDateTime,
        );
        testRangesFunc(inRangesDates, outOfRangeDates);
    }

    public static testRangeUpdateRuntime(
        assignFunc: assignDateRangeDescriptors,
        testRangesFunc: testDatesRange,
    ) {
        const fixture = TestBed.createComponent(IgxCalendarSampleComponent);
        const calendar = fixture.componentInstance.calendar;
        const dateRangeDescriptors: DateRangeDescriptor[] = [];
        const specificDate = new Date(2017, 5, 15);
        dateRangeDescriptors.push({
            type: DateRangeType.Specific,
            dateRange: [specificDate],
        });
        assignFunc(calendar, dateRangeDescriptors);
        fixture.detectChanges();

        const dates = calendar.daysView.dates.toArray();
        let inRangesDates = dates.filter(
            (d) => getDate(d).getTime() === specificDate.getTime(),
        );
        let outOfRangesDates = dates.filter(
            (d) => getDate(d).getTime() !== specificDate.getTime(),
        );
        testRangesFunc(inRangesDates, outOfRangesDates);

        const newSpecificDate = new Date(2017, 5, 16);
        const newDateRangeDescriptors: DateRangeDescriptor[] = [];
        newDateRangeDescriptors.push({
            type: DateRangeType.Specific,
            dateRange: [newSpecificDate],
        });
        assignFunc(calendar, newDateRangeDescriptors);
        fixture.detectChanges();

        inRangesDates = dates.filter(
            (d) => getDate(d).getTime() === newSpecificDate.getTime(),
        );
        outOfRangesDates = dates.filter(
            (d) => getDate(d).getTime() !== newSpecificDate.getTime(),
        );
        testRangesFunc(inRangesDates, outOfRangesDates);
    }

    public static testPreviousMonthRange(
        assignFunc: assignDateRangeDescriptors,
        testRangesFunc: testDatesRange,
    ) {
        const fixture = TestBed.createComponent(IgxCalendarSampleComponent);
        const calendar = fixture.componentInstance.calendar;
        const dateRangeDescriptors: DateRangeDescriptor[] = [];
        const beforeDate = new Date(2017, 5, 13);

        dateRangeDescriptors.push({
            type: DateRangeType.Before,
            dateRange: [beforeDate],
        });
        assignFunc(calendar, dateRangeDescriptors);
        fixture.detectChanges();

        const debugEl = fixture.debugElement;

        const component = debugEl.query(
            By.css(HelperTestFunctions.CALENDAR_WRAPPER_CLASS),
        );

        UIInteractions.triggerKeyDownEvtUponElem(
            "PageUp",
            component.nativeElement,
        );

        fixture.detectChanges();
        testRangesFunc(calendar.daysView.dates.toArray(), []);
    }

    public static assignDisableDatesDescriptors(
        component: IgxCalendarComponent,
        dateRangeDescriptors: DateRangeDescriptor[],
    ) {
        component.disabledDates = dateRangeDescriptors;
    }

    public static testDisabledDates(
        inRange: IgxDayItemComponent[],
        outOfRange: IgxDayItemComponent[],
    ) {
        DateTester.testDatesAvailability(inRange, true);
        DateTester.testDatesAvailability(outOfRange, false);
    }

    public static assignSpecialDatesDescriptors(
        component: IgxCalendarComponent,
        dateRangeDescriptors: DateRangeDescriptor[],
    ) {
        component.specialDates = dateRangeDescriptors;
    }

    public static testSpecialDates(
        inRange: IgxDayItemComponent[],
        outOfRange: IgxDayItemComponent[],
    ) {
        DateTester.testDatesSpeciality(inRange, true);
        DateTester.testDatesSpeciality(outOfRange, false);
    }

    private static testBetween(
        assignFunc: assignDateRangeDescriptors,
        testRangesFunc: testDatesRange,
        firstDate: Date,
        secondDate: Date,
    ) {
        const fixture = TestBed.createComponent(IgxCalendarSampleComponent);
        const calendar = fixture.componentInstance.calendar;
        const dateRangeDescriptors: DateRangeDescriptor[] = [];
        const betweenMin =
            firstDate.getTime() > secondDate.getTime() ? secondDate : firstDate;
        const betweenMax =
            firstDate.getTime() > secondDate.getTime() ? firstDate : secondDate;
        dateRangeDescriptors.push({
            type: DateRangeType.Between,
            dateRange: [betweenMax, betweenMin],
        });
        assignFunc(calendar, dateRangeDescriptors);
        fixture.detectChanges();

        const dates = calendar.daysView.dates.toArray();
        const inRangeDates = dates.filter(
            (d) =>
                getDate(d).getTime() >= betweenMin.getTime() &&
                getDate(d).getTime() <= betweenMax.getTime(),
        );
        const outOfRangeDates = dates.filter(
            (d) =>
                getDate(d).getTime() < betweenMin.getTime() &&
                getDate(d).getTime() > betweenMax.getTime(),
        );
        testRangesFunc(inRangeDates, outOfRangeDates);
    }
}

const getDate = ({ date: day }: IgxDayItemComponent) => {
    return new Date(day.year, day.month, day.date);
};
