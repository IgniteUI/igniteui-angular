import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component, OnInit, ViewChild, DebugElement, ChangeDetectionStrategy, inject, ElementRef } from '@angular/core';
import { IgxInputDirective, IgxInputGroupComponent, IgxInputState, IgxLabelDirective, IgxPrefixDirective, IgxSuffixDirective } from '../../../input-group/src/public_api';
import { CustomDateRange, DateRange, PickerCalendarOrientation, PickerHeaderOrientation, PickerInteractionMode } from '../../../core/src/date-common/types';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule, ReactiveFormsModule, UntypedFormBuilder, UntypedFormControl, Validators } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { ControlsFunction } from '../../../test-utils/controls-functions.spec';
import { UIInteractions } from '../../../test-utils/ui-interactions.spec';
import { HelperTestFunctions } from '../../../test-utils/calendar-helper-utils';
import { CancelableEventArgs, WEEKDAYS } from 'igniteui-angular/core';
import { IgxDateRangeSeparatorDirective, IgxDateRangeStartComponent } from './date-range-picker-inputs.common';
import { IgxDateTimeEditorDirective } from '../../../directives/src/directives/date-time-editor/date-time-editor.directive';
import { DateRangeType } from 'igniteui-angular/core';
import { IgxDateRangePickerComponent, IgxDateRangeEndComponent } from './public_api';
import { AutoPositionStrategy, IgxOverlayService } from 'igniteui-angular/core';
import { Subject } from 'rxjs';
import { AsyncPipe } from '@angular/common';
import { IgxAngularAnimationService } from 'igniteui-angular/core';
import { IgxPickerClearComponent, IgxPickerToggleComponent } from '../../../core/src/date-common/picker-icons.common';
import { IgxIconComponent } from 'igniteui-angular/icon';
import { registerLocaleData } from "@angular/common";
import localeJa from "@angular/common/locales/ja";
import localeBg from "@angular/common/locales/bg";
import { CalendarDay } from 'igniteui-angular/core';
import { IgxCalendarHeaderTemplateDirective, IgxCalendarHeaderTitleTemplateDirective, IgxCalendarSubheaderTemplateDirective } from 'igniteui-angular/calendar';
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';

// The number of milliseconds in one day
const DEFAULT_ICON_TEXT = 'date_range';
const CLEAR_ICON_TEXT = 'clear';
const DEFAULT_FORMAT_OPTIONS = { day: 'numeric', month: 'numeric', year: 'numeric' };
const CSS_CLASS_INPUT_BUNDLE = '.igx-input-group__bundle';
const CSS_CLASS_INPUT_START = '.igx-input-group__bundle-start';
const CSS_CLASS_INPUT_END = '.igx-input-group__bundle-end';
const CSS_CLASS_INPUT = '.igx-input-group__input';
const CSS_CLASS_INPUT_GROUP_REQUIRED = 'igx-input-group--required';
const CSS_CLASS_INPUT_GROUP_INVALID = 'igx-input-group--invalid';
const CSS_CLASS_CALENDAR = 'igx-calendar';
const CSS_CLASS_ICON = 'igx-icon';
const CSS_CLASS_DIALOG_BUTTON = 'igx-button--flat';
const CSS_CLASS_LABEL = 'igx-input-group__label';
const CSS_CLASS_OVERLAY_CONTENT = 'igx-overlay__content';
const CSS_CLASS_DATE_RANGE = 'igx-date-range-picker';
const CSS_CLASS_CALENDAR_DATE = 'igx-days-view__date';
const CSS_CLASS_INACTIVE_DATE = 'igx-days-view__date--inactive';
const CSS_CLASS_CALENDAR_HEADER_TEMPLATE = '.igx-calendar__header-date';
const CSS_CLASS_CALENDAR_HEADER_TITLE = '.igx-calendar__header-year';
const CSS_CLASS_CALENDAR_SUBHEADER = '.igx-calendar-picker__dates';
const CSS_CLASS_CALENDAR_HEADER = '.igx-calendar__header';
const CSS_CLASS_CALENDAR_WRAPPER_VERTICAL = 'igx-calendar__wrapper--vertical';

describe('IgxDateRangePicker', () => {
    describe('Unit tests: ', () => {
        let fixture: ComponentFixture<IgxDateRangePickerComponent>;
        let dateRange: IgxDateRangePickerComponent;
        const elementRef = { nativeElement: null };

        let onChangeFn: ReturnType<typeof vi.fn>;
        let onTouchedFn: ReturnType<typeof vi.fn>;
        let onValidatorChangeFn: ReturnType<typeof vi.fn>;

        beforeEach(async () => {
            onChangeFn = vi.fn().mockName('NgControl.onChange');
            onTouchedFn = vi.fn().mockName('NgControl.onTouched');
            onValidatorChangeFn = vi.fn().mockName('NgControl.onValidatorChange');

            await TestBed.configureTestingModule({
                imports: [NoopAnimationsModule],
                providers: [
                    { provide: ElementRef, useValue: elementRef },
                    IgxAngularAnimationService,
                    IgxOverlayService,
                ]
            });

            fixture = TestBed.createComponent(IgxDateRangePickerComponent);
            dateRange = fixture.componentInstance;
            fixture.detectChanges();
        });

        describe('select()', () => {
            it('sets both value.start and value.end when two dates are provided', () => {
                const startDate = new Date(2020, 3, 7);
                const endDate = new Date(2020, 6, 27);

                dateRange.select(startDate, endDate);

                expect(dateRange.value.start).toEqual(startDate);
                expect(dateRange.value.end).toEqual(endDate);
            });

            it('sets value.start === value.end when only a start date is provided', () => {
                const startDate = new Date(2023, 2, 11);

                dateRange.select(startDate);

                expect(dateRange.value.start).toEqual(startDate);
                expect(dateRange.value.end).toEqual(startDate);
            });
        });

        describe('valueChange', () => {
            it('emits { start, end } when select(start, end) is called', () => {
                vi.spyOn(dateRange.valueChange, 'emit');
                const startDate = new Date(2017, 4, 5);
                const endDate = new Date(2017, 11, 22);

                dateRange.select(startDate, endDate);

                expect(dateRange.valueChange.emit).toHaveBeenCalledTimes(1);
                expect(dateRange.valueChange.emit).toHaveBeenCalledWith({ start: startDate, end: endDate });
            });

            it('emits { start, start } when select(start) is called with a single date', () => {
                vi.spyOn(dateRange.valueChange, 'emit');
                const startDate = new Date(2024, 5, 15);

                dateRange.select(startDate);

                expect(dateRange.valueChange.emit).toHaveBeenCalledTimes(1);
                expect(dateRange.valueChange.emit).toHaveBeenCalledWith({ start: startDate, end: startDate });
            });

            it('emits null when value is set to null', () => {
                dateRange.value = { start: new Date(2020, 1, 1), end: new Date(2020, 1, 15) };
                vi.spyOn(dateRange.valueChange, 'emit');

                dateRange.value = null;

                expect(dateRange.valueChange.emit).toHaveBeenCalledTimes(1);
                expect(dateRange.valueChange.emit).toHaveBeenCalledWith(null);
            });
        });

        describe('ControlValueAccessor', () => {
            it('writeValue() sets the value without triggering the onChange callback', () => {
                dateRange.registerOnChange(onChangeFn);
                const range = { start: new Date(2020, 1, 18), end: new Date(2020, 1, 28) };

                expect(dateRange.value).toBeUndefined();
                dateRange.writeValue(range);

                expect(dateRange.value).toBe(range);
                expect(onChangeFn).not.toHaveBeenCalled();
            });

            it('setting value directly triggers the onChange callback with the new range', () => {
                dateRange.registerOnChange(onChangeFn);
                const range = { start: new Date(2020, 2, 22), end: new Date(2020, 2, 25) };

                dateRange.value = range;

                expect(onChangeFn).toHaveBeenCalledTimes(1);
                expect(onChangeFn).toHaveBeenCalledWith(range);
            });

            it('setDisabledState(true) sets disabled to true; setDisabledState(false) resets it', () => {
                dateRange.setDisabledState(true);
                expect(dateRange.disabled).toBe(true);

                dateRange.setDisabledState(false);
                expect(dateRange.disabled).toBe(false);
            });
        });

        describe('clear()', () => {
            it('resets value to null', () => {
                dateRange.value = { start: new Date(2025, 0, 1), end: new Date(2025, 0, 31) };

                dateRange.clear();

                expect(dateRange.value).toBeNull();
            });

            it('emits null via valueChange', () => {
                dateRange.value = { start: new Date(2025, 0, 1), end: new Date(2025, 0, 31) };
                vi.spyOn(dateRange.valueChange, 'emit');

                dateRange.clear();

                expect(dateRange.valueChange.emit).toHaveBeenCalledWith(null);
            });

            it('does not clear when the picker is disabled', () => {
                const range = { start: new Date(2025, 0, 1), end: new Date(2025, 0, 31) };
                dateRange.value = range;
                dateRange.setDisabledState(true);

                dateRange.clear();

                expect(dateRange.value).toBe(range);
            });
        });

        describe('Validator — minValue / maxValue', () => {
            beforeEach(() => {
                dateRange.registerOnValidatorChange(onValidatorChangeFn);
            });

            it('calls onValidatorChange when minValue is set', () => {
                dateRange.minValue = new Date(2020, 4, 7);

                expect(onValidatorChangeFn).toHaveBeenCalledTimes(1);
            });

            it('calls onValidatorChange when maxValue is set', () => {
                dateRange.maxValue = new Date(2020, 8, 7);

                expect(onValidatorChangeFn).toHaveBeenCalledTimes(1);
            });

            it('returns null for a value within [minValue, maxValue]', () => {
                dateRange.minValue = new Date(2020, 4, 7);
                dateRange.maxValue = new Date(2020, 8, 7);
                dateRange.writeValue({ start: new Date(2020, 4, 18), end: new Date(2020, 6, 28) });

                expect(dateRange.validate(new UntypedFormControl(dateRange.value))).toBeNull();
            });

            it('returns { minValue: true } when start is before minValue', () => {
                dateRange.minValue = new Date(2020, 4, 7);
                dateRange.maxValue = new Date(2020, 8, 7);
                dateRange.writeValue({ start: new Date(2020, 2, 1), end: new Date(2020, 6, 28) });

                expect(dateRange.validate(new UntypedFormControl(dateRange.value))).toEqual({ minValue: true });
            });

            it('returns { minValue: true, maxValue: true } when start is before min AND end is after max', () => {
                dateRange.minValue = new Date(2020, 4, 7);
                dateRange.maxValue = new Date(2020, 8, 7);
                dateRange.writeValue({ start: new Date(2020, 2, 1), end: new Date(2020, 10, 1) });

                expect(dateRange.validate(new UntypedFormControl(dateRange.value))).toEqual({ minValue: true, maxValue: true });
            });
        });

        describe('Validator — disabledDates', () => {
            beforeEach(() => {
                dateRange.registerOnValidatorChange(onValidatorChangeFn);
            });

            it('calls onValidatorChange when disabledDates is set', () => {
                dateRange.disabledDates = [{ type: DateRangeType.Weekends, dateRange: [] }];

                expect(onValidatorChangeFn).toHaveBeenCalledTimes(1);
            });

            it('returns null when the value does not overlap any disabled range', () => {
                const year = new Date().getFullYear();
                const month = new Date().getMonth();
                dateRange.disabledDates = [{ type: DateRangeType.Between, dateRange: [new Date(year, month, 10), new Date(year, month, 18)] }];
                dateRange.writeValue({ start: new Date(year, month, 1), end: new Date(year, month, 7) });

                expect(dateRange.validate(new UntypedFormControl(dateRange.value))).toBeNull();
            });

            it('returns { dateIsDisabled: true } when the value overlaps a disabled range', () => {
                const year = new Date().getFullYear();
                const month = new Date().getMonth();
                dateRange.disabledDates = [{ type: DateRangeType.Between, dateRange: [new Date(year, month, 10), new Date(year, month, 18)] }];
                dateRange.writeValue({ start: new Date(year, month, 8), end: new Date(year, month, 18) });

                expect(dateRange.validate(new UntypedFormControl(dateRange.value))).toEqual({ dateIsDisabled: true });
            });
        });
    });

    describe('Integration tests', () => {
        let fixture: ComponentFixture<DateRangeTestComponent>;
        let dateRange: IgxDateRangePickerComponent;
        let startDate: Date;
        let endDate: Date;
        let calendar: DebugElement | Element;
        let calendarDays: DebugElement[] | HTMLCollectionOf<Element>;
        let detectChanges: () => void;

        const selectDateRangeFromCalendar = async (sDate: Date, eDate: Date, autoClose: boolean = true) => {
            dateRange.open();
            await vi.runAllTimersAsync();
            detectChanges();

            calendarDays = document.getElementsByClassName(CSS_CLASS_CALENDAR_DATE);
            const nodesArray = Array.from(calendarDays);
            const findNodeIndex: (d: Date) => number = (d: Date) => nodesArray
                .findIndex(n => n.attributes['aria-label'].value === d.toDateString()
                && !n.classList.contains(CSS_CLASS_INACTIVE_DATE));
            const startIndex = findNodeIndex(sDate);
            const endIndex = findNodeIndex(eDate);
            if (startIndex === -1) {
                throw new Error('Start date not found in calendar. Aborting.');
            }
            UIInteractions.simulateClickAndSelectEvent(calendarDays[startIndex].firstChild as HTMLElement);
            if (endIndex !== -1 && endIndex !== startIndex) { // do not click same date twice
                UIInteractions.simulateClickAndSelectEvent(calendarDays[endIndex].firstChild as HTMLElement);
            }

            await vi.runAllTimersAsync();
            detectChanges();

            if (autoClose) {
                dateRange.close();
                await vi.runAllTimersAsync();
                detectChanges();
            }
        };

        describe('Single Input', () => {
            let singleInputElement: DebugElement;

            beforeEach(async () => {
                await TestBed.configureTestingModule({
                    imports: [
                        NoopAnimationsModule,
                        ReactiveFormsModule,
                        DateRangeDefaultComponent,
                        DateRangeDisabledComponent,
                        DateRangeReactiveFormComponent
                    ]
                }).compileComponents();
            });

            beforeEach(async () => {
                vi.useFakeTimers();
                fixture = TestBed.createComponent(DateRangeDefaultComponent);
                fixture.detectChanges();

                detectChanges = () => fixture.changeDetectorRef.detectChanges();
                dateRange = fixture.componentInstance.dateRange;
                singleInputElement = fixture.debugElement.query(By.css(CSS_CLASS_INPUT));
            });

            afterEach(() => {
                vi.useRealTimers();
            });

            const verifyDateRangeInSingleInput = () => {
                expect(dateRange.value.start).toEqual(startDate);
                expect(dateRange.value.end).toEqual(endDate);
                const inputStartDate = [startDate.getMonth() + 1, startDate.getDate(), startDate.getFullYear()].join('/');
                const inputEndDate = endDate ? [endDate.getMonth() + 1, endDate.getDate(), endDate.getFullYear()].join('/') : '';
                expect(singleInputElement.nativeElement.value).toEqual(`${inputStartDate} - ${inputEndDate}`);
            };

            describe('Selection tests', () => {
                it('should assign range dates to the input when selecting a range from the calendar', async () => {
                    fixture.componentInstance.mode = PickerInteractionMode.DropDown;
                    fixture.componentInstance.dateRange.displayFormat = 'M/d/yyyy';
                    detectChanges();

                    const dayRange = 15;
                    const today = new Date();
                    startDate = new Date(today.getFullYear(), today.getMonth(), 10, 0, 0, 0);
                    endDate = new Date(startDate);
                    endDate.setDate(endDate.getDate() + dayRange);
                    await selectDateRangeFromCalendar(startDate, endDate);
                    verifyDateRangeInSingleInput();
                });

                it('should assign range values correctly when selecting dates in reversed order', async() => {
                    fixture.componentInstance.mode = PickerInteractionMode.DropDown;
                    fixture.componentInstance.dateRange.displayFormat = 'M/d/yyyy';
                    detectChanges();

                    const today = new Date();
                    startDate = new Date(today.getFullYear(), today.getMonth(), 5, 0, 0, 0);
                    endDate = new Date(today.getFullYear(), today.getMonth(), 10, 0, 0, 0);
                    await selectDateRangeFromCalendar(endDate, startDate);
                    verifyDateRangeInSingleInput();
                });

                it('should set start and end dates on single date selection', async () => {
                    fixture.componentInstance.mode = PickerInteractionMode.DropDown;
                    fixture.componentInstance.dateRange.displayFormat = 'M/d/yyyy';
                    detectChanges();

                    const today = new Date();
                    startDate = new Date(today.getFullYear(), today.getMonth(), 10, 0, 0, 0);
                    endDate = startDate;
                    await selectDateRangeFromCalendar(startDate, endDate);
                    verifyDateRangeInSingleInput();
                });

                it('should update input correctly on first and last date selection', async () => {
                    fixture.componentInstance.dateRange.displayFormat = 'M/d/yyyy';
                    detectChanges();

                    const today = new Date();
                    startDate = new Date(today.getFullYear(), today.getMonth(), 1, 0, 0, 0);
                    endDate = new Date(today.getFullYear(), today.getMonth() + 2, 0, 0, 0, 0);
                    await selectDateRangeFromCalendar(startDate, endDate);
                    verifyDateRangeInSingleInput();
                });

                it('should assign range values correctly when selecting through API', () => {
                    fixture.componentInstance.dateRange.displayFormat = 'M/d/yyyy';
                    detectChanges();

                    startDate = new Date(2020, 10, 8, 0, 0, 0);
                    endDate = new Date(2020, 11, 8, 0, 0, 0);
                    dateRange.select(startDate, endDate);

                    detectChanges();
                    verifyDateRangeInSingleInput();

                    startDate = new Date(2006, 5, 18, 0, 0, 0);
                    endDate = new Date(2006, 8, 18, 0, 0, 0);
                    dateRange.select(startDate, endDate);
                    detectChanges();
                    verifyDateRangeInSingleInput();
                });
            });

            describe('Clear tests', () => {
                const range = { start: new Date(2025, 1, 1), end: new Date(2025, 1, 2) };

                describe('Default clear icon', () => {
                    it('should display default clear icon when value is set', () => {
                        const inputGroup = fixture.debugElement.query(By.directive(IgxInputGroupComponent));
                        let suffix = inputGroup.query(By.directive(IgxSuffixDirective));
                        expect(suffix).toBeNull();

                        dateRange.value = range;
                        detectChanges();

                        suffix = inputGroup.query(By.directive(IgxSuffixDirective));
                        const icon = suffix.query(By.css(CSS_CLASS_ICON));
                        expect(icon).not.toBeNull();
                        expect(icon.nativeElement.textContent.trim()).toEqual(CLEAR_ICON_TEXT);
                    });

                    it('should clear the value when clicking the default clear icon (suffix)', async () => {
                        dateRange.value = range;
                        detectChanges();

                        const inputGroup = fixture.debugElement.query(By.directive(IgxInputGroupComponent));
                        let suffix = inputGroup.query(By.directive(IgxSuffixDirective));
                        vi.spyOn(dateRange.valueChange, 'emit');

                        UIInteractions.simulateClickAndSelectEvent(suffix.nativeElement);
                        await vi.runAllTimersAsync();
                        detectChanges();

                        expect(dateRange.value).toBeNull();
                        suffix = inputGroup.query(By.directive(IgxSuffixDirective));
                        expect(suffix).toBeNull();
                        expect(dateRange.valueChange.emit).toHaveBeenCalledTimes(1);
                        expect(dateRange.valueChange.emit).toHaveBeenCalledWith(null);
                    });

                    it('should not clear the value when clicking element in the suffix that is not the clear icon', async () => {
                        fixture = TestBed.createComponent(DateRangeTemplatesComponent);
                        fixture.detectChanges();
                        detectChanges = () => fixture.changeDetectorRef.detectChanges();

                        dateRange = fixture.debugElement.queryAll(By.directive(IgxDateRangePickerComponent))[0].componentInstance;
                        dateRange.value = range;
                        detectChanges();

                        const suffixIconText = 'flight_land';
                        const inputGroupsEnd = fixture.debugElement.queryAll(By.css(CSS_CLASS_INPUT_END));

                        const customSuffix = inputGroupsEnd[1];
                        expect(customSuffix.children[0].nativeElement.innerText).toBe(suffixIconText);
                        expect(customSuffix.children[0].children[0].classes[CSS_CLASS_ICON]).toBeTruthy();

                        const suffix = inputGroupsEnd[0];
                        const icon = suffix.query(By.css(CSS_CLASS_ICON));
                        expect(icon).not.toBeNull();
                        expect(icon.nativeElement.textContent.trim()).toEqual(CLEAR_ICON_TEXT);

                        UIInteractions.simulateClickAndSelectEvent(customSuffix.nativeElement);
                        await vi.runAllTimersAsync();
                        detectChanges();

                        expect(dateRange.value).toEqual(range);
                    });
                });

                describe('Projected clear icon', () => {
                    it('should clear the value when clicking the projected clear icon', async () => {
                        fixture = TestBed.createComponent(DateRangeTemplatesComponent);
                        fixture.detectChanges();
                        detectChanges = () => fixture.changeDetectorRef.detectChanges();

                        dateRange = fixture.debugElement.queryAll(By.directive(IgxDateRangePickerComponent))[4].componentInstance;

                        const pickerClear = fixture.debugElement.queryAll(By.directive(IgxPickerClearComponent))[0];
                        // Projected clear icon is rendered even if value is unassigned
                        expect(pickerClear).not.toBeNull();

                        const suffixes = dateRange.element.nativeElement.querySelectorAll(CSS_CLASS_INPUT_END);
                        expect(suffixes.length).toBe(1);
                        // the default clear icon is overridden by the projected one
                        expect(suffixes[0].textContent.trim()).toEqual('delete');

                        dateRange.value = range;
                        detectChanges();

                        vi.spyOn(dateRange.valueChange, 'emit');
                        UIInteractions.simulateClickAndSelectEvent(pickerClear.nativeElement);
                        await vi.runAllTimersAsync();
                        detectChanges();

                        expect(dateRange.value).toBeNull();
                        expect(dateRange.valueChange.emit).toHaveBeenCalledTimes(1);
                        expect(dateRange.valueChange.emit).toHaveBeenCalledWith(null);
                    });
                });
            });

            describe('Properties & events tests', () => {
                it('should display placeholder', () => {
                    detectChanges();
                    expect(singleInputElement.nativeElement.placeholder).toEqual('MM/dd/yyyy - MM/dd/yyyy');

                    const placeholder = 'Some placeholder';
                    fixture.componentInstance.dateRange.placeholder = placeholder;
                    detectChanges();
                    expect(singleInputElement.nativeElement.placeholder).toEqual(placeholder);
                });

                it('should support different display and input formats', () => {
                    dateRange.inputFormat = 'dd/MM/yy'; // should not be registered
                    dateRange.displayFormat = 'longDate';
                    detectChanges();
                    expect(dateRange.inputDirective.placeholder).toEqual(`MMMM d, yyyy - MMMM d, yyyy`);
                    const today = new Date();
                    startDate = new Date(today.getFullYear(), today.getMonth(), 1, 0, 0, 0);
                    endDate = new Date(today.getFullYear(), today.getMonth(), 5, 0, 0, 0);
                    dateRange.select(startDate, endDate);
                    detectChanges();
                    const longDateOptions = { month: 'long', day: 'numeric' };
                    let inputStartDate = `${ControlsFunction.formatDate(startDate, longDateOptions)}, ${startDate.getFullYear()}`;
                    let inputEndDate = `${ControlsFunction.formatDate(endDate, longDateOptions)}, ${endDate.getFullYear()}`;
                    expect(singleInputElement.nativeElement.value).toEqual(`${inputStartDate} - ${inputEndDate}`);

                    dateRange.value = null;
                    dateRange.displayFormat = 'shortDate';
                    detectChanges();

                    expect(dateRange.inputDirective.placeholder).toEqual(`M/d/yy - M/d/yy`);
                    startDate.setDate(2);
                    endDate.setDate(19);
                    dateRange.select(startDate, endDate);
                    detectChanges();

                    const shortDateOptions = { day: 'numeric', month: 'numeric', year: '2-digit' };
                    inputStartDate = ControlsFunction.formatDate(startDate, shortDateOptions);
                    inputEndDate = ControlsFunction.formatDate(endDate, shortDateOptions);
                    expect(singleInputElement.nativeElement.value).toEqual(`${inputStartDate} - ${inputEndDate}`);

                    dateRange.value = null;
                    dateRange.displayFormat = 'fullDate';
                    detectChanges();

                    expect(dateRange.inputDirective.placeholder).toEqual(`EEEE, MMMM d, yyyy - EEEE, MMMM d, yyyy`);
                    startDate.setDate(12);
                    endDate.setDate(23);
                    dateRange.select(startDate, endDate);
                    detectChanges();

                    const fullDateOptions = { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' };
                    inputStartDate = ControlsFunction.formatDate(startDate, fullDateOptions);
                    inputEndDate = ControlsFunction.formatDate(endDate, fullDateOptions);
                    expect(singleInputElement.nativeElement.value).toEqual(`${inputStartDate} - ${inputEndDate}`);

                    dateRange.value = null;
                    dateRange.displayFormat = 'dd-MM-yy';
                    detectChanges();

                    startDate.setDate(9);
                    endDate.setDate(13);
                    dateRange.select(startDate, endDate);
                    detectChanges();

                    const customFormatOptions = { day: 'numeric', month: 'numeric', year: '2-digit' };
                    inputStartDate = ControlsFunction.formatDate(startDate, customFormatOptions, 'en-GB').
                        replace(/\//g, '-');
                    inputEndDate = ControlsFunction.formatDate(endDate, customFormatOptions, 'en-GB').
                        replace(/\//g, '-');
                    expect(singleInputElement.nativeElement.value).toEqual(`${inputStartDate} - ${inputEndDate}`);
                });

                it('should close the calendar with the "Done" button', async () => {
                    fixture.componentInstance.mode = PickerInteractionMode.Dialog;
                    fixture.componentInstance.dateRange.displayFormat = 'M/d/yyyy';
                    detectChanges();

                    vi.spyOn(dateRange.closing, 'emit');
                    vi.spyOn(dateRange.closed, 'emit');

                    dateRange.open();
                    await vi.runAllTimersAsync();
                    detectChanges();
                    expect(dateRange.collapsed).toBeFalsy();

                    const doneBtn = document.getElementsByClassName(CSS_CLASS_DIALOG_BUTTON)[0];
                    UIInteractions.simulateClickAndSelectEvent(doneBtn);
                    await vi.runAllTimersAsync();
                    detectChanges();

                    expect(dateRange.collapsed).toBe(true);
                    expect(dateRange.closing.emit).toHaveBeenCalledTimes(1);
                    expect(dateRange.closing.emit).toHaveBeenCalledWith({ owner: dateRange, cancel: false, event: undefined });
                    expect(dateRange.closed.emit).toHaveBeenCalledTimes(1);
                    expect(dateRange.closed.emit).toHaveBeenCalledWith({ owner: dateRange });
                });

                it('should close the calendar with the "Cancel" button and retain original value', async () => {
                    fixture.componentInstance.mode = PickerInteractionMode.Dialog;
                    const orig = { start: new Date(2020, 0, 1), end: new Date(2020, 0, 5) };
                    fixture.componentInstance.dateRange.value = orig;
                    detectChanges();

                    vi.spyOn(dateRange.closing, 'emit');
                    vi.spyOn(dateRange.closed, 'emit');

                    dateRange.open();
                    await vi.runAllTimersAsync();
                    detectChanges();
                    expect(dateRange.collapsed).toBeFalsy();

                    await selectDateRangeFromCalendar(new Date(2020, 0, 8), new Date(2020, 0, 12), false);

                    const cancelBtn = document.getElementsByClassName(CSS_CLASS_DIALOG_BUTTON)[0];
                    UIInteractions.simulateClickAndSelectEvent(cancelBtn);
                    await vi.runAllTimersAsync();
                    detectChanges();

                    expect(dateRange.collapsed).toBe(true);
                    expect(dateRange.closing.emit).toHaveBeenCalledTimes(1);
                    expect(dateRange.closing.emit).toHaveBeenCalledWith({ owner: dateRange, cancel: false, event: undefined });
                    expect(dateRange.closed.emit).toHaveBeenCalledTimes(1);
                    expect(dateRange.closed.emit).toHaveBeenCalledWith({ owner: dateRange });

                    expect(fixture.componentInstance.dateRange.value).toEqual(orig);
                });

                it('should show the "Done" and "Cancel" buttons only in dialog mode', async () => {
                    fixture.componentInstance.mode = PickerInteractionMode.Dialog;
                    detectChanges();

                    dateRange.open();
                    await vi.runAllTimersAsync();
                    detectChanges();

                    let doneBtn = document.getElementsByClassName(CSS_CLASS_DIALOG_BUTTON)[0];
                    let cancelBtn = document.getElementsByClassName(CSS_CLASS_DIALOG_BUTTON)[1];
                    expect(doneBtn).not.toBe(null);
                    expect(cancelBtn).not.toBe(null);

                    dateRange.close();
                    await vi.runAllTimersAsync();
                    detectChanges();

                    fixture.componentInstance.mode = PickerInteractionMode.DropDown;
                    detectChanges();

                    dateRange.open();
                    await vi.runAllTimersAsync();
                    detectChanges();

                    doneBtn = document.getElementsByClassName(CSS_CLASS_DIALOG_BUTTON)[0];
                    cancelBtn = document.getElementsByClassName(CSS_CLASS_DIALOG_BUTTON)[1];
                    expect(doneBtn).not.toBeDefined();
                    expect(cancelBtn).not.toBeDefined();
                });

                it('should be able to change the "Done" button text', async () => {
                    fixture.componentInstance.mode = PickerInteractionMode.Dialog;
                    detectChanges();

                    dateRange.toggle();
                    await vi.runAllTimersAsync();
                    detectChanges();

                    let doneBtn = document.getElementsByClassName(CSS_CLASS_DIALOG_BUTTON)[1];
                    let cancelBtn = document.getElementsByClassName(CSS_CLASS_DIALOG_BUTTON)[0];
                    expect(doneBtn.textContent.trim()).toEqual('Done');
                    expect(cancelBtn.textContent.trim()).toEqual('Cancel');

                    dateRange.toggle();
                    await vi.runAllTimersAsync();
                    detectChanges();

                    dateRange.doneButtonText = 'Close';
                    dateRange.cancelButtonText = 'Discard';

                    dateRange.toggle();
                    await vi.runAllTimersAsync();
                    detectChanges();

                    doneBtn = document.getElementsByClassName(CSS_CLASS_DIALOG_BUTTON)[1];
                    cancelBtn = document.getElementsByClassName(CSS_CLASS_DIALOG_BUTTON)[0];
                    expect(doneBtn.textContent.trim()).toEqual('Close');
                });

                it('should emit open/close events - open/close methods', async () => {
                    fixture.componentInstance.dateRange.displayFormat = 'M/d/yyyy';
                    detectChanges();

                    vi.spyOn(dateRange.opening, 'emit');
                    vi.spyOn(dateRange.opened, 'emit');
                    vi.spyOn(dateRange.closing, 'emit');
                    vi.spyOn(dateRange.closed, 'emit');

                    dateRange.open();
                    await vi.runAllTimersAsync();
                    detectChanges();

                    expect(dateRange.collapsed).toBeFalsy();
                    expect(dateRange.opening.emit).toHaveBeenCalledTimes(1);
                    expect(dateRange.opening.emit).toHaveBeenCalledWith({ owner: dateRange, cancel: false, event: undefined });
                    expect(dateRange.opened.emit).toHaveBeenCalledTimes(1);
                    expect(dateRange.opened.emit).toHaveBeenCalledWith({ owner: dateRange });

                    dateRange.close();
                    await vi.runAllTimersAsync();
                    detectChanges();

                    expect(dateRange.collapsed).toBeTruthy();
                    expect(dateRange.closing.emit).toHaveBeenCalledTimes(1);
                    expect(dateRange.closing.emit).toHaveBeenCalledWith({ owner: dateRange, cancel: false, event: undefined });
                    expect(dateRange.closed.emit).toHaveBeenCalledTimes(1);
                    expect(dateRange.closed.emit).toHaveBeenCalledWith({ owner: dateRange });
                });

                it('should emit open/close events - toggle method', async () => {
                    vi.spyOn(dateRange.opening, 'emit');
                    vi.spyOn(dateRange.opened, 'emit');
                    vi.spyOn(dateRange.closing, 'emit');
                    vi.spyOn(dateRange.closed, 'emit');

                    dateRange.toggle();
                    await vi.runAllTimersAsync();
                    detectChanges();

                    expect(dateRange.collapsed).toBeFalsy();
                    expect(dateRange.opening.emit).toHaveBeenCalledTimes(1);
                    expect(dateRange.opening.emit).toHaveBeenCalledWith({ owner: dateRange, cancel: false, event: undefined });
                    expect(dateRange.opened.emit).toHaveBeenCalledTimes(1);
                    expect(dateRange.opened.emit).toHaveBeenCalledWith({ owner: dateRange });

                    dateRange.toggle();
                    await vi.runAllTimersAsync();
                    detectChanges();

                    expect(dateRange.collapsed).toBeTruthy();
                    expect(dateRange.closing.emit).toHaveBeenCalledTimes(1);
                    expect(dateRange.closing.emit).toHaveBeenCalledWith({ owner: dateRange, cancel: false, event: undefined });
                    expect(dateRange.closed.emit).toHaveBeenCalledTimes(1);
                    expect(dateRange.closed.emit).toHaveBeenCalledWith({ owner: dateRange });
                });

                it('should not close calendar if closing event is canceled', async () => {
                    vi.spyOn(dateRange.closing, 'emit');
                    vi.spyOn(dateRange.closed, 'emit');
                    dateRange.closing.subscribe((e: CancelableEventArgs) => e.cancel = true);

                    dateRange.toggle();
                    detectChanges();
                    await vi.runAllTimersAsync();
                    expect(dateRange.collapsed).toBeFalsy();

                    const dayRange = 6;
                    const today = new Date();
                    startDate = new Date(today.getFullYear(), today.getMonth(), 14, 0, 0, 0);
                    endDate = new Date(startDate);
                    endDate.setDate(endDate.getDate() + dayRange);
                    dateRange.select(startDate, endDate);

                    dateRange.close();
                    detectChanges();
                    await vi.runAllTimersAsync();
                    expect(dateRange.collapsed).toBeFalsy();
                    expect(dateRange.closing.emit).toHaveBeenCalled();
                    expect(dateRange.closed.emit).not.toHaveBeenCalled();
                });
            });

            describe('Keyboard navigation', () => {
                it('should toggle the calendar with ALT + DOWN/UP ARROW key', async () => {
                    vi.spyOn(dateRange.opening, 'emit');
                    vi.spyOn(dateRange.opened, 'emit');
                    vi.spyOn(dateRange.closing, 'emit');
                    vi.spyOn(dateRange.closed, 'emit');
                    expect(dateRange.collapsed).toBeTruthy();
                    expect(dateRange.isFocused).toBe(false);

                    const range = fixture.debugElement.query(By.css(CSS_CLASS_DATE_RANGE));
                    UIInteractions.triggerEventHandlerKeyDown('ArrowDown', range, true);
                    await vi.runAllTimersAsync();
                    detectChanges();

                    expect(dateRange.collapsed).toBeFalsy();
                    expect(dateRange.opening.emit).toHaveBeenCalledTimes(1);
                    expect(dateRange.opened.emit).toHaveBeenCalledTimes(1);

                    const calendarWrapper = fixture.debugElement.query(By.css('.igx-calendar__wrapper')).nativeElement;
                    expect(calendarWrapper.contains(document.activeElement), 'focus should move to calendar for KB nav').toBe(true);
                    expect(dateRange.isFocused).toBe(true);

                    UIInteractions.triggerKeyDownEvtUponElem('ArrowUp', calendarWrapper, true, true);
                    await vi.runAllTimersAsync();
                    detectChanges();

                    expect(dateRange.collapsed).toBeTruthy();
                    expect(dateRange.closing.emit).toHaveBeenCalledTimes(1);
                    expect(dateRange.closed.emit).toHaveBeenCalledTimes(1);
                    expect(dateRange.inputDirective.nativeElement.contains(document.activeElement), 'focus should return to the picker input').toBe(true);
                    expect(dateRange.isFocused).toBe(true);
                });

                it('should close the calendar with ESC', async () => {
                    vi.spyOn(dateRange.closing, 'emit');
                    vi.spyOn(dateRange.closed, 'emit');
                    dateRange.mode = 'dropdown';

                    expect(dateRange.collapsed).toBeTruthy();
                    dateRange.open();
                    await vi.runAllTimersAsync();
                    detectChanges();
                    expect(dateRange.collapsed).toBeFalsy();

                    const calendarWrapper = fixture.debugElement.query(By.css('.igx-calendar__wrapper')).nativeElement;
                    expect(calendarWrapper.contains(document.activeElement), 'focus should move to calendar for KB nav').toBe(true);
                    expect(dateRange.isFocused).toBe(true);

                    UIInteractions.triggerKeyDownEvtUponElem('Escape', calendarWrapper, true);
                    await vi.runAllTimersAsync();
                    detectChanges();

                    expect(dateRange.collapsed).toBeTruthy();
                    expect(dateRange.closing.emit).toHaveBeenCalledTimes(1);
                    expect(dateRange.closed.emit).toHaveBeenCalledTimes(1);
                    expect(dateRange.inputDirective.nativeElement.contains(document.activeElement), 'focus should return to the picker input').toBe(true);
                    expect(dateRange.isFocused).toBe(true);
                });

                it('should not open calendar with ALT + DOWN ARROW key if disabled is set to true', async () => {
                    fixture.componentInstance.mode = PickerInteractionMode.DropDown;
                    fixture.componentInstance.disabled = true;
                    detectChanges();

                    vi.spyOn(dateRange.opening, 'emit');
                    vi.spyOn(dateRange.opened, 'emit');

                    const input = document.getElementsByClassName('igx-input-group__input')[0];
                    UIInteractions.triggerKeyDownEvtUponElem('ArrowDown', input, true, true);
                    await vi.runAllTimersAsync();
                    detectChanges();
                    expect(dateRange.collapsed).toBeTruthy();
                    expect(dateRange.opening.emit).toHaveBeenCalledTimes(0);
                    expect(dateRange.opened.emit).toHaveBeenCalledTimes(0);
                });
            });

            it('should expand the calendar if the default icon (prefix) is clicked', async () => {
                const prefix = fixture.debugElement.query(By.directive(IgxPrefixDirective));
                prefix.triggerEventHandler('click', UIInteractions.getMouseEvent('click'));
                await vi.runAllTimersAsync();
                detectChanges();
                expect(fixture.componentInstance.dateRange.collapsed).toBeFalsy();
            });

            it('should not expand the calendar if the input is clicked in dropdown mode', async () => {
                UIInteractions.simulateClickAndSelectEvent(dateRange.getEditElement());
                await vi.runAllTimersAsync();
                detectChanges();
                expect(fixture.componentInstance.dateRange.collapsed).toBeTruthy();
            });

            it('should expand the calendar if the input is clicked in dialog mode', async () => {
                dateRange.mode = PickerInteractionMode.Dialog;
                detectChanges();

                UIInteractions.simulateClickAndSelectEvent(dateRange.getEditElement());
                await vi.runAllTimersAsync();
                detectChanges();
                expect(fixture.componentInstance.dateRange.collapsed).toBeFalsy();
            });

            it('should not expand the calendar if the default icon (in prefix) is clicked when disabled is set to true', async () => {
                fixture.componentInstance.disabled = true;
                detectChanges();
                const prefix = fixture.debugElement.query(By.directive(IgxPrefixDirective));
                prefix.triggerEventHandler('click', UIInteractions.getMouseEvent('click'));
                await vi.runAllTimersAsync();
                detectChanges();
                expect(fixture.componentInstance.dateRange.collapsed).toBeTruthy();
            });

            it('should properly set/update disabled when ChangeDetectionStrategy.OnPush is used', async () => {
                const testFixture = TestBed
                    .createComponent(DateRangeDisabledComponent) as ComponentFixture<DateRangeDisabledComponent>;
                testFixture.detectChanges();
                detectChanges = () => testFixture.changeDetectorRef.detectChanges();

                dateRange = testFixture.componentInstance.dateRange;
                const disabled$ = testFixture.componentInstance.disabled$;

                disabled$.next(true);
                detectChanges();
                expect(dateRange.inputDirective.disabled).toBe(true);

                disabled$.next(false);
                detectChanges();
                expect(dateRange.inputDirective.disabled).toBe(false);

                disabled$.next(true);
                detectChanges();
                expect(dateRange.inputDirective.disabled).toBe(true);

                disabled$.complete();
            });

            it('should update the calendar while it\'s open and the value has been updated', async () => {
                dateRange.open();
                await vi.runAllTimersAsync();
                detectChanges();

                const range = { start: new Date(), end: new Date(new Date().setDate(new Date().getDate() + 1)) };
                dateRange.value = range;
                detectChanges();

                expect((dateRange as any).calendar.selectedDates.length).toBeGreaterThan(0);

                // clean up test
                await vi.runAllTimersAsync();
                detectChanges();
            });

            it('should set initial validity state when the form group is disabled', () => {
                const fix = TestBed.createComponent(DateRangeReactiveFormComponent);
                fix.detectChanges();
                detectChanges = () => fix.changeDetectorRef.detectChanges();
                const dateRangePicker = fix.componentInstance.dateRange;

                fix.componentInstance.markAsTouched();
                detectChanges();
                expect(dateRangePicker.inputDirective.valid).toBe(IgxInputState.INVALID);

                fix.componentInstance.disableForm();
                detectChanges();
                expect(dateRangePicker.inputDirective.valid).toBe(IgxInputState.INITIAL);
            });

            it('should update validity state when programmatically setting errors on reactive form controls', async () => {
                const fix = TestBed.createComponent(DateRangeReactiveFormComponent);
                fix.detectChanges();
                detectChanges = () => fix.changeDetectorRef.detectChanges();

                const dateRangePicker = fix.componentInstance.dateRange;
                const form = fix.componentInstance.form;

                // the form control has validators
                form.markAllAsTouched();
                form.get('range').setErrors({ error: true });
                await vi.runAllTimersAsync();
                detectChanges();

                expect((dateRangePicker as any).inputDirective.valid).toBe(IgxInputState.INVALID);
                expect((dateRangePicker as any).inputGroup.element.nativeElement.classList.contains(CSS_CLASS_INPUT_GROUP_INVALID)).toBe(true);
                expect((dateRangePicker as any).inputGroup.element.nativeElement.classList.contains(CSS_CLASS_INPUT_GROUP_REQUIRED)).toBe(true);
                expect((dateRangePicker as any).required).toBe(true);

                // remove the validators and set errors
                form.controls['range'].clearValidators();
                form.controls['range'].updateValueAndValidity();
                await vi.runAllTimersAsync();
                detectChanges();

                form.markAllAsTouched();
                form.get('range').setErrors({ error: true });
                await vi.runAllTimersAsync();
                detectChanges();

                expect((dateRangePicker as any).inputDirective.valid).toBe(IgxInputState.INVALID);
                expect((dateRangePicker as any).inputGroup.element.nativeElement.classList.contains(CSS_CLASS_INPUT_GROUP_INVALID)).toBe(true);
                expect((dateRangePicker as any).inputGroup.element.nativeElement.classList.contains(CSS_CLASS_INPUT_GROUP_REQUIRED)).toBe(false);
            });
        });

        describe('Two Inputs', () => {
            let startInput: DebugElement;
            let endInput: DebugElement;
            // let detectChanges: () => void;

            beforeEach(async () => {
                await TestBed.configureTestingModule({
                    imports: [
                        NoopAnimationsModule,
                        ReactiveFormsModule,
                        DateRangeTwoInputsTestComponent,
                        DateRangeTwoInputsNgModelTestComponent,
                        DateRangeDisabledComponent,
                        DateRangeTwoInputsDisabledComponent,
                        DateRangeReactiveFormComponent
                    ]
                }).compileComponents();
            });

            beforeEach(async () => {
                vi.useFakeTimers();
                fixture = TestBed.createComponent(DateRangeTwoInputsTestComponent);
                fixture.detectChanges();
                detectChanges = () => fixture.changeDetectorRef.detectChanges();

                dateRange = fixture.componentInstance.dateRange;
                dateRange.value = { start: new Date('2/2/2020'), end: new Date('3/3/2020') };
                startInput = fixture.debugElement.query(By.css('input'));
                endInput = fixture.debugElement.queryAll(By.css('input'))[1];
                calendar = fixture.debugElement.query(By.css(CSS_CLASS_CALENDAR));
                calendarDays = fixture.debugElement.queryAll(By.css(HelperTestFunctions.CURRENT_MONTH_DATES));
            });

            afterEach(() => {
                vi.useRealTimers();
            });

            const verifyDateRange = () => {
                expect(dateRange.value.start).toEqual(startDate);
                expect(dateRange.value.end).toEqual(endDate);
                expect(startInput.nativeElement.value).toEqual(ControlsFunction.formatDate(startDate, DEFAULT_FORMAT_OPTIONS));
                const expectedEndDate = endDate ? ControlsFunction.formatDate(endDate, DEFAULT_FORMAT_OPTIONS) : '';
                expect(endInput.nativeElement.value).toEqual(expectedEndDate);
            };

            describe('Selection tests', () => {
                it('should assign range values correctly when selecting dates from the calendar', async () => {
                    fixture.componentInstance.mode = PickerInteractionMode.DropDown;
                    detectChanges();

                    let dayRange = 15;
                    const today = new Date();
                    startDate = new Date(today.getFullYear(), today.getMonth(), 10, 0, 0, 0);
                    endDate = new Date(startDate);
                    endDate.setDate(endDate.getDate() + dayRange);
                    await selectDateRangeFromCalendar(startDate, endDate);
                    verifyDateRange();

                    dayRange = 13;
                    startDate = new Date(today.getFullYear(), today.getMonth(), 6, 0, 0, 0);
                    endDate = new Date(startDate);
                    endDate.setDate(endDate.getDate() + dayRange);
                    await selectDateRangeFromCalendar(startDate, endDate);
                    verifyDateRange();
                });

                it('should assign range values correctly when selecting dates in reversed order', async () => {
                    fixture.componentInstance.mode = PickerInteractionMode.DropDown;
                    detectChanges();

                    const today = new Date();
                    startDate = new Date(today.getFullYear(), today.getMonth(), 10, 0, 0, 0);
                    endDate = new Date(today.getFullYear(), today.getMonth(), 20, 0, 0, 0);
                    await selectDateRangeFromCalendar(endDate, startDate);
                    verifyDateRange();
                });

                it('should apply selection to start and end dates when single date is selected', async () => {
                    fixture.componentInstance.mode = PickerInteractionMode.DropDown;
                    detectChanges();

                    const today = new Date();
                    startDate = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0);
                    endDate = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0); // startDate;

                    await selectDateRangeFromCalendar(startDate, endDate);
                    verifyDateRange();
                });

                it('should update inputs correctly on first and last date selection', async () => {
                    dateRange.hideOutsideDays = true;
                    detectChanges();

                    const today = new Date();
                    startDate = new Date(today.getFullYear(), today.getMonth(), 1, 0, 0, 0);
                    endDate = new Date(today.getFullYear(), today.getMonth() + 2, 0, 0, 0, 0);
                    await selectDateRangeFromCalendar(startDate, endDate);
                    verifyDateRange();
                });

                it('should assign range values correctly when selecting through API', async () => {
                    startDate = new Date(2020, 10, 8, 0, 0, 0);
                    endDate = new Date(2020, 11, 8, 0, 0, 0);
                    dateRange.select(startDate, endDate);
                    detectChanges();
                    verifyDateRange();

                    startDate = new Date(2003, 5, 18, 0, 0, 0);
                    endDate = new Date(2003, 8, 18, 0, 0, 0);
                    dateRange.select(startDate, endDate);
                    detectChanges();
                    verifyDateRange();
                });
                it('should support different input and display formats', () => {
                    let inputFormat = 'dd/MM/yy';
                    let displayFormat = 'longDate';
                    fixture.componentInstance.inputFormat = inputFormat;
                    fixture.componentInstance.displayFormat = displayFormat;
                    detectChanges();

                    const startInputEditor = startInput.injector.get(IgxDateTimeEditorDirective);
                    const endInputEditor = endInput.injector.get(IgxDateTimeEditorDirective);
                    expect(startInputEditor.inputFormat).toEqual(inputFormat);
                    expect(startInputEditor.displayFormat).toEqual(displayFormat);
                    expect(endInputEditor.inputFormat).toEqual(inputFormat);
                    expect(endInputEditor.displayFormat).toEqual(displayFormat);

                    inputFormat = 'yy-MM-dd';
                    displayFormat = 'shortDate';
                    fixture.componentInstance.inputFormat = inputFormat;
                    fixture.componentInstance.displayFormat = displayFormat;
                    detectChanges();

                    expect(startInputEditor.inputFormat).toEqual(inputFormat);
                    expect(startInputEditor.displayFormat).toEqual(displayFormat);
                    expect(endInputEditor.inputFormat).toEqual(inputFormat);
                    expect(endInputEditor.displayFormat).toEqual(displayFormat);

                    inputFormat = 'EE/MM/yy';
                    displayFormat = 'fullDate';
                    fixture.componentInstance.inputFormat = inputFormat;
                    fixture.componentInstance.displayFormat = displayFormat;
                    detectChanges();

                    expect(startInputEditor.inputFormat).toEqual(inputFormat);
                    expect(startInputEditor.displayFormat).toEqual(displayFormat);
                    expect(endInputEditor.inputFormat).toEqual(inputFormat);
                    expect(endInputEditor.displayFormat).toEqual(displayFormat);

                    inputFormat = 'MMM, yy';
                    displayFormat = 'MMMM, yyyy';
                    fixture.componentInstance.inputFormat = inputFormat;
                    fixture.componentInstance.displayFormat = displayFormat;
                    detectChanges();

                    expect(startInputEditor.inputFormat).toEqual(inputFormat);
                    expect(startInputEditor.displayFormat).toEqual(displayFormat);
                    expect(endInputEditor.inputFormat).toEqual(inputFormat);
                    expect(endInputEditor.displayFormat).toEqual(displayFormat);
                });

                it('should set default inputFormat to the start/end editors with parts for day, month and year based on locale ', async () => {
                    registerLocaleData(localeBg);
                    registerLocaleData(localeJa);

                    expect(fixture.componentInstance.inputFormat).toEqual(undefined);
                    expect(dateRange.locale).toEqual('en');

                    const startInputEditor = startInput.injector.get(IgxDateTimeEditorDirective);
                    const endInputEditor = endInput.injector.get(IgxDateTimeEditorDirective);
                    expect(startInputEditor.inputFormat).toEqual('MM/dd/yyyy');
                    expect(endInputEditor.inputFormat).toEqual('MM/dd/yyyy');

                    dateRange.locale = 'ja-JP';
                    detectChanges();

                    expect(startInputEditor.inputFormat).toEqual('yyyy/MM/dd');
                    expect(startInputEditor.nativeElement.placeholder).toEqual('yyyy/MM/dd');
                    expect(endInputEditor.inputFormat).toEqual('yyyy/MM/dd');

                    dateRange.locale = 'bg-BG';
                    detectChanges();

                    expect(startInputEditor.inputFormat.normalize('NFKC')).toEqual('dd.MM.yyyy г.');
                    expect(startInputEditor.nativeElement.placeholder.normalize('NFKC')).toEqual('dd.MM.yyyy г.');
                    expect(endInputEditor.inputFormat.normalize('NFKC')).toEqual('dd.MM.yyyy г.');
                });

                it('should resolve inputFormat, if not set, to the value of displayFormat if it contains only numeric date/time parts', async () => {
                    const startInputEditor = startInput.injector.get(IgxDateTimeEditorDirective);
                    const endInputEditor = endInput.injector.get(IgxDateTimeEditorDirective);

                    fixture.componentInstance.displayFormat = 'MM-dd-yyyy';
                    detectChanges();

                    expect(startInputEditor.displayFormat.normalize('NFKC')).toEqual('MM-dd-yyyy');
                    expect(startInputEditor.nativeElement.placeholder.normalize('NFKC')).toEqual('MM-dd-yyyy');
                    expect(endInputEditor.inputFormat.normalize('NFKC')).toEqual('MM-dd-yyyy');

                    fixture.componentInstance.displayFormat = 'shortDate';
                    detectChanges();

                    expect(startInputEditor.displayFormat.normalize('NFKC')).toEqual('shortDate');
                    expect(startInputEditor.nativeElement.placeholder.normalize('NFKC')).toEqual('MM/dd/yyyy');
                    expect(endInputEditor.inputFormat.normalize('NFKC')).toEqual('MM/dd/yyyy');
                });

                it('should resolve to the default locale-based input format in case inputFormat is not set and displayFormat contains non-numeric date/time parts', async () => {
                    registerLocaleData(localeBg);
                    const startInputEditor = startInput.injector.get(IgxDateTimeEditorDirective);
                    const endInputEditor = endInput.injector.get(IgxDateTimeEditorDirective);

                    dateRange.locale = 'bg-BG';
                    detectChanges();

                    fixture.componentInstance.displayFormat = 'full';
                    detectChanges();

                    expect(startInputEditor.displayFormat.normalize('NFKC')).toEqual('full');
                    expect(startInputEditor.nativeElement.placeholder.normalize('NFKC')).toEqual('dd.MM.yyyy г.');
                    expect(endInputEditor.inputFormat.normalize('NFKC')).toEqual('dd.MM.yyyy г.');

                    fixture.componentInstance.displayFormat = 'MMM-dd-yyyy';
                    detectChanges();

                    expect(startInputEditor.displayFormat.normalize('NFKC')).toEqual('MMM-dd-yyyy');
                    expect(startInputEditor.nativeElement.placeholder.normalize('NFKC')).toEqual('dd.MM.yyyy г.');
                    expect(endInputEditor.inputFormat.normalize('NFKC')).toEqual('dd.MM.yyyy г.');
                });

                it('should display dates according to the applied display format', () => {
                    const today = new Date();
                    startDate = new Date(today.getFullYear(), today.getMonth(), 1, 0, 0, 0);
                    endDate = new Date(today.getFullYear(), today.getMonth(), 5, 0, 0, 0);
                    dateRange.select(startDate, endDate);
                    detectChanges();
                    expect(startInput.nativeElement.value).toEqual(ControlsFunction.formatDate(startDate, DEFAULT_FORMAT_OPTIONS));
                    expect(endInput.nativeElement.value).toEqual(ControlsFunction.formatDate(endDate, DEFAULT_FORMAT_OPTIONS));

                    fixture.componentInstance.displayFormat = 'shortDate';
                    detectChanges();

                    startDate.setDate(2);
                    endDate.setDate(19);
                    dateRange.select(startDate, endDate);
                    detectChanges();

                    const shortDateFormatOptions = { day: 'numeric', month: 'numeric', year: '2-digit' };
                    expect(startInput.nativeElement.value).toEqual(ControlsFunction.formatDate(startDate, shortDateFormatOptions));
                    expect(endInput.nativeElement.value).toEqual(ControlsFunction.formatDate(endDate, shortDateFormatOptions));

                    fixture.componentInstance.displayFormat = 'fullDate';
                    detectChanges();

                    startDate.setDate(12);
                    endDate.setDate(23);
                    dateRange.select(startDate, endDate);
                    detectChanges();

                    const fullDateFormatOptions = { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' };
                    expect(startInput.nativeElement.value).toEqual(ControlsFunction.formatDate(startDate, fullDateFormatOptions));
                    expect(endInput.nativeElement.value).toEqual(ControlsFunction.formatDate(endDate, fullDateFormatOptions));

                    fixture.componentInstance.displayFormat = 'dd-MM-yy';
                    detectChanges();

                    startDate.setDate(9);
                    endDate.setDate(13);
                    dateRange.select(startDate, endDate);
                    detectChanges();

                    const customFormatOptions = { day: 'numeric', month: 'numeric', year: '2-digit' };
                    const inputStartDate = ControlsFunction.formatDate(startDate, customFormatOptions, 'en-GB').
                        replace(/\//g, '-');
                    const inputEndDate = ControlsFunction.formatDate(endDate, customFormatOptions, 'en-GB').
                        replace(/\//g, '-');
                    expect(startInput.nativeElement.value).toEqual(inputStartDate);
                    expect(endInput.nativeElement.value).toEqual(inputEndDate);
                });

                it('should select a range from the calendar only when any of the two inputs are filled in', async () => {
                    // refactored to any of the two inputs, instead of both, to match the behavior in WC - #16131
                    startInput.triggerEventHandler('focus', {});
                    detectChanges();
                    UIInteractions.simulateTyping('11/10/2015', startInput);

                    fixture.componentInstance.dateRange.open();
                    await vi.runAllTimersAsync();
                    detectChanges();
                    const rangePicker = fixture.componentInstance.dateRange;
                    expect((rangePicker as any).calendar.selectedDates.length).toBe(1);

                    calendar = document.getElementsByClassName(CSS_CLASS_CALENDAR)[0];
                    UIInteractions.triggerKeyDownEvtUponElem('Escape', calendar);
                    await vi.runAllTimersAsync();
                    detectChanges();

                    endInput.triggerEventHandler('focus', {});
                    detectChanges();
                    UIInteractions.simulateTyping('11/16/2015', endInput);

                    fixture.componentInstance.dateRange.open();
                    await vi.runAllTimersAsync();
                    detectChanges();
                    expect((rangePicker as any).calendar.selectedDates.length).toBe(7);
                });

                it('should set initial validity state when the form group is disabled', () => {
                    const fix = TestBed.createComponent(DateRangeReactiveFormComponent);
                    fix.detectChanges();
                    detectChanges = () => fix.changeDetectorRef.detectChanges();

                    const dateRangePicker = fix.componentInstance.dateRangeWithTwoInputs;

                    fix.componentInstance.markAsTouched();
                    detectChanges();
                    expect(dateRangePicker.projectedInputs.first.inputDirective.valid).toBe(IgxInputState.INVALID);
                    expect(dateRangePicker.projectedInputs.last.inputDirective.valid).toBe(IgxInputState.INVALID);

                    fix.componentInstance.disableForm();
                    detectChanges();
                    expect(dateRangePicker.projectedInputs.first.inputDirective.valid).toBe(IgxInputState.INITIAL);
                    expect(dateRangePicker.projectedInputs.last.inputDirective.valid).toBe(IgxInputState.INITIAL);
                });
            });

            describe('Keyboard navigation', () => {
                it('should toggle the calendar with ALT + DOWN/UP ARROW key - dropdown mode', async () => {
                    expect(dateRange.collapsed).toBeTruthy();
                    expect(dateRange.isFocused).toBe(false);

                    vi.spyOn(dateRange.opening, 'emit');
                    vi.spyOn(dateRange.opened, 'emit');
                    vi.spyOn(dateRange.closing, 'emit');
                    vi.spyOn(dateRange.closed, 'emit');

                    expect(dateRange.collapsed).toBeTruthy();
                    startInput.nativeElement.focus();
                    // await fixture.whenStable();

                    const range = fixture.debugElement.query(By.css(CSS_CLASS_DATE_RANGE));
                    UIInteractions.triggerEventHandlerKeyDown('ArrowDown', range, true);
                    await vi.runAllTimersAsync();
                    detectChanges();

                    expect(dateRange.collapsed).toBeFalsy();
                    expect(dateRange.opening.emit).toHaveBeenCalledTimes(1);
                    expect(dateRange.opened.emit).toHaveBeenCalledTimes(1);

                    let calendarWrapper = document.getElementsByClassName('igx-calendar__wrapper')[0];
                    expect(calendarWrapper.contains(document.activeElement), 'focus should move to calendar for KB nav').toBe(true);
                    expect(dateRange.isFocused).toBe(true);

                    UIInteractions.triggerKeyDownEvtUponElem('ArrowUp', calendarWrapper, true, true);
                    await vi.runAllTimersAsync();
                    detectChanges();
                    expect(dateRange.collapsed).toBeTruthy();
                    expect(dateRange.closing.emit).toHaveBeenCalledTimes(1);
                    expect(dateRange.closed.emit).toHaveBeenCalledTimes(1);
                    expect(startInput.nativeElement.contains(document.activeElement), 'focus should return to the picker input').toBe(true);
                    expect(dateRange.isFocused).toBe(true);

                    // reopen and close again
                    UIInteractions.triggerEventHandlerKeyDown('ArrowDown', range, true);
                    await vi.runAllTimersAsync();
                    detectChanges();

                    calendarWrapper = document.getElementsByClassName('igx-calendar__wrapper')[0];
                    expect(calendarWrapper.contains(document.activeElement), 'focus should move to calendar for KB nav').toBe(true);
                    UIInteractions.triggerKeyDownEvtUponElem('ArrowUp', calendarWrapper, true, true);
                    await vi.runAllTimersAsync();
                    detectChanges();

                    expect(startInput.nativeElement.contains(document.activeElement), 'focus should return to the picker input').toBe(true);
                    expect(dateRange.isFocused).toBe(true);
                });

                it('should toggle the calendar with ALT + DOWN/UP ARROW key - dialog mode', async () => {
                    fixture.componentInstance.mode = PickerInteractionMode.Dialog;
                    detectChanges();
                    expect(dateRange.collapsed).toBeTruthy();

                    vi.spyOn(dateRange.opening, 'emit');
                    vi.spyOn(dateRange.opened, 'emit');
                    vi.spyOn(dateRange.closing, 'emit');
                    vi.spyOn(dateRange.closed, 'emit');

                    expect(dateRange.collapsed).toBeTruthy();
                    const range = fixture.debugElement.query(By.css(CSS_CLASS_DATE_RANGE));
                    UIInteractions.triggerEventHandlerKeyDown('ArrowDown', range, true);
                    await vi.runAllTimersAsync();
                    detectChanges();
                    expect(dateRange.collapsed).toBeFalsy();
                    expect(dateRange.opening.emit).toHaveBeenCalledTimes(1);
                    expect(dateRange.opened.emit).toHaveBeenCalledTimes(1);

                    calendar = document.getElementsByClassName(CSS_CLASS_CALENDAR)[0];
                    UIInteractions.triggerKeyDownEvtUponElem('ArrowUp', calendar, true, true);
                    await vi.runAllTimersAsync();
                    detectChanges();
                    expect(dateRange.collapsed).toBeTruthy();
                    expect(dateRange.closing.emit).toHaveBeenCalledTimes(1);
                    expect(dateRange.closed.emit).toHaveBeenCalledTimes(1);
                });

                it('should close the calendar with ESC', async () => {
                    vi.spyOn(dateRange.closing, 'emit');
                    vi.spyOn(dateRange.closed, 'emit');
                    dateRange.mode = 'dropdown';
                    startInput.nativeElement.focus();

                    expect(dateRange.collapsed).toBeTruthy();
                    dateRange.open();
                    await vi.runAllTimersAsync();
                    detectChanges();
                    expect(dateRange.collapsed).toBeFalsy();

                    let calendarWrapper = document.getElementsByClassName('igx-calendar__wrapper')[0];
                    expect(calendarWrapper.contains(document.activeElement), 'focus should move to calendar for KB nav').toBe(true);
                    expect(dateRange.isFocused).toBe(true);

                    UIInteractions.triggerKeyDownEvtUponElem('Escape', calendarWrapper, true);
                    await vi.runAllTimersAsync();
                    detectChanges();

                    expect(dateRange.collapsed).toBeTruthy();
                    expect(dateRange.closing.emit).toHaveBeenCalledTimes(1);
                    expect(dateRange.closed.emit).toHaveBeenCalledTimes(1);
                    expect(startInput.nativeElement.contains(document.activeElement), 'focus should return to the picker input').toBe(true);
                    expect(dateRange.isFocused).toBe(true);

                    // reopen and close again
                    dateRange.open();
                    await vi.runAllTimersAsync();
                    detectChanges();

                    calendarWrapper = document.getElementsByClassName('igx-calendar__wrapper')[0];
                    expect(calendarWrapper.contains(document.activeElement), 'focus should move to calendar for KB nav').toBe(true);

                    UIInteractions.triggerKeyDownEvtUponElem('ArrowUp', calendarWrapper, true, true);
                    await vi.runAllTimersAsync();
                    detectChanges();
                    expect(startInput.nativeElement.contains(document.activeElement), 'focus should return to the picker input').toBe(true);
                    expect(dateRange.isFocused).toBe(true);
                });

                it('should not open calendar with ALT + DOWN ARROW key if disabled is set to true', async () => {
                    fixture.componentInstance.disabled = true;
                    detectChanges();

                    vi.spyOn(dateRange.opening, 'emit');
                    vi.spyOn(dateRange.opened, 'emit');

                    // UIInteractions.triggerEventHandlerKeyDown('ArrowDown', calendar, true);
                    await vi.runAllTimersAsync();
                    detectChanges();

                    expect(dateRange.collapsed).toBeTruthy();
                    expect(dateRange.opening.emit).toHaveBeenCalledTimes(0);
                    expect(dateRange.opened.emit).toHaveBeenCalledTimes(0);
                });

                it('should keep the calendar open when input is focused by click and while typing', async () => {
                    fixture.componentInstance.dateRange.open();
                    await vi.runAllTimersAsync();
                    detectChanges();

                    startInput.triggerEventHandler('focus', {});
                    UIInteractions.simulateClickAndSelectEvent(startInput.nativeElement);
                    await vi.runAllTimersAsync();
                    detectChanges();

                    expect(dateRange.collapsed).toBeFalsy();

                    UIInteractions.simulateTyping('01/10/202', startInput);
                    await vi.runAllTimersAsync();
                    detectChanges();

                    expect(dateRange.collapsed).toBeFalsy();
                });

                it('should update the calendar selection on typing', async () => {
                    const range = { start: new Date(2025, 0, 16), end: new Date(2025, 0, 20) };
                    dateRange.value = range;
                    dateRange.open();
                    await vi.runAllTimersAsync();
                    detectChanges();

                    expect((dateRange['_calendar'].value as Date[]).length).toBe(5);

                    startInput.triggerEventHandler('focus', {});
                    UIInteractions.simulateTyping('01/18/2025', startInput);

                    await vi.runAllTimersAsync();
                    detectChanges();

                    expect((dateRange['_calendar'].value as Date[]).length).toBe(3);

                    startDate = new Date(2025, 0, 18);
                    const expectedRange = { start: startDate, end: new Date(2025, 0, 20) };
                    expect(dateRange.value).toEqual(expectedRange);
                    expect(dateRange.activeDate).toEqual(expectedRange.start);

                    const activeDescendantDate = new Date(startDate.setHours(0, 0, 0, 0)).getTime().toString();
                    expect(dateRange['_calendar'].activeDate).toEqual(startDate);
                    expect(dateRange['_calendar'].viewDate.getMonth()).toEqual(startDate.getMonth());
                    expect(dateRange['_calendar'].value[0]).toEqual(startDate);
                    expect(dateRange['_calendar'].wrapper.nativeElement.getAttribute('aria-activedescendant')).toEqual(activeDescendantDate);
                });

                it('should update the calendar view and active date on typing a date that is not in the current view', async () => {
                    const range = { start: new Date(2025, 0, 16), end: new Date(2025, 0, 20) };
                    dateRange.value = range;
                    dateRange.open();
                    await vi.runAllTimersAsync();
                    detectChanges();

                    expect((dateRange['_calendar'].value as Date[]).length).toBe(5);

                    startInput.triggerEventHandler('focus', {});
                    UIInteractions.simulateTyping('11/18/2025', startInput);

                    await vi.runAllTimersAsync();
                    detectChanges();

                    startDate = new Date(2025, 10, 18);

                    const activeDescendantDate = new Date(startDate.setHours(0, 0, 0, 0)).getTime().toString();
                    expect(dateRange['_calendar'].activeDate).toEqual(startDate);
                    expect(dateRange['_calendar'].viewDate.getMonth()).toEqual(startDate.getMonth());
                    expect(dateRange['_calendar'].wrapper.nativeElement.getAttribute('aria-activedescendant')).toEqual(activeDescendantDate);
                });
            });

            it('should focus the last focused input after the calendar closes - dropdown', async () => {
                endInput = fixture.debugElement.queryAll(By.css('.igx-input-group'))[1];
                endInput.triggerEventHandler('click', UIInteractions.getMouseEvent('click'));

                dateRange.open();
                await vi.runAllTimersAsync();
                detectChanges();

                dateRange.close();
                await vi.runAllTimersAsync();
                detectChanges();

                const input = fixture.componentInstance.dateRange.projectedInputs.find(i => i instanceof IgxDateRangeEndComponent);
                expect(input.isFocused).toBeTruthy();
            });

            it('should focus the last focused input after the calendar closes - dialog', async () => {
                fixture.componentInstance.mode = PickerInteractionMode.Dialog;
                endInput = fixture.debugElement.queryAll(By.css('.igx-input-group'))[1];
                UIInteractions.simulateClickAndSelectEvent(endInput.nativeElement);

                dateRange.open();
                await vi.runAllTimersAsync();
                detectChanges();

                dateRange.close();
                await vi.runAllTimersAsync();
                detectChanges();

                expect(fixture.componentInstance.dateRange.projectedInputs
                    .find(i => i instanceof IgxDateRangeEndComponent).isFocused)
                    .toBeTruthy();
            });

            it('should expand the calendar if the default icon is clicked', async () => {
                const icon = fixture.debugElement.query(By.css('igx-picker-toggle'));
                icon.triggerEventHandler('click', UIInteractions.getMouseEvent('click'));
                await vi.runAllTimersAsync();
                detectChanges();
                expect(fixture.componentInstance.dateRange.collapsed).toBeFalsy();
            });

            it('should expand the calendar if any of the inputs is clicked in dialog mode', async () => {
                fixture.componentInstance.mode = PickerInteractionMode.Dialog;
                detectChanges();
                endInput = fixture.debugElement.queryAll(By.css(CSS_CLASS_INPUT))[1];
                endInput.nativeElement.dispatchEvent(new Event('click'));
                await vi.runAllTimersAsync();
                detectChanges();
                expect(fixture.componentInstance.dateRange.collapsed).toBeFalsy();
            });

            it('should not expand the calendar if the default icon is clicked when disabled is set to true', async () => {
                fixture.componentInstance.disabled = true;
                detectChanges();
                const icon = fixture.debugElement.query(By.css('igx-picker-toggle'));
                icon.triggerEventHandler('click', UIInteractions.getMouseEvent('click'));
                await vi.runAllTimersAsync();
                detectChanges();
                expect(fixture.componentInstance.dateRange.collapsed).toBeTruthy();
            });

            it('should properly set/update disabled when ChangeDetectionStrategy.OnPush is used', async () => {
                const testFixture = TestBed
                    .createComponent(DateRangeTwoInputsDisabledComponent) as ComponentFixture<DateRangeTwoInputsDisabledComponent>;
                testFixture.detectChanges();

                detectChanges = () => testFixture.changeDetectorRef.detectChanges();

                dateRange = testFixture.componentInstance.dateRange;
                const disabled$ = testFixture.componentInstance.disabled$;

                disabled$.next(true);
                detectChanges();
                expect(dateRange.projectedInputs.first.inputDirective.disabled).toBe(true);
                expect(dateRange.projectedInputs.last.inputDirective.disabled).toBe(true);

                disabled$.next(false);
                detectChanges();
                expect(dateRange.projectedInputs.first.inputDirective.disabled).toBe(false);
                expect(dateRange.projectedInputs.last.disabled).toBe(false);

                disabled$.next(true);
                detectChanges();
                expect(dateRange.projectedInputs.first.inputDirective.disabled).toBe(true);
                expect(dateRange.projectedInputs.last.inputDirective.disabled).toBe(true);

                disabled$.complete();
            });

            it('should update the calendar while it\'s open and the value has been updated', async () => {
                dateRange.open();
                await vi.runAllTimersAsync();
                detectChanges();

                const range = { start: new Date(), end: new Date(new Date().setDate(new Date().getDate() + 1)) };
                dateRange.value = range;
                detectChanges();

                expect((dateRange as any).calendar.selectedDates.length).toBeGreaterThan(0);
            });

            describe('Data binding', () => {
                it('should properly update component value with ngModel bound to projected inputs - #7353', async () => {
                    fixture = TestBed.createComponent(DateRangeTwoInputsNgModelTestComponent);
                    fixture.detectChanges();
                    detectChanges = () => fixture.changeDetectorRef.detectChanges();

                    const range = (fixture.componentInstance as DateRangeTwoInputsNgModelTestComponent).range;
                    fixture.componentInstance.dateRange.open();
                    await vi.runAllTimersAsync();
                    detectChanges();
                    expect((fixture.componentInstance.dateRange.value.start as Date).getTime()).toEqual(range.start.getTime());
                    expect((fixture.componentInstance.dateRange.value.end as Date).getTime()).toEqual(range.end.getTime());
                });
            });

            describe('Predefined ranges', () => {
                const predefinedRangesLength = 4;
                const today = CalendarDay.today.native;
                const last7DaysEnd = CalendarDay.today.add('day', -7).native;
                const last30DaysEnd = CalendarDay.today.add('day', -29).native;
                const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
                const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
                const startOfYear = new Date(today.getFullYear(), 0, 1);
                const previousThreeDaysStart = CalendarDay.today.add('day', -3).native;
                const nextThreeDaysEnd = CalendarDay.today.add('day', 3).native;

                const customRanges: CustomDateRange[] = [
                    {
                        label: 'Previous Three Days',
                        dateRange: {
                            start: previousThreeDaysStart,
                            end: today,
                        },
                    },
                    {
                        label: 'Next Three Days',
                        dateRange: {
                            start: today,
                            end: nextThreeDaysEnd,
                        },
                    },
                ];

                const dateRanges: DateRange[] = [
                    { start: last7DaysEnd, end: today },
                    { start: startOfMonth, end: endOfMonth },
                    { start: last30DaysEnd, end: today },
                    { start: startOfYear, end: today },
                    { start: previousThreeDaysStart, end: today },
                    { start: today, end: nextThreeDaysEnd },
                ];

                beforeEach(() => {
                    fixture = TestBed.createComponent(DateRangeTwoInputsTestComponent);
                    fixture.detectChanges();
                    dateRange = fixture.componentInstance.dateRange;


                });

                it('should not render predefined area when usePredefinedRanges is false and no custom ranges are provided', () => {
                    dateRange.open();
                    fixture.detectChanges();

                    const predefinedArea = document.querySelector('igx-predefined-ranges-area');
                    const chips = document.querySelectorAll('igx-chip');

                    expect(predefinedArea).toBeNull();
                    expect(chips.length).toEqual(0);

                });

                it('should render predefined area when usePredefinedRanges is true and no custom ranges are provided', () => {
                    dateRange.usePredefinedRanges = true;
                    fixture.detectChanges();

                    dateRange.open();
                    fixture.detectChanges();

                    const predefinedArea = document.querySelector('igx-predefined-ranges-area');
                    const chips = document.querySelectorAll('igx-chip');

                    expect(predefinedArea).toBeDefined();
                    expect(chips.length).toEqual(predefinedRangesLength);
                });

                it('should render predefined area when only custom ranges are provided', () => {
                    dateRange.customRanges = customRanges;
                    fixture.detectChanges();

                    dateRange.open();
                    fixture.detectChanges();

                    const predefinedArea = document.querySelector('igx-predefined-ranges-area');
                    const chips = document.querySelectorAll('igx-chip');

                    expect(predefinedArea).toBeDefined();
                    expect(chips.length).toEqual(customRanges.length);
                });

                it('should render predefined area when usePredefinedRanges is true and custom ranges are provided', () => {
                    dateRange.usePredefinedRanges = true;
                    dateRange.customRanges = customRanges;
                    fixture.detectChanges();

                    dateRange.open();
                    fixture.detectChanges();

                    const predefinedArea = document.querySelector('igx-predefined-ranges-area');
                    const chips = document.querySelectorAll('igx-chip');

                    expect(predefinedArea).toBeDefined();
                    expect(chips.length).toEqual(predefinedRangesLength + customRanges.length);
                });

                it('should render predefined area and emit selection event when the user performs selection via chips', () => {
                    const selectionSpy = vi.spyOn(dateRange as any, 'handleSelection');

                    dateRange.usePredefinedRanges = true;
                    dateRange.customRanges = customRanges;
                    fixture.detectChanges();

                    dateRange.open();
                    fixture.detectChanges();

                    const predefinedArea = document.querySelector('igx-predefined-ranges-area');
                    const chips = document.querySelectorAll('igx-chip');

                    expect(predefinedArea).toBeDefined();
                    expect(chips.length).toEqual(predefinedRangesLength + customRanges.length);


                    chips.forEach((chip, i) => {
                        chip.dispatchEvent(UIInteractions.getMouseEvent('click'));
                        fixture.detectChanges();
                        expect(dateRange.value).toEqual(dateRanges[i]);

                    });

                    expect(selectionSpy).toHaveBeenCalledTimes(predefinedRangesLength + customRanges.length);
                });

                it('should use provided resourceStrings for labels when available', () => {
                    const strings: any = {
                        last7Days: 'Last 7 - localized',
                        currentMonth: 'Current Month - localized',
                        yearToDate: 'YTD - localized',
                        igx_date_range_picker_last7Days: 'Last 7 - localized',
                        igx_date_range_picker_currentMonth: 'Current Month - localized',
                        igx_date_range_picker_yearToDate: 'YTD - localized',
                        // last30Days omitted to test fallback
                    };

                    dateRange.resourceStrings = strings;
                    dateRange.usePredefinedRanges = true;
                    dateRange.customRanges = [];
                    fixture.detectChanges();

                    dateRange.open();
                    fixture.detectChanges();

                    const predefinedArea = document.querySelector('igx-predefined-ranges-area');
                    const chips = document.querySelectorAll('igx-chip');

                    expect(predefinedArea).toBeDefined();
                    expect(chips.length).toEqual(predefinedRangesLength);
                    const labels: string[] = [];

                    chips.forEach((chip) => {
                        labels.push(chip.textContent.trim());
                    });

                    expect(labels).toContain('Last 7 - localized');
                    expect(labels).toContain('Current Month - localized');
                    expect(labels).toContain('YTD - localized');

                    expect(labels).toContain('Last 30 Days');
                });
            });
        });

        describe('Rendering', () => {
            beforeEach(async () => {
                await TestBed.configureTestingModule({
                    imports: [
                        NoopAnimationsModule,
                        DateRangeDefaultComponent,
                        DateRangeCustomComponent,
                        DateRangeTemplatesComponent,
                        DateRangeTwoInputsTestComponent
                    ]
                }).compileComponents();
            });

            beforeEach(() => {
                vi.useFakeTimers();
            });

            afterEach(() => {
                vi.useRealTimers();
            });

            it('should render range separator', () => {
                fixture = TestBed.createComponent(DateRangeTwoInputsTestComponent);
                fixture.detectChanges();

                const range = fixture.debugElement.query(By.css(CSS_CLASS_DATE_RANGE));
                expect(range.children[1].nativeElement.innerText).toBe('-');
            });

            it('should render default toggle icon', () => {
                fixture = TestBed.createComponent(DateRangeDefaultComponent);
                fixture.detectChanges();

                const inputGroupsStart = fixture.debugElement.query(By.css(CSS_CLASS_INPUT_START));
                expect(inputGroupsStart.children[0].nativeElement.innerText).toBe(DEFAULT_ICON_TEXT);
                expect(inputGroupsStart.children[0].children[0].classes[CSS_CLASS_ICON]).toBeTruthy();
            });

            it('should be able to set toggle icon', () => {
                const prefixIconText = 'flight_takeoff';
                const suffixIconText = 'flight_land';
                const additionalIconText = 'calendar_view_day';
                fixture = TestBed.createComponent(DateRangeTemplatesComponent);
                fixture.detectChanges();

                const inputGroupsStart = fixture.debugElement.queryAll(By.css(CSS_CLASS_INPUT_START));
                const inputGroupsEnd = fixture.debugElement.queryAll(By.css(CSS_CLASS_INPUT_END));

                const prefixSingleRangeInput = inputGroupsStart[0];
                expect(prefixSingleRangeInput.children[0].nativeElement.innerText).toBe(prefixIconText);
                expect(prefixSingleRangeInput.children[0].children[0].classes[CSS_CLASS_ICON]).toBeTruthy();

                const suffixSingleRangeInput = inputGroupsEnd[1];
                expect(suffixSingleRangeInput.children[0].nativeElement.innerText).toBe(suffixIconText);
                expect(suffixSingleRangeInput.children[0].children[0].classes[CSS_CLASS_ICON]).toBeTruthy();

                const addPrefixSingleRangeInput = inputGroupsStart[2];
                expect(addPrefixSingleRangeInput.children[0].nativeElement.innerText).toBe(DEFAULT_ICON_TEXT);
                expect(addPrefixSingleRangeInput.children[0].children[0].classes[CSS_CLASS_ICON]).toBeTruthy();
                expect(addPrefixSingleRangeInput.children[1].nativeElement.innerText).toBe(additionalIconText);
                expect(addPrefixSingleRangeInput.children[1].children[0].classes[CSS_CLASS_ICON]).toBeTruthy();

                const prefixRangeInput = inputGroupsStart[3];
                expect(prefixRangeInput.children[0].nativeElement.innerText).toBe(prefixIconText);
                expect(prefixRangeInput.children[0].children[0].classes[CSS_CLASS_ICON]).toBeTruthy();

                const suffixRangeInput = inputGroupsEnd[4];
                expect(suffixRangeInput.children[0].nativeElement.innerText).toBe(suffixIconText);
                expect(suffixRangeInput.children[0].children[0].classes[CSS_CLASS_ICON]).toBeTruthy();
                expect(suffixRangeInput.children[1].nativeElement.innerText).toBe(additionalIconText);
                expect(suffixRangeInput.children[1].children[0].classes[CSS_CLASS_ICON]).toBeTruthy();
            });

            it('should render aria attributes properly', async () => {
                fixture = TestBed.createComponent(DateRangeCustomComponent);
                fixture.detectChanges();

                detectChanges = () => fixture.changeDetectorRef.detectChanges();

                dateRange = fixture.componentInstance.dateRange;
                const toggleBtn = fixture.debugElement.query(By.css(`.${CSS_CLASS_ICON}`));
                const singleInputElement = fixture.debugElement.query(By.css(CSS_CLASS_INPUT));
                startDate = new Date(2020, 1, 1);
                endDate = new Date(2020, 1, 4);
                const expectedLabelID = dateRange.label.id;
                const expectedPlaceholder = 'MM/dd/yyyy - MM/dd/yyyy';

                expect(singleInputElement.nativeElement.getAttribute('role')).toEqual('combobox');
                expect(singleInputElement.nativeElement.getAttribute('placeholder').trim()).toEqual(expectedPlaceholder);
                expect(singleInputElement.nativeElement.getAttribute('aria-haspopup')).toEqual('grid');
                expect(singleInputElement.nativeElement.getAttribute('aria-expanded')).toEqual('false');
                expect(toggleBtn.nativeElement.getAttribute('aria-hidden')).toEqual('true');
                expect(singleInputElement.nativeElement.getAttribute('aria-labelledby')).toEqual(expectedLabelID);

                dateRange.toggle();
                await vi.runAllTimersAsync();
                detectChanges();

                expect(singleInputElement.nativeElement.getAttribute('aria-expanded')).toEqual('true');
                expect(toggleBtn.nativeElement.getAttribute('aria-hidden')).toEqual('true');

                dateRange.select(startDate, endDate);
                detectChanges();
                expect(singleInputElement.nativeElement.getAttribute('placeholder')).toEqual('');

            });

            it('should render custom label', () => {
                fixture = TestBed.createComponent(DateRangeCustomComponent);
                fixture.detectChanges();

                const inputGroup = fixture.debugElement.query(By.css(CSS_CLASS_INPUT_BUNDLE));
                expect(inputGroup.children[1].children[0].classes[CSS_CLASS_LABEL]).toBeTruthy();
                expect(inputGroup.children[1].children[0].nativeElement.textContent).toEqual('Select Date');
            });

            it('should be able to apply custom format', () => {
                fixture = TestBed.createComponent(DateRangeCustomComponent);
                fixture.detectChanges();
                detectChanges = () => fixture.changeDetectorRef.detectChanges();

                dateRange = fixture.componentInstance.dateRange;
                const singleInputElement = fixture.debugElement.query(By.css(CSS_CLASS_INPUT));

                startDate = new Date(2020, 10, 8, 0, 0, 0);
                endDate = new Date(2020, 11, 8, 0, 0, 0);
                dateRange.select(startDate, endDate);
                detectChanges();

                const result = fixture.componentInstance.formatter({ start: startDate, end: endDate });
                expect(singleInputElement.nativeElement.value).toEqual(result);
            });

            it('should invoke AutoPositionStrategy by default with proper arguments', async () => {
                fixture = TestBed.createComponent(DateRangeDefaultComponent);
                fixture.detectChanges();
                detectChanges = () => fixture.changeDetectorRef.detectChanges();
                vi.spyOn(AutoPositionStrategy.prototype, 'position');

                dateRange = fixture.componentInstance.dateRange;
                dateRange.open();
                await vi.runAllTimersAsync();
                detectChanges();

                const overlayContent = document.getElementsByClassName(CSS_CLASS_OVERLAY_CONTENT)[0] as HTMLElement;
                const expectedTarget = dateRange.element.nativeElement.querySelector('.igx-input-group__bundle');
                expect(AutoPositionStrategy.prototype.position).toHaveBeenCalledTimes(1);
                expect(AutoPositionStrategy.prototype.position)
                    .toHaveBeenCalledWith(overlayContent, expect.anything(), document, expect.anything(), expectedTarget);
            });
            it('Should the weekStart property takes precedence over locale.', async () => {
                fixture = TestBed.createComponent(DateRangeCustomComponent);
                fixture.detectChanges();
                detectChanges = () => fixture.changeDetectorRef.detectChanges();
                dateRange = fixture.componentInstance.dateRange;

                dateRange.locale = 'en';
                detectChanges();

                expect(dateRange.weekStart).toEqual(0);

                dateRange.weekStart = WEEKDAYS.FRIDAY;
                expect(dateRange.weekStart).toEqual(5);

                dateRange.locale = 'fr';
                detectChanges();

                expect(dateRange.weekStart).toEqual(5);
            });

            it('Should passing invalid value for locale, then setting weekStart must be respected.', async () => {
                fixture = TestBed.createComponent(DateRangeCustomComponent);
                fixture.detectChanges();
                detectChanges = () => fixture.changeDetectorRef.detectChanges();
                dateRange = fixture.componentInstance.dateRange;

                const locale = 'en-US';
                dateRange.locale = locale;
                detectChanges();

                expect(dateRange.locale).toEqual(locale);
                expect(dateRange.weekStart).toEqual(WEEKDAYS.SUNDAY);

                dateRange.locale = 'frrr';
                dateRange.weekStart = WEEKDAYS.FRIDAY;
                detectChanges();

                expect(dateRange.locale).toEqual('en');
                expect(dateRange.weekStart).toEqual(WEEKDAYS.FRIDAY);
            });

            it('Should render calendar with header in dialog mode by default', async () => {
                fixture = TestBed.createComponent(DateRangeDefaultComponent);
                fixture.detectChanges();
                detectChanges = () => fixture.changeDetectorRef.detectChanges();
                dateRange = fixture.componentInstance.dateRange;
                dateRange.mode = 'dialog';
                dateRange.open();
                await vi.runAllTimersAsync();
                detectChanges();

                expect(dateRange['_calendar'].hasHeader).toBe(true);
                const calendarHeader = fixture.debugElement.query(By.css(CSS_CLASS_CALENDAR_HEADER_TEMPLATE));
                expect(calendarHeader, 'Calendar header should be present').toBeTruthy();
            });

            it('should set calendar headerOrientation prop in dialog mode', async () => {
                fixture = TestBed.createComponent(DateRangeDefaultComponent);
                fixture.detectChanges();
                detectChanges = () => fixture.changeDetectorRef.detectChanges();
                dateRange = fixture.componentInstance.dateRange;

                dateRange.mode = 'dialog';
                dateRange.open();
                await vi.runAllTimersAsync();
                detectChanges();

                expect(dateRange['_calendar'].headerOrientation).toBe(PickerHeaderOrientation.Horizontal);

                dateRange.close();
                await vi.runAllTimersAsync();
                detectChanges();

                dateRange.headerOrientation = PickerHeaderOrientation.Vertical;
                dateRange.open();
                await vi.runAllTimersAsync();
                detectChanges();

                expect(dateRange['_calendar'].headerOrientation).toBe(PickerHeaderOrientation.Vertical);
            });

            it('should hide the calendar header if hideHeader is true in dialog mode', async () => {
                fixture = TestBed.createComponent(DateRangeDefaultComponent);
                fixture.detectChanges();
                detectChanges = () => fixture.changeDetectorRef.detectChanges();
                dateRange = fixture.componentInstance.dateRange;

                dateRange.mode = 'dialog';
                dateRange.hideHeader = true;
                dateRange.open();
                await vi.runAllTimersAsync();
                detectChanges();

                expect(dateRange['_calendar'].hasHeader).toBe(false);
                const calendarHeader = fixture.debugElement.query(By.css(CSS_CLASS_CALENDAR_HEADER));
                expect(calendarHeader, 'Calendar header should not be present').toBeFalsy();
            });

            it('should set calendar orientation property', async () => {
                fixture = TestBed.createComponent(DateRangeDefaultComponent);
                fixture.detectChanges();
                detectChanges = () => fixture.changeDetectorRef.detectChanges();
                dateRange = fixture.componentInstance.dateRange;
                dateRange.open();
                await vi.runAllTimersAsync();
                detectChanges();

                expect(dateRange['_calendar'].orientation).toEqual(PickerCalendarOrientation.Horizontal.toString());
                expect(dateRange['_calendar'].wrapper.nativeElement.classList.contains(CSS_CLASS_CALENDAR_WRAPPER_VERTICAL)).toBe(false);
                dateRange.close();
                await vi.runAllTimersAsync();
                detectChanges();

                dateRange.orientation = PickerCalendarOrientation.Vertical;
                dateRange.open();
                await vi.runAllTimersAsync();
                detectChanges();

                expect(dateRange['_calendar'].orientation).toEqual(PickerCalendarOrientation.Vertical.toString());
                expect(dateRange['_calendar'].wrapper.nativeElement.classList.contains(CSS_CLASS_CALENDAR_WRAPPER_VERTICAL)).toBe(true);
            });

            it('should limit the displayMonthsCount property between 1 and 2', async () => {
                fixture = TestBed.createComponent(DateRangeDefaultComponent);
                fixture.detectChanges();
                detectChanges = () => fixture.changeDetectorRef.detectChanges();
                dateRange = fixture.componentInstance.dateRange;
                dateRange.open();
                await vi.runAllTimersAsync();
                detectChanges();

                dateRange.displayMonthsCount = 3;
                detectChanges();

                expect(dateRange.displayMonthsCount).toBe(2);

                dateRange.displayMonthsCount = -1;
                detectChanges();

                expect(dateRange.displayMonthsCount).toBe(1);
            });

            it('should set the specialDates of the calendar', async () => {
                fixture = TestBed.createComponent(DateRangeDefaultComponent);
                fixture.detectChanges();
                detectChanges = () => fixture.changeDetectorRef.detectChanges();
                dateRange = fixture.componentInstance.dateRange;

                const specialDates = [{
                        type: DateRangeType.Between, dateRange: [
                            new Date(new Date().getFullYear(), new Date().getMonth(), 3),
                            new Date(new Date().getFullYear(), new Date().getMonth(), 8)
                        ]
                    }];
                dateRange.specialDates = specialDates;
                detectChanges();

                dateRange.open();
                await vi.runAllTimersAsync();
                detectChanges();

                expect(dateRange['_calendar'].specialDates).toEqual(specialDates);
            });

            it('should set the disabledDates of the calendar', async () => {
                fixture = TestBed.createComponent(DateRangeDefaultComponent);
                fixture.detectChanges();
                detectChanges = () => fixture.changeDetectorRef.detectChanges();
                dateRange = fixture.componentInstance.dateRange;

                const disabledDates = [{
                        type: DateRangeType.Between, dateRange: [
                            new Date(new Date().getFullYear(), new Date().getMonth(), 3),
                            new Date(new Date().getFullYear(), new Date().getMonth(), 8)
                        ]
                    }];
                dateRange.disabledDates = disabledDates;
                detectChanges();

                dateRange.open();
                await vi.runAllTimersAsync();
                detectChanges();

                expect(dateRange['_calendar'].disabledDates).toEqual(disabledDates);
            });

            it('should initialize activeDate with current date, when not set', async () => {
                fixture = TestBed.createComponent(DateRangeDefaultComponent);
                fixture.detectChanges();
                detectChanges = () => fixture.changeDetectorRef.detectChanges();
                dateRange = fixture.componentInstance.dateRange;
                const todayDate = new Date();
                const today = new Date(todayDate.setHours(0, 0, 0, 0)).getTime().toString();

                expect(dateRange.activeDate).toEqual(todayDate);

                dateRange.open();
                await vi.runAllTimersAsync();
                detectChanges();

                expect(dateRange['_calendar'].activeDate).toEqual(todayDate);
                expect(dateRange['_calendar'].value).toEqual([]);
                const wrapper = fixture.debugElement.query(By.css('.igx-calendar__wrapper')).nativeElement;
                expect(wrapper.getAttribute('aria-activedescendant')).toEqual(today);
            });

            it('should initialize activeDate = first defined in value (start/end) when it is not set, but value is', async () => {
                fixture = TestBed.createComponent(DateRangeDefaultComponent);
                fixture.detectChanges();
                detectChanges = () => fixture.changeDetectorRef.detectChanges();
                dateRange = fixture.componentInstance.dateRange;
                let range = { start: new Date(2025, 0, 1), end: new Date(2025, 0, 5) };
                dateRange.value = range;
                detectChanges();

                expect(dateRange.activeDate).toEqual(range.start);
                dateRange.open();
                await vi.runAllTimersAsync();
                detectChanges();

                const activeDescendantDate = new Date(range.start.setHours(0, 0, 0, 0)).getTime().toString();
                expect(dateRange['_calendar'].activeDate).toEqual(range.start);
                expect(dateRange['_calendar'].value[0]).toEqual(range.start);
                const wrapper = fixture.debugElement.query(By.css('.igx-calendar__wrapper')).nativeElement;
                expect(wrapper.getAttribute('aria-activedescendant')).toEqual(activeDescendantDate);

                range = { ...range, start: null };
                dateRange.value = range;
                detectChanges();

                expect(dateRange.activeDate).toEqual(range.end);
            });

            it('should set activeDate correctly', async () => {
                const targetDate = new Date(2025, 11, 1);
                fixture = TestBed.createComponent(DateRangeDefaultComponent);
                fixture.detectChanges();
                detectChanges = () => fixture.changeDetectorRef.detectChanges();
                dateRange = fixture.componentInstance.dateRange;
                const range = { start: new Date(2025, 0, 1), end: new Date(2025, 0, 5) };
                dateRange.value = range;
                dateRange.activeDate = targetDate;
                detectChanges();

                expect(dateRange.activeDate).toEqual(targetDate);
                dateRange.open();
                await vi.runAllTimersAsync();
                detectChanges();

                const activeDescendantDate = new Date(targetDate.setHours(0, 0, 0, 0)).getTime().toString();
                expect(dateRange['_calendar'].activeDate).toEqual(targetDate);
                expect(dateRange['_calendar'].value[0]).toEqual(range.start);
                const wrapper = fixture.debugElement.query(By.css('.igx-calendar__wrapper')).nativeElement;
                expect(wrapper.getAttribute('aria-activedescendant')).toEqual(activeDescendantDate);
            });

            describe('Templated Calendar Header', () => {
                let dateRangeDebugEl: DebugElement;

                beforeEach(async () => {
                    await TestBed.configureTestingModule({
                        imports: [DateRangeTemplatesComponent]
                    }).compileComponents();

                    vi.useFakeTimers();
                    fixture = TestBed.createComponent(DateRangeTemplatesComponent);
                    fixture.detectChanges();
                    detectChanges = () => fixture.changeDetectorRef.detectChanges();

                    dateRangeDebugEl = fixture.debugElement.queryAll(By.directive(IgxDateRangePickerComponent))[0];
                    dateRange = dateRangeDebugEl.componentInstance;
                    dateRange.mode = 'dialog';
                    dateRange.open();
                    await vi.runAllTimersAsync();
                    detectChanges();
                });

                afterEach(() => {
                    vi.useRealTimers();
                });

                it('Should use the custom template for header title', async () => {
                    const headerTitleElement = dateRangeDebugEl.query(By.css(CSS_CLASS_CALENDAR_HEADER_TITLE));
                    expect(headerTitleElement, 'Header title element should be present').toBeTruthy();
                    if (headerTitleElement) {
                        expect(headerTitleElement.nativeElement.textContent.trim()).toBe('Test header title');
                    }
                });

                it('Should use the custom template for header', async () => {
                    const headerElement = dateRangeDebugEl.query(By.css(CSS_CLASS_CALENDAR_HEADER_TEMPLATE));
                    expect(headerElement, 'Header element should be present').toBeTruthy();
                    if (headerElement) {
                        expect(headerElement.nativeElement.textContent.trim()).toBe('Test header');
                    }
                });

                it('Should use the custom template for subheader', async () => {
                    const headerElement = dateRangeDebugEl.query(By.css(CSS_CLASS_CALENDAR_SUBHEADER));
                    expect(headerElement, 'Subheader element should be present').toBeTruthy();
                    if (headerElement) {
                        expect(headerElement.nativeElement.textContent.trim()).toBe('Test subheader');
                    }
                });
            });

            it('should render projected clear icons which clear the range on click', () => {
                fixture = TestBed.createComponent(DateRangeTwoInputsClearComponent);
                fixture.detectChanges();
                detectChanges = () => fixture.changeDetectorRef.detectChanges();

                const drp = fixture.debugElement.query(By.directive(IgxDateRangePickerComponent)).componentInstance;
                const start = fixture.debugElement.query(By.directive(IgxDateRangeStartComponent));
                const end = fixture.debugElement.query(By.directive(IgxDateRangeEndComponent));

                const startSuffix = start.nativeElement.querySelectorAll(CSS_CLASS_INPUT_END)[0];
                const endSuffix = end.nativeElement.querySelectorAll(CSS_CLASS_INPUT_END)[0];

                expect(startSuffix.innerText).toBe('delete');
                expect(endSuffix.innerText).toBe('delete');

                const pickerClearComponents = fixture.debugElement.queryAll(By.directive(IgxPickerClearComponent));

                drp.value = { start: new Date(2025, 0, 1), end: new Date(2025, 0, 2) };
                detectChanges();

                UIInteractions.simulateClickAndSelectEvent(pickerClearComponents[0].nativeNode);
                detectChanges();

                expect(drp.value).toEqual(null);

                drp.value = { start: new Date(2025, 0, 1), end: new Date(2025, 0, 2) };
                detectChanges();

                UIInteractions.simulateClickAndSelectEvent(pickerClearComponents[1].nativeNode);
                detectChanges();

                expect(drp.value).toEqual(null);
            });
        });
    });
});

@Component({
    selector: 'igx-date-range-test',
    template: '',
    standalone: true
})
export class DateRangeTestComponent implements OnInit {
    [x: string]: any;
    @ViewChild(IgxDateRangePickerComponent, { static: true })
    public dateRange: IgxDateRangePickerComponent;

    public doneButtonText: string;
    public mode: PickerInteractionMode = PickerInteractionMode.DropDown;
    public disabled = false;
    public minValue: Date | string;
    public maxValue: Date | string;

    public ngOnInit(): void {
        this.doneButtonText = 'Done';
    }
}

@Component({
    selector: 'igx-date-range-single-input-test',
    template: `
    <igx-date-range-picker [mode]="mode" [disabled]="disabled" [minValue]="minValue" [maxValue]="maxValue">
    </igx-date-range-picker>
    `,
    imports: [IgxDateRangePickerComponent]
})
export class DateRangeDefaultComponent extends DateRangeTestComponent {
    public override disabled = false;
}

@Component({
    selector: 'igx-date-range-two-inputs-test',
    template: `
    <igx-date-range-picker [mode]="mode"
                           [disabled]="disabled"
                           [(ngModel)]="range"
                           [inputFormat]="inputFormat"
                           [displayFormat]="displayFormat"
                           required
                           [usePredefinedRanges]="usePredefinedRanges"
                           [customRanges]="customRanges">
        <igx-date-range-start>
            <igx-picker-toggle igxPrefix>
                <igx-icon>calendar_view_day</igx-icon>
            </igx-picker-toggle>
            <input igxInput igxDateTimeEditor type="text">
        </igx-date-range-start>
        <ng-template igxDateRangeSeparator>-</ng-template>
        <igx-date-range-end>
            <input igxInput igxDateTimeEditor type="text">
        </igx-date-range-end>
    </igx-date-range-picker>
    `,
    imports: [
        IgxDateRangePickerComponent,
        IgxDateRangeStartComponent,
        IgxDateRangeEndComponent,
        IgxPickerToggleComponent,
        IgxIconComponent,
        IgxPrefixDirective,
        IgxInputDirective,
        IgxDateTimeEditorDirective,
        IgxDateRangeSeparatorDirective,
        FormsModule
    ]
})
export class DateRangeTwoInputsTestComponent extends DateRangeTestComponent {
    public range;
    public inputFormat: string;
    public displayFormat: string;
    public override disabled = false;
    public usePredefinedRanges = false;
    public customRanges: CustomDateRange[] = [];
}
@Component({
    selector: 'igx-date-range-two-inputs-ng-model',
    template: `
    <igx-date-range-picker [mode]="'dropdown'">
        <igx-date-range-start>
            <input igxInput [(ngModel)]="range.start" igxDateTimeEditor>
        </igx-date-range-start>
        <igx-date-range-end>
            <input igxInput [(ngModel)]="range.end" igxDateTimeEditor>
        </igx-date-range-end>
    </igx-date-range-picker>`,
    imports: [IgxDateRangePickerComponent, IgxDateRangeStartComponent, IgxDateRangeEndComponent, IgxInputDirective, IgxDateTimeEditorDirective, FormsModule]
})
export class DateRangeTwoInputsNgModelTestComponent extends DateRangeTestComponent {
    public range = { start: new Date(2020, 1, 1), end: new Date(2020, 1, 4) };
}

@Component({
    selector: 'igx-date-range-two-inputs-clear',
    template: `
        <igx-date-range-picker>
            <igx-date-range-start>
                <input igxInput igxDateTimeEditor type="text">
                <igx-picker-clear igxSuffix>
                    <igx-icon>delete</igx-icon>
                </igx-picker-clear>
            </igx-date-range-start>
            <igx-date-range-end>
                <input igxInput igxDateTimeEditor type="text">
                <igx-picker-clear igxSuffix>
                    <igx-icon>delete</igx-icon>
                </igx-picker-clear>
            </igx-date-range-end>
        </igx-date-range-picker>`,
    imports: [IgxDateRangePickerComponent, IgxDateRangeStartComponent, IgxDateRangeEndComponent, IgxInputDirective,
        IgxDateTimeEditorDirective, FormsModule, IgxPickerClearComponent, IgxIconComponent, IgxSuffixDirective]
})
export class DateRangeTwoInputsClearComponent extends DateRangeTestComponent {
}

@Component({
    selector: 'igx-date-range-single-input-label-test',
    template: `
    <igx-date-range-picker [value]="date" [mode]="'dropdown'" [formatter]="formatter">
        <label igxLabel>Select Date</label>
    </igx-date-range-picker>
    `,
    imports: [IgxDateRangePickerComponent, IgxLabelDirective]
})
export class DateRangeCustomComponent extends DateRangeTestComponent {
    public date: DateRange;
    private monthFormatter = new Intl.DateTimeFormat('en', { month: 'long' });

    public formatter = (date: DateRange) => {
        const startDate = `${this.monthFormatter
            .format(date.start as Date)} ${(date.start as Date).getDate()}, ${(date.start as Date).getFullYear()}`;
        const endDate = `${this.monthFormatter
            .format(date.end as Date)} ${(date
            .end as Date).getDate()}, ${(date.end as Date).getFullYear()}`;
        return `You selected ${startDate}-${endDate}`;
    };
}
@Component({
    selector: 'igx-date-range-templates-test',
    template: `
    <igx-date-range-picker #prefixSingleRange>
        <igx-picker-toggle igxPrefix>
            <igx-icon>flight_takeoff</igx-icon>
        </igx-picker-toggle>
        <ng-template igxCalendarHeader let-formatCalendar>Test header</ng-template>
        <ng-template igxCalendarHeaderTitle let-formatCalendar>Test header title</ng-template>
        <ng-template igxCalendarSubheader let-formatCalendar>Test subheader</ng-template>
    </igx-date-range-picker>
    <igx-date-range-picker #suffixSingleRange>
        <igx-picker-toggle igxSuffix>
            <igx-icon>flight_land</igx-icon>
        </igx-picker-toggle>
    </igx-date-range-picker>
    <igx-date-range-picker>
        <igx-prefix>
            <igx-icon>
                calendar_view_day
            </igx-icon>
        </igx-prefix>
    </igx-date-range-picker>
    <igx-date-range-picker [(ngModel)]="range" required>
        <igx-date-range-start>
            <igx-picker-toggle igxPrefix>
                <igx-icon>flight_takeoff</igx-icon>
            </igx-picker-toggle>
            <input igxInput igxDateTimeEditor type="text">
        </igx-date-range-start>
        <igx-date-range-end>
            <input igxInput igxDateTimeEditor type="text">
            <igx-picker-toggle igxSuffix>
                <igx-icon>flight_land</igx-icon>
            </igx-picker-toggle>
            <igx-suffix>
                <igx-icon>
                    calendar_view_day
                </igx-icon>
            </igx-suffix>
        </igx-date-range-end>
    </igx-date-range-picker>
     <igx-date-range-picker>
        <igx-picker-clear igxSuffix>
            <igx-icon>delete</igx-icon>
        </igx-picker-clear>
    </igx-date-range-picker>
    `,
    imports: [
        IgxDateRangePickerComponent,
        IgxDateRangeStartComponent,
        IgxDateRangeEndComponent,
        IgxPickerToggleComponent,
        IgxPickerClearComponent,
        IgxIconComponent,
        FormsModule,
        IgxInputDirective,
        IgxDateTimeEditorDirective,
        IgxPrefixDirective,
        IgxSuffixDirective,
        IgxCalendarHeaderTemplateDirective,
        IgxCalendarHeaderTitleTemplateDirective,
        IgxCalendarSubheaderTemplateDirective
    ]
})
export class DateRangeTemplatesComponent extends DateRangeTestComponent {
    public range;
}

@Component({
    template: `<igx-date-range-picker [disabled]="(disabled$ | async) === true"></igx-date-range-picker>`,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [IgxDateRangePickerComponent, AsyncPipe]
})
export class DateRangeDisabledComponent extends DateRangeTestComponent {
    public disabled$ = new Subject<boolean>();

    constructor() {
        super();
        this.disabled$.subscribe({ next: (v) => v });
    }
}

@Component({
    template: `
    <igx-date-range-picker [disabled]="(disabled$ | async) === true">
        <igx-date-range-start>
            <input igxInput igxDateTimeEditor>
        </igx-date-range-start>
        <igx-date-range-end>
            <input igxInput igxDateTimeEditor>
        </igx-date-range-end>
    </igx-date-range-picker>`,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [IgxDateRangePickerComponent, IgxDateRangeStartComponent, IgxDateRangeEndComponent, IgxInputDirective, IgxDateTimeEditorDirective, AsyncPipe]
})
export class DateRangeTwoInputsDisabledComponent extends DateRangeDisabledComponent {
}

@Component({
    template: `
    <form class="wrapper" [formGroup]="form">
        <igx-date-range-picker #range formControlName="range">
            <label igxLabel>Range</label>
        </igx-date-range-picker>
        <igx-date-range-picker #twoInputs formControlName="twoInputs">
            <igx-date-range-start>
                <input igxInput igxDateTimeEditor>
            </igx-date-range-start>
            <igx-date-range-end>
                <input igxInput igxDateTimeEditor>
            </igx-date-range-end>
        </igx-date-range-picker>
    </form>`,
    imports: [
        IgxDateRangePickerComponent,
        IgxDateRangeStartComponent,
        IgxDateRangeEndComponent,
        IgxInputDirective,
        IgxLabelDirective,
        IgxDateTimeEditorDirective,
        ReactiveFormsModule
    ]
})
export class DateRangeReactiveFormComponent {
    private fb = inject(UntypedFormBuilder);

    @ViewChild('range', { read: IgxDateRangePickerComponent })
    public dateRange: IgxDateRangePickerComponent;
    @ViewChild('twoInputs', { read: IgxDateRangePickerComponent })
    public dateRangeWithTwoInputs: IgxDateRangePickerComponent;

    public form = this.fb.group({
        range: ['', Validators.required],
        twoInputs: ['', Validators.required]
    });

    public markAsTouched() {
        if (!this.form.valid) {
            for (const key in this.form.controls) {
                if (this.form.controls[key]) {
                    this.form.controls[key].markAsTouched();
                    this.form.controls[key].updateValueAndValidity();
                }
            }
        }
    }

    public disableForm() {
        this.form.disable();
    }
}
