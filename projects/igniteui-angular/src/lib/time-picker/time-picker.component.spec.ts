import { Component, ViewChild } from '@angular/core';
import { async, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { IgxInputDirective } from '../directives/input/input.directive';
import { IgxTimePickerComponent, IgxTimePickerModule } from './time-picker.component';
import { UIInteractions, wait } from '../test-utils/ui-interactions.spec';
import { IgxInputGroupModule } from '../input-group';

describe('IgxTimePicker', () => {
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
                IgxTimePickerRetemplatedComponent
            ],
            imports: [IgxTimePickerModule, FormsModule, BrowserAnimationsModule, IgxInputGroupModule]
        })
        .compileComponents();
    }));

    afterEach(() => {
        UIInteractions.clearOverlay();
    });

    it('Initialize a TimePicker component', () => {
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
    });

    it('@Input properties', () => {
        const fixture = TestBed.createComponent(IgxTimePickerWithPassedTimeComponent);
        fixture.detectChanges();

        const timePicker = fixture.componentInstance.timePicker;
        expect(timePicker.value).toEqual(new Date(2017, 7, 7, 3, 24));
    });

    it('TimePicker DOM input value', () => {
        const fixture = TestBed.createComponent(IgxTimePickerWithPassedTimeComponent);
        fixture.detectChanges();

        const currentTime = new Date(2017, 7, 7, 3, 24);
        const formattedTime = `${currentTime.getHours()}:${currentTime.getMinutes()} ${currentTime.getHours() > 12 ? 'PM' : 'AM'}`;

        const dom = fixture.debugElement;

        const valueFromInput = dom.query(By.directive(IgxInputDirective)).nativeElement.value;
        expect(valueFromInput).toEqual(formattedTime);
    });

    it('Dialog header value', (async() => {
        const fixture = TestBed.createComponent(IgxTimePickerWithPmTimeComponent);
        fixture.detectChanges();
        const dom = fixture.debugElement;

        // get time-picker value
        const testElementTIme = fixture.componentInstance.dateValue;
        const formatedTestElementTime =
         `${testElementTIme.getHours()}:${testElementTIme.getMinutes()} ${testElementTIme.getHours() >= 12 ? 'PM' : 'AM'}`;

        const timePickerTarget = dom.query(By.directive(IgxInputDirective));
        UIInteractions.clickElement(timePickerTarget);
        await wait();
        fixture.detectChanges();

        // get time from dialog header
        const timeFromPopupHeader: any = fixture.debugElement.query(By.css('.igx-time-picker__header')).nativeElement.children;
        const formatedTimeFromPopupHeader =
         `${timeFromPopupHeader[1].innerText.replace(/\n/g, '')} ${timeFromPopupHeader[0].innerText}`;

        expect(formatedTimeFromPopupHeader).toBe(formatedTestElementTime);
    }));

    it('Dialog selected element position', (async() => {
        const fixture = TestBed.createComponent(IgxTimePickerWithPmTimeComponent);
        fixture.detectChanges();

        const dom = fixture.debugElement;
        const timePickerTarget = dom.query(By.directive(IgxInputDirective));
        UIInteractions.clickElement(timePickerTarget);
        await wait();
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

    it('TimePicker open event', (async() => {
        const fixture = TestBed.createComponent(IgxTimePickerTestComponent);
        fixture.detectChanges();

        const timePicker = fixture.componentInstance.timePicker;
        const dom = fixture.debugElement;

        const target = dom.query(By.directive(IgxInputDirective));

        spyOn(timePicker.onOpen, 'emit');

        target.nativeElement.dispatchEvent(new Event('click', { bubbles: true }));
        await wait();

        expect(timePicker.onOpen.emit).toHaveBeenCalled();
    }));

    it('TimePicker Validation Failed event', (async () => {
        const fixture = TestBed.createComponent(IgxTimePickerWithMInMaxTimeValueComponent);
        fixture.detectChanges();

        const timePicker = fixture.componentInstance.timePicker;
        const dom = fixture.debugElement;
        const timePickerTarget = dom.query(By.directive(IgxInputDirective));
        UIInteractions.clickElement(timePickerTarget);
        await wait();
        fixture.detectChanges();

        // select time difference (-3, -3, 'AM')
        const middlePos = 3;
        const hourColumn = dom.query(By.css('.igx-time-picker__hourList'));
        const selectHour = hourColumn.children[middlePos - 3];
        const minutesColumn = dom.query(By.css('.igx-time-picker__minuteList'));
        const selectMinutes = minutesColumn.children[middlePos - 3];
        // selectHour.triggerEventHandler('click', {});
        UIInteractions.clickElement(selectHour);
        await wait();
        fixture.detectChanges();
        // selectMinutes.triggerEventHandler('click', {});
        UIInteractions.clickElement(selectMinutes);
        await wait();
        fixture.detectChanges();
        const AMPMColumn = dom.query(By.css('.igx-time-picker__ampmList'));
        const selectAMPM = findByInnerText(AMPMColumn.children, 'AM');
        // selectAMPM.triggerEventHandler('click', {});
        UIInteractions.clickElement(selectAMPM);
        await wait();
        fixture.detectChanges();

        const OkButton = dom.queryAll(By.css('.igx-button--flat'))[1];
        spyOn(timePicker.onValidationFailed, 'emit');
        OkButton.triggerEventHandler('click', {});
        fixture.detectChanges();
        await wait();

        expect(timePicker.onValidationFailed.emit).toHaveBeenCalled();
    }));

    it('TimePicker cancel button', (async() => {
        const fixture = TestBed.createComponent(IgxTimePickerWithPmTimeComponent);
        fixture.detectChanges();

        const timePicker = fixture.componentInstance.timePicker;
        const dom = fixture.debugElement;
        const initialTime = dom.query(By.directive(IgxInputDirective)).nativeElement.value;

        const timePickerTarget = dom.query(By.directive(IgxInputDirective));
        UIInteractions.clickElement(timePickerTarget);
        await wait();
        fixture.detectChanges();

        // select time difference (2, -3, 'AM')
        const middlePos = 3;
        const hourColumn = dom.query(By.css('.igx-time-picker__hourList'));
        const selectHour = hourColumn.children[middlePos + 2];
        const minutesColumn = dom.query(By.css('.igx-time-picker__minuteList'));
        const selectMinutes = minutesColumn.children[middlePos - 3];

        UIInteractions.clickElement(selectHour);
        await wait();
        fixture.detectChanges();

        UIInteractions.clickElement(selectMinutes);
        await wait();
        fixture.detectChanges();

        const AMPMColumn = dom.query(By.css('.igx-time-picker__ampmList'));
        const selectAMPM = findByInnerText(AMPMColumn.children, 'AM');

        UIInteractions.clickElement(selectAMPM);
        await wait();
        fixture.detectChanges();

        spyOn(timePicker.onValueChanged, 'emit');

        const cancelButton = dom.queryAll(By.css('.igx-button--flat'))[0];
        UIInteractions.clickElement(cancelButton);
        await wait();
        fixture.detectChanges();

        const selectedTime = dom.query(By.directive(IgxInputDirective)).nativeElement.value;
        expect(initialTime).toEqual(selectedTime);

        expect(timePicker.onValueChanged.emit).not.toHaveBeenCalled();

    }));

    it('TimePicker ValueChanged event', (async() => {
        const fixture = TestBed.createComponent(IgxTimePickerTestComponent);
        fixture.detectChanges();

        const timePicker = fixture.componentInstance.timePicker;
        const dom = fixture.debugElement;

        const timePickerTarget = dom.query(By.directive(IgxInputDirective));
        UIInteractions.clickElement(timePickerTarget);
        await wait();
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
        await wait();
        UIInteractions.clickElement(selectMinutes);
        fixture.detectChanges();
        await wait();
        UIInteractions.clickElement(selectAMPM);
        fixture.detectChanges();
        await wait();

        const OkButton = dom.queryAll(By.css('.igx-button--flat'))[1];
        spyOn(timePicker.onValueChanged, 'emit');
        UIInteractions.clickElement(OkButton);
        fixture.detectChanges();
        await wait();

        expect(timePicker.onValueChanged.emit).toHaveBeenCalled();

        const valueFromInput = dom.query(By.directive(IgxInputDirective)).nativeElement.value;
        const selectedTime = `${hourValue}:${minuteValue} ${aMPMValue}`;

        expect(valueFromInput).toEqual(selectedTime);
    }));

    it('TimePicker UP Down Keyboard navigation', (async() => {
        const fixture = TestBed.createComponent(IgxTimePickerWithPassedTimeComponent);
        fixture.detectChanges();

        const timePicker = fixture.componentInstance.timePicker;
        const dom = fixture.debugElement;

        const timePickerTarget = dom.query(By.directive(IgxInputDirective));
        UIInteractions.clickElement(timePickerTarget);
        await wait();
        fixture.detectChanges();

        const hourColumn: any = dom.query(By.css('.igx-time-picker__hourList'));
        const minuteColumn: any = dom.query(By.css('.igx-time-picker__minuteList'));
        const AMPMColumn: any = dom.query(By.css('.igx-time-picker__ampmList'));

        hourColumn.nativeElement.focus();
        // move arrows several times with hour column
        let args = { key: 'ArrowUp', bubbles: true };
        hourColumn.nativeElement.dispatchEvent(new KeyboardEvent('keydown', args));
        await wait();
        fixture.detectChanges();
        args = { key: 'ArrowDown', bubbles: true };
        hourColumn.nativeElement.dispatchEvent(new KeyboardEvent('keydown', args));
        await wait();
        fixture.detectChanges();
        args = { key: 'ArrowUp', bubbles: true };
        hourColumn.nativeElement.dispatchEvent(new KeyboardEvent('keydown', args));
        await wait();
        fixture.detectChanges();

        minuteColumn.nativeElement.focus();
        await wait();
        fixture.detectChanges();

        // move arrows several times with minute column
        args = { key: 'ArrowDown', bubbles: true };
        minuteColumn.nativeElement.dispatchEvent(new KeyboardEvent('keydown', args));
        await wait();
        fixture.detectChanges();
        args = { key: 'ArrowUp', bubbles: true };
        minuteColumn.nativeElement.dispatchEvent(new KeyboardEvent('keydown', args));
        await wait();
        fixture.detectChanges();
        args = { key: 'ArrowDown', bubbles: true };
        minuteColumn.nativeElement.dispatchEvent(new KeyboardEvent('keydown', args));
        await wait();
        fixture.detectChanges();

        await wait();
        AMPMColumn.nativeElement.focus();

        // move arrows several times with ampm column
        args = { key: 'ArrowUp', bubbles: true };
        AMPMColumn.nativeElement.dispatchEvent(new KeyboardEvent('keydown', args));
        await wait();
        fixture.detectChanges();
        args = { key: 'ArrowDown', bubbles: true };
        AMPMColumn.nativeElement.dispatchEvent(new KeyboardEvent('keydown', args));

        await wait();
        fixture.detectChanges();

        // get time from dialog header
        const timeFromPopupHeader: any = dom.query(By.css('.igx-time-picker__header')).nativeElement.children;
        const formatedTimeFromPopupHeader =
         `${timeFromPopupHeader[1].innerText.replace(/\n/g, '')} ${timeFromPopupHeader[0].innerText}`;

        args = { key: 'Enter', bubbles: true };
        hourColumn.nativeElement.dispatchEvent(new KeyboardEvent('keydown', args));
        await wait();
        fixture.detectChanges();

        const valueFromInput = dom.query(By.directive(IgxInputDirective)).nativeElement.value;

        expect(formatedTimeFromPopupHeader).toBe(valueFromInput);
    }));

    it('TimePicker Left Right Keyboard navigation', (async() => {
        const fixture = TestBed.createComponent(IgxTimePickerWithPassedTimeComponent);
        fixture.detectChanges();

        const dom = fixture.debugElement;
        const initialTime = dom.query(By.directive(IgxInputDirective)).nativeElement.value;

        let args = { key: 'ArrowRight', bubbles: true };
        const timePickerTarget = dom.query(By.directive(IgxInputDirective));
        UIInteractions.clickElement(timePickerTarget);
        await wait();
        fixture.detectChanges();

        const hourColumn: any = dom.query(By.css('.igx-time-picker__hourList'));
        hourColumn.nativeElement.focus();
        await wait();
        fixture.detectChanges();
        expect(document.activeElement.classList).toContain('igx-time-picker__hourList');

        document.activeElement.dispatchEvent(new KeyboardEvent('keydown', args));
        await wait();
        fixture.detectChanges();
        expect(document.activeElement.classList).toContain('igx-time-picker__minuteList');

        args = { key: 'ArrowLeft', bubbles: true };
        document.activeElement.dispatchEvent(new KeyboardEvent('keydown', args));
        await wait();
        fixture.detectChanges();

        args = { key: 'ArrowRight', bubbles: true };
        document.activeElement.dispatchEvent(new KeyboardEvent('keydown', args));
        await wait();
        fixture.detectChanges();

        args = { key: 'ArrowUp', bubbles: true };
        document.activeElement.dispatchEvent(new KeyboardEvent('keydown', args));
        await wait();
        fixture.detectChanges();
        expect(document.activeElement.children[3].innerHTML.trim()).toBe('23');

        args = { key: 'ArrowRight', bubbles: true };
        document.activeElement.dispatchEvent(new KeyboardEvent('keydown', args));
        await wait();
        fixture.detectChanges();

        args = { key: 'ArrowDown', bubbles: true };
        document.activeElement.dispatchEvent(new KeyboardEvent('keydown', args));
        await wait();
        fixture.detectChanges();
        expect(document.activeElement.children[3].innerHTML.trim()).toBe('PM');

        args = { key: 'ArrowLeft', bubbles: true };
        document.activeElement.dispatchEvent(new KeyboardEvent('keydown', args));
        await wait();
        fixture.detectChanges();
        expect(document.activeElement.classList).toContain('igx-time-picker__minuteList');

        // get time from dialog header
        const timeFromPopupHeader: any = dom.query(By.css('.igx-time-picker__header')).nativeElement.children;
        const formatedTimeFromPopupHeader =
        `${timeFromPopupHeader[1].innerText.replace(/\n/g, '')} ${timeFromPopupHeader[0].innerText}`;
        expect(formatedTimeFromPopupHeader).toBe('3:23 PM');

        args = { key: 'Escape', bubbles: true };
        document.activeElement.dispatchEvent(new KeyboardEvent('keydown', args));
        await wait();
        fixture.detectChanges();

        const selectedTime = dom.query(By.directive(IgxInputDirective)).nativeElement.value;
        expect(initialTime).toEqual(selectedTime);
    }));

    it('TimePicker Mouse Over', (async() => {
        const fixture = TestBed.createComponent(IgxTimePickerWithPassedTimeComponent);
        fixture.detectChanges();

        const dom = fixture.debugElement;
        const timePickerTarget = dom.query(By.directive(IgxInputDirective));
        UIInteractions.clickElement(timePickerTarget);
        await wait();
        fixture.detectChanges();

        // const timePicker = fixture.componentInstance.timePicker;
        const hourColumn: any = dom.query(By.css('.igx-time-picker__hourList'));
        const minuteColumn: any = dom.query(By.css('.igx-time-picker__minuteList'));
        const AMPMColumn: any = dom.query(By.css('.igx-time-picker__ampmList'));

        hourColumn.triggerEventHandler('focus', {});
        await wait();
        fixture.detectChanges();

        hourColumn.triggerEventHandler('mouseover', {});
        await wait();
        fixture.detectChanges();
        expect(document.activeElement.classList).toContain('igx-time-picker__hourList');

        minuteColumn.triggerEventHandler('mouseover', {});
        await wait();
        fixture.detectChanges();
        expect(document.activeElement.classList).toContain('igx-time-picker__minuteList');

        AMPMColumn.triggerEventHandler('mouseover', {});
        await wait();
        fixture.detectChanges();
        expect(document.activeElement.classList).toContain('igx-time-picker__ampmList');
    }));

    it('TimePicker Mouse Wheel', (async() => {
        const fixture = TestBed.createComponent(IgxTimePickerWithPassedTimeComponent);
        fixture.detectChanges();

        const dom = fixture.debugElement;
        const timePickerTarget = dom.query(By.directive(IgxInputDirective));
        UIInteractions.clickElement(timePickerTarget);
        await wait();
        fixture.detectChanges();

        // const timePicker = fixture.componentInstance.timePicker;
        const hourColumn: any = dom.query(By.css('.igx-time-picker__hourList'));
        const minuteColumn: any = dom.query(By.css('.igx-time-picker__minuteList'));
        const AMPMColumn: any = dom.query(By.css('.igx-time-picker__ampmList'));

        let event = new WheelEvent('wheel', {deltaX: 0, deltaY: 0});

        // focus hours
        hourColumn.nativeElement.focus();
        await wait();
        fixture.detectChanges();

        hourColumn.triggerEventHandler('wheel', event);
        await wait();
        fixture.detectChanges();

        event = new WheelEvent('wheel', {deltaX: 0, deltaY: -100});
        hourColumn.triggerEventHandler('wheel', event);
        await wait();
        fixture.detectChanges();
        // move the mouse wheel up and expect the selected element to be 2
        expect(hourColumn.nativeElement.children[3].innerText).toBe('2');

        event = new WheelEvent('wheel', {deltaX: 0, deltaY: 100});
        hourColumn.triggerEventHandler('wheel', event);
        await wait();
        fixture.detectChanges();
        // move the mouse wheel down and expect the selected element to be 3 again
        expect(hourColumn.nativeElement.children[3].innerText).toBe('3');

        // focus minutes
        minuteColumn.nativeElement.focus();
        await wait();
        fixture.detectChanges();

        event = new WheelEvent('wheel', {deltaX: 0, deltaY: -100});
        minuteColumn.triggerEventHandler('wheel', event);
        await wait();
        fixture.detectChanges();
        // move the mouse wheel up and expect the selected element to be 23
        expect(minuteColumn.nativeElement.children[3].innerText).toBe('23');

        event = new WheelEvent('wheel', {deltaX: 0, deltaY: 100});
        minuteColumn.triggerEventHandler('wheel', event);
        await wait();
        fixture.detectChanges();
        // move the mouse wheel down and expect the selected element to be 24 again
        expect(minuteColumn.nativeElement.children[3].innerText).toBe('24');

        // focus ampm
        AMPMColumn.nativeElement.focus();
        await wait();
        fixture.detectChanges();

        event = new WheelEvent('wheel', {deltaX: 0, deltaY: 100});
        AMPMColumn.triggerEventHandler('wheel', event);
        await wait();
        fixture.detectChanges();
        // move the mouse wheel down and expect the selected element to be PM
        expect(AMPMColumn.nativeElement.children[3].innerText).toBe('PM');

        event = new WheelEvent('wheel', {deltaX: 0, deltaY: -100});
        AMPMColumn.triggerEventHandler('wheel', event);
        await wait();
        fixture.detectChanges();
        // move the mouse wheel up and expect the selected element to be AM again
        expect(AMPMColumn.nativeElement.children[3].innerText).toBe('AM');
    }));

    it('TimePicker Pan Move', (async() => {
        const fixture = TestBed.createComponent(IgxTimePickerWithPassedTimeComponent);
        fixture.detectChanges();

        const dom = fixture.debugElement;
        const timePickerTarget = dom.query(By.directive(IgxInputDirective));
        UIInteractions.clickElement(timePickerTarget);
        await wait();
        fixture.detectChanges();

        // const timePicker = fixture.componentInstance.timePicker;
        const hourColumn: any = dom.query(By.css('.igx-time-picker__hourList'));
        const minuteColumn: any = dom.query(By.css('.igx-time-picker__minuteList'));
        const AMPMColumn: any = dom.query(By.css('.igx-time-picker__ampmList'));

        // panmove is in reverse direction of mouse wheel
        const event = new WheelEvent('wheel', {deltaX: 0, deltaY: 0});
        const eventUp = new WheelEvent('wheel', {deltaX: 0, deltaY: 100});
        const eventDown = new WheelEvent('wheel', {deltaX: 0, deltaY: -100});

        // focus hours
        hourColumn.nativeElement.focus();
        await wait();
        fixture.detectChanges();

        hourColumn.triggerEventHandler('panmove', event);
        await wait();
        fixture.detectChanges();

        hourColumn.triggerEventHandler('panmove', eventDown);
        await wait();
        fixture.detectChanges();
        // swipe up and expect the selected element to be 4
        expect(hourColumn.nativeElement.children[3].innerText).toBe('4');

        hourColumn.triggerEventHandler('panmove', eventUp);
        await wait();
        fixture.detectChanges();
        // swipe down and expect the selected element to be 3 again
        expect(hourColumn.nativeElement.children[3].innerText).toBe('3');

        // focus minutes
        minuteColumn.nativeElement.focus();
        await wait();
        fixture.detectChanges();

        minuteColumn.triggerEventHandler('panmove', eventDown);
        await wait();
        fixture.detectChanges();
        // swipe up and expect the selected element to be 25
        expect(minuteColumn.nativeElement.children[3].innerText).toBe('25');

        minuteColumn.triggerEventHandler('panmove', eventUp);
        await wait();
        fixture.detectChanges();
        // swipe down and expect the selected element to be 24 again
        expect(minuteColumn.nativeElement.children[3].innerText).toBe('24');

        // focus ampm
        AMPMColumn.nativeElement.focus();
        await wait();
        fixture.detectChanges();

        AMPMColumn.triggerEventHandler('panmove', eventDown);
        await wait();
        fixture.detectChanges();
        // swipe up and expect the selected element to be PM
        expect(AMPMColumn.nativeElement.children[3].innerText).toBe('PM');

        AMPMColumn.triggerEventHandler('panmove', eventUp);
        await wait();
        fixture.detectChanges();
        // move the swipe up and expect the selected element to be AM again
        expect(AMPMColumn.nativeElement.children[3].innerText).toBe('AM');
    }));

    it('TimePicker 24 hour format', (async() => {
        const fixture = TestBed.createComponent(IgxTimePickerWith24HTimeComponent);
        fixture.detectChanges();

        const dom = fixture.debugElement;
        const timePickerTarget = dom.query(By.directive(IgxInputDirective));
        UIInteractions.clickElement(timePickerTarget);
        await wait();
        fixture.detectChanges();

        const AMPMColumn: any = dom.query(By.css('.igx-time-picker__ampmList'));
        expect(AMPMColumn.children.length).toBe(0);

        const hourColumn = dom.query(By.css('.igx-time-picker__hourList'));
        const selectHour = hourColumn.children[3];
        expect(selectHour.nativeElement.innerText).toBe('00');
    }));

    it('TimePicker Items in view', (async() => {
        const fixture = TestBed.createComponent(IgxTimePickerWithAMPMLeadingZerosTimeComponent);
        fixture.detectChanges();
        const timePicker = fixture.componentInstance.timePicker;

        const dom = fixture.debugElement;
        const timePickerTarget = dom.query(By.directive(IgxInputDirective));
        UIInteractions.clickElement(timePickerTarget);
        await wait();
        fixture.detectChanges();

        const hoursInview = timePicker.hoursInView();
        const minutesInview = timePicker.minutesInView();
        const AMPMInview = timePicker.ampmInView();

        expect(hoursInview).toEqual(['08', '09', '10', '11', '12', '01', '02']);
        expect(minutesInview).toEqual([ '24', '25', '26', '27', '28', '29', '30' ]);
        expect(AMPMInview).toEqual([ 'AM', 'PM' ]);
    }));

    it('TimePicker scroll to end', (async() => {
        const fixture = TestBed.createComponent(IgxTimePickerWithSpinLoopFalseValueComponent);
        fixture.detectChanges();

        const initialTime = fixture.componentInstance.dateValue;

        const dom = fixture.debugElement;
        const timePickerTarget = dom.query(By.directive(IgxInputDirective));
        UIInteractions.clickElement(timePickerTarget);
        await wait();
        fixture.detectChanges();

        const hourColumn: any = dom.query(By.css('.igx-time-picker__hourList'));
        const minuteColumn: any = dom.query(By.css('.igx-time-picker__minuteList'));
        const AMPMColumn: any = dom.query(By.css('.igx-time-picker__ampmList'));

        hourColumn.nativeElement.focus();
        await wait();
        fixture.detectChanges();

        spyOn(console, 'error');

        const event = new WheelEvent('wheel', {deltaX: 0, deltaY: -100});

        hourColumn.triggerEventHandler('wheel', event);
        await wait();
        fixture.detectChanges();

        minuteColumn.nativeElement.focus();
        await wait();
        fixture.detectChanges();

        minuteColumn.triggerEventHandler('wheel', event);
        await wait();
        fixture.detectChanges();

        AMPMColumn.nativeElement.focus();
        await wait();
        fixture.detectChanges();

        AMPMColumn.triggerEventHandler('wheel', event);
        await wait();
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

    it('TimePicker check isSpinLoop with Items Delta', (async() => {
        const fixture = TestBed.createComponent(IgxTimePickerWithItemsDeltaValueComponent);
        fixture.detectChanges();
        const dom = fixture.debugElement;
        const timePickerTarget = dom.query(By.directive(IgxInputDirective));
        UIInteractions.clickElement(timePickerTarget);
        await wait();
        fixture.detectChanges();

        const hourColumn: any = dom.query(By.css('.igx-time-picker__hourList'));
        const minuteColumn: any = dom.query(By.css('.igx-time-picker__minuteList'));
        const AMPMColumn: any = dom.query(By.css('.igx-time-picker__ampmList'));
        const event = new WheelEvent('wheel', {deltaX: 0, deltaY: 100});

        spyOn(console, 'error');

        // check scrolling each element
        hourColumn.nativeElement.focus();
        await wait();
        fixture.detectChanges();

        hourColumn.triggerEventHandler('wheel', event);
        await wait();
        fixture.detectChanges();

        minuteColumn.nativeElement.focus();
        await wait();
        fixture.detectChanges();

        minuteColumn.triggerEventHandler('wheel', event);
        await wait();
        fixture.detectChanges();

        AMPMColumn.nativeElement.focus();
        await wait();
        fixture.detectChanges();

        AMPMColumn.triggerEventHandler('wheel', event);
        await wait();
        fixture.detectChanges();

        const timeFromPopupHeader: any = fixture.debugElement.query(By.css('.igx-time-picker__header')).nativeElement.children;
        const formatedTimeFromPopupHeader =
        `${timeFromPopupHeader[1].innerText.replace(/\n/g, '')} ${timeFromPopupHeader[0].innerText}`;
        expect(formatedTimeFromPopupHeader).toBe('12:58 PM');

        expect(console.error).not.toHaveBeenCalled();
    }));

    it('TimePicker with not valid element arrow up', (async() => {
        const fixture = TestBed.createComponent(IgxTimePickerTestComponent);
        fixture.detectChanges();

        const validDate = new Date(2017, 7, 7, 4, 27);

        const timePicker = fixture.componentInstance.timePicker;
        timePicker.value = validDate;
        const dom = fixture.debugElement;

        const notValidHour = '700';
        timePicker.selectedHour = notValidHour;

        const timePickerTarget = dom.query(By.directive(IgxInputDirective));
        UIInteractions.clickElement(timePickerTarget);
        await wait();
        fixture.detectChanges();

        const hourColumn: any = dom.query(By.css('.igx-time-picker__hourList'));

        const args = { key: 'ArrowUp', bubbles: true };
        hourColumn.nativeElement.dispatchEvent(new KeyboardEvent('keydown', args));
        await wait();
        fixture.detectChanges();

        expect(hourColumn.nativeElement.children[3].innerText).toEqual('03');
    }));

    it('TimePicker with not valid element arrow down', (async() => {
        const fixture = TestBed.createComponent(IgxTimePickerTestComponent);
        fixture.detectChanges();

        const timePicker = fixture.componentInstance.timePicker;
        const validDate = new Date(2017, 7, 7, 4, 27);
        timePicker.value = validDate;
        const dom = fixture.debugElement;

        const notValidValue = '700';
        timePicker.selectedMinute = notValidValue;

        const timePickerTarget = dom.query(By.directive(IgxInputDirective));
        UIInteractions.clickElement(timePickerTarget);
        await wait();
        fixture.detectChanges();

        const minuteColumn: any = dom.query(By.css('.igx-time-picker__minuteList'));
        const args = { key: 'ArrowDown', bubbles: true };

        minuteColumn.nativeElement.dispatchEvent(new KeyboardEvent('keydown', args));
        await wait();
        fixture.detectChanges();

        expect(minuteColumn.nativeElement.children[3].innerText).toEqual('28');
    }));

    it('TimePicker vertical', (async() => {

        const fixture = TestBed.createComponent(IgxTimePickerTestComponent);
        fixture.detectChanges();
        const dom = fixture.debugElement;

        const timePicker = fixture.componentInstance.timePicker;
        timePicker.vertical = true;

        const timePickerTarget = dom.query(By.directive(IgxInputDirective));
        UIInteractions.clickElement(timePickerTarget);
        await wait();
        fixture.detectChanges();

        expect(dom.query(By.css('.igx-time-picker--vertical'))).not.toBeNull();

        const dialog = dom.query(By.css('.igx-dialog__window')).nativeElement;

        expect(dialog.offsetWidth).toBeGreaterThan(dialog.offsetHeight);
    }));

    it('TimePicker with retemplated input group (icon removed)', (async() => {
        const fixture = TestBed.createComponent(IgxTimePickerRetemplatedComponent);
        wait();
        fixture.detectChanges();

        const dom = fixture.debugElement;
        expect(dom.query(By.css('.igx-input-group'))).not.toBeNull();
        expect(dom.query(By.css('.igx-icon'))).toBeNull();
    }));
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
    public customitemsDelta: any = {hours: 2, minutes: 2};
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
    public customitemsDelta: any = {hours: 2, minutes: 2};
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
export class IgxTimePickerRetemplatedComponent {}

// helper functions
function findByInnerText(collection, searchText) {
    for (const element of collection) {
        if (element.nativeElement.innerText === searchText) {
            return element;
        }
    }
}
