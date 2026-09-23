import { SampleTestData } from 'igniteui-angular/test-utils/sample-test-data.spec';
import { cloneValue, cloneValueCached, cloneHierarchicalArray, compareMaps, getComponentCssSizeVar,
    intoChunks, isDate, isLeftToRight, isObject, showMessage, uniqueDates } from './utils';

describe('Utils', () => {
    const complexObject = {
        Number: 0,
        String: 'Some string',
        Boolean: true,
        Date: new Date(0),
        Object10: {
            Number: 10,
            String: 'Some second level string 10',
            Boolean: false,
            Date: new Date(10 * 1000 * 60 * 60 * 24),
            Object100: {
                Number: 100,
                String: 'Some third level string 100',
                Boolean: false,
                Date: new Date(100 * 1000 * 60 * 60 * 24),
            },
            Object101: {
                Number: 101,
                String: 'Some third level string 101',
                Boolean: false,
                Date: new Date(101 * 1000 * 60 * 60 * 24),
            }
        },
        Object11: {
            Number: 11,
            String: 'Some second level string 11',
            Boolean: false,
            Date: new Date(11 * 1000 * 60 * 60 * 24),
            Object110: {
                Number: 110,
                String: 'Some third level string 110',
                Boolean: false,
                Date: new Date(110 * 1000 * 60 * 60 * 24),
            },
            Object111: {
                Number: 111,
                String: 'Some third level string 111',
                Boolean: false,
                Date: new Date(111 * 1000 * 60 * 60 * 24),
            }
        }
    };

    describe('Utils - cloneValue() unit tests', () => {
        it('Should return primitive values', () => {
            let input: any = 10;
            let expected: any = 10;
            expect(cloneValue(input)).toBe(expected);

            input = 0;
            expected = 0;
            expect(cloneValue(input)).toBe(expected);

            input = Infinity;
            expected = Infinity;
            expect(cloneValue(input)).toBe(expected);

            input = '';
            expected = '';
            expect(cloneValue(input)).toBe(expected);

            input = true;
            expected = true;
            expect(cloneValue(input)).toBe(expected);

            input = false;
            expected = false;
            expect(cloneValue(input)).toBe(expected);

            input = null;
            expected = null;
            expect(cloneValue(input)).toBe(expected);

            input = undefined;
            expected = undefined;
            expect(cloneValue(input)).toBe(expected);
        });

        it('Should not clone Map or Set', () => {
            const mapInput: Map<string, number> = new Map();
            mapInput.set('a', 0);
            mapInput.set('b', 1);
            mapInput.set('c', 2);
            const mapClone = cloneValue(mapInput);
            expect(mapInput).toBe(mapClone);

            const setInput: Set<number> = new Set();
            setInput.add(0);
            setInput.add(1);
            setInput.add(2);
            const setClone = cloneValue(setInput);
            expect(setInput).toBe(setClone);
        });

        it('Should clone correctly dates', () => {
            const input: Date = new Date(0);
            const clone: Date = cloneValue(input);
            expect(clone).not.toBe(input);
            expect(clone.getTime()).toBe(input.getTime());

            //  change of the input should not change the clone
            input.setDate(10);
            expect(clone.getTime()).not.toBe(input.getTime());
        });

        it('Should create shallow copy of array', () => {
            const input: { Number: any; String: any; Boolean: any; Date: any }[] = SampleTestData.differentTypesData();
            const clone: { Number: any; String: any; Boolean: any; Date: any }[] = cloneValue(input);
            expect(clone).not.toBe(input);
            expect(clone.length).toBe(input.length);
            expect(clone).toEqual(input);

            input[0].String = input[0].String + ' some additional value';
            input[0].Boolean = !input[0].Boolean;
            input[0].Number *= 1000;
            expect(clone).toEqual(input);
        });

        it('Should correctly deep clone objects', () => {
            const input = complexObject;
            const clone = cloneValue(input);
            expect(input).toEqual(clone);
            expect(input.Object10).toEqual(clone.Object10);
            expect(input.Object11).toEqual(clone.Object11);

            expect(input.Date).toEqual(clone.Date);
            expect(input.Date).not.toBe(clone.Date);
            expect(input.Date.getTime()).toBe(clone.Date.getTime());

            expect(input.Object10.Date).toEqual(clone.Object10.Date);
            expect(input.Object10.Date).not.toBe(clone.Object10.Date);
            expect(input.Object10.Date.getTime()).toBe(clone.Object10.Date.getTime());

            expect(input.Object11.Object111.Date).toEqual(clone.Object11.Object111.Date);
            expect(input.Object11.Object111.Date).not.toBe(clone.Object11.Object111.Date);
            expect(input.Object11.Object111.Date.getTime()).toBe(clone.Object11.Object111.Date.getTime());

            expect(input.Number).toBe(clone.Number);
            expect(input.Object10.Number).toBe(clone.Object10.Number);
            expect(input.Object11.Object111.Number).toBe(clone.Object11.Object111.Number);

            expect(input.String).toBe(clone.String);
            expect(input.Object10.String).toBe(clone.Object10.String);
            expect(input.Object11.Object111.String).toBe(clone.Object11.Object111.String);

            expect(input.Boolean).toBe(clone.Boolean);
            expect(input.Object10.Boolean).toBe(clone.Object10.Boolean);
            expect(input.Object11.Object111.Boolean).toBe(clone.Object11.Object111.Boolean);
        });

        it('Should correctly deep clone object with special values', () => {
            const objectWithSpecialValues = {};
            objectWithSpecialValues['Null'] = null;
            objectWithSpecialValues['Undefined'] = undefined;
            const clone = cloneValue(objectWithSpecialValues);

            expect(clone.Null).toBeNull();
            expect(clone.undefined).toBeUndefined();
        });

        it('Should correctly handle null and undefined values', () => {
            const nullClone = cloneValue(null);
            expect(nullClone).toBeNull();

            const undefinedClone = cloneValue(undefined);
            expect(undefinedClone).toBeUndefined();
        });

        it('Should skip the `externalObject` key', () => {
            const source = { Number: 1, externalObject: { framework: 'reference that must not be cloned' } };

            const clone = cloneValue(source);

            expect(clone.Number).toBe(1);
            expect('externalObject' in clone).toBeFalsy();
        });
    });

    describe('Utils - cloneValueCached() unit tests', () => {
        it('Should clone primitives, dates and arrays the same way cloneValue does', () => {
            const cache = new Map<any, any>();
            const date = new Date(10 * 1000 * 60 * 60 * 24);
            const array = [1, { a: 1 }, 'string'];

            expect(cloneValueCached(1, cache)).toBe(1);
            expect(cloneValueCached('string', cache)).toBe('string');
            expect(cloneValueCached(true, cache)).toBe(true);
            expect(cloneValueCached(null, cache)).toBeNull();
            expect(cloneValueCached(undefined, cache)).toBeUndefined();

            const clonedDate = cloneValueCached(date, cache);
            expect(clonedDate).toEqual(date);
            expect(clonedDate).not.toBe(date);

            // Arrays are shallow copied - the array itself is new, its items are not.
            const clonedArray = cloneValueCached(array, cache);
            expect(clonedArray).toEqual(array);
            expect(clonedArray).not.toBe(array);
            expect(clonedArray[1]).toBe(array[1]);
        });

        it('Should not clone Map or Set', () => {
            const cache = new Map<any, any>();
            const map = new Map([['key', 'value']]);
            const set = new Set(['value']);

            expect(cloneValueCached(map, cache)).toBe(map);
            expect(cloneValueCached(set, cache)).toBe(set);
        });

        it('Should deep clone objects', () => {
            const cache = new Map<any, any>();
            const clone = cloneValueCached(complexObject, cache);

            expect(clone).toEqual(complexObject);
            expect(clone).not.toBe(complexObject);
            expect(clone.Object10).not.toBe(complexObject.Object10);
            expect(clone.Object10.Object100).not.toBe(complexObject.Object10.Object100);
        });

        it('Should reuse the cached clone for repeated references', () => {
            const cache = new Map<any, any>();
            const shared = { value: 'shared' };
            const source = { first: shared, second: shared };

            const clone = cloneValueCached(source, cache);

            expect(clone).toEqual(source);
            // The same source reference has to resolve to the same clone, not to two separate copies.
            expect(clone.first).toBe(clone.second);
            expect(clone.first).not.toBe(shared);
        });

        it('Should handle circular references', () => {
            const cache = new Map<any, any>();
            const source: any = { name: 'root' };
            source.self = source;
            source.child = { parent: source };

            const clone = cloneValueCached(source, cache);

            expect(clone.name).toBe('root');
            expect(clone.self).toBe(clone);
            expect(clone.child.parent).toBe(clone);
            expect(clone).not.toBe(source);
        });
    });

    describe('Utils - uniqueDates() unit tests', () => {
        it('Should keep only the first entry for every distinct label', () => {
            const first = { label: '1/1/2024', value: new Date(2024, 0, 1) };
            const duplicate = { label: '1/1/2024', value: new Date(2024, 0, 1) };
            const second = { label: '2/1/2024', value: new Date(2024, 1, 1) };

            expect(uniqueDates([first, duplicate, second, second])).toEqual([first, second]);
            expect(uniqueDates([])).toEqual([]);
        });
    });

    describe('Utils - compareMaps() unit tests', () => {
        it('Should compare maps by size, keys and values', () => {
            const map = new Map([['a', 1], ['b', 2]]);

            expect(compareMaps(map, new Map([['a', 1], ['b', 2]]))).toBeTruthy('equal maps');
            expect(compareMaps(map, new Map([['a', 1], ['b', 3]]))).toBeFalsy('different value');
            expect(compareMaps(map, new Map([['a', 1], ['c', 2]]))).toBeFalsy('different key');
            expect(compareMaps(map, new Map([['a', 1]]))).toBeFalsy('different size');
            expect(compareMaps(new Map(), new Map())).toBeTruthy('two empty maps');
        });

        it('Should treat a missing second map as equal only to a missing first one', () => {
            expect(compareMaps(null, null)).toBeTruthy('both missing');
            expect(compareMaps(new Map([['a', 1]]), null)).toBeFalsy('only the second one missing');
        });
    });

    describe('Utils - intoChunks() unit tests', () => {
        it('Should split an array into chunks of the requested size', () => {
            const array = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

            expect(Array.from(intoChunks(array, 2))).toEqual([[0, 1], [2, 3], [4, 5], [6, 7], [8, 9]]);
            // The last chunk holds the remainder when the size is not a divisor of the length.
            expect(Array.from(intoChunks(array, 3))).toEqual([[0, 1, 2], [3, 4, 5], [6, 7, 8], [9]]);
            expect(Array.from(intoChunks(array, 20))).toEqual([array]);
            expect(Array.from(intoChunks([], 3))).toEqual([]);
        });

        it('Should throw for a chunk size below one', () => {
            expect(() => Array.from(intoChunks([1, 2, 3], 0))).toThrowError('size must be an integer >= 1');
            expect(() => Array.from(intoChunks([1, 2, 3], -3))).toThrowError('size must be an integer >= 1');
        });
    });

    describe('Utils - getComponentCssSizeVar() unit tests', () => {
        it('Should map the numeric size to the matching CSS variable', () => {
            expect(getComponentCssSizeVar('1')).toBe('var(--ig-size, var(--ig-size-small))');
            expect(getComponentCssSizeVar('2')).toBe('var(--ig-size, var(--ig-size-medium))');
            expect(getComponentCssSizeVar('3')).toBe('var(--ig-size, var(--ig-size-large))');
            // Anything unrecognized falls back to the large size.
            expect(getComponentCssSizeVar('')).toBe('var(--ig-size, var(--ig-size-large))');
        });
    });

    describe('Utils - showMessage() unit tests', () => {
        it('Should always report the message as shown', () => {
            // The warning itself is a console side effect - what the callers act on is the returned flag,
            // which has to stay `true` both for the call that logs and for the one that skips it.
            expect(showMessage('Deprecated', false)).toBeTruthy('not shown yet');
            expect(showMessage('Deprecated', true)).toBeTruthy('already shown');
        });
    });

    describe('Utils - cloneHierarchicalArray() unit tests', () => {
        it('Should clone nested arrays and tolerate a missing source', () => {
            const source = [
                { id: 1, children: [{ id: 11, children: [] }] },
                { id: 2 }
            ];

            const clone = cloneHierarchicalArray(source, 'children');
            expect(clone).toEqual(source);
            expect(clone).not.toBe(source);
            expect(clone[0].children).not.toBe(source[0].children);

            expect(cloneHierarchicalArray(null, 'children')).toEqual([]);
        });
    });

    describe('Utils - isLeftToRight() unit tests', () => {
        it('Should default to left-to-right when there is no element', () => {
            expect(isLeftToRight(null)).toBeTruthy('no element');
        });
    });

    describe('Utils - isObject() unit tests', () => {
        it('Should correctly determine if variable is Object', () => {
            let variable: any = {};
            expect(isObject(variable)).toBeTruthy();

            variable = 10;
            expect(isObject(variable)).toBeFalsy();

            variable = 'Some string';
            expect(isObject(variable)).toBeFalsy();

            variable = '';
            expect(isObject(variable)).toBeFalsy();

            variable = true;
            expect(isObject(variable)).toBeFalsy();

            variable = false;
            expect(isObject(variable)).toBeFalsy();

            variable = new Date(0);
            expect(isObject(variable)).toBeFalsy();

            variable = null;
            expect(isObject(variable)).toBeFalsy();

            variable = undefined;
            expect(isObject(variable)).toBeFalsy();

            variable = [];
            expect(isObject(variable)).toBeFalsy();

            variable = new Map();
            expect(isObject(variable)).toBeFalsy();

            variable = new Set();
            expect(isObject(variable)).toBeFalsy();
        });
    });

    describe('Utils - isDate() unit tests', () => {
        it('Should correctly determine if variable is Date', () => {
            let variable: any = new Date(0);
            expect(isDate(variable)).toBeTruthy();

            variable = new Date('wrong date parameter');
            expect(isDate(variable)).toBeTruthy();

            variable = 10;
            expect(isDate(variable)).toBeFalsy();

            variable = 'Some string';
            expect(isDate(variable)).toBeFalsy();

            variable = '';
            expect(isDate(variable)).toBeFalsy();

            variable = true;
            expect(isDate(variable)).toBeFalsy();

            variable = false;
            expect(isDate(variable)).toBeFalsy();

            variable = {};
            expect(isDate(variable)).toBeFalsy();

            variable = null;
            expect(isDate(variable)).toBeFalsy();

            variable = undefined;
            expect(isDate(variable)).toBeFalsy();

            variable = [];
            expect(isDate(variable)).toBeFalsy();

            variable = new Map();
            expect(isDate(variable)).toBeFalsy();

            variable = new Set();
            expect(isDate(variable)).toBeFalsy();
        });
    });
});
