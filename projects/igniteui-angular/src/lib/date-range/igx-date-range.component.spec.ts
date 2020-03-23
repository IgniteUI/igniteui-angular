import { IgxDateRangeComponent } from './igx-date-range.component';
import { ComponentFixture, async, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { Component, OnInit, ViewChild, NgModule, DebugElement } from '@angular/core';
import { IgxInputGroupModule } from '../input-group/index';
import { InteractionMode } from '../core/enums';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IgxIconModule } from '../icon';
import { IgxCalendarModule } from '../calendar/index';
import { IgxButtonModule } from '../directives/button/button.directive';
import { IgxDateRangeModule } from './igx-date-range.module';
import { By } from '@angular/platform-browser';
import { UIInteractions } from '../test-utils/ui-interactions.spec';

function getDatesInView(dates: DebugElement[]): DebugElement[] {
    return dates.filter(d => {
        const date = d.childNodes[0].nativeNode.innerText;
        return date !== `${new Date().getDate()}` ? date : null;
    });
}

// tslint:disable: no-use-before-declare
xdescribe('IgxDateRange', () => {
    let singleInputRange: DateRangeTwoInputsTestComponent;
    let twoInputsRange: DateRangeTwoInputsTestComponent;
    let fixture: ComponentFixture<DateRangeTestComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            imports: [DateRangeTestingModule]
        }).compileComponents();
    }));

    describe('UI Interactions', () => {
        it('Should select today properly', fakeAsync(() => {
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

            expect((fixture.componentInstance.dateRange.value as Date[]).length).toBe(1);
        }));

        it('Should select a range when pressing "today" if a start date is selected', fakeAsync(() => {
            fixture = TestBed.createComponent(DateRangeTwoInputsTestComponent);
            fixture.componentInstance.mode = InteractionMode.DropDown;
            fixture.detectChanges();

            fixture.componentInstance.dateRange.open();
            tick();
            fixture.detectChanges();

            const button = fixture.debugElement.query(By.css('.igx-button--flat'));
            const dates = getDatesInView(fixture.debugElement.queryAll(By.css('.igx-calendar__date')));

            UIInteractions.clickElement(dates[0].nativeElement);
            tick();
            fixture.detectChanges();
            expect((fixture.componentInstance.dateRange.value as Date[]).length).toBe(1);

            UIInteractions.clickElement(button);
            tick();
            fixture.detectChanges();
            expect((fixture.componentInstance.dateRange.value as Date[]).length).toBeGreaterThan(1);
        }));

        it('Should open the calendar on mouse click', fakeAsync(() => {
            fixture = TestBed.createComponent(DateRangeTwoInputsTestComponent);
            fixture.componentInstance.mode = InteractionMode.DropDown;
            fixture.detectChanges();

            spyOn(fixture.componentInstance.dateRange.onOpened, 'emit');

            const startInput = fixture.debugElement.queryAll(By.css('.igx-input-group'))[1];
            UIInteractions.clickElement(startInput.nativeElement);
            tick();
            fixture.detectChanges();

            expect(fixture.componentInstance.dateRange.onOpened.emit).toHaveBeenCalledTimes(1);
        }));

        it('Should move focus to the calendar on open in dropdown mode', fakeAsync(() => {
            fixture = TestBed.createComponent(DateRangeTwoInputsTestComponent);
            fixture.componentInstance.mode = InteractionMode.DropDown;
            fixture.detectChanges();

            const startInput = fixture.debugElement.queryAll(By.css('.igx-input-group'))[1];
            UIInteractions.clickElement(startInput.nativeElement);
            tick(100);
            fixture.detectChanges();
            expect(document.activeElement.textContent.trim()).toMatch(new Date().getDate().toString());
        }));

        it('Should move focus to the calendar on open in dialog mode', fakeAsync(() => {
            fixture = TestBed.createComponent(DateRangeTwoInputsTestComponent);
            fixture.componentInstance.mode = InteractionMode.Dialog;
            fixture.detectChanges();

            const startInput = fixture.debugElement.queryAll(By.css('.igx-input-group'))[1];
            UIInteractions.clickElement(startInput.nativeElement);
            tick(100);
            fixture.detectChanges();
            expect(document.activeElement.textContent.trim()).toMatch(new Date().getDate().toString());
        }));

        it('Should move the focus to start input on close (date range with two inputs)', fakeAsync(() => {
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

        it('Should move the focus to the single input on close', fakeAsync(() => {
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

    describe('API', () => {
        it('Should select today properly', (done) => {
            fixture = TestBed.createComponent(DateRangeTwoInputsTestComponent);
            fixture.componentInstance.mode = InteractionMode.DropDown;
            fixture.detectChanges();

            fixture.componentInstance.dateRange.selectToday();
            fixture.whenStable().then(() => {
                fixture.detectChanges();
                expect((fixture.componentInstance.dateRange.value as Date[]).length).toBe(1);
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

    describe('Two Inputs', () => {
        it('Should update the start input on first date selection', () => {
            // TODO
        });

        it('Should update the end input on last date selection', () => {
            // TODO
        });

        it('Should assign start and end input values correctly when selecting dates from the calendar', () => {
            // TODO
        });

        it('Should clear end input if start and end input have values and a new selection is made', () => {
            // TODO
        });

        it('Should do a range selection if a date is selected and "Today" is pressed', () => {
            // TODO
        });
    });

    describe('Single Input', () => {
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
    selector: 'igx-date-range-single-input-test',
    template: `
    <igx-input-group>
        <input #fullName igxInput type="text">
        <label for="fullName" igxLabel>Full Name</label>
        <igx-prefix>
            <igx-icon>person</igx-icon>
        </igx-prefix>
    </igx-input-group>
    <igx-date-range [todayButtonText]="todayButtonText" [doneButtonText]="doneButtonText" [mode]="mode">
        <igx-input-group>
            <input #startDate igxDateRangeStart igxInput type="text">
            <label for="startDate" igxLabel>Check-in Date</label>
            <igx-prefix>
                <igx-icon>today</igx-icon>
            </igx-prefix>
        </igx-input-group>
        <igx-input-group>
            <input #endDate igxDateRangeEnd igxInput type="text">
            <label for="endDate" igxLabel>Check-out Date</label>
            <igx-prefix>
                <igx-icon>today</igx-icon>
            </igx-prefix>
        </igx-input-group>
    </igx-date-range>
`
})
export class DateRangeTwoInputsTestComponent extends DateRangeTestComponent { }

@Component({
    selector: 'igx-date-range-two-inputs-test',
    template: `
    <igx-input-group>
        <input #fullName igxInput type="text">
        <label for="fullName" igxLabel>Full Name</label>
        <igx-prefix>
            <igx-icon>person</igx-icon>
        </igx-prefix>
    </igx-input-group>
    <igx-date-range [mode]="mode" [todayButtonText]="todayButtonText" [doneButtonText]="doneButtonText">
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
export class DateRangeSingleInputTestComponent extends DateRangeTestComponent { }

@NgModule({
    declarations: [
        DateRangeSingleInputTestComponent,
        DateRangeTwoInputsTestComponent,
        DateRangeTestComponent
    ],
    imports: [
        IgxDateRangeModule,
        NoopAnimationsModule,
        IgxInputGroupModule,
        ReactiveFormsModule,
        IgxIconModule,
        IgxCalendarModule,
        IgxButtonModule,
        IgxInputGroupModule,
        FormsModule
    ],
    exports: [
        DateRangeSingleInputTestComponent,
        DateRangeTwoInputsTestComponent,
        DateRangeTestComponent
    ]
})
export class DateRangeTestingModule { }
