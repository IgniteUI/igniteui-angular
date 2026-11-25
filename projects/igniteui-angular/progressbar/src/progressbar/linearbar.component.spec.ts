import { Component } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IgxLinearProgressBarComponent } from './progressbar.component';
import { hasClass } from "../../../test-utils/helper-utils.spec";
import { wait } from '../../../test-utils/ui-interactions.spec';

const nextFrame = () => new Promise<void>(resolve => requestAnimationFrame(() => resolve()));

// The theme sets the bar's CSS variables on the `igx-linear-bar` element, which a root test fixture (a `div`) does not match.
@Component({
    template: `<igx-linear-bar [value]="value" [animationDuration]="600"></igx-linear-bar>`,
    imports: [IgxLinearProgressBarComponent]
})
class LinearBarInitialValueComponent {
    public value = 100;
}

describe('IgxLinearProgressBarComponent', () => {
    let fixture: ComponentFixture<IgxLinearProgressBarComponent>;
    let progress: IgxLinearProgressBarComponent;
    let linearBar: HTMLElement;

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            imports: [IgxLinearProgressBarComponent]
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(IgxLinearProgressBarComponent);
        progress = fixture.componentInstance;
        // For test fixture destroy
        progress.id = "root1";
        fixture.detectChanges();
        linearBar = fixture.debugElement.nativeElement;
    });

    it('should initialize with default attributes', () => {
        expect(progress.valueMin).toBe(0);
        expect(progress.cssClass).toBe('igx-linear-bar');
        expect(progress.striped).toBe(false);
        expect(progress.role).toBe('progressbar');
        expect(progress.type).toBe('default');
    });

    it('should correctly toggle the striped style', () => {
        hasClass(linearBar, 'igx-linear-bar--striped', false);

        progress.striped = true;
        fixture.detectChanges();

        hasClass(linearBar, 'igx-linear-bar--striped', true);
    });

    it('should correctly toggle the indeterminate mode', () => {
        hasClass(linearBar, 'igx-linear-bar--indeterminate', false);

        progress.indeterminate = true;
        fixture.detectChanges();

        hasClass(linearBar, 'igx-linear-bar--indeterminate', true);
    });

    it('should correctly toggle animation', () => {
        hasClass(linearBar, 'igx-linear-bar--animation-none', false);

        progress.animate = false;
        fixture.detectChanges();

        hasClass(linearBar, 'igx-linear-bar--animation-none', true);
    });

    it('should correctly indicate if custom text is provided via hasText', () => {
        expect(progress.hasText).toBe(false);

        progress.text = 'Custom Text';
        fixture.detectChanges();

        expect(progress.hasText).toBe(true);
    });

    it('should toggle counter visibility when custom text is provided', () => {
        // Default state: no custom text
        expect(progress.hasText).toBe(false);
        hasClass(linearBar, 'igx-linear-bar--hide-counter', false);

        // Provide custom text
        progress.text = 'Custom Text';
        fixture.detectChanges();
        expect(progress.hasText).toBe(true);
        hasClass(linearBar, 'igx-linear-bar--hide-counter', true);

        // Remove custom text
        progress.text = null;
        fixture.detectChanges();
        expect(progress.hasText).toBe(false);
        hasClass(linearBar, 'igx-linear-bar--hide-counter', false);
    });

    it('should toggle text visibility when textVisibility is changed', () => {
        const valueElement = linearBar.querySelector('.igx-linear-bar__value') as HTMLElement;

        // Default state: textVisibility is true
        hasClass(valueElement, 'igx-linear-bar__value--hidden', false);

        // Set textVisibility to false
        progress.textVisibility = false;
        fixture.detectChanges(); // Ensure bindings are updated
        hasClass(valueElement, 'igx-linear-bar__value--hidden', true);

        // Set textVisibility back to true
        progress.textVisibility = true;
        fixture.detectChanges(); // Ensure bindings are updated
        hasClass(valueElement, 'igx-linear-bar__value--hidden', false);
    });

    it('should correctly set text alignment', () => {
        expect(progress.textAlign).toBe('start');

        progress.textAlign = 'center';
        fixture.detectChanges();
        expect(progress.textAlign).toBe('center');

        progress.textAlign = 'end';
        fixture.detectChanges();
        expect(progress.textAlign).toBe('end');
    });

    it('should correctly toggle text position above progress line', () => {
        const valueElement = linearBar.querySelector('.igx-linear-bar__value') as HTMLElement;

        // Default state: textTop is false, and class should not be present
        hasClass(valueElement, 'igx-linear-bar__value--top', false);

        // Enable textTop
        progress.textTop = true;
        fixture.detectChanges(); // Ensure bindings are updated
        hasClass(valueElement, 'igx-linear-bar__value--top', true);

        // Disable textTop
        progress.textTop = false;
        fixture.detectChanges(); // Ensure bindings are updated
        hasClass(valueElement, 'igx-linear-bar__value--top', false);
    });

    it('should correctly apply the ID attribute', () => {
        const customId = 'custom-linear-bar-id';
        progress.id = customId;
        fixture.detectChanges();

        expect(progress.id).toBe(customId);
        expect(linearBar.id).toBe(customId);
        // For test fixture destroy
        progress.id = "root1";
        fixture.detectChanges();
    });

    it('should apply type-specific classes correctly', () => {
        hasClass(linearBar, 'igx-linear-bar--danger', false);
        hasClass(linearBar, 'igx-linear-bar--info', false);
        hasClass(linearBar, 'igx-linear-bar--warning', false);
        hasClass(linearBar, 'igx-linear-bar--success', false);

        progress.type = 'success';
        fixture.detectChanges();
        hasClass(linearBar, 'igx-linear-bar--success', true);

        progress.type = 'error';
        fixture.detectChanges();
        hasClass(linearBar, 'igx-linear-bar--danger', true);

        progress.type = 'info';
        fixture.detectChanges();
        hasClass(linearBar, 'igx-linear-bar--info', true);

        progress.type = 'warning';
        fixture.detectChanges();
        hasClass(linearBar, 'igx-linear-bar--warning', true);
    });

    it('should correctly update aria attributes', () => {
        progress.max = 200;
        progress.value = 50;

        fixture.detectChanges();

        expect(linearBar.getAttribute('aria-valuenow')).toBe('50');
        expect(linearBar.getAttribute('aria-valuemax')).toBe('200');
    });

    it('should go straight to a value set while the initial animation is still running', async () => {
        // A separate fixture, so the bar is first rendered with the value already set and animates it in.
        const initialFixture = TestBed.createComponent(LinearBarInitialValueComponent);
        const host = initialFixture.componentInstance;
        initialFixture.detectChanges();

        const indicator = initialFixture.nativeElement.querySelector('.igx-linear-bar__indicator') as HTMLElement;
        // the rendered fill, as a percentage of the track
        const rendered = () => parseFloat(getComputedStyle(indicator).width) / indicator.parentElement.clientWidth * 100;

        await wait(200);
        host.value = 10;
        initialFixture.detectChanges();

        // The indicator is part way between 0 and 100 and now heads for 10 from there,
        // instead of continuing towards 100 first (#17649).
        const atChange = rendered();
        expect(atChange).toBeGreaterThan(10);
        expect(atChange).toBeLessThan(100);
        expect(indicator.getAnimations().length).toBe(1);

        let previous = atChange;
        while (indicator.getAnimations().length) {
            await nextFrame();
            const current = rendered();
            expect(current).toBeLessThanOrEqual(previous + 0.1);
            expect(current).toBeGreaterThanOrEqual(9.9);
            previous = current;
        }
        expect(rendered()).toBeCloseTo(10, 0);
    });
});
