import { IgxDateRangeComponent } from './igx-date-range.component';
import { ComponentFixture, async, TestBed } from '@angular/core/testing';
import { Component, OnInit, Optional } from '@angular/core';
import { IgxInputGroupModule } from '../input-group/index';
import {
    IgxDateRangeModule, IgxDateRangeStartDirective, IgxDateRangeEndDirective,
    IgxDateRangeDirective, IgxDateRangeBaseDirective
} from './index';
import { InteractionMode } from '../core/enums';

describe('IgxDateRangeComponent', () => {
    let component: IgxDateRangeComponent;
    let fixture: ComponentFixture<IgxDateRangeComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [
                IgxDateRangeComponent,
                IgxDateRangeBaseDirective,
                IgxDateRangeStartDirective,
                IgxDateRangeEndDirective,
                IgxDateRangeDirective
            ],
            imports: [
                IgxInputGroupModule,
                IgxDateRangeModule
            ]
        })
            .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(IgxDateRangeComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    describe('IgxDateRange - Focus', () => {
        it('Should move focus to the calendar on open', () => {
            // TODO
        });

        it('Should not change focus when the calendar is closed', () => {
            // TODO
        });

        it('Should move the focus to start input when "Today" is clicked and there isn\'t a value in start input', () => {
            // TODO
        });

        it('Should move the focus to end input when "Today" is clicked and there is a value in start input', () => {
            // TODO
        });

        it('Should move the focus to start input on close', () => {
            // TODO
        });
    });

    describe('IgxDateRange - API', () => {
        it('Should select today properly', () => {
            // TODO
        });

        it('Should assign start and end input values correctly when selecting dates from the API', () => {
            // TODO
        });

        it('Should close the calendar properly with the "Done" button', () => {
            // TODO
            // dialog mode
            // should not lose selection
        });

        it('Should be able to change the text of its two buttons', () => {
            // TODO
            // dialog mode
        });

        it('Should show the "Done" button only in dialog mode', () => {
            // TODO
        });
    });

    describe('IgxDateRange - Keyboard Navigation', () => {
        it('Should open the calendar on mouse click', () => {
            // TODO
        });

        it('Should open the calendar with ALT + UP ARROW key', () => {
            // TODO
        });

        it('Should close the calendar with ALT + DOWN ARROW key', () => {
            // TODO
        });

        it('Should close the calendar with ESC key', () => {
            // TODO
        });
    });

    describe('IgxDateRange - Two Inputs', () => {
        it('Should update the start input on first date selection', () => {
            // TODO
        });

        it('Should update the end input on last date selection', () => {
            // TODO
        });

        it('Should assign start and end input values correctly when selecting dates from the calendar', () => {
            // TODO
        });

        it('Should clear end input if start and/or end input have values and a new selection is made', () => {
            // TODO
        });

        it('Should do a range selection if a date is selected and "Today" is pressed', () => {
            // TODO
        });

        it('Should update the start and end inputs properly when "Today" is clicked', () => {
            // TODO
        });
    });

    describe('IgxDateRange - Single Input', () => {
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

        it('Should the input properly when "Today" is clicked', () => {
            // TODO
        });
    });
});

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
export class DateRangeSingleInputTestComponent implements OnInit {
    public todayButtonText: string;
    public doneButtonText: string;

    constructor(public mode?: InteractionMode) { }

    public ngOnInit(): void {
        this.todayButtonText = 'Today';
        this.doneButtonText = 'Done';
    }
}

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
export class DateRangeTwoInputsTestComponent implements OnInit {
    public todayButtonText: string;
    public doneButtonText: string;

    constructor(public mode?: InteractionMode) { }

    public ngOnInit(): void {
        this.todayButtonText = 'Today';
        this.doneButtonText = 'Done';
    }
}
