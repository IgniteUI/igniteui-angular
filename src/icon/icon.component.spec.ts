import { Component, ViewChild } from "@angular/core";
import {
    async,
    TestBed
} from "@angular/core/testing";
import { By } from "@angular/platform-browser";
import { IgxIcon, IgxIconModule } from "./icon.component";

describe("Icon", () => {
    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [
                IgxIcon,
                InitIcon,
                InitMaterialIcon,
                InitCustomColorIcon,
                InitInactiveIcon
            ]
        }).compileComponents();
    }));

    it("Initializes icon with initials", () => {
        const fixture = TestBed.createComponent(InitIcon);
        const icon = fixture.componentInstance.icon;
        fixture.detectChanges();

        expect(icon.getActive).toBeTruthy();
        expect(icon.getIconColor).toBeFalsy();
        expect(icon.getIconName).toBeFalsy();
        expect(icon.getFontSet).toEqual("material");
        expect(icon.el.nativeElement.getElementsByClassName("igx-icon")).toBeTruthy();
        expect(icon.themeIcon).toBeTruthy();
    });

    it("Initializes material icon", () => {
        const fixture = TestBed.createComponent(InitMaterialIcon);
        const icon = fixture.componentInstance.icon;
        fixture.detectChanges();

        expect(icon.themeIcon.nativeElement.classList.contains("material-icons")).toBeTruthy();
        expect(icon.themeIcon.nativeElement.innerText).toEqual("home");

    });

    it("Initializes custom color icon", () => {
        const fixture = TestBed.createComponent(InitCustomColorIcon);
        const icon = fixture.componentInstance.icon;
        fixture.detectChanges();

        expect(icon.getIconColor).toEqual("red");
        expect(icon.el.nativeElement.style.color).toEqual("red");
    });

    it("Initializes inactive icon", () => {
        const fixture = TestBed.createComponent(InitInactiveIcon);
        const icon = fixture.componentInstance.icon;
        const iconContainers = icon.el.nativeElement.getElementsByClassName("igx-icon");

        fixture.detectChanges();

        expect(icon.getActive).toBeFalsy();
        expect(iconContainers[0].classList.contains("igx-icon--inactive")).toBeTruthy();
    });
});

@Component({
    template: `<igx-icon></igx-icon>`
})
class InitIcon {
    @ViewChild(IgxIcon) public icon: IgxIcon;
}

@Component({
    template: `<igx-icon fontSet="material" name="home"></igx-icon>`
})
class InitMaterialIcon {
    @ViewChild(IgxIcon) public icon: IgxIcon;
}

@Component({
    template: `<igx-icon fontSet="material" name="home" color="red"></igx-icon>`
})
class InitCustomColorIcon {
    @ViewChild(IgxIcon) public icon: IgxIcon;
}

@Component({
    template: `<igx-icon fontSet="material" name="home" isActive="false"></igx-icon>`
})
class InitInactiveIcon {
    @ViewChild(IgxIcon) public icon: IgxIcon;
}
