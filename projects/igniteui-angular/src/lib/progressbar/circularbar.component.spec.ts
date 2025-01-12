import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IgxCircularProgressBarComponent } from './progressbar.component';
import { configureTestSuite } from '../test-utils/configure-suite';

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
        expect(progress.id).toContain('igx-circular-bar-');
        expect(circularBar.id).toContain('igx-circular-bar-');

        // Set a custom ID and verify
        const customId = 'custom-circular-bar-id';
        progress.id = customId;
        fixture.detectChanges();

        expect(progress.id).toBe(customId);
        expect(circularBar.id).toBe(customId);
    });

    it('should correctly toggle the indeterminate mode', () => {
        // Default is not indeterminate
        expect(circularBar.classList.contains('igx-circular-bar--indeterminate')).toBe(false);

        progress.indeterminate = true;
        fixture.detectChanges();

        expect(circularBar.classList.contains('igx-circular-bar--indeterminate')).toBe(true);
    });

    it('should correctly toggle animation', () => {
        // Animation enabled by default
        expect(circularBar.classList.contains('igx-circular-bar--animation-none')).toBe(false);

        // Disable animation
        progress.animate = false;
        fixture.detectChanges();

        expect(circularBar.classList.contains('igx-circular-bar--animation-none')).toBe(true);
    });

    it('should correctly indicate if custom text is provided via hasText', () => {
        // Default: no custom text
        expect(progress.hasText).toBe(false);

        // Set custom text
        progress.text = 'Custom Text';
        fixture.detectChanges();

        expect(progress.hasText).toBe(true);
        expect(circularBar.classList.contains('igx-circular-bar--hide-counter')).toBe(true);
    });

    it('should correctly toggle the visibility of the counter text', () => {
        // Default: textVisibility is true
        expect(circularBar.classList.contains('igx-circular-bar--hide-counter')).toBe(false);

        progress.textVisibility = false;
        fixture.detectChanges();

        expect(circularBar.classList.contains('igx-circular-bar--hide-counter')).toBe(true);
    });

    it('should correctly apply the gradient ID', () => {
        const gradientId = progress.gradientId;

        expect(gradientId).toContain('igx-circular-gradient-');
        const circleElement = circularBar.querySelector('circle');
        expect(circleElement?.getAttribute('stroke')).toBe(`url(#${gradientId})`);
    });

    it('should correctly provide the context object', () => {
        const context = progress.context;

        expect(context.$implicit.value).toBe(progress.value);
        expect(context.$implicit.valueInPercent).toBe(progress.valueInPercent);
        expect(context.$implicit.max).toBe(progress.max);
    });
});
