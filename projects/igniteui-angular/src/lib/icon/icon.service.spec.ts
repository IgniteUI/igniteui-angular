import { TestBed, fakeAsync } from "@angular/core/testing";
import { IconFamily, IconMeta } from "./types";
import { IgxIconService } from './icon.service';

import { configureTestSuite } from '../test-utils/configure-suite';
import { first } from 'rxjs/operators';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { Component, inject } from "@angular/core";
import { IgxIconComponent } from "./icon.component";
import { By } from "@angular/platform-browser";
import { IgxTheme, THEME_TOKEN, ThemeToken } from "igniteui-angular";

describe("Icon Service", () => {
    configureTestSuite();
    const FAMILY: IconFamily = {
        name: "awesome",
        meta: { className: "my-awesome-icons", type: "font" },
    };

    const svgText = `<svg id="icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
    <path d="M74 74h54v54H74"></path>
    <path d="M10 10h181v181H10V10zm38.2 38.2v104.6h104.6V48.2H48.2z"></path>
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

    it("should be able to extend family of type font/liga with svg icons", () => {
        const fixture = TestBed.createComponent(IconTestComponent);
        const iconName = "test";
        const familyName = "material";

        iconService.addSvgIconFromText(iconName, svgText, familyName);
        fixture.detectChanges();

        const extendedIcon = fixture.debugElement.query(By.css("igx-icon[extended] svg")).nativeElement;
        const builtinIcon = fixture.debugElement.query(By.css("igx-icon[builtin]")).nativeElement;

        expect(extendedIcon).toBeTruthy();
        expect(builtinIcon).toBeTruthy();
        expect(svgText).toContain(extendedIcon.innerHTML);
        expect(builtinIcon.textContent).toContain("home");
        expect(iconService.defaultFamily.name).toBe(familyName);
        expect(iconService.defaultFamily.meta.type).toBe("liga");
    });

    it("should be able to reference icons in extended font/liga families", () => {
        const fixture = TestBed.createComponent(IconRefComponent);
        const iconName = "test";
        const familyName = "material";

        iconService.addSvgIconFromText(iconName, svgText, familyName);
        iconService.addIconRef("reference", "default", {
            name: iconName,
            family: familyName,
            type: "svg",
        });

        fixture.detectChanges();

        const svg = fixture.debugElement.query(By.css("svg")).nativeElement;

        expect(svg).toBeTruthy();
        expect(svgText).toContain(svg.innerHTML);
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

    it('should change icon references dynamically when the value of THEME_TOKEN changes', () => {
        const fixture = TestBed.createComponent(IconWithThemeTokenComponent);
        fixture.detectChanges();

        let arrow_prev = fixture.debugElement.query(By.css("igx-icon[name='arrow_prev']"));
        let expand_more = fixture.debugElement.query(By.css("igx-icon[name='expand_more']"));

        expect(fixture.componentInstance.themeToken.theme).toBe('material');
        expect(arrow_prev).toBeTruthy();
        expect(arrow_prev.classes['material-icons']).toBeTrue();
        expect(expand_more).toBeTruthy();
        expect(expand_more.classes['material-icons']).toBeTrue();

        fixture.componentInstance.setTheme('indigo');
        fixture.detectChanges();

        arrow_prev = fixture.debugElement.query(By.css("igx-icon[name='arrow_prev']"));
        expand_more = fixture.debugElement.query(By.css("igx-icon[name='expand_more']"));

        expect(fixture.componentInstance.themeToken.theme).toBe('indigo');

        // The class change should be reflected as the family changes
        expect(arrow_prev).toBeTruthy();
        expect(arrow_prev.classes['internal_indigo']).toBeTrue();

        // The expand_more shouldn't change as its reference is set explicitly
        expect(expand_more).toBeTruthy();
        expect(expand_more.classes['material-icons']).toBeTrue();
    });
});

@Component({
    template: `
        <igx-icon builtin name="home" family="material"></igx-icon>
        <igx-icon extended name="test" family="material"></igx-icon>
     `,
    imports: [IgxIconComponent]
})
class IconTestComponent { }

@Component({
    template: `<igx-icon name="reference" family="default"></igx-icon>`,
    imports: [IgxIconComponent]
})
class IconRefComponent { }

@Component({
    template: `
        <igx-icon name="arrow_prev" family="default"></igx-icon>
        <igx-icon name="expand_more" family="default"></igx-icon>
    `,
    providers: [
        {
            provide: THEME_TOKEN,
            useFactory: () => new ThemeToken()
        },
        IgxIconService
    ],
    imports: [IgxIconComponent]
})
class IconWithThemeTokenComponent {
    public themeToken = inject(THEME_TOKEN);

    constructor(public iconService: IgxIconService) {
        this.iconService.setIconRef('expand_more', 'default', { family: 'material', name: 'home' });
    }

    public setTheme(theme: IgxTheme) {
        this.themeToken.set(theme);
    }
}
