import { IgxSelectionAPIService } from './selection';

describe('IgxSelectionAPIService', () => {
    let service;
    beforeEach(() => {
        service = new IgxSelectionAPIService();
    });

    afterEach(() => {
    });

    it('call set method with undefined componentID', () => {
        service.set(undefined, new Set());
        expect(service.get(undefined)).toBeUndefined();
    });

    it('call add_item method with undefined itemID', () => {
        const componentId = 'id1';
        service.set(componentId, new Set());
        const set = service.add_item(componentId, undefined);
        expect(set.size).toEqual(0);
    });
});
