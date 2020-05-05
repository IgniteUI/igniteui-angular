import { IgxDateRangePickerComponent } from './date-range-picker.component';
import { ComponentFixture, async, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { Component, OnInit, ViewChild, DebugElement } from '@angular/core';
import { IgxInputGroupModule, IgxInputDirective } from '../input-group/index';
import { InteractionMode } from '../core/enums';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule, FormControl, Validators } from '@angular/forms';
import { IgxCalendarComponent } from '../calendar/index';
import { IgxDateRangePickerModule } from './date-range-picker.module';
import { By } from '@angular/platform-browser';
import { UIInteractions } from '../test-utils/ui-interactions.spec';
import { configureTestSuite } from '../test-utils/configure-suite';
import { HelperTestFunctions } from '../calendar/calendar-helper-utils';
import { IgxDateTimeEditorModule } from '../directives/date-time-editor';
import { IgxIconModule } from '../icon';

// The number of milliseconds in one day
const ONE_DAY = 1000 * 60 * 60 * 24;
const DEBOUNCE_TIME = 16;
const defaultIconText = 'calendar_today';
const CSS_CLASS_INPUT_GROUP = '.igx-input-group__bundle';
const CSS_CLASS_INPUT = 'igx-input-group__input';
const CSS_CLASS_CALENDAR = 'igx-calendar';
const CSS_CLASS_CALENDAR_TOGGLE = 'igx-toggle'; // TODO Implementation -> maybe add class for the div container ('igx-date-picker')
const CSS_CLASS_ICON = 'igx-icon';
const CSS_CLASS_DONE_BUTTON = 'igx-button--flat';

describe('IgxDateRangePicker', () => {
    describe('Unit tests: ', () => {
        const elementRef = { nativeElement: null };
        const calendar = new IgxCalendarComponent();
        const mockNgControl = jasmine.createSpyObj('NgControl',
                                                    ['registerOnChangeCb',
                                                    'registerOnTouchedCb',
                                                    'registerOnValidatorChangeCb']);
        const mockInjector = jasmine.createSpyObj('Injector', {
            'get': mockNgControl
        });
        it('should set range dates correctly through selectRange method', () => {
            const dateRange = new IgxDateRangePickerComponent(elementRef, null, null, null);
            dateRange.calendar = calendar;
            let startDate = new Date(2020, 3, 7);
            const endDate = new Date(2020, 6, 27);

            // select range
            dateRange.selectRange(startDate, endDate);
            expect(dateRange.value.start).toEqual(startDate);
            expect(dateRange.value.end).toEqual(endDate);

            // select startDate only
            startDate = new Date(2023, 2, 11);
            dateRange.selectRange(startDate);
            expect(dateRange.value.start).toEqual(startDate);
            expect(dateRange.value.end).toEqual(startDate);
        });

        it('should emit rangeSelected on selection', () => {
            const dateRange = new IgxDateRangePickerComponent(elementRef, null, null, null);
            dateRange.calendar = calendar;
            spyOn(dateRange.rangeSelected, 'emit');
            let startDate = new Date(2017, 4, 5);
            const endDate = new Date(2017, 11, 22);

            // select range
            dateRange.selectRange(startDate, endDate);
            expect(dateRange.value.start).toEqual(startDate);
            expect(dateRange.value.end).toEqual(endDate);
            expect(dateRange.rangeSelected.emit).toHaveBeenCalledTimes(1);
            expect(dateRange.rangeSelected.emit).toHaveBeenCalledWith({ start: startDate, end: endDate });

            // select startDate only
            startDate = new Date(2024, 12, 15);
            dateRange.selectRange(startDate);
            expect(dateRange.value.start).toEqual(startDate);
            expect(dateRange.value.end).toEqual(startDate);
            expect(dateRange.rangeSelected.emit).toHaveBeenCalledTimes(2);
            expect(dateRange.rangeSelected.emit).toHaveBeenCalledWith({ start: startDate, end: startDate });
        });

        it('should correctly implement interface methods - ControlValueAccessor ', () => {
            const range = { start: new Date(2020, 1, 18), end: new Date(2020, 1, 28) };
            const rangeUpdate = { start: new Date(2020, 2, 22), end: new Date(2020, 2, 25) };

            // init
            const dateRangePicker = new IgxDateRangePickerComponent(null, null, 'en', null);
            dateRangePicker.registerOnChange(mockNgControl.registerOnChangeCb);
            dateRangePicker.registerOnTouched(mockNgControl.registerOnTouchedCb);
            spyOn(dateRangePicker, 'handleSelection');

            // writeValue
            expect(dateRangePicker.value).toBeUndefined();
            expect(mockNgControl.registerOnChangeCb).not.toHaveBeenCalled();
            dateRangePicker.writeValue(range);
            expect(dateRangePicker.value).toBe(range);

            // set value & handleSelection call _onChangeCallback
            dateRangePicker.value = rangeUpdate;
            expect(mockNgControl.registerOnChangeCb).toHaveBeenCalledWith(rangeUpdate);

            dateRangePicker.handleSelection([range.start]);
            expect(dateRangePicker.handleSelection).toHaveBeenCalledWith([range.start]);
            expect(dateRangePicker.handleSelection).toHaveBeenCalledTimes(1);
            expect(mockNgControl.registerOnChangeCb).toHaveBeenCalledWith({ start: range.start, end: range.end });

            // awaiting implementation - OnTouched callback
            // Docs: changes the value, turning the control dirty; or blurs the form control element, setting the control to touched.
            // when handleSelection fires should be touched&dirty // when input is blurred(two inputs), should be touched.
            // dateRangePicker.handleSelection([range.start]);
            // expect(mockNgControl.registerOnTouchedCb).toHaveBeenCalledTimes(1);

            dateRangePicker.setDisabledState(true);
            expect(dateRangePicker.disabled).toBe(true);
            dateRangePicker.setDisabledState(false);
            expect(dateRangePicker.disabled).toBe(false);
        });

        it('should validate correctly minValue and maxValue ', () => {
            const dateRange = new IgxDateRangePickerComponent(elementRef, null, null, mockInjector);
            dateRange.ngOnInit();

            dateRange.calendar = calendar;
            dateRange.registerOnChange(mockNgControl.registerOnChangeCb);
            dateRange.registerOnValidatorChange(mockNgControl.registerOnValidatorChangeCb);

            dateRange.minValue = new Date(2020, 4, 7);
            expect(mockNgControl.registerOnValidatorChangeCb).toHaveBeenCalledTimes(1);
            dateRange.maxValue = new Date(2020, 8, 7);
            expect(mockNgControl.registerOnValidatorChangeCb).toHaveBeenCalledTimes(2);

            const range = { start: new Date(2020, 4, 18), end: new Date(2020, 6, 28) };
            dateRange.writeValue(range);
            const mockFormControl = new FormControl(dateRange.value);
            expect(dateRange.validate(mockFormControl)).toBeNull();

            range.start.setMonth(2);
            expect(dateRange.validate(mockFormControl)).toEqual({ minValue: true });

            range.end.setMonth(12);
            // expect(dateRange.validate(mockFormControl)).toEqual({ maxValue: true });
        });
    });

    describe('Integration tests', () => {
        let fixture: ComponentFixture<DateRangeTestComponent>;
        let dateRange: IgxDateRangePickerComponent;
        let startDate: Date;
        let endDate: Date;
        let calendar: DebugElement;
        let calendarDays: DebugElement[];

        /**
         * Formats a date to 'MM/dd/yyyy' string
         * @param date Date to be formatted
         */
        function formatFullDate(date: Date): string {
            const year = `${date.getFullYear()}`.padStart(4, '0');
            const month = `${date.getMonth() + 1}`.padStart(2, '0');
            const day = `${date.getDate()}`.padStart(2, '0');
            const fullDate = [month, day, year].join('/');
            return fullDate;
        }

        function formatLongDate(date: Date): string {
            const result = date.toLocaleString('en-US', { month: 'long', day: 'numeric' });
            const year = date.getFullYear();
            return `${result}, ${year}`;
        }

        function selectDateRangeFromCalendar(startDateDay: number, dayRange: number) {
            const startDateDayElIndex = startDateDay - 1;
            const endDateDayElIndex = startDateDayElIndex + dayRange;
            dateRange.open();
            fixture.detectChanges();
            calendarDays[startDateDayElIndex].triggerEventHandler('click', UIInteractions.getMouseEvent('click'));
            if (dayRange !== 0) {
                calendarDays[endDateDayElIndex].triggerEventHandler('click', UIInteractions.getMouseEvent('click'));
            }
            fixture.detectChanges();
            dateRange.close();
            fixture.detectChanges();
        }
        describe('Single Input', () => {
            let singleInputElement: DebugElement;
            configureTestSuite();
            beforeAll(async(() => {
                TestBed.configureTestingModule({
                    declarations: [
                        DateRangeTestComponent,
                        DateRangeDefaultComponent
                    ],
                    imports: [IgxDateRangePickerModule,
                        IgxDateTimeEditorModule,
                        IgxInputGroupModule,
                        IgxIconModule,
                        FormsModule,
                        NoopAnimationsModule]
                })
                    .compileComponents();
            }));
            beforeEach(fakeAsync(() => {
                fixture = TestBed.createComponent(DateRangeDefaultComponent);
                fixture.detectChanges();
                dateRange = fixture.componentInstance.dateRange;
                calendarDays = fixture.debugElement.queryAll(By.css(HelperTestFunctions.DAY_CSSCLASS));
                singleInputElement = fixture.debugElement.query(By.css(`.${CSS_CLASS_INPUT}`));
                calendar = fixture.debugElement.query(By.css(CSS_CLASS_CALENDAR));
            }));

            function verifyDateRangeInSingleInput() {
                expect(dateRange.value.start).toEqual(startDate);
                expect(dateRange.value.end).toEqual(endDate);
                const inputStartDate = [startDate.getMonth() + 1, startDate.getDate(), startDate.getFullYear()].join('/');
                const inputEndDate = endDate ? [endDate.getMonth() + 1, endDate.getDate(), endDate.getFullYear()].join('/') : '';
                expect(singleInputElement.nativeElement.value).toEqual(`${inputStartDate} - ${inputEndDate}`);
            }

            describe('Selection tests', () => {
                it('should assign range dates to the input when selecting a range from the calendar', () => {
                    fixture.componentInstance.mode = InteractionMode.DropDown;
                    fixture.detectChanges();

                    const dayRange = 15;
                    const today = new Date();
                    startDate = new Date(today.getFullYear(), today.getMonth(), 10, 0, 0, 0);
                    endDate = new Date(startDate);
                    endDate.setDate(endDate.getDate() + dayRange);
                    selectDateRangeFromCalendar(startDate.getDate(), dayRange);
                    verifyDateRangeInSingleInput();
                });

                it('should assign range values correctly when selecting dates in reversed order', () => {
                    fixture.componentInstance.mode = InteractionMode.DropDown;
                    fixture.detectChanges();

                    const dayRange = -5;
                    const today = new Date();
                    startDate = new Date(today.getFullYear(), today.getMonth(), 5, 0, 0, 0);
                    endDate = new Date(today.getFullYear(), today.getMonth(), 10, 0, 0, 0);
                    selectDateRangeFromCalendar(endDate.getDate(), dayRange);
                    verifyDateRangeInSingleInput();
                });

                it('should set start date on single date selection', () => {
                    fixture.componentInstance.mode = InteractionMode.DropDown;
                    fixture.detectChanges();

                    const dayRange = 0;
                    const today = new Date();
                    startDate = new Date(today.getFullYear(), today.getMonth(), 10, 0, 0, 0);
                    endDate = null;
                    selectDateRangeFromCalendar(startDate.getDate(), dayRange);
                    verifyDateRangeInSingleInput();
                });

                it('should update input correctly on first and last date selection', () => {
                    const today = new Date();
                    startDate = new Date(today.getFullYear(), today.getMonth(), 1, 0, 0, 0);
                    endDate = new Date(today.getFullYear(), today.getMonth() + 2, 0, 0, 0, 0);
                    const differenceMs = Math.abs(startDate.getTime() - endDate.getTime());
                    const dayRange = Math.round(differenceMs / ONE_DAY);
                    selectDateRangeFromCalendar(startDate.getDate(), dayRange);
                    verifyDateRangeInSingleInput();
                });

                it('should assign range values correctly when selecting through API', () => {
                    startDate = new Date(2020, 10, 8, 0, 0, 0);
                    endDate = new Date(2020, 11, 8, 0, 0, 0);
                    dateRange.selectRange(startDate, endDate);
                    fixture.detectChanges();
                    verifyDateRangeInSingleInput();

                    startDate = new Date(2006, 5, 18, 0, 0, 0);
                    endDate = new Date(2006, 8, 18, 0, 0, 0);
                    dateRange.selectRange(startDate, endDate);
                    fixture.detectChanges();
                    verifyDateRangeInSingleInput();
                });
            });

            describe('Properties & events tests', () => {
                it('should support different input formats', () => {
                    dateRange.inputFormat = 'longDate';
                    fixture.detectChanges();

                    const today = new Date();
                    startDate = new Date(today.getFullYear(), today.getMonth(), 1, 0, 0, 0);
                    endDate = new Date(today.getFullYear(), today.getMonth(), 5, 0, 0, 0);
                    dateRange.selectRange(startDate, endDate);
                    fixture.detectChanges();
                    expect(singleInputElement.nativeElement.value).toEqual(`${formatLongDate(startDate)} - ${formatLongDate(endDate)}`);

                    dateRange.inputFormat = 'shortDate';
                    fixture.detectChanges();

                    startDate.setDate(2);
                    endDate.setDate(19);
                    dateRange.selectRange(startDate, endDate);
                    fixture.detectChanges();

                    let inputStartDate = startDate.toLocaleDateString('en', { day: 'numeric', month: 'numeric', year: '2-digit' });
                    let inputEndDate = endDate.toLocaleDateString('en', { day: 'numeric', month: 'numeric', year: '2-digit' });
                    expect(singleInputElement.nativeElement.value).toEqual(`${inputStartDate} - ${inputEndDate}`);

                    dateRange.inputFormat = 'fullDate';
                    fixture.detectChanges();

                    startDate.setDate(12);
                    endDate.setDate(23);
                    dateRange.selectRange(startDate, endDate);
                    fixture.detectChanges();

                    inputStartDate = startDate.toLocaleString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
                    inputEndDate = endDate.toLocaleString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
                    expect(singleInputElement.nativeElement.value).toEqual(`${inputStartDate} - ${inputEndDate}`);

                    dateRange.inputFormat = 'dd-MM-yy';
                    fixture.detectChanges();

                    startDate.setDate(9);
                    endDate.setDate(13);
                    dateRange.selectRange(startDate, endDate);
                    fixture.detectChanges();

                    inputStartDate = startDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'numeric', year: '2-digit' }).
                                    replace(/\//g, '-');
                    inputEndDate = endDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'numeric', year: '2-digit' }).
                                    replace(/\//g, '-');
                    expect(singleInputElement.nativeElement.value).toEqual(`${inputStartDate} - ${inputEndDate}`);
                });
                it('should close the calendar with the "Done" button', fakeAsync(() => {
                    fixture.componentInstance.mode = InteractionMode.Dialog;
                    fixture.detectChanges();
                    spyOn(dateRange.onClosing, 'emit').and.callThrough();
                    spyOn(dateRange.onClosed, 'emit').and.callThrough();

                    const doneBtn = fixture.debugElement.query(By.css(`.${CSS_CLASS_DONE_BUTTON}`));
                    const dayRange = 8;
                    const today = new Date();
                    startDate = new Date(today.getFullYear(), today.getMonth(), 10, 0, 0, 0);
                    endDate = new Date(startDate);
                    endDate.setDate(endDate.getDate() + dayRange);
                    const startDateDayElIndex = startDate.getDate() - 1;
                    const endDateDayElIndex = startDateDayElIndex + dayRange;
                    dateRange.open();
                    tick();
                    fixture.detectChanges();
                    expect(dateRange.collapsed).toBeFalsy();
                    calendarDays[startDateDayElIndex].triggerEventHandler('click', UIInteractions.getMouseEvent('click'));
                    calendarDays[endDateDayElIndex].triggerEventHandler('click', UIInteractions.getMouseEvent('click'));
                    fixture.detectChanges();
                    doneBtn.triggerEventHandler('click', UIInteractions.getMouseEvent('click'));
                    tick();
                    fixture.detectChanges();

                    verifyDateRangeInSingleInput();
                    expect(dateRange.collapsed).toBeTruthy();
                    expect(dateRange.onClosing.emit).toHaveBeenCalledTimes(1);
                    expect(dateRange.onClosing.emit).toHaveBeenCalledWith({ cancel: false, event: undefined });
                    expect(dateRange.onClosed.emit).toHaveBeenCalledTimes(1);
                    expect(dateRange.onClosed.emit).toHaveBeenCalledWith({ owner: dateRange });
                }));

                it('should show the "Done" button only in dialog mode', () => {
                    fixture.componentInstance.mode = InteractionMode.Dialog;
                    fixture.detectChanges();

                    dateRange.toggle();
                    fixture.detectChanges();
                    let doneBtn = fixture.debugElement.query(By.css(`.${CSS_CLASS_DONE_BUTTON}`));
                    expect(doneBtn).not.toBe(null);
                    dateRange.toggle();
                    fixture.detectChanges();

                    fixture.componentInstance.mode = InteractionMode.DropDown;
                    fixture.detectChanges();

                    dateRange.toggle();
                    fixture.detectChanges();
                    doneBtn = fixture.debugElement.query(By.css(`.${CSS_CLASS_DONE_BUTTON}`));
                    expect(doneBtn).toBe(null);
                    dateRange.toggle();
                    fixture.detectChanges();
                });

                it('should be able to change the "Done" button text', () => {
                    fixture.componentInstance.mode = InteractionMode.Dialog;
                    fixture.detectChanges();

                    let doneBtnText = 'Done';
                    dateRange.toggle();
                    fixture.detectChanges();
                    let doneBtn = fixture.debugElement.query(By.css(`.${CSS_CLASS_DONE_BUTTON}`));
                    expect(doneBtn.nativeElement.textContent).toEqual(doneBtnText);
                    dateRange.toggle();
                    fixture.detectChanges();

                    doneBtnText = 'Close';
                    dateRange.doneButtonText = doneBtnText;
                    fixture.detectChanges();
                    dateRange.toggle();
                    fixture.detectChanges();
                    doneBtn = fixture.debugElement.query(By.css(`.${CSS_CLASS_DONE_BUTTON}`));
                    expect(doneBtn.nativeElement.textContent).toEqual(doneBtnText);
                    dateRange.toggle();
                    fixture.detectChanges();
                });

                it('should emit open/close events - open/close methods', fakeAsync(() => {
                    spyOn(dateRange.onOpening, 'emit').and.callThrough();
                    spyOn(dateRange.onOpened, 'emit').and.callThrough();
                    spyOn(dateRange.onClosing, 'emit').and.callThrough();
                    spyOn(dateRange.onClosed, 'emit').and.callThrough();

                    dateRange.open();
                    tick(DEBOUNCE_TIME);
                    fixture.detectChanges();
                    expect(dateRange.collapsed).toBeFalsy();
                    expect(dateRange.onOpening.emit).toHaveBeenCalledTimes(1);
                    expect(dateRange.onOpening.emit).toHaveBeenCalledWith({ cancel: false });
                    expect(dateRange.onOpened.emit).toHaveBeenCalledTimes(1);
                    expect(dateRange.onOpened.emit).toHaveBeenCalledWith({ owner: dateRange });

                    const dayRange = 5;
                    const today = new Date();
                    startDate = new Date(today.getFullYear(), today.getMonth(), 4, 0, 0, 0);
                    endDate = new Date(startDate);
                    endDate.setDate(endDate.getDate() + dayRange);
                    selectDateRangeFromCalendar(startDate.getDate(), dayRange);

                    dateRange.close();
                    tick();
                    fixture.detectChanges();
                    verifyDateRangeInSingleInput();
                    expect(dateRange.collapsed).toBeTruthy();
                    expect(dateRange.onClosing.emit).toHaveBeenCalledTimes(1);
                    expect(dateRange.onClosing.emit).toHaveBeenCalledWith({ cancel: false, event: undefined });
                    expect(dateRange.onClosed.emit).toHaveBeenCalledTimes(1);
                    expect(dateRange.onClosed.emit).toHaveBeenCalledWith({ owner: dateRange });
                }));

                it('should emit open/close events - toggle method', fakeAsync(() => {
                    spyOn(dateRange.onOpening, 'emit').and.callThrough();
                    spyOn(dateRange.onOpened, 'emit').and.callThrough();
                    spyOn(dateRange.onClosing, 'emit').and.callThrough();
                    spyOn(dateRange.onClosed, 'emit').and.callThrough();

                    dateRange.toggle();
                    tick(DEBOUNCE_TIME);
                    fixture.detectChanges();
                    expect(dateRange.collapsed).toBeFalsy();
                    expect(dateRange.onOpening.emit).toHaveBeenCalledTimes(1);
                    expect(dateRange.onOpening.emit).toHaveBeenCalledWith({ cancel: false });
                    expect(dateRange.onOpened.emit).toHaveBeenCalledTimes(1);
                    expect(dateRange.onOpened.emit).toHaveBeenCalledWith({ owner: dateRange });

                    const dayRange = 6;
                    const today = new Date();
                    startDate = new Date(today.getFullYear(), today.getMonth(), 14, 0, 0, 0);
                    endDate = new Date(startDate);
                    endDate.setDate(endDate.getDate() + dayRange);
                    selectDateRangeFromCalendar(startDate.getDate(), dayRange);

                    dateRange.toggle();
                    tick();
                    fixture.detectChanges();
                    expect(dateRange.collapsed).toBeTruthy();
                    expect(dateRange.onClosing.emit).toHaveBeenCalledTimes(1);
                    expect(dateRange.onClosing.emit).toHaveBeenCalledWith({ cancel: false, event: undefined });
                    expect(dateRange.onClosed.emit).toHaveBeenCalledTimes(1);
                    expect(dateRange.onClosed.emit).toHaveBeenCalledWith({ owner: dateRange });
                }));
            });

            describe('Keyboard navigation', () => {
                it('should toggle the calendar with ALT + DOWN/UP ARROW key', fakeAsync(() => {
                    fixture.componentInstance.mode = InteractionMode.DropDown;
                    fixture.detectChanges();

                    spyOn(dateRange.onOpening, 'emit').and.callThrough();
                    spyOn(dateRange.onOpened, 'emit').and.callThrough();
                    spyOn(dateRange.onClosing, 'emit').and.callThrough();
                    spyOn(dateRange.onClosed, 'emit').and.callThrough();

                    expect(dateRange.collapsed).toBeTruthy();
                    UIInteractions.triggerEventHandlerKeyDown('ArrowDown', calendar, true);
                    tick(DEBOUNCE_TIME * 2);
                    fixture.detectChanges();
                    expect(dateRange.collapsed).toBeFalsy();
                    expect(dateRange.onOpening.emit).toHaveBeenCalledTimes(1);
                    expect(dateRange.onOpened.emit).toHaveBeenCalledTimes(1);

                    UIInteractions.triggerEventHandlerKeyDown('ArrowUp', calendar, true);
                    tick();
                    fixture.detectChanges();
                    expect(dateRange.collapsed).toBeTruthy();
                    expect(dateRange.onClosing.emit).toHaveBeenCalledTimes(1);
                    expect(dateRange.onClosed.emit).toHaveBeenCalledTimes(1);
                }));

                it('should close the calendar with ESC', fakeAsync(() => {
                    fixture.componentInstance.mode = InteractionMode.DropDown;
                    fixture.detectChanges();

                    spyOn(dateRange.onClosing, 'emit').and.callThrough();
                    spyOn(dateRange.onClosed, 'emit').and.callThrough();

                    expect(dateRange.collapsed).toBeTruthy();
                    dateRange.open();
                    tick();
                    fixture.detectChanges();
                    expect(dateRange.collapsed).toBeFalsy();

                    UIInteractions.triggerEventHandlerKeyDown('Escape', calendar);
                    tick();
                    fixture.detectChanges();
                    expect(dateRange.collapsed).toBeTruthy();
                    expect(dateRange.onClosing.emit).toHaveBeenCalledTimes(1);
                    expect(dateRange.onClosed.emit).toHaveBeenCalledTimes(1);
                }));
            });
        });

        describe('Two Inputs', () => {
            let startInput: DebugElement;
            let endInput: DebugElement;
            configureTestSuite();
            beforeAll(async(() => {
                TestBed.configureTestingModule({
                    declarations: [
                        DateRangeTestComponent,
                        DateRangeTwoInputsTestComponent
                    ],
                    imports: [IgxDateRangePickerModule, IgxDateTimeEditorModule, IgxIconModule,
                        IgxInputGroupModule, FormsModule, NoopAnimationsModule]
                })
                    .compileComponents();
            }));
            beforeEach(async () => {
                fixture = TestBed.createComponent(DateRangeTwoInputsTestComponent);
                fixture.detectChanges();
                dateRange = fixture.componentInstance.dateRange;
                startInput = fixture.debugElement.query(By.css('input'));
                endInput = fixture.debugElement.queryAll(By.css('input'))[1];
                calendar = fixture.debugElement.query(By.css(CSS_CLASS_CALENDAR));
                calendarDays = fixture.debugElement.queryAll(By.css(HelperTestFunctions.DAY_CSSCLASS));
            });

            function verifyDateRange() {
                expect(dateRange.value.start).toEqual(startDate);
                expect(dateRange.value.end).toEqual(endDate);
                expect(startInput.nativeElement.value).toEqual(formatFullDate(startDate));
                const expectedEndDate = endDate ? formatFullDate(endDate) : '';
                expect(endInput.nativeElement.value).toEqual(expectedEndDate);
            }

            describe('Selection tests', () => {
                it('should assign range values correctly when selecting dates from the calendar', () => {
                    fixture.componentInstance.mode = InteractionMode.DropDown;
                    fixture.detectChanges();

                    let dayRange = 15;
                    const today = new Date();
                    startDate = new Date(today.getFullYear(), today.getMonth(), 10, 0, 0, 0);
                    endDate = new Date(startDate);
                    endDate.setDate(endDate.getDate() + dayRange);
                    selectDateRangeFromCalendar(startDate.getDate(), dayRange);
                    verifyDateRange();

                    dayRange = 13;
                    startDate = new Date(today.getFullYear(), today.getMonth(), 6, 0, 0, 0);
                    endDate = new Date(startDate);
                    endDate.setDate(endDate.getDate() + dayRange);
                    selectDateRangeFromCalendar(startDate.getDate(), dayRange);
                    verifyDateRange();
                });

                it('should assign range values correctly when selecting dates in reversed order', () => {
                    fixture.componentInstance.mode = InteractionMode.DropDown;
                    fixture.detectChanges();

                    const dayRange = -10;
                    const today = new Date();
                    startDate = new Date(today.getFullYear(), today.getMonth(), 10, 0, 0, 0);
                    endDate = new Date(today.getFullYear(), today.getMonth(), 20, 0, 0, 0);
                    selectDateRangeFromCalendar(endDate.getDate(), dayRange);
                    verifyDateRange();
                });

                it('should apply selection to start date when single date is selected', () => {
                    fixture.componentInstance.mode = InteractionMode.DropDown;
                    fixture.detectChanges();

                    const today = new Date();
                    startDate = new Date(today.getFullYear(), today.getMonth(), 4, 0, 0, 0);
                    endDate = null;

                    selectDateRangeFromCalendar(startDate.getDate(), 0);
                    verifyDateRange();
                });

                it('should update inputs correctly on first and last date selection', () => {
                    const today = new Date();
                    startDate = new Date(today.getFullYear(), today.getMonth(), 1, 0, 0, 0);
                    endDate = new Date(today.getFullYear(), today.getMonth() + 2, 0, 0, 0, 0);
                    const differenceMs = Math.abs(startDate.getTime() - endDate.getTime());
                    const dayRange = Math.round(differenceMs / ONE_DAY);
                    selectDateRangeFromCalendar(startDate.getDate(), dayRange);
                    verifyDateRange();
                });

                it('should assign range values correctly when selecting through API', () => {
                    startDate = new Date(2020, 10, 8, 0, 0, 0);
                    endDate = new Date(2020, 11, 8, 0, 0, 0);
                    dateRange.selectRange(startDate, endDate);
                    fixture.detectChanges();
                    verifyDateRange();

                    startDate = new Date(2003, 5, 18, 0, 0, 0);
                    endDate = new Date(2003, 8, 18, 0, 0, 0);
                    dateRange.selectRange(startDate, endDate);
                    fixture.detectChanges();
                    verifyDateRange();
                });
                xit('should support different input formats', () => {
                    // dateRange.inputFormat = 'longDate';
                    // fixture.detectChanges();

                    const today = new Date();
                    startDate = new Date(today.getFullYear(), today.getMonth(), 1, 0, 0, 0);
                    endDate = new Date(today.getFullYear(), today.getMonth(), 5, 0, 0, 0);
                    // dateRange.selectRange(startDate, endDate);
                    // fixture.detectChanges();
                    // expect(startInput.nativeElement.value).toEqual(formatFullDate(startDate));
                    // expect(endInput.nativeElement.value).toEqual(formatFullDate(endDate));

                    // dateRange.inputFormat = 'shortDate';
                    // fixture.detectChanges();

                    // startDate.setDate(2);
                    // endDate.setDate(19);
                    // dateRange.selectRange(startDate, endDate);
                    // fixture.detectChanges();

                    // let inputStartDate = startDate.toLocaleDateString('en', { day: 'numeric', month: 'numeric', year: '2-digit' });
                    // let inputEndDate = endDate.toLocaleDateString('en', { day: 'numeric', month: 'numeric', year: '2-digit' });
                    // expect(startInput.nativeElement.value).toEqual(formatFullDate(inputStartDate));
                    // expect(endInput.nativeElement.value).toEqual(formatFullDate(inputEndDate));

                    dateRange.inputFormat = 'fullDate';
                    fixture.detectChanges();

                    startDate.setDate(12);
                    endDate.setDate(23);
                    dateRange.selectRange(startDate, endDate);
                    fixture.detectChanges();

                    // inputStartDate = startDate.toLocaleString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
                    // inputEndDate = endDate.toLocaleString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
                    // expect(startInput.nativeElement.value).toEqual(inputStartDate);
                    // expect(endInput.nativeElement.value).toEqual(inputEndDate);

                    // dateRange.inputFormat = 'dd-MM-yy';
                    // fixture.detectChanges();

                    // startDate.setDate(9);
                    // endDate.setDate(13);
                    // dateRange.selectRange(startDate, endDate);
                    // fixture.detectChanges();

                    // inputStartDate = startDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'numeric', year: '2-digit' }).
                    //                 replace(/\//g, '-');
                    // inputEndDate = endDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'numeric', year: '2-digit' }).
                    //                 replace(/\//g, '-');
                    // expect(singleInputElement.nativeElement.value).toEqual(`${inputStartDate} - ${inputEndDate}`);
                });
            });
            describe('Keyboard navigation', () => {
                it('should toggle the calendar with ALT + DOWN/UP ARROW key', fakeAsync(() => {
                    expect(dateRange.collapsed).toBeTruthy();

                    spyOn(dateRange.onOpening, 'emit').and.callThrough();
                    spyOn(dateRange.onOpened, 'emit').and.callThrough();
                    spyOn(dateRange.onClosing, 'emit').and.callThrough();
                    spyOn(dateRange.onClosed, 'emit').and.callThrough();

                    expect(dateRange.collapsed).toBeTruthy();
                    UIInteractions.triggerEventHandlerKeyDown('ArrowDown', calendar, true);
                    tick(DEBOUNCE_TIME * 2);
                    fixture.detectChanges();
                    expect(dateRange.collapsed).toBeFalsy();
                    expect(dateRange.onOpening.emit).toHaveBeenCalledTimes(1);
                    expect(dateRange.onOpened.emit).toHaveBeenCalledTimes(1);

                    UIInteractions.triggerEventHandlerKeyDown('ArrowUp', calendar, true);
                    tick();
                    fixture.detectChanges();
                    expect(dateRange.collapsed).toBeTruthy();
                    expect(dateRange.onClosing.emit).toHaveBeenCalledTimes(1);
                    expect(dateRange.onClosed.emit).toHaveBeenCalledTimes(1);
                }));

                it('should close the calendar with ESC', fakeAsync(() => {
                    fixture.componentInstance.mode = InteractionMode.DropDown;
                    fixture.detectChanges();

                    spyOn(dateRange.onClosing, 'emit').and.callThrough();
                    spyOn(dateRange.onClosed, 'emit').and.callThrough();

                    expect(dateRange.collapsed).toBeTruthy();
                    dateRange.toggle();
                    tick();
                    fixture.detectChanges();
                    expect(dateRange.collapsed).toBeFalsy();

                    UIInteractions.triggerEventHandlerKeyDown('Escape', calendar);
                    tick();
                    fixture.detectChanges();
                    expect(dateRange.collapsed).toBeTruthy();
                    expect(dateRange.onClosing.emit).toHaveBeenCalledTimes(1);
                    expect(dateRange.onClosed.emit).toHaveBeenCalledTimes(1);
                }));
            });
        });

        describe('Calendar UI', () => {
            configureTestSuite();
            beforeAll(async(() => {
                TestBed.configureTestingModule({
                    declarations: [
                        DateRangeTestComponent,
                        DateRangeTwoInputsTestComponent
                    ],
                    imports: [IgxDateRangePickerModule, IgxDateTimeEditorModule, IgxInputGroupModule, FormsModule, NoopAnimationsModule]
                })
                    .compileComponents();
            }));
            beforeEach(async () => {
                fixture = TestBed.createComponent(DateRangeTwoInputsTestComponent);
                fixture.detectChanges();
                dateRange = fixture.componentInstance.dateRange;
            });

            xit('should move focus to the calendar on open in dropdown mode', fakeAsync(() => {
                fixture = TestBed.createComponent(DateRangeTwoInputsTestComponent);
                fixture.componentInstance.mode = InteractionMode.DropDown;
                fixture.detectChanges();

                const startInput = fixture.debugElement.queryAll(By.css('.igx-input-group'))[1];
                // UIInteractions.clickElement(startInput.nativeElement);
                tick(100);
                fixture.detectChanges();
                expect(document.activeElement.textContent.trim()).toMatch(new Date().getDate().toString());
            }));

            xit('should move focus to the calendar on open in dialog mode', fakeAsync(() => {
                fixture = TestBed.createComponent(DateRangeTwoInputsTestComponent);
                fixture.componentInstance.mode = InteractionMode.Dialog;
                fixture.detectChanges();

                const startInput = fixture.debugElement.queryAll(By.css('.igx-input-group'))[1];
                // UIInteractions.clickElement(startInput.nativeElement);
                tick(100);
                fixture.detectChanges();
                expect(document.activeElement.textContent.trim()).toMatch(new Date().getDate().toString());
            }));

            xit('should move the focus to start input on close (date range with two inputs)', fakeAsync(() => {
                fixture = TestBed.createComponent(DateRangeTwoInputsTestComponent);
                fixture.componentInstance.mode = InteractionMode.DropDown;
                fixture.detectChanges();

                fixture.componentInstance.dateRange.open();
                tick();
                fixture.detectChanges();

                const button = fixture.debugElement.query(By.css('.igx-button--flat'));
                // UIInteractions.clickElement(button);
                tick();
                fixture.detectChanges();

                fixture.componentInstance.dateRange.close();
                tick();
                fixture.detectChanges();

                expect(document.activeElement).toHaveClass('igx-input-group__input');
            }));

            xit('should move the focus to the single input on close', fakeAsync(() => {
                fixture = TestBed.createComponent(DateRangeDefaultComponent);
                fixture.componentInstance.mode = InteractionMode.DropDown;
                fixture.detectChanges();

                fixture.componentInstance.dateRange.open();
                tick();
                fixture.detectChanges();

                const button = fixture.debugElement.query(By.css('.igx-button--flat'));
                // UIInteractions.clickElement(button);
                tick();
                fixture.detectChanges();

                fixture.componentInstance.dateRange.close();
                tick();
                fixture.detectChanges();

                expect(document.activeElement).toHaveClass('igx-input-group__input');
            }));
        });

        describe('Rendering', () => {
            configureTestSuite();
            beforeAll(async(() => {
                TestBed.configureTestingModule({
                    declarations: [
                        DateRangeTestComponent,
                        DateRangeDefaultComponent,
                        DateRangeDefaultCustomLabelComponent,
                        DateRangeTemplatesComponent
                    ],
                    imports: [IgxDateRangePickerModule,
                        IgxDateTimeEditorModule,
                        IgxInputGroupModule,
                        IgxIconModule,
                        FormsModule,
                        NoopAnimationsModule]
                })
                    .compileComponents();
            }));
            it('should render default toggle icon', () => {
                fixture = TestBed.createComponent(DateRangeDefaultComponent);
                fixture.detectChanges();

                const inputGroup = fixture.debugElement.query(By.css(CSS_CLASS_INPUT_GROUP));
                expect(inputGroup.children[0].nativeElement.innerText).toBe(defaultIconText);
                expect(inputGroup.children[0].children[0].classes[CSS_CLASS_ICON]).toBeTruthy();
            });
            it('should be able to set toggle icon', () => {
                const prefixIconText = 'flight_takeoff';
                const suffixIconText = 'flight_land';
                const additionalIconText = 'calendar_view_day';
                fixture = TestBed.createComponent(DateRangeTemplatesComponent);
                fixture.detectChanges();

                const inputGroups = fixture.debugElement.queryAll(By.css(CSS_CLASS_INPUT_GROUP));
                const prefixSingleRangeInput = inputGroups[0];
                expect(prefixSingleRangeInput.children[0].nativeElement.innerText).toBe(prefixIconText);
                expect(prefixSingleRangeInput.children[0].children[0].classes[CSS_CLASS_ICON]).toBeTruthy();

                const suffixSingleRangeInput = inputGroups[1];
                expect(suffixSingleRangeInput.children[1].nativeElement.innerText).toBe(suffixIconText);
                expect(suffixSingleRangeInput.children[1].children[0].classes[CSS_CLASS_ICON]).toBeTruthy();

                const addPrefixSingleRangeInput = inputGroups[2];
                expect(addPrefixSingleRangeInput.children[0].nativeElement.innerText).toBe(defaultIconText);
                expect(addPrefixSingleRangeInput.children[0].children[0].classes[CSS_CLASS_ICON]).toBeTruthy();
                expect(addPrefixSingleRangeInput.children[1].nativeElement.innerText).toBe(additionalIconText);
                expect(addPrefixSingleRangeInput.children[1].children[0].classes[CSS_CLASS_ICON]).toBeTruthy();

                const prefixRangeInput = inputGroups[3];
                expect(prefixRangeInput.children[0].nativeElement.innerText).toBe(prefixIconText);
                expect(prefixRangeInput.children[0].children[0].classes[CSS_CLASS_ICON]).toBeTruthy();

                const suffixRangeInput = inputGroups[4];
                expect(suffixRangeInput.children[1].nativeElement.innerText).toBe(suffixIconText);
                expect(suffixRangeInput.children[1].children[0].classes[CSS_CLASS_ICON]).toBeTruthy();
                expect(suffixRangeInput.children[2].nativeElement.innerText).toBe(additionalIconText);
                expect(suffixRangeInput.children[2].children[0].classes[CSS_CLASS_ICON]).toBeTruthy();
            });

            it('should render aria attributes properly', fakeAsync(() => {
                fixture = TestBed.createComponent(DateRangeDefaultCustomLabelComponent);
                fixture.detectChanges();
                dateRange = fixture.componentInstance.dateRange;
                const toggleBtn = fixture.debugElement.query(By.css(`.${CSS_CLASS_ICON}`));
                const calendarElement = fixture.debugElement.query(By.css(`.${CSS_CLASS_CALENDAR}`));
                const singleInputElement = fixture.debugElement.query(By.css(`.${CSS_CLASS_INPUT}`));
                startDate = new Date(2020, 1, 1);
                endDate = new Date(2020, 1, 4);
                const expectedLabelID = dateRange.label.id;
                const expectedPlaceholder = singleInputElement.nativeElement.getAttribute('placeholder');

                expect(singleInputElement.nativeElement.getAttribute('role')).toEqual('combobox');
                expect(singleInputElement.nativeElement.getAttribute('placeholder')).toEqual(expectedPlaceholder);
                expect(singleInputElement.nativeElement.getAttribute('aria-haspopup')).toEqual('grid');
                expect(singleInputElement.nativeElement.getAttribute('aria-expanded')).toEqual('false');
                expect(toggleBtn.nativeElement.getAttribute('aria-hidden')).toEqual('true');
                expect(calendarElement.nativeElement.getAttribute('role')).toEqual('grid');
                expect(singleInputElement.nativeElement.getAttribute('aria-labelledby')).toEqual(expectedLabelID);

                dateRange.toggle();
                tick();
                fixture.detectChanges();

                const calendarWrapper = fixture.debugElement.query(By.css(`.${CSS_CLASS_CALENDAR_TOGGLE}`));
                expect(singleInputElement.nativeElement.getAttribute('aria-expanded')).toEqual('true');
                expect(calendarWrapper.nativeElement.getAttribute('aria-hidden')).toEqual('false');

                dateRange.toggle();
                tick();
                fixture.detectChanges();

                expect(singleInputElement.nativeElement.getAttribute('aria-expanded')).toEqual('false');
                expect(toggleBtn.nativeElement.getAttribute('aria-hidden')).toEqual('true');

                dateRange.selectRange(startDate, endDate);
                fixture.detectChanges();
                expect(singleInputElement.nativeElement.getAttribute('placeholder')).toEqual('');
            }));
        });
    });
});

@Component({
    selector: 'igx-date-range-test',
    template: ''
})
export class DateRangeTestComponent implements OnInit {
    [x: string]: any;
    public todayButtonText: string;
    public doneButtonText: string;
    public mode: InteractionMode;

    @ViewChild(IgxDateRangePickerComponent, { read: IgxDateRangePickerComponent, static: true })
    public dateRange: IgxDateRangePickerComponent;

    public ngOnInit(): void {
        this.todayButtonText = 'Today';
        this.doneButtonText = 'Done';
    }
}

@Component({
    selector: 'igx-date-range-two-inputs-test',
    template: `
    <igx-date-range-picker [mode]="mode" [(ngModel)]="range" required>
            <igx-date-range-start>
                <input igxInput igxDateTimeEditor type="text">
            </igx-date-range-start>
            <igx-date-range-end>
                <input igxInput igxDateTimeEditor type="text">
            </igx-date-range-end>
        </igx-date-range-picker>
`
})
export class DateRangeTwoInputsTestComponent extends DateRangeTestComponent {
    range;
}

@Component({
    selector: 'igx-date-range-single-input-label-test',
    template: `
    <igx-date-range-picker [mode]="'dropdown'">
        <label igxLabel>Select Date</label>
    </igx-date-range-picker>
    `
})
export class DateRangeDefaultCustomLabelComponent extends DateRangeTestComponent {
}

@Component({
    selector: 'igx-date-range-single-input-test',
    template: `
    <igx-date-range-picker [mode]="mode">
    </igx-date-range-picker>
    `
})
export class DateRangeDefaultComponent extends DateRangeTestComponent { }

@Component({
    selector: 'igx-date-range-templates-test',
    template: `
    <igx-date-range-picker #prefixSingleRange>
        <igx-picker-toggle igxPrefix>
            <igx-icon>flight_takeoff</igx-icon>
        </igx-picker-toggle>
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
    `
})
export class DateRangeTemplatesComponent extends DateRangeTestComponent {}
