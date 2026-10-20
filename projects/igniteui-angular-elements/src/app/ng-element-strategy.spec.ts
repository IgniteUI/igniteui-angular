import { Component, EventEmitter, Input, Output } from '@angular/core';
import { NgElementStrategyEvent } from '@angular/elements';
import { firstValueFrom, timer } from 'rxjs';
import { ComponentNgElementStrategy, ComponentNgElementStrategyFactory, extractProjectableNodes } from './ng-element-strategy';
import { injector } from '../utils/injector-ref';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';

@Component({
    selector: 'igx-strategy-test',
    template: `<div class="header"><ng-content select="header"></ng-content></div><span class="value">{{ value }}</span><div class="rest"><ng-content></ng-content></div>`,
    standalone: true
})
class StrategyTestComponent {
    @Input()
    public value: string;

    @Input('aliasName')
    public aliased: string;

    @Output()
    public valueChanged = new EventEmitter<string>();

    public destroyed = false;

    public ngOnDestroy() {
        this.destroyed = true;
    }
}

/** DESTROY_DELAY in ng-element-strategy */
const DESTROY_DELAY = 10;

describe('ComponentNgElementStrategy', () => {
    let host: HTMLElement;
    let strategy: ComponentNgElementStrategy;

    const componentRef = () => (strategy as any).componentRef;

    beforeEach(() => {
        host = document.createElement('div');
        document.body.appendChild(host);
        strategy = new ComponentNgElementStrategyFactory(StrategyTestComponent).create(injector);
    });

    afterEach(() => {
        strategy.disconnect();
        host.remove();
    });

    it('should create strategies that map input property names to template names', () => {
        const factory = new ComponentNgElementStrategyFactory(StrategyTestComponent);

        expect(factory.create(injector)).toBeInstanceOf(ComponentNgElementStrategy);
        expect(factory.inputMap.get('value')).toBe('value');
        expect(factory.inputMap.get('aliased')).toBe('aliasName');
    });

    it('should cache input values set before connect and apply them on connect', () => {
        strategy.setInputValue('value', 'initial');
        strategy.setInputValue('aliased', 'aliased initial');

        expect(componentRef()).toBeNull();
        expect(strategy.getInputValue('value')).toBe('initial');

        strategy.connect(host);

        const instance = componentRef().instance as StrategyTestComponent;
        expect(instance.value).toBe('initial');
        expect(instance.aliased).toBe('aliased initial');
        expect(host.querySelector('.value').textContent).toBe('initial');
        expect((strategy as any).initialInputValues.size).toBe(0);
    });

    it('should set inputs on the component through their template name after connect', () => {
        strategy.connect(host);
        const instance = componentRef().instance as StrategyTestComponent;

        strategy.setInputValue('aliased', 'new value');
        expect(instance.aliased).toBe('new value');
        expect(strategy.getInputValue('aliased')).toBe('new value');

        // setting an unchanged value should leave the view clean
        componentRef().hostView.detectChanges();
        strategy.setInputValue('aliased', 'new value');
        expect(instance.aliased).toBe('new value');
    });

    it('should emit component outputs through the events stream', () => {
        const events: NgElementStrategyEvent[] = [];
        const sub = strategy.events.subscribe(e => events.push(e));
        strategy.connect(host);

        (componentRef().instance as StrategyTestComponent).valueChanged.emit('changed');
        expect(events).toEqual([{ name: 'valueChanged', value: 'changed' }]);

        sub.unsubscribe();
        (componentRef().instance as StrategyTestComponent).valueChanged.emit('ignored');
        expect(events.length).toBe(1);
    });

    it('should project child nodes into the matching content slots', () => {
        const header = document.createElement('header');
        header.textContent = 'Header';
        const span = document.createElement('span');
        span.textContent = 'Content';
        host.appendChild(span);
        host.appendChild(header);
        host.appendChild(document.createTextNode('Text'));

        strategy.connect(host);

        expect(host.querySelector('.header').contains(header)).toBe(true);
        expect(host.querySelector('.rest').contains(span)).toBe(true);
        expect(host.querySelector('.rest').textContent).toBe('ContentText');
    });

    it('should destroy the component with a delay after disconnect', async () => {
        strategy.connect(host);
        const instance = componentRef().instance as StrategyTestComponent;

        strategy.disconnect();
        // second disconnect while already scheduled is a no-op
        strategy.disconnect();
        expect(instance.destroyed).toBe(false);

        await firstValueFrom(timer(DESTROY_DELAY * 2));

        expect(instance.destroyed).toBe(true);
        expect(componentRef()).toBeNull();
        expect(strategy.getInputValue('value')).toBeUndefined();
    });

    it('should keep the component when reconnected before the scheduled destroy', async () => {
        strategy.connect(host);
        const instance = componentRef().instance as StrategyTestComponent;

        strategy.disconnect();
        strategy.connect(host);

        await firstValueFrom(timer(DESTROY_DELAY * 2));

        expect(instance.destroyed).toBe(false);
        expect(componentRef().instance).toBe(instance);
    });

    it('should not schedule destroy when disconnected before connect', async () => {
        strategy.disconnect();
        expect((strategy as any).scheduledDestroyFn).toBeNull();
    });
});

describe('extractProjectableNodes', () => {
    const createHost = (...children: Node[]) => {
        const host = document.createElement('div');
        children.forEach(c => host.appendChild(c));
        return host;
    };

    it('should distribute nodes by selector and default the rest to the wildcard slot', () => {
        const header = document.createElement('header');
        const footer = document.createElement('div');
        footer.className = 'footer';
        const other = document.createElement('span');
        const text = document.createTextNode('text');
        const host = createHost(header, other, footer, text);

        const nodes = extractProjectableNodes(host, ['header', '*', '.footer']);

        expect(nodes).toEqual([[header], [other, text], [footer]]);
    });

    it('should drop nodes that match no selector when there is no wildcard slot', () => {
        const header = document.createElement('header');
        const other = document.createElement('span');
        const host = createHost(other, document.createTextNode('text'), header);

        const nodes = extractProjectableNodes(host, ['header']);

        expect(nodes).toEqual([[header]]);
    });

    it('should return no slots for components without content projection', () => {
        const host = createHost(document.createElement('span'));

        expect(extractProjectableNodes(host, [])).toEqual([]);
    });
});
