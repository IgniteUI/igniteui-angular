import { defineComponents, IgniteComponent, registerComponent } from './register';
import { defineAllComponents } from './define-all';
import { describe, it, expect, vi, afterEach } from 'vitest';

let uniqueId = 0;
const createComponent = (): IgniteComponent => {
    const ctor = class extends HTMLElement { } as unknown as IgniteComponent;
    ctor.tagName = `igc-register-test-${uniqueId++}`;
    ctor.register = vi.fn(() => registerComponent(ctor));
    return ctor;
};

describe('Elements register utils', () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('registerComponent should define the component and register its dependencies first', () => {
        const dependency = createComponent();
        const component = createComponent();
        const defineSpy = vi.spyOn(customElements, 'define');

        registerComponent(component, dependency);

        expect(dependency.register).toHaveBeenCalledTimes(1);
        expect(customElements.get(dependency.tagName)).toBe(dependency);
        expect(customElements.get(component.tagName)).toBe(component);
        expect(defineSpy.mock.calls.map(([tag]) => tag)).toEqual([dependency.tagName, component.tagName]);
    });

    it('registerComponent should not re-define an already defined component', () => {
        const component = createComponent();
        registerComponent(component);
        const defineSpy = vi.spyOn(customElements, 'define');

        expect(() => registerComponent(component)).not.toThrow();
        expect(defineSpy).not.toHaveBeenCalled();
    });

    it('defineComponents should call register on every component', () => {
        const components = [createComponent(), createComponent()];

        defineComponents(...components);

        components.forEach(c => {
            expect(c.register).toHaveBeenCalledTimes(1);
            expect(customElements.get(c.tagName)).toBe(c);
        });
    });

    it('defineAllComponents should define all grid related elements', () => {
        defineAllComponents();

        const tags = [
            'igc-grid',
            'igc-tree-grid',
            'igc-hierarchical-grid',
            'igc-pivot-grid',
            'igc-pivot-data-selector',
            'igc-row-island',
            'igc-column-group',
            'igc-column-layout',
            'igc-column',
            'igc-paginator',
            'igc-grid-toolbar',
            'igc-action-strip',
            'igc-grid-state',
            'igc-grid-editing-actions',
            'igc-grid-pinning-actions',
            'igc-grid-toolbar-title',
            'igc-grid-toolbar-actions',
            'igc-grid-toolbar-hiding',
            'igc-grid-toolbar-pinning',
            'igc-grid-toolbar-exporter',
            'igc-grid-toolbar-advanced-filtering',
            'igc-query-builder',
            'igc-query-builder-header'
        ];
        const undefinedTags = tags.filter(tag => !customElements.get(tag));
        expect(undefinedTags).toEqual([]);
    });
});
