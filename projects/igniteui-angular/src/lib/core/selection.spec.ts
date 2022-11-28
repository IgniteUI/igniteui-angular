import {IgxSelectionAPIService} from './selection';

describe('IgxSelectionAPIService', () => {
    let service;
    beforeEach(() => {
        service = new IgxSelectionAPIService();
    });

    it('call set method with undefined componentID', () => {
        expect(() => service.set(undefined, new Set())).toThrowError('Invalid value for component id!');
    });

    it('call add_item method with falsy itemID', () => {
        const componentId = 'id1';
        service.set(componentId, new Set());

        const selection1 = service.add_item(componentId, 0);
        expect(selection1.has(0)).toBe(true);

        const selection2 = service.add_item(componentId, false);
        expect(selection2.has(false)).toBe(true);

        const selection3 = service.add_item(componentId, null);
        expect(selection3.has(null)).toBe(true);

        const selection4 = service.add_item(componentId, '');
        expect(selection4.has('')).toBe(true);

        const selection5 = service.add_item(componentId, NaN);
        expect(selection5.has(NaN)).toBe(true);
    });
});
