import { ChangeDetectorRef, ElementRef } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { PlatformUtil } from 'igniteui-angular/core';
import { KeyboardNavigationService } from './calendar.services';

describe('Calendar KeyboardNavigationService', () => {
    let element: HTMLElement;
    let elementRef: ElementRef;

    const configure = (isBrowser = true) => {
        TestBed.configureTestingModule({
            providers: [
                KeyboardNavigationService,
                { provide: ChangeDetectorRef, useValue: jasmine.createSpyObj('ChangeDetectorRef', ['markForCheck']) },
                ...(isBrowser ? [] : [{ provide: PlatformUtil, useValue: { isBrowser: false } }])
            ]
        });

        return TestBed.inject(KeyboardNavigationService);
    };

    const keydown = (key: string) => element.dispatchEvent(new KeyboardEvent('keydown', { key }));

    beforeEach(() => {
        element = document.createElement('div');
        elementRef = new ElementRef(element);
    });

    it('should invoke the handler registered for the pressed key in the given context', () => {
        const service = configure();
        const context = { name: 'context' };
        const handler = jasmine.createSpy('handler');

        service.attachKeyboardHandlers(elementRef, context).set('ArrowDown', handler);

        keydown('ArrowUp');
        expect(handler).not.toHaveBeenCalled();

        keydown('ArrowDown');
        expect(handler).toHaveBeenCalledTimes(1);
        expect(handler.calls.mostRecent().object).toBe(context);
        expect(handler.calls.mostRecent().args[0].key).toBe('ArrowDown');
        expect(TestBed.inject(ChangeDetectorRef).markForCheck).toHaveBeenCalled();
    });

    it('should stop invoking a handler once it is unset', () => {
        const service = configure();
        const arrowDown = jasmine.createSpy('arrowDown');
        const arrowUp = jasmine.createSpy('arrowUp');

        service.attachKeyboardHandlers(elementRef, {})
            .set('ArrowDown', arrowDown)
            .set('ArrowUp', arrowUp)
            .unset('ArrowDown');

        keydown('ArrowDown');
        keydown('ArrowUp');

        expect(arrowDown).not.toHaveBeenCalled();
        expect(arrowUp).toHaveBeenCalledTimes(1);
    });

    it('should remove the listener and the handlers when detached', () => {
        const service = configure();
        const handler = jasmine.createSpy('handler');

        service.attachKeyboardHandlers(elementRef, {}).set('Enter', handler);
        service.detachKeyboardHandlers();

        keydown('Enter');
        expect(handler).not.toHaveBeenCalled();

        // detaching twice is safe
        expect(() => service.detachKeyboardHandlers()).not.toThrow();
    });

    it('should replace the previous listener when attached again', () => {
        const service = configure();
        const first = jasmine.createSpy('first');
        const second = jasmine.createSpy('second');
        const otherElement = document.createElement('div');

        service.attachKeyboardHandlers(elementRef, {}).set('Enter', first);
        service.attachKeyboardHandlers(new ElementRef(otherElement), {}).set('Enter', second);

        keydown('Enter');
        otherElement.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));

        expect(first).not.toHaveBeenCalled();
        expect(second).toHaveBeenCalledTimes(1);
    });

    it('should not attach listeners outside of the browser', () => {
        const service = configure(false);
        const handler = jasmine.createSpy('handler');

        const result = service.attachKeyboardHandlers(elementRef, {}).set('Enter', handler);

        expect(result).toBe(service);
        keydown('Enter');
        expect(handler).not.toHaveBeenCalled();
    });
});
