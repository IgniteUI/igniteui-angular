import { calendarRange, isDateInRanges } from "./helpers";
import { CalendarDay } from "./model";
import { DateRangeType } from "./types";

export function first<T>(arr: T[]) {
    return arr.at(0) as T;
}

export function last<T>(arr: T[]) {
    return arr.at(-1) as T;
}

describe("Calendar Day Model", () => {
    let start = new CalendarDay({ year: 1987, month: 6, date: 17 });

    describe("Basic API", () => {
        const firstOfJan = new CalendarDay({ year: 2024, month: 0, date: 1 });

        it("has correct properties", () => {
            const { year, month, date } = firstOfJan;
            expect([year, month, date]).toEqual([2024, 0, 1]);

            // First week of 2024
            expect(firstOfJan.week).toEqual(1);

            // 2024/01/01 is a Monday
            expect(firstOfJan.day).toEqual(1);
            expect(firstOfJan.weekend).toBeFalse();
        });

        it("comparators", () => {
            const today = CalendarDay.today;

            expect(today.greaterThan(firstOfJan)).toBeTrue();
            expect(firstOfJan.lessThan(today)).toBeTrue();
            expect(today.equalTo(new Date(Date.now())));
        });

        describe("Deltas", () => {
            it("day", () => {
                expect(firstOfJan.add("day", 0).equalTo(firstOfJan)).toBeTrue();
                expect(firstOfJan.add("day", 1).greaterThan(firstOfJan)).toBeTrue();
                expect(firstOfJan.add("day", -1).lessThan(firstOfJan)).toBeTrue();
            });

            it("quarters", () => {
                expect(firstOfJan.add("quarter", 0).equalTo(firstOfJan)).toBeTrue();
                const nextQ = firstOfJan.add("quarter", 1);
                expect(nextQ.month).toEqual(3);
                const prevQ = firstOfJan.add("quarter", -1);
                expect(prevQ.year).toEqual(2023);
                expect(prevQ.month).toEqual(9);
            });
        });

        it("`replace` correctly takes into account invalid time shifts", () => {
            const leapFebruary = new CalendarDay({
                year: 2024,
                month: 1,
                date: 29,
            });
            const nonLeapFebruary = leapFebruary.set({ year: 2023 });
            let { year, month, date } = nonLeapFebruary;

            // Shift to first day of next month -> 2024/03/01
            expect([year, month, date]).toEqual([2023, 2, 1]);

            const lastDayOfJuly = new CalendarDay({
                year: 2024,
                month: 6,
                date: 31,
            });

            const lastDayOfApril = lastDayOfJuly.set({ month: 3 });
            ({ year, month, date } = lastDayOfApril);

            // April does not have 31 days so shift to first day of May
            expect([year, month, date]).toEqual([2024, 4, 1]);
        });
    });

    describe("Date ranges", () => {
        start = new CalendarDay({ year: 2024, month: 0, date: 11 });
        const endFuture = start.add("day", 7);
        const endPast = start.add("day", -7);
        const end = 7;

        it("generating date ranges (positive number)", () => {
            const weekFuture = Array.from(calendarRange({ start, end }));

            expect(weekFuture.length).toEqual(end);

            expect(first(weekFuture).date).toEqual(start.date);
            expect(last(weekFuture).date).toEqual(endFuture.date - 1);
        });

        it("generating date ranges (negative number)", () => {
            const weekPast = Array.from(calendarRange({ start, end: -end }));

            expect(weekPast.length).toEqual(end);

            expect(first(weekPast).date).toEqual(start.date);
            expect(last(weekPast).date).toEqual(endPast.date + 1);
        });

        it("generating date ranges (end > start)", () => {
            const weekFuture = Array.from(
                calendarRange({ start, end: endFuture }),
            );

            expect(weekFuture.length).toEqual(end);

            expect(first(weekFuture).date).toEqual(start.date);
            expect(last(weekFuture).date).toEqual(endFuture.date - 1);
        });

        it("generating date ranges (end < start)", () => {
            const weekPast = Array.from(calendarRange({ start, end: endPast }));

            expect(weekPast.length).toEqual(end);

            expect(first(weekPast).date).toEqual(start.date);
            expect(last(weekPast).date).toEqual(endPast.date + 1);
        });
    });

    describe("Month generation", () => {
        it("works", () => {
            // const old = new Calendar(0);
            // const oldMonth = old.monthdates(1987, 6, true);
            // const newMonth = Array.from(generateFullMonth(start, 0));
        });
    });

    describe("DateRange descriptors", () => {
        const dayBefore = start.add("day", -1).native;
        const dayAfter = start.add("day", 1).native;
        const [begin, end] = [
            start.add("week", -1).native,
            start.add("week", 1).native,
        ];

        it("After", () => {
            expect(
                isDateInRanges(start, [
                    { type: DateRangeType.After, dateRange: [dayBefore] },
                ]),
            ).toBeTrue();
        });

        it("Before", () => {
            expect(
                isDateInRanges(start, [
                    { type: DateRangeType.Before, dateRange: [dayAfter] },
                ]),
            ).toBeTrue();
        });

        it("Between", () => {
            expect(
                isDateInRanges(start, [
                    {
                        type: DateRangeType.Between,
                        dateRange: [begin, end],
                    },
                ]),
            ).toBeTrue();
        });

        it("Specific", () => {
            expect(
                isDateInRanges(start, [
                    {
                        type: DateRangeType.Specific,
                        dateRange: [],
                    },
                ]),
            ).toBeFalse();
        });

        it("Weekday", () => {
            expect(
                isDateInRanges(start, [{ type: DateRangeType.Weekdays }]),
            ).toBeTrue();
        });

        it("Weekends", () => {
            expect(
                isDateInRanges(start, [
                    {
                        type: DateRangeType.Weekends,
                    },
                ]),
            ).toBeFalse();
        });
    });
});
