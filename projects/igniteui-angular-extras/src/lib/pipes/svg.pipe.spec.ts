import { TestBed } from '@angular/core/testing';
import { DomSanitizer } from '@angular/platform-browser';
import { SvgPipe } from './svg.pipe';

describe('SvgPipe', () => {
    let pipe: SvgPipe;
    let sanitizer: DomSanitizer;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        pipe = TestBed.runInInjectionContext(() => new SvgPipe());
        sanitizer = TestBed.inject(DomSanitizer);
    });

    it('should create an instance', () => {
        expect(pipe).toBeTruthy();
    });

    it('should return a SafeHtml value', () => {
        const result = pipe.transform('<svg></svg>');
        expect(result).toBeDefined();
        // SafeHtml is opaque; verify it's not a plain string
        expect(typeof result).not.toBe('string');
    });

    it('should bypass security for the provided SVG markup', () => {
        const spy = spyOn(sanitizer, 'bypassSecurityTrustHtml').and.callThrough();
        // Re-create pipe so the spy is in place via the same sanitizer instance
        const freshPipe = TestBed.runInInjectionContext(() => new SvgPipe());
        const markup = '<svg><circle cx="50" cy="50" r="40"/></svg>';

        freshPipe.transform(markup);

        expect(spy).toHaveBeenCalledWith(markup);
    });

    it('should handle an empty string', () => {
        const result = pipe.transform('');
        expect(result).toBeDefined();
    });

    it('should handle complex SVG markup with attributes', () => {
        const complexSvg = '<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><rect width="100" height="100" fill="red"/></svg>';
        const result = pipe.transform(complexSvg);
        expect(result).toBeDefined();
    });

    it('should handle non-SVG HTML markup', () => {
        const htmlMarkup = '<div><span>Hello</span></div>';
        const result = pipe.transform(htmlMarkup);
        expect(result).toBeDefined();
    });
});
