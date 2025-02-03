import { Component } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { IgxIconComponent } from "./icon.component";
import { IgxIconService } from "./icon.service";
import { IconFamily } from './types';
import type { IconType } from './types';

import { configureTestSuite } from "../test-utils/configure-suite";
import { By } from "@angular/platform-browser";

describe("Icon", () => {
    configureTestSuite();

    describe("Component", () => {
        let fixture: ComponentFixture<IconTestComponent>;
        let instance: IgxIconComponent;
        let el: HTMLElement;

        beforeEach(() => {
            TestBed.configureTestingModule({
                imports: [IgxIconComponent, IconTestComponent],
                providers: [IgxIconService],
            }).compileComponents();

            fixture = TestBed.createComponent(IconTestComponent);

            const debugElement = fixture.debugElement.query(
                By.directive(IgxIconComponent),
            );

            instance = debugElement.componentInstance;
            el = debugElement.nativeElement;
        });

        it("should instatiate with defaults", () => {
            fixture.detectChanges();

            expect(instance.getFamily).toBe("material");
            expect(instance.getActive).toBe(true);
        });

        it("should set icon as inactive", () => {
            instance.active = false;
            fixture.detectChanges();

            expect(el.classList).toContain("igx-icon--inactive");

            instance.active = true;
            fixture.detectChanges();

            expect(el.classList).not.toContain("igx-icon--inactive");
        });

        it("should properly render ligature-based icons", () => {
            const iconService = TestBed.inject(IgxIconService);
            iconService.setFamily("liga", { className: "liga", type: "liga" });

            instance.name = "home";
            instance.family = "liga";

            fixture.detectChanges();

            assertRenderedIcon(el, {
                family: instance.family,
                name: instance.name,
                classList: ["igx-icon", "my-class", instance.family],
                type: "liga",
            });
        });

        it("should properly render font-based icons", () => {
            const iconService = TestBed.inject(IgxIconService);
            iconService.setFamily("fonty", {
                className: "fonty",
                type: "font",
            });

            instance.name = "home";
            instance.family = "fonty";

            fixture.detectChanges();

            assertRenderedIcon(el, {
                family: instance.family,
                name: instance.name,
                classList: ["igx-icon", "my-class", instance.family, instance.name],
                type: "font",
            });
        });

        it("should properly render SVG-based icons", () => {
            const savage = `<svg fit="" preserveAspectRatio="xMidYMid meet">...</svg>`;
            const iconService = TestBed.inject(IgxIconService);

            iconService.setFamily("savage", {
                className: "savage",
                type: "svg",
            });

            iconService.addSvgIconFromText("savvy", savage, "savage");

            instance.name = "savvy";
            instance.family = "savage";

            fixture.detectChanges();

            assertRenderedIcon(el, {
                family: instance.family,
                name: instance.name,
                classList: ["igx-icon", "my-class", instance.family],
                type: "svg",
                svg: savage,
            });
        });
    });

    describe("Integration with Service", () => {
        let fa: IconFamily;
        let iconName: string;

        beforeEach(() => {
            fa = {
                name: "fa-solid",
                meta: {
                    className: "fa",
                    type: "font",
                    prefix: "fa-",
                },
            };

            iconName = `${fa.meta.prefix}home`;
        });

        it("should respond when default family changes", () => {
            const iconService = TestBed.inject(IgxIconService);

            // Change the default family ahead of time to font-awesome solid.
            iconService.defaultFamily = fa;

            const fixture = TestBed.createComponent(IconTestComponent);
            const debugElement = fixture.debugElement.query(
                By.directive(IgxIconComponent),
            );

            const instance = debugElement.componentInstance;
            const el = debugElement.nativeElement;

            fixture.detectChanges();

            expect(instance.getFamily).toBe(fa.name);
            expect(instance.getName).toBe(iconName);

            assertRenderedIcon(el, {
                family: fa.name,
                name: iconName,
                classList: ["igx-icon", "my-class", fa.meta.className, iconName],
                type: fa.meta.type,
            });
        });

        it("should work with families by reference", () => {
            const iconService = TestBed.inject(IgxIconService);

            iconService.setFamily(fa.name, fa.meta);
            iconService.setIconRef("home", "default", {
                name: "home",
                family: fa.name,
            });

            const fixture = TestBed.createComponent(MetaIconComponent);
            const debugElement = fixture.debugElement.query(
                By.directive(IgxIconComponent),
            );

            const instance = debugElement.componentInstance;
            const el = debugElement.nativeElement;

            fixture.detectChanges();

            expect(instance.getFamily).toBe(fa.name);
            expect(instance.getName).toBe(iconName);

            assertRenderedIcon(el, {
                family: fa.name,
                name: iconName,
                classList: ["igx-icon", "my-class", fa.meta.className, iconName],
                type: fa.meta.type,
            });
        });
    });
});

interface ProtoIgxIcon {
    name: string;
    family: string;
    classList: string[];
    type: IconType;
    svg?: string;
}

function assertRenderedIcon(el: HTMLElement, icon: ProtoIgxIcon) {
    expect(el.classList.length).toEqual(icon.classList.length);

    icon.classList.forEach((className) => {
        expect(el.classList).toContain(className);
    });

    switch (icon.type) {
        case "svg":
            expect(el.innerHTML).toContain(icon.svg);
            break;
        case "font":
            expect(el.textContent).toBeFalsy();
            break;
        case "liga":
        default:
            expect(el.textContent).toEqual(icon.name);
            break;
    }
}

@Component({
    template: `<igx-icon class="my-class" name="home"></igx-icon>`,
    imports: [IgxIconComponent]
})
class IconTestComponent {}

@Component({
    template: `<igx-icon
        class="my-class"
        family="default"
        name="home"
    ></igx-icon>`,
    imports: [IgxIconComponent]
})
class MetaIconComponent {}
