import { Component, ViewChild } from "@angular/core";
import {
    async,
    TestBed
} from "@angular/core/testing";
import { By } from "@angular/platform-browser";
import { IgxIconComponent, IgxIconModule } from "./icon.component";

describe("Icon", () => {
    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [
                IgxIconComponent,
                InitIconComponent,
                InitMaterialIconComponent,
                InitCustomColorIconComponent,
                InitInactiveIconComponent
            ]
        }).compileComponents();
    }));

    it("Initializes igx-icon", () => {
        const fixture = TestBed.createComponent(InitIconComponent);
        const icon = fixture.componentInstance.icon;
        fixture.detectChanges();

        expect(fixture.debugElement).toBeTruthy();
        expect(icon.getIconColor).toBeFalsy();
        expect(icon.getIconName).toBeFalsy();
        expect(icon.getFontSet).toEqual("material");
        expect(icon.cssClass).toMatch("igx-icon");
        expect(fixture.debugElement.query(By.css("igx-icon"))).toBeTruthy();
    });

    it("Initializes igx-icon with material font", () => {
        const fixture = TestBed.createComponent(InitMaterialIconComponent);
        const icon = fixture.componentInstance.icon;
        const cssClasses = "material-icons igx-icon";
        fixture.detectChanges();

        expect(icon.el.nativeElement.classList).toMatch(cssClasses);
        expect(icon.el.nativeElement.innerText).toEqual("home");
    });

    it("Initializes igx-icon with custom color", () => {
        const fixture = TestBed.createComponent(InitCustomColorIconComponent);
        const icon = fixture.componentInstance.icon;
        fixture.detectChanges();

        expect(icon.getIconColor).toEqual("red");
        expect(icon.el.nativeElement.style.color).toEqual("red");
    });

    it("Initializes inactive igx-icon", () => {
        const fixture = TestBed.createComponent(InitInactiveIconComponent);
        const icon = fixture.componentInstance.icon;
        fixture.detectChanges();

        expect(icon.getActive).toEqual(false);
        expect(icon.el.nativeElement.classList).toMatch("igx-icon--inactive");
    });
});

@Component({
    template: `<igx-icon></igx-icon>`
})
class InitIconComponent {
    @ViewChild(IgxIconComponent) public icon: IgxIconComponent;
}

@Component({
    template: `<igx-icon fontSet="material" name="home"></igx-icon>`
})
class InitMaterialIconComponent {
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
