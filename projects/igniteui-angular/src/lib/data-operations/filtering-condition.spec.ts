import { IgxStringFilteringOperand,
    IgxNumberFilteringOperand,
    IgxDateFilteringOperand,
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
