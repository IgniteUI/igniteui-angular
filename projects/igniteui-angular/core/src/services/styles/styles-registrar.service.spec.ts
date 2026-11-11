import { Component, ElementRef, inject, OnDestroy, ViewEncapsulation } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { PlatformUtil } from '../../core/utils';
import { IgxStylesRegistrar } from './styles-registrar.service';

let instances: ElementRef<HTMLElement>[] = [];
let destroyed = 0;

@Component({
    selector: 'igx-retain-test',
    template: '',
    styles: ['.igx-retain-test { color: red; }'],
    encapsulation: ViewEncapsulation.None
})
class RetainTestComponent implements OnDestroy {
    constructor() {
        instances.push(inject(ElementRef));
    }

    public ngOnDestroy(): void {
        destroyed++;
    }
}

@Component({
    selector: 'igx-plain-test',
    template: '',
    styles: ['.igx-plain-test { color: blue; }'],
    encapsulation: ViewEncapsulation.None
})
class PlainTestComponent { }

// Compiled styles are reformatted, so match on the class name.
const hasStyle = (className: string) =>
    Array.from(document.head.querySelectorAll('style')).some(style => style.textContent?.includes(className));

describe('IgxStylesRegistrar', () => {
    describe('register', () => {
        let initialSheets: CSSStyleSheet[];

        beforeEach(() => {
            initialSheets = [...document.adoptedStyleSheets];
        });

        afterEach(() => {
            document.adoptedStyleSheets = initialSheets;
            document.head.querySelectorAll('style[data-registrar-test]').forEach(style => style.remove());
        });

        it('should adopt a stylesheet once per id', () => {
            const registrar = TestBed.inject(IgxStylesRegistrar);
            const id = Symbol('once');

            registrar.register(id, '.igx-register-once { color: red; }');
            registrar.register(id, '.igx-register-once { color: red; }');

            const added = document.adoptedStyleSheets.slice(initialSheets.length);
            expect(added.length).toBe(1);
            expect(added[0].cssRules[0].cssText).toContain('.igx-register-once');
        });

        it('should adopt a separate stylesheet for each id', () => {
            const registrar = TestBed.inject(IgxStylesRegistrar);

            registrar.register(Symbol('first'), '.igx-register-first { color: red; }');
            registrar.register(Symbol('second'), '.igx-register-second { color: red; }');

            expect(document.adoptedStyleSheets.length - initialSheets.length).toBe(2);
        });

        it('should register an id once per document across injectors', () => {
            const id = Symbol('per-document');

            TestBed.inject(IgxStylesRegistrar).register(id, '.igx-register-doc { color: red; }');
            TestBed.resetTestingModule();
            TestBed.inject(IgxStylesRegistrar).register(id, '.igx-register-doc { color: red; }');

            expect(document.adoptedStyleSheets.length - initialSheets.length).toBe(1);
        });

        it('should append a style element outside the browser', () => {
            TestBed.configureTestingModule({
                providers: [{ provide: PlatformUtil, useValue: { isBrowser: false } }]
            });

            TestBed.inject(IgxStylesRegistrar).register(Symbol('server'), '.igx-register-server { color: red; }');

            const style = Array.from(document.head.querySelectorAll('style'))
                .find(s => s.textContent?.includes('.igx-register-server'));
            style?.setAttribute('data-registrar-test', '');
            expect(style).toBeDefined();
            expect(document.adoptedStyleSheets.length).toBe(initialSheets.length);
        });
    });

    describe('retain', () => {
        // Angular tears down the previous test's app after afterEach hooks run.
        beforeEach(() => {
            instances = [];
            destroyed = 0;
        });

        it('should keep a component\'s styles after its last instance is destroyed', () => {
            TestBed.inject(IgxStylesRegistrar).retain(RetainTestComponent);

            const fixture = TestBed.createComponent(RetainTestComponent);
            fixture.destroy();

            expect(hasStyle('igx-retain-test')).toBe(true);
        });

        it('should not keep the styles of components that are not retained', () => {
            const fixture = TestBed.createComponent(PlainTestComponent);
            expect(hasStyle('igx-plain-test')).toBe(true);

            fixture.destroy();

            expect(hasStyle('igx-plain-test')).toBe(false);
        });

        it('should create a single detached instance per component', () => {
            const registrar = TestBed.inject(IgxStylesRegistrar);

            registrar.retain(RetainTestComponent);
            registrar.retain(RetainTestComponent, RetainTestComponent);

            expect(instances.length).toBe(1);
            expect(instances[0].nativeElement.isConnected).toBe(false);
        });

        it('should destroy the retained instances when the application is destroyed', () => {
            TestBed.inject(IgxStylesRegistrar).retain(RetainTestComponent);
            expect(destroyed).toBe(0);

            TestBed.resetTestingModule();

            expect(destroyed).toBe(1);
            expect(hasStyle('igx-retain-test')).toBe(false);
        });
    });
});
