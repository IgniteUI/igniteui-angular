import { ComponentFixture, fakeAsync, TestBed, tick, waitForAsync } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { UIInteractions } from '../test-utils/ui-interactions.spec';
import {
    IgxHintDirective, IgxInputGroupComponent, IgxInputGroupModule, IgxInputState, IgxLabelDirective, IgxPrefixDirective, IgxSuffixDirective
} from '../input-group/public_api';
import { IgxTextSelectionModule } from '../directives/text-selection/text-selection.directive';
import { configureTestSuite } from '../test-utils/configure-suite';
import { IgxButtonModule } from '../directives/button/button.directive';
import { IFormattingViews, IgxCalendarComponent, IgxCalendarModule } from '../calendar/public_api';
import { IgxIconModule } from '../icon/public_api';
import { IgxCalendarContainerComponent, IgxCalendarContainerModule } from '../date-common/calendar-container/calendar-container.component';
import { IgxDatePickerComponent } from './date-picker.component';
import { IgxDatePickerModule } from './date-picker.module';
import {
    IgxOverlayService,
    OverlayCancelableEventArgs, OverlayClosingEventArgs, OverlayEventArgs, OverlaySettings
} from '../services/public_api';
import { Component, ElementRef, EventEmitter, QueryList, Renderer2, ViewChild } from '@angular/core';
import { By } from '@angular/platform-browser';
import { PickerHeaderOrientation, PickerInteractionMode } from '../date-common/types';
import { DatePart } from '../directives/date-time-editor/date-time-editor.common';
import { DisplayDensity } from '../core/displayDensity';
import { DateRangeDescriptor, DateRangeType } from '../core/dates';
import { IgxOverlayOutletDirective } from '../directives/toggle/toggle.directive';
import { IgxPickerClearComponent, IgxPickerToggleComponent } from '../date-common/public_api';
import { DateTimeUtil } from '../date-common/util/date-time.util';

const CSS_CLASS_CALENDAR = 'igx-calendar';
const CSS_CLASS_DATE_PICKER = 'igx-date-picker';

const DATE_PICKER_TOGGLE_ICON = 'today';
const DATE_PICKER_CLEAR_ICON = 'clear';


describe('IgxDatePicker', () => {

    describe('Integration tests', () => {
        configureTestSuite();
        beforeAll(waitForAsync(() => {
            TestBed.configureTestingModule({
                declarations: [
                    IgxDatePickerTestKbrdComponent,
                    IgxDatePickerTestComponent,
                    IgxDatePickerNgModelComponent,
                    IgxDatePickerWithProjectionsComponent
                ],
                imports: [IgxDatePickerModule, FormsModule, ReactiveFormsModule,
                    NoopAnimationsModule, IgxInputGroupModule, IgxCalendarModule,
                    IgxButtonModule, IgxTextSelectionModule, IgxIconModule,
                    IgxCalendarContainerModule]
            })
                .compileComponents();
        }));

        describe('Rendering', () => {
            let fixture: ComponentFixture<IgxDatePickerTestComponent>;
            beforeEach(fakeAsync(() => {
                fixture = TestBed.createComponent(IgxDatePickerTestComponent);
                fixture.detectChanges();
            }));

            it('Should render default toggle and clear icons', () => {
                fixture = TestBed.createComponent(IgxDatePickerTestComponent);
                fixture.detectChanges();
                const inputGroup = fixture.debugElement.query(By.directive(IgxInputGroupComponent));
                const prefix = inputGroup.queryAll(By.directive(IgxPrefixDirective));
                expect(prefix).toHaveSize(1);
                expect(prefix[0].nativeElement.innerText).toEqual(DATE_PICKER_TOGGLE_ICON);
                const suffix = inputGroup.queryAll(By.directive(IgxSuffixDirective));
                expect(suffix).toHaveSize(1);
                expect(suffix[0].nativeElement.innerText).toEqual(DATE_PICKER_CLEAR_ICON);
            });
        });

        describe('Events', () => {
            let fixture: ComponentFixture<any>;
            let datePicker: IgxDatePickerComponent;

            beforeEach(fakeAsync(() => {
                fixture = TestBed.createComponent(IgxDatePickerTestComponent);
                fixture.detectChanges();
                datePicker = fixture.componentInstance.datePicker;
            }));

            it('should be able to cancel opening/closing', fakeAsync(() => {
                spyOn(datePicker.opening, 'emit').and.callThrough();
                spyOn(datePicker.opened, 'emit').and.callThrough();
                spyOn(datePicker.closing, 'emit').and.callThrough();
                spyOn(datePicker.closed, 'emit').and.callThrough();

                const openingSub = datePicker.opening.subscribe((event) => event.cancel = true);

                datePicker.open();
                // wait for calendar animation.done timeout
                tick(350);
                fixture.detectChanges();
                expect(datePicker.collapsed).toBeTruthy();
                expect(datePicker.opening.emit).toHaveBeenCalled();
                expect(datePicker.opened.emit).not.toHaveBeenCalled();

                openingSub.unsubscribe();

                const closingSub = datePicker.closing.subscribe((event) => event.cancel = true);

                datePicker.open();
                // wait for calendar animation.done timeout
                tick(350);
                fixture.detectChanges();

                datePicker.close();
                tick();
                fixture.detectChanges();
                expect(datePicker.collapsed).toBeFalsy();
                expect(datePicker.closing.emit).toHaveBeenCalled();
                expect(datePicker.closed.emit).not.toHaveBeenCalled();

                closingSub.unsubscribe();
            }));
        });

        describe('Keyboard navigation', () => {
            let fixture: ComponentFixture<any>;
            let datePicker: IgxDatePickerComponent;
            let calendar;

            beforeEach(fakeAsync(() => {
                fixture = TestBed.createComponent(IgxDatePickerTestKbrdComponent);
                fixture.detectChanges();
                datePicker = fixture.componentInstance.datePicker;
                calendar = fixture.componentInstance.datePicker.calendar;
            }));

            it('should toggle the calendar with ALT + DOWN/UP ARROW key', fakeAsync(() => {
                spyOn(datePicker.opening, 'emit').and.callThrough();
                spyOn(datePicker.opened, 'emit').and.callThrough();
                spyOn(datePicker.closing, 'emit').and.callThrough();
                spyOn(datePicker.closed, 'emit').and.callThrough();
                expect(datePicker.collapsed).toBeTruthy();

                const picker = fixture.debugElement.query(By.css(CSS_CLASS_DATE_PICKER));
                UIInteractions.triggerEventHandlerKeyDown('ArrowDown', picker, true);

                tick();
                fixture.detectChanges();

                expect(datePicker.collapsed).toBeFalsy();
                expect(datePicker.opening.emit).toHaveBeenCalledTimes(1);
                expect(datePicker.opened.emit).toHaveBeenCalledTimes(1);

                calendar = document.getElementsByClassName(CSS_CLASS_CALENDAR)[0];
                UIInteractions.triggerKeyDownEvtUponElem('ArrowUp', calendar, true, true);
                tick(350);
                fixture.detectChanges();
                expect(datePicker.collapsed).toBeTruthy();
                expect(datePicker.closing.emit).toHaveBeenCalledTimes(1);
                expect(datePicker.closed.emit).toHaveBeenCalledTimes(1);
            }));

            it('should open the calendar with SPACE key', fakeAsync(() => {
                spyOn(datePicker.opening, 'emit').and.callThrough();
                spyOn(datePicker.opened, 'emit').and.callThrough();
                expect(datePicker.collapsed).toBeTruthy();

                const picker = fixture.debugElement.query(By.css(CSS_CLASS_DATE_PICKER));
                UIInteractions.triggerEventHandlerKeyDown(' ', picker);

                tick(350);
                fixture.detectChanges();

                expect(datePicker.collapsed).toBeFalsy();
                expect(datePicker.opening.emit).toHaveBeenCalledTimes(1);
                expect(datePicker.opened.emit).toHaveBeenCalledTimes(1);
            }));

            it('should close the calendar with ESC', fakeAsync(() => {
                spyOn(datePicker.closing, 'emit').and.callThrough();
                spyOn(datePicker.closed, 'emit').and.callThrough();

                expect(datePicker.collapsed).toBeTruthy();
                datePicker.open();
                tick();
                fixture.detectChanges();
                expect(datePicker.collapsed).toBeFalsy();

                calendar = document.getElementsByClassName(CSS_CLASS_CALENDAR)[0];
                UIInteractions.triggerKeyDownEvtUponElem('Escape', calendar, true);
                tick(350);
                fixture.detectChanges();
                expect(datePicker.collapsed).toBeTruthy();
                expect(datePicker.closing.emit).toHaveBeenCalledTimes(1);
                expect(datePicker.closed.emit).toHaveBeenCalledTimes(1);
            }));
        });

        describe('NgControl integration', () => {
            let fixture: ComponentFixture<IgxDatePickerNgModelComponent>;
            let datePicker: IgxDatePickerComponent;

            beforeEach(fakeAsync(() => {
                fixture = TestBed.createComponent(IgxDatePickerNgModelComponent);
                fixture.detectChanges();
                datePicker = fixture.componentInstance.datePicker;
            }));

            it('should initialize date picker with required correctly', () => {
                const inputGroup = (datePicker as any).inputGroup;

                expect(datePicker).toBeDefined();
                expect(inputGroup.isRequired).toBeTruthy();
            });

            it('should update inputGroup isRequired correctly', () => {
                const inputGroup = (datePicker as any).inputGroup;

                expect(datePicker).toBeDefined();
                expect(inputGroup.isRequired).toBeTruthy();

                fixture.componentInstance.isRequired = false;
                fixture.detectChanges();

                expect(inputGroup.isRequired).toBeFalsy();
            });
        });

        describe('Projected elements', () => {
            let fixture: ComponentFixture<IgxDatePickerWithProjectionsComponent>;
            beforeEach(fakeAsync(() => {
                fixture = TestBed.createComponent(IgxDatePickerWithProjectionsComponent);
                fixture.detectChanges();
            }));

            it('Should project label/hint and additional prefix/suffix in the correct location', () => {
                fixture.componentInstance.datePicker.value = new Date();
                fixture.detectChanges();
                const inputGroup = fixture.debugElement.query(By.directive(IgxInputGroupComponent));

                const label = inputGroup.queryAll(By.directive(IgxLabelDirective));
                expect(label).toHaveSize(1);
                expect(label[0].nativeElement.innerText).toEqual('Label');
                const hint = inputGroup.queryAll(By.directive(IgxHintDirective));
                expect(hint).toHaveSize(1);
                expect(hint[0].nativeElement.innerText).toEqual('Hint');

                const prefix = inputGroup.queryAll(By.directive(IgxPrefixDirective));
                expect(prefix).toHaveSize(2);
                expect(prefix[0].nativeElement.innerText).toEqual(DATE_PICKER_TOGGLE_ICON);
                expect(prefix[1].nativeElement.innerText).toEqual('Prefix');
                const suffix = inputGroup.queryAll(By.directive(IgxSuffixDirective));
                expect(suffix).toHaveSize(2);
                expect(suffix[0].nativeElement.innerText).toEqual(DATE_PICKER_CLEAR_ICON);
                expect(suffix[1].nativeElement.innerText).toEqual('Suffix');
            });

            it('Should project custom toggle/clear and hide defaults', () => {
                fixture.componentInstance.datePicker.value = new Date();
                fixture.componentInstance.showCustomClear = true;
                fixture.componentInstance.showCustomToggle = true;
                fixture.detectChanges();
                const inputGroup = fixture.debugElement.query(By.directive(IgxInputGroupComponent));

                const prefix = inputGroup.queryAll(By.directive(IgxPrefixDirective));
                expect(prefix).toHaveSize(2);
                expect(prefix[0].nativeElement.innerText).toEqual('CustomToggle');
                expect(prefix[1].nativeElement.innerText).toEqual('Prefix');
                const suffix = inputGroup.queryAll(By.directive(IgxSuffixDirective));
                expect(suffix).toHaveSize(2);
                expect(suffix[0].nativeElement.innerText).toEqual('CustomClear');
                expect(suffix[1].nativeElement.innerText).toEqual('Suffix');
            });

            it('Should correctly sub/unsub to custom toggle and clear', () => {
                const datePicker = fixture.componentInstance.datePicker;
                datePicker.value = new Date();
                fixture.componentInstance.showCustomClear = true;
                fixture.componentInstance.showCustomToggle = true;
                fixture.detectChanges();
                spyOn(datePicker, 'open');
                spyOn(datePicker, 'clear');

                const inputGroup = fixture.debugElement.query(By.directive(IgxInputGroupComponent));
                const toggleElem = inputGroup.query(By.directive(IgxPickerToggleComponent));
                const clearElem = inputGroup.query(By.directive(IgxPickerClearComponent));
                let toggle = fixture.componentInstance.customToggle;
                let clear = fixture.componentInstance.customClear;

                expect(toggle.clicked.observers).toHaveSize(1);
                expect(clear.clicked.observers).toHaveSize(1);
                const event = jasmine.createSpyObj('event', ['stopPropagation']);
                toggleElem.triggerEventHandler('click', event);
                expect(datePicker.open).toHaveBeenCalledTimes(1);
                clearElem.triggerEventHandler('click', event);
                expect(datePicker.clear).toHaveBeenCalledTimes(1);

                // hide
                fixture.componentInstance.showCustomToggle = false;
                fixture.detectChanges();
                expect(toggle.clicked.observers).toHaveSize(0);
                expect(clear.clicked.observers).toHaveSize(1);
                fixture.componentInstance.showCustomClear = false;
                fixture.detectChanges();
                expect(toggle.clicked.observers).toHaveSize(0);
                expect(clear.clicked.observers).toHaveSize(0);

                // show again
                fixture.componentInstance.showCustomClear = true;
                fixture.componentInstance.showCustomToggle = true;
                fixture.detectChanges();
                toggle = fixture.componentInstance.customToggle;
                clear = fixture.componentInstance.customClear;
                expect(toggle.clicked.observers).toHaveSize(1);
                expect(clear.clicked.observers).toHaveSize(1);

                datePicker.ngOnDestroy();
                expect(toggle.clicked.observers).toHaveSize(0);
                expect(clear.clicked.observers).toHaveSize(0);
            });
        });
    });

    describe('Unit Tests', () => {
        let overlay: IgxOverlayService;
        let mockOverlayEventArgs: OverlayEventArgs & OverlayCancelableEventArgs;
        let mockInjector;
        let mockInputGroup: Partial<IgxInputGroupComponent>;
        let datePicker: IgxDatePickerComponent;
        let mockDateEditor: any;
        let mockCalendar: Partial<IgxCalendarComponent>;
        let mockInputDirective: any;
        const mockModuleRef = {} as any;
        const mockOverlayId = '1';
        const today = new Date();
        const elementRef = {
            nativeElement: jasmine.createSpyObj<HTMLElement>('mockElement', ['blur', 'click', 'focus'])
        };
        let mockNgControl: any;
        let mockControlInstance: any;
        let renderer2: Renderer2;
        beforeEach(() => {
            renderer2 = jasmine.createSpyObj('Renderer2', ['setAttribute'], [{}, 'aria-labelledby', 'test-label-id-1']);
            mockControlInstance = {
                _touched: false,
                get touched() {
                    return this._touched;
                },
                set touched(val: boolean) {
                    this._touched = val;
                },
                _dirty: false,
                get dirty() {
                    return this._dirty;
                },
                set dirty(val: boolean) {
                    this._dirty = val;
                },
                _asyncValidator: () => { },
                get asyncValidator() {
                    return this._asyncValidator;
                },
                set asyncValidator(val: () => boolean) {
                    this._asyncValidator = val;
                },
                _validator: () => { },
                get validator() {
                    return this._validator;
                },
                set validator(val: () => boolean) {
                    this._validator = val;
                }
            };
            mockNgControl = {
                registerOnChangeCb: () => { },
                registerOnTouchedCb: () => { },
                registerOnValidatorChangeCb: () => { },
                statusChanges: new EventEmitter(),
                _control: mockControlInstance,
                get control() {
                    return this._control;
                },
                set control(val: any) {
                    this._control = val;
                },
                valid: true
            };
            mockInjector = jasmine.createSpyObj('Injector', {
                get: mockNgControl
            });

            mockCalendar = { selected: new EventEmitter<any>() };
            const mockComponentInstance = {
                calendar: mockCalendar,
                todaySelection: new EventEmitter<any>(),
                calendarClose: new EventEmitter<any>()
            };
            const mockComponentRef = {
                instance: mockComponentInstance
            } as any;
            mockOverlayEventArgs = {
                id: mockOverlayId,
                componentRef: mockComponentRef,
                cancel: false
            };
            overlay = {
                onOpening: new EventEmitter<OverlayCancelableEventArgs>(),
                onOpened: new EventEmitter<OverlayEventArgs>(),
                onClosed: new EventEmitter<OverlayEventArgs>(),
                onClosing: new EventEmitter<OverlayClosingEventArgs>(),
                show(..._args) {
                    this.onOpening.emit(Object.assign({}, mockOverlayEventArgs, { cancel: false }));
                    this.onOpened.emit(mockOverlayEventArgs);
                },
                hide(..._args) {
                    this.onClosing.emit(Object.assign({}, mockOverlayEventArgs, { cancel: false }));
                    this.onClosed.emit(mockOverlayEventArgs);
                },
                detach: (..._args) => { },
                attach: (..._args) => mockOverlayId
            } as any;
            mockDateEditor = {
                _value: null,
                get value() {
                    return this._value;
                },
                clear() {
                    this.valueChange.emit(null);
                },
                set value(val: any) {
                    this._value = val;
                },
                valueChange: new EventEmitter<any>(),
                validationFailed: new EventEmitter<any>()
            };
            mockInputGroup = {
                _isFocused: false,
                get isFocused() {
                    return this._isFocused;
                },
                set isFocused(val: boolean) {
                    this._isFocused = val;
                },
                _isRequired: false,
                get isRequired() {
                    return this._isRequired;
                },
                set isRequired(val: boolean) {
                    this._isRequired = val;
                },
                element: {
                    nativeElement: jasmine.createSpyObj('mockElement',
                        ['focus', 'blur', 'click', 'addEventListener', 'removeEventListener'])
                }
            } as any;
            mockInputDirective = {
                valid: 'mock',
                nativeElement: {
                    _listeners: {
                        none: []
                    },
                    addEventListener(event: string, cb: () => void) {
                        let target = this._listeners[event];
                        if (!target) {
                            this._listeners[event] = [];
                            target = this._listeners[event];
                        }
                        target.push(cb);
                    },
                    removeEventListener(event: string, cb: () => void) {
                        const target = this._listeners[event];
                        if (!target) {
                            return;
                        }
                        const index = target.indexOf(cb);
                        if (index !== -1) {
                            target.splice(index, 1);
                        }
                    },
                    dispatchEvent(event: string) {
                        const target = this._listeners[event];
                        if (!target) {
                            return;
                        }
                        target.forEach(e => {
                            e();
                        });
                    },
                    focus() {
                        this.dispatchEvent('focus');
                    },
                    click() {
                        this.dispatchEvent('click');
                    },
                    blur() {
                        this.dispatchEvent('blur');
                    }
                },
                focus: () => {}
            };
            datePicker = new IgxDatePickerComponent(elementRef, null, overlay, mockModuleRef, mockInjector, renderer2, null);
            (datePicker as any).inputGroup = mockInputGroup;
            (datePicker as any).inputDirective = mockInputDirective;
            (datePicker as any).dateTimeEditor = mockDateEditor;
            // TODO: TEMP workaround for afterViewInit call in unit tests:
            datePicker.clearComponents = new QueryList<any>();
            datePicker.toggleComponents = new QueryList<any>();
        });

        afterEach(() => {
            datePicker?.ngOnDestroy();
            UIInteractions.clearOverlay();
        });
        describe('API tests', () => {
            it('Should initialize and update all inputs properly', () => {
                // no ngControl initialized
                expect(datePicker.required).toEqual(false);
                datePicker.ngOnInit();
                datePicker.ngAfterViewInit();
                expect(datePicker.collapsed).toBeTruthy();
                expect(datePicker.disabled).toBeFalsy();
                expect(datePicker.disabledDates).toEqual(null);
                expect(datePicker.displayDensity).toEqual(DisplayDensity.comfortable);
                expect(datePicker.displayFormat).toEqual(undefined);
                expect(datePicker.calendarFormat).toEqual(undefined);
                expect(datePicker.displayMonthsCount).toEqual(1);
                expect(datePicker.formatViews).toEqual(undefined);
                expect(datePicker.headerOrientation).toEqual(PickerHeaderOrientation.Horizontal);
                expect(datePicker.hideOutsideDays).toEqual(undefined);
                expect(datePicker.inputFormat).toEqual(undefined);
                expect(datePicker.mode).toEqual(PickerInteractionMode.DropDown);
                expect(datePicker.isDropdown).toEqual(true);
                expect(datePicker.minValue).toEqual(undefined);
                expect(datePicker.maxValue).toEqual(undefined);
                expect(datePicker.outlet).toEqual(undefined);
                expect(datePicker.specialDates).toEqual(null);
                expect(datePicker.spinDelta).toEqual(undefined);
                expect(datePicker.spinLoop).toEqual(true);
                expect(datePicker.tabIndex).toEqual(undefined);
                expect(datePicker.overlaySettings).toEqual(undefined);
                expect(datePicker.locale).toEqual(null);
                expect(datePicker.placeholder).toEqual('');
                expect(datePicker.readOnly).toEqual(false);
                expect(datePicker.value).toEqual(undefined);
                expect(datePicker.formatter).toEqual(undefined);
                expect(() => datePicker.displayValue.transform(today)).toThrow();
                // set
                datePicker.open();
                overlay.onOpened.emit(mockOverlayEventArgs);
                expect(datePicker.collapsed).toBeFalsy();
                datePicker.disabled = true;
                expect(datePicker.disabled).toBeTruthy();
                datePicker.disabled = false;
                datePicker.setDisabledState(true);
                expect(datePicker.disabled).toBeTruthy();
                datePicker.disabled = false;
                const mockDisabledDates: DateRangeDescriptor[] = [{ type: DateRangeType.Weekdays },
                { type: DateRangeType.Before, dateRange: [today] }];
                datePicker.disabledDates = mockDisabledDates;
                expect(datePicker.disabledDates).toEqual(mockDisabledDates);
                spyOn(datePicker.onDensityChanged, 'emit').and.callThrough();
                datePicker.displayDensity = DisplayDensity.cosy;
                expect(datePicker.displayDensity).toEqual(DisplayDensity.cosy);
                // if no base token is provided, _displayDensity is undefined
                // first emit of below event will always be w/ oldDensity === undefined
                expect(datePicker.onDensityChanged.emit)
                    .toHaveBeenCalledWith({
                        oldDensity: undefined,
                        newDensity: DisplayDensity.cosy
                    });
                datePicker.displayFormat = 'MM/yy/DD';
                expect(datePicker.displayFormat).toEqual('MM/yy/DD');
                datePicker.displayMonthsCount = Infinity;
                expect(datePicker.displayMonthsCount).toEqual(Infinity);
                datePicker.displayMonthsCount = 0;
                expect(datePicker.displayMonthsCount).toEqual(0);
                datePicker.displayMonthsCount = 12;
                expect(datePicker.displayMonthsCount).toEqual(12);
                let newFormat: any = { day: 'short' };
                datePicker.calendarFormat = newFormat;
                // this SHOULD NOT mutate the underlying base settings
                expect((datePicker as any).pickerCalendarFormat).toEqual({
                    day: 'short',
                    month: 'short',
                    weekday: 'short',
                    year: 'numeric'
                });
                newFormat = { month: 'numeric' };
                datePicker.calendarFormat = newFormat;
                expect((datePicker as any).pickerCalendarFormat).toEqual({
                    day: 'numeric',
                    month: 'numeric',
                    weekday: 'short',
                    year: 'numeric'
                });
                datePicker.formatViews = null;
                expect((datePicker as any).pickerFormatViews).toEqual({ day: false, month: true, year: false });
                const formatViewVal: IFormattingViews = {};
                datePicker.formatViews = formatViewVal;
                expect((datePicker as any).pickerFormatViews).toEqual({ day: false, month: true, year: false });
                formatViewVal.day = true;
                datePicker.formatViews = formatViewVal;
                expect((datePicker as any).pickerFormatViews).toEqual({ day: true, month: true, year: false });
                formatViewVal.year = true;
                datePicker.formatViews = formatViewVal;
                expect((datePicker as any).pickerFormatViews).toEqual({ day: true, month: true, year: true });
                formatViewVal.month = false;
                datePicker.formatViews = formatViewVal;
                expect((datePicker as any).pickerFormatViews).toEqual({ day: true, month: false, year: true });
                datePicker.headerOrientation = PickerHeaderOrientation.Vertical;
                expect(datePicker.headerOrientation).toEqual(PickerHeaderOrientation.Vertical);
                datePicker.hideOutsideDays = false;
                expect(datePicker.hideOutsideDays).toEqual(false);
                datePicker.hideOutsideDays = true;
                expect(datePicker.hideOutsideDays).toEqual(true);
                datePicker.inputFormat = 'dd/MM/YY';
                expect(datePicker.inputFormat).toEqual('dd/MM/YY');
                datePicker.mode = PickerInteractionMode.Dialog;
                expect(datePicker.mode).toEqual(PickerInteractionMode.Dialog);
                expect(datePicker.isDropdown).toEqual(false);
                datePicker.minValue = 'Test';
                expect(datePicker.minValue).toEqual('Test');
                datePicker.minValue = today;
                expect(datePicker.minValue).toEqual(today);
                datePicker.minValue = '12/12/1998';
                expect(datePicker.minValue).toEqual('12/12/1998');
                datePicker.maxValue = 'Test';
                expect(datePicker.maxValue).toEqual('Test');
                datePicker.maxValue = today;
                expect(datePicker.maxValue).toEqual(today);
                datePicker.maxValue = '12/12/1998';
                expect(datePicker.maxValue).toEqual('12/12/1998');
                datePicker.outlet = null;
                expect(datePicker.outlet).toEqual(null);
                const mockEl: ElementRef = jasmine.createSpyObj<ElementRef>('mockEl', ['nativeElement']);
                datePicker.outlet = mockEl;
                expect(datePicker.outlet).toEqual(mockEl);
                const mockOverlayDirective: IgxOverlayOutletDirective =
                    jasmine.createSpyObj<IgxOverlayOutletDirective>('mockEl', ['nativeElement']);
                datePicker.outlet = mockOverlayDirective;
                expect(datePicker.outlet).toEqual(mockOverlayDirective);
                const specialDates: DateRangeDescriptor[] = [{ type: DateRangeType.Weekdays },
                { type: DateRangeType.Before, dateRange: [today] }];
                datePicker.specialDates = specialDates;
                expect(datePicker.specialDates).toEqual(specialDates);
                const spinDeltaSettings = { date: Infinity, month: Infinity };
                datePicker.spinDelta = spinDeltaSettings;
                expect(datePicker.spinDelta).toEqual(spinDeltaSettings);
                datePicker.spinLoop = false;
                expect(datePicker.spinLoop).toEqual(false);
                datePicker.tabIndex = 0;
                expect(datePicker.tabIndex).toEqual(0);
                datePicker.tabIndex = -1;
                expect(datePicker.tabIndex).toEqual(-1);
                const customSettings: OverlaySettings = {
                    modal: true,
                    closeOnEscape: true
                };
                datePicker.overlaySettings = customSettings;
                expect(datePicker.overlaySettings).toEqual(customSettings);
                datePicker.locale = 'ES';
                expect(datePicker.locale).toEqual('ES');
                datePicker.placeholder = 'Buenos dias, muchachos';
                expect(datePicker.placeholder).toEqual('Buenos dias, muchachos');
                datePicker.readOnly = true;
                expect(datePicker.readOnly).toEqual(true);
                spyOn(datePicker.valueChange, 'emit').and.callThrough();
                datePicker.value = today;
                expect(datePicker.value).toEqual(today);
                expect(mockDateEditor.value).toEqual(today);
                expect(datePicker.valueChange.emit).toHaveBeenCalledWith(today);
                const newDate = new Date('02/02/2002');
                const boundObject = {
                    date: newDate
                };
                datePicker.value = boundObject.date;
                expect(datePicker.value).toEqual(newDate);
                expect(mockDateEditor.value).toEqual(newDate);
                expect(datePicker.valueChange.emit).toHaveBeenCalledWith(newDate);
                expect(boundObject.date).toEqual(newDate);
                datePicker.value = '2003-03-03';
                expect(datePicker.value).toEqual('2003-03-03');
                // expect(mockDateEditor.value).toEqual('03/03/2003');
                expect(datePicker.valueChange.emit).not.toHaveBeenCalledWith('2003-03-03' as any);
                const customFormatter: (val: Date) => string = (val: Date) => val.getFullYear().toString();
                datePicker.formatter = customFormatter;
                expect(datePicker.formatter).toEqual(customFormatter);
                expect(datePicker.displayValue.transform(today)).toEqual(today.getFullYear().toString());
            });

            it('Should properly set date w/ `selectToday` methods', () => {
                spyOn(datePicker, 'select');
                spyOn(datePicker, 'close');
                const now = new Date();
                now.setHours(0);
                now.setMinutes(0);
                now.setSeconds(0);
                now.setMilliseconds(0);
                datePicker.selectToday();
                expect(datePicker.select).toHaveBeenCalledWith(now);
                expect(datePicker.close).toHaveBeenCalled();
            });

            it('Should call underlying dateEditor decrement and increment methods', () => {
                mockDateEditor.decrement = jasmine.createSpy();
                mockDateEditor.increment = jasmine.createSpy();
                datePicker.decrement();
                expect(mockDateEditor.decrement).toHaveBeenCalledWith(undefined, undefined);
                const mockDatePart = {} as DatePart;
                datePicker.decrement(mockDatePart);
                expect(mockDateEditor.decrement).toHaveBeenCalledWith(mockDatePart, undefined);
                datePicker.decrement(mockDatePart, 0);
                expect(mockDateEditor.decrement).toHaveBeenCalledWith(mockDatePart, 0);
                datePicker.decrement(mockDatePart, Infinity);
                expect(mockDateEditor.decrement).toHaveBeenCalledWith(mockDatePart, Infinity);
                datePicker.increment();
                expect(mockDateEditor.increment).toHaveBeenCalledWith(undefined, undefined);
                datePicker.increment(mockDatePart);
                expect(mockDateEditor.increment).toHaveBeenCalledWith(mockDatePart, undefined);
                datePicker.increment(mockDatePart, 0);
                expect(mockDateEditor.increment).toHaveBeenCalledWith(mockDatePart, 0);
                datePicker.increment(mockDatePart, Infinity);
                expect(mockDateEditor.increment).toHaveBeenCalledWith(mockDatePart, Infinity);
            });

            it('Should call underlying overlay `open` and `attach` methods with proper settings', () => {
                spyOn(overlay, 'attach').and.returnValue(mockOverlayId);
                spyOn(overlay, 'detach');
                spyOn(overlay, 'show');
                spyOn(overlay, 'hide');

                const baseDialogSettings: OverlaySettings = Object.assign(
                    {},
                    (datePicker as any)._dialogOverlaySettings
                );
                const baseDropdownSettings: OverlaySettings = Object.assign(
                    {},
                    (datePicker as any)._dropDownOverlaySettings,
                    {
                        target: mockInputGroup.element.nativeElement
                    }
                );

                const collapsedSpy = spyOnProperty(datePicker, 'collapsed', 'get');
                collapsedSpy.and.returnValue(false);
                datePicker.disabled = false;
                datePicker.open();
                expect(overlay.attach).not.toHaveBeenCalled();
                collapsedSpy.and.returnValue(true);
                datePicker.disabled = true;
                datePicker.open();
                expect(overlay.attach).not.toHaveBeenCalled();
                collapsedSpy.and.returnValue(false);
                datePicker.open();
                expect(overlay.attach).not.toHaveBeenCalled();
                collapsedSpy.and.returnValue(true);
                datePicker.disabled = false;
                const isDropdownSpy = spyOnProperty(datePicker, 'isDropdown', 'get');
                isDropdownSpy.and.returnValue(false);
                datePicker.open();
                expect(overlay.attach).toHaveBeenCalledWith(IgxCalendarContainerComponent, baseDialogSettings, mockModuleRef);
                expect(overlay.show).toHaveBeenCalledWith(mockOverlayId);
                isDropdownSpy.and.returnValue(true);
                datePicker.open();
                expect(overlay.attach).toHaveBeenCalledWith(IgxCalendarContainerComponent, baseDropdownSettings, mockModuleRef);
                expect(overlay.show).toHaveBeenCalledWith(mockOverlayId);
                const mockOutlet = {} as any;
                datePicker.outlet = mockOutlet;
                datePicker.open();
                expect(overlay.attach).toHaveBeenCalledWith(
                    IgxCalendarContainerComponent,
                    Object.assign({}, baseDropdownSettings, { outlet: mockOutlet }),
                    mockModuleRef
                );
                expect(overlay.show).toHaveBeenCalledWith(mockOverlayId);
                let mockSettings: OverlaySettings = {
                    closeOnEscape: true,
                    closeOnOutsideClick: true,
                    modal: false
                };
                datePicker.outlet = null;
                datePicker.open(mockSettings);
                expect(overlay.attach).toHaveBeenCalledWith(
                    IgxCalendarContainerComponent,
                    Object.assign({}, baseDropdownSettings, mockSettings),
                    mockModuleRef
                );
                expect(overlay.show).toHaveBeenCalledWith(mockOverlayId);
                isDropdownSpy.and.returnValue(false);
                mockSettings = {
                    closeOnEscape: false,
                    closeOnOutsideClick: false,
                    modal: false
                };
                datePicker.open(mockSettings);
                expect(overlay.attach).toHaveBeenCalledWith(
                    IgxCalendarContainerComponent,
                    Object.assign({}, baseDialogSettings, mockSettings),
                    mockModuleRef
                );
                expect(overlay.show).toHaveBeenCalledWith(mockOverlayId);
                isDropdownSpy.and.returnValue(true);
                datePicker.overlaySettings = {
                    modal: false
                };
                mockSettings = {
                    modal: true
                };
                datePicker.open(mockSettings);
                expect(overlay.attach).toHaveBeenCalledWith(
                    IgxCalendarContainerComponent,
                    Object.assign({}, baseDropdownSettings, { modal: true }),
                    mockModuleRef
                );
            });

            it('Should call underlying overlay `close` and `detach` methods with proper settings', () => {
                spyOn(overlay, 'attach').and.returnValue(mockOverlayId);
                spyOn(overlay, 'detach');
                spyOn(overlay, 'show');
                spyOn(overlay, 'hide');

                // init subscriptions
                datePicker.ngAfterViewInit();

                // assign overlayId
                const collapsedSpy = spyOnProperty(datePicker, 'collapsed', 'get');
                collapsedSpy.and.returnValue(true);
                datePicker.open();
                datePicker.close();
                expect(overlay.hide).not.toHaveBeenCalled();
                expect(overlay.detach).not.toHaveBeenCalled();
                collapsedSpy.and.returnValue(false);
                datePicker.close();
                expect(overlay.hide).toHaveBeenCalled();
                expect(overlay.hide).toHaveBeenCalledWith(mockOverlayId);
                expect(overlay.detach).not.toHaveBeenCalled();
                overlay.onClosed.emit(mockOverlayEventArgs);
                expect(overlay.detach).toHaveBeenCalledWith(mockOverlayId);
            });

            it('Should try to set input label depending on label directive', () => {
                expect(renderer2.setAttribute).not.toHaveBeenCalled();
                datePicker.ngAfterViewChecked();
                expect(renderer2.setAttribute).not.toHaveBeenCalled();
                (datePicker as any).labelDirective = jasmine.createSpyObj('mockLabel', ['any'], {
                    id: 'mock-id'
                });
                datePicker.ngAfterViewChecked();
                expect(renderer2.setAttribute).toHaveBeenCalledWith(mockInputDirective.nativeElement, 'aria-labelledby', 'mock-id');
            });

            it('Should properly handle click on editor provider', () => {
                datePicker.ngAfterViewInit();
                spyOn(datePicker, 'open');
                expect(datePicker.open).not.toHaveBeenCalled();
                expect(datePicker.getEditElement()).toEqual(mockInputDirective.nativeElement);
                expect(datePicker.isDropdown).toBeTruthy();
                datePicker.getEditElement().dispatchEvent('click' as any);
                // does not call open when in DD mode
                expect(datePicker.open).toHaveBeenCalledTimes(0);
                spyOnProperty(datePicker, 'isDropdown', 'get').and.returnValue(false);
                datePicker.getEditElement().dispatchEvent('click' as any);
                expect(datePicker.open).toHaveBeenCalledTimes(1);
            });

            //#region API Methods
            it('should properly update the collapsed state with open/close/toggle methods', () => {
                datePicker.ngAfterViewInit();

                datePicker.open();
                expect(datePicker.collapsed).toBeFalse();

                datePicker.close();
                expect(datePicker.collapsed).toBeTrue();

                datePicker.toggle();
                expect(datePicker.collapsed).toBeFalse();

                datePicker.toggle();
                expect(datePicker.collapsed).toBeTrue();
            });

            it('should update the picker\'s value with the select method', () => {
                spyOn(datePicker.valueChange, 'emit');

                (datePicker as any).dateTimeEditor = { value: null, clear: () => { } };
                datePicker.value = new Date();

                const newDate = new Date(2012, 10, 5);
                datePicker.select(newDate);
                expect(datePicker.valueChange.emit).toHaveBeenCalledWith(newDate);
                expect(datePicker.value).toEqual(newDate);
            });

            it('should clear the picker\'s value with the clear method', () => {
                spyOn(datePicker.valueChange, 'emit');

                datePicker.value = today;

                datePicker.ngAfterViewInit();

                datePicker.clear();
                expect(datePicker.valueChange.emit).toHaveBeenCalledWith(null);
                expect(datePicker.value).toEqual(null);
            });

            //#endregion

            //#region Events
            it('should properly emit open/close events', () => {
                spyOn(datePicker.opened, 'emit');
                spyOn(datePicker.closed, 'emit');

                datePicker.ngAfterViewInit();

                datePicker.open();
                expect(datePicker.opened.emit).toHaveBeenCalledWith({ owner: datePicker });

                datePicker.close();
                expect(datePicker.closed.emit).toHaveBeenCalledWith({ owner: datePicker });
            });

            it('should properly emit opening/closing events', () => {
                spyOn(datePicker.opening, 'emit');
                spyOn(datePicker.closing, 'emit');

                datePicker.ngAfterViewInit();

                datePicker.open();
                expect(datePicker.opening.emit).toHaveBeenCalledWith({ owner: datePicker, event: undefined, cancel: false });

                datePicker.close();
                expect(datePicker.closing.emit).toHaveBeenCalledWith({ owner: datePicker, event: undefined, cancel: false });
            });

            it('should emit valueChange when the value changes', () => {
                spyOn(datePicker.valueChange, 'emit');

                datePicker.ngAfterViewInit();

                (datePicker as any).dateTimeEditor = { value: null, clear: () => { } };
                const newDate = new Date();
                datePicker.value = newDate;
                expect(datePicker.valueChange.emit).toHaveBeenCalledWith(newDate);
            });

            it('should emit validationFailed if a value outside of a given range was provided', () => {
                spyOn(datePicker.validationFailed, 'emit');
                const validDate = new Date(2012, 5, 7);
                const invalidDate = new Date(2012, 6, 1);
                spyOnProperty(mockDateEditor, 'value', 'set').and.callFake((val: Date) => {
                    if (val === invalidDate) {
                        mockDateEditor.validationFailed.emit({ oldValue: validDate });
                        return;
                    }
                    mockDateEditor._value = val;
                    mockDateEditor.valueChange.emit(val);
                });

                datePicker.ngAfterViewInit();

                datePicker.minValue = new Date(2012, 5, 4);
                datePicker.maxValue = new Date(2012, 5, 10);
                datePicker.value = validDate;
                expect(datePicker.validationFailed.emit).not.toHaveBeenCalled();
                datePicker.value = invalidDate;
                expect(datePicker.validationFailed.emit).toHaveBeenCalledWith({ owner: datePicker, prevValue: validDate });
            });

            it('Should change own value if value of underlying dateEditor changes', () => {
                const validDate = new Date(2012, 5, 7);
                spyOn(datePicker.valueChange, 'emit');

                datePicker.ngAfterViewInit();
                expect(datePicker.value).not.toEqual(validDate);
                mockDateEditor.valueChange.emit(validDate);
                expect(datePicker.valueChange.emit).toHaveBeenCalledTimes(1);
                expect(datePicker.valueChange.emit).toHaveBeenCalledWith(validDate);

                const secondDate = new Date();
                mockDateEditor.valueChange.emit(secondDate);
                expect(datePicker.valueChange.emit).toHaveBeenCalledTimes(2);
                expect(datePicker.valueChange.emit).toHaveBeenCalledWith(secondDate);
            });

            it(`Should initialize and subscribe to underlying calendar's selected event and call proper methods`, () => {
                datePicker.mode = PickerInteractionMode.Dialog;
                spyOn(overlay, 'show');
                // assign overlay id
                datePicker.open();
                datePicker.ngAfterViewInit();
                overlay.onOpening.emit(mockOverlayEventArgs);
                spyOn(datePicker, 'close');
                expect(datePicker.close).not.toHaveBeenCalled();
                // calendar instance is initialized properly
                expect(mockCalendar.hasHeader).toEqual(!datePicker.isDropdown);
                expect(mockCalendar.formatOptions).toEqual((datePicker as any).pickerCalendarFormat);
                expect(mockCalendar.formatViews).toEqual((datePicker as any).pickerFormatViews);
                expect(mockCalendar.locale).toEqual(datePicker.locale);
                expect(mockCalendar.vertical).toEqual(datePicker.headerOrientation === PickerHeaderOrientation.Vertical);
                expect(mockCalendar.weekStart).toEqual(datePicker.weekStart);
                expect(mockCalendar.specialDates).toEqual(datePicker.specialDates);
                expect(mockCalendar.hideOutsideDays).toEqual(datePicker.hideOutsideDays);
                expect(mockCalendar.monthsViewNumber).toEqual(datePicker.displayMonthsCount);
                expect(mockCalendar.showWeekNumbers).toEqual(datePicker.showWeekNumbers);
                expect(mockCalendar.disabledDates).toEqual([]);

                // check how calendar.selected is handler
                const init = DateTimeUtil.parseIsoDate;
                const mockDate1 = jasmine.createSpyObj<Date>(
                    'date',
                    ['setHours', 'setMinutes', 'setSeconds', 'setMilliseconds']
                );
                const mockDate2 = jasmine.createSpyObj<Date>(
                    'date',
                    ['getHours', 'getMinutes', 'getSeconds', 'getMilliseconds', 'getTime']
                );
                mockDate2.getHours.and.returnValue(999);
                mockDate2.getMinutes.and.returnValue(999);
                mockDate2.getSeconds.and.returnValue(999);
                mockDate2.getMilliseconds.and.returnValue(999);
                mockDate2.getTime.and.returnValue(999);
                const parseIsoDate = spyOn(DateTimeUtil, 'parseIsoDate');
                parseIsoDate.and.callFake((val: string) => {
                    if (val === undefined || mockDate1) {
                        return mockDate2;
                    } else {
                        return init(val);
                    }
                });
                datePicker.value = undefined;
                expect(datePicker.close).not.toHaveBeenCalled();
                // this will call DateTimeUtil.parseIsoDate and set the value to mockDate2
                expect(mockDate2.getHours).not.toHaveBeenCalled();
                expect(mockDate2.getMinutes).not.toHaveBeenCalled();
                expect(mockDate2.getSeconds).not.toHaveBeenCalled();
                expect(mockDate2.getMilliseconds).not.toHaveBeenCalled();
                expect(mockDate1.setHours).not.toHaveBeenCalled();
                expect(mockDate1.setMinutes).not.toHaveBeenCalled();
                expect(mockDate1.setSeconds).not.toHaveBeenCalled();
                expect(mockDate1.setMilliseconds).not.toHaveBeenCalled();
                mockCalendar.selected.emit(mockDate1);
                expect(mockDate2.getHours).toHaveBeenCalled();
                expect(mockDate2.getMinutes).toHaveBeenCalled();
                expect(mockDate2.getSeconds).toHaveBeenCalled();
                expect(mockDate2.getMilliseconds).toHaveBeenCalled();
                expect(mockDate1.setHours).toHaveBeenCalledWith(999);
                expect(mockDate1.setMinutes).toHaveBeenCalledWith(999);
                expect(mockDate1.setSeconds).toHaveBeenCalledWith(999);
                expect(mockDate1.setMilliseconds).toHaveBeenCalledWith(999);
                expect(datePicker.close).toHaveBeenCalled();

                parseIsoDate.and.callFake(init);

                const mockMinValue = new Date('02/02/2002');
                const mockMaxValue = new Date('03/03/2003');
                const defaultCheck = DateTimeUtil.isValidDate;
                const mockCheck = (value: Date): value is Date => {
                    if (value === mockMinValue || value === mockMaxValue) {
                        return true;
                    } else {
                        return defaultCheck(value);
                    }
                };
                spyOn(DateTimeUtil, 'isValidDate').and.callFake(mockCheck);
                expect(datePicker.disabledDates).toEqual(null);
                expect(datePicker.minValue).toBeUndefined();
                expect(datePicker.maxValue).toBeUndefined();
                overlay.onOpening.emit(mockOverlayEventArgs);
                expect(mockCalendar.disabledDates).toEqual([]);
                datePicker.maxValue = mockMaxValue;
                overlay.onOpening.emit(mockOverlayEventArgs);
                expect(mockCalendar.disabledDates).toEqual([{ type: DateRangeType.After, dateRange: [mockMaxValue] }]);
                mockCalendar.disabledDates = [];
                datePicker.maxValue = undefined;
                datePicker.minValue = mockMinValue;
                overlay.onOpening.emit(mockOverlayEventArgs);
                expect(mockCalendar.disabledDates).toEqual([{ type: DateRangeType.Before, dateRange: [mockMinValue] }]);
                mockCalendar.disabledDates = [];
                datePicker.maxValue = mockMaxValue;
                overlay.onOpening.emit(mockOverlayEventArgs);
                expect(mockCalendar.disabledDates).toEqual([
                    { type: DateRangeType.Before, dateRange: [mockMinValue] },
                    { type: DateRangeType.After, dateRange: [mockMaxValue] }
                ]);
                mockCalendar.disabledDates = [];
                datePicker.minValue = undefined;
                datePicker.maxValue = undefined;
                datePicker.disabledDates = [
                    { type: DateRangeType.Before, dateRange: [mockMinValue] },
                    { type: DateRangeType.After, dateRange: [mockMaxValue] }
                ];
                overlay.onOpening.emit(mockOverlayEventArgs);
                expect(mockCalendar.disabledDates).toEqual([
                    { type: DateRangeType.Before, dateRange: [mockMinValue] },
                    { type: DateRangeType.After, dateRange: [mockMaxValue] }
                ]);
                mockCalendar.disabledDates = [];
                datePicker.minValue = mockMinValue;
                datePicker.maxValue = mockMaxValue;
                datePicker.disabledDates = [
                    { type: DateRangeType.Before, dateRange: [mockMinValue] },
                    { type: DateRangeType.After, dateRange: [mockMaxValue] }
                ];
                overlay.onOpening.emit(mockOverlayEventArgs);
                expect(mockCalendar.disabledDates).toEqual([
                    { type: DateRangeType.Before, dateRange: [mockMinValue] },
                    { type: DateRangeType.After, dateRange: [mockMaxValue] },
                    { type: DateRangeType.Before, dateRange: [mockMinValue] },
                    { type: DateRangeType.After, dateRange: [mockMaxValue] }
                ]);
                mockDate2.getTime.and.returnValue(Infinity);
                mockCalendar.disabledDates = [];
                datePicker.minValue = mockMinValue;
                datePicker.maxValue = mockMaxValue;
                overlay.onOpening.emit(mockOverlayEventArgs);
                // if _calendar already has disabled dates, min + max are added anyway
                expect(mockCalendar.disabledDates).toEqual([
                    { type: DateRangeType.Before, dateRange: [mockMinValue] },
                    { type: DateRangeType.After, dateRange: [mockMaxValue] },
                    { type: DateRangeType.Before, dateRange: [mockMinValue] },
                    { type: DateRangeType.After, dateRange: [mockMaxValue] }
                ]);
            });
            //#endregion
        });

        describe('Control Value Accessor', () => {
            it('Should properly handle `statusChanged` event when bound to ngModel', () => {
                datePicker.ngOnInit();
                datePicker.ngAfterViewInit();
                mockControlInstance.touched = false;
                mockControlInstance.dirty = false;
                mockControlInstance.validator = null;
                mockControlInstance.asyncValidator = null;
                // initial value
                expect(mockInputDirective.valid).toEqual('mock');
                mockNgControl.statusChanges.emit();
                expect(mockInputDirective.valid).toEqual('mock');
                mockControlInstance.touched = true;
                mockNgControl.statusChanges.emit();
                expect(mockInputDirective.valid).toEqual('mock');
                mockControlInstance.validator = () => { };
                mockNgControl.statusChanges.emit();
                expect(mockInputDirective.valid).toEqual(IgxInputState.INITIAL);
                mockNgControl.valid = false;
                mockNgControl.statusChanges.emit();
                expect(mockInputDirective.valid).toEqual(IgxInputState.INVALID);
                mockInputGroup.isFocused = true;
                mockNgControl.valid = true;
                mockNgControl.statusChanges.emit();
                expect(mockInputDirective.valid).toEqual(IgxInputState.VALID);
                mockNgControl.valid = false;
                mockNgControl.statusChanges.emit();
                expect(mockInputDirective.valid).toEqual(IgxInputState.INVALID);
            });
        });
    });
});
@Component({
    template: `
        <igx-date-picker [value]="date" [mode]="mode" [minValue]="minValue" [maxValue]="maxValue">
        </igx-date-picker>`
})
export class IgxDatePickerTestComponent {
    @ViewChild(IgxDatePickerComponent) public datePicker: IgxDatePickerComponent;
    public mode: PickerInteractionMode = PickerInteractionMode.DropDown;
    public date = new Date(2021, 24, 2, 11, 45, 0);
    public minValue;
    public maxValue;
}

@Component({
    template: `
        <igx-date-picker [(ngModel)]="date" [mode]="mode" [minValue]="minValue" [maxValue]="maxValue" [required]="isRequired">
        </igx-date-picker>`
})
export class IgxDatePickerNgModelComponent {
    @ViewChild(IgxDatePickerComponent) public datePicker: IgxDatePickerComponent;
    public mode: PickerInteractionMode = PickerInteractionMode.DropDown;
    public date = new Date(2021, 24, 2, 11, 45, 0);
    public minValue;
    public maxValue;
    public isRequired = true;
}

@Component({
    template: `
        <igx-date-picker [value]="date" mode="dropdown" inputFormat="dd/MM/yyyy">
            <label igxLabel>Select a Date</label>
        </igx-date-picker>
    `
})
export class IgxDatePickerTestKbrdComponent {
    @ViewChild(IgxDatePickerComponent) public datePicker: IgxDatePickerComponent;
    public mode: PickerInteractionMode = PickerInteractionMode.DropDown;
    public date = new Date(2021, 24, 2, 11, 45, 0);
}

@Component({
    template:`
        <igx-date-picker [mode]="mode">
            <label igxLabel>Label</label>
            <igx-picker-toggle igxPrefix *ngIf="showCustomToggle">CustomToggle</igx-picker-toggle>
            <igx-prefix>Prefix</igx-prefix>
            <igx-picker-clear igxSuffix *ngIf="showCustomClear">CustomClear</igx-picker-clear>
            <igx-suffix>Suffix</igx-suffix>
            <igx-hint>Hint</igx-hint>
        </igx-date-picker>
`
})
export class IgxDatePickerWithProjectionsComponent {
    @ViewChild(IgxDatePickerComponent) public datePicker: IgxDatePickerComponent;
    @ViewChild(IgxPickerToggleComponent) public customToggle: IgxPickerToggleComponent;
    @ViewChild(IgxPickerClearComponent) public customClear: IgxPickerClearComponent;
    public mode: PickerInteractionMode = PickerInteractionMode.DropDown;
    public showCustomToggle = false;
    public showCustomClear = false;
}
