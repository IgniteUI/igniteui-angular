import { ComponentFixture, fakeAsync, flush, TestBed, tick, waitForAsync } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { UIInteractions } from '../test-utils/ui-interactions.spec';
import { IgxInputGroupComponent, IgxInputGroupModule } from '../input-group/public_api';
import { IgxTextSelectionModule } from '../directives/text-selection/text-selection.directive';
import { configureTestSuite } from '../test-utils/configure-suite';
import { IgxButtonModule } from '../directives/button/button.directive';
import { IgxCalendarModule } from '../calendar/public_api';
import { IgxIconModule } from '../icon/public_api';
import { IgxCalendarContainerModule } from '../date-common/calendar-container/calendar-container.component';
import { IgxDatePickerComponent, IgxDatePickerModule } from './public_api';
import { IgxOverlayService, OverlayCancelableEventArgs, OverlayClosingEventArgs, OverlayEventArgs } from '../services/public_api';
import { Component, DebugElement, EventEmitter, QueryList, Renderer2, ViewChild } from '@angular/core';
import { IgxToggleDirective } from '../directives/toggle/toggle.directive';
import { By } from '@angular/platform-browser';
import { PickerInteractionMode } from '../date-common/types';

const CSS_CLASS_CALENDAR = 'igx-calendar';
const CSS_CLASS_DATE_PICKER = 'igx-date-picker';

describe('IgxDatePicker', () => {
    configureTestSuite();

    describe('Integration tests', () => {
        beforeAll(waitForAsync(() => {
            TestBed.configureTestingModule({
                declarations: [
                ],
                imports: [IgxDatePickerModule, FormsModule, ReactiveFormsModule,
                    NoopAnimationsModule, IgxInputGroupModule, IgxCalendarModule,
                    IgxButtonModule, IgxTextSelectionModule, IgxIconModule,
                    IgxCalendarContainerModule]
            })
                .compileComponents();
        }));

        describe('Events', () => {
            let fixture: ComponentFixture<any>;
            let toggleDirectiveElement: DebugElement;
            let toggleDirective: IgxToggleDirective;
            let datePicker: IgxDatePickerComponent;
            configureTestSuite();
            beforeAll(waitForAsync(() => {
                TestBed.configureTestingModule({
                    declarations: [
                        IgxDatePickerTestComponent
                    ],
                    imports: [IgxDatePickerModule,
                        IgxInputGroupModule,
                        IgxIconModule,
                        NoopAnimationsModule]
                }).compileComponents();
            }));
            beforeEach(fakeAsync(() => {
                fixture = TestBed.createComponent(IgxDatePickerTestComponent);
                fixture.detectChanges();
                datePicker = fixture.componentInstance.datePicker;
                toggleDirectiveElement = fixture.debugElement.query(By.directive(IgxToggleDirective));
                toggleDirective = toggleDirectiveElement.injector.get(IgxToggleDirective) as IgxToggleDirective;
            }));

            it('should be able to cancel opening/closing', fakeAsync(() => {
                spyOn(datePicker.opening, 'emit').and.callThrough();
                spyOn(datePicker.opened, 'emit').and.callThrough();
                spyOn(datePicker.closing, 'emit').and.callThrough();
                spyOn(datePicker.closed, 'emit').and.callThrough();

                const openingSub = datePicker.opening.subscribe((event) => event.cancel = true);

                datePicker.open();
                tick();
                fixture.detectChanges();
                expect(toggleDirective.collapsed).toBeTruthy();
                expect(datePicker.opening.emit).toHaveBeenCalled();
                expect(datePicker.opened.emit).not.toHaveBeenCalled();

                openingSub.unsubscribe();

                const closingSub = datePicker.closing.subscribe((event) => event.cancel = true);

                datePicker.open();
                tick();
                fixture.detectChanges();

                datePicker.close();
                tick();
                fixture.detectChanges();
                expect(toggleDirective.collapsed).toBeFalsy();
                expect(datePicker.closing.emit).toHaveBeenCalled();
                expect(datePicker.closed.emit).not.toHaveBeenCalled();

                closingSub.unsubscribe();
            }));
        });

        describe('Keyboard navigation', () => {
            let fixture: ComponentFixture<any>;
            let datePicker: IgxDatePickerComponent;
            let calendar;
            beforeAll(waitForAsync(() => {
                TestBed.configureTestingModule({
                    declarations: [
                        IgxDatePickerTestKbrdComponent
                    ],
                    imports: [IgxDatePickerModule,
                        IgxInputGroupModule,
                        IgxIconModule,
                        NoopAnimationsModule]
                }).compileComponents();
            }));
            beforeEach(fakeAsync(() => {
                fixture = TestBed.createComponent(IgxDatePickerTestKbrdComponent);
                fixture.detectChanges();
                datePicker = fixture.componentInstance.datePicker;
                calendar = fixture.componentInstance.datePicker.calendar;
            }));

            afterAll(() => {
                TestBed.resetTestingModule();
            });

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
                tick();
                fixture.detectChanges();
                expect(datePicker.collapsed).toBeTruthy();
                expect(datePicker.closing.emit).toHaveBeenCalledTimes(1);
                expect(datePicker.closed.emit).toHaveBeenCalledTimes(1);
                flush();
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
                tick();
                fixture.detectChanges();
                expect(datePicker.collapsed).toBeTruthy();
                expect(datePicker.closing.emit).toHaveBeenCalledTimes(1);
                expect(datePicker.closed.emit).toHaveBeenCalledTimes(1);
                flush();
            }));
        });

        describe('Projections', () => {
            // pending('TODO');
        });
    });

    describe('Unit Tests', () => {
        let mockPlatformUtil: any;
        let overlay: IgxOverlayService | any;
        let mockInjector;
        let datePicker: IgxDatePickerComponent;
        let mockDateEditor: any;
        const today = new Date();
        const elementRef = {
            nativeElement: jasmine.createSpyObj<HTMLElement>('mockElement', ['blur', 'click', 'focus'])
        };
        const mockNgControl = jasmine.createSpyObj('NgControl',
            ['registerOnChangeCb',
                'registerOnTouchedCb',
                'registerOnValidatorChangeCb']);
        beforeEach(() => {
            mockInjector = jasmine.createSpyObj('Injector', {
                get: mockNgControl
            });

            const mockCalendar = { selected: new EventEmitter<any>() };
            const mockComponentInstance = {
                calendar: mockCalendar,
                todaySelection: new EventEmitter<any>(),
                calendarClose: new EventEmitter<any>()
            };
            const mockOverlayEventArgs = {
                id: '1',
                componentRef: {
                    instance: mockComponentInstance
                }
            };
            overlay = {
                onOpening: new EventEmitter<OverlayCancelableEventArgs>(),
                onOpened: new EventEmitter<OverlayEventArgs>(),
                onClosed: new EventEmitter<OverlayEventArgs>(),
                onClosing: new EventEmitter<OverlayClosingEventArgs>(),
                show(..._args) {
                    this.onOpening.emit(mockOverlayEventArgs);
                    this.onOpened.emit(mockOverlayEventArgs);
                },
                hide(..._args) {
                    this.onClosing.emit(mockOverlayEventArgs);
                    this.onClosed.emit(mockOverlayEventArgs);
                },
                detach: (..._args) => { },
                attach: (..._args) => '1'
            } as any;
            mockDateEditor = {
                value: new Date(),
                clear() {
                    this.valueChange.emit(null);
                },
                valueChange: new EventEmitter<any>(),
                validationFailed: new EventEmitter<any>()
            };
            datePicker = new IgxDatePickerComponent(elementRef, null, overlay, null, mockInjector, null, null);
            (datePicker as any).inputDirective = {
                nativeElement: jasmine.createSpyObj<HTMLElement>('mockElement', ['blur',
                    'addEventListener', 'removeEventListener', 'click', 'focus']),
                focus: () => { }
            };
            (datePicker as any).dateTimeEditor = mockDateEditor;
        });

        afterEach(() => {
            UIInteractions.clearOverlay();
            datePicker?.ngOnDestroy();
        });
        let ngModel;
        let element;
        let cdr;
        let moduleRef;
        let injector;
        let inputGroup: IgxInputGroupComponent;
        let renderer2: Renderer2;
        const platform = {} as any;
        describe('API tests', () => {
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
            xit('should properly emit open/close events', () => {
                spyOn(datePicker.opened, 'emit');
                spyOn(datePicker.closed, 'emit');

                datePicker.ngAfterViewInit();

                datePicker.open();
                expect(datePicker.opened.emit).toHaveBeenCalledWith({ owner: datePicker });

                datePicker.close();
                expect(datePicker.closed.emit).toHaveBeenCalledWith({ owner: datePicker });
            });

            xit('should properly emit opening/closing events', () => {
                spyOn(datePicker.opening, 'emit');
                spyOn(datePicker.closing, 'emit');

                datePicker.ngAfterViewInit();

                datePicker.open();
                expect(datePicker.opening.emit).toHaveBeenCalledWith({ owner: datePicker, cancel: false });

                datePicker.close();
                expect(datePicker.closing.emit).toHaveBeenCalledWith({ owner: datePicker, cancel: false });
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
                (datePicker as any).dateTimeEditor = {
                    _value: null,
                    get value() {
                        return this._value;
                    },
                    set value(val: any) {
                        if (val === invalidDate) {
                            this.validationFailed.emit({ oldValue: validDate });
                            return;
                        }
                        this._value = val;
                        this.valueChange.emit(val);
                    },
                    clear: () => { },
                    valueChange: new EventEmitter<any>(),
                    validationFailed: new EventEmitter<any>()
                };

                datePicker.ngAfterViewInit();

                datePicker.minValue = new Date(2012, 5, 4);
                datePicker.maxValue = new Date(2012, 5, 10);
                datePicker.value = validDate;
                expect(datePicker.validationFailed.emit).not.toHaveBeenCalled();
                datePicker.value = invalidDate;
                expect(datePicker.validationFailed.emit).toHaveBeenCalledWith({ owner: datePicker, prevValue: validDate });
            });
            //#endregion
        });

        describe('Control Value Accessor', () => {
            beforeEach(() => {
                ngModel = {
                    control: { touched: false, dirty: false, validator: null },
                    valid: false,
                    statusChanges: new EventEmitter(),
                };
                overlay = {
                    onOpening: new EventEmitter<OverlayCancelableEventArgs>(),
                    onOpened: new EventEmitter<OverlayEventArgs>(),
                    onClosed: new EventEmitter<OverlayEventArgs>(),
                    onClosing: new EventEmitter<OverlayClosingEventArgs>()
                };
                element = {}; // eslint-disable-line
                cdr = { // eslint-disable-line
                    markForCheck: () => { },
                    detectChanges: () => { },
                    detach: () => { },
                    reattach: () => { }
                };
                moduleRef = {}; // eslint-disable-line
                injector = { get: () => ngModel }; // eslint-disable-line
                inputGroup = new IgxInputGroupComponent(null, null, null, document, renderer2, mockPlatformUtil); // eslint-disable-line
                renderer2 = jasmine.createSpyObj('Renderer2', ['setAttribute'], [{}, 'aria-labelledby', 'test-label-id-1']);
                spyOn(renderer2, 'setAttribute').and.callFake(() => {
                });
            });

            it('should initialize date picker with required correctly', () => {
                datePicker = new IgxDatePickerComponent(overlay, element, cdr, moduleRef, injector, renderer2, platform);
                datePicker['_inputGroup'] = inputGroup;
                datePicker['_inputDirectiveUserTemplates'] = new QueryList();
                spyOnProperty(datePicker as any, 'inputGroup').and.returnValue(null);
                ngModel.control.validator = () => ({ required: true });
                datePicker.ngOnInit();
                datePicker.ngAfterViewInit();
                datePicker.ngAfterViewChecked();

                expect(datePicker).toBeDefined();
                expect(inputGroup.isRequired).toBeTruthy();
            });

            it('should update inputGroup isRequired correctly', () => {
                datePicker = new IgxDatePickerComponent(overlay, element, cdr, moduleRef, injector, renderer2, platform);
                datePicker['_inputGroup'] = inputGroup;
                datePicker['_inputDirectiveUserTemplates'] = new QueryList();
                spyOnProperty(datePicker as any, 'inputGroup').and.returnValue(null);
                datePicker.ngOnInit();
                datePicker.ngAfterViewInit();
                datePicker.ngAfterViewChecked();

                expect(datePicker).toBeDefined();
                expect(inputGroup.isRequired).toBeFalsy();

                ngModel.control.validator = () => ({ required: true });
                ngModel.statusChanges.emit();
                expect(inputGroup.isRequired).toBeTruthy();

                ngModel.control.validator = () => ({ required: false });
                ngModel.statusChanges.emit();
                expect(inputGroup.isRequired).toBeFalsy();
            });
        });

        describe('Validator', () => {
            // pending('TODO');
        });
    });
});
@Component({
    template: `
        <igx-date-picker #picker [value]="date" [mode]="mode" [minValue]="minValue" [maxValue]="maxValue">
        </igx-date-picker>`
})
export class IgxDatePickerTestComponent {
    @ViewChild('picker', { read: IgxDatePickerComponent, static: true })
    public datePicker: IgxDatePickerComponent;
    public mode: PickerInteractionMode = PickerInteractionMode.DropDown;
    public date = new Date(2021, 24, 2, 11, 45, 0);
    public minValue;
    public maxValue;
}

@Component({
    template: `
        <igx-date-picker #kbrdPicker [value]="date" mode="dropdown" inputFormat="dd/MM/yyyy">
            <label igxLabel>Select a Date</label>
        </igx-date-picker>
    `
})
export class IgxDatePickerTestKbrdComponent {
    @ViewChild('kbrdPicker', { read: IgxDatePickerComponent, static: true })
    public datePicker: IgxDatePickerComponent;
    public mode: PickerInteractionMode = PickerInteractionMode.DropDown;
    public date = new Date(2021, 24, 2, 11, 45, 0);
}
