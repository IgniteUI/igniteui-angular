import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IgxCircularProgressBarComponent } from './progressbar.component';
import { configureTestSuite } from '../test-utils/configure-suite';
import { hasClass } from "../test-utils/helper-utils.spec";

describe('IgxCircularProgressBarComponent', () => {
    let fixture: ComponentFixture<IgxCircularProgressBarComponent>;
    let progress: IgxCircularProgressBarComponent;
    let circularBar: HTMLElement;

    configureTestSuite();

    beforeAll(waitForAsync(() => {
        TestBed.configureTestingModule({
            imports: [IgxCircularProgressBarComponent]
        }).compileComponents();
    }));

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [IgxCircularProgressBarComponent]
        }).compileComponents();

        fixture = TestBed.createComponent(IgxCircularProgressBarComponent);
        progress = fixture.componentInstance;
        fixture.detectChanges();
        circularBar = fixture.debugElement.nativeElement;
    });

    it('should initialize with default attributes', () => {
        expect(progress.cssClass).toBe('igx-circular-bar');
        expect(progress.textVisibility).toBe(true);
        expect(progress.hasText).toBe(false);
    });

    it('should correctly apply the ID attribute', () => {
        expect(progress.id).toContain('igx-circular-bar-'); // Keep this

        const customId = 'custom-circular-bar-id';
        progress.id = customId;
        fixture.detectChanges();

        expect(progress.id).toBe(customId);
    });

    it('should correctly toggle the indeterminate mode', () => {
        hasClass(circularBar, 'igx-circular-bar--indeterminate', false);

        progress.indeterminate = true;
        fixture.detectChanges();

        hasClass(circularBar, 'igx-circular-bar--indeterminate', true);
    });

    it('should correctly toggle animation', () => {
        hasClass(circularBar, 'igx-circular-bar--animation-none', false);

        progress.animate = false;
        fixture.detectChanges();

        hasClass(circularBar, 'igx-circular-bar--animation-none', true);
    });

    it('should toggle counter visibility when custom text is provided', () => {
        // Default state: no custom text
        expect(progress.hasText).toBe(false);
        hasClass(circularBar, 'igx-circular-bar--hide-counter', false);

        // Provide custom text
        progress.text = 'Custom Text';
        fixture.detectChanges();
        expect(progress.hasText).toBe(true);
        hasClass(circularBar, 'igx-circular-bar--hide-counter', true);

        // Remove custom text
        progress.text = null;
        fixture.detectChanges();
        expect(progress.hasText).toBe(false);
        hasClass(circularBar, 'igx-circular-bar--hide-counter', false);
    });

    it('should toggle text visibility when textVisibility is changed', () => {
        // Default state: textVisibility is true, text container is present
        expect(progress.textVisibility).toBe(true);
        let textElement = circularBar.querySelector('.igx-circular-bar__text');
        expect(textElement).not.toBeNull();

        // Set textVisibility to false
        progress.textVisibility = false;
        fixture.detectChanges();

        textElement = circularBar.querySelector('.igx-circular-bar__text');
        expect(progress.textVisibility).toBe(false);
        expect(textElement).toBeNull();

        // Set textVisibility back to true
        progress.textVisibility = true;
        fixture.detectChanges();

        textElement = circularBar.querySelector('.igx-circular-bar__text');
        expect(progress.textVisibility).toBe(true);
        expect(textElement).not.toBeNull();
    });

    it('should correctly apply the gradient ID', async () => {
        const gradientId = progress.gradientId;
        expect(gradientId).toContain('igx-circular-gradient-');

        fixture.detectChanges();

        await fixture.whenStable();

        const outerCircle = circularBar.querySelector('.igx-circular-bar__outer') as SVGElement;
        expect(outerCircle).not.toBeNull();

        // Check the `stroke` style instead of the attribute
        const strokeStyle = outerCircle?.style.stroke;

        // Removing quotes from the stroke style
        const normalizedStrokeStyle = strokeStyle?.replace(/"/g, '');
        expect(normalizedStrokeStyle).toBe(`url(#${gradientId})`);
    });

    it('should correctly provide the context object', () => {
        const context = progress.context;

        expect(context.$implicit.value).toBe(progress.value);
        expect(context.$implicit.valueInPercent).toBe(progress.valueInPercent);
        expect(context.$implicit.max).toBe(progress.max);
    });

    it('should correctly update aria attributes', () => {
        progress.max = 200;
        progress.value = 50;

        fixture.detectChanges();

        expect(circularBar.getAttribute('aria-valuenow')).toBe('50');
        expect(circularBar.getAttribute('aria-valuemax')).toBe('200');
    });
});
