import { Component, ViewChild } from "@angular/core";
import { async, fakeAsync, TestBed, tick } from "@angular/core/testing";
import { FormsModule } from "@angular/forms";
import { By } from "@angular/platform-browser";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { IgxDatePickerComponent, IgxDatePickerModule } from "./date-picker.component";

describe("IgxDatePicker", () => {
    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [
                IgxDatePicker,
                IgxDatePickerInvalidDate,
                IgxDatePickerWithCustomFormatter,
                IgxDatePickerWithPassedDate
            ],
            imports: [IgxDatePickerModule, FormsModule, BrowserAnimationsModule]
        })
        .compileComponents();
    }));

    it("Initialize a datepicker component", () => {
        const fixture = TestBed.createComponent(IgxDatePicker);
        fixture.detectChanges();

        const datePicker = fixture.componentInstance.datePicker;
        const today = new Date(Date.now());

        expect(fixture.componentInstance).toBeDefined();
        expect(datePicker.dateValue.getDate()).toEqual(today.getDate());
    });

    it("@Input properties", () => {
        const fixture = TestBed.createComponent(IgxDatePickerWithPassedDate);
        fixture.detectChanges();

        const datePicker = fixture.componentInstance.datePicker;

        expect(datePicker.dateValue).toEqual(new Date(2017, 7, 7));
    });

    it("Datepicker DOM input value", () => {
        const fixture = TestBed.createComponent(IgxDatePicker);
        fixture.detectChanges();

        const today = new Date(Date.now());
        const formattedDate = `${today.getMonth() + 1}/${today.getDate()}/${today.getFullYear()}`;

        const dom = fixture.debugElement;
        const getValueFromInput = dom.query(By.css(".igx-date-picker__input-date")).nativeElement.value;

        expect(getValueFromInput).toEqual(formattedDate);
    });

    it("Datepicker pass invalid type", () => {
        const fixture = TestBed.createComponent(IgxDatePickerInvalidDate);
        fixture.detectChanges();

        const today = new Date(Date.now());
        const formattedDate = `${today.getMonth() + 1}/${today.getDate()}/${today.getFullYear()}`;

        const dom = fixture.debugElement;
        const getValueFromInput = dom.query(By.css(".igx-date-picker__input-date")).nativeElement.value;

        expect(getValueFromInput).toEqual(formattedDate);

    });

    it("Datepicker opened event", fakeAsync(() => {
        const fixture = TestBed.createComponent(IgxDatePicker);
        fixture.detectChanges();
        tick();
        fixture.detectChanges();

        const datePicker = fixture.componentInstance.datePicker;
        const dom = fixture.debugElement;

        const target = dom.query(By.css(".igx-date-picker__input-date"));

        spyOn(datePicker.onOpened, "emit");

        target.triggerEventHandler("click", { target: dom.nativeElement.children[0] });

        fixture.detectChanges();

        expect(datePicker.onOpened.emit).toHaveBeenCalled();
    }));

    it("Datepicker custom formatter", () => {
        const fixture = TestBed.createComponent(IgxDatePickerWithCustomFormatter);
        fixture.detectChanges();

        const compInstance = fixture.componentInstance;
        const datePicker = compInstance.datePicker;
        const dom = fixture.debugElement;
        const inputTarget = dom.query(By.css(".igx-date-picker__input-date")).nativeElement;
        const today = new Date(Date.now());
        const formattedDate = compInstance.customFormatter(today);

        expect(inputTarget.value).toEqual(formattedDate);
    });

    it("Datepicker custom locale(EN) date format", () => {
        const fixture = TestBed.createComponent(IgxDatePicker);
        fixture.detectChanges();

        const todayToEnLocale = new Date(Date.now()).toLocaleDateString("en");
        const dom = fixture.debugElement;
        const inputTarget = dom.query(By.css(".igx-date-picker__input-date")).nativeElement;

        expect(inputTarget.value).toEqual(todayToEnLocale);
    });
});

@Component({
    template: `
        <igx-datePicker [formatter]="customFormatter"></igx-datePicker>
    `
})
export class IgxDatePickerWithCustomFormatter {
    @ViewChild(IgxDatePickerComponent) public datePicker: IgxDatePickerComponent;

    public customFormatter = (_: Date) => (
        `${_.getFullYear()}/${_.getMonth()}/${_.getDate()}`
    )
}

@Component({
    template: `
        <igx-datePicker></igx-datePicker>
    `
})
export class IgxDatePickerInvalidDate {
    public date: string = "234/12/2017";
    @ViewChild(IgxDatePickerComponent) public datePicker: IgxDatePickerComponent;
}

@Component({
    template: `
        <igx-datePicker></igx-datePicker>
    `
})
export class IgxDatePicker {
    @ViewChild(IgxDatePickerComponent) public datePicker: IgxDatePickerComponent;
}

@Component({
    template: `
        <igx-datePicker [dateValue]="date"></igx-datePicker>
    `
})
export class IgxDatePickerWithPassedDate {
    public date: Date = new Date(2017, 7, 7);
    @ViewChild(IgxDatePickerComponent) public datePicker: IgxDatePickerComponent;
}
