import { IgxStringFilteringOperand,
    IgxNumberFilteringOperand,
    IgxDateFilteringOperand,
    IgxDateTimeFilteringOperand,
    IgxTimeFilteringOperand,
    IgxBooleanFilteringOperand,
    IgxFilteringOperand} from './filtering-condition';

describe('Unit testing FilteringCondition', () => {
    it('tests string conditions', () => {
        const fc = IgxStringFilteringOperand.instance();
        // contains
        expect(fc.condition('contains').logic('test123', 'esT'))
            .toBeFalsy('contains ignoreCase: false');
        expect(fc.condition('contains').logic('test123', 'esT', true))
            .toBeTruthy('contains ignoreCase: true');
        // does not contain
        expect(fc.condition('doesNotContain').logic('test123', 'esT'))
            .toBeTruthy('doesNotContain ignoreCase: false');
        expect(fc.condition('doesNotContain').logic('test123', 'esT', true))
            .toBeFalsy('doesNotContain ignoreCase: true');
        // startsWith
        expect(fc.condition('startsWith').logic('test123', 'TesT'))
            .toBeFalsy('startsWith ignoreCase: false');
        expect(fc.condition('startsWith').logic('test123', 'TesT', true))
            .toBeTruthy('startsWith ignoreCase: true');
        // endsWith
        expect(fc.condition('endsWith').logic('test123', 'T123'))
            .toBeFalsy('endsWith ignoreCase: false');
        expect(fc.condition('endsWith').logic('test123', 'sT123', true))
            .toBeTruthy('endsWith ignoreCase: true');
        // equals
        expect(fc.condition('equals').logic('test123', 'Test123'))
            .toBeFalsy();
        expect(fc.condition('equals').logic('test123', 'Test123', true))
            .toBeTruthy();
        // doesNotEqual
        expect(fc.condition('doesNotEqual').logic('test123', 'Test123'))
            .toBeTruthy('doesNotEqual ignoreCase: false');
        expect(fc.condition('doesNotEqual').logic('test123', 'Test123', true))
            .toBeFalsy('doesNotEqual ignoreCase: true');
        // empty
        expect(!fc.condition('empty').logic('test') && fc.condition('empty').logic(null) && fc.condition('empty').logic(undefined))
            .toBeTruthy('empty');
        // notEmpty
        expect(fc.condition('notEmpty').logic('test') && !fc.condition('notEmpty').logic(null) && !fc.condition('notEmpty')
            .logic(undefined)).toBeTruthy('notEmpty');
        // null
        expect(!fc.condition('null').logic('test') && fc.condition('null').logic(null) && !fc.condition('null').logic(undefined))
            .toBeTruthy('null');
        // notNull
        expect(fc.condition('notNull').logic('test') && !fc.condition('notNull').logic(null) && fc.condition('notNull').logic(undefined))
            .toBeTruthy('notNull');
    });
    it('tests number conditions', () => {
        const fn = IgxNumberFilteringOperand.instance();
        expect(fn.condition('doesNotEqual').logic(1, 2) && !fn.condition('doesNotEqual').logic(1, 1))
            .toBeTruthy('doesNotEqual');
        expect(fn.condition('empty').logic(null))
            .toBeTruthy('empty');
        expect(!fn.condition('equals').logic(1, 2) && fn.condition('equals').logic(1, 1))
            .toBeTruthy('equals');
        expect(!fn.condition('greaterThan').logic(1, 2) && fn.condition('greaterThan').logic(2, 1))
            .toBeTruthy('greaterThan');
        expect(!fn.condition('greaterThanOrEqualTo').logic(1, 2) && !fn.condition('greaterThanOrEqualTo').logic(1, 2) &&
                fn.condition('greaterThanOrEqualTo').logic(1, 1))
            .toBeTruthy('greaterThanOrEqualTo');
        expect(fn.condition('lessThan').logic(1, 2) && !fn.condition('lessThan').logic(2, 2) &&
                !fn.condition('lessThan').logic(3, 2))
            .toBeTruthy('lessThan');
        expect(fn.condition('lessThanOrEqualTo').logic(1, 2) &&
                fn.condition('lessThanOrEqualTo').logic(1, 1) &&
                !fn.condition('lessThanOrEqualTo').logic(3, 2))
            .toBeTruthy('lessThanOrEqualTo');
        expect(fn.condition('notEmpty').logic(1))
            .toBeTruthy('notEmpty');
        expect(fn.condition('empty').logic(null))
            .toBeTruthy('empty');
        expect(fn.condition('notNull').logic(1))
            .toBeTruthy('notNull');
        expect(fn.condition('null').logic(null))
            .toBeTruthy('null');
    });
    it('tests date conditions', () => {
        const fd = IgxDateFilteringOperand.instance();
        const now = new Date();
        const cnow = new Date();
        const yesterday = ((d) => new Date(d.setDate(d.getDate() - 1)))(new Date());
        const lastMonth = ((d) => {
 d.setDate(1); return new Date(d.setMonth(d.getMonth() - 1));
})(new Date());
        const nextMonth = ((d) => {
 d.setDate(1); return new Date(d.setMonth(d.getMonth() + 1));
})(new Date());
        const lastYear = ((d) => new Date(d.setFullYear(d.getFullYear() - 1)))(new Date());
        const nextYear = ((d) => new Date(d.setFullYear(d.getFullYear() + 1)))(new Date());

        expect(fd.condition('after').logic(now, yesterday) && !fd.condition('after').logic(now, nextYear))
            .toBeTruthy('after');
        expect(fd.condition('before').logic(yesterday, now) && !fd.condition('before').logic(now, lastYear))
            .toBeTruthy('before');
        expect(fd.condition('doesNotEqual').logic(now, yesterday) && fd.condition('doesNotEqual').logic(now, yesterday))
            .toBeTruthy('doesNotEqual');
        expect(fd.condition('empty').logic(null) && fd.condition('empty').logic(undefined) && !fd.condition('empty').logic(now))
            .toBeTruthy('empty');
        expect(!fd.condition('notEmpty').logic(null) && !fd.condition('notEmpty').logic(undefined) && fd.condition('notEmpty').logic(now))
            .toBeTruthy('notEmpty');
        expect(fd.condition('equals').logic(now, cnow) && !fd.condition('equals').logic(now, yesterday))
            .toBeTruthy('equals');
        expect(!fd.condition('lastMonth').logic(now) && fd.condition('lastMonth').logic(lastMonth))
            .toBeTruthy('lastMonth');
        expect(fd.condition('lastYear').logic(lastYear) && !fd.condition('lastYear').logic(now))
            .toBeTruthy('lastYear');
        expect(!fd.condition('nextMonth').logic(now) && fd.condition('nextMonth').logic(nextMonth))
            .toBeTruthy('nextMonth');
        expect(!fd.condition('nextYear').logic(now) && fd.condition('nextYear').logic(nextYear))
            .toBeTruthy('nextYear');
        expect(fd.condition('notEmpty').logic(now) && !fd.condition('notEmpty').logic(null) && !fd.condition('notEmpty').logic(undefined))
            .toBeTruthy('notEmpty');
        expect(fd.condition('notNull').logic(now) && !fd.condition('notNull').logic(null) && fd.condition('notNull').logic(undefined))
            .toBeTruthy('notNull');
        expect(fd.condition('null').logic(null) && !fd.condition('null').logic(now) && !fd.condition('null').logic(undefined))
            .toBeTruthy('null');
        expect(fd.condition('thisMonth').logic(now) && !fd.condition('thisMonth').logic(nextYear))
            .toBeTruthy('thisMonth');
        expect(fd.condition('thisYear').logic(now) && !fd.condition('thisYear').logic(nextYear))
            .toBeTruthy('thisYear');
        expect(fd.condition('today').logic(now) && !fd.condition('today').logic(nextYear))
            .toBeTruthy('today');
        expect(!fd.condition('yesterday').logic(now) && fd.condition('yesterday').logic(yesterday))
            .toBeTruthy('yesterday');
    });
    it('tests boolean conditions', () => {
        const f = IgxBooleanFilteringOperand.instance();
        expect(f.condition('empty').logic(null) && f.condition('empty').logic(undefined) && !f.condition('empty').logic(false))
            .toBeTruthy('empty');
        expect(f.condition('false').logic(false) && !f.condition('false').logic(true))
            .toBeTruthy('false');
        expect(!f.condition('true').logic(false) && f.condition('true').logic(true))
            .toBeTruthy('true');
        expect(!f.condition('notEmpty').logic(null) && !f.condition('notEmpty').logic(undefined) && f.condition('notEmpty').logic(false))
            .toBeTruthy('notEmpty');
        expect(f.condition('null').logic(null) && !f.condition('null').logic(undefined) && !f.condition('null').logic(false))
            .toBeTruthy('null');
        expect(!f.condition('notNull').logic(null) && f.condition('notNull').logic(undefined) && f.condition('notNull').logic(false))
            .toBeTruthy('notNull');
    });
    it('tests dateTime conditions', () => {
        const fdt = IgxDateTimeFilteringOperand.instance();
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
            !fdt.condition('before').logic(null, now))
            .toBeTruthy('before');
        expect(fdt.condition('after').logic(now, yesterday) &&
            !fdt.condition('after').logic(yesterday, now) &&
            !fdt.condition('after').logic(null, now))
            .toBeTruthy('after');
        expect(fdt.condition('today').logic(now) &&
            !fdt.condition('today').logic(nextYear) &&
            !fdt.condition('today').logic(null))
            .toBeTruthy('today');
        expect(fdt.condition('yesterday').logic(yesterday) &&
            !fdt.condition('yesterday').logic(nextYear) &&
            !fdt.condition('yesterday').logic(null))
            .toBeTruthy('yesterday');
        expect(fdt.condition('thisMonth').logic(now) &&
            !fdt.condition('thisMonth').logic(nextYear) &&
            !fdt.condition('thisMonth').logic(null))
            .toBeTruthy('thisMonth');
        expect(fdt.condition('lastMonth').logic(lastMonth) &&
            !fdt.condition('lastMonth').logic(now) &&
            !fdt.condition('lastMonth').logic(null))
            .toBeTruthy('lastMonth');
        expect(fdt.condition('nextMonth').logic(nextMonth) &&
            !fdt.condition('nextMonth').logic(now) &&
            !fdt.condition('nextMonth').logic(null))
            .toBeTruthy('nextMonth');
        expect(fdt.condition('thisYear').logic(now) &&
            !fdt.condition('thisYear').logic(nextYear) &&
            !fdt.condition('thisYear').logic(null))
            .toBeTruthy('thisYear');
        expect(fdt.condition('lastYear').logic(lastYear) &&
            !fdt.condition('lastYear').logic(now) &&
            !fdt.condition('lastYear').logic(null))
            .toBeTruthy('lastYear');
        expect(fdt.condition('nextYear').logic(nextYear) &&
            !fdt.condition('nextYear').logic(now) &&
            !fdt.condition('nextYear').logic(null))
            .toBeTruthy('nextYear');
    });
    it('tests dateTime conditions when the current month rolls over a year boundary', () => {
        const fdt = IgxDateTimeFilteringOperand.instance();
        const fd = IgxDateFilteringOperand.instance();
        jasmine.clock().install();
        try {
            // In January `lastMonth` has to roll back to December of the previous year.
            jasmine.clock().mockDate(new Date(2024, 0, 15));
            expect(fdt.condition('lastMonth').logic(new Date(2023, 11, 31)) &&
                !fdt.condition('lastMonth').logic(new Date(2024, 0, 1)) &&
                !fdt.condition('lastMonth').logic(new Date(2023, 10, 30)))
                .toBeTruthy('dateTime lastMonth in January');
            expect(fd.condition('lastMonth').logic(new Date(2023, 11, 31)) &&
                !fd.condition('lastMonth').logic(new Date(2024, 0, 1)))
                .toBeTruthy('date lastMonth in January');
            expect(fdt.condition('nextMonth').logic(new Date(2024, 1, 1)) &&
                !fdt.condition('nextMonth').logic(new Date(2024, 0, 31)))
                .toBeTruthy('dateTime nextMonth in January');

            // In December `nextMonth` has to roll forward to January of the next year.
            jasmine.clock().mockDate(new Date(2024, 11, 15));
            expect(fdt.condition('nextMonth').logic(new Date(2025, 0, 1)) &&
                !fdt.condition('nextMonth').logic(new Date(2024, 11, 31)) &&
                !fdt.condition('nextMonth').logic(new Date(2026, 0, 1)))
                .toBeTruthy('dateTime nextMonth in December');
            expect(fd.condition('nextMonth').logic(new Date(2025, 0, 1)) &&
                !fd.condition('nextMonth').logic(new Date(2024, 11, 31)))
                .toBeTruthy('date nextMonth in December');
            expect(fdt.condition('lastMonth').logic(new Date(2024, 10, 30)) &&
                !fdt.condition('lastMonth').logic(new Date(2024, 11, 1)))
                .toBeTruthy('dateTime lastMonth in December');
        } finally {
            jasmine.clock().uninstall();
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
            ft.condition('at_before').logic(earlierSeconds, at))
            .toBeTruthy('at_before matches the exact time and everything before it');
        expect(!ft.condition('at_before').logic(laterHours, at) &&
            !ft.condition('at_before').logic(laterMinutes, at) &&
            !ft.condition('at_before').logic(laterSeconds, at) &&
            !ft.condition('at_before').logic(null, at))
            .toBeTruthy('at_before does not match later times');

        expect(ft.condition('at_after').logic(at, at) &&
            ft.condition('at_after').logic(sameTimeOtherDay, at) &&
            ft.condition('at_after').logic(laterHours, at) &&
            ft.condition('at_after').logic(laterMinutes, at) &&
            ft.condition('at_after').logic(laterSeconds, at))
            .toBeTruthy('at_after matches the exact time and everything after it');
        expect(!ft.condition('at_after').logic(earlierHours, at) &&
            !ft.condition('at_after').logic(earlierMinutes, at) &&
            !ft.condition('at_after').logic(earlierSeconds, at) &&
            !ft.condition('at_after').logic(null, at))
            .toBeTruthy('at_after does not match earlier times');

        // `in` matches on the locale time string, so the date part is irrelevant here as well.
        const times = new Set([at.toLocaleTimeString()]);
        expect(ft.condition('in').logic(at, times) &&
            ft.condition('in').logic(sameTimeOtherDay, times) &&
            !ft.condition('in').logic(laterHours, times) &&
            !ft.condition('in').logic(null, times))
            .toBeTruthy('in');
    });
    it('tests the shared date-time helpers', () => {
        const date = new Date(2024, 4, 17, 13, 24, 35, 678);

        // Without a date, or without a format, every part stays null.
        const noDate = IgxDateFilteringOperand.getDateParts(null, 'yMdhmsf');
        const noFormat = IgxDateFilteringOperand.getDateParts(date);
        expect(Object.values(noDate).every(part => part === null)).toBeTruthy('no date');
        expect(Object.values(noFormat).every(part => part === null)).toBeTruthy('no format');

        // Each part is resolved only when the format asks for it.
        expect(IgxDateFilteringOperand.getDateParts(date, 'yMdhmsf')).toEqual({
            year: 2024, month: 4, day: 17, hours: 13, minutes: 24, seconds: 35, milliseconds: 678
        });
        const dateOnly = IgxDateFilteringOperand.getDateParts(date, 'yMd');
        expect(dateOnly.hours === null && dateOnly.minutes === null &&
            dateOnly.seconds === null && dateOnly.milliseconds === null)
            .toBeTruthy('parts outside of the format stay null');

        // Each operand matches against the set through its own string form - the full ISO string for
        // dateTime, the date part only for date, and the locale time for time.
        const fdt = IgxDateTimeFilteringOperand.instance();
        expect(fdt.condition('in').logic(date, new Set([date.toISOString()])) &&
            !fdt.condition('in').logic(date, new Set([new Date(2020, 0, 1).toISOString()])) &&
            fdt.condition('in').logic('plain value', new Set(['plain value'])) &&
            !fdt.condition('in').logic(null, new Set([date.toISOString()])))
            .toBeTruthy('dateTime in');

        const fd = IgxDateFilteringOperand.instance();
        expect(fd.condition('in').logic(date, new Set([date.toDateString()])) &&
            !fd.condition('in').logic(date, new Set([new Date(2020, 0, 1).toDateString()])) &&
            !fd.condition('in').logic(null, new Set([date.toDateString()])))
            .toBeTruthy('date in');

        expect(() => fd.condition('before').logic('not a date', date))
            .toThrowError(
                'Could not perform filtering on \'date\' column because the datasource object type is not \'Date\'.');
    });
    it('tests nested query conditions', () => {
        const f = IgxStringFilteringOperand.instance();
        const values = new Set(['a', 'b']);

        expect(f.condition('inQuery').logic('a', values) && !f.condition('inQuery').logic('c', values))
            .toBeTruthy('inQuery');
        expect(f.condition('notInQuery').logic('c', values) && !f.condition('notInQuery').logic('a', values))
            .toBeTruthy('notInQuery');
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
