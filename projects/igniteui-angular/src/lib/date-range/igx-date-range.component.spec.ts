import { IgxDateRangeComponent } from './igx-date-range.component';
import { ComponentFixture, async, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { Component, OnInit, ViewChild, NgModule, DebugElement } from '@angular/core';
import { IgxInputGroupModule} from '../input-group/index';
import { InteractionMode } from '../core/enums';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
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
const CSS_CLASS_CALENDAR_WRAPPER = 'igx-toggle'; // TODO Implementation -> maybe add class for the div container

function getDatesInView(dates: DebugElement[]): DebugElement[] {
    return dates.filter(d => {
        const date = d.childNodes[0].nativeNode.innerText;
        return date !== `${new Date().getDate()}` ? date : null;
    });
}

// tslint:disable: no-use-before-declare
describe('IgxRangeDatePicker', () => {
    let fixture: ComponentFixture<any>;
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
        beforeEach(fakeAsync(() => {
            fixture = TestBed.createComponent(DateRangeSingleInputTestComponent);
            fixture.detectChanges();
            tick();
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

        it('should render aria attributes properly', fakeAsync(() => {
            fixture = TestBed.createComponent(DateRangeSingleInputTestARIAComponent);
            fixture.detectChanges();
            const dateRangeSingle = fixture.componentInstance.dateRange;
            fixture.detectChanges();

            const singleInputElement = fixture.debugElement.query(By.css('.' + CSS_CLASS_INPUT));
            calendarElement = fixture.debugElement.query(By.css('.' + CSS_CLASS_CALENDAR));
            calendarWrapper = fixture.debugElement.query(By.css('.' + CSS_CLASS_CALENDAR_WRAPPER));
            const expectedLabelID = dateRangeSingle.label.id;
            const toggleBtn = fixture.debugElement.query(By.css('.' + CSS_CLASS_TOGGLE_BUTTON));

            expect(singleInputElement.nativeElement.getAttribute('role')).toEqual('combobox');
            expect(singleInputElement.nativeElement.getAttribute('aria-haspopup')).toEqual('grid');
            expect(singleInputElement.nativeElement.getAttribute('aria-expanded')).toEqual('false');
            expect(toggleBtn.nativeElement.getAttribute('aria-hidden')).toEqual('true');
            expect(calendarElement.nativeElement.getAttribute('role')).toEqual('grid');
            expect(singleInputElement.nativeElement.getAttribute('aria-labelledby')).toEqual(expectedLabelID);
            dateRangeSingle.toggle();
            tick();
            fixture.detectChanges();

            expect(singleInputElement.nativeElement.getAttribute('aria-expanded')).toEqual('true');
            expect(calendarWrapper.nativeElement.getAttribute('aria-hidden')).toEqual('false');

            dateRangeSingle.toggle();
            tick();
            fixture.detectChanges();
            expect(singleInputElement.nativeElement.getAttribute('aria-expanded')).toEqual('false');
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
            calendarDays[startDateDayElIndex].triggerEventHandler('click', UIInteractions.clickEvent);
            if (dayRange !== 0) {
                calendarDays[endDateDayElIndex].triggerEventHandler('click', UIInteractions.clickEvent);
            }
            dateRange.close();
            fixture.detectChanges();
        }

        function verifyDateRange(startDate: Date, endDate: Date) {
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
            let startDate = new Date(today.getFullYear(), today.getMonth(), 10, 0, 0, 0);
            let endDate = new Date(startDate);
            endDate.setDate(endDate.getDate() + dayRange);
            selectDateRangeFromCalendar(startDate.getDate(), dayRange);
            verifyDateRange(startDate, endDate);

            dayRange = 13;
            startDate = new Date(today.getFullYear(), today.getMonth(), 6, 0, 0, 0);
            endDate = new Date(startDate);
            endDate.setDate(endDate.getDate() + dayRange);
            selectDateRangeFromCalendar(startDate.getDate(), dayRange);
            verifyDateRange(startDate, endDate);
        });

        it('should assign start and end values correctly when selecting dates in reversed order', () => {
            fixture.componentInstance.mode = InteractionMode.DropDown;
            fixture.detectChanges();

            const dayRange = 10;
            const today = new Date();
            const startDate = new Date(today.getFullYear(), today.getMonth(), 10, 0, 0, 0);
            const endDate = new Date(startDate);
            endDate.setDate(endDate.getDate() + dayRange);
            selectDateRangeFromCalendar(startDate.getDate(), dayRange);
            verifyDateRange(startDate, endDate);
        });

        it('should apply selection to start and end date when single date is selected', () => {
            fixture.componentInstance.mode = InteractionMode.DropDown;
            fixture.detectChanges();

            const today = new Date();
            const date = new Date(today.getFullYear(), today.getMonth(), 4, 0, 0, 0);

            selectDateRangeFromCalendar(date.getDate(), 0);
            verifyDateRange(date, date);
        });

        it('should update inputs correctly on first and last date selection', () => {
            const today = new Date();
            const startDate = new Date(today.getFullYear(), today.getMonth(), 1, 0, 0, 0);
            const endDate = new Date(today.getFullYear(), today.getMonth() + 2, 0, 0, 0, 0);
            const differenceMs = Math.abs(startDate.getTime() - endDate.getTime());
            const dayRange = Math.round(differenceMs / ONE_DAY);
            selectDateRangeFromCalendar(startDate.getDate(), dayRange);
            verifyDateRange(startDate, endDate);
        });

        it('should assign start and end values correctly when selecting through API', () => {
            let startDate = new Date(2020, 10, 8, 0, 0, 0);
            let endDate = new Date(2020, 11, 8, 0, 0, 0);
            dateRange.selectRange(startDate, endDate);
            fixture.detectChanges();
            verifyDateRange(startDate, endDate);

            startDate = new Date(2003, 5, 18, 0, 0, 0);
            endDate = new Date(2003, 8, 18, 0, 0, 0);
            dateRange.selectRange(startDate, endDate);
            fixture.detectChanges();
            verifyDateRange(startDate, endDate);
        });
    });

    describe('Test API - properties, methods and events', () => {
        it('Should select today properly', (done) => {
            fixture = TestBed.createComponent(DateRangeTwoInputsTestComponent);
            fixture.componentInstance.mode = InteractionMode.DropDown;
            fixture.detectChanges();

            fixture.componentInstance.dateRange.selectToday();
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

        it('should move focus to the calendar on open in dropdown mode', fakeAsync(() => {
            fixture = TestBed.createComponent(DateRangeTwoInputsTestComponent);
            fixture.componentInstance.mode = InteractionMode.DropDown;
            fixture.detectChanges();

            const startInput = fixture.debugElement.queryAll(By.css('.igx-input-group'))[1];
            UIInteractions.clickElement(startInput.nativeElement);
            tick(100);
            fixture.detectChanges();
            expect(document.activeElement.textContent.trim()).toMatch(new Date().getDate().toString());
        }));

        it('should move focus to the calendar on open in dialog mode', fakeAsync(() => {
            fixture = TestBed.createComponent(DateRangeTwoInputsTestComponent);
            fixture.componentInstance.mode = InteractionMode.Dialog;
            fixture.detectChanges();

            const startInput = fixture.debugElement.queryAll(By.css('.igx-input-group'))[1];
            UIInteractions.clickElement(startInput.nativeElement);
            tick(100);
            fixture.detectChanges();
            expect(document.activeElement.textContent.trim()).toMatch(new Date().getDate().toString());
        }));

        it('should move the focus to start input on close (date range with two inputs)', fakeAsync(() => {
            fixture = TestBed.createComponent(DateRangeTwoInputsTestComponent);
            fixture.componentInstance.mode = InteractionMode.DropDown;
            fixture.detectChanges();

            fixture.componentInstance.dateRange.open();
            tick();
            fixture.detectChanges();

            const button = fixture.debugElement.query(By.css('.igx-button--flat'));
            UIInteractions.clickElement(button);
            tick();
            fixture.detectChanges();

            fixture.componentInstance.dateRange.close();
            tick();
            fixture.detectChanges();

            expect(document.activeElement).toHaveClass('igx-input-group__input');
        }));

        it('should move the focus to the single input on close', fakeAsync(() => {
            fixture = TestBed.createComponent(DateRangeSingleInputTestComponent);
            fixture.componentInstance.mode = InteractionMode.DropDown;
            fixture.detectChanges();

            fixture.componentInstance.dateRange.open();
            tick();
            fixture.detectChanges();

            const button = fixture.debugElement.query(By.css('.igx-button--flat'));
            UIInteractions.clickElement(button);
            tick();
            fixture.detectChanges();

            fixture.componentInstance.dateRange.close();
            tick();
            fixture.detectChanges();

            expect(document.activeElement).toHaveClass('igx-input-group__input');
        }));
    });

    describe('Keyboard Navigation', () => {
        it('Should open the calendar with ALT + DOWN ARROW key', () => {
            // TODO
        });

        it('Should close the calendar with ALT + UP ARROW key', () => {
            // TODO
            // should focus start input | single input
        });

        it('Should close the calendar with ESC', () => {
            // TODO
            // should focus start input | single input
        });
    });

    describe('Validation', () => {

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
    selector: 'igx-date-range-single-input-aria-test',
    template: `
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
export class DateRangeSingleInputTestARIAComponent extends DateRangeTestComponent {
}

@NgModule({
    declarations: [
        DateRangeSingleInputTestComponent,
        DateRangeSingleInputTestARIAComponent,
        DateRangeTwoInputsTestComponent,
        DateRangeTestComponent
    ],
    imports: [
        IgxDateRangeModule,
        NoopAnimationsModule,
        ReactiveFormsModule,
        IgxIconModule,
        IgxCalendarModule,
        IgxButtonModule,
        IgxInputGroupModule,
        FormsModule
    ],
    exports: [
        DateRangeSingleInputTestComponent,
        DateRangeSingleInputTestARIAComponent,
        DateRangeTwoInputsTestComponent,
        DateRangeTestComponent
    ]
})
export class DateRangeTestingModule { }
