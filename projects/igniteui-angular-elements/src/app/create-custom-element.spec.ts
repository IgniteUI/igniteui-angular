import { Component, Input } from '@angular/core';
import {
    FilteringExpressionsTree,
    FilteringLogic,
    IgxBooleanFilteringOperand,
    IgxDateFilteringOperand,
    IgxDateTimeFilteringOperand,
    IgxGridComponent,
    IgxNumberFilteringOperand,
    IgxStringFilteringOperand,
    IgxTimeFilteringOperand
} from 'igniteui-angular';
import { ComponentConfig } from './component-config';
import { createIgxCustomElement, withRegister } from './create-custom-element';
import { ComponentRefKey, IgcNgElement } from './custom-strategy';
import { injector } from '../utils/injector-ref';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

@Component({
    selector: 'igx-custom-element-test',
    template: `{{ value }}`,
    standalone: true
})
class CustomElementTestComponent {
    @Input()
    public value: string;

    @Input()
    public showUI: boolean;

    public counter = 0;
    public readonlyProp = 'readonly';
    public writableProp = 'writable';

    public increment(by: number) {
        this.counter += by;
        return this.counter;
    }
}

const TEST_TAG = 'igc-custom-element-test';

const createConfig = (overrides: Partial<ComponentConfig> = {}): ComponentConfig[] => [{
    component: CustomElementTestComponent,
    selector: TEST_TAG,
    parents: [],
    contentQueries: [],
    additionalProperties: [
        { name: 'readonlyProp' },
        { name: 'writableProp', writable: true }
    ],
    methods: ['increment'],
    ...overrides
}];

describe('createIgxCustomElement', () => {
    const elementCtor = createIgxCustomElement(CustomElementTestComponent, { injector, registerConfig: createConfig() });
    if (!customElements.get(TEST_TAG)) {
        customElements.define(TEST_TAG, elementCtor);
    }

    let element: IgcNgElement & CustomElementTestComponent;

    beforeEach(() => {
        element = document.createElement(TEST_TAG) as IgcNgElement & CustomElementTestComponent;
        document.body.appendChild(element);
    });

    afterEach(() => {
        element.remove();
        vi.restoreAllMocks();
    });

    const getInstance = async () =>
        (await element.ngElementStrategy[ComponentRefKey]).instance as CustomElementTestComponent;

    it('should expose the configured selector as static tagName', () => {
        expect(elementCtor.tagName).toBe(TEST_TAG);
        expect(Object.getOwnPropertyDescriptor(elementCtor, 'tagName').writable).toBe(false);
    });

    it('should proxy configured methods to the component instance and schedule change detection', async () => {
        const instance = await getInstance();
        const notifySpy = vi.spyOn(element.ngElementStrategy, 'notifyChanges');

        expect(element.increment(2)).toBe(2);
        expect(element.increment(3)).toBe(5);

        expect(instance.counter).toBe(5);
        expect(notifySpy).toHaveBeenCalledTimes(2);
    });

    it('should expose additional properties as getters on the element', async () => {
        const instance = await getInstance();

        expect(element.readonlyProp).toBe('readonly');
        instance.readonlyProp = 'changed';
        expect(element.readonlyProp).toBe('changed');
    });

    it('should only allow setting writable additional properties', async () => {
        const instance = await getInstance();
        const setInputSpy = vi.spyOn(element.ngElementStrategy, 'setInputValue').mockImplementation(() => {});

        element.writableProp = 'updated';
        expect(setInputSpy).toHaveBeenCalledExactlyOnceWith('writableProp', 'updated');

        expect(() => (element as any).readonlyProp = 'nope').toThrow(TypeError);
        expect(instance.readonlyProp).toBe('readonly');
    });

    it('should throw for additional properties that clash with the element prototype', () => {
        const config = createConfig({ additionalProperties: [{ name: 'connectedCallback' }] });

        expect(() => createIgxCustomElement(CustomElementTestComponent, { injector, registerConfig: config }))
            .toThrowError(`Potentially illegal property name connectedCallback defined for ${CustomElementTestComponent.name}`);
    });

    it('should add the deprecated getFilterFactory to IgxGridComponent elements', () => {
        const config: ComponentConfig[] = [{
            component: IgxGridComponent,
            selector: 'igc-filter-factory-test-grid',
            parents: [],
            contentQueries: [],
            additionalProperties: [],
            methods: []
        }];
        const gridCtor = createIgxCustomElement(IgxGridComponent, { injector, registerConfig: config });
        const otherCtor = createIgxCustomElement(CustomElementTestComponent, { injector, registerConfig: createConfig() });

        expect(otherCtor.prototype.getFilterFactory).toBeUndefined();

        const factory = gridCtor.prototype.getFilterFactory();
        expect(factory.stringFilteringOperand).toBe(IgxStringFilteringOperand.instance());
        expect(factory.numberFilteringOperand).toBe(IgxNumberFilteringOperand.instance());
        expect(factory.timeFilteringOperand).toBe(IgxTimeFilteringOperand.instance());
        expect(factory.dateTimeFilteringOperand).toBe(IgxDateTimeFilteringOperand.instance());
        expect(factory.dateFilteringOperand).toBe(IgxDateFilteringOperand.instance());
        expect(factory.booleanFilteringOperand).toBe(IgxBooleanFilteringOperand.instance());

        const tree = factory.createFilteringExpressionTree(FilteringLogic.Or, 'Name');
        expect(tree).toBeInstanceOf(FilteringExpressionsTree);
        expect(tree.operator).toBe(FilteringLogic.Or);
        expect(tree.fieldName).toBe('Name');
    });
});

describe('withRegister', () => {
    it('should attach a non-writable static register function', () => {
        const ctor = createIgxCustomElement(CustomElementTestComponent, { injector, registerConfig: createConfig() });
        const register = vi.fn();

        const component = withRegister(ctor, register);
        component.register();

        expect(component).toBe(ctor);
        expect(register).toHaveBeenCalledTimes(1);
        expect(Object.getOwnPropertyDescriptor(component, 'register').writable).toBe(false);
    });
});
