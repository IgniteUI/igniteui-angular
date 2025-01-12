import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IgxLinearProgressBarComponent } from './progressbar.component';
import { configureTestSuite } from '../test-utils/configure-suite';

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
        // Default is not striped
        expect(linearBar.classList.contains('igx-linear-bar--striped')).toBe(false);

        // Enable striped
        progress.striped = true;
        fixture.detectChanges();

        expect(linearBar.classList.contains('igx-linear-bar--striped')).toBe(true);
    });

    it('should correctly toggle the indeterminate mode', () => {
        // Default is not indeterminate
        expect(linearBar.classList.contains('igx-linear-bar--indeterminate')).toBe(false);

        // Enable indeterminate mode
        progress.indeterminate = true;
        fixture.detectChanges();

        expect(linearBar.classList.contains('igx-linear-bar--indeterminate')).toBe(true);
    });

    it('should correctly toggle animation', () => {
        // Animation enabled by default
        expect(linearBar.classList.contains('igx-linear-bar--animation-none')).toBe(false);

        // Disable animation
        progress.animate = false;
        fixture.detectChanges();

        expect(linearBar.classList.contains('igx-linear-bar--animation-none')).toBe(true);
    });

    it('should correctly indicate if custom text is provided via hasText', () => {
        // Default: no custom text
        expect(progress.hasText).toBe(false);

        // Set custom text
        progress.text = 'Custom Text';
        fixture.detectChanges();

        expect(progress.hasText).toBe(true);
    });

    it('should correctly toggle the visibility of the counter text', () => {
        // Default: textVisibility is true
        expect(linearBar.classList.contains('igx-linear-bar--hide-counter')).toBe(false);

        progress.textVisibility = false;
        fixture.detectChanges();

        expect(linearBar.classList.contains('igx-linear-bar--hide-counter')).toBe(true);
    });

    it('should correctly set text alignment', () => {
        // Default: textAlign is 'start'
        expect(progress.textAlign).toBe('start');

        // Set alignment to center
        progress.textAlign = 'center';
        fixture.detectChanges();

        expect(progress.textAlign).toBe('center');

        // Set alignment to end
        progress.textAlign = 'end';
        fixture.detectChanges();

        expect(progress.textAlign).toBe('end');
    });

    it('should correctly toggle text position above progress line', () => {
        // Default: textTop is false
        expect(progress.textTop).toBe(false);
        expect(linearBar.classList.contains('igx-linear-bar--text-top')).toBe(false);

        // Set textTop to true
        progress.textTop = true;
        fixture.detectChanges();

        expect(progress.textTop).toBe(true);
        expect(linearBar.classList.contains('igx-linear-bar--text-top')).toBe(true);
    });

    it('should correctly apply the ID attribute', () => {
        expect(progress.id).toContain('igx-linear-bar-');
        expect(linearBar.id).toContain('igx-linear-bar-');

        // Set a custom ID and verify
        const customId = 'custom-linear-bar-id';
        progress.id = customId;
        fixture.detectChanges();

        expect(progress.id).toBe(customId);
        expect(linearBar.id).toBe(customId);
    });

    it('should apply type-specific classes correctly', () => {
        // Initial type is `default` no modifier classes should be added
        expect(linearBar.classList.contains('igx-linear-bar--danger')).toBe(false);
        expect(linearBar.classList.contains('igx-linear-bar--info')).toBe(false);
        expect(linearBar.classList.contains('igx-linear-bar--warning')).toBe(false);
        expect(linearBar.classList.contains('igx-linear-bar--success')).toBe(false);

        // Set type to `success`
        progress.type = 'success';
        fixture.detectChanges();
        expect(linearBar.classList.contains('igx-linear-bar--success')).toBe(true);

        // Set type to `error`
        progress.type = 'error';
        fixture.detectChanges();
        expect(linearBar.classList.contains('igx-linear-bar--danger')).toBe(true);

        // Set type to `info`
        progress.type = 'info';
        fixture.detectChanges();
        expect(linearBar.classList.contains('igx-linear-bar--info')).toBe(true);

        // Set type to `warning`
        progress.type = 'warning';
        fixture.detectChanges();
        expect(linearBar.classList.contains('igx-linear-bar--warning')).toBe(true);
    });
});
