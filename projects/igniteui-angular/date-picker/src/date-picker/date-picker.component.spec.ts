import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UntypedFormControl, UntypedFormGroup, FormsModule, NgForm, ReactiveFormsModule, Validators } from '@angular/forms';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { UIInteractions } from '../../../test-utils/ui-interactions.spec';
import { IgxHintDirective, IgxInputGroupComponent, IgxInputState, IgxLabelDirective, IgxPrefixDirective, IgxSuffixDirective } from '../../../input-group/src/public_api';
import { IFormattingViews, IgxCalendarComponent, IgxCalendarHeaderTemplateDirective, IgxCalendarHeaderTitleTemplateDirective } from '../../../calendar/src/public_api';
import { IgxCalendarContainerComponent } from './calendar-container/calendar-container.component';
import { IgxDatePickerComponent } from './date-picker.component';
import { IgxOverlayOutletDirective, IgxOverlayService, OverlayCancelableEventArgs, OverlayClosingEventArgs, OverlayEventArgs, OverlaySettings, WEEKDAYS, BaseFormatter, I18N_FORMATTER } from 'igniteui-angular/core';
import { ChangeDetectorRef, Component, DebugElement, ElementRef, EventEmitter, Injector, QueryList, Renderer2, viewChild, ViewChild } from '@angular/core';
import { By } from '@angular/platform-browser';
import { PickerCalendarOrientation, PickerHeaderOrientation, PickerInteractionMode } from '../../../core/src/date-common/types';
import { DatePart } from '../../../core/src/date-common/public_api';
import { DateRangeDescriptor, DateRangeType } from 'igniteui-angular/core';
import { IgxPickerClearComponent, IgxPickerToggleComponent } from '../../../core/src/date-common/public_api';
import { DateTimeUtil } from '../../../core/src/date-common/util/date-time.util';
import { registerLocaleData } from "@angular/common";
import localeES from "@angular/common/locales/es";
import localeBg from "@angular/common/locales/bg";
import { IgxDateTimeEditorDirective } from '../../../directives/src/directives/date-time-editor/date-time-editor.directive';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

const CSS_CLASS_DATE_PICKER = 'igx-date-picker';

const DATE_PICKER_TOGGLE_ICON = 'calendar_today';
const DATE_PICKER_CLEAR_ICON = 'clear';

const CSS_CLASS_INPUT_GROUP_REQUIRED = 'igx-input-group--required';
const CSS_CLASS_INPUT_GROUP_INVALID = 'igx-input-group--invalid';
const CSS_CLASS_CALENDAR_HEADER = '.igx-calendar__header';
const CSS_CLASS_CALENDAR_WRAPPER_VERTICAL = 'igx-calendar__wrapper--vertical';

describe('IgxDatePicker', () => {
    describe('Integration tests', () => {
        beforeEach(async () => {
            await TestBed.configureTestingModule({
                imports: [
                    NoopAnimationsModule,
                    IgxDatePickerTestKeyBindsComponent,
                    IgxDatePickerTestComponent,
                    IgxDatePickerNgModelComponent,
                    IgxDatePickerWithProjectionsComponent,
                    IgxDatePickerWithTemplatesComponent,
                    IgxDatePickerInFormComponent,
                    IgxDatePickerReactiveFormComponent
                ]
            }).compileComponents();
        });

        describe('Rendering', () => {
            let fixture: ComponentFixture<IgxDatePickerTestComponent>;
            let datePicker: IgxDatePickerComponent;
            let detectChanges: () => void;

            beforeEach(async () => {
                vi.useFakeTimers();
                fixture = TestBed.createComponent(IgxDatePickerTestComponent);
                fixture.detectChanges();
                await fixture.whenStable();

                datePicker = fixture.componentInstance.datePicker();
                detectChanges = () => fixture.changeDetectorRef.detectChanges();
            });

            afterEach(() => {
                vi.useRealTimers();
            });

            it('Should render default toggle and clear icons', () => {
                const inputGroup = fixture.debugElement.query(By.directive(IgxInputGroupComponent));
                const prefix = inputGroup.queryAll(By.directive(IgxPrefixDirective));
                expect(prefix).toHaveLength(1);
                expect(prefix[0].nativeElement.innerText).toEqual(DATE_PICKER_TOGGLE_ICON);
                const suffix = inputGroup.queryAll(By.directive(IgxSuffixDirective));
                expect(suffix).toHaveLength(1);
                expect(suffix[0].nativeElement.innerText).toEqual(DATE_PICKER_CLEAR_ICON);
            });

            it('should hide the calendar header if hideHeader is true in dialog mode', async () => {
                datePicker.mode = 'dialog';
                datePicker.hideHeader = true;
                datePicker.open();
                detectChanges();
                await vi.runAllTimersAsync();

                expect(datePicker['_calendar'].hasHeader).toBe(false);
                const calendarHeader = fixture.debugElement.query(By.css(CSS_CLASS_CALENDAR_HEADER));
                expect(calendarHeader, 'Calendar header should not be present').toBeFalsy();
            });

            it('should set calendar orientation property', async () => {
                datePicker.orientation = PickerCalendarOrientation.Horizontal;
                datePicker.open();
                await vi.runAllTimersAsync();
                detectChanges();

                expect(datePicker['_calendar'].orientation).toEqual(PickerCalendarOrientation.Horizontal.toString());
                expect(datePicker['_calendar'].wrapper.nativeElement.classList.contains(CSS_CLASS_CALENDAR_WRAPPER_VERTICAL)).toBe(false);

                datePicker.close();
                await vi.runAllTimersAsync();
                detectChanges();

                datePicker.orientation = PickerCalendarOrientation.Vertical;
                datePicker.open();
                await vi.runAllTimersAsync();
                detectChanges();

                expect(datePicker['_calendar'].orientation).toEqual(PickerCalendarOrientation.Vertical.toString());
                expect(datePicker['_calendar'].wrapper.nativeElement.classList.contains(CSS_CLASS_CALENDAR_WRAPPER_VERTICAL)).toBe(true);
            });

            it('should initialize activeDate with current date, when not set', async () => {
                datePicker.value = null;
                detectChanges();
                const todayDate = new Date();
                const today = new Date(todayDate.setHours(0, 0, 0, 0)).getTime().toString();

                expect(datePicker.activeDate).toEqual(todayDate);

                datePicker.open();
                await vi.runAllTimersAsync();
                detectChanges();

                expect(datePicker['_calendar'].activeDate).toEqual(todayDate);
                expect(datePicker['_calendar'].value).toBeUndefined();
                const wrapper = fixture.debugElement.query(By.css('.igx-calendar__wrapper')).nativeElement;
                expect(wrapper.getAttribute('aria-activedescendant')).toEqual(today);
            });

            it('should initialize activeDate = value when it is not set, but value is', async () => {
                const date = fixture.componentInstance.date;

                expect(datePicker.activeDate).toEqual(date);
                datePicker.open();
                await vi.runAllTimersAsync();
                detectChanges();

                const activeDescendantDate = new Date(date.setHours(0, 0, 0, 0)).getTime().toString();
                expect(datePicker['_calendar'].activeDate).toEqual(date);
                expect(datePicker['_calendar'].value).toEqual(date);
                const wrapper = fixture.debugElement.query(By.css('.igx-calendar__wrapper')).nativeElement;
                expect(wrapper.getAttribute('aria-activedescendant')).toEqual(activeDescendantDate);
            });

            it('should set activeDate correctly', async () => {
                const targetDate = new Date(2025, 0, 1);
                datePicker.activeDate = new Date(targetDate);
                detectChanges();

                expect(datePicker.activeDate).toEqual(targetDate);
                expect(datePicker.value).toEqual(fixture.componentInstance.date);

                datePicker.open();
                await vi.runAllTimersAsync();
                detectChanges();

                const activeDescendantDate = new Date(targetDate.setHours(0, 0, 0, 0)).getTime().toString();
                expect(datePicker['_calendar'].activeDate).toEqual(targetDate);
                expect(datePicker['_calendar'].viewDate.getMonth()).toEqual(targetDate.getMonth());
                expect(datePicker['_calendar'].value).toEqual(fixture.componentInstance.date);
                const wrapper = fixture.debugElement.query(By.css('.igx-calendar__wrapper')).nativeElement;
                expect(wrapper.getAttribute('aria-activedescendant')).toEqual(activeDescendantDate);
            });

            it('should set activeDate of the calendar to value of picker even when it is outside the enabled range, i.e. > maxValue', async () => {
                const maxDate = new Date(2025, 7, 1);
                datePicker.maxValue = maxDate;
                detectChanges();

                const valueGreaterThanMax = new Date(2025, 10, 1);
                datePicker.value = valueGreaterThanMax;
                detectChanges();

                expect(datePicker.activeDate).toEqual(valueGreaterThanMax);

                datePicker.open();
                await vi.runAllTimersAsync();
                detectChanges();

                const activeDescendantDate = new Date(valueGreaterThanMax.setHours(0, 0, 0, 0)).getTime().toString();
                expect(datePicker['_calendar'].activeDate).toEqual(valueGreaterThanMax);
                expect(datePicker['_calendar'].viewDate.getMonth()).toEqual(valueGreaterThanMax.getMonth());
                expect(datePicker['_calendar'].value).toEqual(valueGreaterThanMax);
                const wrapper = fixture.debugElement.query(By.css('.igx-calendar__wrapper')).nativeElement;
                expect(wrapper.getAttribute('aria-activedescendant')).toEqual(activeDescendantDate);
            });
        });

        describe('Events', () => {
            let fixture: ComponentFixture<any>;
            let datePicker: IgxDatePickerComponent;
            let detectChanges: () => void;

            beforeEach(async () => {
                vi.useFakeTimers();
                fixture = TestBed.createComponent(IgxDatePickerTestComponent);
                fixture.detectChanges();

                datePicker = fixture.componentInstance.datePicker();
                detectChanges = () => fixture.changeDetectorRef.detectChanges();
            });

            afterEach(() => {
                vi.useRealTimers();
            });

            it('should be able to cancel opening/closing', async () => {
                vi.spyOn(datePicker.opening, 'emit');
                vi.spyOn(datePicker.opened, 'emit');
                vi.spyOn(datePicker.closing, 'emit');
                vi.spyOn(datePicker.closed, 'emit');

                const openingSub = datePicker.opening.subscribe((event) => event.cancel = true);

                datePicker.open();
                await vi.runAllTimersAsync();
                detectChanges();

                expect(datePicker.collapsed).toBeTruthy();
                expect(datePicker.opening.emit).toHaveBeenCalled();
                expect(datePicker.opened.emit).not.toHaveBeenCalled();

                openingSub.unsubscribe();

                const closingSub = datePicker.closing.subscribe((event) => event.cancel = true);

                datePicker.open();
                await vi.runAllTimersAsync();
                detectChanges();

                datePicker.close();
                await vi.runAllTimersAsync();
                detectChanges();

                expect(datePicker.collapsed).toBeFalsy();
                expect(datePicker.closing.emit).toHaveBeenCalled();
                expect(datePicker.closed.emit).not.toHaveBeenCalled();

                closingSub.unsubscribe();
                (datePicker as any)._overlayService.detachAll();
            });
        });

        describe('Keyboard navigation', () => {
            let fixture: ComponentFixture<IgxDatePickerTestKeyBindsComponent>;
            let datePicker: IgxDatePickerComponent;
            let inputGroup: DebugElement;
            let detectChanges: () => void;

            beforeEach(async () => {
                vi.useFakeTimers();
                fixture = TestBed.createComponent(IgxDatePickerTestKeyBindsComponent);
                fixture.detectChanges();

                datePicker = fixture.componentInstance.datePicker();
                inputGroup = fixture.debugElement.query(By.directive(IgxInputGroupComponent));
                detectChanges = () => fixture.changeDetectorRef.detectChanges();
            });

            afterEach(() => {
                vi.useRealTimers();
            });

            it('should toggle the calendar with ALT + DOWN/UP ARROW key', async () => {
                vi.spyOn(datePicker.opening, 'emit');
                vi.spyOn(datePicker.opened, 'emit');
                vi.spyOn(datePicker.closing, 'emit');
                vi.spyOn(datePicker.closed, 'emit');

                expect(datePicker.collapsed).toBeTruthy();
                expect(datePicker.isFocused).toBe(false);

                const picker = fixture.debugElement.query(By.css(CSS_CLASS_DATE_PICKER));
                UIInteractions.triggerEventHandlerKeyDown('ArrowDown', picker, true);
                await vi.runAllTimersAsync();
                detectChanges();

                expect(datePicker.collapsed).toBeFalsy();
                expect(datePicker.opening.emit).toHaveBeenCalledTimes(1);
                expect(datePicker.opened.emit).toHaveBeenCalledTimes(1);

                const calendarWrapper = fixture.debugElement.query(By.css('.igx-calendar__wrapper')).nativeElement;
                expect(calendarWrapper.contains(document.activeElement), 'focus should move to calendar for KB nav').toBe(true);
                expect(datePicker.isFocused).toBe(true);

                UIInteractions.triggerKeyDownEvtUponElem('ArrowUp', calendarWrapper, true, true);
                await vi.runAllTimersAsync();
                detectChanges();

                expect(datePicker.collapsed).toBeTruthy();
                expect(datePicker.closing.emit).toHaveBeenCalledTimes(1);
                expect(datePicker.closed.emit).toHaveBeenCalledTimes(1);
                expect(inputGroup.nativeElement.contains(document.activeElement), 'focus should return to the picker input').toBe(true);
                expect(datePicker.isFocused).toBe(true);
            });

            it('should open the calendar with SPACE key', async () => {
                vi.spyOn(datePicker.opening, 'emit');
                vi.spyOn(datePicker.opened, 'emit');
                expect(datePicker.collapsed).toBeTruthy();

                const picker = fixture.debugElement.query(By.css(CSS_CLASS_DATE_PICKER));
                UIInteractions.triggerEventHandlerKeyDown(' ', picker);
                await vi.runAllTimersAsync();
                detectChanges();

                expect(datePicker.collapsed).toBeFalsy();
                expect(datePicker.opening.emit).toHaveBeenCalledTimes(1);
                expect(datePicker.opened.emit).toHaveBeenCalledTimes(1);

                // wait datepicker to get destroyed and test to cleanup
                await fixture.whenStable();
            });

            it('should close the calendar with ESC', async () => {
                datePicker.mode = 'dropdown';
                vi.spyOn(datePicker.closing, 'emit');
                vi.spyOn(datePicker.closed, 'emit');

                expect(datePicker.collapsed).toBeTruthy();

                datePicker.open();
                await vi.runAllTimersAsync();
                detectChanges();

                expect(datePicker.collapsed).toBeFalsy();
                const calendarWrapper = fixture.debugElement.query(By.css('.igx-calendar__wrapper')).nativeElement;
                expect(calendarWrapper.contains(document.activeElement), 'focus should move to calendar for KB nav').toBe(true);
                expect(datePicker.isFocused).toBe(true);


                UIInteractions.triggerKeyDownEvtUponElem('Escape', calendarWrapper, true);
                await vi.runAllTimersAsync();
                detectChanges();

                expect(datePicker.collapsed).toBeTruthy();
                expect(datePicker.closing.emit).toHaveBeenCalledTimes(1);
                expect(datePicker.closed.emit).toHaveBeenCalledTimes(1);
                expect(inputGroup.nativeElement.contains(document.activeElement), 'focus should return to the picker input').toBe(true);
                expect(datePicker.isFocused).toBe(true);
            });

            it('should update the calendar selection on typing', async () => {
                const date = new Date(2025, 0, 1);
                datePicker.value = date;
                datePicker.open();
                await vi.runAllTimersAsync();
                detectChanges();

                const input = fixture.debugElement.query(By.css('.igx-input-group__input'));
                input.nativeElement.focus();
                await vi.runAllTimersAsync();
                detectChanges();

                UIInteractions.simulateTyping('02/01/2025', input);
                await vi.runAllTimersAsync();
                detectChanges();

                const expectedDate = new Date(2025, 0, 2);
                expect(datePicker.value).toEqual(expectedDate);
                expect(datePicker.activeDate).toEqual(expectedDate);

                const activeDescendantDate = new Date(expectedDate.setHours(0, 0, 0, 0)).getTime().toString();
                expect(datePicker['_calendar'].activeDate).toEqual(expectedDate);
                expect(datePicker['_calendar'].viewDate.getMonth()).toEqual(expectedDate.getMonth());
                expect(datePicker['_calendar'].value).toEqual(expectedDate);
                const wrapper = fixture.debugElement.query(By.css('.igx-calendar__wrapper')).nativeElement;
                expect(wrapper.getAttribute('aria-activedescendant')).toEqual(activeDescendantDate);
            });

            it('should update the calendar view and active date on typing a date that is not in the current view', async () => {
                const date = new Date(2025, 0, 1);
                datePicker.value = date;
                datePicker.open();
                await vi.runAllTimersAsync();
                detectChanges();

                const input = fixture.debugElement.query(By.css('.igx-input-group__input'));
                input.nativeElement.focus();
                await vi.runAllTimersAsync();
                detectChanges();

                UIInteractions.simulateTyping('02/11/2025', input);
                await vi.runAllTimersAsync();
                detectChanges();

                const expectedDate = new Date(2025, 10, 2);
                expect(datePicker.value).toEqual(expectedDate);
                expect(datePicker.activeDate).toEqual(expectedDate);

                const activeDescendantDate = new Date(expectedDate.setHours(0, 0, 0, 0)).getTime().toString();
                expect(datePicker['_calendar'].activeDate).toEqual(expectedDate);
                expect(datePicker['_calendar'].viewDate.getMonth()).toEqual(expectedDate.getMonth());
                expect(datePicker['_calendar'].value).toEqual(expectedDate);
                const wrapper = fixture.debugElement.query(By.css('.igx-calendar__wrapper')).nativeElement;
                expect(wrapper.getAttribute('aria-activedescendant')).toEqual(activeDescendantDate);
            });
        });

        describe('NgControl integration', () => {
            let fixture: ComponentFixture<IgxDatePickerNgModelComponent | IgxDatePickerInFormComponent | IgxDatePickerReactiveFormComponent>;
            let datePicker: IgxDatePickerComponent;
            let detectChanges: () => void;

            beforeEach(async () => {
                fixture = TestBed.createComponent(IgxDatePickerNgModelComponent);
                fixture.detectChanges();
                // await fixture.whenStable();

                datePicker = fixture.componentInstance.datePicker;
                detectChanges = () => fixture.changeDetectorRef.detectChanges();
            });

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
                detectChanges();

                expect(inputGroup.isRequired).toBeFalsy();
            });

            it('should set validity to initial when the form is reset', async () => {
                fixture = TestBed.createComponent(IgxDatePickerInFormComponent);
                fixture.detectChanges();

                datePicker = fixture.componentInstance.datePicker;
                detectChanges = () => fixture.changeDetectorRef.detectChanges();

                const input = document.getElementsByClassName('igx-input-group__input')[0] as HTMLInputElement;
                input.focus();
                await fixture.whenStable();
                detectChanges();

                datePicker.clear();
                expect(datePicker['inputDirective'].valid).toEqual(IgxInputState.INVALID);

                (fixture.componentInstance as IgxDatePickerInFormComponent).form.resetForm();
                await fixture.whenStable();
                detectChanges();
                expect(datePicker['inputDirective'].valid).toEqual(IgxInputState.INITIAL);
            });

            it('should apply asterisk properly when required validator is set dynamically', () => {
                fixture = TestBed.createComponent(IgxDatePickerReactiveFormComponent);
                fixture.detectChanges();
                datePicker = fixture.componentInstance.datePicker;

                let inputGroupRequiredClass = fixture.debugElement.query(By.css('.' + CSS_CLASS_INPUT_GROUP_REQUIRED));
                let inputGroupInvalidClass = fixture.debugElement.query(By.css('.' + CSS_CLASS_INPUT_GROUP_INVALID));

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
                expect(inputGroupRequiredClass).toBeNull();

                (fixture.componentInstance as IgxDatePickerReactiveFormComponent).addValidators();
                fixture.detectChanges();

                inputGroupRequiredClass = fixture.debugElement.query(By.css('.' + CSS_CLASS_INPUT_GROUP_REQUIRED));
                expect(inputGroupRequiredClass).toBeDefined();
                expect(inputGroupRequiredClass).not.toBeNull();
            });

            it('Should the weekStart property takes precedence over locale.', async () => {
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

                await fixture.whenStable();
            });

            it('should throw error when passing invalid value for locale', async () => {
                fixture = TestBed.createComponent(IgxDatePickerReactiveFormComponent);
                fixture.detectChanges();
                datePicker = fixture.componentInstance.datePicker;

                const detectChanges = () => fixture.changeDetectorRef.detectChanges();

                const locale = 'en-US';
                datePicker.locale = locale;
                detectChanges();

                expect(datePicker.locale).toEqual(locale);
                expect(datePicker.weekStart).toEqual(WEEKDAYS.SUNDAY);


                datePicker.locale = 'frrr';
                datePicker.weekStart = WEEKDAYS.FRIDAY;
                detectChanges();

                expect(datePicker.locale).toEqual('en');
                expect(datePicker.weekStart).toEqual(WEEKDAYS.FRIDAY);
            });

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
            let datePicker: IgxDatePickerComponent;

            let detectChanges: () => void;

            beforeEach(async () => {
                fixture = TestBed.createComponent(IgxDatePickerWithProjectionsComponent);
                fixture.detectChanges();

                datePicker = fixture.componentInstance.datePicker();
                detectChanges = () => fixture.changeDetectorRef.detectChanges();

                await fixture.whenStable();
            });

            it('Should project label/hint and additional prefix/suffix in the correct location', () => {
                datePicker.value = new Date();
                detectChanges();

                const inputGroup = fixture.debugElement.query(By.directive(IgxInputGroupComponent));

                const label = inputGroup.queryAll(By.directive(IgxLabelDirective));
                expect(label).toHaveLength(1);
                expect(label[0].nativeElement.innerText).toEqual('Label');
                const hint = inputGroup.queryAll(By.directive(IgxHintDirective));
                expect(hint).toHaveLength(1);
                expect(hint[0].nativeElement.innerText).toEqual('Hint');

                const prefix = inputGroup.queryAll(By.directive(IgxPrefixDirective));
                expect(prefix).toHaveLength(2);
                expect(prefix[0].nativeElement.innerText).toEqual(DATE_PICKER_TOGGLE_ICON);
                expect(prefix[1].nativeElement.innerText).toEqual('Prefix');
                const suffix = inputGroup.queryAll(By.directive(IgxSuffixDirective));
                expect(suffix).toHaveLength(2);
                expect(suffix[0].nativeElement.innerText).toEqual(DATE_PICKER_CLEAR_ICON);
                expect(suffix[1].nativeElement.innerText).toEqual('Suffix');
            });

            it('Should project custom toggle/clear and hide defaults', () => {
                datePicker.value = new Date();
                fixture.componentInstance.showCustomClear = true;
                fixture.componentInstance.showCustomToggle = true;
                detectChanges();
                const inputGroup = fixture.debugElement.query(By.directive(IgxInputGroupComponent));

                const prefix = inputGroup.queryAll(By.directive(IgxPrefixDirective));
                expect(prefix).toHaveLength(2);
                expect(prefix[0].nativeElement.innerText).toEqual('CustomToggle');
                expect(prefix[1].nativeElement.innerText).toEqual('Prefix');
                const suffix = inputGroup.queryAll(By.directive(IgxSuffixDirective));
                expect(suffix).toHaveLength(2);
                expect(suffix[0].nativeElement.innerText).toEqual('CustomClear');
                expect(suffix[1].nativeElement.innerText).toEqual('Suffix');
            });

            it('Should correctly sub/unsub to custom toggle and clear', () => {
                datePicker.value = new Date();
                fixture.componentInstance.showCustomClear = true;
                fixture.componentInstance.showCustomToggle = true;
                detectChanges();

                vi.spyOn(datePicker, 'open');
                vi.spyOn(datePicker, 'clear');

                const inputGroup = fixture.debugElement.query(By.directive(IgxInputGroupComponent));
                const toggleElem = inputGroup.query(By.directive(IgxPickerToggleComponent));
                const clearElem = inputGroup.query(By.directive(IgxPickerClearComponent));
                let toggle = fixture.componentInstance.customToggle();
                let clear = fixture.componentInstance.customClear();

                expect(toggle.clicked.observers).toHaveLength(1);
                expect(clear.clicked.observers).toHaveLength(1);
                const event = {
                    stopPropagation: vi.fn().mockName("event.stopPropagation")
                };
                toggleElem.triggerEventHandler('click', event);
                expect(datePicker.open).toHaveBeenCalledTimes(1);
                clearElem.triggerEventHandler('click', event);
                expect(datePicker.clear).toHaveBeenCalledTimes(1);

                // hide
                fixture.componentInstance.showCustomToggle = false;
                detectChanges();
                expect(toggle.clicked.observers).toHaveLength(0);
                expect(clear.clicked.observers).toHaveLength(1);
                fixture.componentInstance.showCustomClear = false;
                detectChanges();
                expect(toggle.clicked.observers).toHaveLength(0);
                expect(clear.clicked.observers).toHaveLength(0);

                // show again
                fixture.componentInstance.showCustomClear = true;
                fixture.componentInstance.showCustomToggle = true;
                detectChanges();
                toggle = fixture.componentInstance.customToggle();
                clear = fixture.componentInstance.customClear();
                expect(toggle.clicked.observers).toHaveLength(1);
                expect(clear.clicked.observers).toHaveLength(1);

                datePicker.ngOnDestroy();
                expect(toggle.clicked.observers).toHaveLength(0);
                expect(clear.clicked.observers).toHaveLength(0);
            });
        });

        describe('Templated Header', () => {
            let fixture: ComponentFixture<IgxDatePickerWithTemplatesComponent>;

            beforeEach(async () => {
                await TestBed.configureTestingModule({
                    imports: [IgxDatePickerWithTemplatesComponent]
                }).compileComponents();

                fixture = TestBed.createComponent(IgxDatePickerWithTemplatesComponent);
                fixture.detectChanges();
            });

            it('Should use the custom template for header title', async () => {
                const testDate = new Date(2024, 10, 11);
                fixture.componentInstance.datePicker.value = testDate;
                fixture.componentInstance.datePicker.open();
                await fixture.whenStable();
                fixture.detectChanges();

                const headerTitleElement = fixture.debugElement.query(By.css('.igx-calendar__header-year'));
                expect(headerTitleElement, 'Header title element should be present').toBeTruthy();
                if (headerTitleElement) {
                    expect(headerTitleElement.nativeElement.textContent.trim()).toBe('2024');
                }
            });

            it('Should use the custom template for header', async () => {
                const testDate = new Date(2024, 10, 11);
                fixture.componentInstance.datePicker.value = testDate;
                fixture.componentInstance.datePicker.open();
                await fixture.whenStable();
                fixture.detectChanges();

                const headerElement = fixture.debugElement.query(By.css('.igx-calendar__header-date'));
                expect(headerElement, 'Header element should be present').toBeTruthy();
                if (headerElement) {
                    expect(headerElement.nativeElement.textContent.trim()).toBe('Nov');
                }
            });
        });

        describe('UI Interaction', () => {
            let fixture: ComponentFixture<IgxDatePickerTestComponent>;
            let datePicker: IgxDatePickerComponent;
            let detectChanges: () => void;

            beforeEach(async () => {
                vi.useFakeTimers();
                fixture = TestBed.createComponent(IgxDatePickerTestComponent);
                fixture.detectChanges();

                datePicker = fixture.componentInstance.datePicker();
                detectChanges = () => fixture.changeDetectorRef.detectChanges();
            });

            afterEach(() => {
                vi.useRealTimers();
            });

            it('should activate today\'s date when reopening the calendar', async () => {
                datePicker.clear();
                datePicker.open();
                await vi.runAllTimersAsync();
                detectChanges();

                expect(datePicker.value).toEqual(null);
                expect(datePicker.collapsed).toBeFalsy();

                datePicker.close();
                await vi.runAllTimersAsync();
                detectChanges();
                expect(datePicker.collapsed).toBeTruthy();

                datePicker.open();
                await vi.runAllTimersAsync();
                detectChanges();
                expect(datePicker.collapsed).toBeFalsy();

                const today = new Date(new Date().setHours(0, 0, 0, 0)).getTime().toString();
                const wrapper = fixture.debugElement.query(By.css('.igx-calendar__wrapper')).nativeElement;
                expect(wrapper.getAttribute('aria-activedescendant')).toEqual(today);
                expect(wrapper.contains(document.activeElement), 'focus should move to calendar for KB nav').toBe(true);
            });

            it('should focus today\'s date when an invalid date is selected', async () => {
                datePicker.clear();
                expect(datePicker.value).toEqual(null);
                expect(datePicker.collapsed).toBeTruthy();

                datePicker.select(new Date('test'));
                datePicker.open();
                await vi.runAllTimersAsync();
                detectChanges();
                expect(datePicker.collapsed).toBeFalsy();

                const today = new Date(new Date().setHours(0, 0, 0, 0)).getTime().toString();
                const wrapper = fixture.debugElement.query(By.css('.igx-calendar__wrapper')).nativeElement;
                expect(wrapper.getAttribute('aria-activedescendant')).toEqual(today);
                expect(wrapper.contains(document.activeElement), 'focus should move to calendar for KB nav').toBe(true);
            });

            it('should return focus to date picker input after calendar click select', async () => {
                const inputGroup = fixture.debugElement.query(By.directive(IgxInputGroupComponent)).nativeElement;

                datePicker.clear();
                datePicker.open();
                await vi.runAllTimersAsync();
                detectChanges();

                const today = new Date(new Date().setHours(0, 0, 0, 0));
                const todayTime = today.getTime().toString();
                const todayDayItem = fixture.debugElement.query(By.css(`#${CSS.escape(todayTime)}`)).nativeElement;

                todayDayItem.click();
                await vi.runAllTimersAsync();
                detectChanges();
                expect(datePicker.value).toEqual(today);
                expect(inputGroup.contains(document.activeElement), 'focus should return to the picker input').toBe(true);
            });
        });

        describe('Input and Display formats', () => {
            let fixture: ComponentFixture<IgxDatePickerTestComponent>;
            let datePicker: IgxDatePickerComponent;
            let dateTimeEditor: IgxDateTimeEditorDirective;
            let detectChanges: () => void;

            beforeEach(async () => {
                fixture = TestBed.createComponent(IgxDatePickerTestComponent);
                registerLocaleData(localeBg);
                registerLocaleData(localeES);
                fixture.detectChanges();

                detectChanges = () => fixture.changeDetectorRef.detectChanges();
                datePicker = fixture.componentInstance.datePicker();
                dateTimeEditor = fixture.debugElement.query(By.directive(IgxDateTimeEditorDirective)).
                    injector.get(IgxDateTimeEditorDirective);
            });

            it('should set default inputFormat, if none, to the editor with parts for day, month and year based on locale', () => {
                datePicker.locale = 'en-US';
                detectChanges();
                expect(dateTimeEditor.inputFormat).toEqual('MM/dd/yyyy');

                datePicker.locale = 'bg-BG';
                detectChanges();
                expect(dateTimeEditor.inputFormat.normalize('NFKC')).toEqual('dd.MM.yyyy г.');

                datePicker.locale = 'es-ES';
                detectChanges();
                expect(dateTimeEditor.inputFormat).toEqual('dd/MM/yyyy');
            });

            it('should resolve inputFormat, if not set, to the editor to the value of displayFormat if it contains only numeric date/time parts', async () => {
                datePicker.locale = 'en-US';
                detectChanges();

                datePicker.displayFormat = 'dd/MM/yyyy';
                detectChanges();
                expect(dateTimeEditor.inputFormat).toEqual('dd/MM/yyyy');

                datePicker.displayFormat = 'shortDate';
                detectChanges();
                expect(dateTimeEditor.inputFormat).toEqual('MM/dd/yyyy');
            });

            it('should resolve to the default locale-based input format for the editor in case inputFormat is not set and displayFormat contains non-numeric date/time parts', async () => {
                datePicker.locale = 'en-US';
                datePicker.displayFormat = 'MMM d, y, h:mm:ss a';
                detectChanges();
                expect(dateTimeEditor.inputFormat).toEqual('MM/dd/yyyy');

                datePicker.locale = 'bg-BG';
                datePicker.displayFormat = 'full';
                detectChanges();
                expect(dateTimeEditor.inputFormat.normalize('NFKC')).toEqual('dd.MM.yyyy г.');

                datePicker.locale = 'es-ES';
                datePicker.displayFormat = 'MMM d, y';
                detectChanges();
                expect(dateTimeEditor.inputFormat).toEqual('dd/MM/yyyy');
            });
        });
    });

    describe('Unit Tests', () => {
        let overlay: IgxOverlayService;
        let mockOverlayEventArgs: OverlayEventArgs & OverlayCancelableEventArgs;
        let mockInjector: { get: ReturnType<typeof vi.fn> };
        let mockCdr: { detectChanges: ReturnType<typeof vi.fn> };
        let mockInputGroup: Partial<IgxInputGroupComponent>;
        let datePicker: IgxDatePickerComponent;
        let mockDateEditor: any;
        let mockCalendar: Partial<IgxCalendarComponent>;
        let mockInputDirective: any;
        let mockNgControl: any;
        let mockControlInstance: any;
        let renderer2: Renderer2;

        const viewsContainerRef = {} as any;
        const mockOverlayId = '1';
        const elementRef = {
            nativeElement: {
                blur: vi.fn(),
                click: vi.fn(),
                focus: vi.fn()
            }
        };

        beforeEach(async () => {
            renderer2 = { setAttribute: vi.fn() } as unknown as Renderer2;

            mockControlInstance = {
                touched: false,
                dirty: false,
                validator: null as any,
                asyncValidator: null as any
            };

            mockNgControl = {
                statusChanges: new EventEmitter(),
                control: mockControlInstance,
                valid: true,
                disabled: false
            };

            mockInjector = {
                get: vi.fn().mockReturnValue(mockNgControl)
            };

            mockCdr = { detectChanges: vi.fn() };

            mockCalendar = {
                selected: new EventEmitter<any>(),
                selectDate: vi.fn(),
                activeDate: null,
                viewDate: null,
                disabledDates: []
            };

            const mockComponentRef = {
                instance: {
                    calendar: mockCalendar,
                    todaySelection: new EventEmitter<any>(),
                    calendarClose: new EventEmitter<any>()
                },
                location: { nativeElement: undefined }
            } as any;

            mockOverlayEventArgs = { id: mockOverlayId, componentRef: mockComponentRef, cancel: false };

            overlay = {
                opening: new EventEmitter<OverlayCancelableEventArgs>(),
                opened: new EventEmitter<OverlayEventArgs>(),
                closed: new EventEmitter<OverlayEventArgs>(),
                closing: new EventEmitter<OverlayClosingEventArgs>(),
                show: vi.fn().mockImplementation(function(this: any) {
                    this.opening.emit(Object.assign({}, mockOverlayEventArgs, { cancel: false }));
                    this.opened.emit(mockOverlayEventArgs);
                }),
                hide: vi.fn().mockImplementation(function(this: any) {
                    this.closing.emit(Object.assign({}, mockOverlayEventArgs, { cancel: false }));
                    this.closed.emit(mockOverlayEventArgs);
                }),
                detach: vi.fn(),
                attach: vi.fn().mockReturnValue(mockOverlayId)
            } as any;

            mockDateEditor = {
                _value: null as any,
                get value() { return this._value; },
                set value(val: any) { this._value = val; },
                clear() { this.valueChange.emit(null); },
                increment: vi.fn(),
                decrement: vi.fn(),
                valueChange: new EventEmitter<any>(),
                validationFailed: new EventEmitter<any>()
            };

            // A lightweight element mock that supports addEventListener/removeEventListener/dispatchEvent
            const _listeners: Record<string, Array<() => void>> = {};
            mockInputDirective = {
                valid: IgxInputState.INITIAL,
                nativeElement: {
                    addEventListener(event: string, cb: () => void) {
                        (_listeners[event] ??= []).push(cb);
                    },
                    removeEventListener(event: string, cb: () => void) {
                        const idx = _listeners[event]?.indexOf(cb) ?? -1;
                        if (idx !== -1) _listeners[event].splice(idx, 1);
                    },
                    dispatchEvent(event: string) {
                        _listeners[event]?.forEach(fn => fn());
                    },
                    focus() { this.dispatchEvent('focus'); },
                    click() { this.dispatchEvent('click'); },
                    blur() { this.dispatchEvent('blur'); }
                },
                focus: () => {}
            };

            mockInputGroup = {
                isFocused: false,
                isRequired: false,
                element: {
                    nativeElement: {
                        focus: vi.fn(),
                        blur: vi.fn(),
                        click: vi.fn(),
                        addEventListener: vi.fn(),
                        removeEventListener: vi.fn(),
                        querySelector: vi.fn()
                    }
                }
            } as any;

            await TestBed.configureTestingModule({
                providers: [
                    { provide: ElementRef, useValue: elementRef },
                    { provide: IgxOverlayService, useValue: overlay },
                    { provide: Injector, useValue: mockInjector },
                    { provide: Renderer2, useValue: renderer2 },
                    { provide: ChangeDetectorRef, useValue: mockCdr },
                    IgxDatePickerComponent
                ]
            });

            datePicker = TestBed.inject(IgxDatePickerComponent);
            (datePicker as any).inputGroup = mockInputGroup;
            (mockInputGroup.element.nativeElement.querySelector as ReturnType<typeof vi.fn>).mockReturnValue(mockInputGroup.element.nativeElement);
            (datePicker as any).inputDirective = mockInputDirective;
            (datePicker as any).dateTimeEditor = mockDateEditor;
            (datePicker as any).viewContainerRef = viewsContainerRef;
            datePicker.clearComponents = new QueryList<any>();
            datePicker.toggleComponents = new QueryList<any>();
        });

        afterEach(() => {
            datePicker?.ngOnDestroy();
            UIInteractions.clearOverlay();
        });

        describe('Default state', () => {
            it('should have correct default values before initialization', () => {
                expect(datePicker.collapsed).toBeTruthy();
                expect(datePicker.required).toBeFalsy();
                expect(datePicker.disabled).toBeFalsy();
                expect(datePicker.readOnly).toBeFalsy();
                expect(datePicker.disabledDates).toBeNull();
                expect(datePicker.specialDates).toBeNull();
                expect(datePicker.displayFormat).toBeUndefined();
                expect(datePicker.inputFormat).toBeUndefined();
                expect(datePicker.calendarFormat).toBeUndefined();
                expect(datePicker.formatViews).toBeUndefined();
                expect(datePicker.displayMonthsCount).toEqual(1);
                expect(datePicker.headerOrientation).toEqual(PickerHeaderOrientation.Horizontal);
                expect(datePicker.mode).toEqual(PickerInteractionMode.DropDown);
                expect(datePicker.isDropdown).toBeTruthy();
                expect(datePicker.hideOutsideDays).toBeUndefined();
                expect(datePicker.minValue).toBeUndefined();
                expect(datePicker.maxValue).toBeUndefined();
                expect(datePicker.outlet).toBeUndefined();
                expect(datePicker.spinDelta).toBeUndefined();
                expect(datePicker.spinLoop).toBeTruthy();
                expect(datePicker.tabIndex).toBeUndefined();
                expect(datePicker.overlaySettings).toBeUndefined();
                expect(datePicker.locale).toEqual('en');
                expect(datePicker.placeholder).toEqual('');
                expect(datePicker.value).toBeUndefined();
                expect(datePicker.formatter).toBeUndefined();
                expect(() => datePicker.displayValue.transform(new Date())).toThrow();
            });
        });

        describe('Inputs', () => {
            it('should toggle disabled via the property and setDisabledState', () => {
                datePicker.disabled = true;
                expect(datePicker.disabled).toBeTruthy();

                datePicker.disabled = false;
                datePicker.setDisabledState(true);
                expect(datePicker.disabled).toBeTruthy();
            });

            it('should set mode and reflect the change through isDropdown', () => {
                expect(datePicker.mode).toEqual(PickerInteractionMode.DropDown);
                expect(datePicker.isDropdown).toBeTruthy();

                datePicker.mode = PickerInteractionMode.Dialog;
                expect(datePicker.mode).toEqual(PickerInteractionMode.Dialog);
                expect(datePicker.isDropdown).toBeFalsy();
            });

            it('should merge calendarFormat with the default format, without mutating the defaults', () => {
                datePicker.calendarFormat = { day: '2-digit' };
                expect((datePicker as any).pickerCalendarFormat).toEqual({
                    day: '2-digit', month: 'short', weekday: 'short', year: 'numeric'
                });

                datePicker.calendarFormat = { month: 'numeric' };
                expect((datePicker as any).pickerCalendarFormat).toEqual({
                    day: 'numeric', month: 'numeric', weekday: 'short', year: 'numeric'
                });
            });

            it('should merge formatViews with the defaults', () => {
                datePicker.formatViews = null;
                expect((datePicker as any).pickerFormatViews).toEqual({ day: false, month: true, year: false });

                datePicker.formatViews = { day: true, month: false, year: true };
                expect((datePicker as any).pickerFormatViews).toEqual({ day: true, month: false, year: true });
            });

            it('should set value, sync it to the date editor, and emit valueChange', () => {
                const today = new Date();
                vi.spyOn(datePicker.valueChange, 'emit');

                datePicker.value = today;

                expect(datePicker.value).toEqual(today);
                expect(mockDateEditor.value).toEqual(today);
                expect(datePicker.valueChange.emit).toHaveBeenCalledWith(today);
            });

            it('should accept an ISO string value without emitting it raw via valueChange', () => {
                vi.spyOn(datePicker.valueChange, 'emit');

                datePicker.value = '2003-03-03';

                expect(datePicker.value).toEqual('2003-03-03');
                expect(datePicker.valueChange.emit).not.toHaveBeenCalledWith('2003-03-03' as any);
            });

            it('should use a custom formatter to transform the display value', () => {
                const today = new Date();
                datePicker.formatter = (val: Date) => val.getFullYear().toString();

                expect(datePicker.displayValue.transform(today)).toEqual(today.getFullYear().toString());
            });

            it('should set minValue and maxValue', () => {
                const today = new Date();
                datePicker.minValue = today;
                expect(datePicker.minValue).toEqual(today);

                datePicker.maxValue = '12/12/2098';
                expect(datePicker.maxValue).toEqual('12/12/2098');
            });

            it('should set disabledDates and specialDates', () => {
                const today = new Date();
                const ranges: DateRangeDescriptor[] = [
                    { type: DateRangeType.Weekdays },
                    { type: DateRangeType.Before, dateRange: [today] }
                ];
                datePicker.disabledDates = ranges;
                expect(datePicker.disabledDates).toEqual(ranges);

                datePicker.specialDates = ranges;
                expect(datePicker.specialDates).toEqual(ranges);
            });

            it('should set outlet to an ElementRef or IgxOverlayOutletDirective', () => {
                const mockEl = { nativeElement: {} } as ElementRef;
                datePicker.outlet = mockEl;
                expect(datePicker.outlet).toEqual(mockEl);

                const mockDirective = { nativeElement: {} } as unknown as IgxOverlayOutletDirective;
                datePicker.outlet = mockDirective;
                expect(datePicker.outlet).toEqual(mockDirective);
            });

            it('should set spinDelta, spinLoop, tabIndex, placeholder, overlaySettings', () => {
                datePicker.spinDelta = { date: 5, month: 2 };
                expect(datePicker.spinDelta).toEqual({ date: 5, month: 2 });

                datePicker.spinLoop = false;
                expect(datePicker.spinLoop).toBeFalsy();

                datePicker.tabIndex = -1;
                expect(datePicker.tabIndex).toEqual(-1);

                datePicker.placeholder = 'Pick a date';
                expect(datePicker.placeholder).toEqual('Pick a date');

                const customSettings: OverlaySettings = { modal: true, closeOnEscape: true };
                datePicker.overlaySettings = customSettings;
                expect(datePicker.overlaySettings).toEqual(customSettings);
            });
        });

        describe('API methods', () => {
            beforeEach(() => {
                datePicker.ngAfterViewInit();
            });

            it('should open, close, and toggle the picker', () => {
                expect(datePicker.collapsed).toBeTruthy();
                datePicker.open();
                expect(datePicker.collapsed).toBeFalsy();

                datePicker.close();
                expect(datePicker.collapsed).toBeTruthy();

                datePicker.toggle();
                expect(datePicker.collapsed).toBeFalsy();
                datePicker.toggle();
                expect(datePicker.collapsed).toBeTruthy();
            });

            it('should not open when already open or disabled', () => {
                datePicker.open();
                expect(overlay.attach).toHaveBeenCalledTimes(1);
                datePicker.open(); // already open
                expect(overlay.attach).toHaveBeenCalledTimes(1);

                datePicker.close();
                datePicker.disabled = true;
                datePicker.open(); // disabled
                expect(overlay.attach).toHaveBeenCalledTimes(1);
            });

            it('should not close when already closed', () => {
                datePicker.close();
                expect(overlay.hide).not.toHaveBeenCalled();
            });

            it('should call overlay.hide and then detach once closed event is emitted', () => {
                // Prevent hide from auto-emitting `closed` so we can assert the detach sequence manually
                vi.spyOn(overlay, 'hide').mockImplementation(() => {});

                datePicker.open();
                datePicker.close();
                expect(overlay.hide).toHaveBeenCalledWith(mockOverlayId);
                expect(overlay.detach).not.toHaveBeenCalled();

                overlay.closed.emit(mockOverlayEventArgs);
                expect(overlay.detach).toHaveBeenCalledWith(mockOverlayId);
            });

            it('should set the value and emit valueChange via select()', () => {
                vi.spyOn(datePicker.valueChange, 'emit');
                (datePicker as any).dateTimeEditor = { value: null, clear: () => {} };

                const date = new Date(2025, 5, 15);
                datePicker.select(date);
                expect(datePicker.value).toEqual(date);
                expect(datePicker.valueChange.emit).toHaveBeenCalledWith(date);
            });

            it('should clear the value and emit null via clear()', () => {
                vi.spyOn(datePicker.valueChange, 'emit');
                datePicker.value = new Date();

                datePicker.clear();
                expect(datePicker.value).toBeNull();
                expect(datePicker.valueChange.emit).toHaveBeenCalledWith(null);
            });

            it('should select today and close via selectToday()', () => {
                vi.spyOn(datePicker, 'select');
                vi.spyOn(datePicker, 'close');
                const today = new Date();
                today.setHours(0, 0, 0, 0);

                datePicker.selectToday();
                expect(datePicker.select).toHaveBeenCalledWith(today);
                expect(datePicker.close).toHaveBeenCalled();
            });

            it('should delegate increment and decrement to the date editor', () => {
                const datePart = {} as DatePart;

                datePicker.increment();
                expect(mockDateEditor.increment).toHaveBeenCalledWith(undefined, undefined);
                datePicker.increment(datePart, 2);
                expect(mockDateEditor.increment).toHaveBeenCalledWith(datePart, 2);

                datePicker.decrement();
                expect(mockDateEditor.decrement).toHaveBeenCalledWith(undefined, undefined);
                datePicker.decrement(datePart, 3);
                expect(mockDateEditor.decrement).toHaveBeenCalledWith(datePart, 3);
            });

            it('should set aria-labelledby on the input when a label directive is present', () => {
                datePicker.ngAfterViewChecked();
                expect(renderer2.setAttribute).not.toHaveBeenCalled();

                (datePicker as any).labelDirective = { id: 'label-1' };
                datePicker.ngAfterViewChecked();
                expect(renderer2.setAttribute).toHaveBeenCalledWith(
                    mockInputDirective.nativeElement, 'aria-labelledby', 'label-1'
                );
            });

            it('should not open on input click in dropdown mode, but should open in dialog mode', () => {
                vi.spyOn(datePicker, 'open');

                expect(datePicker.isDropdown).toBeTruthy();
                datePicker.getEditElement().dispatchEvent('click' as any);
                expect(datePicker.open).not.toHaveBeenCalled();

                vi.spyOn(datePicker, 'isDropdown', 'get').mockReturnValue(false);
                datePicker.getEditElement().dispatchEvent('click' as any);
                expect(datePicker.open).toHaveBeenCalledTimes(1);
            });
        });

        describe('Overlay settings', () => {
            beforeEach(() => {
                datePicker.ngAfterViewInit();
            });

            it('should attach with dialog settings when mode is dialog', () => {
                const expectedSettings = Object.assign({}, (datePicker as any)._dialogOverlaySettings);
                vi.spyOn(datePicker, 'isDropdown', 'get').mockReturnValue(false);

                datePicker.open();
                expect(overlay.attach).toHaveBeenCalledWith(IgxCalendarContainerComponent, viewsContainerRef, expectedSettings);
            });

            it('should attach with dropdown settings when mode is dropdown', () => {
                const expectedSettings = Object.assign({}, (datePicker as any)._dropDownOverlaySettings, {
                    target: mockInputGroup.element.nativeElement
                });

                datePicker.open();
                expect(overlay.attach).toHaveBeenCalledWith(IgxCalendarContainerComponent, viewsContainerRef, expectedSettings);
            });

            it('should include the outlet in overlay settings when set', () => {
                const baseSettings = Object.assign({}, (datePicker as any)._dropDownOverlaySettings, {
                    target: mockInputGroup.element.nativeElement
                });
                const mockOutlet = {} as any;
                datePicker.outlet = mockOutlet;

                datePicker.open();
                expect(overlay.attach).toHaveBeenCalledWith(
                    IgxCalendarContainerComponent, viewsContainerRef,
                    Object.assign({}, baseSettings, { outlet: mockOutlet })
                );
            });

            it('should merge custom settings passed to open() into the base overlay settings', () => {
                const baseSettings = Object.assign({}, (datePicker as any)._dropDownOverlaySettings, {
                    target: mockInputGroup.element.nativeElement
                });
                const customSettings: OverlaySettings = { modal: true, closeOnEscape: false };

                datePicker.open(customSettings);
                expect(overlay.attach).toHaveBeenCalledWith(
                    IgxCalendarContainerComponent, viewsContainerRef,
                    Object.assign({}, baseSettings, customSettings)
                );
            });

            it('should give precedence to settings passed in open() over the overlaySettings input', () => {
                datePicker.overlaySettings = { modal: false };
                const baseSettings = Object.assign({}, (datePicker as any)._dropDownOverlaySettings, {
                    target: mockInputGroup.element.nativeElement
                });

                datePicker.open({ modal: true });
                expect(overlay.attach).toHaveBeenCalledWith(
                    IgxCalendarContainerComponent, viewsContainerRef,
                    Object.assign({}, baseSettings, { modal: true })
                );
            });
        });

        describe('Events', () => {
            beforeEach(() => {
                datePicker.ngAfterViewInit();
            });

            it('should emit opening/closing and opened/closed events on open/close', () => {
                vi.spyOn(datePicker.opened, 'emit');
                vi.spyOn(datePicker.closed, 'emit');
                vi.spyOn(datePicker.opening, 'emit');
                vi.spyOn(datePicker.closing, 'emit');

                datePicker.open();
                expect(datePicker.opening.emit).toHaveBeenCalledWith({ owner: datePicker, event: undefined, cancel: false });
                expect(datePicker.opened.emit).toHaveBeenCalledWith({ owner: datePicker });

                datePicker.close();
                expect(datePicker.closing.emit).toHaveBeenCalledWith({ owner: datePicker, event: undefined, cancel: false });
                expect(datePicker.closed.emit).toHaveBeenCalledWith({ owner: datePicker });
            });

            it('should emit valueChange when value is set directly', () => {
                vi.spyOn(datePicker.valueChange, 'emit');
                (datePicker as any).dateTimeEditor = { value: null, clear: () => {} };

                const date = new Date(2025, 3, 1);
                datePicker.value = date;
                expect(datePicker.valueChange.emit).toHaveBeenCalledWith(date);
            });

            it('should propagate valueChange from the underlying date editor', () => {
                vi.spyOn(datePicker.valueChange, 'emit');

                const date1 = new Date(2025, 3, 1);
                mockDateEditor.valueChange.emit(date1);
                expect(datePicker.valueChange.emit).toHaveBeenCalledTimes(1);
                expect(datePicker.valueChange.emit).toHaveBeenCalledWith(date1);

                const date2 = new Date(2025, 4, 1);
                mockDateEditor.valueChange.emit(date2);
                expect(datePicker.valueChange.emit).toHaveBeenCalledTimes(2);
                expect(datePicker.valueChange.emit).toHaveBeenCalledWith(date2);
            });

            it('should emit validationFailed when the date editor signals a validation failure', () => {
                vi.spyOn(datePicker.validationFailed, 'emit');
                const prevDate = new Date(2012, 5, 7);
                const outOfRangeDate = new Date(2012, 6, 1);

                vi.spyOn(mockDateEditor, 'value', 'set').mockImplementation((val: Date) => {
                    if (val === outOfRangeDate) {
                        mockDateEditor.validationFailed.emit({ oldValue: prevDate });
                        return;
                    }
                    mockDateEditor._value = val;
                    mockDateEditor.valueChange.emit(val);
                });

                datePicker.value = prevDate;
                expect(datePicker.validationFailed.emit).not.toHaveBeenCalled();

                datePicker.value = outOfRangeDate;
                expect(datePicker.validationFailed.emit).toHaveBeenCalledWith({
                    owner: datePicker,
                    prevValue: prevDate,
                    currentValue: outOfRangeDate
                });
            });
        });

        describe('Calendar initialization', () => {
            beforeEach(() => {
                datePicker.ngAfterViewInit();
            });

            it('should pass picker properties to the calendar container on opening', () => {
                datePicker.mode = PickerInteractionMode.Dialog;
                datePicker.open();

                expect(mockCalendar.hasHeader).toBe(true); // dialog mode, no hideHeader
                expect(mockCalendar.formatOptions).toEqual((datePicker as any).pickerCalendarFormat);
                expect(mockCalendar.formatViews).toEqual((datePicker as any).pickerFormatViews);
                expect(mockCalendar.locale).toEqual(datePicker.locale);
                expect(mockCalendar.headerOrientation).toEqual(datePicker.headerOrientation);
                expect(mockCalendar.weekStart).toEqual(datePicker.weekStart);
                expect(mockCalendar.specialDates).toEqual(datePicker.specialDates);
                expect(mockCalendar.hideOutsideDays).toEqual(datePicker.hideOutsideDays);
                expect(mockCalendar.monthsViewNumber).toEqual(datePicker.displayMonthsCount);
                expect(mockCalendar.showWeekNumbers).toEqual(datePicker.showWeekNumbers);
            });

            it('should set hasHeader to false in dropdown mode', () => {
                datePicker.mode = PickerInteractionMode.DropDown;
                datePicker.open();
                expect(mockCalendar.hasHeader).toBe(false);
            });

            it('should set no disabled dates when neither min nor max is set', () => {
                datePicker.open();
                expect(mockCalendar.disabledDates).toEqual([]);
            });

            it('should populate calendar disabledDates from minValue', () => {
                const minDate = new Date(2020, 0, 1);
                datePicker.minValue = minDate;
                datePicker.open();

                expect(mockCalendar.disabledDates).toEqual([
                    { type: DateRangeType.Before, dateRange: [minDate] }
                ]);
            });

            it('should populate calendar disabledDates from maxValue', () => {
                const maxDate = new Date(2030, 11, 31);
                datePicker.maxValue = maxDate;
                datePicker.open();

                expect(mockCalendar.disabledDates).toEqual([
                    { type: DateRangeType.After, dateRange: [maxDate] }
                ]);
            });

            it('should populate calendar disabledDates from both minValue and maxValue', () => {
                const minDate = new Date(2020, 0, 1);
                const maxDate = new Date(2030, 11, 31);
                datePicker.minValue = minDate;
                datePicker.maxValue = maxDate;
                datePicker.open();

                expect(mockCalendar.disabledDates).toEqual([
                    { type: DateRangeType.Before, dateRange: [minDate] },
                    { type: DateRangeType.After, dateRange: [maxDate] }
                ]);
            });

            it('should prepend custom disabledDates before min/max constraints', () => {
                const minDate = new Date(2020, 0, 1);
                const maxDate = new Date(2030, 11, 31);
                const custom: DateRangeDescriptor[] = [{ type: DateRangeType.Weekdays }];
                datePicker.disabledDates = custom;
                datePicker.minValue = minDate;
                datePicker.maxValue = maxDate;
                datePicker.open();

                expect(mockCalendar.disabledDates).toEqual([
                    { type: DateRangeType.Weekdays },
                    { type: DateRangeType.Before, dateRange: [minDate] },
                    { type: DateRangeType.After, dateRange: [maxDate] }
                ]);
            });

            it('should preserve the time component from the current value when a calendar date is selected', () => {
                const valueWithTime = new Date(2025, 3, 1, 14, 30, 45, 500);
                datePicker.value = valueWithTime;

                // Must spy before open() — the activeDate getter is called inside _initializeCalendarContainer
                // and it mutates _dateValue in-place via setHours(0,0,0,0)
                vi.spyOn(datePicker, 'activeDate', 'get').mockReturnValue(new Date(2025, 3, 10));
                datePicker.open();
                vi.spyOn(datePicker, 'close');

                const selectedDay = new Date(2025, 3, 10, 0, 0, 0, 0);
                mockCalendar.selected.emit(selectedDay as any);

                expect(selectedDay.getHours()).toEqual(14);
                expect(selectedDay.getMinutes()).toEqual(30);
                expect(selectedDay.getSeconds()).toEqual(45);
                expect(selectedDay.getMilliseconds()).toEqual(500);
                expect(datePicker.close).toHaveBeenCalled();
            });

            it('should not map time from an invalid/falsy picker value when calendar date is selected', () => {
                datePicker.value = undefined;

                datePicker.open();
                vi.spyOn(datePicker, 'close');
                // Prevent the `activeDate` getter from mutating _dateValue via setHours(0,0,0,0)
                vi.spyOn(datePicker, 'activeDate', 'get').mockReturnValue(new Date(2025, 3, 10));

                const selectedDay = new Date(2025, 3, 10, 11, 22, 33, 444);
                mockCalendar.selected.emit(selectedDay as any);

                // hours should remain unchanged (not mapped from an undefined picker value)
                expect(selectedDay.getHours()).toEqual(11);
                expect(datePicker.close).toHaveBeenCalled();
            });
        });

        describe('Control Value Accessor', () => {
            it('should update input validity based on ngControl statusChanges', () => {
                datePicker.ngOnInit();
                datePicker.ngAfterViewInit();

                mockControlInstance.touched = false;
                mockControlInstance.validator = null;
                mockNgControl.valid = true;

                // untouched, no validator — stays INITIAL
                expect(mockInputDirective.valid).toEqual(IgxInputState.INITIAL);
                mockNgControl.statusChanges.emit();
                expect(mockInputDirective.valid).toEqual(IgxInputState.INITIAL);

                // touched but no validator — still INITIAL
                mockControlInstance.touched = true;
                mockNgControl.statusChanges.emit();
                expect(mockInputDirective.valid).toEqual(IgxInputState.INITIAL);

                // validator present, valid=true, not focused — INITIAL
                mockControlInstance.validator = () => ({});
                mockNgControl.statusChanges.emit();
                expect(mockInputDirective.valid).toEqual(IgxInputState.INITIAL);

                // validator present, valid=false — INVALID
                mockNgControl.valid = false;
                mockNgControl.statusChanges.emit();
                expect(mockInputDirective.valid).toEqual(IgxInputState.INVALID);

                // focused and valid=true — VALID
                mockInputGroup.isFocused = true;
                mockNgControl.valid = true;
                mockNgControl.statusChanges.emit();
                expect(mockInputDirective.valid).toEqual(IgxInputState.VALID);

                // focused and valid=false — back to INVALID
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
    public datePicker = viewChild.required(IgxDatePickerComponent);
    public mode: PickerInteractionMode = PickerInteractionMode.DropDown;
    public date = new Date(2021, 24, 2, 11, 45, 0);
    public minValue: string | Date;
    public maxValue: string | Date;
}

@Component({
    template: `
        <igx-date-picker [(ngModel)]="date" [mode]="mode" [minValue]="minValue" [maxValue]="maxValue" [required]="isRequired">
        </igx-date-picker>`,
    imports: [IgxDatePickerComponent, FormsModule]
})
export class IgxDatePickerNgModelComponent {
    @ViewChild(IgxDatePickerComponent)
    public datePicker: IgxDatePickerComponent;
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
export class IgxDatePickerTestKeyBindsComponent {
    public datePicker = viewChild.required(IgxDatePickerComponent)
    public mode: PickerInteractionMode = PickerInteractionMode.DropDown;
    public date = new Date(2021, 24, 2, 11, 45, 0);
}

@Component({
    template: `
    <igx-date-picker [mode]="mode">
        <label igxLabel>Label</label>
        @if (showCustomToggle) {
            <igx-picker-toggle igxPrefix>CustomToggle</igx-picker-toggle>
        }
        <igx-prefix>Prefix</igx-prefix>
        @if (showCustomClear) {
            <igx-picker-clear igxSuffix>CustomClear</igx-picker-clear>
        }
        <igx-suffix>Suffix</igx-suffix>
        <igx-hint>Hint</igx-hint>
    </igx-date-picker>`,
    imports: [IgxDatePickerComponent, IgxPickerToggleComponent, IgxPrefixDirective, IgxPickerClearComponent, IgxLabelDirective, IgxSuffixDirective, IgxHintDirective]
})
export class IgxDatePickerWithProjectionsComponent {
    public datePicker = viewChild.required(IgxDatePickerComponent);
    public customToggle = viewChild(IgxPickerToggleComponent);
    public customClear = viewChild(IgxPickerClearComponent);

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
    @ViewChild(IgxDatePickerComponent)
    public datePicker: IgxDatePickerComponent;
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
