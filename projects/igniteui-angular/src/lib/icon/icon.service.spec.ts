import { TestBed, fakeAsync } from '@angular/core/testing';
import { IgxIconService } from './icon.service';

import { configureTestSuite } from '../test-utils/configure-suite';
import { first } from 'rxjs/operators';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

describe('Icon Service', () => {
    configureTestSuite();
    const MY_FONT = 'my-awesome-icons';
    const ALIAS = 'awesome';

    const svgText = `<svg id="icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
    <path d="M74 74h54v54H74" />
    <path d="M10 10h181v181H10V10zm38.2 38.2v104.6h104.6V48.2H48.2z"/>
</svg>`;

    beforeEach(() => {
        TestBed.configureTestingModule({
    imports: [],
    providers: [IgxIconService, provideHttpClient(withInterceptorsFromDi())]
}).compileComponents();
    });

    it('should set the default icon set', () => {
        const iconService = TestBed.inject(IgxIconService);

        expect(() => {
            iconService.defaultFamily = MY_FONT;
        }).not.toThrow();
    });

    it('should get the default icon set', () => {
        const iconService = TestBed.inject(IgxIconService);
        iconService.defaultFamily = MY_FONT;

        expect(iconService.defaultFamily).toBe(MY_FONT);
    });

    it('should associate alias name with icon set name', () => {
        const iconService = TestBed.inject(IgxIconService);

        expect(() => {
            iconService.registerFamilyAlias(ALIAS, MY_FONT);
        }).not.toThrow();
    });

    it('should get icon set name from alias name', () => {
        const iconService = TestBed.inject(IgxIconService);
        iconService.registerFamilyAlias(ALIAS, MY_FONT);

        expect(iconService.familyClassName(ALIAS)).toBe(MY_FONT);
    });

    it('should add custom svg icon from url', fakeAsync((done) => {
        const iconService = TestBed.inject(IgxIconService) as IgxIconService;

        const name = 'test';
        const family = 'svg-icons';

        spyOn(XMLHttpRequest.prototype, 'open').and.callThrough();
        spyOn(XMLHttpRequest.prototype, 'send');

        iconService.addSvgIcon(name, 'test.svg', family);

        expect(XMLHttpRequest.prototype.open).toHaveBeenCalledTimes(1);
        expect(XMLHttpRequest.prototype.send).toHaveBeenCalledTimes(1);

        iconService.iconLoaded.pipe().subscribe(() => {
            expect(iconService.isSvgIconCached(name, family)).toBeTruthy();
            done();
        });
    }));

    it('should add custom svg icon from text', () => {
        const iconService = TestBed.inject(IgxIconService) as IgxIconService;

        const name = 'test';
        const family = 'svg-icons';

        iconService.addSvgIconFromText(name, svgText, family);
        expect(iconService.isSvgIconCached(name, family)).toBeTruthy();
    });

    it('should emit loading event for a custom svg icon from url', done => {
        const iconService = TestBed.inject(IgxIconService) as IgxIconService;

        iconService.iconLoaded.pipe(first()).subscribe(event => {
            expect(event.name).toMatch('test');
            expect(event.family).toMatch('svg-icons');
            done();
        });

        const name = 'test';
        const family = 'svg-icons';

        spyOn(XMLHttpRequest.prototype, 'open').and.callThrough();
        spyOn(XMLHttpRequest.prototype, 'send').and.callFake(() => {
            (iconService as any)._iconLoaded.next({
                name,
                value: svgText,
                family
            });
        });

        iconService.addSvgIcon(name, 'test.svg', family);
    });
});
