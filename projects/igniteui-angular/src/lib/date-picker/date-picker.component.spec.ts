import { ComponentFixture, fakeAsync, flush, TestBed, tick, waitForAsync } from '@angular/core/testing';
import { UntypedFormControl, UntypedFormGroup, FormsModule, NgForm, ReactiveFormsModule, Validators } from '@angular/forms';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { UIInteractions } from '../test-utils/ui-interactions.spec';
import {
    IgxHintDirective, IgxInputGroupComponent, IgxInputState, IgxLabelDirective, IgxPrefixDirective, IgxSuffixDirective
} from '../input-group/public_api';
import { configureTestSuite } from '../test-utils/configure-suite';
import { IFormattingViews, IgxCalendarComponent, IgxCalendarHeaderTemplateDirective, IgxCalendarHeaderTitleTemplateDirective, WEEKDAYS } from '../calendar/public_api';
import { IgxCalendarContainerComponent } from '../date-common/calendar-container/calendar-container.component';
import { IgxDatePickerComponent } from './date-picker.component';
import {
    IgxOverlayService,
    OverlayCancelableEventArgs, OverlayClosingEventArgs, OverlayEventArgs, OverlaySettings
} from '../services/public_api';
import { Component, DebugElement, ElementRef, EventEmitter, QueryList, Renderer2, ViewChild } from '@angular/core';
import { By } from '@angular/platform-browser';
import { PickerHeaderOrientation, PickerInteractionMode } from '../date-common/types';
import { DatePart } from '../directives/date-time-editor/date-time-editor.common';
import { DateRangeDescriptor, DateRangeType } from '../core/dates';
import { IgxOverlayOutletDirective } from '../directives/toggle/toggle.directive';
import { IgxPickerClearComponent, IgxPickerToggleComponent } from '../date-common/public_api';
import { DateTimeUtil } from '../date-common/util/date-time.util';
import { NgIf, registerLocaleData } from "@angular/common";
import localeES from "@angular/common/locales/es";
import localeBg from "@angular/common/locales/bg";
import { IgxDateTimeEditorDirective } from '../directives/date-time-editor/public_api';

const CSS_CLASS_CALENDAR = 'igx-calendar';
const CSS_CLASS_DATE_PICKER = 'igx-date-picker';

const DATE_PICKER_TOGGLE_ICON = 'calendar_today';
const DATE_PICKER_CLEAR_ICON = 'clear';

const CSS_CLASS_INPUT_GROUP_REQUIRED = 'igx-input-group--required';
const CSS_CLASS_INPUT_GROUP_INVALID = 'igx-input-group--invalid';

describe('IgxDatePicker', () => {
    describe('Integration tests', () => {
        configureTestSuite();
        beforeAll(waitForAsync(() => {
            TestBed.configureTestingModule({
                imports: [
                    NoopAnimationsModule,
                    IgxDatePickerTestKbrdComponent,
                    IgxDatePickerTestComponent,
                    IgxDatePickerNgModelComponent,
                    IgxDatePickerWithProjectionsComponent,
                    IgxDatePickerWithTemplatesComponent,
                    IgxDatePickerInFormComponent,
                    IgxDatePickerReactiveFormComponent
                ]
            }).compileComponents();
        }));

        describe('Rendering', () => {
            let fixture: ComponentFixture<IgxDatePickerTestComponent>;
            beforeEach(fakeAsync(() => {
                fixture = TestBed.createComponent(IgxDatePickerTestComponent);
                fixture.detectChanges();
            }));

            it('Should render default toggle and clear icons', () => {
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
                tick(350);
                fixture.detectChanges();
                expect(datePicker.collapsed).toBeFalsy();
                expect(datePicker.closing.emit).toHaveBeenCalled();
                expect(datePicker.closed.emit).not.toHaveBeenCalled();

                closingSub.unsubscribe();
                (datePicker as any)._overlayService.detachAll();
            }));
        });

        describe('Keyboard navigation', () => {
            let fixture: ComponentFixture<any>;
            let datePicker: IgxDatePickerComponent;
            let inputGroup: DebugElement;

            beforeEach(fakeAsync(() => {
                fixture = TestBed.createComponent(IgxDatePickerTestKbrdComponent);
                fixture.detectChanges();
                datePicker = fixture.componentInstance.datePicker;
                inputGroup = fixture.debugElement.query(By.directive(IgxInputGroupComponent));
            }));

            it('should toggle the calendar with ALT + DOWN/UP ARROW key', fakeAsync(() => {
                spyOn(datePicker.opening, 'emit').and.callThrough();
                spyOn(datePicker.opened, 'emit').and.callThrough();
                spyOn(datePicker.closing, 'emit').and.callThrough();
                spyOn(datePicker.closed, 'emit').and.callThrough();
                expect(datePicker.collapsed).toBeTruthy();
                expect(datePicker.isFocused).toBeFalse();

                const picker = fixture.debugElement.query(By.css(CSS_CLASS_DATE_PICKER));
                UIInteractions.triggerEventHandlerKeyDown('ArrowDown', picker, true);

                tick();
                fixture.detectChanges();

                expect(datePicker.collapsed).toBeFalsy();
                expect(datePicker.opening.emit).toHaveBeenCalledTimes(1);
                expect(datePicker.opened.emit).toHaveBeenCalledTimes(1);

                const calendarWrapper = fixture.debugElement.query(By.css('.igx-calendar__wrapper')).nativeElement;
                expect(calendarWrapper.contains(document.activeElement))
                    .withContext('focus should move to calendar for KB nav')
                    .toBeTrue();
                expect(datePicker.isFocused).toBeTrue();

                UIInteractions.triggerKeyDownEvtUponElem('ArrowUp', calendarWrapper, true, true);
                tick(350);
                fixture.detectChanges();
                expect(datePicker.collapsed).toBeTruthy();
                expect(datePicker.closing.emit).toHaveBeenCalledTimes(1);
                expect(datePicker.closed.emit).toHaveBeenCalledTimes(1);
                expect(inputGroup.nativeElement.contains(document.activeElement))
                    .withContext('focus should return to the picker input')
                    .toBeTrue();
                expect(datePicker.isFocused).toBeTrue();
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

                // wait datepicker to get destroyed and test to cleanup
                tick(350);
            }));

            it('should close the calendar with ESC', fakeAsync(() => {
                datePicker.mode = 'dropdown';
                spyOn(datePicker.closing, 'emit').and.callThrough();
                spyOn(datePicker.closed, 'emit').and.callThrough();

                expect(datePicker.collapsed).toBeTruthy();
                datePicker.open();
                tick();
                fixture.detectChanges();

                expect(datePicker.collapsed).toBeFalsy();
                const calendarWrapper = fixture.debugElement.query(By.css('.igx-calendar__wrapper')).nativeElement;
                expect(calendarWrapper.contains(document.activeElement))
                    .withContext('focus should move to calendar for KB nav')
                    .toBeTrue();
                expect(datePicker.isFocused).toBeTrue();


                UIInteractions.triggerKeyDownEvtUponElem('Escape', calendarWrapper, true);
                tick(350);
                fixture.detectChanges();

                expect(datePicker.collapsed).toBeTruthy();
                expect(datePicker.closing.emit).toHaveBeenCalledTimes(1);
                expect(datePicker.closed.emit).toHaveBeenCalledTimes(1);
                expect(inputGroup.nativeElement.contains(document.activeElement))
                    .withContext('focus should return to the picker input')
                    .toBeTrue();
                expect(datePicker.isFocused).toBeTrue();
            }));
        });

        describe('NgControl integration', () => {
            let fixture: ComponentFixture<IgxDatePickerNgModelComponent |
                IgxDatePickerInFormComponent |
                IgxDatePickerReactiveFormComponent>;
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

                (fixture.componentInstance as IgxDatePickerNgModelComponent).isRequired = false;
                fixture.detectChanges();

                expect(inputGroup.isRequired).toBeFalsy();
            });

            it('should set validity to initial when the form is reset', fakeAsync(() => {
                fixture = TestBed.createComponent(IgxDatePickerInFormComponent);
                fixture.detectChanges();
                datePicker = fixture.componentInstance.datePicker;

                const input = document.getElementsByClassName('igx-input-group__input')[0] as HTMLInputElement;
                input.focus();
                tick();
                fixture.detectChanges();

                datePicker.clear();
                expect((datePicker as any).inputDirective.valid).toEqual(IgxInputState.INVALID);

                (fixture.componentInstance as IgxDatePickerInFormComponent).form.resetForm();
                tick();
                expect((datePicker as any).inputDirective.valid).toEqual(IgxInputState.INITIAL);
            }));

            it('should apply asterix properly when required validator is set dynamically', () => {
                fixture = TestBed.createComponent(IgxDatePickerReactiveFormComponent);
                fixture.detectChanges();
                datePicker = fixture.componentInstance.datePicker;

                let inputGroupRequiredClass = fixture.debugElement.query(By.css('.' + CSS_CLASS_INPUT_GROUP_REQUIRED));
                let inputGroupInvalidClass = fixture.debugElement.query(By.css('.' + CSS_CLASS_INPUT_GROUP_INVALID));
                // let asterisk = window.
                //     getComputedStyle(fixture.debugElement.query(By.css('.' + CSS_CLASS_INPUT_GROUP_LABEL)).nativeElement, ':after').
                //     content;
                // expect(asterisk).toBe('"*"');
                expect(inputGroupRequiredClass).toBeDefined();
                expect(inputGroupRequiredClass).not.toBeNull();

                datePicker.clear();
                fixture.detectChanges();

                inputGroupInvalidClass = fixture.debugElement.query(By.css('.' + CSS_CLASS_INPUT_GROUP_INVALID));
                expect(inputGroupInvalidClass).not.toBeNull();
                expect(inputGroupInvalidClass).not.toBeUndefined();

                inputGroupRequiredClass = fixture.debugElement.query(By.css('.' + CSS_CLASS_INPUT_GROUP_REQUIRED));
                expect(inputGroupRequiredClass).not.toBeNull();
                expect(inputGroupRequiredClass).not.toBeUndefined();

                (fixture.componentInstance as IgxDatePickerReactiveFormComponent).removeValidators();
                fixture.detectChanges();

                inputGroupRequiredClass = fixture.debugElement.query(By.css('.' + CSS_CLASS_INPUT_GROUP_REQUIRED));
                // asterisk = window.
                //     getComputedStyle(fixture.debugElement.query(By.css('.' + CSS_CLASS_INPUT_GROUP_LABEL)).nativeElement, ':after').
                //     content;
                expect(inputGroupRequiredClass).toBeNull();
                // expect(asterisk).toBe('none');

                (fixture.componentInstance as IgxDatePickerReactiveFormComponent).addValidators();
                fixture.detectChanges();

                inputGroupRequiredClass = fixture.debugElement.query(By.css('.' + CSS_CLASS_INPUT_GROUP_REQUIRED));
                // asterisk = window.
                //     getComputedStyle(fixture.debugElement.query(By.css('.' + CSS_CLASS_INPUT_GROUP_LABEL)).nativeElement, ':after').
                //     content;
                expect(inputGroupRequiredClass).toBeDefined();
                expect(inputGroupRequiredClass).not.toBeNull();
                // expect(asterisk).toBe('"*"');
            });

            it('Should the weekStart property takes precedence over locale.', fakeAsync(() => {
                fixture = TestBed.createComponent(IgxDatePickerReactiveFormComponent);
                fixture.detectChanges();
                datePicker = fixture.componentInstance.datePicker;

                datePicker.locale = 'en';
                fixture.detectChanges();

                expect(datePicker.weekStart).toEqual(0);

                datePicker.weekStart = WEEKDAYS.FRIDAY;
                expect(datePicker.weekStart).toEqual(5);

                datePicker.locale = 'fr';
                fixture.detectChanges();

                expect(datePicker.weekStart).toEqual(5);

                flush();
            }));

            it('Should passing invalid value for locale, then setting weekStart must be respected.', fakeAsync(() => {
                fixture = TestBed.createComponent(IgxDatePickerReactiveFormComponent);
                fixture.detectChanges();
                datePicker = fixture.componentInstance.datePicker;

                const locale = 'en-US';
                datePicker.locale = locale;
                fixture.detectChanges();

                expect(datePicker.locale).toEqual(locale);
                expect(datePicker.weekStart).toEqual(WEEKDAYS.SUNDAY)

                datePicker.locale = 'frrr';
                datePicker.weekStart = WEEKDAYS.FRIDAY;
                fixture.detectChanges();

                expect(datePicker.locale).toEqual('en-US');
                expect(datePicker.weekStart).toEqual(WEEKDAYS.FRIDAY);
            }));

            it('should set initial validity state when the form group is disabled', () => {
                fixture = TestBed.createComponent(IgxDatePickerReactiveFormComponent);
                fixture.detectChanges();
                datePicker = fixture.componentInstance.datePicker;

                (fixture.componentInstance as IgxDatePickerReactiveFormComponent).markAsTouched();
                fixture.detectChanges();
                expect((datePicker as any).inputDirective.valid).toBe(IgxInputState.INVALID);

                (fixture.componentInstance as IgxDatePickerReactiveFormComponent).disableForm();
                fixture.detectChanges();
                expect((datePicker as any).inputDirective.valid).toBe(IgxInputState.INITIAL);
            });

            it('should update validity state when programmatically setting errors on reactive form controls', () => {
                fixture = TestBed.createComponent(IgxDatePickerReactiveFormComponent);
                fixture.detectChanges();
                datePicker = fixture.componentInstance.datePicker;
                const form = (fixture.componentInstance as IgxDatePickerReactiveFormComponent).form as UntypedFormGroup;

                // the form control has validators
                form.markAllAsTouched();
                form.get('date').setErrors({ error: true });
                fixture.detectChanges();

                expect((datePicker as any).inputDirective.valid).toBe(IgxInputState.INVALID);
                expect((datePicker as any).inputGroup.element.nativeElement.classList.contains(CSS_CLASS_INPUT_GROUP_INVALID)).toBe(true);
                expect((datePicker as any).inputGroup.element.nativeElement.classList.contains(CSS_CLASS_INPUT_GROUP_REQUIRED)).toBe(true);

                // remove the validators and set errors
                (fixture.componentInstance as IgxDatePickerReactiveFormComponent).removeValidators();
                form.markAsUntouched();
                fixture.detectChanges();

                form.markAllAsTouched();
                form.get('date').setErrors({ error: true });
                fixture.detectChanges();

                // no validator, but there is a set error
                expect((datePicker as any).inputDirective.valid).toBe(IgxInputState.INVALID);
                expect((datePicker as any).inputGroup.element.nativeElement.classList.contains(CSS_CLASS_INPUT_GROUP_INVALID)).toBe(true);
                expect((datePicker as any).inputGroup.element.nativeElement.classList.contains(CSS_CLASS_INPUT_GROUP_REQUIRED)).toBe(false);
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

        describe('Templated Header', () => {
            let fixture: ComponentFixture<IgxDatePickerWithTemplatesComponent>;

            beforeEach(fakeAsync(() => {
              TestBed.configureTestingModule({
                imports: [IgxDatePickerWithTemplatesComponent]
              }).compileComponents();

              fixture = TestBed.createComponent(IgxDatePickerWithTemplatesComponent);
              fixture.detectChanges();
            }));

            it('Should use the custom template for header title', fakeAsync(() => {
              const testDate = new Date(2024, 10, 11);
              fixture.componentInstance.datePicker.value = testDate;
              fixture.componentInstance.datePicker.open();
              tick();
              fixture.detectChanges();

              const headerTitleElement = fixture.debugElement.query(By.css('.igx-calendar__header-year'));
              expect(headerTitleElement).toBeTruthy('Header title element should be present');
              if (headerTitleElement) {
                expect(headerTitleElement.nativeElement.textContent.trim()).toBe('2024');
              }
            }));

            it('Should use the custom template for header', fakeAsync(() => {
              const testDate = new Date(2024, 10, 11);
              fixture.componentInstance.datePicker.value = testDate;
              fixture.componentInstance.datePicker.open();
              tick();
              fixture.detectChanges();

              const headerElement = fixture.debugElement.query(By.css('.igx-calendar__header-date'));
              expect(headerElement).toBeTruthy('Header element should be present');
              if (headerElement) {
                expect(headerElement.nativeElement.textContent.trim()).toBe('Nov');
              }
            }));
        });

        describe('UI Interaction', () => {
            let fixture: ComponentFixture<any>;
            let datePicker: IgxDatePickerComponent;

            beforeEach(fakeAsync(() => {
                fixture = TestBed.createComponent(IgxDatePickerTestComponent);
                fixture.detectChanges();
                datePicker = fixture.componentInstance.datePicker;
            }));

            it('should activate today\'s date when reopening the calendar', fakeAsync(() => {
                datePicker.clear();
                datePicker.open();
                expect(datePicker.value).toEqual(null);
                expect(datePicker.collapsed).toBeFalsy();

                datePicker.close();
                tick();
                fixture.detectChanges();
                expect(datePicker.collapsed).toBeTruthy();

                datePicker.open();
                tick();
                fixture.detectChanges();
                expect(datePicker.collapsed).toBeFalsy();

                const today = new Date(new Date().setHours(0, 0, 0, 0)).getTime().toString();
                const wrapper = fixture.debugElement.query(By.css('.igx-calendar__wrapper')).nativeElement;
                expect(wrapper.getAttribute('aria-activedescendant')).toEqual(today);
                expect(wrapper.contains(document.activeElement))
                    .withContext('focus should move to calendar for KB nav')
                    .toBeTrue();
            }));

            it('should focus today\'s date when an invalid date is selected', fakeAsync(() => {
                datePicker.clear();
                expect(datePicker.value).toEqual(null);
                expect(datePicker.collapsed).toBeTruthy();

                datePicker.select(new Date('test'));
                datePicker.open();
                tick();
                fixture.detectChanges();
                expect(datePicker.collapsed).toBeFalsy();

                const today = new Date(new Date().setHours(0, 0, 0, 0)).getTime().toString();
                const wrapper = fixture.debugElement.query(By.css('.igx-calendar__wrapper')).nativeElement;
                expect(wrapper.getAttribute('aria-activedescendant')).toEqual(today);
                expect(wrapper.contains(document.activeElement))
                    .withContext('focus should move to calendar for KB nav')
                    .toBeTrue();
            }));

            it('should return focus to date picker input after calendar click select', fakeAsync(() => {
                const inputGroup = fixture.debugElement.query(By.directive(IgxInputGroupComponent)).nativeElement;

                datePicker.clear();
                datePicker.open();
                tick();
                fixture.detectChanges();

                const today = new Date(new Date().setHours(0, 0, 0, 0));
                const todayTime = today.getTime().toString();
                const todayDayItem = fixture.debugElement.query(By.css(`#${CSS.escape(todayTime)}`)).nativeElement;

                todayDayItem.click();
                tick();
                fixture.detectChanges();
                expect(datePicker.value).toEqual(today);
                expect(inputGroup.contains(document.activeElement))
                    .withContext('focus should return to the picker input')
                    .toBeTrue();
            }));
        });

        describe('Input and Display formats', () => {
            let fixture: ComponentFixture<any>;
            let datePicker: IgxDatePickerComponent;
            let dateTimeEditor: IgxDateTimeEditorDirective;

            beforeEach(fakeAsync(() => {
                fixture = TestBed.createComponent(IgxDatePickerTestComponent);
                registerLocaleData(localeBg);
                registerLocaleData(localeES);
                fixture.detectChanges();
                datePicker = fixture.componentInstance.datePicker;
                dateTimeEditor = fixture.debugElement.query(By.directive(IgxDateTimeEditorDirective)).
                    injector.get(IgxDateTimeEditorDirective);
            }));

            it('should set default inputFormat, if none, to the editor with parts for day, month and year based on locale', () => {
                datePicker.locale = 'en-US';
                fixture.detectChanges();
                expect(dateTimeEditor.inputFormat).toEqual('MM/dd/yyyy');

                datePicker.locale = 'bg-BG';
                fixture.detectChanges();
                expect(dateTimeEditor.inputFormat.normalize('NFKC')).toEqual('dd.MM.yyyy г.');

                datePicker.locale = 'es-ES';
                fixture.detectChanges();
                expect(dateTimeEditor.inputFormat).toEqual('dd/MM/yyyy');
            });

            it('should resolve inputFormat, if not set, to the editor to the value of displayFormat if it contains only numeric date/time parts', fakeAsync(() => {
                datePicker.locale = 'en-US';
                fixture.detectChanges();

                datePicker.displayFormat = 'dd/MM/yyyy';
                fixture.detectChanges();
                expect(dateTimeEditor.inputFormat).toEqual('dd/MM/yyyy');

                datePicker.displayFormat = 'shortDate';
                fixture.detectChanges();
                expect(dateTimeEditor.inputFormat).toEqual('MM/dd/yyyy');
            }));

            it('should resolve to the default locale-based input format for the editor in case inputFormat is not set and displayFormat contains non-numeric date/time parts', fakeAsync(() => {
                datePicker.locale = 'en-US';
                datePicker.displayFormat = 'MMM d, y, h:mm:ss a';
                fixture.detectChanges();
                expect(dateTimeEditor.inputFormat).toEqual('MM/dd/yyyy');

                datePicker.locale = 'bg-BG';
                datePicker.displayFormat = 'full';
                fixture.detectChanges();
                expect(dateTimeEditor.inputFormat.normalize('NFKC')).toEqual('dd.MM.yyyy г.');

                datePicker.locale = 'es-ES';
                datePicker.displayFormat = 'MMM d, y';
                fixture.detectChanges();
                expect(dateTimeEditor.inputFormat).toEqual('dd/MM/yyyy');
            }));
        });
    });

    describe('Unit Tests', () => {
        let overlay: IgxOverlayService;
        let mockOverlayEventArgs: OverlayEventArgs & OverlayCancelableEventArgs;
        let mockInjector;
        let mockCdr;
        let mockInputGroup: Partial<IgxInputGroupComponent>;
        let datePicker: IgxDatePickerComponent;
        let mockDateEditor: any;
        let mockCalendar: Partial<IgxCalendarComponent>;
        let mockInputDirective: any;
        const viewsContainerRef = {} as any;
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

            mockCdr = jasmine.createSpyObj('ChangeDetectorRef', ['detectChanges']);

            mockCalendar = { selected: new EventEmitter<any>() };
            const mockComponentInstance = {
                calendar: mockCalendar,
                todaySelection: new EventEmitter<any>(),
                calendarClose: new EventEmitter<any>()
            };
            const mockComponentRef = {
                instance: mockComponentInstance,
                location: { nativeElement: undefined }
            } as any;
            mockOverlayEventArgs = {
                id: mockOverlayId,
                componentRef: mockComponentRef,
                cancel: false
            };
            overlay = {
                opening: new EventEmitter<OverlayCancelableEventArgs>(),
                opened: new EventEmitter<OverlayEventArgs>(),
                closed: new EventEmitter<OverlayEventArgs>(),
                closing: new EventEmitter<OverlayClosingEventArgs>(),
                show(..._args) {
                    this.opening.emit(Object.assign({}, mockOverlayEventArgs, { cancel: false }));
                    this.opened.emit(mockOverlayEventArgs);
                },
                hide(..._args) {
                    this.closing.emit(Object.assign({}, mockOverlayEventArgs, { cancel: false }));
                    this.closed.emit(mockOverlayEventArgs);
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
                valid: IgxInputState.INITIAL,
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
                focus: () => { }
            };
            datePicker = new IgxDatePickerComponent(elementRef, 'en-US', overlay, mockInjector, renderer2, null, mockCdr);
            (datePicker as any).inputGroup = mockInputGroup;
            (datePicker as any).inputDirective = mockInputDirective;
            (datePicker as any).dateTimeEditor = mockDateEditor;
            (datePicker as any).viewContainerRef = viewsContainerRef;
            // TODO: TEMP workaround for afterViewInit call in unit tests:
            datePicker.clearComponents = new QueryList<any>();
            datePicker.toggleComponents = new QueryList<any>();
        });

        afterEach(() => {
            datePicker?.ngOnDestroy();
            UIInteractions.clearOverlay();
        });
        describe('API tests', () => {
            registerLocaleData(localeES);
            it('Should initialize and update all inputs properly', () => {
                // no ngControl initialized
                expect(datePicker.required).toEqual(false);
                datePicker.ngOnInit();
                datePicker.ngAfterViewInit();
                expect(datePicker.collapsed).toBeTruthy();
                expect(datePicker.disabled).toBeFalsy();
                expect(datePicker.disabledDates).toEqual(null);
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
                expect(datePicker.locale).toEqual('en-US');
                expect(datePicker.placeholder).toEqual('');
                expect(datePicker.readOnly).toEqual(false);
                expect(datePicker.value).toEqual(undefined);
                expect(datePicker.formatter).toEqual(undefined);
                expect(() => datePicker.displayValue.transform(today)).toThrow();
                // set
                datePicker.open();
                overlay.opened.emit(mockOverlayEventArgs);
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
                datePicker.displayFormat = 'MM/yy/DD';
                expect(datePicker.displayFormat).toEqual('MM/yy/DD');
                datePicker.displayMonthsCount = Infinity;
                expect(datePicker.displayMonthsCount).toEqual(Infinity);
                datePicker.displayMonthsCount = 0;
                expect(datePicker.displayMonthsCount).toEqual(0);
                datePicker.displayMonthsCount = 12;
                expect(datePicker.displayMonthsCount).toEqual(12);
                let newFormat: any = { day: '2-digit' };
                datePicker.calendarFormat = newFormat;
                // this SHOULD NOT mutate the underlying base settings
                expect((datePicker as any).pickerCalendarFormat).toEqual({
                    day: '2-digit',
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
                expect(overlay.attach).toHaveBeenCalledWith(IgxCalendarContainerComponent, viewsContainerRef, baseDialogSettings);
                expect(overlay.show).toHaveBeenCalledWith(mockOverlayId);
                isDropdownSpy.and.returnValue(true);
                datePicker.open();
                expect(overlay.attach).toHaveBeenCalledWith(IgxCalendarContainerComponent, viewsContainerRef, baseDropdownSettings);
                expect(overlay.show).toHaveBeenCalledWith(mockOverlayId);
                const mockOutlet = {} as any;
                datePicker.outlet = mockOutlet;
                datePicker.open();
                expect(overlay.attach).toHaveBeenCalledWith(
                    IgxCalendarContainerComponent,
                    viewsContainerRef,
                    Object.assign({}, baseDropdownSettings, { outlet: mockOutlet }),
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
                    viewsContainerRef,
                    Object.assign({}, baseDropdownSettings, mockSettings),
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
                    viewsContainerRef,
                    Object.assign({}, baseDialogSettings, mockSettings),
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
                    viewsContainerRef,
                    Object.assign({}, baseDropdownSettings, { modal: true }),
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
                overlay.closed.emit(mockOverlayEventArgs);
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
                expect(datePicker.validationFailed.emit).toHaveBeenCalledWith(
                    { owner: datePicker, prevValue: validDate, currentValue: invalidDate });
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
                overlay.opening.emit(mockOverlayEventArgs);
                spyOn(datePicker, 'close');
                expect(datePicker.close).not.toHaveBeenCalled();
                // calendar instance is initialized properly
                expect(mockCalendar.hasHeader).toEqual(!datePicker.isDropdown);
                expect(mockCalendar.formatOptions).toEqual((datePicker as any).pickerCalendarFormat);
                expect(mockCalendar.formatViews).toEqual((datePicker as any).pickerFormatViews);
                expect(mockCalendar.locale).toEqual(datePicker.locale);
                expect(mockCalendar.headerOrientation).toEqual(datePicker.headerOrientation);
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
                // if the value is falsy or InvalidDate, hours, minutes and seconds will not be mapped
                expect(mockDate2.getHours).not.toHaveBeenCalled();
                expect(mockDate2.getMinutes).not.toHaveBeenCalled();
                expect(mockDate2.getSeconds).not.toHaveBeenCalled();
                expect(mockDate2.getMilliseconds).not.toHaveBeenCalled();
                expect(mockDate1.setHours).not.toHaveBeenCalledWith(999);
                expect(mockDate1.setMinutes).not.toHaveBeenCalledWith(999);
                expect(mockDate1.setSeconds).not.toHaveBeenCalledWith(999);
                expect(mockDate1.setMilliseconds).not.toHaveBeenCalledWith(999);
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
                overlay.opening.emit(mockOverlayEventArgs);
                expect(mockCalendar.disabledDates).toEqual([]);
                datePicker.maxValue = mockMaxValue;
                overlay.opening.emit(mockOverlayEventArgs);
                expect(mockCalendar.disabledDates).toEqual([{ type: DateRangeType.After, dateRange: [mockMaxValue] }]);
                mockCalendar.disabledDates = [];
                datePicker.maxValue = undefined;
                datePicker.minValue = mockMinValue;
                overlay.opening.emit(mockOverlayEventArgs);
                expect(mockCalendar.disabledDates).toEqual([{ type: DateRangeType.Before, dateRange: [mockMinValue] }]);
                mockCalendar.disabledDates = [];
                datePicker.maxValue = mockMaxValue;
                overlay.opening.emit(mockOverlayEventArgs);
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
                overlay.opening.emit(mockOverlayEventArgs);
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
                overlay.opening.emit(mockOverlayEventArgs);
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
                overlay.opening.emit(mockOverlayEventArgs);
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
                expect(mockInputDirective.valid).toEqual(IgxInputState.INITIAL);
                mockNgControl.statusChanges.emit();
                expect(mockInputDirective.valid).toEqual(IgxInputState.INITIAL);
                mockControlInstance.touched = true;
                mockNgControl.statusChanges.emit();
                expect(mockInputDirective.valid).toEqual(IgxInputState.INITIAL);
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
    </igx-date-picker>`,
    imports: [IgxDatePickerComponent]
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
        </igx-date-picker>`,
    imports: [IgxDatePickerComponent, FormsModule]
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
    `,
    imports: [IgxDatePickerComponent, IgxLabelDirective]
})
export class IgxDatePickerTestKbrdComponent {
    @ViewChild(IgxDatePickerComponent) public datePicker: IgxDatePickerComponent;
    public mode: PickerInteractionMode = PickerInteractionMode.DropDown;
    public date = new Date(2021, 24, 2, 11, 45, 0);
}

@Component({
    template: `
    <igx-date-picker [mode]="mode">
        <label igxLabel>Label</label>
        <igx-picker-toggle igxPrefix *ngIf="showCustomToggle">CustomToggle</igx-picker-toggle>
        <igx-prefix>Prefix</igx-prefix>
        <igx-picker-clear igxSuffix *ngIf="showCustomClear">CustomClear</igx-picker-clear>
        <igx-suffix>Suffix</igx-suffix>
        <igx-hint>Hint</igx-hint>
    </igx-date-picker>`,
    imports: [IgxDatePickerComponent, IgxPickerToggleComponent, IgxPrefixDirective, IgxPickerClearComponent, IgxLabelDirective, IgxSuffixDirective, IgxHintDirective, NgIf]
})
export class IgxDatePickerWithProjectionsComponent {
    @ViewChild(IgxDatePickerComponent) public datePicker: IgxDatePickerComponent;
    @ViewChild(IgxPickerToggleComponent) public customToggle: IgxPickerToggleComponent;
    @ViewChild(IgxPickerClearComponent) public customClear: IgxPickerClearComponent;
    public mode: PickerInteractionMode = PickerInteractionMode.DropDown;
    public showCustomToggle = false;
    public showCustomClear = false;
}

@Component({
    template: `
    <igx-date-picker [mode]="mode">
        <ng-template igxCalendarHeaderTitle let-formatCalendar>{{ formatCalendar.year.value }}</ng-template>
        <ng-template igxCalendarHeader let-formatCalendar>{{ formatCalendar.month.value }}</ng-template>
    </igx-date-picker>`,
    imports: [IgxDatePickerComponent, IgxCalendarHeaderTemplateDirective, IgxCalendarHeaderTitleTemplateDirective]
})
export class IgxDatePickerWithTemplatesComponent {
    @ViewChild(IgxDatePickerComponent) public datePicker: IgxDatePickerComponent;
    public mode: PickerInteractionMode = PickerInteractionMode.Dialog;
}

@Component({
    template: `
    <form #form="ngForm">
        <igx-date-picker name="datePicker" id="datePicker" [(ngModel)]="date" [required]="true"></igx-date-picker>
    </form>
    `,
    imports: [IgxDatePickerComponent, FormsModule]
})
export class IgxDatePickerInFormComponent {
    @ViewChild('form')
    public form: NgForm;

    @ViewChild(IgxDatePickerComponent)
    public datePicker: IgxDatePickerComponent;

    public date: Date = new Date(2012, 5, 3);
}

@Component({
    template: `
    <form [formGroup]="form">
        <div class="date-picker-wrapper">
            <igx-date-picker formControlName="date" [value]="date">
                <label igxLabel>Date </label>
            </igx-date-picker>
        </div>
    </form>
    `,
    imports: [IgxDatePickerComponent, ReactiveFormsModule, IgxLabelDirective]
})
export class IgxDatePickerReactiveFormComponent {
    @ViewChild(IgxDatePickerComponent)
    public datePicker: IgxDatePickerComponent;

    public date: Date = new Date(2012, 5, 3);

    public form: UntypedFormGroup = new UntypedFormGroup({
        date: new UntypedFormControl(null, Validators.required)
    });

    public removeValidators() {
        this.form.get('date').clearValidators();
        this.form.get('date').updateValueAndValidity();
    }

    public addValidators() {
        this.form.get('date').setValidators(Validators.required);
        this.form.get('date').updateValueAndValidity();
    }

    public markAsTouched() {
        this.form.get('date').markAsTouched();
        this.form.get('date').updateValueAndValidity();
    }

    public disableForm() {
        this.form.disable();
    }
}
