import { cloneObject } from './utils';
import { SampleTestData } from '../test-utils/sample-test-data.spec';

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

    describe('Utils - cloneObject unit tests', () => {
        it('Should return primitive values', () => {
            let input: any = 10;
            let expected: any = 10;
            expect(cloneObject(input)).toBe(expected);

            input = 0;
            expected = 0;
            expect(cloneObject(input)).toBe(expected);

            input = Infinity;
            expected = Infinity;
            expect(cloneObject(input)).toBe(expected);

            input = '';
            expected = '';
            expect(cloneObject(input)).toBe(expected);

            input = true;
            expected = true;
            expect(cloneObject(input)).toBe(expected);

            input = false;
            expected = false;
            expect(cloneObject(input)).toBe(expected);

            input = null;
            expected = null;
            expect(cloneObject(input)).toBe(expected);

            input = undefined;
            expected = undefined;
            expect(cloneObject(input)).toBe(expected);
        });

        it('Should not clone Map or Set', () => {
            const mapInput: Map<string, number> = new Map();
            mapInput.set('a', 0);
            mapInput.set('b', 1);
            mapInput.set('c', 2);
            const mapClone = cloneObject(mapInput);
            expect(mapInput).toBe(mapClone);

            const setInput: Set<Number> = new Set();
            setInput.add(0);
            setInput.add(1);
            setInput.add(2);
            const setClone = cloneObject(setInput);
            expect(setInput).toBe(setClone);
        });

        it('Should clone correctly dates', () => {
            const input: Date = new Date(0);
            const clone: Date = cloneObject(input);
            expect(clone).not.toBe(input);
            expect(clone.getTime()).toBe(input.getTime());

            //  change of the input should not change the clone
            input.setDate(10);
            expect(clone.getTime()).not.toBe(input.getTime());
        });

        it('Should create shallow copy of array', () => {
            const input: { Number: any, String: any, Boolean: any, Date: any }[] = SampleTestData.differentTypesData();
            const clone: { Number: any, String: any, Boolean: any, Date: any }[] = cloneObject(input);
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
            const clone = cloneObject(input);
            expect(input).toEqual(clone);
        });
    });
});
