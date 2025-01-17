import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IgxLinearProgressBarComponent } from './progressbar.component';
import { configureTestSuite } from '../test-utils/configure-suite';
import { hasClass } from "../test-utils/helper-utils.spec";

describe('IgxLinearProgressBarComponent', () => {
    let fixture: ComponentFixture<IgxLinearProgressBarComponent>;
    let progress: IgxLinearProgressBarComponent;
    let linearBar: HTMLElement;

    configureTestSuite();

    beforeAll(waitForAsync(() => {
        TestBed.configureTestingModule({
            imports: [IgxLinearProgressBarComponent]
        }).compileComponents();
    }));

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [IgxLinearProgressBarComponent]
        }).compileComponents();

        fixture = TestBed.createComponent(IgxLinearProgressBarComponent);
        progress = fixture.componentInstance;
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
        expect(progress.id).toContain('igx-linear-bar-');
        expect(linearBar.id).toContain('igx-linear-bar-');

        const customId = 'custom-linear-bar-id';
        progress.id = customId;
        fixture.detectChanges();

        expect(progress.id).toBe(customId);
        expect(linearBar.id).toBe(customId);
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
});
