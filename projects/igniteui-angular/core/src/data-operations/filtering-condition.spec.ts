import { describe, it, expect } from 'vitest';
import { IgxStringFilteringOperand,
    IgxNumberFilteringOperand,
    IgxDateFilteringOperand,
    IgxBooleanFilteringOperand,
    IgxFilteringOperand} from './filtering-condition';

describe('Unit testing FilteringCondition', () => {
    it('tests string conditions', () => {
        const fc = IgxStringFilteringOperand.instance();
        // contains
        expect(fc.condition('contains').logic('test123', 'esT'), 'contains ignoreCase: false').toBeFalsy();
        expect(fc.condition('contains').logic('test123', 'esT', true), 'contains ignoreCase: true').toBeTruthy();
        // does not contain
        expect(fc.condition('doesNotContain').logic('test123', 'esT'), 'doesNotContain ignoreCase: false').toBeTruthy();
        expect(fc.condition('doesNotContain').logic('test123', 'esT', true), 'doesNotContain ignoreCase: true').toBeFalsy();
        // startsWith
        expect(fc.condition('startsWith').logic('test123', 'TesT'), 'startsWith ignoreCase: false').toBeFalsy();
        expect(fc.condition('startsWith').logic('test123', 'TesT', true), 'startsWith ignoreCase: true').toBeTruthy();
        // endsWith
        expect(fc.condition('endsWith').logic('test123', 'T123'), 'endsWith ignoreCase: false').toBeFalsy();
        expect(fc.condition('endsWith').logic('test123', 'sT123', true), 'endsWith ignoreCase: true').toBeTruthy();
        // equals
        expect(fc.condition('equals').logic('test123', 'Test123'))
            .toBeFalsy();
        expect(fc.condition('equals').logic('test123', 'Test123', true))
            .toBeTruthy();
        // doesNotEqual
        expect(fc.condition('doesNotEqual').logic('test123', 'Test123'), 'doesNotEqual ignoreCase: false').toBeTruthy();
        expect(fc.condition('doesNotEqual').logic('test123', 'Test123', true), 'doesNotEqual ignoreCase: true').toBeFalsy();
        // empty
        expect(!fc.condition('empty').logic('test') && fc.condition('empty').logic(null) && fc.condition('empty').logic(undefined), 'empty').toBeTruthy();
        // notEmpty
        expect(fc.condition('notEmpty').logic('test') && !fc.condition('notEmpty').logic(null) && !fc.condition('notEmpty') .logic(undefined), 'notEmpty').toBeTruthy();
        // null
        expect(!fc.condition('null').logic('test') && fc.condition('null').logic(null) && !fc.condition('null').logic(undefined), 'null').toBeTruthy();
        // notNull
        expect(fc.condition('notNull').logic('test') && !fc.condition('notNull').logic(null) && fc.condition('notNull').logic(undefined), 'notNull').toBeTruthy();
    });
    it('tests number conditions', () => {
        const fn = IgxNumberFilteringOperand.instance();
        expect(fn.condition('doesNotEqual').logic(1, 2) && !fn.condition('doesNotEqual').logic(1, 1), 'doesNotEqual').toBeTruthy();
        expect(fn.condition('empty').logic(null), 'empty').toBeTruthy();
        expect(!fn.condition('equals').logic(1, 2) && fn.condition('equals').logic(1, 1), 'equals').toBeTruthy();
        expect(!fn.condition('greaterThan').logic(1, 2) && fn.condition('greaterThan').logic(2, 1), 'greaterThan').toBeTruthy();
        expect(!fn.condition('greaterThanOrEqualTo').logic(1, 2) && !fn.condition('greaterThanOrEqualTo').logic(1, 2) && fn.condition('greaterThanOrEqualTo').logic(1, 1), 'greaterThanOrEqualTo').toBeTruthy();
        expect(fn.condition('lessThan').logic(1, 2) && !fn.condition('lessThan').logic(2, 2) && !fn.condition('lessThan').logic(3, 2), 'lessThan').toBeTruthy();
        expect(fn.condition('lessThanOrEqualTo').logic(1, 2) && fn.condition('lessThanOrEqualTo').logic(1, 1) && !fn.condition('lessThanOrEqualTo').logic(3, 2), 'lessThanOrEqualTo').toBeTruthy();
        expect(fn.condition('notEmpty').logic(1), 'notEmpty').toBeTruthy();
        expect(fn.condition('empty').logic(null), 'empty').toBeTruthy();
        expect(fn.condition('notNull').logic(1), 'notNull').toBeTruthy();
        expect(fn.condition('null').logic(null), 'null').toBeTruthy();
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

        expect(fd.condition('after').logic(now, yesterday) && !fd.condition('after').logic(now, nextYear), 'after').toBeTruthy();
        expect(fd.condition('before').logic(yesterday, now) && !fd.condition('before').logic(now, lastYear), 'before').toBeTruthy();
        expect(fd.condition('doesNotEqual').logic(now, yesterday) && fd.condition('doesNotEqual').logic(now, yesterday), 'doesNotEqual').toBeTruthy();
        expect(fd.condition('empty').logic(null) && fd.condition('empty').logic(undefined) && !fd.condition('empty').logic(now), 'empty').toBeTruthy();
        expect(!fd.condition('notEmpty').logic(null) && !fd.condition('notEmpty').logic(undefined) && fd.condition('notEmpty').logic(now), 'notEmpty').toBeTruthy();
        expect(fd.condition('equals').logic(now, cnow) && !fd.condition('equals').logic(now, yesterday), 'equals').toBeTruthy();
        expect(!fd.condition('lastMonth').logic(now) && fd.condition('lastMonth').logic(lastMonth), 'lastMonth').toBeTruthy();
        expect(fd.condition('lastYear').logic(lastYear) && !fd.condition('lastYear').logic(now), 'lastYear').toBeTruthy();
        expect(!fd.condition('nextMonth').logic(now) && fd.condition('nextMonth').logic(nextMonth), 'nextMonth').toBeTruthy();
        expect(!fd.condition('nextYear').logic(now) && fd.condition('nextYear').logic(nextYear), 'nextYear').toBeTruthy();
        expect(fd.condition('notEmpty').logic(now) && !fd.condition('notEmpty').logic(null) && !fd.condition('notEmpty').logic(undefined), 'notEmpty').toBeTruthy();
        expect(fd.condition('notNull').logic(now) && !fd.condition('notNull').logic(null) && fd.condition('notNull').logic(undefined), 'notNull').toBeTruthy();
        expect(fd.condition('null').logic(null) && !fd.condition('null').logic(now) && !fd.condition('null').logic(undefined), 'null').toBeTruthy();
        expect(fd.condition('thisMonth').logic(now) && !fd.condition('thisMonth').logic(nextYear), 'thisMonth').toBeTruthy();
        expect(fd.condition('thisYear').logic(now) && !fd.condition('thisYear').logic(nextYear), 'thisYear').toBeTruthy();
        expect(fd.condition('today').logic(now) && !fd.condition('today').logic(nextYear), 'today').toBeTruthy();
        expect(!fd.condition('yesterday').logic(now) && fd.condition('yesterday').logic(yesterday), 'yesterday').toBeTruthy();
    });
    it('tests boolean conditions', () => {
        const f = IgxBooleanFilteringOperand.instance();
        expect(f.condition('empty').logic(null) && f.condition('empty').logic(undefined) && !f.condition('empty').logic(false), 'empty').toBeTruthy();
        expect(f.condition('false').logic(false) && !f.condition('false').logic(true), 'false').toBeTruthy();
        expect(!f.condition('true').logic(false) && f.condition('true').logic(true), 'true').toBeTruthy();
        expect(!f.condition('notEmpty').logic(null) && !f.condition('notEmpty').logic(undefined) && f.condition('notEmpty').logic(false), 'notEmpty').toBeTruthy();
        expect(f.condition('null').logic(null) && !f.condition('null').logic(undefined) && !f.condition('null').logic(false), 'null').toBeTruthy();
        expect(!f.condition('notNull').logic(null) && f.condition('notNull').logic(undefined) && f.condition('notNull').logic(false), 'notNull').toBeTruthy();
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
