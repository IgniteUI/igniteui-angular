import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Component, ViewChild } from '@angular/core';
import { TestBed, waitForAsync } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { IgxRippleDirective } from './ripple.directive';
import { IgxButtonDirective } from '../button/button.directive';

describe('IgxRipple', () => {
    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            imports: [
                RippleButtonComponent,
                RippleDisabledComponent,
                RippleCenteredComponent,
                RippleColorComponent,
                RippleTargetComponent
            ]
        }).compileComponents();
    }));

    it('Should initialize ripple directive on button', () => {
        const fixture = TestBed.createComponent(RippleButtonComponent);
        fixture.detectChanges();

        const button = fixture.debugElement.query(By.css('button'));
        const rippleDirective = button.injector.get(IgxRippleDirective);

        expect(rippleDirective).toBeTruthy();
        expect(button.nativeElement).toBeTruthy();
    });

    it('Should not affect host element size when ripple is triggered without CSS styles', () => {
        const fixture = TestBed.createComponent(RippleButtonComponent);
        fixture.detectChanges();

        const buttonDebug = fixture.debugElement.query(By.css('button'));
        const button = buttonDebug.nativeElement;
        const rippleDirective = buttonDebug.injector.get(IgxRippleDirective);

        // Set explicit dimensions to ensure we can measure them
        button.style.width = '100px';
        button.style.height = '40px';
        button.style.padding = '10px';
        fixture.detectChanges();

        const initialWidth = button.offsetWidth;
        const initialHeight = button.offsetHeight;

        expect(initialWidth).toBeGreaterThan(0);
        expect(initialHeight).toBeGreaterThan(0);

        const setStylesSpy = vi.spyOn(rippleDirective as any, 'setStyles').and.callThrough();
        const rect = button.getBoundingClientRect();
        const mouseEvent = new MouseEvent('mousedown', {
            clientX: rect.left + 50,
            clientY: rect.top + 20,
            bubbles: true
        });

        rippleDirective.onMouseDown(mouseEvent);

        expect(setStylesSpy).toHaveBeenCalled();

        const rippleElement = setStylesSpy.mock.calls[setStylesSpy.mock.calls.length - 1][0] as HTMLElement;

        expect(rippleElement.style.position).toBe('absolute');

        const afterWidth = button.offsetWidth;
        const afterHeight = button.offsetHeight;

        expect(afterWidth).toBe(initialWidth);
        expect(afterHeight).toBe(initialHeight);
    });

    it('Should create ripple element with position absolute style', () => {
        const fixture = TestBed.createComponent(RippleButtonComponent);
        fixture.detectChanges();

        const buttonDebug = fixture.debugElement.query(By.css('button'));
        const rippleDirective = buttonDebug.injector.get(IgxRippleDirective);
        const setStyleSpy = vi.spyOn(rippleDirective['renderer'], 'setStyle');
        const button = buttonDebug.nativeElement;
        const rect = button.getBoundingClientRect();
        const mouseEvent = new MouseEvent('mousedown', {
            clientX: rect.left + 10,
            clientY: rect.top + 10,
            bubbles: true
        });

        rippleDirective.onMouseDown(mouseEvent);

        const positionStyleCall = setStyleSpy.mock.calls.find(call =>
            call[1] === 'position' && call[2] === 'absolute'
        );
        expect(positionStyleCall).toBeTruthy();
    });

    it('Should not create ripple when disabled', () => {
        const fixture = TestBed.createComponent(RippleDisabledComponent);
        fixture.detectChanges();

        const buttonDebug = fixture.debugElement.query(By.css('button'));
        const rippleDirective = buttonDebug.injector.get(IgxRippleDirective);
        const setStylesSpy = vi.spyOn(rippleDirective as any, 'setStyles');
        const button = buttonDebug.nativeElement;
        const rect = button.getBoundingClientRect();
        const mouseEvent = new MouseEvent('mousedown', {
            clientX: rect.left + 10,
            clientY: rect.top + 10,
            bubbles: true
        });

        rippleDirective.onMouseDown(mouseEvent);
        expect(setStylesSpy).not.toHaveBeenCalled();
    });

    it('Should apply custom ripple color as background style', () => {
        const fixture = TestBed.createComponent(RippleColorComponent);
        fixture.detectChanges();

        const buttonDebug = fixture.debugElement.query(By.css('button'));
        const rippleDirective = buttonDebug.injector.get(IgxRippleDirective);
        const setStyleSpy = vi.spyOn(rippleDirective['renderer'], 'setStyle');
        const button = buttonDebug.nativeElement;
        const rect = button.getBoundingClientRect();
        const mouseEvent = new MouseEvent('mousedown', {
            clientX: rect.left + 10,
            clientY: rect.top + 10,
            bubbles: true
        });

        rippleDirective.onMouseDown(mouseEvent);

        const backgroundStyleCall = setStyleSpy.mock.calls.find(call =>
            call[1] === 'background' && call[2] === 'red'
        );
        expect(backgroundStyleCall).toBeTruthy();
    });

    it('Should center ripple when igxRippleCentered is true', () => {
        const fixture = TestBed.createComponent(RippleCenteredComponent);
        fixture.detectChanges();

        const buttonDebug = fixture.debugElement.query(By.css('button'));
        const rippleDirective = buttonDebug.injector.get(IgxRippleDirective);
        const setStyleSpy = vi.spyOn(rippleDirective['renderer'], 'setStyle');
        const button = buttonDebug.nativeElement;
        const rect = button.getBoundingClientRect();
        const mouseEvent = new MouseEvent('mousedown', {
            clientX: rect.left + 50,
            clientY: rect.top + 50,
            bubbles: true
        });

        rippleDirective.onMouseDown(mouseEvent);

        const topStyleCall = setStyleSpy.mock.calls.find(call =>
            call[1] === 'top' && call[2] === '0px'
        );
        const leftStyleCall = setStyleSpy.mock.calls.find(call =>
            call[1] === 'left' && call[2] === '0px'
        );

        expect(topStyleCall).toBeTruthy();
        expect(leftStyleCall).toBeTruthy();
    });

    it('Should apply ripple to target element when igxRippleTarget is specified', () => {
        const fixture = TestBed.createComponent(RippleTargetComponent);
        fixture.detectChanges();

        const containerDebug = fixture.debugElement.query(By.css('.container'));
        const rippleDirective = containerDebug.injector.get(IgxRippleDirective);
        const targetButton = fixture.debugElement.query(By.css('#target')).nativeElement;
        const appendChildSpy = vi.spyOn(rippleDirective['renderer'], 'appendChild');
        const container = containerDebug.nativeElement;
        const rect = container.getBoundingClientRect();
        const mouseEvent = new MouseEvent('mousedown', {
            clientX: rect.left + 10,
            clientY: rect.top + 10,
            bubbles: true
        });
        rippleDirective.onMouseDown(mouseEvent);

        const appendCall = appendChildSpy.mock.calls[appendChildSpy.mock.calls.length - 1];
        expect(appendCall[0]).toBe(targetButton);
    });

    it('Should set all required ripple element styles including position absolute', () => {
        const fixture = TestBed.createComponent(RippleButtonComponent);
        fixture.detectChanges();

        const buttonDebug = fixture.debugElement.query(By.css('button'));
        const button = buttonDebug.nativeElement;
        const rippleDirective = buttonDebug.injector.get(IgxRippleDirective);

        button.style.width = '100px';
        button.style.height = '50px';

        const setStyleSpy = vi.spyOn(rippleDirective['renderer'], 'setStyle');
        const rect = button.getBoundingClientRect();
        const mouseEvent = new MouseEvent('mousedown', {
            clientX: rect.left + 25,
            clientY: rect.top + 25,
            bubbles: true
        });
        rippleDirective.onMouseDown(mouseEvent);

        const styleCalls = setStyleSpy.mock.calls;
        const styles = styleCalls.map(call => call[1]);

        expect(styles).toContain('position');
        expect(styles).toContain('width');
        expect(styles).toContain('height');
        expect(styles).toContain('top');
        expect(styles).toContain('left');

        const positionCall = styleCalls.find(call => call[1] === 'position');
        expect(positionCall[2]).toBe('absolute');
    });
});

@Component({
    template: `<button igxButton igxRipple>Test Button</button>`,
    imports: [IgxButtonDirective, IgxRippleDirective],
    standalone: true
})
class RippleButtonComponent {
    @ViewChild(IgxRippleDirective, { static: true })
    public ripple: IgxRippleDirective;
}

@Component({
    template: `<button igxButton igxRipple [igxRippleDisabled]="true">Disabled Ripple</button>`,
    imports: [IgxButtonDirective, IgxRippleDirective],
    standalone: true
})
class RippleDisabledComponent { }

@Component({
    template: `<button igxButton igxRipple [igxRippleCentered]="true">Centered Ripple</button>`,
    imports: [IgxButtonDirective, IgxRippleDirective],
    standalone: true
})
class RippleCenteredComponent { }

@Component({
    template: `<button igxButton [igxRipple]="'red'">Colored Ripple</button>`,
    imports: [IgxButtonDirective, IgxRippleDirective],
    standalone: true
})
class RippleColorComponent { }

@Component({
    template: `
        <div class="container" igxRipple [igxRippleTarget]="'#target'">
            <button id="target" igxButton>Target Button</button>
        </div>
    `,
    imports: [IgxButtonDirective, IgxRippleDirective],
    standalone: true
})
class RippleTargetComponent { }


