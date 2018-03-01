import { Component, ViewChild } from "@angular/core";
import {
  async,
  TestBed
} from "@angular/core/testing";
import { FormsModule } from "@angular/forms";
import { By } from "@angular/platform-browser";
import { IgxInputModule } from "../input/input.directive";
import { IgxMaskModule } from "./mask.directive";

fdescribe("AppComponent", () => {
    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [
                InitInputComponent
            ],
            imports: [
                FormsModule,
                IgxInputModule,
                IgxMaskModule
            ]
        })
        .compileComponents();
    }));

    it("Initializes an input with default mask", () => {
        const fixture = TestBed.createComponent(InitInputComponent);
        fixture.detectChanges();

        const inputEl = fixture.debugElement.query(By.css("input")).nativeElement;

        expect(inputEl.value).toEqual("__________");
    });

});

@Component({ template: `<input type="text" igxInput [(ngModel)]="value" [igxMask]="mask"/>` })
class InitInputComponent {
    public mask;
    public value;
}
