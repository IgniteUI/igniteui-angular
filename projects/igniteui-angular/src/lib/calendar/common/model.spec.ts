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

            // First week of 2024 (ISO 8601 - January 1, 2024 is Monday, so Week 1)
            expect(firstOfJan.week).toEqual(1);

            // Test week numbering with different week starts (all using ISO 8601 logic)
            expect(firstOfJan.getWeekNumber(1)).toEqual(1); // Monday start
            expect(firstOfJan.getWeekNumber(0)).toEqual(1); // Sunday start

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

    describe("Week numbering (ISO 8601)", () => {
        it("should correctly calculate week numbers for January 2025", () => {
            // January 1, 2025 is a Wednesday
            const jan1_2025 = new CalendarDay({ year: 2025, month: 0, date: 1 });
            expect(jan1_2025.day).toEqual(3); // Wednesday

            // Monday start (ISO 8601 standard)
            expect(jan1_2025.getWeekNumber(1)).toEqual(1); // Week 1 contains Jan 1

            // Sunday start
            expect(jan1_2025.getWeekNumber(0)).toEqual(1); // Still Week 1 with Sunday start
        });

        it("should correctly handle year boundaries", () => {
            // January 1, 2026 is a Thursday
            const jan1_2026 = new CalendarDay({ year: 2026, month: 0, date: 1 });
            expect(jan1_2026.day).toEqual(4); // Thursday

            // In ISO 8601, Jan 1 (Thursday) is Week 1 because January 4th
            // (which is always in Week 1) falls on Sunday, so the Thursday
            // of that week (Jan 1) belongs to Week 1
            const actualWeek = jan1_2026.getWeekNumber(1);
            expect(actualWeek).toEqual(1); // Week 1 of 2026
        });

        it("should handle dates belonging to previous year's last week", () => {
            // Test a case where early January dates belong to previous year
            // January 1, 2027 is a Friday
            const jan1_2027 = new CalendarDay({ year: 2027, month: 0, date: 1 });
            expect(jan1_2027.day).toEqual(5); // Friday

            // In ISO 8601, Jan 1 (Friday) belongs to last week of previous year
            // because the first Thursday (which determines Week 1) is Jan 7
            const actualWeek = jan1_2027.getWeekNumber(1);
            expect(actualWeek).toBeGreaterThan(50); // Should be Week 52 or 53 of 2026
        });

        it("should work correctly with custom week starts", () => {
            const testDate = new CalendarDay({ year: 2024, month: 2, date: 15 }); // March 15, 2024 (Friday)

            // Test different week start days
            const mondayStart = testDate.getWeekNumber(1);
            const tuesdayStart = testDate.getWeekNumber(2);
            const wednesdayStart = testDate.getWeekNumber(3);
            const thursdayStart = testDate.getWeekNumber(4);
            const fridayStart = testDate.getWeekNumber(5);
            const saturdayStart = testDate.getWeekNumber(6);
            const sundayStart = testDate.getWeekNumber(0);

            // All should be valid week numbers (positive integers)
            expect(mondayStart).toBeGreaterThan(0);
            expect(tuesdayStart).toBeGreaterThan(0);
            expect(wednesdayStart).toBeGreaterThan(0);
            expect(thursdayStart).toBeGreaterThan(0);
            expect(fridayStart).toBeGreaterThan(0);
            expect(saturdayStart).toBeGreaterThan(0);
            expect(sundayStart).toBeGreaterThan(0);
        });

        it("should maintain ISO 8601 logic regardless of week start", () => {
            // The first Thursday of the year determines Week 1
            // January 4, 2024 is a Thursday
            const jan4_2024 = new CalendarDay({ year: 2024, month: 0, date: 4 });
            expect(jan4_2024.day).toEqual(4); // Thursday

            // This Thursday should always be in Week 1, regardless of week start
            expect(jan4_2024.getWeekNumber(0)).toEqual(1); // Sunday start
            expect(jan4_2024.getWeekNumber(1)).toEqual(1); // Monday start
            expect(jan4_2024.getWeekNumber(2)).toEqual(1); // Tuesday start
            expect(jan4_2024.getWeekNumber(3)).toEqual(1); // Wednesday start
            expect(jan4_2024.getWeekNumber(4)).toEqual(1); // Thursday start
            expect(jan4_2024.getWeekNumber(5)).toEqual(1); // Friday start
            expect(jan4_2024.getWeekNumber(6)).toEqual(1); // Saturday start
        });

        it("should handle December dates that might belong to next year's Week 1", () => {
            // December 30, 2024 is a Monday
            const dec30_2024 = new CalendarDay({ year: 2024, month: 11, date: 30 });
            expect(dec30_2024.day).toEqual(1); // Monday

            // This should be Week 1 of 2025 in ISO 8601
            expect(dec30_2024.getWeekNumber(1)).toEqual(1); // Week 1 of 2025
            expect(dec30_2024.getWeekNumber(0)).toEqual(1); // Week 1 of 2025
        });

        it("should default to Monday start when no parameter provided", () => {
            const testDate = new CalendarDay({ year: 2024, month: 0, date: 1 });

            // Should default to Monday start (ISO 8601 standard)
            expect(testDate.getWeekNumber()).toEqual(testDate.getWeekNumber(1));
            expect(testDate.week).toEqual(testDate.getWeekNumber(1));
        });

        it("should handle leap years correctly", () => {
            // Test February 29, 2024 (leap year)
            const feb29_2024 = new CalendarDay({ year: 2024, month: 1, date: 29 });
            expect(feb29_2024.day).toEqual(4); // Thursday

            // Should calculate week number correctly for leap year date
            const weekNumber = feb29_2024.getWeekNumber(1);
            expect(weekNumber).toBeGreaterThan(0);
            expect(weekNumber).toBeLessThan(54); // Valid week range
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
