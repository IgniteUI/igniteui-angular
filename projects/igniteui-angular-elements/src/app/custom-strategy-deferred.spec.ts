import { firstValueFrom, fromEvent } from 'rxjs';
import { ComponentRefKey, IgcNgElement } from './custom-strategy';
import { IgcColumnComponent, IgcTreeGridComponent } from './components';
import { defineComponents } from '../utils/register';
import { IgxTreeGridComponent } from '../lib/grids/tree-grid.component';
import { describe, it, expect } from 'vitest';

describe('Elements: deferred parent definition', () => {
    it('should wait for the parent element to be defined before attaching to it', async () => {
        // Relies on the per-file isolation of the test runner for a clean custom elements registry
        expect(customElements.get('igc-tree-grid')).toBeUndefined();
        defineComponents(IgcColumnComponent);

        const container = document.createElement('div');
        document.body.appendChild(container);
        try {
            container.innerHTML = `
                <igc-tree-grid id="treeGrid">
                    <igc-column field="ID"></igc-column>
                    <igc-column field="Name"></igc-column>
                </igc-tree-grid>`;
            const treeGridEl = container.querySelector('#treeGrid');
            const columnEls = Array.from(container.querySelectorAll<IgcNgElement>('igc-column'));

            // columns connect first, but have to wait for their parent to be defined
            let columnsResolved = false;
            const columnRefs = Promise.all(columnEls.map(c => c.ngElementStrategy[ComponentRefKey]))
                .then(refs => {
                    columnsResolved = true;
                    return refs;
                });
            await Promise.resolve();
            expect(columnsResolved).toBe(false);

            const childrenResolved = firstValueFrom(fromEvent(treeGridEl, 'childrenResolved'));
            defineComponents(IgcTreeGridComponent);

            const treeGrid = (await (treeGridEl as IgcNgElement).ngElementStrategy[ComponentRefKey]).instance as IgxTreeGridComponent;
            const columns = (await columnRefs).map(ref => ref.instance);
            await childrenResolved;

            expect(treeGrid.columnList.toArray()).toEqual(columns);
            expect(treeGrid.columns.map(c => c.field)).toEqual(['ID', 'Name']);
        } finally {
            container.remove();
        }
    });
});
