import { ChangeDetectionStrategy, Component, ViewChild } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { IgxFocusRingDirective } from './focus-ring.directive';

describe('IgxFocusRing', () => {
    let fixture: ComponentFixture<FocusRingComponent>;
    let ring: IgxFocusRingDirective;
    let element: HTMLElement;

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            imports: [FocusRingComponent]
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(FocusRingComponent);
        fixture.detectChanges();

        ring = fixture.componentInstance.ring;
        element = fixture.debugElement.query(By.directive(IgxFocusRingDirective)).nativeElement;
    });

    it('Should not report keyboard focus initially', () => {
        expect(ring.hasKeyboardFocus()).toBe(false);
    });

    it('Should report keyboard focus after a key is released on the element', () => {
        element.dispatchEvent(new KeyboardEvent('keyup', { key: 'Tab' }));

        expect(ring.hasKeyboardFocus()).toBe(true);
    });

    it('Should drop keyboard focus on pointer interaction', () => {
        element.dispatchEvent(new KeyboardEvent('keyup', { key: 'Tab' }));
        element.dispatchEvent(new PointerEvent('pointerdown'));

        expect(ring.hasKeyboardFocus()).toBe(false);
    });

    it('Should drop keyboard focus when focus leaves the element', () => {
        element.dispatchEvent(new KeyboardEvent('keyup', { key: 'Tab' }));
        element.dispatchEvent(new FocusEvent('focusout'));

        expect(ring.hasKeyboardFocus()).toBe(false);
    });
});

@Component({
    template: `<button igxFocusRing>Focus me</button>`,
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [IgxFocusRingDirective]
})
class FocusRingComponent {
    @ViewChild(IgxFocusRingDirective, { static: true })
    public ring: IgxFocusRingDirective;
}
