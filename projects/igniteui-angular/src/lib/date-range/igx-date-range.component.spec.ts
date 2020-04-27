import { IgxDateRangeComponent } from './igx-date-range.component';
import { ComponentFixture, async, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { Component, OnInit, ViewChild, NgModule, DebugElement, ViewChildren, QueryList } from '@angular/core';
import { IgxInputGroupModule, IgxInputState} from '../input-group/index';
import { InteractionMode } from '../core/enums';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule, FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { IgxIconModule } from '../icon';
import { IgxCalendarModule } from '../calendar/index';
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
const CSS_CLASS_INPUT_GROUP_REQUIRED = 'igx-input-group--required';

function getDatesInView(dates: DebugElement[]): DebugElement[] {
    return dates.filter(d => {
        const date = d.childNodes[0].nativeNode.innerText;
        return date !== `${new Date().getDate()}` ? date : null;
    });
}

// tslint:disable: no-use-before-declare
describe('IgxRangeDatePicker', () => {
    let fixture: ComponentFixture<DateRangeTestComponent>;
    let endDate: Date;
    let startDate: Date;
    let toggleBtn: DebugElement;
    let datePickerElement: DebugElement;
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

    describe('Single Input', () => {
        let singleInputElement: DebugElement;
        configureTestSuite();
        beforeAll(async(() => {
            TestBed.configureTestingModule({
                declarations: [
                    DateRangeTestComponent,
                    DateRangeSingleInputTestComponent
                ],
                imports: [IgxDateRangeModule, IgxDateTimeEditorModule, IgxInputGroupModule, FormsModule, NoopAnimationsModule]
            })
                .compileComponents();
        }));
        beforeEach(fakeAsync(() => {
            fixture = TestBed.createComponent(DateRangeSingleInputTestComponent);
            fixture.detectChanges();
        }));

        /* The single input's text looks like this -> START_DATE - END_DATE */

        it('Should set the first part of the input properly on first date selection', () => {
            // TODO
            // it should set the START_DATE only
        });

        it('Should the second part of the input properly on last date selection', () => {
            // TODO
            // it should set the END_DATE only
        });

        it('Should assign the proper dates to the input when selecting a range from the calendar', () => {
            // TODO
        });

        it('Should do a range selection if a date is selected and "Today" is pressed', () => {
            // TODO
        });
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

    describe('Two Inputs', () => {
        let startInput: DebugElement;
        let endInput: DebugElement;
        let calendarDays: DebugElement[];
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

        function verifyDateRange() {
            expect(dateRange.value.start).toEqual(startDate);
            expect(dateRange.value.end).toEqual(endDate);
            expect(startInput.nativeElement.value).toEqual(formatFullDate(startDate));
            expect(endInput.nativeElement.value).toEqual(formatFullDate(endDate));
        }

        it('should assign start and end values correctly when selecting dates from the calendar', () => {
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

        it('should assign start and end values correctly when selecting dates in reversed order', () => {
            fixture.componentInstance.mode = InteractionMode.DropDown;
            fixture.detectChanges();

            const dayRange = 10;
            const today = new Date();
            startDate = new Date(today.getFullYear(), today.getMonth(), 10, 0, 0, 0);
            endDate = new Date(startDate);
            endDate.setDate(endDate.getDate() + dayRange);
            selectDateRangeFromCalendar(startDate.getDate(), dayRange);
            verifyDateRange();
        });

        it('should apply selection to start and end date when single date is selected', () => {
            fixture.componentInstance.mode = InteractionMode.DropDown;
            fixture.detectChanges();

            const today = new Date();
            startDate = endDate = new Date(today.getFullYear(), today.getMonth(), 4, 0, 0, 0);

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

        it('should assign start and end values correctly when selecting through API', () => {
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

    describe('Test API - properties, methods and events', () => {
        xit('Should select today properly', (done) => {
            fixture = TestBed.createComponent(DateRangeTwoInputsTestComponent);
            fixture.componentInstance.mode = InteractionMode.DropDown;
            fixture.detectChanges();

           // fixture.componentInstance.dateRange.selectToday();
            fixture.whenStable().then(() => {
                fixture.detectChanges();
                // expect((fixture.componentInstance.dateRange.value as Date[]).length).toBe(1);
                done();
            });
        });

        it('Should assign start and end input values correctly when selecting dates from the API', fakeAsync(() => {
            // TODO
        }));

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
            //UIInteractions.clickElement(startInput.nativeElement);
            tick(100);
            fixture.detectChanges();
            expect(document.activeElement.textContent.trim()).toMatch(new Date().getDate().toString());
        }));

        xit('should move focus to the calendar on open in dialog mode', fakeAsync(() => {
            fixture = TestBed.createComponent(DateRangeTwoInputsTestComponent);
            fixture.componentInstance.mode = InteractionMode.Dialog;
            fixture.detectChanges();

            const startInput = fixture.debugElement.queryAll(By.css('.igx-input-group'))[1];
            //UIInteractions.clickElement(startInput.nativeElement);
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
            let singleInputElement: DebugElement;
            let dateRangeSingle: IgxDateRangeComponent;

            beforeEach(fakeAsync(() => {
                fixture = TestBed.createComponent(DateRangeDefaultComponent);
                dateRangeSingle = fixture.componentInstance.dateRange;
                fixture.detectChanges();
                singleInputElement = fixture.debugElement.query(By.css('.' + CSS_CLASS_INPUT));
            }));
            xit('Should toggle the calendar with ALT + DOWN/UP ARROW key', fakeAsync(() => {
                expect(dateRangeSingle.toggleDirective.collapsed).toBeTruthy();
                // alternatively expect(dateRangeSingle.collapsed).toBeTruthy(); // collapsed needs implementation
                singleInputElement.triggerEventHandler('keydown', altArrowDownKeyEvent);
                tick();
                fixture.detectChanges();
                expect(dateRangeSingle.toggleDirective.collapsed).toBeFalsy();
                // alternatively expect(dateRangeSingle.collapsed).toBeFalsy(); // collapsed needs implementation

                singleInputElement.triggerEventHandler('keydown', altArrowUpKeyEvent);
                tick();
                fixture.detectChanges();
                expect(dateRangeSingle.toggleDirective.collapsed).toBeTruthy();
                // alternatively expect(dateRangeSingle.collapsed).toBeTruthy(); // collapsed needs implementation
                expect(singleInputElement).toBe(document.activeElement);
            }));

            xit('Should close the calendar with ESC', fakeAsync(() => {
                expect(dateRangeSingle.toggleDirective.collapsed).toBeTruthy();
                // alternatively expect(dateRangeSingle.collapsed).toBeTruthy();
                dateRangeSingle.toggle();
                tick();
                fixture.detectChanges();

                expect(dateRangeSingle.toggleDirective.collapsed).toBeFalsy();
                // alternatively expect(dateRangeSingle.collapsed).toBeFalsy();

                singleInputElement.triggerEventHandler('keydown', escapeKeyEvent);
                tick();
                fixture.detectChanges();

                expect(dateRangeSingle.toggleDirective.collapsed).toBeTruthy();
                // alternatively expect(dateRangeSingle.collapsed).toBeTruthy();

                // should focus input on close
                expect(singleInputElement).toBe(document.activeElement);
            }));
    });
    describe('Keyboard Navigation Two Inputs', () => {
        let firstInputElement: DebugElement;
        let secondInputElement: DebugElement;
        let dateRangeTwoInputs: IgxDateRangeComponent;

        beforeEach(fakeAsync(() => {
            fixture = TestBed.createComponent(DateRangeTwoInputsTestComponent);
            dateRangeTwoInputs = fixture.componentInstance.dateRange;
            fixture.detectChanges();
            firstInputElement = fixture.debugElement.query(By.css('.' + CSS_CLASS_INPUT))[0];
            secondInputElement = fixture.debugElement.query(By.css('.' + CSS_CLASS_INPUT))[1];
        }));

        xit('Should toggle the calendar with ALT + DOWN/UP ARROW key', fakeAsync(() => {
            expect(dateRangeTwoInputs.toggleDirective.collapsed).toBeTruthy();
            // alternatively expect(dateRangeTwoInputs.collapsed).toBeTruthy(); // collapsed needs implementation
            firstInputElement.triggerEventHandler('keydown', altArrowDownKeyEvent);
            tick();
            fixture.detectChanges();
            expect(dateRangeTwoInputs.toggleDirective.collapsed).toBeFalsy();
            // alternatively expect(dateRangeTwoInputs.collapsed).toBeFalsy(); // collapsed needs implementation

            firstInputElement.triggerEventHandler('keydown', altArrowUpKeyEvent);
            tick();
            fixture.detectChanges();
            expect(dateRangeTwoInputs.toggleDirective.collapsed).toBeTruthy();
            // alternatively expect(dateRangeTwoInputs.collapsed).toBeTruthy(); // collapsed needs implementation

            expect(firstInputElement).toBe(document.activeElement);
        }));

        xit('Should close the calendar with ESC', fakeAsync(() => {
            expect(dateRangeTwoInputs.toggleDirective.collapsed).toBeTruthy();

            dateRangeTwoInputs.toggle();
            tick();
            fixture.detectChanges();

            expect(dateRangeTwoInputs.toggleDirective.collapsed).toBeFalsy();
            // alternatively expect(dateRangeTwoInputs.collapsed).toBeFalsy();

            firstInputElement.triggerEventHandler('keydown', escapeKeyEvent);
            tick();
            fixture.detectChanges();

            expect(firstInputElement).toBe(document.activeElement);
        }));
    });
    });

    describe('Validation', () => {
        // Single Input (Default) Range Picker
        // Two Inputs Range Picker
        let firstInputElement: DebugElement;
        let secondInputElement: DebugElement;
        let inputGroupWithRequiredAsteriskSI: DebugElement;
        let inputGroupWithRequiredAsteriskTI: DebugElement;
        let dateRangeSingle: IgxDateRangeComponent;
        let dateRangeTwoInputs: IgxDateRangeComponent;
        let fix: ComponentFixture<DateRangetReactiveFormComponent>;
        describe('Should properly initialize when used as a reactive form control', () => {
            beforeAll(async(() => {
                TestBed.configureTestingModule({
                    declarations: [
                        DateRangetReactiveFormComponent
                    ],
                    imports: [IgxDateRangeModule, IgxDateTimeEditorModule, IgxInputGroupModule, NoopAnimationsModule,
                        FormsModule, FormGroup, FormBuilder, Validators, FormControl ]
                })
                .compileComponents();
                beforeEach(fakeAsync(() => {
                    fix = TestBed.createComponent(DateRangetReactiveFormComponent);
                    dateRangeSingle = fix.componentInstance.singleInputDateRange;
                    dateRangeTwoInputs = fix.componentInstance.twoInputsDateRange;
                    fix.detectChanges();
                    // firstInputElement = fix.debugElement.query(By.css('.' + CSS_CLASS_INPUT))[0];
                    // secondInputElement = fix.debugElement.query(By.css('.' + CSS_CLASS_INPUT))[1];
                    inputGroupWithRequiredAsteriskSI = fix.debugElement.query(By.css('.' + CSS_CLASS_INPUT_GROUP_REQUIRED))[0];
                    inputGroupWithRequiredAsteriskTI = fix.debugElement.query(By.css('.' + CSS_CLASS_INPUT_GROUP_REQUIRED))[1];
                }));
            }));
            it('Without initial validators - add validators later', fakeAsync(() => {
                // // test two inputs date range
                // fix.detectChanges();
                // const formGroup: FormGroup = fix.componentInstance.twoInputForm;
                // fix.componentInstance.removeValidators(formGroup);
                // const rangeFormReferenceSI = fix.componentInstance.twoInputForm.controls.dateRange[0];
                // const rangeFormReferenceTI = fix.componentInstance.twoInputForm.controls.dateRange[1];
                // expect(rangeFormReferenceTI).toBeDefined();
                // expect(dateRangeTwoInputs).toBeDefined();
                // expect(dateRangeTwoInputs.value).toBeUndefined();
                // // expect(dateRangeTwoInputs.value).toEqual('');
                // expect(inputGroupWithRequiredAsteriskTI).toBeNull();
                // expect(dateRangeTwoInputs.projectedInputs[0].valid).toEqual(IgxInputState.INITIAL);

                // dateRangeTwoInputs.onBlur();

                // expect(dateRangeTwoInputs.input.valid).toEqual(IgxInputState.INITIAL);

                // dateRangeTwoInputs.selectItem(dateRangeTwoInputs.items[4]);

                // expect(dateRangeTwoInputs.input.valid).toEqual(IgxInputState.INITIAL);

                // document.documentElement.dispatchEvent(new Event('click'));
                // expect(dateRangeTwoInputs.collapsed).toEqual(true);

                // expect(dateRangeTwoInputs.input.valid).toEqual(IgxInputState.INITIAL);

                // dateRangeTwoInputs.onBlur();

                // expect(dateRangeTwoInputs.input.valid).toEqual(IgxInputState.INITIAL);

                // fix.componentInstance.addValidators(formGroup);
                // fix.detectChanges();
                // inputGroupWithRequiredAsteriskTI = fix.debugElement.query(By.css('.' + CSS_CLASS_INPUT_GROUP_REQUIRED));
                // expect(inputGroupWithRequiredAsteriskTI).toBeDefined();


                // test single input date range

            }));
            it('With initial validators set', fakeAsync(() => {

            }));
        });
    });

    describe('Templating', () => {
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

    @ViewChildren(IgxDateRangeComponent)
    public ranges: QueryList<IgxDateRangeComponent>;

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
    <igx-date-range [mode]="'dropdown'">
    </igx-date-range>
    `
})
export class DateRangeDefaultComponent extends DateRangeTestComponent {
}

@Component({
    template: `
    <p>Single Input Basic Date Range</p>
    <form #form="ngForm" (ngSubmit)="onSubmit()">
        <igx-date-range #singleInputDateRange [(ngModel)]="range" [required]="isRequired" [mode]="'dropdown'" name="basicDateRange">
            <label igxLabel>Label</label>
        </igx-date-range>
        <button type="submit" [disabled]="!form.valid">Submit</button>
    </form>
    `
})
export class DateRangeSingleTemplateFormComponent {
    public isRequired = true;
    public range = { start: new Date(), end: new Date(new Date().setDate(new Date().getDate() + 5)) };
    public onSubmit() { }
}

@Component({
    template: `
    <p>Single Input Basic Date Range</p>
    <form [formGroup]="singleInputForm" (ngSubmit)="onSubmit()">
        <igx-date-range #singleInputDateRange [mode]="'dropdown'" formControlName="basicDateRange">
            <label igxLabel>Label</label>
        </igx-date-range>
        <button type="submit" [disabled]="!form.valid">Submit</button>
    </form>

    <p>Two Inputs Date Range</p>
    <form [formGroup]="twoInputForm" (ngSubmit)="onSubmit()">
        <igx-date-range #twoInputsDateRange [mode]="'dropdown'" formControlName="dateRange">
            <igx-date-start>
                <igx-label igxLabel>First</igx-label>
                <input igxInput igxDateTimeEditor type="text" required>
            </igx-date-start>
            <igx-date-end>
                <igx-label igxLabel>Second</igx-label>
                <input igxInput igxDateTimeEditor type="text" required>
            </igx-date-end>
        </igx-date-range>
    </form>
        `
})
export class DateRangetReactiveFormComponent {
    @ViewChild('singleInputDateRange')
    public singleInputDateRange: IgxDateRangeComponent;

    @ViewChild('twoInputsDateRange')
    public twoInputsDateRange: IgxDateRangeComponent;

    // public date: Date;
    public range = { start: new Date(), end: new Date(new Date().setDate(new Date().getDate() + 5)) };
    public newRange = { start: new Date(), end: new Date(new Date().setDate(new Date().getDate() + 5)) };
    public twoInputForm: FormGroup;
    public singleInputForm: FormGroup;

    constructor(private fb: FormBuilder) {
        this.singleInputForm = this.fb.group({
            basicDateRange: ['', Validators.required]
        });
        this.twoInputForm = this.fb.group({
            dateRange: ['', Validators.required]
        });
    }

    public validationType = {
        'basicDateRange': [Validators.required],
        'dateRange': [Validators.required]
    };

    public addValidators(form: FormGroup) {
        // tslint:disable-next-line:forin
        for (const key in form.controls) {
            form.get(key).setValidators(this.validationType[key]);
            form.get(key).updateValueAndValidity();
        }
    }

    public removeValidators(form: FormGroup) {
        // tslint:disable-next-line:forin
        for (const key in form.controls) {
            form.get(key).clearValidators();
            form.get(key).updateValueAndValidity();
        }
    }

    public onSubmit() { }
}
@NgModule({
    declarations: [
        DateRangeSingleInputTestComponent,
        DateRangeDefaultCustomLabelComponent,
        DateRangeTwoInputsTestComponent,
        DateRangeTestComponent,
        DateRangetReactiveFormComponent,
        DateRangeSingleTemplateFormComponent
    ],
    imports: [
        IgxDateRangeModule,
        NoopAnimationsModule,
        IgxIconModule,
        IgxCalendarModule,
        IgxButtonModule,
        FormsModule,
        IgxInputGroupModule
    ],
    exports: [
        DateRangeSingleInputTestComponent,
        DateRangeDefaultCustomLabelComponent,
        DateRangeTwoInputsTestComponent,
        DateRangeTestComponent,
        DateRangetReactiveFormComponent,
        DateRangeSingleTemplateFormComponent
    ]
})
export class DateRangeTestingModule { }
