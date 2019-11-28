import { Component, ViewChild, OnInit } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { IgxDateRangeComponent } from 'igniteui-angular';

@Component({
    selector: 'app-date-range',
    templateUrl: './date-range.sample.html',
    styleUrls: ['./date-range.sample.scss']
})
export class DateRangeSampleComponent implements OnInit {
    @ViewChild('defDateRange')
    public defDateRange: IgxDateRangeComponent;

    @ViewChild('singleInputDateRange')
    public singleInputDateRange: IgxDateRangeComponent;

    public content: any;

    public date: Date;
    public twoInputForm: FormGroup;
    public singleInputForm: FormGroup;

    private dayFormatter = new Intl.DateTimeFormat('en', { weekday: 'long' });
    private monthFormatter = new Intl.DateTimeFormat('en', { month: 'long' });

    constructor(private fb: FormBuilder) { }

    public ngOnInit(): void {
        this.date = new Date();
        this.singleInputForm = this.fb.group({
            fullName: [''],
            phone: [''],
            email: [''],
            fullRange: ['']
        });
        this.twoInputForm = this.fb.group({
            fullName: [''],
            phone: [''],
            email: [''],
            dateRange: ['']
        });
    }

    public onRangeSelected(event): void {
        console.log(`ngModel selected range -> ${this.content.start} - ${this.content.end}`);
    }

    public submitSingleInputForm(): void {
        console.log(this.singleInputForm);
    }

    public submitTwoInputForm(): void {
        console.log(this.twoInputForm);
    }

    public selectDatRangeDefTemplate(): void {
        const range = this.getFiveDaysRange();
        this.defDateRange.selectRange(range.today, range.inFiveDays);
    }

    public selectDateRangeSingleInput(): void {
        const range = this.getFiveDaysRange();
        this.singleInputDateRange.selectRange(range.today, range.inFiveDays);
    }

    public getFiveDaysRange() {
        const today = new Date();
        const inFiveDays = new Date(new Date().setDate(today.getDate() + 5));
        return { today: today, inFiveDays: inFiveDays };
    }

    public formatter(date: Date) {
        return `${this.dayFormatter.format(date)}, ${date.getDate()} ${this.monthFormatter.format(date)}, ${date.getFullYear()}`;
    }
}
