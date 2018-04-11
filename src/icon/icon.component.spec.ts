import { Component, ViewChild } from "@angular/core";
import {
    async,
    TestBed
} from "@angular/core/testing";
import { By } from "@angular/platform-browser";
import { IgxIconComponent } from "./icon.component";
import { IgxIconService } from "./icon.service";

describe("Icon", () => {
    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [
                IgxIconComponent,
                InitIconComponent,
                InitWithMaterialFontSetComponent,
                InitWithCustomFontSetComponent,
                InitWithImplicitLigatureComponent,
                InitWithExplicitLigatureComponent,
                InitWithIconGlyphComponent,
                InitErroneousIconComponent,
                InitCustomColorIconComponent,
                InitInactiveIconComponent
            ],
            providers: [IgxIconService]
        }).compileComponents();
    }));

    it("Initializes igx-icon", () => {
        const fixture = TestBed.createComponent(InitIconComponent);
        const icon = fixture.componentInstance.icon;
        fixture.detectChanges();

        expect(icon.id).toContain("igx-icon-");
        expect(fixture.debugElement).toBeTruthy();
        expect(icon.getIconColor).toBeFalsy();
        expect(icon.getIconName).toBeFalsy();
        expect(icon.glyphName).toBeFalsy();
        expect(icon.getFontSet).toEqual("material-icons");
        expect(icon.cssClass).toMatch("igx-icon");
        expect(icon.ariaHidden).toEqual(true);

        const el = fixture.debugElement.query(By.css("igx-icon"));

        expect(el).toBeTruthy();
        expect(el.nativeElement.getAttribute("aria-hidden")).toMatch("true");
    });

    it("Initializes igx-icon with material-icons font set", () => {
        const fixture = TestBed.createComponent(InitWithMaterialFontSetComponent);
        const icon = fixture.componentInstance.icon;
        fixture.detectChanges();

        expect(fixture.debugElement.query(By.css("igx-icon"))
            .nativeElement.classList).toContain("material-icons");
    });

    it("Initializes igx-icon with custom font set", () => {
        const fixture = TestBed.createComponent(InitWithCustomFontSetComponent);
        const icon = fixture.componentInstance.icon;
        fixture.detectChanges();

        expect(fixture.debugElement.query(By.css("igx-icon"))
            .nativeElement.classList).toContain("my-icon-font");
    });

    it("Initializes igx-icon with implicit ligature", () => {
        const fixture = TestBed.createComponent(InitWithImplicitLigatureComponent);
        const icon = fixture.componentInstance.icon;
        const cssClasses = "material-icons igx-icon";
        fixture.detectChanges();

        expect(icon.getIconName).toMatch("home");
        expect(icon.glyphName).toBeFalsy();

        const el = fixture.debugElement.query(By.css("igx-icon"));

        expect(el.nativeElement.classList).toMatch(cssClasses);
        expect(el.nativeElement.innerText).toEqual("home");
    });

    it("Initializes igx-icon with explicit ligature", () => {
        const fixture = TestBed.createComponent(InitWithExplicitLigatureComponent);
        const icon = fixture.componentInstance.icon;
        const cssClasses = "material-icons igx-icon";
        fixture.detectChanges();

        expect(icon.getIconName).toBeFalsy();
        expect(icon.glyphName).toBeFalsy();

        const el = fixture.debugElement.query(By.css("igx-icon"));

        expect(el.nativeElement.classList).toMatch(cssClasses);
        expect(el.nativeElement.innerText).toEqual("home");
    });

    it("Initializes igx-icon with icon glyph", () => {
        const fixture = TestBed.createComponent(InitWithIconGlyphComponent);
        const icon = fixture.componentInstance.icon;
        const cssClasses = "fa fa-music igx-icon";
        fixture.detectChanges();

        expect(icon.getIconName).toBeFalsy();
        expect(icon.glyphName).toMatch("fa-music");

        const el = fixture.debugElement.query(By.css("igx-icon"));

        expect(el.nativeElement.classList).toMatch(cssClasses);
        expect(el.nativeElement.innerText).toBeFalsy();
    });

    it("Initializes igx-icon with errors", () => {
        expect(() => {
            const fixture = TestBed.createComponent(InitErroneousIconComponent);
            const icon = fixture.componentInstance.icon;
            fixture.detectChanges();
        }).toThrowError();
    });

    it("Initializes igx-icon with custom color", () => {
        const fixture = TestBed.createComponent(InitCustomColorIconComponent);
        const icon = fixture.componentInstance.icon;
        fixture.detectChanges();

        const el = fixture.debugElement.query(By.css("igx-icon"));

        expect(icon.getIconColor).toEqual("red");
        expect(el.nativeElement.style.color).toEqual("red");
    });

    it("Initializes inactive igx-icon", () => {
        const fixture = TestBed.createComponent(InitInactiveIconComponent);
        const icon = fixture.componentInstance.icon;
        fixture.detectChanges();

        const el = fixture.debugElement.query(By.css("igx-icon"));

        expect(icon.getActive).toEqual(false);
        expect(el.nativeElement.classList).toMatch("igx-icon--inactive");
    });
});

@Component({
    template: `<igx-icon></igx-icon>`
})
class InitIconComponent {
    @ViewChild(IgxIconComponent) public icon: IgxIconComponent;
}

@Component({
    template: `<igx-icon fontSet="material"></igx-icon>`
})
class InitWithMaterialFontSetComponent {
    @ViewChild(IgxIconComponent) public icon: IgxIconComponent;
}

@Component({
    template: `<igx-icon fontSet="my-icon-font"></igx-icon>`
})
class InitWithCustomFontSetComponent {
    @ViewChild(IgxIconComponent) public icon: IgxIconComponent;
}

@Component({
    template: `<igx-icon fontSet="material" name="home"></igx-icon>`
})
class InitWithImplicitLigatureComponent {
    @ViewChild(IgxIconComponent) public icon: IgxIconComponent;
}

@Component({
    template: `<igx-icon fontSet="material">home</igx-icon>`
})
class InitWithExplicitLigatureComponent {
    @ViewChild(IgxIconComponent) public icon: IgxIconComponent;
}

@Component({
    template: `<igx-icon fontSet="fa" iconName="fa-music"></igx-icon>`
})
class InitWithIconGlyphComponent {
    @ViewChild(IgxIconComponent) public icon: IgxIconComponent;
}

@Component({
    template: `<igx-icon fontSet="fa" name="accessible" iconName="fa-music"></igx-icon>`
})
class InitErroneousIconComponent {
    @ViewChild(IgxIconComponent) public icon: IgxIconComponent;
}

@Component({
    template: `<igx-icon fontSet="material" name="home" color="red"></igx-icon>`
})
class InitCustomColorIconComponent {
    @ViewChild(IgxIconComponent) public icon: IgxIconComponent;
}

@Component({
    template: `<igx-icon fontSet="material" name="home" [isActive]="false"></igx-icon>`
})
class InitInactiveIconComponent {
    @ViewChild(IgxIconComponent) public icon: IgxIconComponent;
}
