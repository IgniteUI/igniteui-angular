import { Component, ViewChild } from "@angular/core";
import { async, ComponentFixture, TestBed } from "@angular/core/testing";
import { FormsModule } from "@angular/forms";
import { By } from "@angular/platform-browser";
import { IgxDatePickerComponent, IgxDatePickerModule } from "./date-picker.component";

fdescribe("IgxDatePicker", () => {
    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [
                IgxDatePickerRenderingComponent
            ],
            imports: [IgxDatePickerModule, FormsModule]
        })
        .compileComponents();
    }));

    it("Initialize a datepicker component", () => {
        const fixture = TestBed.createComponent(IgxDatePickerRenderingComponent);
        fixture.detectChanges();

        expect(fixture.componentInstance).toBeDefined();
    });

    it("@Input properties", () => {
        const fixture = TestBed.createComponent(IgxDatePickerRenderingComponent);
        fixture.detectChanges();

        const datePicker = fixture.componentInstance.datePicker;

        expect(datePicker.dateValue).toEqual(new Date(Date.now()));
    });

    it("Datepicker DOM structure", () => {
        const fixture = TestBed.createComponent(IgxDatePickerRenderingComponent);
        fixture.detectChanges();
    });
});

@Component({
    template: `
        <igx-datePicker [(ngModel)]="date"></igx-datePicker>
    `
})
export class IgxDatePickerRenderingComponent {
    public date: Date = new Date(2017, 7, 7);
    @ViewChild(IgxDatePickerComponent) public datePicker: IgxDatePickerComponent;
}
