import { DateRangeType } from "../../core/dates/dateRange";
import {
    areSameMonth,
    getNextActiveDate,
    getPreviousActiveDate,
    getClosestActiveDate,
    isNextMonth,
    isPreviousMonth,
    calendarRange,
    isDateInRanges,
    generateMonth,
    getYearRange,
    formatToParts,
} from "./helpers";
import { CalendarDay } from "./model";

describe("Calendar Helpers", () => {
    const date = new Date(2020, 0, 1);
    const disabledDates = [
        {
            type: DateRangeType.Between,
            dateRange: [date, new Date(2020, 0, 14)],
        },
    ];

    it("should report if two dates are in the same month", () => {
        const firstDate = new Date(2020, 0, 2);
        const secondDate = new Date(2020, 1, 31);
        expect(areSameMonth(date, firstDate)).toBe(true);
        expect(areSameMonth(date, secondDate)).toBe(false);
    });

    it("should report if a date is in the next month", () => {
        const firstDate = new Date(2020, 0, 2);
        const secondDate = new Date(2019, 11, 31);

        expect(isNextMonth(date, firstDate)).toBe(false);
        expect(isNextMonth(date, secondDate)).toBe(true);
    });

    it("should report if a date is in the previous month", () => {
        const firstDate = new Date(2020, 0, 2);
        const secondDate = new Date(2019, 11, 31);

        expect(isPreviousMonth(secondDate, date)).toBe(true);
        expect(isPreviousMonth(firstDate, date)).toBe(false);
    });

    it("should get the next date for a given range", () => {
        const nextDate = getNextActiveDate(
            CalendarDay.from(date),
            disabledDates,
        );

        expect(nextDate.native).toEqual(new Date(2020, 0, 15));
    });

    it("should get the previous date for a given range", () => {
        const nextDate = getPreviousActiveDate(
            CalendarDay.from(date),
            disabledDates,
        );

        expect(nextDate.native).toEqual(new Date(2019, 11, 31));
    });

    it("should get the closest active date for a given offset and a range", () => {
        let target = CalendarDay.from(date);

        // Offset 1 day in the future
        let nextDate = getClosestActiveDate(
            CalendarDay.from(date),
            1,
            disabledDates,
        );
        expect(nextDate.native).toEqual(new Date(2020, 0, 15));

        // Offset 1 day in the past
        nextDate = getClosestActiveDate(
            CalendarDay.from(date),
            -1,
            disabledDates,
        );
        expect(nextDate.native).toEqual(new Date(2019, 11, 31));

        // Set the starting point to December 25th, 2019
        target = target.add("day", -7);

        // Offset 7 days in the future, should skip two whole weeks
        // as the dates from the 1st to the 14th are disabled
        nextDate = getClosestActiveDate(target, 7, disabledDates);
        expect(nextDate.native).toEqual(new Date(2020, 0, 15));

        // Set the starting point to January 15th, 2020
        target = target.add("day", 14);

        // Offset -7 days in the past, should skip two whole weeks
        // as the dates from the 1st to the 14th are disabled
        nextDate = getClosestActiveDate(target, -7, disabledDates);
        expect(nextDate.native).toEqual(new Date(2019, 11, 25));
    });

    it("should return an iterable range of dates between two dates (non-inclusive)", () => {
        const start = CalendarDay.from(date);
        const end = start.add("day", 7);

        // Generate all dates between January 1st and and January 7th
        const range = Array.from(calendarRange({ start, end }));
        expect(range.length).toBe(7);

        range.forEach((day) => {
            expect(
                isDateInRanges(day, [
                    {
                        type: DateRangeType.Between,
                        dateRange: [start.native, end.native],
                    },
                ]),
            ).toBe(true);
        });
    });

    it("should generate a range of 42 days from a starting point", () => {
        // Generate all dates in January 2020 as well as leading/trailing days
        // for December 2019 and February 2020 respectively with the week start
        // set to Monday
        const range = Array.from(generateMonth(date, 1));
        expect(range.length).toBe(42);

        range.forEach((day) => {
            expect(
                isDateInRanges(day, [
                    {
                        type: DateRangeType.Between,
                        dateRange: [
                            new Date(2019, 11, 30),
                            new Date(2020, 1, 9),
                        ],
                    },
                ]),
            ).toBe(true);
        });
    });

    it("should return the first and last years in a range of years", () => {
        const { start, end } = getYearRange(date, 15);
        expect(start).toBe(2010);
        expect(end).toBe(2024);
    });

    it("should assess if a date is in a range of dates", () => {
        // Date is between range
        expect(isDateInRanges(date, disabledDates)).toBe(true);

        // Date is after range
        expect(
            isDateInRanges(date, [
                {
                    type: DateRangeType.After,
                    dateRange: [new Date(2020, 0, 2)],
                },
            ]),
        ).toBe(false);

        // Date is before range
        expect(
            isDateInRanges(date, [
                {
                    type: DateRangeType.Before,
                    dateRange: [new Date(2020, 0, 2)],
                },
            ]),
        ).toBe(true);

        // Date is in a specific range
        expect(
            isDateInRanges(date, [
                {
                    type: DateRangeType.Specific,
                    dateRange: [new Date(2019, 11, 31), new Date(2020, 0, 2)],
                },
            ]),
        ).toBe(false);

        // Date is a weekday
        expect(
            isDateInRanges(date, [
                {
                    type: DateRangeType.Weekdays,
                },
            ]),
        ).toBe(true);

        // Date is not a weekend
        expect(
            isDateInRanges(date, [
                {
                    type: DateRangeType.Weekends,
                },
            ]),
        ).toBe(false);
    });

    it("should get formatted parts by a given locale for a date", () => {
        const {
            date: day,
            full,
            day: dayObject,
            month: monthObject,
            year: yearObject,
        } = formatToParts(
            date,
            "en",
            { day: "numeric", month: "long", year: "numeric" },
            ["day", "month", "year"],
        );

        expect(day).toEqual(date);

        expect(full).toEqual("January 1, 2020");

        expect(dayObject).toEqual({
            value: "1",
            literal: ", ",
            combined: "1, ",
        });

        expect(monthObject).toEqual({
            value: "January",
            literal: " ",
            combined: "January ",
        });

        expect(yearObject).toEqual({
            value: "2020",
            literal: "",
            combined: "2020",
        });
    });
});
