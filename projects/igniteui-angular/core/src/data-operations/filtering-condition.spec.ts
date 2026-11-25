import { IgxStringFilteringOperand,
    IgxNumberFilteringOperand,
    IgxDateFilteringOperand,
    IgxDateTimeFilteringOperand,
    IgxTimeFilteringOperand,
    IgxBooleanFilteringOperand,
    IgxFilteringOperand} from './filtering-condition';
import { describe, it, expect, vi } from 'vitest';

describe('Unit testing FilteringCondition', () => {
    it('tests string conditions', () => {
        const fc = IgxStringFilteringOperand.instance();
        // contains
        expect(fc.condition('contains').logic('test123', 'esT'), 'contains ignoreCase: false')
            .toBeFalsy();
        expect(fc.condition('contains').logic('test123', 'esT', true), 'contains ignoreCase: true')
            .toBeTruthy();
        // does not contain
        expect(fc.condition('doesNotContain').logic('test123', 'esT'), 'doesNotContain ignoreCase: false')
            .toBeTruthy();
        expect(fc.condition('doesNotContain').logic('test123', 'esT', true), 'doesNotContain ignoreCase: true')
            .toBeFalsy();
        // startsWith
        expect(fc.condition('startsWith').logic('test123', 'TesT'), 'startsWith ignoreCase: false')
            .toBeFalsy();
        expect(fc.condition('startsWith').logic('test123', 'TesT', true), 'startsWith ignoreCase: true')
            .toBeTruthy();
        // endsWith
        expect(fc.condition('endsWith').logic('test123', 'T123'), 'endsWith ignoreCase: false')
            .toBeFalsy();
        expect(fc.condition('endsWith').logic('test123', 'sT123', true), 'endsWith ignoreCase: true')
            .toBeTruthy();
        // equals
        expect(fc.condition('equals').logic('test123', 'Test123'))
            .toBeFalsy();
        expect(fc.condition('equals').logic('test123', 'Test123', true))
            .toBeTruthy();
        // doesNotEqual
        expect(fc.condition('doesNotEqual').logic('test123', 'Test123'), 'doesNotEqual ignoreCase: false')
            .toBeTruthy();
        expect(fc.condition('doesNotEqual').logic('test123', 'Test123', true), 'doesNotEqual ignoreCase: true')
            .toBeFalsy();
        // empty
        expect(!fc.condition('empty').logic('test') && fc.condition('empty').logic(null) && fc.condition('empty').logic(undefined), 'empty')
            .toBeTruthy();
        // notEmpty
        expect(fc.condition('notEmpty').logic('test') && !fc.condition('notEmpty').logic(null) && !fc.condition('notEmpty')
            .logic(undefined), 'notEmpty').toBeTruthy();
        // null
        expect(!fc.condition('null').logic('test') && fc.condition('null').logic(null) && !fc.condition('null').logic(undefined), 'null')
            .toBeTruthy();
        // notNull
        expect(fc.condition('notNull').logic('test') && !fc.condition('notNull').logic(null) && fc.condition('notNull').logic(undefined), 'notNull')
            .toBeTruthy();
    });
    it('tests number conditions', () => {
        const fn = IgxNumberFilteringOperand.instance();
        expect(fn.condition('doesNotEqual').logic(1, 2) && !fn.condition('doesNotEqual').logic(1, 1), 'doesNotEqual')
            .toBeTruthy();
        expect(fn.condition('empty').logic(null), 'empty')
            .toBeTruthy();
        expect(!fn.condition('equals').logic(1, 2) && fn.condition('equals').logic(1, 1), 'equals')
            .toBeTruthy();
        expect(!fn.condition('greaterThan').logic(1, 2) && fn.condition('greaterThan').logic(2, 1), 'greaterThan')
            .toBeTruthy();
        expect(!fn.condition('greaterThanOrEqualTo').logic(1, 2) && !fn.condition('greaterThanOrEqualTo').logic(1, 2) &&
            fn.condition('greaterThanOrEqualTo').logic(1, 1), 'greaterThanOrEqualTo')
            .toBeTruthy();
        expect(fn.condition('lessThan').logic(1, 2) && !fn.condition('lessThan').logic(2, 2) &&
            !fn.condition('lessThan').logic(3, 2), 'lessThan')
            .toBeTruthy();
        expect(fn.condition('lessThanOrEqualTo').logic(1, 2) &&
            fn.condition('lessThanOrEqualTo').logic(1, 1) &&
            !fn.condition('lessThanOrEqualTo').logic(3, 2), 'lessThanOrEqualTo')
            .toBeTruthy();
        expect(fn.condition('notEmpty').logic(1), 'notEmpty')
            .toBeTruthy();
        expect(fn.condition('empty').logic(null), 'empty')
            .toBeTruthy();
        expect(fn.condition('notNull').logic(1), 'notNull')
            .toBeTruthy();
        expect(fn.condition('null').logic(null), 'null')
            .toBeTruthy();
    });
    it('tests date conditions', () => {
        const fd = IgxDateFilteringOperand.instance();
        const now = new Date();
        const cnow = new Date();
        const yesterday = ((d) => new Date(d.setDate(d.getDate() - 1)))(new Date());
        const lastMonth = ((d) => {
            d.setDate(1);
            return new Date(d.setMonth(d.getMonth() - 1));
        })(new Date());
        const nextMonth = ((d) => {
            d.setDate(1);
            return new Date(d.setMonth(d.getMonth() + 1));
        })(new Date());
        const lastYear = ((d) => new Date(d.setFullYear(d.getFullYear() - 1)))(new Date());
        const nextYear = ((d) => new Date(d.setFullYear(d.getFullYear() + 1)))(new Date());

        expect(fd.condition('after').logic(now, yesterday) && !fd.condition('after').logic(now, nextYear), 'after')
            .toBeTruthy();
        expect(fd.condition('before').logic(yesterday, now) && !fd.condition('before').logic(now, lastYear), 'before')
            .toBeTruthy();
        expect(fd.condition('doesNotEqual').logic(now, yesterday) && !fd.condition('doesNotEqual').logic(now, cnow), 'doesNotEqual')
            .toBeTruthy();
        expect(fd.condition('empty').logic(null) && fd.condition('empty').logic(undefined) && !fd.condition('empty').logic(now), 'empty')
            .toBeTruthy();
        expect(!fd.condition('notEmpty').logic(null) && !fd.condition('notEmpty').logic(undefined) && fd.condition('notEmpty').logic(now), 'notEmpty')
            .toBeTruthy();
        expect(fd.condition('equals').logic(now, cnow) && !fd.condition('equals').logic(now, yesterday), 'equals')
            .toBeTruthy();
        expect(!fd.condition('lastMonth').logic(now) && fd.condition('lastMonth').logic(lastMonth), 'lastMonth')
            .toBeTruthy();
        expect(fd.condition('lastYear').logic(lastYear) && !fd.condition('lastYear').logic(now), 'lastYear')
            .toBeTruthy();
        expect(!fd.condition('nextMonth').logic(now) && fd.condition('nextMonth').logic(nextMonth), 'nextMonth')
            .toBeTruthy();
        expect(!fd.condition('nextYear').logic(now) && fd.condition('nextYear').logic(nextYear), 'nextYear')
            .toBeTruthy();
        expect(fd.condition('notEmpty').logic(now) && !fd.condition('notEmpty').logic(null) && !fd.condition('notEmpty').logic(undefined), 'notEmpty')
            .toBeTruthy();
        expect(fd.condition('notNull').logic(now) && !fd.condition('notNull').logic(null) && fd.condition('notNull').logic(undefined), 'notNull')
            .toBeTruthy();
        expect(fd.condition('null').logic(null) && !fd.condition('null').logic(now) && !fd.condition('null').logic(undefined), 'null')
            .toBeTruthy();
        expect(fd.condition('thisMonth').logic(now) && !fd.condition('thisMonth').logic(nextYear), 'thisMonth')
            .toBeTruthy();
        expect(fd.condition('thisYear').logic(now) && !fd.condition('thisYear').logic(nextYear), 'thisYear')
            .toBeTruthy();
        expect(fd.condition('today').logic(now) && !fd.condition('today').logic(nextYear), 'today')
            .toBeTruthy();
        expect(!fd.condition('yesterday').logic(now) && fd.condition('yesterday').logic(yesterday), 'yesterday')
            .toBeTruthy();
    });
    it('tests boolean conditions', () => {
        const f = IgxBooleanFilteringOperand.instance();
        expect(f.condition('empty').logic(null) && f.condition('empty').logic(undefined) && !f.condition('empty').logic(false), 'empty')
            .toBeTruthy();
        expect(f.condition('false').logic(false) && !f.condition('false').logic(true), 'false')
            .toBeTruthy();
        expect(!f.condition('true').logic(false) && f.condition('true').logic(true), 'true')
            .toBeTruthy();
        expect(!f.condition('notEmpty').logic(null) && !f.condition('notEmpty').logic(undefined) && f.condition('notEmpty').logic(false), 'notEmpty')
            .toBeTruthy();
        expect(f.condition('null').logic(null) && !f.condition('null').logic(undefined) && !f.condition('null').logic(false), 'null')
            .toBeTruthy();
        expect(!f.condition('notNull').logic(null) && f.condition('notNull').logic(undefined) && f.condition('notNull').logic(false), 'notNull')
            .toBeTruthy();
    });
    it('tests dateTime conditions', () => {
        const fdt = IgxDateTimeFilteringOperand.instance();
        vi.useFakeTimers();
        try {
            vi.setSystemTime(new Date(2024, 5, 15));
            const now = new Date();
            const yesterday = ((d) => new Date(d.setDate(d.getDate() - 1)))(new Date());
            const lastMonth = ((d) => {
                d.setDate(1); return new Date(d.setMonth(d.getMonth() - 1));
            })(new Date());
            const nextMonth = ((d) => {
                d.setDate(1); return new Date(d.setMonth(d.getMonth() + 1));
            })(new Date());
            const lastYear = ((d) => new Date(d.setFullYear(d.getFullYear() - 1)))(new Date());
            const nextYear = ((d) => new Date(d.setFullYear(d.getFullYear() + 1)))(new Date());

            expect(fdt.condition('before').logic(yesterday, now) &&
                !fdt.condition('before').logic(now, yesterday) &&
                !fdt.condition('before').logic(null, now), 'before')
                .toBeTruthy();
            expect(fdt.condition('after').logic(now, yesterday) &&
                !fdt.condition('after').logic(yesterday, now) &&
                !fdt.condition('after').logic(null, now), 'after')
                .toBeTruthy();
            expect(fdt.condition('today').logic(now) &&
                !fdt.condition('today').logic(nextYear) &&
                !fdt.condition('today').logic(null), 'today')
                .toBeTruthy();
            expect(fdt.condition('yesterday').logic(yesterday) &&
                !fdt.condition('yesterday').logic(nextYear) &&
                !fdt.condition('yesterday').logic(null), 'yesterday')
                .toBeTruthy();
            expect(fdt.condition('thisMonth').logic(now) &&
                !fdt.condition('thisMonth').logic(nextYear) &&
                !fdt.condition('thisMonth').logic(null), 'thisMonth')
                .toBeTruthy();
            expect(fdt.condition('lastMonth').logic(lastMonth) &&
                !fdt.condition('lastMonth').logic(now) &&
                !fdt.condition('lastMonth').logic(null), 'lastMonth')
                .toBeTruthy();
            expect(fdt.condition('nextMonth').logic(nextMonth) &&
                !fdt.condition('nextMonth').logic(now) &&
                !fdt.condition('nextMonth').logic(null), 'nextMonth')
                .toBeTruthy();
            expect(fdt.condition('thisYear').logic(now) &&
                !fdt.condition('thisYear').logic(nextYear) &&
                !fdt.condition('thisYear').logic(null), 'thisYear')
                .toBeTruthy();
            expect(fdt.condition('lastYear').logic(lastYear) &&
                !fdt.condition('lastYear').logic(now) &&
                !fdt.condition('lastYear').logic(null), 'lastYear')
                .toBeTruthy();
            expect(fdt.condition('nextYear').logic(nextYear) &&
                !fdt.condition('nextYear').logic(now) &&
                !fdt.condition('nextYear').logic(null), 'nextYear')
                .toBeTruthy();
        } finally {
            vi.useRealTimers();
        }
    });
    it('tests dateTime conditions when the current month rolls over a year boundary', () => {
        const fdt = IgxDateTimeFilteringOperand.instance();
        const fd = IgxDateFilteringOperand.instance();
        vi.useFakeTimers();
        try {
            // In January `lastMonth` has to roll back to December of the previous year.
            vi.setSystemTime(new Date(2024, 0, 15));
            expect(fdt.condition('lastMonth').logic(new Date(2023, 11, 31)) &&
                !fdt.condition('lastMonth').logic(new Date(2024, 0, 1)) &&
                !fdt.condition('lastMonth').logic(new Date(2023, 10, 30)), 'dateTime lastMonth in January')
                .toBeTruthy();
            expect(fd.condition('lastMonth').logic(new Date(2023, 11, 31)) &&
                !fd.condition('lastMonth').logic(new Date(2024, 0, 1)), 'date lastMonth in January')
                .toBeTruthy();
            expect(fdt.condition('nextMonth').logic(new Date(2024, 1, 1)) &&
                !fdt.condition('nextMonth').logic(new Date(2024, 0, 31)), 'dateTime nextMonth in January')
                .toBeTruthy();

            // In December `nextMonth` has to roll forward to January of the next year.
            vi.setSystemTime(new Date(2024, 11, 15));
            expect(fdt.condition('nextMonth').logic(new Date(2025, 0, 1)) &&
                !fdt.condition('nextMonth').logic(new Date(2024, 11, 31)) &&
                !fdt.condition('nextMonth').logic(new Date(2026, 0, 1)), 'dateTime nextMonth in December')
                .toBeTruthy();
            expect(fd.condition('nextMonth').logic(new Date(2025, 0, 1)) &&
                !fd.condition('nextMonth').logic(new Date(2024, 11, 31)), 'date nextMonth in December')
                .toBeTruthy();
            expect(fdt.condition('lastMonth').logic(new Date(2024, 10, 30)) &&
                !fdt.condition('lastMonth').logic(new Date(2024, 11, 1)), 'dateTime lastMonth in December')
                .toBeTruthy();
        } finally {
            vi.useRealTimers();
        }
    });
    it('tests time conditions', () => {
        const ft = IgxTimeFilteringOperand.instance();
        const at = new Date(2024, 4, 17, 10, 30, 30);
        const earlierHours = new Date(2024, 4, 17, 9, 30, 30);
        const earlierMinutes = new Date(2024, 4, 17, 10, 15, 30);
        const earlierSeconds = new Date(2024, 4, 17, 10, 30, 15);
        const laterHours = new Date(2024, 4, 17, 11, 30, 30);
        const laterMinutes = new Date(2024, 4, 17, 10, 45, 30);
        const laterSeconds = new Date(2024, 4, 17, 10, 30, 45);
        // The date part is deliberately different - only the time part participates.
        const sameTimeOtherDay = new Date(2020, 0, 1, 10, 30, 30);

        expect(ft.condition('at_before').logic(at, at) &&
            ft.condition('at_before').logic(sameTimeOtherDay, at) &&
            ft.condition('at_before').logic(earlierHours, at) &&
            ft.condition('at_before').logic(earlierMinutes, at) &&
            ft.condition('at_before').logic(earlierSeconds, at), 'at_before matches the exact time and everything before it')
            .toBeTruthy();
        expect(!ft.condition('at_before').logic(laterHours, at) &&
            !ft.condition('at_before').logic(laterMinutes, at) &&
            !ft.condition('at_before').logic(laterSeconds, at) &&
            !ft.condition('at_before').logic(null, at), 'at_before does not match later times')
            .toBeTruthy();

        expect(ft.condition('at_after').logic(at, at) &&
            ft.condition('at_after').logic(sameTimeOtherDay, at) &&
            ft.condition('at_after').logic(laterHours, at) &&
            ft.condition('at_after').logic(laterMinutes, at) &&
            ft.condition('at_after').logic(laterSeconds, at), 'at_after matches the exact time and everything after it')
            .toBeTruthy();
        expect(!ft.condition('at_after').logic(earlierHours, at) &&
            !ft.condition('at_after').logic(earlierMinutes, at) &&
            !ft.condition('at_after').logic(earlierSeconds, at) &&
            !ft.condition('at_after').logic(null, at), 'at_after does not match earlier times')
            .toBeTruthy();

        // `in` matches on the locale time string, so the date part is irrelevant here as well.
        const times = new Set([at.toLocaleTimeString()]);
        expect(ft.condition('in').logic(at, times) &&
            ft.condition('in').logic(sameTimeOtherDay, times) &&
            !ft.condition('in').logic(laterHours, times) &&
            !ft.condition('in').logic(null, times), 'in')
            .toBeTruthy();
    });
    it('tests the shared date-time helpers', () => {
        const date = new Date(2024, 4, 17, 13, 24, 35, 678);

        // Without a date, or without a format, every part stays null.
        const noDate = IgxDateFilteringOperand.getDateParts(null, 'yMdhmsf');
        const noFormat = IgxDateFilteringOperand.getDateParts(date);
        expect(Object.values(noDate).every(part => part === null), 'no date').toBeTruthy();
        expect(Object.values(noFormat).every(part => part === null), 'no format').toBeTruthy();

        // Each part is resolved only when the format asks for it.
        expect(IgxDateFilteringOperand.getDateParts(date, 'yMdhmsf')).toEqual({
            year: 2024, month: 4, day: 17, hours: 13, minutes: 24, seconds: 35, milliseconds: 678
        });
        const dateOnly = IgxDateFilteringOperand.getDateParts(date, 'yMd');
        expect(dateOnly.hours === null && dateOnly.minutes === null &&
            dateOnly.seconds === null && dateOnly.milliseconds === null, 'parts outside of the format stay null')
            .toBeTruthy();

        // Each operand matches against the set through its own string form - the full ISO string for
        // dateTime, the date part only for date, and the locale time for time.
        const fdt = IgxDateTimeFilteringOperand.instance();
        expect(fdt.condition('in').logic(date, new Set([date.toISOString()])) &&
            !fdt.condition('in').logic(date, new Set([new Date(2020, 0, 1).toISOString()])) &&
            fdt.condition('in').logic('plain value', new Set(['plain value'])) &&
            !fdt.condition('in').logic(null, new Set([date.toISOString()])), 'dateTime in')
            .toBeTruthy();

        const fd = IgxDateFilteringOperand.instance();
        expect(fd.condition('in').logic(date, new Set([date.toDateString()])) &&
            !fd.condition('in').logic(date, new Set([new Date(2020, 0, 1).toDateString()])) &&
            !fd.condition('in').logic(null, new Set([date.toDateString()])), 'date in')
            .toBeTruthy();

        expect(() => fd.condition('before').logic('not a date', date))
            .toThrowError(
                'Could not perform filtering on \'date\' column because the datasource object type is not \'Date\'.');
    });
    it('tests nested query conditions', () => {
        const f = IgxStringFilteringOperand.instance();
        const values = new Set(['a', 'b']);

        expect(f.condition('inQuery').logic('a', values) && !f.condition('inQuery').logic('c', values), 'inQuery')
            .toBeTruthy();
        expect(f.condition('notInQuery').logic('c', values) && !f.condition('notInQuery').logic('a', values), 'notInQuery')
            .toBeTruthy();
        // Nested query conditions are hidden from the plain condition list, but not from the extended one.
        expect(f.conditionList()).not.toContain('inQuery');
        expect(f.extendedConditionList()).toContain('inQuery');
        expect(f.extendedConditionList()).toContain('notInQuery');
    });
    it('tests custom conditions', () => {
        const f = CustomFilter.instance();
        expect(f.condition('Custom').logic('Asd', 'asd')).toBeFalsy();
        expect(f.condition('Custom').logic('Asd', 'Asd')).toBeTruthy();
    });
});

class CustomFilter extends IgxFilteringOperand {
    private constructor() {
        super();
        this.append({
            name: 'Custom',
            logic: (value: any, searchVal: any) => value === searchVal,
            isUnary: false,
            iconName: 'starts-with'
        });
    }
}
