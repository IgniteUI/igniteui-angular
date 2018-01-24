import { Component, ViewChild } from "@angular/core";
import { async, fakeAsync, TestBed, tick } from "@angular/core/testing";
import { FormsModule } from "@angular/forms";
import { By } from "@angular/platform-browser";
import { BrowserAnimationsModule} from "@angular/platform-browser/animations";
import { Calendar, isLeap, monthRange, weekDay, WEEKDAYS } from "./calendar";
import { IgxCalendarComponent, IgxCalendarModule } from "./calendar.component";

describe("IgxCalendar", () => {
    beforeEach(
        async(() => {
            TestBed.configureTestingModule({
                declarations: [IgxCalendarRenderingComponent],
                imports: [IgxCalendarModule, FormsModule, BrowserAnimationsModule]
            }).compileComponents();
        })
    );

    // Calendar Model Tests
    it("Calendar Model API", () => {
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

    it("Calendar Model utility functions", () => {
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
            calendar.timedelta(startDate, "week", 1).toDateString()
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

    it("Initialize a calendar component", () => {
        const fixture = TestBed.createComponent(IgxCalendarRenderingComponent);
        fixture.detectChanges();

        expect(fixture.componentInstance).toBeDefined();
    });

    it("@Input properties and setters", () => {
        const fixture = TestBed.createComponent(IgxCalendarRenderingComponent);
        fixture.detectChanges();

        const calendar = fixture.componentInstance.calendar;

        expect(calendar.weekStart).toEqual(WEEKDAYS.SUNDAY);
        expect(calendar.selection).toEqual("single");

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

        expect(() => (calendar.selection = "non-existant")).toThrow();
    });

    it("Calendar DOM structure", () => {
        const fixture = TestBed.createComponent(IgxCalendarRenderingComponent);
        fixture.detectChanges();

        const calendar = fixture.componentInstance.calendar;
        const today = new Date(Date.now());
        calendar.viewDate = today;
        fixture.detectChanges();
        const dom = fixture.debugElement;
        const calendarRows = dom.queryAll(By.css(".igx-calendar__body-row"));

        // 6 weeks + week header
        expect(calendarRows.length).toEqual(7);

        // 7 calendar rows * 7 elements in each
        expect(
            dom.queryAll(By.css(".igx-calendar__body-row > span")).length
        ).toEqual(49);

        // Today class applied
        expect(
            dom
                .query(By.css(".igx-calendar__date--current"))
                .nativeElement.textContent.trim()
        ).toMatch(today.getDate().toString());

        // Hide calendar header when not single selection
        calendar.selection = "multi";
        fixture.detectChanges();

        const calendarHeader = dom.query(By.css(".igx-calendar__header"));
        expect(calendarHeader).toBeFalsy();
    });

    it("Calendar DOM strucutre - year view | month view", () => {
        const fixture = TestBed.createComponent(
                IgxCalendarRenderingComponent
            );
        fixture.detectChanges();

        const calendar = fixture.componentInstance.calendar;
        const dom = fixture.debugElement;

        const collection = dom.queryAll(By.css(".date__el"));
        const monthButton = collection[0];
        const yearButton = collection[1];

        monthButton.triggerEventHandler("click", {});
        fixture.detectChanges();

        expect(dom.query(By.css(".igx-calendar__body-row--wrap"))).toBeDefined();
        const months = dom.queryAll(By.css(".igx-calendar__month"));
        const currentMonth = dom.query(By.css(".igx-calendar__month--current"));

        expect(months.length).toEqual(11);
        expect(currentMonth.nativeElement.textContent.trim()).toMatch("Jun");

        months[0].parent.triggerEventHandler("click", { target: months[0].nativeElement });
        fixture.detectChanges();

        expect(calendar.viewDate.getMonth()).toEqual(0);

        yearButton.triggerEventHandler("click", {});
        fixture.detectChanges();

        expect(dom.query(By.css(".igx-calendar__body-column"))).toBeDefined();
        const years = dom.queryAll(By.css(".igx-calendar__year"));
        const currentYear = dom.query(By.css(".igx-calendar__year--current"));

        expect(years.length).toEqual(10);
        expect(currentYear.nativeElement.textContent.trim()).toMatch("2017");

        years[0].parent.triggerEventHandler("click", { target: years[0].nativeElement });
        fixture.detectChanges();

        expect(calendar.viewDate.getFullYear()).toEqual(2012);
    });

    it(
        "Calendar selection - single with event",
        fakeAsync(() => {
            const fixture = TestBed.createComponent(
                IgxCalendarRenderingComponent
            );
            fixture.detectChanges();
            tick();
            fixture.detectChanges();

            const calendar = fixture.componentInstance.calendar;
            const dom = fixture.debugElement;

            const target = dom.query(By.css(".igx-calendar__date--selected"));
            const weekDiv = target.parent;
            const weekDays = weekDiv.queryAll(By.css("span"));
            const nextDay = new Date(2017, 5, 14);

            expect((calendar.value as Date).toDateString()).toMatch(
                new Date(2017, 5, 13).toDateString()
            );

            spyOn(calendar.onSelection, "emit");

            // Fire on the div representing the week as events fired on the children don't bubble up the tree
            // Select 14th
            weekDiv.triggerEventHandler("click", {
                target: weekDays[3].nativeElement
            });

            fixture.detectChanges();

            expect(calendar.onSelection.emit).toHaveBeenCalled();
            expect((calendar.value as Date).toDateString()).toMatch(
                nextDay.toDateString()
            );
            expect(
                weekDays[3].nativeElement.classList.contains(
                    "igx-calendar__date--selected"
                )
            ).toBe(true);
            expect(
                (fixture.componentInstance.model as Date).toDateString()
            ).toMatch(nextDay.toDateString());
            expect(
                target.nativeElement.classList.contains(
                    "igx-calendar__date--selected"
                )
            ).toBe(false);
        })
    );

    it(
        "Calendar selection - outside of current month - 1",
        fakeAsync(() => {
            const fixture = TestBed.createComponent(
                IgxCalendarRenderingComponent
            );
            fixture.detectChanges();
            tick();
            fixture.detectChanges();

            const calendar = fixture.componentInstance.calendar;
            const dom = fixture.debugElement;

            const parent = dom.query(
                By.css(".igx-calendar__body-row:last-child")
            );
            const target = parent.queryAll(By.css("span")).pop();

            parent.triggerEventHandler("click", {
                target: target.nativeElement
            });
            fixture.detectChanges();

            expect(
                (fixture.componentInstance.model as Date).toDateString()
            ).toMatch(new Date(2017, 6, 8).toDateString());
            expect(
                dom
                    .query(By.css(".igx-calendar__header-date"))
                    .nativeElement.textContent.includes("Jul")
            ).toBe(true);
        })
    );

    it(
        "Calendar selection - outside of current month - 2",
        fakeAsync(() => {
            const fixture = TestBed.createComponent(
                IgxCalendarRenderingComponent
            );
            fixture.detectChanges();
            tick();
            fixture.detectChanges();

            const calendar = fixture.componentInstance.calendar;
            const dom = fixture.debugElement;

            const parent = dom.queryAll(By.css(".igx-calendar__body-row"))[1];
            const target = parent.queryAll(By.css("span")).shift();

            parent.triggerEventHandler("click", {
                target: target.nativeElement
            });
            fixture.detectChanges();

            expect(
                (fixture.componentInstance.model as Date).toDateString()
            ).toMatch(new Date(2017, 4, 28).toDateString());
            expect(
                dom
                    .query(By.css(".igx-calendar__header-date"))
                    .nativeElement.textContent.includes("May")
            ).toBe(true);
        })
    );

    it(
        "Calendar selection - single through API",
        fakeAsync(() => {
            const fixture = TestBed.createComponent(
                IgxCalendarRenderingComponent
            );
            fixture.detectChanges();
            tick();
            fixture.detectChanges();

            const calendar = fixture.componentInstance.calendar;
            const dom = fixture.debugElement;

            const target = dom.query(By.css(".igx-calendar__date--selected"));
            const weekDiv = target.parent;
            const weekDays = weekDiv.queryAll(By.css("span"));
            const nextDay = new Date(2017, 5, 14);

            expect((calendar.value as Date).toDateString()).toMatch(
                new Date(2017, 5, 13).toDateString()
            );

            spyOn(calendar.onSelection, "emit");

            calendar.selectDate(new Date(2017, 5, 14));
            fixture.detectChanges();

            expect(calendar.onSelection.emit).toHaveBeenCalled();
            expect((calendar.value as Date).toDateString()).toMatch(
                nextDay.toDateString()
            );
            expect(
                weekDays[3].nativeElement.classList.contains(
                    "igx-calendar__date--selected"
                )
            ).toBe(true);
            expect(
                (fixture.componentInstance.model as Date).toDateString()
            ).toMatch(nextDay.toDateString());
            expect(
                target.nativeElement.classList.contains(
                    "igx-calendar__date--selected"
                )
            ).toBe(false);
        })
    );

    it(
        "Calendar selection - multiple with event",
        fakeAsync(() => {
            const fixture = TestBed.createComponent(
                IgxCalendarRenderingComponent
            );
            fixture.detectChanges();
            tick();
            fixture.detectChanges();

            const calendar = fixture.componentInstance.calendar;
            const dom = fixture.debugElement;

            const target = dom.query(By.css(".igx-calendar__date--selected"));
            const weekDiv = target.parent;
            const weekDays = weekDiv.queryAll(By.css("span"));

            calendar.selection = "multi";
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
                weekDiv.triggerEventHandler("click", {
                    target: el.nativeElement
                });
                fixture.detectChanges();
            });

            expect((calendar.value as Date[]).length).toEqual(7);
            expect((fixture.componentInstance.model as Date[]).length).toEqual(
                7
            );
            weekDays.forEach((el) => {
                expect(
                    el.nativeElement.classList.contains(
                        "igx-calendar__date--selected"
                    )
                ).toBe(true);
            });

            // Deselect last day
            weekDiv.triggerEventHandler("click", {
                target: weekDays[weekDays.length - 1].nativeElement
            });
            fixture.detectChanges();

            expect((calendar.value as Date[]).length).toEqual(6);
            expect((fixture.componentInstance.model as Date[]).length).toEqual(
                6
            );
            expect(
                weekDays[weekDays.length - 1].nativeElement.classList.contains(
                    "igx-calendar__date--selected"
                )
            ).toBe(false);
        })
    );

    it(
        "Calendar selection - multiple through API",
        fakeAsync(() => {
            const fixture = TestBed.createComponent(
                IgxCalendarRenderingComponent
            );
            fixture.detectChanges();
            tick();
            fixture.detectChanges();

            const calendar = fixture.componentInstance.calendar;
            const dom = fixture.debugElement;

            const target = dom.query(By.css(".igx-calendar__date--selected"));
            const weekDiv = target.parent;
            const weekDays = weekDiv.queryAll(By.css("span"));

            calendar.selection = "multi";
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
                    "igx-calendar__date--selected"
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
                    "igx-calendar__date--selected"
                )
            ).toBe(true);
            // 12th June
            expect(
                weekDays[1].nativeElement.classList.contains(
                    "igx-calendar__date--selected"
                )
            ).toBe(true);

            // TODO: Multiple dates deselect on overlapping
        })
    );

    it(
        "Calendar selection - range with event",
        fakeAsync(() => {
            const fixture = TestBed.createComponent(
                IgxCalendarRenderingComponent
            );
            fixture.detectChanges();
            tick();
            fixture.detectChanges();

            const calendar = fixture.componentInstance.calendar;
            const dom = fixture.debugElement;

            const target = dom.query(By.css(".igx-calendar__date--selected"));
            const weekDiv = target.parent;
            const weekDays = weekDiv.queryAll(By.css("span"));

            calendar.selection = "range";
            fixture.detectChanges();

            const lastDay = new Date(2017, 5, 17);
            const firstDay = new Date(2017, 5, 11);

            // Toggle range selection...
            weekDiv.triggerEventHandler("click", {
                target: weekDays[0].nativeElement
            });
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
                    "igx-calendar__date--selected"
                )
            ).toBe(true);

            // ...and cancel it
            weekDiv.triggerEventHandler("click", {
                target: weekDays[0].nativeElement
            });
            fixture.detectChanges();

            expect((fixture.componentInstance.model as Date[]).length).toEqual(
                0
            );
            expect((calendar.value as Date[]).length).toEqual(0);
            expect(
                weekDays[0].nativeElement.classList.contains(
                    "igx-calendar__date--selected"
                )
            ).toBe(false);

            // Toggle range selection...
            weekDiv.triggerEventHandler("click", {
                target: weekDays[0].nativeElement
            });
            fixture.detectChanges();

            // ...and complete it
            weekDiv.triggerEventHandler("click", {
                target: weekDays[weekDays.length - 1].nativeElement
            });
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
                        "igx-calendar__date--selected"
                    )
                ).toBe(true);
            });
        })
    );

    it(
        "Calendar selection - range through API",
        fakeAsync(() => {
            const fixture = TestBed.createComponent(
                IgxCalendarRenderingComponent
            );
            fixture.detectChanges();
            tick();
            fixture.detectChanges();

            const calendar = fixture.componentInstance.calendar;
            const dom = fixture.debugElement;

            const target = dom.query(By.css(".igx-calendar__date--selected"));
            const weekDiv = target.parent;
            const weekDays = weekDiv.queryAll(By.css("span"));

            calendar.selection = "range";
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
                        "igx-calendar__date--selected"
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
                        "igx-calendar__date--selected"
                    )
                ).toBe(true);
            }
        })
    );

    it("Calendar keyboard navigation - PageUp/PageDown", fakeAsync(() => {
        const fixture = TestBed.createComponent(
            IgxCalendarRenderingComponent
        );
        fixture.detectChanges();
        tick();
        fixture.detectChanges();

        const calendar = fixture.componentInstance.calendar;
        const dom = fixture.debugElement;
        const component = dom.query(By.css(".igx-calendar"));

        let args: KeyboardEventInit = { key: "PageUp", bubbles: true };

        component.triggerEventHandler("keydown", new KeyboardEvent("keydown", args));
        fixture.detectChanges();

        expect(calendar.viewDate.getMonth()).toEqual(4);

        calendar.viewDate = new Date(2017, 5, 13);
        fixture.detectChanges();

        args = { key: "PageDown", bubbles: true };

        component.triggerEventHandler("keydown", new KeyboardEvent("keydown", args));
        fixture.detectChanges();

        expect(calendar.viewDate.getMonth()).toEqual(6);

        args = { key: "PageUp", bubbles: true, shiftKey: true };

        component.triggerEventHandler("keydown", new KeyboardEvent("keydown", args));
        fixture.detectChanges();

        expect(calendar.viewDate.getFullYear()).toEqual(2016);

        calendar.viewDate = new Date(2017, 5, 13);
        fixture.detectChanges();

        args = { key: "PageDown", bubbles: true, shiftKey: true };

        component.triggerEventHandler("keydown", new KeyboardEvent("keydown", args));
        fixture.detectChanges();

        expect(calendar.viewDate.getFullYear()).toEqual(2018);
    }));

    it("Calendar keyboard navigation - Home/End/Enter", fakeAsync(() => {
        const fixture = TestBed.createComponent(
            IgxCalendarRenderingComponent
        );
        fixture.detectChanges();
        tick();
        fixture.detectChanges();

        const calendar = fixture.componentInstance.calendar;
        const dom = fixture.debugElement;
        const component = dom.query(By.css(".igx-calendar"));

        let args: KeyboardEventInit = { key: "Home", bubbles: true };

        const days = dom.queryAll(By.css("[data-curmonth]"));
        const firstDay = days[0];
        const lastDay = days[days.length - 1];

        component.triggerEventHandler("keydown", new KeyboardEvent("keydown", args));
        fixture.detectChanges();

        expect(document.activeElement.textContent).toMatch(firstDay.nativeElement.textContent);
        expect(document.activeElement.textContent.trim()).toMatch("1");

        args = { key: "End", bubbles: true };

        component.triggerEventHandler("keydown", new KeyboardEvent("keydown", args));
        fixture.detectChanges();

        expect(document.activeElement.textContent).toMatch(lastDay.nativeElement.textContent);
        expect(document.activeElement.textContent.trim()).toMatch("30");

        args = { key: "Enter", bubbles: true };

        firstDay.nativeElement.dispatchEvent(new KeyboardEvent("keydown", args));
        fixture.detectChanges();

        expect((calendar.value as Date).toDateString()).toMatch(new Date(2017, 5, 1).toDateString());
    }));

    it("Calendar keyboard navigation - Arrow keys", fakeAsync(() => {
        const fixture = TestBed.createComponent(
            IgxCalendarRenderingComponent
        );
        fixture.detectChanges();
        tick();
        fixture.detectChanges();

        const calendar = fixture.componentInstance.calendar;
        const dom = fixture.debugElement;
        const component = dom.query(By.css(".igx-calendar"));

        let args: KeyboardEventInit = { key: "Home", bubbles: true };

        const days = dom.queryAll(By.css("[data-curmonth]"));
        const firstDay = days[0];

        component.triggerEventHandler("keydown", new KeyboardEvent("keydown", args));
        fixture.detectChanges();

        expect(document.activeElement.textContent).toMatch(firstDay.nativeElement.textContent);
        expect(document.activeElement.textContent.trim()).toMatch("1");

        args = { key: "ArrowDown", bubbles: true };

        document.activeElement.dispatchEvent(new KeyboardEvent("keydown", args));
        fixture.detectChanges();

        expect(document.activeElement.textContent.trim()).toMatch("8");

        args = { key: "ArrowLeft", bubbles: true };

        document.activeElement.dispatchEvent(new KeyboardEvent("keydown", args));
        fixture.detectChanges();

        expect(document.activeElement.textContent.trim()).toMatch("7");

        args = { key: "ArrowRight", bubbles: true };

        document.activeElement.dispatchEvent(new KeyboardEvent("keydown", args));
        fixture.detectChanges();

        expect(document.activeElement.textContent.trim()).toMatch("8");

        args = { key: "ArrowUp", bubbles: true };

        document.activeElement.dispatchEvent(new KeyboardEvent("keydown", args));
        fixture.detectChanges();

        expect(document.activeElement.textContent.trim()).toMatch("1");

    }));
});

@Component({
    template: `
        <igx-calendar [viewDate]="viewDate" [(ngModel)]="model"></igx-calendar>
    `
})
export class IgxCalendarRenderingComponent {
    public model: Date | Date[] = new Date(2017, 5, 13);
    public viewDate = new Date(2017, 5, 13);
    @ViewChild(IgxCalendarComponent) public calendar: IgxCalendarComponent;
}
