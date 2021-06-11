import { TestBed } from '@angular/core/testing';
import { IgxIconService } from './icon.service';
import { DOCUMENT } from '@angular/common';

import { configureTestSuite } from '../test-utils/configure-suite';
import { first } from 'rxjs/operators';
import { HttpClientModule } from '@angular/common/http';

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
            imports: [HttpClientModule],
            providers: [IgxIconService]
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

    it('should add custom svg icon from url', () => {
        const iconService = TestBed.inject(IgxIconService) as IgxIconService;
        const document = TestBed.inject(DOCUMENT);

        const name = 'test';
        const family = 'svg-icons';
        const iconKey = family + '_' + name;

        spyOn(XMLHttpRequest.prototype, 'open').and.callThrough();
        spyOn(XMLHttpRequest.prototype, 'send');

        iconService.addSvgIcon(name, 'test.svg', family);

        expect(XMLHttpRequest.prototype.open).toHaveBeenCalledTimes(1);
        expect(XMLHttpRequest.prototype.send).toHaveBeenCalledTimes(1);

        const svgElement = document.querySelector(`svg[id='${iconKey}']`);
        expect(svgElement).toBeDefined();
    });

    it('should add custom svg icon from text', () => {
        const iconService = TestBed.inject(IgxIconService) as IgxIconService;
        const document = TestBed.inject(DOCUMENT);

        const name = 'test';
        const family = 'svg-icons';
        const iconKey = family + '_' + name;

        iconService.addSvgIconFromText(name, svgText, family);

        expect(iconService.isSvgIconCached(name, family)).toBeTruthy();
        expect(iconService.getSvgIconKey(name, family)).toEqual(iconKey);

        const svgElement = document.querySelector(`svg[id='${iconKey}']`);
        expect(svgElement).toBeDefined();
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

    it('should create svg container inside the body', () => {
        const iconService = TestBed.inject(IgxIconService) as IgxIconService;
        const document = TestBed.inject(DOCUMENT);

        const name = 'test';
        const family = 'svg-icons';

        iconService.addSvgIconFromText(name, svgText, family);

        const svgContainer = document.body.querySelector('.igx-svg-container');
        expect(svgContainer).toHaveClass('igx-svg-container');
    });
});
