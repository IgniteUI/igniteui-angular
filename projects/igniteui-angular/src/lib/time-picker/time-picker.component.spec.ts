import { Component, ViewChild } from '@angular/core';
import { async, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { IgxInputDirective } from '../directives/input/input.directive';
import { IgxTimePickerComponent, IgxTimePickerModule } from './time-picker.component';
import { UIInteractions } from '../test-utils/ui-interactions.spec';
import { IgxInputGroupModule } from '../input-group';
import { configureTestSuite } from '../test-utils/configure-suite';
import { TimePickerInteractionMode } from './time-picker.common';

describe('IgxTimePicker', () => {
    configureTestSuite();
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
                IgxTimePickerWithItemsDeltaValueComponent,
                IgxTimePickerRetemplatedComponent,
                IgxTimePickerDropDownComponent,
                IgxTimePickerDropDownSingleHourComponent,
                IgxTimePickerDropDownNoValueComponent
            ],
            imports: [
                IgxTimePickerModule,
                FormsModule,
                NoopAnimationsModule,
                IgxInputGroupModule
            ]
        }).compileComponents();
    }));

    afterEach(async(() => {
        UIInteractions.clearOverlay();
    }));

    it('Initialize a TimePicker component', (() => {
        const fixture = TestBed.createComponent(IgxTimePickerTestComponent);
        fixture.detectChanges();

        const timePicker = fixture.componentInstance.timePicker;
        const domTimePicker = fixture.debugElement.query(By.css('igx-time-picker')).nativeElement;
        const result = '';

        expect(fixture.componentInstance).toBeDefined();
        expect(timePicker.displayTime).toEqual(result);
        expect(timePicker.id).toContain('igx-time-picker-');
        expect(domTimePicker.id).toContain('igx-time-picker-');

        timePicker.id = 'customTimePicker';
        fixture.detectChanges();

        expect(timePicker.id).toBe('customTimePicker');
        expect(domTimePicker.id).toBe('customTimePicker');
    }));

    it('@Input properties', (() => {
        const fixture = TestBed.createComponent(IgxTimePickerWithPassedTimeComponent);
        fixture.detectChanges();

        const timePicker = fixture.componentInstance.timePicker;
        expect(timePicker.value).toEqual(new Date(2017, 7, 7, 3, 24));
    }));

    it('TimePicker DOM input value', (() => {
        const fixture = TestBed.createComponent(IgxTimePickerWithPassedTimeComponent);
        fixture.detectChanges();

        const currentTime = new Date(2017, 7, 7, 3, 24);
        const formattedTime = `${currentTime.getHours()}:${currentTime.getMinutes()} ${currentTime.getHours() > 12 ? 'PM' : 'AM'}`;

        const dom = fixture.debugElement;

        const valueFromInput = dom.query(By.directive(IgxInputDirective)).nativeElement.value;
        expect(valueFromInput).toEqual(formattedTime);
    }));

    it('Dialog header value', fakeAsync(() => {
        const fixture = TestBed.createComponent(IgxTimePickerWithPmTimeComponent);
        fixture.detectChanges();

        const dom = fixture.debugElement;

        // get time-picker value
        const testElementTIme = fixture.componentInstance.dateValue;
        const formatedTestElementTime =
            `${testElementTIme.getHours()}:${testElementTIme.getMinutes()} ${testElementTIme.getHours() >= 12 ? 'PM' : 'AM'}`;

        const timePickerTarget = dom.query(By.directive(IgxInputDirective));
        UIInteractions.clickElement(timePickerTarget);
        tick();
        fixture.detectChanges();

        // get time from dialog header
        const timeFromPopupHeader: any = fixture.debugElement.query(By.css('.igx-time-picker__header')).nativeElement.children;
        const formatedTimeFromPopupHeader =
            `${timeFromPopupHeader[1].innerText.replace(/\n/g, '')} ${timeFromPopupHeader[0].innerText}`;

        expect(formatedTimeFromPopupHeader).toBe(formatedTestElementTime);
    }));

    it('Dialog selected element position', fakeAsync(() => {
        const fixture = TestBed.createComponent(IgxTimePickerWithPmTimeComponent);
        fixture.detectChanges();

        const dom = fixture.debugElement;
        const timePickerTarget = dom.query(By.directive(IgxInputDirective));
        UIInteractions.clickElement(timePickerTarget);
        tick();
        fixture.detectChanges();

        const expectedColumnElements = 7;
        const hourColumn: any = dom.query(By.css('.igx-time-picker__hourList')).nativeElement.children;
        const minuteColumn: any = dom.query(By.css('.igx-time-picker__minuteList')).nativeElement.children;
        const AMPMColumn: any = dom.query(By.css('.igx-time-picker__ampmList')).nativeElement.children;

        // check element count
        expect(hourColumn.length).toBe(expectedColumnElements);
        expect(minuteColumn.length).toBe(expectedColumnElements);
        expect(AMPMColumn.length).toBe(expectedColumnElements);

        // verify selected's position to be in the middle
        expect(hourColumn[3].classList).toContain('igx-time-picker__item--selected');
        expect(minuteColumn[3].classList).toContain('igx-time-picker__item--selected');
        expect(AMPMColumn[3].classList).toContain('igx-time-picker__item--selected');

    }));

    it('TimePicker open event', fakeAsync(() => {
        const fixture = TestBed.createComponent(IgxTimePickerTestComponent);
        fixture.detectChanges();

        const timePicker = fixture.componentInstance.timePicker;
        const dom = fixture.debugElement;

        const target = dom.query(By.directive(IgxInputDirective));

        spyOn(timePicker.onOpen, 'emit');

        target.nativeElement.dispatchEvent(new Event('click', { bubbles: true }));
        tick();

        expect(timePicker.onOpen.emit).toHaveBeenCalled();
    }));

    it('TimePicker Validation Failed event', fakeAsync(() => {
        const fixture = TestBed.createComponent(IgxTimePickerWithMInMaxTimeValueComponent);
        fixture.detectChanges();

        const timePicker = fixture.componentInstance.timePicker;
        const dom = fixture.debugElement;
        const timePickerTarget = dom.query(By.directive(IgxInputDirective));

        UIInteractions.clickElement(timePickerTarget);
        tick();
        fixture.detectChanges();

        // select time difference (-3, -3, 'AM')
        const middlePos = 3;
        const hourColumn = dom.query(By.css('.igx-time-picker__hourList'));
        const selectHour = hourColumn.children[middlePos - 3];
        const minutesColumn = dom.query(By.css('.igx-time-picker__minuteList'));
        const selectMinutes = minutesColumn.children[middlePos - 3];

        UIInteractions.clickElement(selectHour);
        fixture.detectChanges();

        UIInteractions.clickElement(selectMinutes);
        fixture.detectChanges();

        const AMPMColumn = dom.query(By.css('.igx-time-picker__ampmList'));
        const selectAMPM = findByInnerText(AMPMColumn.children, 'AM');

        UIInteractions.clickElement(selectAMPM);
        fixture.detectChanges();

        const OkButton = dom.queryAll(By.css('.igx-button--flat'))[1];
        spyOn(timePicker.onValidationFailed, 'emit');

        OkButton.triggerEventHandler('click', {});
        tick();
        fixture.detectChanges();

        expect(timePicker.onValidationFailed.emit).toHaveBeenCalled();
    }));

    it('TimePicker cancel button', fakeAsync(() => {
        const fixture = TestBed.createComponent(IgxTimePickerWithPmTimeComponent);
        fixture.detectChanges();

        const timePicker = fixture.componentInstance.timePicker;
        const dom = fixture.debugElement;
        const initialTime = dom.query(By.directive(IgxInputDirective)).nativeElement.value;
        const timePickerTarget = dom.query(By.directive(IgxInputDirective));

        UIInteractions.clickElement(timePickerTarget);
        tick();
        fixture.detectChanges();

        // select time difference (2, -3, 'AM')
        const middlePos = 3;
        const hourColumn = dom.query(By.css('.igx-time-picker__hourList'));
        const selectHour = hourColumn.children[middlePos + 2];
        const minutesColumn = dom.query(By.css('.igx-time-picker__minuteList'));
        const selectMinutes = minutesColumn.children[middlePos - 3];

        UIInteractions.clickElement(selectHour);
        fixture.detectChanges();

        UIInteractions.clickElement(selectMinutes);
        fixture.detectChanges();

        const AMPMColumn = dom.query(By.css('.igx-time-picker__ampmList'));
        const selectAMPM = findByInnerText(AMPMColumn.children, 'AM');

        UIInteractions.clickElement(selectAMPM);
        fixture.detectChanges();

        const cancelButton = dom.queryAll(By.css('.igx-button--flat'))[0];

        spyOn(timePicker.onValueChanged, 'emit');

        UIInteractions.clickElement(cancelButton);
        tick();
        fixture.detectChanges();

        const selectedTime = dom.query(By.directive(IgxInputDirective)).nativeElement.value;
        expect(initialTime).toEqual(selectedTime);

        expect(timePicker.onValueChanged.emit).not.toHaveBeenCalled();
    }));

    it('TimePicker ValueChanged event', fakeAsync(() => {
        const fixture = TestBed.createComponent(IgxTimePickerTestComponent);
        fixture.detectChanges();

        const timePicker = fixture.componentInstance.timePicker;
        const dom = fixture.debugElement;
        const timePickerTarget = dom.query(By.directive(IgxInputDirective));

        UIInteractions.clickElement(timePickerTarget);
        tick();
        fixture.detectChanges();

        const hourColumn = dom.query(By.css('.igx-time-picker__hourList'));
        const selectHour = hourColumn.children[5];
        const hourValue = selectHour.nativeElement.innerText;

        const minutesColumn = dom.query(By.css('.igx-time-picker__minuteList'));
        const selectMinutes = minutesColumn.children[2];
        const minuteValue = selectMinutes.nativeElement.innerText;

        const AMPMColumn = dom.query(By.css('.igx-time-picker__ampmList'));
        const selectAMPM = AMPMColumn.children[4];
        const aMPMValue = selectAMPM.nativeElement.innerText;

        UIInteractions.clickElement(selectHour);
        fixture.detectChanges();

        UIInteractions.clickElement(selectMinutes);
        fixture.detectChanges();

        UIInteractions.clickElement(selectAMPM);
        fixture.detectChanges();

        const OkButton = dom.queryAll(By.css('.igx-button--flat'))[1];

        spyOn(timePicker.onValueChanged, 'emit');

        UIInteractions.clickElement(OkButton);
        tick();
        fixture.detectChanges();

        expect(timePicker.onValueChanged.emit).toHaveBeenCalled();

        const valueFromInput = dom.query(By.directive(IgxInputDirective)).nativeElement.value;
        const selectedTime = `${hourValue}:${minuteValue} ${aMPMValue}`;

        expect(valueFromInput).toEqual(selectedTime);
    }));

    it('TimePicker UP Down Keyboard navigation', fakeAsync(() => {
        const fixture = TestBed.createComponent(IgxTimePickerWithPassedTimeComponent);
        fixture.detectChanges();

        const dom = fixture.debugElement;
        const timePickerTarget = dom.query(By.directive(IgxInputDirective));

        UIInteractions.clickElement(timePickerTarget);
        tick();
        fixture.detectChanges();

        const hourColumn: any = dom.query(By.css('.igx-time-picker__hourList'));
        const minuteColumn: any = dom.query(By.css('.igx-time-picker__minuteList'));
        const AMPMColumn: any = dom.query(By.css('.igx-time-picker__ampmList'));

        hourColumn.nativeElement.focus();
        // move arrows several times with hour column
        let args = { key: 'ArrowUp', bubbles: true };
        hourColumn.nativeElement.dispatchEvent(new KeyboardEvent('keydown', args));
        fixture.detectChanges();

        args = { key: 'ArrowDown', bubbles: true };
        hourColumn.nativeElement.dispatchEvent(new KeyboardEvent('keydown', args));
        fixture.detectChanges();

        args = { key: 'ArrowUp', bubbles: true };
        hourColumn.nativeElement.dispatchEvent(new KeyboardEvent('keydown', args));
        fixture.detectChanges();

        minuteColumn.nativeElement.focus();
        fixture.detectChanges();

        // move arrows several times with minute column
        args = { key: 'ArrowDown', bubbles: true };
        minuteColumn.nativeElement.dispatchEvent(new KeyboardEvent('keydown', args));
        fixture.detectChanges();

        args = { key: 'ArrowUp', bubbles: true };
        minuteColumn.nativeElement.dispatchEvent(new KeyboardEvent('keydown', args));
        fixture.detectChanges();

        args = { key: 'ArrowDown', bubbles: true };
        minuteColumn.nativeElement.dispatchEvent(new KeyboardEvent('keydown', args));
        fixture.detectChanges();

        AMPMColumn.nativeElement.focus();

        // move arrows several times with ampm column
        args = { key: 'ArrowUp', bubbles: true };
        AMPMColumn.nativeElement.dispatchEvent(new KeyboardEvent('keydown', args));
        fixture.detectChanges();

        args = { key: 'ArrowDown', bubbles: true };
        AMPMColumn.nativeElement.dispatchEvent(new KeyboardEvent('keydown', args));
        fixture.detectChanges();

        // get time from dialog header
        const timeFromPopupHeader: any = dom.query(By.css('.igx-time-picker__header')).nativeElement.children;
        const formatedTimeFromPopupHeader =
            `${timeFromPopupHeader[1].innerText.replace(/\n/g, '')} ${timeFromPopupHeader[0].innerText}`;

        args = { key: 'Enter', bubbles: true };
        hourColumn.nativeElement.dispatchEvent(new KeyboardEvent('keydown', args));
        fixture.detectChanges();

        const valueFromInput = dom.query(By.directive(IgxInputDirective)).nativeElement.value;

        expect(formatedTimeFromPopupHeader).toBe(valueFromInput);
    }));

    it('TimePicker Left Right Keyboard navigation', fakeAsync(() => {
        const fixture = TestBed.createComponent(IgxTimePickerWithPassedTimeComponent);
        fixture.detectChanges();

        const dom = fixture.debugElement;
        const initialTime = dom.query(By.directive(IgxInputDirective)).nativeElement.value;

        let args = { key: 'ArrowRight', bubbles: true };
        const timePickerTarget = dom.query(By.directive(IgxInputDirective));
        UIInteractions.clickElement(timePickerTarget);
        fixture.detectChanges();

        const hourColumn: any = dom.query(By.css('.igx-time-picker__hourList'));
        hourColumn.nativeElement.focus();
        fixture.detectChanges();
        expect(document.activeElement.classList).toContain('igx-time-picker__hourList');

        document.activeElement.dispatchEvent(new KeyboardEvent('keydown', args));
        fixture.detectChanges();
        expect(document.activeElement.classList).toContain('igx-time-picker__minuteList');

        args = { key: 'ArrowLeft', bubbles: true };
        document.activeElement.dispatchEvent(new KeyboardEvent('keydown', args));
        fixture.detectChanges();

        args = { key: 'ArrowRight', bubbles: true };
        document.activeElement.dispatchEvent(new KeyboardEvent('keydown', args));
        fixture.detectChanges();

        args = { key: 'ArrowUp', bubbles: true };
        document.activeElement.dispatchEvent(new KeyboardEvent('keydown', args));
        fixture.detectChanges();
        expect(document.activeElement.children[3].innerHTML.trim()).toBe('23');

        args = { key: 'ArrowRight', bubbles: true };
        document.activeElement.dispatchEvent(new KeyboardEvent('keydown', args));
        fixture.detectChanges();

        args = { key: 'ArrowDown', bubbles: true };
        document.activeElement.dispatchEvent(new KeyboardEvent('keydown', args));
        fixture.detectChanges();
        expect(document.activeElement.children[3].innerHTML.trim()).toBe('PM');

        args = { key: 'ArrowLeft', bubbles: true };
        document.activeElement.dispatchEvent(new KeyboardEvent('keydown', args));
        fixture.detectChanges();
        expect(document.activeElement.classList).toContain('igx-time-picker__minuteList');

        // get time from dialog header
        const timeFromPopupHeader: any = dom.query(By.css('.igx-time-picker__header')).nativeElement.children;
        const formatedTimeFromPopupHeader =
            `${timeFromPopupHeader[1].innerText.replace(/\n/g, '')} ${timeFromPopupHeader[0].innerText}`;
        expect(formatedTimeFromPopupHeader).toBe('3:23 PM');

        args = { key: 'Escape', bubbles: true };
        document.activeElement.dispatchEvent(new KeyboardEvent('keydown', args));
        fixture.detectChanges();

        const selectedTime = dom.query(By.directive(IgxInputDirective)).nativeElement.value;
        expect(initialTime).toEqual(selectedTime);
    }));

    it('TimePicker Mouse Over', fakeAsync(() => {
        const fixture = TestBed.createComponent(IgxTimePickerWithPassedTimeComponent);
        fixture.detectChanges();

        const dom = fixture.debugElement;
        const timePickerTarget = dom.query(By.directive(IgxInputDirective));

        UIInteractions.clickElement(timePickerTarget);
        tick(100);
        fixture.detectChanges();

        // const timePicker = fixture.componentInstance.timePicker;
        const hourColumn: any = dom.query(By.css('.igx-time-picker__hourList'));
        const minuteColumn: any = dom.query(By.css('.igx-time-picker__minuteList'));
        const AMPMColumn: any = dom.query(By.css('.igx-time-picker__ampmList'));

        hourColumn.triggerEventHandler('focus', {});
        fixture.detectChanges();

        hourColumn.triggerEventHandler('mouseover', {});
        fixture.detectChanges();
        expect(document.activeElement.classList).toContain('igx-time-picker__hourList');

        minuteColumn.triggerEventHandler('mouseover', {});
        fixture.detectChanges();
        expect(document.activeElement.classList).toContain('igx-time-picker__minuteList');

        AMPMColumn.triggerEventHandler('mouseover', {});
        fixture.detectChanges();
        expect(document.activeElement.classList).toContain('igx-time-picker__ampmList');
    }));

    it('TimePicker Mouse Wheel', fakeAsync(() => {
        const fixture = TestBed.createComponent(IgxTimePickerWithPassedTimeComponent);
        fixture.detectChanges();

        const dom = fixture.debugElement;
        const timePickerTarget = dom.query(By.directive(IgxInputDirective));

        UIInteractions.clickElement(timePickerTarget);
        tick();
        fixture.detectChanges();

        // const timePicker = fixture.componentInstance.timePicker;
        const hourColumn: any = dom.query(By.css('.igx-time-picker__hourList'));
        const minuteColumn: any = dom.query(By.css('.igx-time-picker__minuteList'));
        const AMPMColumn: any = dom.query(By.css('.igx-time-picker__ampmList'));

        let event = new WheelEvent('wheel', { deltaX: 0, deltaY: 0 });

        // focus hours
        hourColumn.nativeElement.focus();
        fixture.detectChanges();

        hourColumn.triggerEventHandler('wheel', event);
        fixture.detectChanges();

        event = new WheelEvent('wheel', { deltaX: 0, deltaY: -100 });
        hourColumn.triggerEventHandler('wheel', event);
        fixture.detectChanges();

        // move the mouse wheel up and expect the selected element to be 2
        expect(hourColumn.nativeElement.children[3].innerText).toBe('2');

        event = new WheelEvent('wheel', { deltaX: 0, deltaY: 100 });
        hourColumn.triggerEventHandler('wheel', event);
        fixture.detectChanges();

        // move the mouse wheel down and expect the selected element to be 3 again
        expect(hourColumn.nativeElement.children[3].innerText).toBe('3');

        // focus minutes
        minuteColumn.nativeElement.focus();
        fixture.detectChanges();

        event = new WheelEvent('wheel', { deltaX: 0, deltaY: -100 });
        minuteColumn.triggerEventHandler('wheel', event);
        fixture.detectChanges();

        // move the mouse wheel up and expect the selected element to be 23
        expect(minuteColumn.nativeElement.children[3].innerText).toBe('23');

        event = new WheelEvent('wheel', { deltaX: 0, deltaY: 100 });
        minuteColumn.triggerEventHandler('wheel', event);
        fixture.detectChanges();

        // move the mouse wheel down and expect the selected element to be 24 again
        expect(minuteColumn.nativeElement.children[3].innerText).toBe('24');

        // focus ampm
        AMPMColumn.nativeElement.focus();
        fixture.detectChanges();

        event = new WheelEvent('wheel', { deltaX: 0, deltaY: 100 });
        AMPMColumn.triggerEventHandler('wheel', event);
        fixture.detectChanges();

        // move the mouse wheel down and expect the selected element to be PM
        expect(AMPMColumn.nativeElement.children[3].innerText).toBe('PM');

        event = new WheelEvent('wheel', { deltaX: 0, deltaY: -100 });
        AMPMColumn.triggerEventHandler('wheel', event);
        fixture.detectChanges();

        // move the mouse wheel up and expect the selected element to be AM again
        expect(AMPMColumn.nativeElement.children[3].innerText).toBe('AM');
    }));

    it('TimePicker Pan Move', fakeAsync(() => {
        const fixture = TestBed.createComponent(IgxTimePickerWithPassedTimeComponent);
        fixture.detectChanges();

        const dom = fixture.debugElement;
        const timePickerTarget = dom.query(By.directive(IgxInputDirective));

        UIInteractions.clickElement(timePickerTarget);
        tick();
        fixture.detectChanges();

        // const timePicker = fixture.componentInstance.timePicker;
        const hourColumn: any = dom.query(By.css('.igx-time-picker__hourList'));
        const minuteColumn: any = dom.query(By.css('.igx-time-picker__minuteList'));
        const AMPMColumn: any = dom.query(By.css('.igx-time-picker__ampmList'));

        // panmove is in reverse direction of mouse wheel
        const event = new WheelEvent('wheel', { deltaX: 0, deltaY: 0 });
        const eventUp = new WheelEvent('wheel', { deltaX: 0, deltaY: 100 });
        const eventDown = new WheelEvent('wheel', { deltaX: 0, deltaY: -100 });

        // focus hours
        hourColumn.nativeElement.focus();
        fixture.detectChanges();

        hourColumn.triggerEventHandler('panmove', event);
        fixture.detectChanges();

        hourColumn.triggerEventHandler('panmove', eventDown);
        fixture.detectChanges();

        // swipe up and expect the selected element to be 4
        expect(hourColumn.nativeElement.children[3].innerText).toBe('4');

        hourColumn.triggerEventHandler('panmove', eventUp);
        fixture.detectChanges();

        // swipe down and expect the selected element to be 3 again
        expect(hourColumn.nativeElement.children[3].innerText).toBe('3');

        // focus minutes
        minuteColumn.nativeElement.focus();
        fixture.detectChanges();

        minuteColumn.triggerEventHandler('panmove', eventDown);
        fixture.detectChanges();

        // swipe up and expect the selected element to be 25
        expect(minuteColumn.nativeElement.children[3].innerText).toBe('25');

        minuteColumn.triggerEventHandler('panmove', eventUp);
        fixture.detectChanges();

        // swipe down and expect the selected element to be 24 again
        expect(minuteColumn.nativeElement.children[3].innerText).toBe('24');

        // focus ampm
        AMPMColumn.nativeElement.focus();
        fixture.detectChanges();

        AMPMColumn.triggerEventHandler('panmove', eventDown);
        fixture.detectChanges();

        // swipe up and expect the selected element to be PM
        expect(AMPMColumn.nativeElement.children[3].innerText).toBe('PM');

        AMPMColumn.triggerEventHandler('panmove', eventUp);
        fixture.detectChanges();

        // move the swipe up and expect the selected element to be AM again
        expect(AMPMColumn.nativeElement.children[3].innerText).toBe('AM');
    }));

    it('TimePicker 24 hour format', fakeAsync(() => {
        const fixture = TestBed.createComponent(IgxTimePickerWith24HTimeComponent);
        fixture.detectChanges();

        const dom = fixture.debugElement;
        const timePickerTarget = dom.query(By.directive(IgxInputDirective));

        UIInteractions.clickElement(timePickerTarget);
        tick();
        fixture.detectChanges();

        const hourColumn = dom.query(By.css('.igx-time-picker__hourList'));
        const selectHour = hourColumn.children[3];
        const AMPMColumn: any = dom.query(By.css('.igx-time-picker__ampmList'));

        expect(AMPMColumn.children.length).toBe(0);
        expect(selectHour.nativeElement.innerText).toBe('00');
    }));

    it('TimePicker Items in view', fakeAsync(() => {
        const fixture = TestBed.createComponent(IgxTimePickerWithAMPMLeadingZerosTimeComponent);
        fixture.detectChanges();

        const timePicker = fixture.componentInstance.timePicker;
        const dom = fixture.debugElement;
        const timePickerTarget = dom.query(By.directive(IgxInputDirective));

        UIInteractions.clickElement(timePickerTarget);
        tick();
        fixture.detectChanges();

        const hoursInview = timePicker.hoursInView();
        const minutesInview = timePicker.minutesInView();
        const AMPMInview = timePicker.ampmInView();

        expect(hoursInview).toEqual(['08', '09', '10', '11', '12', '01', '02']);
        expect(minutesInview).toEqual(['24', '25', '26', '27', '28', '29', '30']);
        expect(AMPMInview).toEqual(['AM', 'PM']);
    }));

    it('TimePicker scroll to end', fakeAsync(() => {
        const fixture = TestBed.createComponent(IgxTimePickerWithSpinLoopFalseValueComponent);
        fixture.detectChanges();

        const initialTime = fixture.componentInstance.dateValue;
        const dom = fixture.debugElement;
        const timePickerTarget = dom.query(By.directive(IgxInputDirective));

        UIInteractions.clickElement(timePickerTarget);
        tick();
        fixture.detectChanges();

        const hourColumn: any = dom.query(By.css('.igx-time-picker__hourList'));
        const minuteColumn: any = dom.query(By.css('.igx-time-picker__minuteList'));
        const AMPMColumn: any = dom.query(By.css('.igx-time-picker__ampmList'));

        hourColumn.nativeElement.focus();
        fixture.detectChanges();

        spyOn(console, 'error');

        const event = new WheelEvent('wheel', { deltaX: 0, deltaY: -100 });

        hourColumn.triggerEventHandler('wheel', event);
        fixture.detectChanges();

        minuteColumn.nativeElement.focus();
        fixture.detectChanges();

        minuteColumn.triggerEventHandler('wheel', event);
        fixture.detectChanges();

        AMPMColumn.nativeElement.focus();
        fixture.detectChanges();

        AMPMColumn.triggerEventHandler('wheel', event);
        fixture.detectChanges();

        // check console for error
        expect(console.error).not.toHaveBeenCalled();

        const formatedHours = initialTime.getHours() < 10 ? '0' + initialTime.getHours() : initialTime.getHours();
        const formatedMinutes = initialTime.getMinutes() < 10 ? '0' + initialTime.getMinutes() : initialTime.getMinutes();

        const formatedTestElementTime =
            `${formatedHours}:${formatedMinutes} ${initialTime.getHours() >= 12 ? 'PM' : 'AM'}`;

        // get time from dialog header
        const timeFromPopupHeader: any = fixture.debugElement.query(By.css('.igx-time-picker__header')).nativeElement.children;
        const formatedTimeFromPopupHeader =
            `${timeFromPopupHeader[1].innerText.replace(/\n/g, '')} ${timeFromPopupHeader[0].innerText}`;

        expect(formatedTestElementTime).toBe(formatedTimeFromPopupHeader);
    }));

    it('TimePicker check isSpinLoop with Items Delta', fakeAsync(() => {
        const fixture = TestBed.createComponent(IgxTimePickerWithItemsDeltaValueComponent);
        fixture.detectChanges();

        const dom = fixture.debugElement;
        const timePickerTarget = dom.query(By.directive(IgxInputDirective));

        UIInteractions.clickElement(timePickerTarget);
        tick();
        fixture.detectChanges();

        const hourColumn: any = dom.query(By.css('.igx-time-picker__hourList'));
        const minuteColumn: any = dom.query(By.css('.igx-time-picker__minuteList'));
        const AMPMColumn: any = dom.query(By.css('.igx-time-picker__ampmList'));
        const event = new WheelEvent('wheel', { deltaX: 0, deltaY: 100 });

        spyOn(console, 'error');

        // check scrolling each element
        hourColumn.nativeElement.focus();
        fixture.detectChanges();

        hourColumn.triggerEventHandler('wheel', event);
        fixture.detectChanges();

        minuteColumn.nativeElement.focus();
        fixture.detectChanges();

        minuteColumn.triggerEventHandler('wheel', event);
        fixture.detectChanges();

        AMPMColumn.nativeElement.focus();
        fixture.detectChanges();

        AMPMColumn.triggerEventHandler('wheel', event);
        fixture.detectChanges();

        const timeFromPopupHeader: any = fixture.debugElement.query(By.css('.igx-time-picker__header')).nativeElement.children;
        const formatedTimeFromPopupHeader =
            `${timeFromPopupHeader[1].innerText.replace(/\n/g, '')} ${timeFromPopupHeader[0].innerText}`;
        expect(formatedTimeFromPopupHeader).toBe('12:58 PM');

        expect(console.error).not.toHaveBeenCalled();
    }));

    it('TimePicker with not valid element arrow up', fakeAsync(() => {
        const fixture = TestBed.createComponent(IgxTimePickerTestComponent);
        fixture.detectChanges();

        const validDate = new Date(2017, 7, 7, 4, 27);
        const dom = fixture.debugElement;
        const timePicker = fixture.componentInstance.timePicker;

        timePicker.value = validDate;

        const notValidHour = '700';
        timePicker.selectedHour = notValidHour;

        const timePickerTarget = dom.query(By.directive(IgxInputDirective));
        UIInteractions.clickElement(timePickerTarget);
        tick();
        fixture.detectChanges();

        const hourColumn: any = dom.query(By.css('.igx-time-picker__hourList'));

        const args = { key: 'ArrowUp', bubbles: true };
        hourColumn.nativeElement.dispatchEvent(new KeyboardEvent('keydown', args));
        fixture.detectChanges();

        expect(hourColumn.nativeElement.children[3].innerText).toEqual('03');
    }));

    it('TimePicker with not valid element arrow down', fakeAsync(() => {
        const fixture = TestBed.createComponent(IgxTimePickerTestComponent);
        fixture.detectChanges();

        const dom = fixture.debugElement;
        const timePicker = fixture.componentInstance.timePicker;
        const validDate = new Date(2017, 7, 7, 4, 27);

        timePicker.value = validDate;

        const notValidValue = '700';
        timePicker.selectedMinute = notValidValue;

        const timePickerTarget = dom.query(By.directive(IgxInputDirective));
        UIInteractions.clickElement(timePickerTarget);
        tick();
        fixture.detectChanges();

        const minuteColumn: any = dom.query(By.css('.igx-time-picker__minuteList'));
        const args = { key: 'ArrowDown', bubbles: true };

        minuteColumn.nativeElement.dispatchEvent(new KeyboardEvent('keydown', args));
        fixture.detectChanges();

        expect(minuteColumn.nativeElement.children[3].innerText).toEqual('28');
    }));

    it('TimePicker vertical', fakeAsync(() => {
        const fixture = TestBed.createComponent(IgxTimePickerTestComponent);
        fixture.detectChanges();

        const dom = fixture.debugElement;

        fixture.componentInstance.timePicker.vertical = true;
        fixture.detectChanges();

        const timePickerTarget = dom.query(By.directive(IgxInputDirective));
        UIInteractions.clickElement(timePickerTarget);
        tick();
        fixture.detectChanges();

        const timePickerVertical = dom.query(By.css('.igx-time-picker--vertical'));

        expect(timePickerVertical).not.toBeNull();
        expect(timePickerVertical.nativeElement.offsetWidth).toBeGreaterThan(timePickerVertical.nativeElement.offsetHeight);
    }));

    it('TimePicker with retemplated input group (icon removed)', fakeAsync(() => {
        const fixture = TestBed.createComponent(IgxTimePickerRetemplatedComponent);
        fixture.detectChanges();

        const dom = fixture.debugElement;
        expect(dom.query(By.css('.igx-input-group'))).not.toBeNull();
        expect(dom.query(By.css('.igx-icon'))).toBeNull();
    }));

    // https://github.com/IgniteUI/igniteui-angular/issues/2470
    it('TimePicker always use date from value', fakeAsync(() => {
        const fixture = TestBed.createComponent(IgxTimePickerWithPassedTimeComponent);
        fixture.detectChanges();

        const dom = fixture.debugElement;
        const initialValue = (fixture.componentInstance.timePicker.value);
        const initialDate = getDateStringFromDateObject(initialValue);
        const initialTime = initialValue.getHours() + ':' + initialValue.getMinutes();
        const timePickerTarget = dom.query(By.directive(IgxInputDirective));

        UIInteractions.clickElement(timePickerTarget);
        tick();
        fixture.detectChanges();

        const hourColumn = dom.query(By.css('.igx-time-picker__hourList'));
        const selectHour = hourColumn.children[5];
        const minutesColumn = dom.query(By.css('.igx-time-picker__minuteList'));
        const selectMinutes = minutesColumn.children[2];

        UIInteractions.clickElement(selectHour);
        fixture.detectChanges();

        UIInteractions.clickElement(selectMinutes);
        fixture.detectChanges();

        const OkButton = dom.queryAll(By.css('.igx-button--flat'))[1];

        UIInteractions.clickElement(OkButton);
        tick();
        fixture.detectChanges();

        const changedValue = (fixture.componentInstance.timePicker.value);
        const changedDate = getDateStringFromDateObject(changedValue);
        const changedTime = changedValue.getHours() + ':' + changedValue.getMinutes();

        expect(initialDate).toEqual(changedDate);
        expect(initialTime).not.toEqual(changedTime);
        expect(changedTime).toEqual('5:23');
    }));

    it('TimePicker default selected value in dialog', fakeAsync(() => {
        const fixture = TestBed.createComponent(IgxTimePickerTestComponent);
        fixture.detectChanges();

        const dom = fixture.debugElement;
        const timePickerTarget = dom.query(By.directive(IgxInputDirective));

        UIInteractions.clickElement(timePickerTarget);
        tick();
        fixture.detectChanges();

        const hourColumn = dom.query(By.css('.igx-time-picker__hourList'));
        const selectHour = hourColumn.children[3];

        expect(selectHour.nativeElement.innerText).toBe('04');

        const minuteColumn = dom.query(By.css('.igx-time-picker__minuteList'));
        const selectMinute = minuteColumn.children[3];

        expect(selectMinute.nativeElement.innerText).toBe('00');

        const AMPMColumn: any = dom.query(By.css('.igx-time-picker__ampmList'));
        const selectAMPM = AMPMColumn.children[3];

        expect(selectAMPM.nativeElement.innerText).toBe('AM');
    }));

    it('should be able to apply different formats (dropdown mode)', (() => {
        const fixture = TestBed.createComponent(IgxTimePickerDropDownSingleHourComponent);
        fixture.detectChanges();

        const input = fixture.debugElement.query(By.directive(IgxInputDirective));

        input.nativeElement.dispatchEvent(new Event('focus'));
        fixture.detectChanges();

        expect(input.nativeElement.value).toBe('04:05');

        input.nativeElement.dispatchEvent(new Event('blur'));
        fixture.detectChanges();

        expect(input.nativeElement.value).toBe('4:5');

        fixture.componentInstance.timePicker.format = 'h:m tt';
        fixture.detectChanges();

        expect(input.nativeElement.value).toBe('4:5 AM');

        input.nativeElement.dispatchEvent(new Event('focus'));
        fixture.detectChanges();

        expect(input.nativeElement.value).toBe('04:05 AM');

        input.nativeElement.dispatchEvent(new Event('blur'));
        fixture.detectChanges();

        expect(input.nativeElement.value).toBe('4:5 AM');
    }));

    it('should correct spin (arrow buttons) on empty value (dropdown mode)', (() => {
        const fixture = TestBed.createComponent(IgxTimePickerDropDownNoValueComponent);
        fixture.detectChanges();

        const input = fixture.debugElement.query(By.directive(IgxInputDirective));

        expect(input.nativeElement.value).toBe('', 'Initial focus AM failed');

        // press arrow down
        input.nativeElement.dispatchEvent(new Event('focus'));
        fixture.detectChanges();

        expect(input.nativeElement.value).toBe('--:-- AM', 'Initial focus AM failed');

        // test hours
        input.nativeElement.setSelectionRange(1, 1);
        fixture.detectChanges();

        UIInteractions.triggerKeyDownEvtUponElem('ArrowUp', input.nativeElement, true);
        fixture.detectChanges();

        input.nativeElement.setSelectionRange(1, 1);
        fixture.detectChanges();

        UIInteractions.triggerKeyDownEvtUponElem('ArrowUp', input.nativeElement, true);
        fixture.detectChanges();

        expect(input.nativeElement.value).toBe('01:00 AM', 'Hours spin failed');

        // test minutes
        input.nativeElement.setSelectionRange(3, 3);
        UIInteractions.triggerKeyDownEvtUponElem('ArrowDown', input.nativeElement, true);
        fixture.detectChanges();

        expect(input.nativeElement.value).toBe('01:59 AM', 'MouseWheel Down on minutes failed');
    }));

    describe('EditorProvider', () => {
        it('Should return correct edit element', () => {
            const fixture = TestBed.createComponent(IgxTimePickerTestComponent);
            fixture.detectChanges();

            const instance = fixture.componentInstance.timePicker;
            const editElement = fixture.debugElement.query(By.css('input[igxInput]')).nativeElement;

            expect(instance.getEditElement()).toBe(editElement);
        });
    });

    describe('DropDown Mode', () => {
        configureTestSuite();
        let fixture;
        let timePicker;
        let dom;
        let input;
        beforeEach(
            async(() => {
                fixture = TestBed.createComponent(IgxTimePickerDropDownComponent);
                fixture.detectChanges();

                timePicker = fixture.componentInstance.timePicker;
                dom = fixture.debugElement;
                input = dom.query(By.directive(IgxInputDirective));
            })
        );

        afterEach(async(() => {
            UIInteractions.clearOverlay();
        }));

        it('should initialize a timePicker with dropdown', () => {
            expect(timePicker).toBeDefined();
        });

        it('should accept specific time in the input', (() => {
            fixture.detectChanges();
            const customValue = '12:01 AM';

            spyOn(timePicker.onValueChanged, 'emit');

            UIInteractions.sendInput(input, customValue);
            fixture.detectChanges();

            expect(timePicker.onValueChanged.emit).toHaveBeenCalled();
            expect(input.nativeElement.value).toEqual(customValue);
        }));

        it('should increase and decrease hours/minutes/AMPM, where the caret is, using arrows and mousewheel', (() => {
            fixture.detectChanges();

            // initial input value is 05:45 PM
            input.nativeElement.value = '05:45 PM';
            timePicker.itemsDelta = { hours: 1, minutes: 1 };

            // focus the input, position the caret at the hours
            input.nativeElement.focus();
            input.nativeElement.setSelectionRange(1, 1);

            // press arrow down
            UIInteractions.triggerKeyDownEvtUponElem('ArrowDown', input.nativeElement, true);
            fixture.detectChanges();

            expect(input.nativeElement.value).toBe('04:45 PM', 'ArrowDown on hours failed');

            // position caret at the hours
            input.nativeElement.setSelectionRange(1, 1);
            fixture.detectChanges();

            // mousewheel up
            UIInteractions.simulateWheelEvent(input.nativeElement, 0, -10);
            fixture.detectChanges();

            expect(input.nativeElement.value).toBe('05:45 PM', 'MouseWheel Up on hours dailed');

            // test minutes
            // position caret at the minutes and mousewheel down
            input.nativeElement.setSelectionRange(3, 3);
            UIInteractions.simulateWheelEvent(input.nativeElement, 0, 10);
            fixture.detectChanges();

            expect(input.nativeElement.value).toBe('05:44 PM', 'MouseWheel Down on minutes failed');

            input.nativeElement.setSelectionRange(3, 3);
            fixture.detectChanges();
            // press arrow up
            UIInteractions.triggerKeyDownEvtUponElem('ArrowUp', input.nativeElement, true);
            fixture.detectChanges();

            expect(input.nativeElement.value).toBe('05:45 PM', 'ArrowUp on minutes failed');

            // test AMPM
            // position caret at AMPM and arrow down
            input.nativeElement.setSelectionRange(7, 7);
            UIInteractions.triggerKeyDownEvtUponElem('ArrowDown', input.nativeElement, true);
            fixture.detectChanges();

            expect(input.nativeElement.value).toBe('05:45 AM', 'ArrowDown on AMPM failed');

            input.nativeElement.setSelectionRange(7, 7);
            fixture.detectChanges();
            // mousewheel up
            UIInteractions.simulateWheelEvent(input.nativeElement, 0, -10);
            fixture.detectChanges();

            expect(input.nativeElement.value).toBe('05:45 PM', 'MouseWheel Up on AMPM failed');

            // test full hours
            input.nativeElement.setSelectionRange(0, 0);
            fixture.detectChanges();

            UIInteractions.triggerKeyDownEvtUponElem('ArrowUp', input.nativeElement, true);
            fixture.detectChanges();

            expect(input.nativeElement.value).toBe('06:45 PM', 'MouseWheel Up on AMPM failed');
        }));

        it('should open the dropdown when click on the clock icon', fakeAsync(() => {
            fixture.detectChanges();

            const iconTime = dom.queryAll(By.css('.igx-icon'))[0];

            UIInteractions.clickElement(iconTime);
            tick();
            fixture.detectChanges();

            const dropDown = dom.query(By.css('.igx-time-picker--dropdown'));
            expect(dropDown.properties.hidden).toBeFalsy();
        }));

        it('should reset value on clear button click', (() => {
            fixture.detectChanges();

            const clearTime = dom.queryAll(By.css('.igx-icon'))[1];

            UIInteractions.clickElement(clearTime);
            fixture.detectChanges();

            expect(input.nativeElement.innerText).toEqual('');

            input.nativeElement.dispatchEvent(new Event('blur'));
            fixture.detectChanges();

            expect(input.nativeElement.placeholder).toBe('hh:mm tt');
        }));

        it('should break on spinloop with min and max value on arrow down', (() => {
            fixture.detectChanges();

            const customValue = '07:07 AM';

            UIInteractions.sendInput(input, customValue);
            fixture.detectChanges();

            input.nativeElement.dispatchEvent(new Event('blur'));
            fixture.detectChanges();

            timePicker.isSpinLoop = false;
            timePicker.minValue = customValue;
            timePicker.maxValue = '08:07 AM';
            timePicker.itemsDelta = { hours: 1, minutes: 1 };

            input.nativeElement.focus();
            input.nativeElement.setSelectionRange(0, 0);
            fixture.detectChanges();

            // spin hours
            UIInteractions.triggerKeyDownEvtUponElem('ArrowDown', input.nativeElement, true);
            fixture.detectChanges();

            expect(input.nativeElement.value).toBe(customValue, 'SpinLoop did not stop on hours');

            input.nativeElement.setSelectionRange(5, 5);
            fixture.detectChanges();

            // spin minutes
            UIInteractions.triggerKeyDownEvtUponElem('ArrowDown', input.nativeElement, true);
            fixture.detectChanges();
            expect(input.nativeElement.value).toBe(customValue, 'SpinLoop did not stop on minutes');
        }));

        it('should break on spinloop with min and max value on arrow up', (() => {
            fixture.detectChanges();

            const customValue = '08:07 AM';

            UIInteractions.sendInput(input, customValue);
            fixture.detectChanges();

            input.nativeElement.dispatchEvent(new Event('blur'));
            fixture.detectChanges();

            timePicker.isSpinLoop = false;
            timePicker.minValue = '07:07 AM';
            timePicker.maxValue = customValue;
            timePicker.itemsDelta = { hours: 1, minutes: 1 };
            fixture.detectChanges();

            input.nativeElement.focus();
            input.nativeElement.setSelectionRange(2, 2);
            fixture.detectChanges();

            UIInteractions.triggerKeyDownEvtUponElem('ArrowUp', input.nativeElement, true);
            fixture.detectChanges();

            expect(input.nativeElement.value).toBe(customValue, 'SpinLoop did not stop on hours');

            input.nativeElement.setSelectionRange(5, 5);
            fixture.detectChanges();

            UIInteractions.triggerKeyDownEvtUponElem('ArrowUp', input.nativeElement, true);
            fixture.detectChanges();

            expect(input.nativeElement.value).toBe(customValue, 'SpinLoop did not stop on minutes');

            input.nativeElement.setSelectionRange(7, 7);
            fixture.detectChanges();

            UIInteractions.triggerKeyDownEvtUponElem('ArrowUp', input.nativeElement, true);
            fixture.detectChanges();

            expect(input.nativeElement.value).toBe(customValue, 'SpinLoop did not stop on AMPM');
        }));

        it('should spinloop on correct time after max or min values', (() => {
            fixture.detectChanges();

            const customValue = '08:05 AM';

            UIInteractions.sendInput(input, customValue);
            fixture.detectChanges();

            input.nativeElement.dispatchEvent(new Event('blur'));
            fixture.detectChanges();

            timePicker.isSpinLoop = true;
            timePicker.minValue = '08:05 AM';
            timePicker.maxValue = '11:07 AM';
            timePicker.itemsDelta = { hours: 1, minutes: 1 };
            fixture.detectChanges();

            input.nativeElement.focus();
            input.nativeElement.setSelectionRange(1, 1);
            fixture.detectChanges();

            UIInteractions.triggerKeyDownEvtUponElem('ArrowDown', input.nativeElement, true);
            fixture.detectChanges();

            expect(input.nativeElement.value).toBe('11:05 AM', 'SpinLoop Down wrong time');

            // set a new value which is the max value
            UIInteractions.sendInput(input, '11:03 AM');
            fixture.detectChanges();

            input.nativeElement.dispatchEvent(new Event('blur'));
            fixture.detectChanges();

            // should skip one hour because of the minutes
            input.nativeElement.focus();
            input.nativeElement.setSelectionRange(2, 2);
            fixture.detectChanges();

            UIInteractions.triggerKeyDownEvtUponElem('ArrowUp', input.nativeElement, true);
            fixture.detectChanges();

            expect(input.nativeElement.value).toBe('09:03 AM', 'SpinLoop Up wrong time');
        }));

        it('should open the dropdown with Alt + arrow down', fakeAsync(() => {
            fixture.detectChanges();
            const dropDown = dom.query(By.css('.igx-time-picker--dropdown'));

            // should open dropdown on alt + arrow down
            input.nativeElement.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', altKey: true }));
            tick();
            fixture.detectChanges();

            expect(dropDown.properties.hidden).toBeFalsy();
        }));

        it('should open the dropdown with SpaceBar', fakeAsync(() => {
            fixture.detectChanges();
            const dropDown = dom.query(By.css('.igx-time-picker--dropdown'));

            // should open dropdown on alt + arrow down
            UIInteractions.triggerKeyDownEvtUponElem('SpaceBar', input.nativeElement, true);
            tick();
            fixture.detectChanges();

            expect(dropDown.properties.hidden).toBeFalsy();
        }));

        it('should prevent interaction when disabled', (() => {
            fixture.detectChanges();

            let styles = window.getComputedStyle(input.nativeElement);
            // normal text color
            expect(styles.color).toBe('rgba(0, 0, 0, 0.87)');

            timePicker.disabled = true;
            fixture.detectChanges();

            styles = window.getComputedStyle(input.nativeElement);

            // disabled text color
            expect(styles.color).toBe('rgba(0, 0, 0, 0.38)');
            expect(dom.query(By.css('.igx-input-group--disabled'))).toBeDefined();
        }));

        it('should trigger onValidationFailed event when setting invalid time.', (() => {
            fixture.detectChanges();

            UIInteractions.sendInput(input, '77:77 TT');

            spyOn(timePicker.onValidationFailed, 'emit');

            input.nativeElement.dispatchEvent(new Event('blur'));
            fixture.detectChanges();

            expect(timePicker.onValidationFailed.emit).toHaveBeenCalled();
        }));

        it('should scroll on dropdown opened and accept value when focust lost', fakeAsync(() => {
            fixture.detectChanges();

            timePicker.itemsDelta = { hours: 1, minutes: 5 };

            const initVal = fixture.componentInstance.date;
            const iconTime = dom.queryAll(By.css('.igx-icon'))[0];

            UIInteractions.clickElement(iconTime);
            tick();
            fixture.detectChanges();

            const hourColumn = dom.query(By.css('.igx-time-picker__hourList'));
            const minuteColumn = dom.query(By.css('.igx-time-picker__minuteList'));
            const AMPMColumn = dom.query(By.css('.igx-time-picker__ampmList'));

            UIInteractions.simulateWheelEvent(hourColumn.nativeElement, 0, -10);
            fixture.detectChanges();

            let childCount = hourColumn.children.length;
            expect(hourColumn.children[0].nativeElement.innerText).toBe('01');
            expect(hourColumn.children[childCount - 1].nativeElement.innerText).toBe('07');

            UIInteractions.simulateWheelEvent(minuteColumn.nativeElement, 0, 10);
            fixture.detectChanges();

            childCount = minuteColumn.children.length;
            expect(minuteColumn.children[0].nativeElement.innerText).toBe('35');
            expect(minuteColumn.children[childCount - 1].nativeElement.innerText).toBe('05');

            UIInteractions.simulateWheelEvent(AMPMColumn.nativeElement, 0, -10);
            fixture.detectChanges();

            expect(AMPMColumn.children[0].nativeElement.innerText).toBe('AM');
            expect(AMPMColumn.children[1].nativeElement.innerText).toBe('PM');

            // expect input value to be changed
            expect(input.nativeElement.value).toBe('04:50 AM');
            // expect the timePicker date not to be changed
            expect(fixture.componentInstance.date).toBe(initVal);

            input.nativeElement.dispatchEvent(new Event('blur'));
            fixture.detectChanges();

            expect(fixture.componentInstance.date).toEqual(new Date(2018, 10, 27, 4, 50, 0, 0));
        }));

        it('should not accept invalid value from dropdown when min is set', fakeAsync(() => {
            fixture.detectChanges();

            timePicker.isSpinLoop = true;
            timePicker.minValue = '05:45 PM';
            timePicker.maxValue = '06:45 PM';
            timePicker.itemsDelta = { hours: 1, minutes: 1 };

            const initVal = fixture.componentInstance.date;
            const iconTime = dom.queryAll(By.css('.igx-icon'))[0];

            UIInteractions.clickElement(iconTime);
            tick();
            fixture.detectChanges();

            const hourColumn = dom.query(By.css('.igx-time-picker__hourList'));
            const minuteColumn = dom.query(By.css('.igx-time-picker__minuteList'));
            const AMPMColumn = dom.query(By.css('.igx-time-picker__ampmList'));

            UIInteractions.simulateWheelEvent(hourColumn.nativeElement, 0, -10);
            fixture.detectChanges();

            UIInteractions.simulateWheelEvent(minuteColumn.nativeElement, 0, -10);
            fixture.detectChanges();

            UIInteractions.simulateWheelEvent(AMPMColumn.nativeElement, 0, -10);
            fixture.detectChanges();

            spyOn(timePicker.onValidationFailed, 'emit');

            input.nativeElement.dispatchEvent(new Event('blur'));
            fixture.detectChanges();

            expect(timePicker.onValidationFailed.emit).toHaveBeenCalled();

            // initial value should not be changed
            expect(fixture.componentInstance.date).toEqual(initVal);
        }));

        it('should be able to change the mode at runtime', fakeAsync(() => {
            fixture.detectChanges();

            const iconTime = dom.queryAll(By.css('.igx-icon'))[0];

            UIInteractions.clickElement(iconTime);
            tick();
            fixture.detectChanges();

            expect(dom.query(By.css('.igx-time-picker--dropdown'))).toBeDefined();

            fixture.componentInstance.timePicker.mode = TimePickerInteractionMode.dialog;
            fixture.detectChanges();

            UIInteractions.clickElement(iconTime);
            tick();
            fixture.detectChanges();

            expect(dom.query(By.css('.igx-time-picker--dropdown'))).toBeNull();
        }));

        it('should fire events onOpen and onClose for dropdown mode.', fakeAsync(() => {
            fixture.detectChanges();

            const iconTime = dom.queryAll(By.css('.igx-icon'))[0];

            spyOn(timePicker.onOpen, 'emit');

            UIInteractions.clickElement(iconTime);
            tick();
            fixture.detectChanges();

            expect(timePicker.onOpen.emit).toHaveBeenCalled();

            spyOn(timePicker.onClose, 'emit');

            UIInteractions.clickElement(iconTime);
            tick();
            fixture.detectChanges();

            expect(timePicker.onOpen.emit).toHaveBeenCalled();
        }));
    });
});

@Component({
    template: `
        <igx-time-picker [vertical]="isVertical"></igx-time-picker>
    `
})
export class IgxTimePickerTestComponent {
    @ViewChild(IgxTimePickerComponent) public timePicker: IgxTimePickerComponent;
    public isVertical = false;
}

@Component({
    template: `
        <igx-time-picker [value]="dateValue" [format]="customFormat"></igx-time-picker>
    `
})
export class IgxTimePickerWithPassedTimeComponent {
    public dateValue: Date = new Date(2017, 7, 7, 3, 24);
    public customFormat = 'h:mm tt';
    @ViewChild(IgxTimePickerComponent) public timePicker: IgxTimePickerComponent;
}

@Component({
    template: `
        <igx-time-picker [value]="dateValue" [format]="customFormat"></igx-time-picker>
    `
})
export class IgxTimePickerWithPmTimeComponent {
    public dateValue: Date = new Date(2017, 7, 7, 12, 27);
    public customFormat = 'h:mm tt';
    @ViewChild(IgxTimePickerComponent) public timePicker: IgxTimePickerComponent;
}

@Component({
    template: `
        <igx-time-picker [value]="dateValue" [format]="customFormat"></igx-time-picker>
    `
})
export class IgxTimePickerWithAMPMLeadingZerosTimeComponent {
    public dateValue: Date = new Date(2017, 7, 7, 23, 27);
    public customFormat = 'hh:mm tt';
    @ViewChild(IgxTimePickerComponent) public timePicker: IgxTimePickerComponent;
}

@Component({
    template: `
        <igx-time-picker [value]="dateValue" [format]="customFormat"></igx-time-picker>
    `
})
export class IgxTimePickerWith24HTimeComponent {
    public dateValue: Date = new Date(2017, 7, 7, 24, 27);
    public customFormat = 'HH:mm';
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
    public myMinValue = '3:24 AM';
    public myMaxValue = '5:24 AM';
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
    public customFormat = 'hh:mm tt';
    public customitemsDelta: any = { hours: 2, minutes: 2 };
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
    public customFormat = 'hh:mm tt';
    public customitemsDelta: any = { hours: 2, minutes: 2 };
    @ViewChild(IgxTimePickerComponent) public timePicker: IgxTimePickerComponent;
}

@Component({
    template: `
<igx-time-picker>
    <ng-template igxTimePickerTemplate let-displayTime="displayTime">
        <igx-input-group>
            <label igxLabel>Time</label>
            <input igxInput [value]="displayTime"/>
        </igx-input-group>
    </ng-template>
</igx-time-picker>
    `
})
export class IgxTimePickerRetemplatedComponent { }

@Component({
    template: `
    <igx-time-picker [mode]="mode.dropdown"
                     [isSpinLoop]="isSpinLoop"
                     [(ngModel)]="date"
                     [itemsDelta]="itemsDelta"
                     [format]="format" >
                </igx-time-picker>
    `
})
export class IgxTimePickerDropDownComponent {
    itemsDelta = { hours: 1, minutes: 5 };
    format = 'hh:mm tt';
    isSpinLoop = true;
    isVertical = true;
    mode = TimePickerInteractionMode;
    date = new Date(2018, 10, 27, 17, 45, 0, 0);

    @ViewChild(IgxTimePickerComponent) public timePicker: IgxTimePickerComponent;
}
@Component({
    template: `
    <igx-time-picker
                     [value]="customDate"
                     [mode]="mode"
                     [format]="'H:m'">
                </igx-time-picker>
    `
})
export class IgxTimePickerDropDownSingleHourComponent {
    customDate = new Date(2018, 10, 27, 4, 5);
    mode = TimePickerInteractionMode.dropdown;

    @ViewChild(IgxTimePickerComponent) public timePicker: IgxTimePickerComponent;
}
@Component({
    template: `
    <igx-time-picker
                     [mode]="mode"
                     [format]="'hh:mm tt'">
                </igx-time-picker>
    `
})
export class IgxTimePickerDropDownNoValueComponent {
    mode = TimePickerInteractionMode.dropdown;

    @ViewChild(IgxTimePickerComponent) public timePicker: IgxTimePickerComponent;
}

// helper functions
function findByInnerText(collection, searchText) {
    for (const element of collection) {
        if (element.nativeElement.innerText === searchText) {
            return element;
        }
    }
}

function getDateStringFromDateObject(date: Date): string {
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const year = date.getFullYear();

    return year + '/' + month + '/' + day;
}
