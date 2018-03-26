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
                IgxTimePickerTestComponent,
                IgxTimePickerWithPassedTimeComponent,
                IgxTimePickerWithPmTimeComponent,
                IgxTimePickerWithMInMaxTimeValueComponent,
                IgxTimePickerWith24HTimeComponent,
                IgxTimePickerWithAMPMLeadingZerosTimeComponent,
                IgxTimePickerWithSpinLoopFalseValueComponent,
                IgxTimePickerWithItemsDeltaValueComponent
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

    it("@Input properties", () => {
        const fixture = TestBed.createComponent(IgxTimePickerWithPassedTimeComponent);
        fixture.detectChanges();

        const timePicker = fixture.componentInstance.timePicker;
        expect(timePicker.value).toEqual(new Date(2017, 7, 7, 3, 24));
    });

    it("TimePicker DOM input value", () => {
        const fixture = TestBed.createComponent(IgxTimePickerWithPassedTimeComponent);
        fixture.detectChanges();

        const currentTime = new Date(2017, 7, 7, 3, 24);
        const formattedTime = `${currentTime.getHours()}:${currentTime.getMinutes()} ${currentTime.getHours() > 12 ? "PM" : "AM"}`;

        const dom = fixture.debugElement;

        const getValueFromInput = dom.query(By.css(".igx-form-group__input")).nativeElement.value;
        expect(getValueFromInput).toEqual(formattedTime);
    });

    it("Dialog header value", () => {
        const fixture = TestBed.createComponent(IgxTimePickerWithPmTimeComponent);
        fixture.detectChanges();

        // get time-picker value
        const testElementTIme = fixture.componentInstance.dateValue;
        const formatedTestElementTime =
         `${testElementTIme.getHours()}:${testElementTIme.getMinutes()} ${testElementTIme.getHours() >= 12 ? "PM" : "AM"}`;

        openInput(fixture);

        // get time from dialog header
        const getTimeFromPopupHeader: any = fixture.debugElement.query(By.css(".igx-time-picker__header")).nativeElement.children;
        const formatedTimeFromPopupHeader =
         `${getTimeFromPopupHeader[1].innerText.replace(/\n/g, "")} ${getTimeFromPopupHeader[0].innerText}`;

        expect(formatedTimeFromPopupHeader).toBe(formatedTestElementTime);
    });

    it("Dialog selected element position", () => {
        const fixture = TestBed.createComponent(IgxTimePickerWithPmTimeComponent);
        fixture.detectChanges();

        const dom = fixture.debugElement;
        openInput(fixture);

        const expectedColumnElements = 7;
        const getHourColumn: any = dom.query(By.css(".igx-time-picker__hourList")).nativeElement.children;
        const getMinuteColumn: any = dom.query(By.css(".igx-time-picker__minuteList")).nativeElement.children;
        const getAMPMColumn: any = dom.query(By.css(".igx-time-picker__ampmList")).nativeElement.children;

        // check element count
        expect(getHourColumn.length).toBe(expectedColumnElements);
        expect(getMinuteColumn.length).toBe(expectedColumnElements);
        expect(getAMPMColumn.length).toBe(expectedColumnElements);

        // verify selected's position to be in the middle
        expect(getHourColumn[3].classList).toContain("igx-time-picker__item--selected");
        expect(getMinuteColumn[3].classList).toContain("igx-time-picker__item--selected");
        expect(getAMPMColumn[3].classList).toContain("igx-time-picker__item--selected");

    });

    it("TImepicker open event", () => {
        const fixture = TestBed.createComponent(IgxTimePickerTestComponent);
        fixture.detectChanges();

        const timePicker = fixture.componentInstance.timePicker;
        const dom = fixture.debugElement;

        const target = dom.query(By.css(".igx-form-group__input"));

        spyOn(timePicker.onOpen, "emit");

        target.triggerEventHandler("click", { target: dom.nativeElement.children[0] });

        fixture.detectChanges();

        expect(timePicker.onOpen.emit).toHaveBeenCalled();
    });

    it("TImepicker Validation Failed event", () => {
        const fixture = TestBed.createComponent(IgxTimePickerWithMInMaxTimeValueComponent);
        fixture.detectChanges();

        const timePicker = fixture.componentInstance.timePicker;
        const dom = fixture.debugElement;

        openInput(fixture);

        selectTimeDifference(fixture, -3, -3);

        const getOkButton = dom.queryAll(By.css(".igx-button--flat"))[1];
        spyOn(timePicker.onValidationFailed, "emit");
        getOkButton.triggerEventHandler("click", {});
        fixture.detectChanges();

        expect(timePicker.onValidationFailed.emit).toHaveBeenCalled();
    });

    it("Timepicker cancel button", () => {
        const fixture = TestBed.createComponent(IgxTimePickerWithPmTimeComponent);
        fixture.detectChanges();

        const timePicker = fixture.componentInstance.timePicker;
        const dom = fixture.debugElement;

        const initialTime = dom.query(By.css(".igx-form-group__input")).nativeElement.value;

        openInput(fixture);

        selectTimeDifference(fixture, 2, -3, "AM");

        const getCancelButton = dom.queryAll(By.css(".igx-button--flat"))[0];
        getCancelButton.triggerEventHandler("click", {});
        fixture.detectChanges();

        const selectedTime = dom.query(By.css(".igx-form-group__input")).nativeElement.value;
        expect(initialTime).toEqual(selectedTime);

    });

    it("Timepicker ValueChanged event", () => {
        const fixture = TestBed.createComponent(IgxTimePickerTestComponent);
        fixture.detectChanges();

        const timePicker = fixture.componentInstance.timePicker;
        const dom = fixture.debugElement;

        openInput(fixture);

        const getHourColumn = dom.query(By.css(".igx-time-picker__hourList"));
        const selectHour = getHourColumn.children[5];
        const hourValue = selectHour.nativeElement.innerText;

        const getMinutesColumn = dom.query(By.css(".igx-time-picker__minuteList"));
        const selectMinutes = getMinutesColumn.children[2];
        const minuteValue = selectMinutes.nativeElement.innerText;

        const getAMPMColumn = dom.query(By.css(".igx-time-picker__ampmList"));
        const selectAMPM = getAMPMColumn.children[4];
        const aMPMValue = selectAMPM.nativeElement.innerText;

        selectHour.triggerEventHandler("click", {});
        fixture.detectChanges();
        selectMinutes.triggerEventHandler("click", {});
        fixture.detectChanges();
        selectAMPM.triggerEventHandler("click", {});
        fixture.detectChanges();

        const getOkButton = dom.queryAll(By.css(".igx-button--flat"))[1];
        spyOn(timePicker.onValueChanged, "emit");
        getOkButton.triggerEventHandler("click", {});
        fixture.detectChanges();

        expect(timePicker.onValueChanged.emit).toHaveBeenCalled();

        const getValueFromInput = dom.query(By.css(".igx-form-group__input")).nativeElement.value;
        const selectedTime = `${hourValue}:${minuteValue} ${aMPMValue}`;

        expect(getValueFromInput).toEqual(selectedTime);

    });

    it("Timepicker UP Down Keyboard navigation", () => {
        const fixture = TestBed.createComponent(IgxTimePickerWithPassedTimeComponent);
        fixture.detectChanges();

        const timePicker = fixture.componentInstance.timePicker;
        const dom = fixture.debugElement;

        openInput(fixture);

        const getHourColumn: any = dom.query(By.css(".igx-time-picker__hourList"));
        const getMinuteColumn: any = dom.query(By.css(".igx-time-picker__minuteList"));
        const getAMPMColumn: any = dom.query(By.css(".igx-time-picker__ampmList"));

        getHourColumn.nativeElement.focus();
        // move arrows several times with hour column
        let args = { key: "ArrowUp", bubbles: true };
        getHourColumn.nativeElement.dispatchEvent(new KeyboardEvent("keydown", args));
        args = { key: "ArrowDown", bubbles: true };
        getHourColumn.nativeElement.dispatchEvent(new KeyboardEvent("keydown", args));
        args = { key: "ArrowUp", bubbles: true };
        getHourColumn.nativeElement.dispatchEvent(new KeyboardEvent("keydown", args));
        fixture.detectChanges();

        getMinuteColumn.nativeElement.focus();
        // move arrows several times with minute column
        args = { key: "ArrowDown", bubbles: true };
        getMinuteColumn.nativeElement.dispatchEvent(new KeyboardEvent("keydown", args));
        args = { key: "ArrowUp", bubbles: true };
        getMinuteColumn.nativeElement.dispatchEvent(new KeyboardEvent("keydown", args));
        args = { key: "ArrowDown", bubbles: true };
        getMinuteColumn.nativeElement.dispatchEvent(new KeyboardEvent("keydown", args));
        fixture.detectChanges();

        getAMPMColumn.nativeElement.focus();
        // move arrows several times with ampm column
        args = { key: "ArrowUp", bubbles: true };
        getAMPMColumn.nativeElement.dispatchEvent(new KeyboardEvent("keydown", args));
        args = { key: "ArrowDown", bubbles: true };
        getAMPMColumn.nativeElement.dispatchEvent(new KeyboardEvent("keydown", args));
        fixture.detectChanges();

        // get time from dialog header
        const getTimeFromPopupHeader: any = dom.query(By.css(".igx-time-picker__header")).nativeElement.children;
        const formatedTimeFromPopupHeader =
         `${getTimeFromPopupHeader[1].innerText.replace(/\n/g, "")} ${getTimeFromPopupHeader[0].innerText}`;

        args = { key: "Enter", bubbles: true };
        getHourColumn.nativeElement.dispatchEvent(new KeyboardEvent("keydown", args));
        fixture.detectChanges();

        const getValueFromInput = dom.query(By.css(".igx-form-group__input")).nativeElement.value;

        expect(formatedTimeFromPopupHeader).toBe(getValueFromInput);
    });

    it("Timepicker Left Right Keyboard navigation", fakeAsync(() => {
        const fixture = TestBed.createComponent(IgxTimePickerWithPassedTimeComponent);
        fixture.detectChanges();

        const timePicker = fixture.componentInstance.timePicker;
        const dom = fixture.debugElement;
        const initialTime = dom.query(By.css(".igx-form-group__input")).nativeElement.value;

        let args = { key: "ArrowRight", bubbles: true };
        openInput(fixture);

        const getHourColumn: any = dom.query(By.css(".igx-time-picker__hourList"));
        getHourColumn.nativeElement.focus();

        fixture.whenStable().then(() => {
            fixture.detectChanges();
            expect(document.activeElement.classList).toContain("igx-time-picker__hourList");

            document.activeElement.dispatchEvent(new KeyboardEvent("keydown", args));
        }).then(() => {
            fixture.detectChanges();
            expect(document.activeElement.classList).toContain("igx-time-picker__minuteList");

            args = { key: "ArrowLeft", bubbles: true };
            document.activeElement.dispatchEvent(new KeyboardEvent("keydown", args));
            fixture.detectChanges();
            args = { key: "ArrowRight", bubbles: true };
            document.activeElement.dispatchEvent(new KeyboardEvent("keydown", args));
            fixture.detectChanges();

            args = { key: "ArrowUp", bubbles: true };
            document.activeElement.dispatchEvent(new KeyboardEvent("keydown", args));
        }).then(() => {
            fixture.detectChanges();
            expect(document.activeElement.children[3].innerHTML.trim()).toBe("23");

            args = { key: "ArrowRight", bubbles: true };
            document.activeElement.dispatchEvent(new KeyboardEvent("keydown", args));
        }).then(() => {
            fixture.detectChanges();

            args = { key: "ArrowDown", bubbles: true };
            document.activeElement.dispatchEvent(new KeyboardEvent("keydown", args));
        }).then(() => {
            fixture.detectChanges();
            expect(document.activeElement.children[3].innerHTML.trim()).toBe("PM");
        }).then(() => {
            fixture.detectChanges();

            args = { key: "ArrowLeft", bubbles: true };
            document.activeElement.dispatchEvent(new KeyboardEvent("keydown", args));
        }).then(() => {
            fixture.detectChanges();
            expect(document.activeElement.classList).toContain("igx-time-picker__minuteList");
        }).then(() => {
            // get time from dialog header
            const getTimeFromPopupHeader: any = dom.query(By.css(".igx-time-picker__header")).nativeElement.children;
            const formatedTimeFromPopupHeader =
            `${getTimeFromPopupHeader[1].innerText.replace(/\n/g, "")} ${getTimeFromPopupHeader[0].innerText}`;

            expect(formatedTimeFromPopupHeader).toBe("3:23 PM");
        }).then(() => {
            args = { key: "Escape", bubbles: true };
            document.activeElement.dispatchEvent(new KeyboardEvent("keydown", args));
        }).then(() => {
            fixture.detectChanges();
            const selectedTime = dom.query(By.css(".igx-form-group__input")).nativeElement.value;
            tick();
            expect(initialTime).toEqual(selectedTime);
        });
    }));

    it("Timepicker Mouse Over", fakeAsync(() => {
        const fixture = TestBed.createComponent(IgxTimePickerWithPassedTimeComponent);
        fixture.detectChanges();

        openInput(fixture);
        fixture.detectChanges();

        // const timePicker = fixture.componentInstance.timePicker;
        const dom = fixture.debugElement;
        const getHourColumn: any = dom.query(By.css(".igx-time-picker__hourList"));
        const getMinuteColumn: any = dom.query(By.css(".igx-time-picker__minuteList"));
        const getAMPMColumn: any = dom.query(By.css(".igx-time-picker__ampmList"));

        getHourColumn.triggerEventHandler("focus", {});
        fixture.detectChanges();
        getHourColumn.triggerEventHandler("mouseover", {});

        fixture.whenStable().then(() => {
            fixture.detectChanges();
            expect(document.activeElement.classList).toContain("igx-time-picker__hourList");
            tick();
            getMinuteColumn.triggerEventHandler("mouseover", {});
        })
        .then(() => {
            fixture.detectChanges();
            expect(document.activeElement.classList).toContain("igx-time-picker__minuteList");
            tick();
            getAMPMColumn.triggerEventHandler("mouseover", {});
        }).then(() => {
            fixture.detectChanges();
            expect(document.activeElement.classList).toContain("igx-time-picker__ampmList");
            getHourColumn.triggerEventHandler("blur", {});
            fixture.detectChanges();
        });
    }));

    it("Timepicker Mouse Wheel", fakeAsync(() => {
        const fixture = TestBed.createComponent(IgxTimePickerWithPassedTimeComponent);
        fixture.detectChanges();

        openInput(fixture);
        fixture.detectChanges();

        // const timePicker = fixture.componentInstance.timePicker;
        const dom = fixture.debugElement;
        const getHourColumn: any = dom.query(By.css(".igx-time-picker__hourList"));
        const getMinuteColumn: any = dom.query(By.css(".igx-time-picker__minuteList"));
        const getAMPMColumn: any = dom.query(By.css(".igx-time-picker__ampmList"));

        // focus hours
        getHourColumn.nativeElement.focus();
        tick();
        getHourColumn.triggerEventHandler("wheel", {deltaX: 0, deltaY: 0});
        getHourColumn.triggerEventHandler("wheel", {deltaX: 0, deltaY: -100});
        fixture.detectChanges();
        // move the mouse wheel up and expect the selected element to be 2
        expect(getHourColumn.nativeElement.children[3].innerText).toBe("2");
        getHourColumn.triggerEventHandler("wheel", {deltaX: 0, deltaY: 100});
        fixture.detectChanges();
        // move the mouse wheel down and expect the selected element to be 3 again
        expect(getHourColumn.nativeElement.children[3].innerText).toBe("3");

        // focus minutes
        getMinuteColumn.nativeElement.focus();
        tick();
        getMinuteColumn.triggerEventHandler("wheel", {deltaX: 0, deltaY: -100});
        fixture.detectChanges();
        // move the mouse wheel up and expect the selected element to be 23
        expect(getMinuteColumn.nativeElement.children[3].innerText).toBe("23");
        getMinuteColumn.triggerEventHandler("wheel", {deltaX: 0, deltaY: 100});
        fixture.detectChanges();
        // move the mouse wheel down and expect the selected element to be 24 again
        expect(getMinuteColumn.nativeElement.children[3].innerText).toBe("24");

        // focus ampm
        getAMPMColumn.nativeElement.focus();
        tick();
        fixture.detectChanges();
        getAMPMColumn.triggerEventHandler("wheel", {deltaX: 0, deltaY: 100});
        fixture.detectChanges();
        // move the mouse wheel down and expect the selected element to be PM
        expect(getAMPMColumn.nativeElement.children[3].innerText).toBe("PM");
        getAMPMColumn.triggerEventHandler("wheel", {deltaX: 0, deltaY: -100});
        fixture.detectChanges();
        // move the mouse wheel up and expect the selected element to be AM again
        expect(getAMPMColumn.nativeElement.children[3].innerText).toBe("AM");
    }));

    it("Timepicker Pan Move", fakeAsync(() => {
        const fixture = TestBed.createComponent(IgxTimePickerWithPassedTimeComponent);
        fixture.detectChanges();

        openInput(fixture);
        fixture.detectChanges();

        // const timePicker = fixture.componentInstance.timePicker;
        const dom = fixture.debugElement;
        const getHourColumn: any = dom.query(By.css(".igx-time-picker__hourList"));
        const getMinuteColumn: any = dom.query(By.css(".igx-time-picker__minuteList"));
        const getAMPMColumn: any = dom.query(By.css(".igx-time-picker__ampmList"));

        // panmove is in reverse direction of mouse wheel
        // focus hours
        getHourColumn.nativeElement.focus();
        tick();
        getHourColumn.triggerEventHandler("panmove", {deltaX: 0, deltaY: 0});
        getHourColumn.triggerEventHandler("panmove", {deltaX: 0, deltaY: -100});
        fixture.detectChanges();
        // swipe up and expect the selected element to be 4
        expect(getHourColumn.nativeElement.children[3].innerText).toBe("4");
        getHourColumn.triggerEventHandler("panmove", {deltaX: 0, deltaY: 100});
        fixture.detectChanges();
        // swipe down and expect the selected element to be 3 again
        expect(getHourColumn.nativeElement.children[3].innerText).toBe("3");

        // focus minutes
        getMinuteColumn.nativeElement.focus();
        tick();
        getMinuteColumn.triggerEventHandler("panmove", {deltaX: 0, deltaY: -100});
        fixture.detectChanges();
        // swipe up and expect the selected element to be 25
        expect(getMinuteColumn.nativeElement.children[3].innerText).toBe("25");
        getMinuteColumn.triggerEventHandler("panmove", {deltaX: 0, deltaY: 100});
        fixture.detectChanges();
        // swipe down and expect the selected element to be 24 again
        expect(getMinuteColumn.nativeElement.children[3].innerText).toBe("24");

        // focus ampm
        getAMPMColumn.nativeElement.focus();
        tick();
        getAMPMColumn.triggerEventHandler("panmove", {deltaX: 0, deltaY: -100});
        fixture.detectChanges();
        // swipe up and expect the selected element to be PM
        expect(getAMPMColumn.nativeElement.children[3].innerText).toBe("PM");
        getAMPMColumn.triggerEventHandler("panmove", {deltaX: 0, deltaY: 100});
        fixture.detectChanges();
        // move the swipe up and expect the selected element to be AM again
        expect(getAMPMColumn.nativeElement.children[3].innerText).toBe("AM");
    }));

    it("TimePicker 24 hour format", () => {
        const fixture = TestBed.createComponent(IgxTimePickerWith24HTimeComponent);
        fixture.detectChanges();
        const dom = fixture.debugElement;

        openInput(fixture);
        const getAMPMColumn: any = dom.query(By.css(".igx-time-picker__ampmList"));
        expect(getAMPMColumn.children.length).toBe(0);

        const getHourColumn = dom.query(By.css(".igx-time-picker__hourList"));
        const selectHour = getHourColumn.children[3];
        expect(selectHour.nativeElement.innerText).toBe("00");

    });

    it("TimePicker Items in view", () => {
        const fixture = TestBed.createComponent(IgxTimePickerWithAMPMLeadingZerosTimeComponent);
        fixture.detectChanges();
        const dom = fixture.debugElement;
        const timePicker = fixture.componentInstance.timePicker;

        openInput(fixture);

        const getHoursInview = timePicker.hoursInView();
        const getMinutessInview = timePicker.minutesInView();
        const getAMPMInview = timePicker.ampmInView();

        expect(getHoursInview).toEqual(["08", "09", "10", "11", "12", "01", "02"]);
        expect(getMinutessInview).toEqual([ "24", "25", "26", "27", "28", "29", "30" ]);
        expect(getAMPMInview).toEqual([ "AM", "PM" ]);

    });

    it("TimePicker scroll to end", () => {
        const fixture = TestBed.createComponent(IgxTimePickerWithSpinLoopFalseValueComponent);
        fixture.detectChanges();
        const dom = fixture.debugElement;
        const timePicker = fixture.componentInstance.timePicker;
        const initialTime = fixture.componentInstance.dateValue;

        openInput(fixture);

        const getHourColumn: any = dom.query(By.css(".igx-time-picker__hourList"));
        const getMinuteColumn: any = dom.query(By.css(".igx-time-picker__minuteList"));
        const getAMPMColumn: any = dom.query(By.css(".igx-time-picker__ampmList"));

        getHourColumn.nativeElement.focus();
        spyOn(console, "error");
        getHourColumn.triggerEventHandler("wheel", {deltaX: 0, deltaY: -100});
        fixture.detectChanges();
        getMinuteColumn.nativeElement.focus();
        getMinuteColumn.triggerEventHandler("wheel", {deltaX: 0, deltaY: -100});
        fixture.detectChanges();
        getAMPMColumn.nativeElement.focus();
        getAMPMColumn.triggerEventHandler("wheel", {deltaX: 0, deltaY: -100});
        fixture.detectChanges();

        // check console for error
        expect(console.error).not.toHaveBeenCalled();

        const formatedHours = initialTime.getHours() < 10 ? "0" + initialTime.getHours() : initialTime.getHours();
        const formatedMinutes = initialTime.getMinutes() < 10 ? "0" + initialTime.getMinutes() : initialTime.getMinutes();

        const formatedTestElementTime =
           `${formatedHours}:${formatedMinutes} ${initialTime.getHours() >= 12 ? "PM" : "AM"}`;

        // get time from dialog header
        const getTimeFromPopupHeader: any = fixture.debugElement.query(By.css(".igx-time-picker__header")).nativeElement.children;
        const formatedTimeFromPopupHeader =
        `${getTimeFromPopupHeader[1].innerText.replace(/\n/g, "")} ${getTimeFromPopupHeader[0].innerText}`;

        expect(formatedTestElementTime).toBe(formatedTimeFromPopupHeader);
    });

    it("TimePicker check isSpinLoop with Items Delta", () => {
        const fixture = TestBed.createComponent(IgxTimePickerWithItemsDeltaValueComponent);
        fixture.detectChanges();
        const dom = fixture.debugElement;
        const timePicker = fixture.componentInstance.timePicker;

        openInput(fixture);

        const getHourColumn: any = dom.query(By.css(".igx-time-picker__hourList"));
        const getMinuteColumn: any = dom.query(By.css(".igx-time-picker__minuteList"));
        const getAMPMColumn: any = dom.query(By.css(".igx-time-picker__ampmList"));

        // check scrolling each element
        getHourColumn.nativeElement.focus();
        getHourColumn.triggerEventHandler("wheel", {deltaX: 0, deltaY: 100});
        fixture.detectChanges();
        getMinuteColumn.nativeElement.focus();
        getMinuteColumn.triggerEventHandler("wheel", {deltaX: 0, deltaY: 100});
        fixture.detectChanges();
        getAMPMColumn.nativeElement.focus();
        getAMPMColumn.triggerEventHandler("wheel", {deltaX: 0, deltaY: 100});
        fixture.detectChanges();

        const getTimeFromPopupHeader: any = fixture.debugElement.query(By.css(".igx-time-picker__header")).nativeElement.children;
        const formatedTimeFromPopupHeader =
        `${getTimeFromPopupHeader[1].innerText.replace(/\n/g, "")} ${getTimeFromPopupHeader[0].innerText}`;
        expect(formatedTimeFromPopupHeader).toBe("12:58 PM");

        // check scrolling again up not to throw error
        spyOn(console, "error");
        getHourColumn.triggerEventHandler("wheel", {deltaX: 0, deltaY: 100});
        fixture.detectChanges();
        getMinuteColumn.nativeElement.focus();
        getMinuteColumn.triggerEventHandler("wheel", {deltaX: 0, deltaY: 100});
        fixture.detectChanges();
        getAMPMColumn.nativeElement.focus();
        getAMPMColumn.triggerEventHandler("wheel", {deltaX: 0, deltaY: 100});
        fixture.detectChanges();
        expect(console.error).not.toHaveBeenCalled();
    });

    it("Timepicker with not valid element arrow up", () => {
        const fixture = TestBed.createComponent(IgxTimePickerTestComponent);
        fixture.detectChanges();

        const timePicker = fixture.componentInstance.timePicker;
        const dom = fixture.debugElement;

        const notValidHour = "700";
        timePicker.selectedHour = notValidHour;

        openInput(fixture);

        const getHourColumn: any = dom.query(By.css(".igx-time-picker__hourList"));

        const args = { key: "ArrowUp", bubbles: true };
        getHourColumn.nativeElement.dispatchEvent(new KeyboardEvent("keydown", args));
        fixture.detectChanges();

        expect(getHourColumn.nativeElement.children[3].innerText).not.toBe(notValidHour);
    });

    it("Timepicker with not valid element arrow down", () => {
        const fixture = TestBed.createComponent(IgxTimePickerTestComponent);
        fixture.detectChanges();

        const timePicker = fixture.componentInstance.timePicker;
        const dom = fixture.debugElement;

        const notValidValue = "700";
        timePicker.selectedMinute = notValidValue;

        openInput(fixture);

        const getMinuteColumn: any = dom.query(By.css(".igx-time-picker__minuteList"));
        const getAMPMColumn: any = dom.query(By.css(".igx-time-picker__ampmList"));
        const args = { key: "ArrowDown", bubbles: true };
        getMinuteColumn.nativeElement.dispatchEvent(new KeyboardEvent("keydown", args));
        getAMPMColumn.nativeElement.dispatchEvent(new KeyboardEvent("keydown", args));
        fixture.detectChanges();

        expect(getMinuteColumn.nativeElement.children[3].innerText).not.toBe(notValidValue);
    });

    it("Timepicker vertical", () => {
        const fixture = TestBed.createComponent(IgxTimePickerTestComponent);
        fixture.detectChanges();
        const dom = fixture.debugElement;

        const timePicker = fixture.componentInstance.timePicker;
        timePicker.vertical = true;

        openInput(fixture);

        expect(dom.query(By.css(".igx-time-picker--vertical"))).not.toBeNull();

        const dialog = dom.query(By.css(".igx-dialog__window")).nativeElement;

        expect(dialog.offsetWidth).toBeGreaterThan(dialog.offsetHeight);
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

@Component({
    template: `
        <igx-time-picker [value]="dateValue" [format]="customFormat"></igx-time-picker>
    `
})
export class IgxTimePickerWithPassedTimeComponent {
    public dateValue: Date = new Date(2017, 7, 7, 3, 24);
    public customFormat = "h:mm tt";
    @ViewChild(IgxTimePickerComponent) public timePicker: IgxTimePickerComponent;
}

@Component({
    template: `
        <igx-time-picker [value]="dateValue" [format]="customFormat"></igx-time-picker>
    `
})
export class IgxTimePickerWithPmTimeComponent {
    public dateValue: Date = new Date(2017, 7, 7, 12, 27);
    public customFormat = "h:mm tt";
    @ViewChild(IgxTimePickerComponent) public timePicker: IgxTimePickerComponent;
}

@Component({
    template: `
        <igx-time-picker [value]="dateValue" [format]="customFormat"></igx-time-picker>
    `
})
export class IgxTimePickerWithAMPMLeadingZerosTimeComponent {
    public dateValue: Date = new Date(2017, 7, 7, 23, 27);
    public customFormat = "hh:mm tt";
    @ViewChild(IgxTimePickerComponent) public timePicker: IgxTimePickerComponent;
}

@Component({
    template: `
        <igx-time-picker [value]="dateValue" [format]="customFormat"></igx-time-picker>
    `
})
export class IgxTimePickerWith24HTimeComponent {
    public dateValue: Date = new Date(2017, 7, 7, 24, 27);
    public customFormat = "HH:mm";
    @ViewChild(IgxTimePickerComponent) public timePicker: IgxTimePickerComponent;
}

@Component({
    template: `
        <igx-time-picker [minValue]="myMinValue" [maxValue]="myMaxValue"
         [value]="dateValue" [format]="'h:mm tt'"></igx-time-picker>
    `
})
export class IgxTimePickerWithMInMaxTimeValueComponent {
    public dateValue: Date = new Date(2017, 7, 7, 4, 27);
    public myMinValue = "3:24 AM";
    public myMaxValue = "5:24 AM";
    @ViewChild(IgxTimePickerComponent) public timePicker: IgxTimePickerComponent;
}

@Component({
    template: `
        <igx-time-picker [isSpinLoop]=false
         [value]="dateValue" [format]="customFormat"></igx-time-picker>
    `
})
export class IgxTimePickerWithSpinLoopFalseValueComponent {
    public dateValue: Date = new Date(2017, 7, 7, 1, 0);
    public customFormat = "hh:mm tt";
    @ViewChild(IgxTimePickerComponent) public timePicker: IgxTimePickerComponent;
}

@Component({
    template: `
        <igx-time-picker [isSpinLoop]=false
         [value]="dateValue" [format]="customFormat" [itemsDelta]="customitemsDelta"></igx-time-picker>
    `
})
export class IgxTimePickerWithItemsDeltaValueComponent {
    public dateValue: Date = new Date(2017, 7, 7, 10, 56);
    public customFormat = "hh:mm tt";
    public customitemsDelta: any = {hours: 2, minutes: 2};
    @ViewChild(IgxTimePickerComponent) public timePicker: IgxTimePickerComponent;
}

// helper functions
function openInput(fixture) {
    const dom = fixture.debugElement;
    const timePickerTarget = dom.query(By.css(".igx-form-group__input"));

    timePickerTarget.triggerEventHandler("click", { target: dom.nativeElement.children[0] });
    fixture.detectChanges();
}

// the time difference should be plus or minus 3 hours or minutes
function selectTimeDifference(fixture, hour, minute, aMPM = null) {
        const dom = fixture.debugElement;
        const middlePos = 3;

        const getHourColumn = dom.query(By.css(".igx-time-picker__hourList"));
        const selectHour = getHourColumn.children[middlePos + hour];

        const getMinutesColumn = dom.query(By.css(".igx-time-picker__minuteList"));
        const selectMinutes = getMinutesColumn.children[middlePos + minute];

        selectHour.triggerEventHandler("click", {});
        selectMinutes.triggerEventHandler("click", {});
        fixture.detectChanges();

        if (aMPM && (aMPM.toUpperCase() === "AM" || aMPM.toUpperCase() === "PM")) {
            const getAMPMColumn = dom.query(By.css(".igx-time-picker__ampmList"));
            const selectAMPM = findByInnerText(getAMPMColumn.children, aMPM.toUpperCase());

            selectAMPM.triggerEventHandler("click", {});
            fixture.detectChanges();
        }

}

function findByInnerText(collection, searchText) {
    for (const element of collection) {
        if (element.nativeElement.innerText === searchText) {
            return element;
        }
    }
}
function clickOkButton(fixture) {
    const dom = fixture.debugElement;
    const getOkButton = dom.queryAll(By.css(".igx-button--flat"))[1];
    getOkButton.triggerEventHandler("click", {});
    fixture.detectChanges();
}
