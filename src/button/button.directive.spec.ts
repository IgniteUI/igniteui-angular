import { Component, ViewChild } from "@angular/core";
import {
  async,
  TestBed
} from "@angular/core/testing";
import { By } from "@angular/platform-browser";
import { IgxButton } from "./button.directive";

describe("IgxButton", () => {
    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [
                InitButton,
                ButtonWithAttribs,
                IgxButton
            ]
        })
        .compileComponents();
    }));

    it("Initializes a button", () => {
        const fixture = TestBed.createComponent(InitButton);
        fixture.detectChanges();

        expect(fixture.debugElement.query(By.css("span.igx-button--flat"))).toBeTruthy();
        expect(fixture.debugElement.query(By.css("i.material-icons"))).toBeTruthy();
    });

    it("Button with properties", () => {
        const fixture = TestBed.createComponent(ButtonWithAttribs);
        fixture.detectChanges();

        const button = fixture.debugElement.query(By.css("span")).nativeElement;

        expect(button).toBeTruthy();
        expect(button.classList.contains("igx-button--raised")).toBe(true);
        expect(button.classList.contains("igx-button--disabled")).toBe(true);

        fixture.componentInstance.isDisabled = false;
        fixture.detectChanges();

        expect(button.classList.contains("igx-button--disabled")).toBe(false);
        expect(button.style.color).toEqual("white");
        expect(button.style.background).toEqual("black");

        fixture.componentInstance.foreground = "yellow";
        fixture.componentInstance.background = "green";
        fixture.detectChanges();

        expect(button.style.color).toEqual("yellow");
        expect(button.style.background).toEqual("green");
    });
});

@Component({
    template:
    `<span igxButton="flat" igx-ripple="white">
        <i class="material-icons">add</i>
    </span>`
})
class InitButton {
}

@Component({
    template:
    `<span igxButton="raised"
        [igxButtonColor]="foreground"
        [igxButtonBackground]="background"
        [disabled]="isDisabled">Test</span>`
})
class ButtonWithAttribs {
    public isDisabled = true;
    public foreground = "white";
    public background = "black";
}
