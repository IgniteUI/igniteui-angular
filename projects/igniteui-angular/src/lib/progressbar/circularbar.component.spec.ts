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
        TestBed.configureTestingModule({
            imports: [IgxCircularProgressBarComponent]
        }).compileComponents();

        fixture = TestBed.createComponent(IgxCircularProgressBarComponent);
        progress = fixture.componentInstance;
        fixture.detectChanges();
        circularBar = fixture.debugElement.nativeElement;
    });

    function clasListContains(element: HTMLElement, className: string, expected: boolean) {
        expect(element.classList.contains(className)).toBe(expected);
    }

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
        clasListContains(circularBar, 'igx-circular-bar--indeterminate', false);

        progress.indeterminate = true;
        fixture.detectChanges();

        clasListContains(circularBar, 'igx-circular-bar--indeterminate', true);
    });

    it('should correctly toggle animation', () => {
        clasListContains(circularBar, 'igx-circular-bar--animation-none', false);

        progress.animate = false;
        fixture.detectChanges();

        clasListContains(circularBar, 'igx-circular-bar--animation-none', true);
    });

    it('should toggle counter visibility when custom text is provided', () => {
        // Default state: no custom text
        expect(progress.hasText).toBe(false);
        clasListContains(circularBar, 'igx-circular-bar--hide-counter', false);

        // Provide custom text
        progress.text = 'Custom Text';
        fixture.detectChanges();
        expect(progress.hasText).toBe(true);
        clasListContains(circularBar, 'igx-circular-bar--hide-counter', true);

        // Remove custom text
        progress.text = null;
        fixture.detectChanges();
        expect(progress.hasText).toBe(false);
        clasListContains(circularBar, 'igx-circular-bar--hide-counter', false);
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

    it('should correctly apply the gradient ID', () => {
        const gradientId = progress.gradientId;
        expect(gradientId).toContain('igx-circular-gradient-');

        fixture.detectChanges();

        // Wait for ngAfterViewInit to complete
        fixture.whenStable().then(() => {
            const outerCircleElement = circularBar.querySelector('.igx-circular-bar__outer');

            // Ensure the stroke attribute contains the correct gradient ID
            expect(outerCircleElement?.getAttribute('stroke')).toBe(`url(#${gradientId})`);
        });
    });

    it('should correctly provide the context object', () => {
        const context = progress.context;

        expect(context.$implicit.value).toBe(progress.value);
        expect(context.$implicit.valueInPercent).toBe(progress.valueInPercent);
        expect(context.$implicit.max).toBe(progress.max);
    });
});
