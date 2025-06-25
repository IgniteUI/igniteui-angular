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

            // Test week numbering with different week starts
            expect(firstOfJan.getWeekNumber(1)).toEqual(1); // Monday start (ISO 8601)
            expect(firstOfJan.getWeekNumber(0)).toBeGreaterThan(50); // Sunday start (belongs to prev year)

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

    describe("Week numbering", () => {
        it("should use ISO 8601 for Monday start and simple counting for others", () => {
            // January 1, 2025 is a Wednesday
            const jan1_2025 = new CalendarDay({ year: 2025, month: 0, date: 1 });
            expect(jan1_2025.day).toEqual(3); // Wednesday

            // Monday start: Uses ISO 8601 standard
            expect(jan1_2025.getWeekNumber(1)).toEqual(1); // Week 1 contains Jan 1

            // Sunday start: Uses simple counting - Jan 1 (Wed) belongs to prev year
            expect(jan1_2025.getWeekNumber(0)).toBeGreaterThan(50); // Week 52 of 2024
        });

        it("should handle ISO 8601 year boundaries for Monday start", () => {
            // January 1, 2026 is a Thursday
            const jan1_2026 = new CalendarDay({ year: 2026, month: 0, date: 1 });
            expect(jan1_2026.day).toEqual(4); // Thursday

            // Monday start: ISO 8601 logic applies
            expect(jan1_2026.getWeekNumber(1)).toEqual(1); // Week 1 of 2026
        });

        it("should handle previous year's last week for Monday start", () => {
            // January 1, 2027 is a Friday
            const jan1_2027 = new CalendarDay({ year: 2027, month: 0, date: 1 });
            expect(jan1_2027.day).toEqual(5); // Friday

            // Monday start: ISO 8601 logic - belongs to previous year
            const actualWeek = jan1_2027.getWeekNumber(1);
            expect(actualWeek).toBeGreaterThan(50); // Should be Week 52 or 53 of 2026
        });

        it("should work correctly with custom week starts using appropriate logic", () => {
            const testDate = new CalendarDay({ year: 2024, month: 2, date: 15 }); // March 15, 2024 (Friday)

            // Test different week start days
            const mondayStart = testDate.getWeekNumber(1);     // ISO 8601
            const tuesdayStart = testDate.getWeekNumber(2);    // Simple counting
            const wednesdayStart = testDate.getWeekNumber(3);  // Simple counting
            const thursdayStart = testDate.getWeekNumber(4);   // Simple counting
            const fridayStart = testDate.getWeekNumber(5);     // Simple counting
            const saturdayStart = testDate.getWeekNumber(6);   // Simple counting
            const sundayStart = testDate.getWeekNumber(0);     // Simple counting

            // All should be valid week numbers (positive integers)
            expect(mondayStart).toBeGreaterThan(0);
            expect(tuesdayStart).toBeGreaterThan(0);
            expect(wednesdayStart).toBeGreaterThan(0);
            expect(thursdayStart).toBeGreaterThan(0);
            expect(fridayStart).toBeGreaterThan(0);
            expect(saturdayStart).toBeGreaterThan(0);
            expect(sundayStart).toBeGreaterThan(0);
        });

        it("should apply ISO 8601 logic only for Monday start", () => {
            // January 4, 2024 is a Thursday - always Week 1 in ISO 8601
            const jan4_2024 = new CalendarDay({ year: 2024, month: 0, date: 4 });
            expect(jan4_2024.day).toEqual(4); // Thursday

            // Only Monday start uses ISO 8601
            expect(jan4_2024.getWeekNumber(1)).toEqual(1); // Monday start: ISO 8601

            // Other starts use simple counting, so results may vary
            const sundayWeek = jan4_2024.getWeekNumber(0);
            const tuesdayWeek = jan4_2024.getWeekNumber(2);
            expect(sundayWeek).toBeGreaterThan(0);
            expect(tuesdayWeek).toBeGreaterThan(0);
        });

        it("should handle December dates that belong to next year's Week 1 for Monday start", () => {
            // December 30, 2024 is a Monday
            const dec30_2024 = new CalendarDay({ year: 2024, month: 11, date: 30 });
            expect(dec30_2024.day).toEqual(1); // Monday

            // Monday start: This should be Week 1 of 2025 in ISO 8601
            expect(dec30_2024.getWeekNumber(1)).toEqual(1); // Week 1 of 2025
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

        it("should correctly handle the January 2024 Sunday start case", () => {
            // January 1, 2024 is a Monday, with Sunday start (0)
            const jan1_2024 = new CalendarDay({ year: 2024, month: 0, date: 1 });
            const jan7_2024 = new CalendarDay({ year: 2024, month: 0, date: 7 }); // Sunday
            const jan8_2024 = new CalendarDay({ year: 2024, month: 0, date: 8 }); // Monday

            expect(jan1_2024.day).toEqual(1); // Monday
            expect(jan7_2024.day).toEqual(0); // Sunday
            expect(jan8_2024.day).toEqual(1); // Monday

            // With Sunday start, Jan 1 should be in previous year's last week
            expect(jan1_2024.getWeekNumber(0)).toBeGreaterThan(50); // Week 53 of 2023

            // Jan 7 (first Sunday) should be Week 1
            expect(jan7_2024.getWeekNumber(0)).toEqual(1);

            // Jan 8 should also be Week 1 (same week as Jan 7)
            expect(jan8_2024.getWeekNumber(0)).toEqual(1);
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
