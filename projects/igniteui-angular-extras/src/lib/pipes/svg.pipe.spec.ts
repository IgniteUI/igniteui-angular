import { TestBed } from '@angular/core/testing';
import { SvgPipe } from './svg.pipe';

describe('SvgPipe', () => {
    let pipe: SvgPipe;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        pipe = TestBed.runInInjectionContext(() => new SvgPipe());
    });

    it('should return a SafeHtml object that wraps the original markup', () => {
        const svgMarkup = '<svg><circle cx="50" cy="50" r="40"/></svg>';
        const result = pipe.transform(svgMarkup);
        // SafeHtml wraps the value — it should not be the raw string
        expect(result).not.toBe(svgMarkup);
        // The underlying value should contain the original markup
        expect((result as any).changingThisBreaksApplicationSecurity).toBe(svgMarkup);
    });
});
