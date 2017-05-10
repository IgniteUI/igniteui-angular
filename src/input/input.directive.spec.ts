import { Component, ViewChild } from "@angular/core";
import {
  async,
  TestBed,
} from "@angular/core/testing";
import { By } from "@angular/platform-browser";
import { IgxLabelModule } from "../label/label.directive";
import { IgxInput } from "./input.directive";

describe("IgxInput", function() {
    beforeEach(async(() => {
        TestBed.configureTestingModule({
            imports: [
                IgxInput,
                IgxLabelModule
            ],
            declarations: [
                InitInput,
                InputWithAttribs
            ]
        })
        .compileComponents();
    }));

    it("Initializes an empty input", () => {
        const fixture = TestBed.createComponent(InitInput);
        fixture.detectChanges();

        expect(fixture.debugElement.query(By.css("input"))).toBeTruthy();
    });

    it("Initializes an empty input with attributes", () => {
        const fixture = TestBed.createComponent(InputWithAttribs);
        fixture.detectChanges();

        const inputEl = fixture.debugElement.query(By.css("input")).nativeElement;

        expect(inputEl).toBeTruthy();
        expect(inputEl.getAttribute("name")).toBe("username");
        expect(inputEl.getAttribute("id")).toBe("username");
        expect(inputEl.getAttribute("placeholder")).toBe(fixture.componentInstance.placeholder);
        fixture.detectChanges();

        expect(inputEl.classList.contains("igx-form-group__input--placeholder")).toBe(true, "1");
        expect(inputEl.classList.contains("ig-form-group__input--focused")).toBe(false);

        inputEl.dispatchEvent(new Event("focus"));
        inputEl.value = "test";
        fixture.detectChanges();

        expect(inputEl.classList.contains("igx-form-group__input--placeholder")).toBe(false);
        expect(inputEl.classList.contains("igx-form-group__input--filled")).toBe(true, "2");
        expect(inputEl.classList.contains("igx-form-group__input--focused")).toBe(true, "3");

        inputEl.dispatchEvent(new Event("blur"));
        fixture.detectChanges();

        expect(inputEl.classList.contains("igx-form-group__input--focused")).toBe(false);

    });

});

@Component({ template: `<input type="text" igxInput />` })
class InitInput {
}

@Component({
    template: `
        <div class="igx-form-group">
            <input id="username" placeholder="{{placeholder}}" igxInput name="username" />
            <label igxLabel for="username">Username</label>
        </div>
    `
})
class InputWithAttribs {
    placeholder = "Please enter a name";
}
