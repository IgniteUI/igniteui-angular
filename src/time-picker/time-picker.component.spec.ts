import { Component, ViewChild } from "@angular/core";
import { async, fakeAsync, TestBed, tick } from "@angular/core/testing";
import { FormsModule } from "@angular/forms";
import { By } from "@angular/platform-browser";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { IgxTimePickerComponent, IgxTimePickerModule } from "./time-picker.component";

describe("IgxTimePicker", () => {
    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [
                IgxTimePickerTestComponent
            ],
            imports: [IgxTimePickerModule, FormsModule, BrowserAnimationsModule]
        })
        .compileComponents();
    }));

    it("Initialize a timepicker component", () => {
        const fixture = TestBed.createComponent(IgxTimePickerTestComponent);
        fixture.detectChanges();

        const timePicker = fixture.componentInstance.timePicker;
        const result = "";

        expect(fixture.componentInstance).toBeDefined();
        expect(timePicker.displayTime).toEqual(result);
    });
});

@Component({
    template: `
        <igx-time-picker></igx-time-picker>
    `
})
export class IgxTimePickerTestComponent {
    @ViewChild(IgxTimePickerComponent) public timePicker: IgxTimePickerComponent;
}
