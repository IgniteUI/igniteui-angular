import { computed } from '@angular/core';
import { countEffectRuns } from '../../../test-utils/effect-runs.spec';
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

    it('should update computed reads of a component selection after every change to it', () => {
        const componentId = 'id1';
        // Created before anything is set, as a drop-down reads its selection before the first one.
        const selection = computed(() => service.get(componentId));
        const size = computed(() => service.size(componentId));
        const first = computed(() => service.first_item(componentId));
        const hasB = computed(() => service.is_item_selected(componentId, 'b'));
        const read = () => ({
            items: selection() ? [...selection()] : undefined,
            size: size(),
            first: first(),
            hasB: hasB()
        });
        expect(read()).toEqual({ items: undefined, size: 0, first: undefined, hasB: false });

        service.set(componentId, new Set(['a']));
        expect(read()).withContext('set').toEqual({ items: ['a'], size: 1, first: 'a', hasB: false });

        service.select_item(componentId, 'b');
        expect(read()).withContext('select_item').toEqual({ items: ['a', 'b'], size: 2, first: 'a', hasB: true });

        service.deselect_item(componentId, 'a');
        expect(read()).withContext('deselect_item').toEqual({ items: ['b'], size: 1, first: 'b', hasB: true });

        service.select_items(componentId, ['c', 'd'], true);
        expect(read()).withContext('select_items').toEqual({ items: ['c', 'd'], size: 2, first: 'c', hasB: false });

        service.deselect_items(componentId, ['c']);
        expect(read()).withContext('deselect_items').toEqual({ items: ['d'], size: 1, first: 'd', hasB: false });

        service.clear(componentId);
        expect(read()).withContext('clear').toEqual({ items: [], size: 0, first: undefined, hasB: false });

        service.select_item(componentId, 'b');
        expect(read()).withContext('select_item after clear').toEqual({ items: ['b'], size: 1, first: 'b', hasB: true });

        service.delete(componentId);
        expect(read()).withContext('delete').toEqual({ items: undefined, size: 0, first: undefined, hasB: false });
    });

    it('should not recompute reads of a component selection when another component selection changes', () => {
        service.set('id1', new Set(['a']));
        service.set('id2', new Set(['x']));
        let runs = 0;
        const reads = computed(() => {
            runs++;
            return {
                selection: service.get('id1'),
                size: service.size('id1'),
                first: service.first_item('id1'),
                hasA: service.is_item_selected('id1', 'a')
            };
        });
        expect(reads().size).toBe(1);
        expect(runs).toBe(1);

        const otherChanges: [string, () => void][] = [
            ['set', () => service.set('id2', new Set(['y']))],
            ['select_item', () => service.select_item('id2', 'z')],
            ['select_items', () => service.select_items('id2', ['v', 'w'], true)],
            ['deselect_item', () => service.deselect_item('id2', 'v')],
            ['deselect_items', () => service.deselect_items('id2', ['w'])],
            ['clear', () => service.clear('id2')],
            ['delete', () => service.delete('id2')],
            ['set for a new component', () => service.set('id3', new Set(['n']))]
        ];
        for (const [change, apply] of otherChanges) {
            apply();
            expect(reads().size).withContext(change).toBe(1);
            expect(runs).withContext(change).toBe(1);
        }

        // The same reads still follow a change of their own component.
        service.select_item('id1', 'b');
        expect(reads().size).toBe(2);
        expect(runs).toBe(2);
    });

    it('should keep a version only until the selection it follows changes', () => {
        const versions = () => [...(service as any)._versions.keys()];
        const selection = computed(() => service.get('id1'));
        expect(selection()).toBeUndefined();
        expect(versions()).toEqual(['id1']);

        // A change notifies the read and drops the version; the read starts a new one.
        service.set('id1', new Set(['a']));
        expect(versions()).toEqual([]);
        expect([...selection()]).toEqual(['a']);
        expect(versions()).toEqual(['id1']);

        // An id input reads the old selection and then clears it, which leaves nothing behind.
        service.get('id2');
        service.first_item('id3');
        service.clear('id2');
        service.select_item('id3', 'a');
        service.delete('id1');
        expect(versions()).toEqual([]);

        // The read still follows the selection after the version was dropped.
        service.set('id1', new Set(['b']));
        expect([...selection()]).toEqual(['b']);
    });

    it('should run an effect that changes a component selection once', async () => {
        // These changes build on the current selection, which they read before they write it.
        const changes: [string, () => void, string[]][] = [
            ['select_item', () => service.select_item('id1', 'b'), ['a', 'b']],
            ['select_items', () => service.select_items('id1', ['b', 'c']), ['a', 'b', 'c']],
            ['deselect_item', () => service.deselect_item('id1', 'a'), []],
            ['deselect_items', () => service.deselect_items('id1', ['a']), []]
        ];
        for (const [change, apply, expected] of changes) {
            service.set('id1', new Set(['a']));
            expect(await countEffectRuns(apply)).withContext(change).toBe(1);
            expect([...service.get('id1')]).withContext(change).toEqual(expected);
        }
    });

    it('should notify the readers of a component selection only when a set changes it', async () => {
        service.set('id1', new Set(['a', 'b']));
        // The effect reads the selection on purpose. Setting the same keys again changes nothing,
        // so it must not run the effect again, or the effect would never settle.
        expect(await countEffectRuns(() => service.set('id1', new Set(service.get('id1'))))).toBe(1);

        const keys = computed(() => [...service.get('id1')]);
        expect(keys()).toEqual(['a', 'b']);
        // Readers list the keys in their order, so the same keys in another order are a change.
        service.set('id1', new Set(['b', 'a']));
        expect(keys()).withContext('another order').toEqual(['b', 'a']);
        // The set a reader got may have been changed in place, so setting it again is a change too.
        service.get('id1').add('c');
        service.set('id1', service.get('id1'));
        expect(keys()).withContext('changed in place').toEqual(['b', 'a', 'c']);
    });
});
