import { Component, ViewChild, DebugElement } from '@angular/core';
import { TestBed, fakeAsync, tick, ComponentFixture, waitForAsync } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { IgxTimePickerComponent, IgxTimePickerModule, IgxTimePickerValidationFailedEventArgs } from './time-picker.component';
import { UIInteractions } from '../test-utils/ui-interactions.spec';
import { IgxInputGroupModule } from '../input-group/public_api';
import { configureTestSuite } from '../test-utils/configure-suite';
import { PickerInteractionMode } from '../date-common/types';
import { IgxIconModule } from '../icon/public_api';
import { IgxToggleDirective } from '../directives/toggle/toggle.directive';
import { KEYS } from '../core/utils';
import { DatePart } from '../directives/date-time-editor/public_api';
import { DateTimeUtil } from '../date-common/util/date-time.util';

const CSS_CLASS_TIMEPICKER = 'igx-time-picker';
const CSS_CLASS_INPUTGROUP = 'igx-input-group';
const CSS_CLASS_INPUTGROUP_DISABLED = 'igx-input-group--disabled';
const CSS_CLASS_INPUT = '.igx-input-group__input';
const CSS_CLASS_DROPDOWN = '.igx-time-picker--dropdown';
const CSS_CLASS_HOURLIST = '.igx-time-picker__hourList';
const CSS_CLASS_MINUTELIST = '.igx-time-picker__minuteList';
// const CSS_CLASS_SECONDSLIST = '.igx-time-picker__secondsList';
const CSS_CLASS_AMPMLIST = '.igx-time-picker__ampmList';
const CSS_CLASS_SELECTED_ITEM = '.igx-time-picker__item--selected';
const CSS_CLASS_HEADER_HOUR = '.igx-time-picker__header-hour';
const CSS_CLASS_OVERLAY = 'igx-overlay';
const CSS_CLASS_OVERLAY_WRAPPER = 'igx-overlay__wrapper';

describe('IgxTimePicker', () => {
    let timePicker: IgxTimePickerComponent;

    describe('Unit tests', () => {
        const elementRef = { nativeElement: null };
        const mockNgControl = jasmine.createSpyObj('NgControl',
            ['registerOnChangeCb',
                'registerOnTouchedCb',
                'registerOnValidatorChangeCb']);
        const mockInjector = jasmine.createSpyObj('Injector', { get: mockNgControl });
        const mockDateTimeEditorDirective = jasmine.createSpyObj('IgxDateTimeEditorDirective', ['increment', 'decrement'], { value: null });

        it('should open/close the dropdown with open()/close() method', () => {
            timePicker = new IgxTimePickerComponent(elementRef, null, null, null, mockInjector);
            (timePicker as any).dateTimeEditor = mockDateTimeEditorDirective;
            const mockToggleDirective = jasmine.createSpyObj('IgxToggleDirective', ['open', 'close'], { collapsed: true });
            (timePicker as any).toggleRef = mockToggleDirective;
            timePicker.ngOnInit();

            timePicker.open();
            expect(mockToggleDirective.open).toHaveBeenCalledTimes(1);

            (Object.getOwnPropertyDescriptor(mockToggleDirective, 'collapsed')?.get as jasmine.Spy<() => boolean>).and.returnValue(false);
            timePicker.close();
            expect(mockToggleDirective.close).toHaveBeenCalledTimes(1);
        });

        it('should open/close the dropdown with toggle() method', () => {
            timePicker = new IgxTimePickerComponent(elementRef, null, null, null, mockInjector);
            (timePicker as any).dateTimeEditor = mockDateTimeEditorDirective;
            const mockToggleDirective = jasmine.createSpyObj('IgxToggleDirective', ['open', 'close'], { collapsed: true });
            (timePicker as any).toggleRef = mockToggleDirective;
            timePicker.ngOnInit();

            timePicker.toggle();
            expect(mockToggleDirective.open).toHaveBeenCalledTimes(1);

            (Object.getOwnPropertyDescriptor(mockToggleDirective, 'collapsed')?.get as jasmine.Spy<() => boolean>).and.returnValue(false);
            timePicker.toggle();
            expect(mockToggleDirective.close).toHaveBeenCalledTimes(1);
        });

        it('should reset value and emit valueChange with clear() method', () => {
            timePicker = new IgxTimePickerComponent(elementRef, null, null, null, null);
            (timePicker as any).dateTimeEditor = mockDateTimeEditorDirective;
            const mockToggleDirective = jasmine.createSpyObj('IgxToggleDirective', { collapsed: true });
            (timePicker as any).toggleRef = mockToggleDirective;

            const date = new Date(2020, 12, 12, 10, 30, 30);
            timePicker.value = new Date(date);
            date.setHours(0, 0, 0);
            spyOn(timePicker.valueChange, 'emit').and.callThrough();

            timePicker.clear();
            expect(timePicker.value).toEqual(date);
            expect(timePicker.valueChange.emit).toHaveBeenCalled();
            expect(timePicker.valueChange.emit).toHaveBeenCalledWith(date);

            const stringDate = '09:20:00';
            timePicker.value = stringDate;

            timePicker.clear();
            expect(timePicker.value).toBeNull();
            expect(timePicker.valueChange.emit).toHaveBeenCalled();
            expect(timePicker.valueChange.emit).toHaveBeenCalledWith(null);
        });

        it('should not emit valueChange when value is \'00:00:00\' and is cleared', () => {
            timePicker = new IgxTimePickerComponent(elementRef, null, null, null, null);
            (timePicker as any).dateTimeEditor = mockDateTimeEditorDirective;
            const mockToggleDirective = jasmine.createSpyObj('IgxToggleDirective', { collapsed: true });
            (timePicker as any).toggleRef = mockToggleDirective;


            const date = new Date(2020, 12, 12, 0, 0, 0);
            timePicker.value = date;

            spyOn(timePicker.valueChange, 'emit').and.callThrough();

            timePicker.clear();
            expect(timePicker.valueChange.emit).not.toHaveBeenCalled();
        });

        it('should not emit valueChange when value is null and is cleared', () => {
            timePicker = new IgxTimePickerComponent(elementRef, null, null, null, null);
            (timePicker as any).dateTimeEditor = mockDateTimeEditorDirective;
            const mockToggleDirective = jasmine.createSpyObj('IgxToggleDirective', { collapsed: true });
            (timePicker as any).toggleRef = mockToggleDirective;
            timePicker.value = null;

            spyOn(timePicker.valueChange, 'emit').and.callThrough();

            timePicker.clear();
            expect(timePicker.valueChange.emit).not.toHaveBeenCalled();
        });

        it('should select time and trigger valueChange event with select() method', () => {
            timePicker = new IgxTimePickerComponent(elementRef, null, null, null, null);
            (timePicker as any).dateTimeEditor = mockDateTimeEditorDirective;

            const date = new Date(2020, 12, 12, 10, 30, 30);
            timePicker.value = new Date(date);

            const selectedDate = new Date(2020, 12, 12, 6, 45, 0);
            spyOn(timePicker.valueChange, 'emit').and.callThrough();

            timePicker.select(selectedDate);
            expect(timePicker.value).toEqual(selectedDate);
            expect(timePicker.valueChange.emit).toHaveBeenCalled();
            expect(timePicker.valueChange.emit).toHaveBeenCalledWith(selectedDate);
        });

        it('should fire vallidationFailed on selecting time outside min/max range', () => {
            timePicker = new IgxTimePickerComponent(elementRef, null, null, null, null);
            (timePicker as any).dateTimeEditor = mockDateTimeEditorDirective;

            const date = new Date(2020, 12, 12, 10, 30, 30);
            timePicker.value = new Date(date);
            timePicker.minValue = new Date(2020, 12, 12, 6, 0, 0);
            timePicker.maxValue = new Date(2020, 12, 12, 16, 0, 0);
            const selectedDate = new Date(2020, 12, 12, 3, 45, 0);
            const args: IgxTimePickerValidationFailedEventArgs = {
                owner: timePicker,
                previousValue: date
            };
            spyOn(timePicker.validationFailed, 'emit').and.callThrough();

            timePicker.select(selectedDate);
            expect(timePicker.value).toEqual(selectedDate);
            expect(timePicker.validationFailed.emit).toHaveBeenCalled();
            expect(timePicker.validationFailed.emit).toHaveBeenCalledWith(args);
        });

        xit('should change date parts correctly with increment() and decrement() methods', () => {
            timePicker = new IgxTimePickerComponent(elementRef, null, null, null, null);
            (timePicker as any).dateTimeEditor = mockDateTimeEditorDirective;

            const date = new Date(2020, 12, 12, 10, 30, 30);
            timePicker.value = new Date(date);
            timePicker.minValue = new Date(2020, 12, 12, 6, 0, 0);
            timePicker.maxValue = new Date(2020, 12, 12, 16, 0, 0);
            timePicker.itemsDelta = { hour: 2, minute: 20, second: 1 };
            spyOn(timePicker.valueChange, 'emit').and.callThrough();

            timePicker.increment(DatePart.Hours);
            date.setHours(date.getHours() + timePicker.itemsDelta.hour);
            expect(timePicker.value).toEqual(date);
            expect(timePicker.valueChange.emit).toHaveBeenCalled();
            expect(timePicker.valueChange.emit).toHaveBeenCalledWith(date);
        });
    });

    describe('Interaction tests', () => {
        let fixture: ComponentFixture<any>;
        let timePickerElement: any;
        let inputGroup: DebugElement;
        let input: DebugElement;
        let hourColumn: DebugElement;
        let minutesColumn: DebugElement;
        let ampmColumn: DebugElement;
        let toggleDirectiveElement: DebugElement;
        let toggleDirective: IgxToggleDirective;

        describe('Dropdown/dialog mode', () => {
            configureTestSuite();
            beforeAll(waitForAsync(() => {
                TestBed.configureTestingModule({
                    declarations: [
                        IgxTimePickerTestComponent
                    ],
                    imports: [IgxTimePickerModule,
                        IgxInputGroupModule,
                        IgxIconModule,
                        FormsModule,
                        NoopAnimationsModule]
                }).compileComponents();
            }));
            beforeEach(fakeAsync(() => {
                fixture = TestBed.createComponent(IgxTimePickerTestComponent);
                fixture.detectChanges();
                timePicker = fixture.componentInstance.timePicker;
                timePickerElement = fixture.debugElement.query(By.css(CSS_CLASS_TIMEPICKER)).nativeElement;
                inputGroup = fixture.debugElement.query(By.css(`.${CSS_CLASS_INPUTGROUP}`));
                input = fixture.debugElement.query(By.css(`.${CSS_CLASS_INPUT}`));
                hourColumn = fixture.debugElement.query(By.css(CSS_CLASS_HOURLIST));
                toggleDirectiveElement = fixture.debugElement.query(By.directive(IgxToggleDirective));
                toggleDirective = toggleDirectiveElement.injector.get(IgxToggleDirective) as IgxToggleDirective;
            }));
            it('should open/close the dropdown and keep the current selection on toggle icon click', fakeAsync(() => {
                const toggleIcon = fixture.debugElement.query(By.css('igx-prefix'));
                toggleIcon.triggerEventHandler('click', UIInteractions.getMouseEvent('click'));
                fixture.detectChanges();
                expect(toggleDirective.collapsed).toBeFalsy();

                const event = new WheelEvent('wheel', { deltaX: 0, deltaY: -100 });
                hourColumn.triggerEventHandler('wheel', event);
                fixture.detectChanges();

                toggleIcon.triggerEventHandler('click', UIInteractions.getMouseEvent('click'));
                tick();
                fixture.detectChanges();
                expect(toggleDirective.collapsed).toBeTruthy();
                const pickerValue = new Date(fixture.componentInstance.date);
                pickerValue.setHours(pickerValue.getHours() - 1);
                expect(timePicker.value).toEqual(pickerValue);
            }));

            it('should open the dropdown with `ArrowDown` + `Alt` key press and close it on outside click', fakeAsync(() => {
                input.nativeElement.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', altKey: true }));
                tick();
                fixture.detectChanges();
                expect(toggleDirective.collapsed).toBeFalsy();

                const event = new WheelEvent('wheel', { deltaX: 0, deltaY: -100 });
                hourColumn.triggerEventHandler('wheel', event);
                fixture.detectChanges();

                const overlay = document.getElementsByClassName(CSS_CLASS_OVERLAY_WRAPPER)[0];
                UIInteractions.simulateClickEvent(overlay);
                tick();
                fixture.detectChanges();
                expect(toggleDirective.collapsed).toBeTruthy();
                const pickerValue = new Date(fixture.componentInstance.date);
                pickerValue.setHours(pickerValue.getHours() - 1);
                expect(timePicker.value).toEqual(pickerValue);
            }));

            it('should close the dropdown and keep the current selection on outside click in dialog mode', fakeAsync(() => {
                fixture.componentInstance.mode = PickerInteractionMode.Dialog;
                fixture.detectChanges();

                inputGroup.triggerEventHandler('click', UIInteractions.getMouseEvent('click'));
                tick();
                fixture.detectChanges();
                expect(toggleDirective.collapsed).toBeFalsy();

                const event = new WheelEvent('wheel', { deltaX: 0, deltaY: -100 });
                hourColumn.triggerEventHandler('wheel', event);
                fixture.detectChanges();

                const overlay = document.getElementsByClassName(CSS_CLASS_OVERLAY)[0];
                const overlayWrapper = overlay.children[0];
                UIInteractions.simulateClickEvent(overlayWrapper);
                tick();
                fixture.detectChanges();
                expect(toggleDirective.collapsed).toBeTruthy();
                const pickerValue = new Date(fixture.componentInstance.date);
                pickerValue.setHours(pickerValue.getHours() - 1);
                expect(timePicker.value).toEqual(pickerValue);
            }));

            it('should open/close the dropdown and keep the current selection on Space/Enter key press', fakeAsync(() => {
                UIInteractions.triggerKeyDownEvtUponElem(KEYS.SPACE, input.nativeElement, true);
                tick();
                fixture.detectChanges();
                expect(toggleDirective.collapsed).toBeFalsy();

                const event = new WheelEvent('wheel', { deltaX: 0, deltaY: -100 });
                hourColumn.triggerEventHandler('wheel', event);
                fixture.detectChanges();

                UIInteractions.triggerKeyDownEvtUponElem(KEYS.ENTER, hourColumn.nativeElement);
                tick();
                fixture.detectChanges();
                expect(toggleDirective.collapsed).toBeTruthy();
                const pickerValue = new Date(fixture.componentInstance.date);
                pickerValue.setHours(pickerValue.getHours() - 1);
                expect(timePicker.value).toEqual(pickerValue);
            }));

            it('should reset selection to the value when dropdown was opened on Escape key press', fakeAsync(() => {
                fixture.componentInstance.minValue = new Date(2021, 24, 2, 9, 45, 0);
                fixture.componentInstance.maxValue = new Date(2021, 24, 2, 13, 45, 0);
                fixture.detectChanges();

                timePicker.open();
                fixture.detectChanges();
                expect(toggleDirective.collapsed).toBeFalsy();

                const event = new WheelEvent('wheel', { deltaX: 0, deltaY: -100 });
                hourColumn.triggerEventHandler('wheel', event);
                fixture.detectChanges();
                hourColumn.triggerEventHandler('wheel', event);
                fixture.detectChanges(); hourColumn.triggerEventHandler('wheel', event);
                fixture.detectChanges();
                const selectedHour = fixture.componentInstance.date.getHours() - 3;
                expect((timePicker.value as Date).getHours()).toEqual(selectedHour);

                UIInteractions.triggerKeyDownEvtUponElem(KEYS.ESCAPE, input.nativeElement, true);
                tick();
                fixture.detectChanges();
                expect(toggleDirective.collapsed).toBeTruthy();
                expect(timePicker.value).toEqual(fixture.componentInstance.date);
            }));

            it('should not change the current selection and close the dropdown on OK button click', fakeAsync(() => {
                timePicker.open();
                tick();
                fixture.detectChanges();

                const event = new WheelEvent('wheel', { deltaX: 0, deltaY: -100 });
                hourColumn.triggerEventHandler('wheel', event);
                fixture.detectChanges();

                const okButton = fixture.debugElement.queryAll(By.css('button'))[1];
                okButton.triggerEventHandler('click', UIInteractions.getMouseEvent('click'));
                tick();
                fixture.detectChanges();

                expect(toggleDirective.collapsed).toBeTruthy();
                const pickerValue = new Date(fixture.componentInstance.date);
                pickerValue.setHours(pickerValue.getHours() - 1);
                expect(timePicker.value).toEqual(pickerValue);
            }));

            it('should close the dropdown and discard the current selection on Cancel button click', fakeAsync(() => {
                timePicker.open();
                tick();
                fixture.detectChanges();

                const event = new WheelEvent('wheel', { deltaX: 0, deltaY: -100 });
                hourColumn.triggerEventHandler('wheel', event);
                fixture.detectChanges();

                const cancelButton = fixture.debugElement.queryAll(By.css('button'))[0];
                cancelButton.triggerEventHandler('click', UIInteractions.getMouseEvent('click'));
                tick();
                fixture.detectChanges();

                expect(toggleDirective.collapsed).toBeTruthy();
                expect(timePicker.value).toEqual(fixture.componentInstance.date);
            }));

            it('should fire opening/closing event on open/close', fakeAsync(() => {
                spyOn(timePicker.opening, 'emit').and.callThrough();
                spyOn(timePicker.opened, 'emit').and.callThrough();
                spyOn(timePicker.closing, 'emit').and.callThrough();
                spyOn(timePicker.closed, 'emit').and.callThrough();

                timePicker.open();
                tick();
                fixture.detectChanges();
                expect(toggleDirective.collapsed).toBeFalsy();
                expect(timePicker.opening.emit).toHaveBeenCalled();
                expect(timePicker.opened.emit).toHaveBeenCalled();

                timePicker.close();
                tick();
                fixture.detectChanges();
                expect(toggleDirective.collapsed).toBeTruthy();
                expect(timePicker.closing.emit).toHaveBeenCalled();
                expect(timePicker.closed.emit).toHaveBeenCalled();
            }));

            it('should be able to cancel opening/closing events', fakeAsync(() => {
                spyOn(timePicker.opening, 'emit').and.callThrough();
                spyOn(timePicker.opened, 'emit').and.callThrough();
                spyOn(timePicker.closing, 'emit').and.callThrough();
                spyOn(timePicker.closed, 'emit').and.callThrough();

                const openingSub = timePicker.opening.subscribe((event) => event.cancel = true);

                timePicker.open();
                tick();
                fixture.detectChanges();
                expect(toggleDirective.collapsed).toBeTruthy();
                expect(timePicker.opening.emit).toHaveBeenCalled();
                expect(timePicker.opened.emit).not.toHaveBeenCalled();

                openingSub.unsubscribe();

                const closingSub = timePicker.closing.subscribe((event) => event.cancel = true);

                timePicker.open();
                tick();
                fixture.detectChanges();

                timePicker.close();
                tick();
                fixture.detectChanges();
                expect(toggleDirective.collapsed).toBeFalsy();
                expect(timePicker.closing.emit).toHaveBeenCalled();
                expect(timePicker.closed.emit).not.toHaveBeenCalled();

                closingSub.unsubscribe();
            }));

            it('should change date parts correctly with increment() and decrement() methods', () => {
                const date = new Date(2020, 12, 12, 10, 30, 30);
                timePicker.value = new Date(date);
                timePicker.minValue = new Date(2020, 12, 12, 6, 0, 0);
                timePicker.maxValue = new Date(2020, 12, 12, 16, 0, 0);
                timePicker.itemsDelta = { hour: 2, minute: 20, second: 15 };
                fixture.detectChanges();
                spyOn(timePicker.valueChange, 'emit').and.callThrough();

                timePicker.increment(DatePart.Hours);
                date.setHours(date.getHours() + timePicker.itemsDelta.hour);
                expect(timePicker.value).toEqual(date);
                expect(timePicker.valueChange.emit).toHaveBeenCalledTimes(1);
                expect(timePicker.valueChange.emit).toHaveBeenCalledWith(date);

                timePicker.increment(DatePart.Minutes);
                date.setMinutes(date.getMinutes() + timePicker.itemsDelta.minute);
                expect(timePicker.value).toEqual(date);
                expect(timePicker.valueChange.emit).toHaveBeenCalledTimes(2);
                expect(timePicker.valueChange.emit).toHaveBeenCalledWith(date);

                timePicker.decrement(DatePart.Seconds);
                date.setSeconds(date.getSeconds() - timePicker.itemsDelta.second);
                expect(timePicker.value).toEqual(date);
                expect(timePicker.valueChange.emit).toHaveBeenCalledTimes(3);
                expect(timePicker.valueChange.emit).toHaveBeenCalledWith(date);
            });
        });

        describe('Renedering tests', () => {
            configureTestSuite();
            beforeAll(waitForAsync(() => {
                TestBed.configureTestingModule({
                    declarations: [
                        IgxTimePickerTestComponent
                    ],
                    imports: [IgxTimePickerModule,
                        IgxInputGroupModule,
                        IgxIconModule,
                        NoopAnimationsModule]
                }).compileComponents();
            }));
            beforeEach(fakeAsync(() => {
                fixture = TestBed.createComponent(IgxTimePickerTestComponent);
                fixture.detectChanges();
                timePicker = fixture.componentInstance.timePicker;
                // timePickerElement = fixture.debugElement.query(By.css(CSS_CLASS_TIMEPICKER)).nativeElement;
                inputGroup = fixture.debugElement.query(By.css(`.${CSS_CLASS_INPUTGROUP}`));
                hourColumn = fixture.debugElement.query(By.css(CSS_CLASS_HOURLIST));
                minutesColumn = fixture.debugElement.query(By.css(CSS_CLASS_MINUTELIST));
                ampmColumn = fixture.debugElement.query(By.css(CSS_CLASS_AMPMLIST));
                toggleDirectiveElement = fixture.debugElement.query(By.directive(IgxToggleDirective));
                toggleDirective = toggleDirectiveElement.injector.get(IgxToggleDirective) as IgxToggleDirective;
            }));

            it('should initialize all input properties with their default values', () => {
                expect(timePicker.mode).toEqual(PickerInteractionMode.DropDown);
                expect(timePicker.inputFormat).toEqual(DateTimeUtil.DEFAULT_TIME_INPUT_FORMAT);
                expect(timePicker.itemsDelta.hour).toEqual(1);
                expect(timePicker.itemsDelta.minute).toEqual(1);
                expect(timePicker.itemsDelta.second).toEqual(1);
                expect(timePicker.disabled).toEqual(false);
            });

            it('should be able to change the mode at runtime', fakeAsync(() => {
                fixture.componentInstance.timePicker.mode = PickerInteractionMode.DropDown;
                fixture.detectChanges();

                timePicker.open();
                tick();
                fixture.detectChanges();

                let dropdown = fixture.debugElement.query(By.css(CSS_CLASS_DROPDOWN));
                expect(dropdown).toBeDefined();

                timePicker.close();
                tick();
                fixture.detectChanges();

                fixture.componentInstance.timePicker.mode = PickerInteractionMode.Dialog;
                fixture.detectChanges();

                timePicker.open();
                tick();
                fixture.detectChanges();

                dropdown = fixture.debugElement.query(By.css(CSS_CLASS_DROPDOWN));
                expect(dropdown).toBeNull();
            }));

            it('should apply disabled class when component is disabled', () => {
                fixture.componentInstance.timePicker.disabled = true;
                fixture.detectChanges();

                expect(inputGroup.classes[CSS_CLASS_INPUTGROUP_DISABLED]).toEqual(true);

                fixture.componentInstance.timePicker.disabled = false;
                fixture.detectChanges();

                expect(inputGroup.classes[CSS_CLASS_INPUTGROUP_DISABLED]).toBeUndefined();
            });

            it('should highlight selected time', fakeAsync(() => {
                fixture.componentInstance.timePicker.mode = PickerInteractionMode.DropDown;
                fixture.detectChanges();

                timePicker.open();
                tick();
                fixture.detectChanges();

                const selectedItems = fixture.debugElement.queryAll(By.css(CSS_CLASS_SELECTED_ITEM));
                const selectedHour = selectedItems[0].nativeElement.innerText;
                const selectedMinutes = selectedItems[1].nativeElement.innerText;
                const selectedAMPM = selectedItems[2].nativeElement.innerText;

                const hours = fixture.componentInstance.date.getHours();
                const minutes = fixture.componentInstance.date.getMinutes();
                const ampm = hours >= 12 ? 'PM' : 'AM';

                expect(selectedHour).toEqual(hours.toString());
                expect(selectedMinutes).toEqual(minutes.toString());
                expect(selectedAMPM).toEqual(ampm);
            }));


            it('should display selected time in dialog header', fakeAsync(() => {
                fixture.componentInstance.timePicker.mode = PickerInteractionMode.Dialog;
                fixture.detectChanges();

                timePicker.open();
                tick();
                fixture.detectChanges();

                const hourHeader = fixture.debugElement.query(By.css(CSS_CLASS_HEADER_HOUR));
                const selectedTime = hourHeader.children[0].nativeElement.innerText;


                const hours = fixture.componentInstance.date.getHours().toString();
                const minutes = fixture.componentInstance.date.getMinutes().toString();
                const ampm = hours >= 12 ? 'PM' : 'AM';

                expect(selectedTime).toEqual(`${hours}:${minutes} ${ampm}`);
            }));

            it('should apply all aria attributes correctly', fakeAsync(() => {
                const inputEl = fixture.nativeElement.querySelector(CSS_CLASS_INPUT);
                expect(inputEl.getAttribute('role')).toEqual('combobox');
                expect(inputEl.getAttribute('aria-haspopup')).toEqual('dialog');
                expect(inputEl.getAttribute('aria-labelledby')).toEqual(timePicker.label.id);
                expect(inputEl.getAttribute('aria-expanded')).toEqual('false');

                timePicker.open();
                tick();
                fixture.detectChanges();
                expect(inputEl.getAttribute('aria-expanded')).toEqual('true');

                let hour = 8;
                let minutes = 42;
                let ampm = 0;
                hourColumn.children.forEach((el) => {
                    expect(el.attributes.role).toEqual('spinbutton');
                    const hours = hour < 10 ? `0${hour}` : `${hour}`;
                    expect(el.attributes['ariaLabel']).toEqual(hours);
                    hour++;
                });
                minutesColumn.children.forEach((el) => {
                    expect(el.attributes.role).toEqual('spinbutton');
                    expect(el.attributes['ariaLabel']).toEqual(`${minutes}`);
                    minutes++;
                });
                ampmColumn.children.forEach((el) => {
                    expect(el.attributes.role).toEqual('spinbutton');
                    const ampmLabel = ampm === 3 ? 'AM' : ampm === 4 ? 'PM' : null;
                    expect(el.attributes['ariaLabel']).toEqual(ampmLabel);
                    ampm++;
                });

                timePicker.close();
                tick();
                fixture.detectChanges();
                expect(inputEl.getAttribute('aria-expanded')).toEqual('false');
            }));
        });
    });
});

@Component({
    template: `
        <igx-time-picker #picker [value]="date" [mode]="mode" [minValue]="minValue" [maxValue]="maxValue">
        <label igxLabel>Select time</label>
        </igx-time-picker>
    `
})
export class IgxTimePickerTestComponent {
    @ViewChild('picker', { read: IgxTimePickerComponent, static: true })
    public timePicker: IgxTimePickerComponent;
    public mode: PickerInteractionMode = PickerInteractionMode.DropDown;
    public date = new Date(2021, 24, 2, 11, 45, 0);
    public minValue;
    public maxValue;
}
