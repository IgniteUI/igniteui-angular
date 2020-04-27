import { IgxDateRangeComponent } from './igx-date-range.component';
import { ComponentFixture, async, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { Component, OnInit, ViewChild, DebugElement } from '@angular/core';
import { IgxInputGroupModule } from '../input-group/index';
import { InteractionMode } from '../core/enums';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule } from '@angular/forms';
import { IgxIconModule } from '../icon';
import { IgxCalendarModule, IgxCalendarComponent } from '../calendar/index';
import { IgxButtonModule } from '../directives/button/button.directive';
import { IgxDateRangeModule } from './igx-date-range.module';
import { By } from '@angular/platform-browser';
import { UIInteractions } from '../test-utils/ui-interactions.spec';
import { configureTestSuite } from '../test-utils/configure-suite';
import { HelperTestFunctions } from '../calendar/calendar-helper-utils';
import { IgxDateTimeEditorModule } from '../directives/date-time-editor';

// The number of milliseconds in one day
const ONE_DAY = 1000 * 60 * 60 * 24;

const CSS_CLASS_INPUT = 'igx-input-group__input';
const CSS_CLASS_TOGGLE_BUTTON = 'igx-icon';
const CSS_CLASS_CALENDAR = 'igx-calendar';
const CSS_CLASS_CALENDAR_WRAPPER = 'igx-toggle'; // TODO Implementation -> maybe add class for the div container ('igx-date-picker')
const CSS_CLASS_DATE_PICKER = 'igx-date-picker';

function getDatesInView(dates: DebugElement[]): DebugElement[] {
    return dates.filter(d => {
        const date = d.childNodes[0].nativeNode.innerText;
        return date !== `${new Date().getDate()}` ? date : null;
    });
}

describe('IgxRangeDatePicker', () => {
    describe('Unit tests: ', () => {
        const elementRef = { nativeElement: null };
        const calendar = new IgxCalendarComponent();
        it('should set range dates correctly through selectRange method', () => {
            const dateRange = new IgxDateRangeComponent(elementRef);
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

        it('should set range dates correctly through selectToday method', () => {
            const dateRange = new IgxDateRangeComponent(elementRef);
            dateRange.calendar = calendar;
            const today = new Date();

            dateRange.selectRange(new Date());
            expect(dateRange.value.start).toEqual(today);
            expect(dateRange.value.end).toEqual(today);
        });

        it('should emit rangeSelected on selection', () => {
            const dateRange = new IgxDateRangeComponent(elementRef);
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

        it('should emit rangeSelected on selectToday()', () => {
            const dateRange = new IgxDateRangeComponent(elementRef);
            dateRange.calendar = calendar;
            spyOn(dateRange.rangeSelected, 'emit');
            const today = new Date();

            dateRange.selectRange(new Date());
            expect(dateRange.value.start).toEqual(today);
            expect(dateRange.value.end).toEqual(today);
            expect(dateRange.rangeSelected.emit).toHaveBeenCalledTimes(1);
            expect(dateRange.rangeSelected.emit).toHaveBeenCalledWith({ start: today, end: today });
        });
    });

    // tslint:disable: no-use-before-declare
    describe('Integration tests', () => {
        let fixture: ComponentFixture<DateRangeTestComponent>;
        let endDate: Date;
        let startDate: Date;
        let toggleBtn: DebugElement;
        let calendarElement: DebugElement;
        let calendarWrapper: DebugElement;
        let dateRange: IgxDateRangeComponent;

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
        describe('Selection tests', () => {
            let calendarDays: DebugElement[];
            function selectDateRangeFromCalendar(startDateDay: number, dayRange: number) {
                const startDateDayElIndex = startDateDay - 1;
                const endDateDayElIndex = startDateDayElIndex + dayRange;
                dateRange.open();
                fixture.detectChanges();
                calendarDays[startDateDayElIndex].triggerEventHandler('click', UIInteractions.getMouseEvent('click'));
                if (dayRange !== 0) {
                    calendarDays[endDateDayElIndex].triggerEventHandler('click', UIInteractions.getMouseEvent('click'));
                }
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
                        imports: [IgxDateRangeModule, IgxDateTimeEditorModule, IgxInputGroupModule, FormsModule, NoopAnimationsModule]
                    })
                        .compileComponents();
                }));
                beforeEach(fakeAsync(() => {
                    fixture = TestBed.createComponent(DateRangeDefaultComponent);
                    fixture.detectChanges();
                    dateRange = fixture.componentInstance.dateRange;
                    calendarDays = fixture.debugElement.queryAll(By.css(HelperTestFunctions.DAY_CSSCLASS));
                    singleInputElement = fixture.debugElement.query(By.css('.' + CSS_CLASS_INPUT));
                }));

                function verifyDateRangeInSingleInput() {
                    expect(dateRange.value.start).toEqual(startDate);
                    expect(dateRange.value.end).toEqual(endDate);
                    const inputStartDate = [startDate.getMonth() + 1, startDate.getDate(), startDate.getFullYear()].join('/');
                    const inputEndDate = endDate ? [endDate.getMonth() + 1, endDate.getDate(), endDate.getFullYear()].join('/') : '';
                    expect(singleInputElement.nativeElement.value).toEqual(`${inputStartDate} - ${inputEndDate}`);
                }

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
                        imports: [IgxDateRangeModule, IgxDateTimeEditorModule, IgxInputGroupModule, FormsModule, NoopAnimationsModule]
                    })
                        .compileComponents();
                }));
                beforeEach(async () => {
                    fixture = TestBed.createComponent(DateRangeTwoInputsTestComponent);
                    fixture.detectChanges();
                    dateRange = fixture.componentInstance.dateRange;
                    startInput = fixture.debugElement.query(By.css('input'));
                    endInput = fixture.debugElement.queryAll(By.css('input'))[1];
                    calendarDays = fixture.debugElement.queryAll(By.css(HelperTestFunctions.DAY_CSSCLASS));
                });

                function verifyDateRange() {
                    expect(dateRange.value.start).toEqual(startDate);
                    expect(dateRange.value.end).toEqual(endDate);
                    expect(startInput.nativeElement.value).toEqual(formatFullDate(startDate));
                    const expectedEndDate = endDate ? formatFullDate(endDate) : '__/__/____';
                    expect(endInput.nativeElement.value).toEqual(expectedEndDate);
                }

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
            });
        });

        describe('Test API - properties, methods and events', () => {
            xit('Should select today properly', (done) => {
                fixture = TestBed.createComponent(DateRangeTwoInputsTestComponent);
                fixture.componentInstance.mode = InteractionMode.DropDown;
                fixture.detectChanges();

                fixture.componentInstance.dateRange.selectRange(new Date());
                fixture.whenStable().then(() => {
                    fixture.detectChanges();
                    // expect((fixture.componentInstance.dateRange.value as Date[]).length).toBe(1);
                    done();
                });
            });

            it('Should close the calendar properly with the "Done" button', fakeAsync(() => {
                // TODO
                // dialog mode
                // should not lose selection
            }));

            it('Should be able to change the text of its two buttons', fakeAsync(() => {
                // TODO
                // dialog mode
            }));

            it('Should show the "Done" button only in dialog mode', fakeAsync(() => {
                // TODO
            }));
        }); // Use component instance

        describe('Templates ', () => { });

        describe('Calendar UI', () => {
            configureTestSuite();
            beforeAll(async(() => {
                TestBed.configureTestingModule({
                    declarations: [
                        DateRangeTestComponent,
                        DateRangeTwoInputsTestComponent
                    ],
                    imports: [IgxDateRangeModule, IgxDateTimeEditorModule, IgxInputGroupModule, FormsModule, NoopAnimationsModule]
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
                fixture = TestBed.createComponent(DateRangeSingleInputTestComponent);
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

        describe('Keyboard Navigation', () => {
            const escapeKeyEvent = new KeyboardEvent('keydown', { key: 'Escape' });
            const altArrowDownKeyEvent = new KeyboardEvent('keydown', { altKey: true, key: 'ArrowDown' });
            const altArrowUpKeyEvent = new KeyboardEvent('keydown', { altKey: true, key: 'ArrowUp' });

            configureTestSuite();
            beforeAll(async(() => {
                TestBed.configureTestingModule({
                    declarations: [
                        DateRangeTestComponent,
                        DateRangeDefaultComponent,
                        DateRangeTwoInputsTestComponent
                    ],
                    imports: [IgxDateRangeModule, IgxDateTimeEditorModule, IgxInputGroupModule, NoopAnimationsModule]
                })
                    .compileComponents();
            }));

            describe('Keyboard Navigation Single Input', () => {
                let input: DebugElement;
                let dateRangeSingle: IgxDateRangeComponent;
                let calendar: DebugElement;

                beforeEach(fakeAsync(() => {
                    fixture = TestBed.createComponent(DateRangeDefaultComponent);
                    dateRangeSingle = fixture.componentInstance.dateRange;
                    fixture.detectChanges();
                    dateRangeSingle.mode = InteractionMode.DropDown;
                    fixture.detectChanges();
                    input = fixture.debugElement.query(By.css('input'));
                    calendar = fixture.debugElement.query(By.css(CSS_CLASS_CALENDAR));
                }));

                it('Should toggle the calendar with ALT + DOWN/UP ARROW key', fakeAsync(() => {
                    expect(dateRangeSingle.toggleDirective.collapsed).toBeTruthy();
                    calendar.triggerEventHandler('keydown', altArrowDownKeyEvent);
                    tick();
                    fixture.detectChanges();
                    expect(dateRangeSingle.toggleDirective.collapsed).toBeFalsy();
                    calendar.triggerEventHandler('keydown', altArrowUpKeyEvent);
                    tick();
                    fixture.detectChanges();
                    expect(dateRangeSingle.toggleDirective.collapsed).toBeTruthy();
                }));

                it('Should close the calendar with ESC', fakeAsync(() => {
                    expect(dateRangeSingle.toggleDirective.collapsed).toBeTruthy();
                    dateRangeSingle.toggleDirective.toggle();
                    tick();
                    fixture.detectChanges();

                    expect(dateRangeSingle.toggleDirective.collapsed).toBeFalsy();

                    calendar.triggerEventHandler('keydown', escapeKeyEvent);
                    tick();
                    fixture.detectChanges();

                    expect(dateRangeSingle.toggleDirective.collapsed).toBeTruthy();
                }));
            });
            describe('Keyboard Navigation Two Inputs', () => {
                let startInput: DebugElement;
                let endInput: DebugElement;
                let dateRangeTwoInputs: IgxDateRangeComponent;
                let calendar: DebugElement;

                beforeEach(fakeAsync(() => {
                    fixture = TestBed.createComponent(DateRangeTwoInputsTestComponent);
                    dateRangeTwoInputs = fixture.componentInstance.dateRange;
                    fixture.detectChanges();
                    dateRangeTwoInputs.mode = InteractionMode.DropDown;
                    startInput = fixture.debugElement.query(By.css('input'));
                    endInput = fixture.debugElement.queryAll(By.css('input'))[1];
                    calendar = fixture.debugElement.query(By.css(CSS_CLASS_CALENDAR));
                }));

                it('Should toggle the calendar with ALT + DOWN/UP ARROW key', fakeAsync(() => {
                    expect(dateRangeTwoInputs.toggleDirective.collapsed).toBeTruthy();

                    calendar.triggerEventHandler('keydown', altArrowDownKeyEvent);
                    tick();
                    fixture.detectChanges();
                    expect(dateRangeTwoInputs.toggleDirective.collapsed).toBeFalsy();

                    calendar.triggerEventHandler('keydown', altArrowUpKeyEvent);
                    tick();
                    fixture.detectChanges();
                    expect(dateRangeTwoInputs.toggleDirective.collapsed).toBeTruthy();
                }));

                it('Should close the calendar with ESC', fakeAsync(() => {
                    expect(dateRangeTwoInputs.toggleDirective.collapsed).toBeTruthy();

                    dateRangeTwoInputs.toggle();
                    tick();
                    fixture.detectChanges();

                    expect(dateRangeTwoInputs.toggleDirective.collapsed).toBeFalsy();

                    calendar.triggerEventHandler('keydown', escapeKeyEvent);
                    tick();
                    fixture.detectChanges();

                    expect(dateRangeTwoInputs.toggleDirective.collapsed).toBeTruthy();
                }));
            });
        });

        describe('Validation', () => {
            // Single Input (Default) Range Picker
            // Two Inputs Range Picker
            // TODO it('Should correctly implement interface methods', () => {
        });

        describe('Templating', () => {
        });

        describe('ARIA', () => {
            let singleInputElement: DebugElement;
            let dateRangeSingle: IgxDateRangeComponent;
            configureTestSuite();
            beforeAll(async(() => {
                TestBed.configureTestingModule({
                    declarations: [
                        DateRangeTestComponent,
                        DateRangeDefaultCustomLabelComponent
                    ],
                    imports: [IgxDateRangeModule, IgxDateTimeEditorModule, IgxInputGroupModule, FormsModule, NoopAnimationsModule]
                })
                    .compileComponents();
            }));
            beforeEach(fakeAsync(() => {
                fixture = TestBed.createComponent(DateRangeDefaultCustomLabelComponent);
                fixture.detectChanges();
            }));
            it('should render aria attributes properly', fakeAsync(() => {
                dateRangeSingle = fixture.componentInstance.dateRange;

                toggleBtn = fixture.debugElement.query(By.css('.' + CSS_CLASS_TOGGLE_BUTTON));
                calendarElement = fixture.debugElement.query(By.css('.' + CSS_CLASS_CALENDAR));
                singleInputElement = fixture.debugElement.query(By.css('.' + CSS_CLASS_INPUT));
                startDate = new Date(2020, 1, 1);
                endDate = new Date(2020, 1, 4);
                const expectedLabelID = dateRangeSingle.label.id;
                const expectedPlaceholder = singleInputElement.nativeElement.getAttribute('placeholder');

                expect(singleInputElement.nativeElement.getAttribute('role')).toEqual('combobox');
                expect(singleInputElement.nativeElement.getAttribute('placeholder')).toEqual(expectedPlaceholder);
                expect(singleInputElement.nativeElement.getAttribute('aria-haspopup')).toEqual('grid');
                expect(singleInputElement.nativeElement.getAttribute('aria-expanded')).toEqual('false');
                expect(toggleBtn.nativeElement.getAttribute('aria-hidden')).toEqual('true');
                expect(calendarElement.nativeElement.getAttribute('role')).toEqual('grid');
                expect(singleInputElement.nativeElement.getAttribute('aria-labelledby')).toEqual(expectedLabelID);

                dateRangeSingle.toggle();
                tick();
                fixture.detectChanges();

                calendarWrapper = fixture.debugElement.query(By.css('.' + CSS_CLASS_CALENDAR_WRAPPER));
                expect(singleInputElement.nativeElement.getAttribute('aria-expanded')).toEqual('true');
                expect(calendarWrapper.nativeElement.getAttribute('aria-hidden')).toEqual('false');

                dateRangeSingle.toggle();
                tick();
                fixture.detectChanges();

                expect(singleInputElement.nativeElement.getAttribute('aria-expanded')).toEqual('false');
                expect(toggleBtn.nativeElement.getAttribute('aria-hidden')).toEqual('true');

                dateRangeSingle.selectRange(startDate, endDate);
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
    public todayButtonText: string;
    public doneButtonText: string;
    public mode: InteractionMode;

    @ViewChild(IgxDateRangeComponent, { read: IgxDateRangeComponent, static: true })
    public dateRange: IgxDateRangeComponent;

    public ngOnInit(): void {
        this.todayButtonText = 'Today';
        this.doneButtonText = 'Done';
    }
}

@Component({
    selector: 'igx-date-range-two-inputs-test',
    template: `
    <igx-date-range [mode]="mode">
            <igx-date-start>
                <input igxInput igxDateTimeEditor type="text" [(ngModel)]="startDate" required>
            </igx-date-start>
            <igx-date-end>
                <input igxInput igxDateTimeEditor type="text" [(ngModel)]="endDate" required>
            </igx-date-end>
        </igx-date-range>
`
})
export class DateRangeTwoInputsTestComponent extends DateRangeTestComponent {
    startDate = new Date(2020, 1, 1);
    endDate = new Date(2020, 1, 4);
}

@Component({
    selector: 'igx-date-range-single-input-test',
    template: `
    <igx-input-group>
        <input #fullName igxInput type="text">
        <label for="fullName" igxLabel>Full Name</label>
        <igx-prefix>
            <igx-icon>person</igx-icon>
        </igx-prefix>
    </igx-input-group>
    <igx-date-range [mode]="mode" [doneButtonText]="doneButtonText">
        <igx-input-group>
            <input #singleInput igxInput igxDateRange type="text">
            <label igxLabel for="singleInput">Input Date</label>
            <igx-prefix>
                <igx-icon>today</igx-icon>
            </igx-prefix>
        </igx-input-group>
    </igx-date-range>
`
})
export class DateRangeSingleInputTestComponent extends DateRangeTestComponent {
}

@Component({
    selector: 'igx-date-range-single-input-label-test',
    template: `
    <igx-date-range [mode]="'dropdown'">
        <label igxLabel>Select Date</label>
    </igx-date-range>
    `
})
export class DateRangeDefaultCustomLabelComponent extends DateRangeTestComponent {
}

@Component({
    selector: 'igx-date-range-single-input-test',
    template: `
    <igx-date-range [mode]="mode">
    </igx-date-range>
    `
})
export class DateRangeDefaultComponent extends DateRangeTestComponent {
}
