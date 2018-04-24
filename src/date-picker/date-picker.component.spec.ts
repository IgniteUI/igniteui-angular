import { Component, ViewChild } from "@angular/core";
import { async, fakeAsync, TestBed, tick } from "@angular/core/testing";
import { FormsModule } from "@angular/forms";
import { By } from "@angular/platform-browser";
import { NoopAnimationsModule } from "@angular/platform-browser/animations";
import { IgxDatePickerComponent, IgxDatePickerModule } from "./date-picker.component";

describe("IgxDatePicker", () => {
    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [
                IgxDatePickerTestComponent,
                IgxDatePickerWithWeekStartComponent,
                IgxDatePickerWithCustomFormatterComponent,
                IgxDatePickerWithPassedDateComponent,
                IgxDatePickerWIthLocaleComponent
            ],
            imports: [IgxDatePickerModule, FormsModule, NoopAnimationsModule]
        })
        .compileComponents();
    }));

    it("Initialize a datepicker component", () => {
        const fixture = TestBed.createComponent(IgxDatePickerTestComponent);
        fixture.detectChanges();

        const datePicker = fixture.componentInstance.datePicker;
        const result = "";

        expect(fixture.componentInstance).toBeDefined();
        expect(datePicker.displayData).toEqual(result);
    });
    it("Initialize a datepicker component with id", () => {
        const fixture = TestBed.createComponent(IgxDatePickerTestComponent);
        fixture.detectChanges();

        const datePicker = fixture.componentInstance.datePicker;
        const domDatePicker = fixture.debugElement.query(By.css("igx-datePicker")).nativeElement;

        expect(datePicker.id).toContain("igx-datePicker-");
        expect(domDatePicker.id).toContain("igx-datePicker-");

        datePicker.id = "customDatePicker";
        fixture.detectChanges();

        expect(datePicker.id).toBe("customDatePicker");
        expect(domDatePicker.id).toBe("customDatePicker");
    });

    it("@Input properties", () => {
        const fixture = TestBed.createComponent(IgxDatePickerWithPassedDateComponent);
        fixture.detectChanges();

        const datePicker = fixture.componentInstance.datePicker;

        expect(datePicker.value).toEqual(new Date(2017, 7, 7));
    });

    it("Datepicker DOM input value", () => {
        const fixture = TestBed.createComponent(IgxDatePickerWithPassedDateComponent);
        fixture.detectChanges();

        const today = new Date(2017, 7, 7);
        const formattedDate = `${today.getMonth() + 1}/${today.getDate()}/${today.getFullYear()}`;

        const dom = fixture.debugElement;
        const getValueFromInput = dom.query(By.css(".igx-date-picker__input-date")).nativeElement.value;

        expect(getValueFromInput).toEqual(formattedDate);
    });

    it("Datepicker week start day (Monday)", () => {
        const fixture = TestBed.createComponent(IgxDatePickerWithWeekStartComponent);
        fixture.detectChanges();

        const dom = fixture.debugElement;
        const datePickerTarget = dom.query(By.css(".igx-date-picker__input-date"));

        datePickerTarget.nativeElement.dispatchEvent(new Event("click", { bubbles: true }));
        fixture.detectChanges();

        const firstDayValue = dom.query(By.css(".igx-calendar__label")).nativeElement.innerText;
        const expectedResult = "Mon";

        expect(firstDayValue).toBe(expectedResult);
    });

    it("Set formatOptions for month to be numeric", () => {
        const fixture = TestBed.createComponent(IgxDatePickerWithPassedDateComponent);
        fixture.detectChanges();

        const getMonthFromPickerDate = fixture.componentInstance.date.getMonth() + 1;
        const dom = fixture.debugElement;
        const datePickerTarget = dom.query(By.css(".igx-date-picker__input-date"));

        datePickerTarget.nativeElement.dispatchEvent(new Event("click", { bubbles: true }));
        fixture.detectChanges();

        const getMonthFromCalendarHeader: any = dom.query(By.css(".igx-calendar__header-date")).nativeElement
            .children[1].innerText.substring(0, 1);

        expect(parseInt(getMonthFromCalendarHeader, 10)).toBe(getMonthFromPickerDate);
    });

    it("locale propagate calendar value (de-DE)", () => {
        const fixture = TestBed.createComponent(IgxDatePickerWIthLocaleComponent);
        fixture.detectChanges();

        const datePicker = fixture.componentInstance.datePicker;
        const dateConvertedToDeLocale = fixture.componentInstance.date.toLocaleDateString("de-DE");

        expect(datePicker.displayData).toBe(dateConvertedToDeLocale);
    });

    it("Datepicker open event", () => {
        const fixture = TestBed.createComponent(IgxDatePickerTestComponent);
        fixture.detectChanges();

        const datepicker = fixture.componentInstance.datePicker;
        const dom = fixture.debugElement;

        const target = dom.query(By.css(".igx-date-picker__input-date"));

        spyOn(datepicker.onOpen, "emit");

        target.nativeElement.dispatchEvent(new Event("click", { bubbles: true }));

        fixture.detectChanges();

        expect(datepicker.onOpen.emit).toHaveBeenCalled();
        expect(datepicker.onOpen.emit).toHaveBeenCalledWith(datepicker);
    });

    it("Datepicker onSelection event and selectDate method propagation", () => {
        const fixture = TestBed.createComponent(IgxDatePickerTestComponent);
        fixture.detectChanges();

        const datePicker = fixture.componentInstance.datePicker;
        spyOn(datePicker.onSelection, "emit");

        const newDate: Date = new Date(2016, 4, 6);
        datePicker.selectDate(newDate);

        fixture.detectChanges();

        expect(datePicker.onSelection.emit).toHaveBeenCalled();
        expect(datePicker.value).toBe(newDate);
    });

    it("Datepicker custom formatter", () => {
        const fixture = TestBed.createComponent(IgxDatePickerWithCustomFormatterComponent);
        fixture.detectChanges();

        const compInstance = fixture.componentInstance;
        const datePicker = compInstance.datePicker;
        const dom = fixture.debugElement;
        const inputTarget = dom.query(By.css(".igx-date-picker__input-date")).nativeElement;
        const date = new Date(2017, 7, 7);
        const formattedDate = compInstance.customFormatter(date);

        expect(inputTarget.value).toEqual(formattedDate);
    });

    it("Datepicker custom locale(EN) date format", () => {
        const fixture = TestBed.createComponent(IgxDatePickerWithPassedDateComponent);
        fixture.detectChanges();

        const todayToEnLocale = new Date(2017, 7, 7).toLocaleDateString("en");
        const dom = fixture.debugElement;
        const inputTarget = dom.query(By.css(".igx-date-picker__input-date")).nativeElement;

        expect(inputTarget.value).toEqual(todayToEnLocale);
    });
});

@Component({
    template: `
        <igx-datePicker [formatter]="customFormatter" [value]=date></igx-datePicker>
    `
})
export class IgxDatePickerWithCustomFormatterComponent {
    @ViewChild(IgxDatePickerComponent) public datePicker: IgxDatePickerComponent;

    public date = new Date(2017, 7, 7);
    public customFormatter = (_: Date) => (
        `${_.getFullYear()}/${_.getMonth()}/${_.getDate()}`
    )
}

@Component({
    template: `
        <igx-datePicker [value]="date" [weekStart]="1"></igx-datePicker>
    `
})
export class IgxDatePickerWithWeekStartComponent {
    public date: Date = new Date(2017, 6, 8);
    @ViewChild(IgxDatePickerComponent) public datePicker: IgxDatePickerComponent;
}

@Component({
    template: `
        <igx-datePicker></igx-datePicker>
    `
})
export class IgxDatePickerTestComponent {
    public weekStart = 1;
    @ViewChild(IgxDatePickerComponent) public datePicker: IgxDatePickerComponent;
}

@Component({
    template: `
        <igx-datePicker [value]="date" [formatOptions]="formatOptions"></igx-datePicker>
    `
})
export class IgxDatePickerWithPassedDateComponent {
    public date: Date = new Date(2017, 7, 7);
    public formatOptions = {
        day: "numeric",
        month: "numeric",
        weekday: "short",
        year: "numeric"
    };
    @ViewChild(IgxDatePickerComponent) public datePicker: IgxDatePickerComponent;
}

@Component({
    template: `
        <igx-datePicker [value]="date" [locale]="'de-DE'"></igx-datePicker>
    `
})
export class IgxDatePickerWIthLocaleComponent {
    public date: Date = new Date(2017, 7, 7);
    @ViewChild(IgxDatePickerComponent) public datePicker: IgxDatePickerComponent;
}
