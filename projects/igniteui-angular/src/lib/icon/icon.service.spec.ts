import { TestBed, fakeAsync } from "@angular/core/testing";
import { IconFamily, IconMeta, IgxIconService } from "./icon.service";

import { configureTestSuite } from '../test-utils/configure-suite';
import { first } from 'rxjs/operators';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

describe("Icon Service", () => {
    configureTestSuite();
    const FAMILY: IconFamily = {
        name: "awesome",
        meta: { className: "my-awesome-icons", type: "font" },
    };

    const svgText = `<svg id="icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
    <path d="M74 74h54v54H74" />
    <path d="M10 10h181v181H10V10zm38.2 38.2v104.6h104.6V48.2H48.2z"/>
</svg>`;

    let iconRef: { name: string; family: string; icon: IconMeta };
    let iconService: IgxIconService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [],
            providers: [IgxIconService, provideHttpClient(withInterceptorsFromDi())],
        }).compileComponents();

        iconService = TestBed.inject(IgxIconService);

        iconService.setFamily("fa-solid", {
            className: "fa",
            prefix: "fa-",
            type: "font",
        });

        iconRef = {
            name: "car",
            family: "default",
            icon: {
                name: "car",
                family: "fa-solid",
            },
        };

        iconService.addIconRef(iconRef.name, iconRef.family, iconRef.icon);
    });

    it("should have material as the default icon set", () => {
        expect(iconService.defaultFamily.name).toBe("material");
        expect(iconService.defaultFamily.meta.className).toBe("material-icons");
        expect(iconService.defaultFamily.meta.type).toBe("liga");
    });

    it("should set the default icon set", () => {
        expect(() => {
            iconService.defaultFamily = FAMILY;
        }).not.toThrow();
    });

    it("should get the default icon set", () => {
        iconService.defaultFamily = FAMILY;

        expect(iconService.defaultFamily).toBe(FAMILY);
    });

    it("should associate a name with family metadata", () => {
        expect(() => {
            iconService.setFamily(FAMILY.name, FAMILY.meta);
        }).not.toThrow();
    });

    it("should create meta icon and family reference to an icon in another family", () => {
        const icon = iconService.getIconRef(iconRef.name, iconRef.family);

        expect(icon).toEqual({
            className: "fa",
            type: "font",
            name: "fa-car",
            family: "fa-solid",
        });
    });

    it("should not be able to overwrite an icon reference by calling addIconRef", () => {
        iconService.addIconRef(iconRef.name, iconRef.family, {
            name: "android",
            family: "material",
        });

        const icon = iconService.getIconRef(iconRef.name, iconRef.family);

        expect(icon).toEqual({
            className: "fa",
            type: "font",
            name: "fa-car",
            family: "fa-solid",
        });
    });

    it("should overwrite an icon reference via setIconRef", () => {
        iconService.setIconRef(iconRef.name, iconRef.family, {
            name: "android",
            family: "material",
        });

        const icon = iconService.getIconRef(iconRef.name, iconRef.family);

        expect(icon).toEqual({
            className: "material-icons",
            type: "liga",
            name: "android",
            family: "material",
        });
    });

    it("should get the className by family name", () => {
        iconService.setFamily(FAMILY.name, FAMILY.meta);

        expect(iconService.familyClassName(FAMILY.name)).toBe(
            FAMILY.meta.className,
        );
    });

    it("should add custom svg icon from url", fakeAsync((
        done: () => object,
    ) => {
        const iconName = "test";
        const familyName = "svg-icons";

        spyOn(XMLHttpRequest.prototype, "open").and.callThrough();
        spyOn(XMLHttpRequest.prototype, "send");

        iconService.addSvgIcon(iconName, "test.svg", familyName);

        expect(XMLHttpRequest.prototype.open).toHaveBeenCalledTimes(1);
        expect(XMLHttpRequest.prototype.send).toHaveBeenCalledTimes(1);

        iconService.iconLoaded.pipe().subscribe(() => {
            expect(
                iconService.isSvgIconCached(iconName, familyName),
            ).toBeTruthy();
            done();
        });
    }));

    it("should add custom svg icon from text", () => {
        const iconName = "test";
        const familyName = "svg-icons";

        iconService.addSvgIconFromText(iconName, svgText, familyName);
        expect(iconService.isSvgIconCached(iconName, familyName)).toBeTruthy();
    });

    it("should emit loading event for a custom svg icon from url", (done) => {
        iconService.iconLoaded.pipe(first()).subscribe((event) => {
            expect(event.name).toMatch("test");
            expect(event.family).toMatch("svg-icons");
            done();
        });

        const iconName = "test";
        const familyName = "svg-icons";

        spyOn(XMLHttpRequest.prototype, "open").and.callThrough();
        spyOn(XMLHttpRequest.prototype, "send").and.callFake(() => {
            (iconService as any)._iconLoaded.next({
                name: iconName,
                value: svgText,
                family: familyName,
            });
        });

        iconService.addSvgIcon(iconName, "test.svg", familyName);
    });
});
