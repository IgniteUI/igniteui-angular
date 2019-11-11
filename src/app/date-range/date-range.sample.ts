import { Component, ViewChild, OnInit } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { IgxDateRangeComponent } from 'igniteui-angular';

@Component({
    selector: 'app-date-range',
    templateUrl: './date-range.sample.html',
    styleUrls: ['./date-range.sample.scss']
})
export class DateRangeSampleComponent implements OnInit {
    @ViewChild(IgxDateRangeComponent, { read: IgxDateRangeComponent, static: false })
    public dateRange: IgxDateRangeComponent;
    public date: Date = new Date(Date.now());
    public form: FormGroup;
    public showSingleInput: boolean;

    private dayFormatter = new Intl.DateTimeFormat('en', { weekday: 'long' });
    private monthFormatter = new Intl.DateTimeFormat('en', { month: 'long' });

    constructor(private fb: FormBuilder) { }

    public ngOnInit(): void {
        this.form = this.fb.group({
            fullName: [''],
            phone: [''],
            email: [''],
            startDate: [''],
            endDate: [''],
            fullRange: ['']
        });
    }

    public onSubmit(): void {
        console.log(this.form);
    }

    public selectDateRange(): void {
        const today = new Date();
        const inFiveDays = new Date(new Date().setDate(today.getDate() + 5));
        this.dateRange.selectRange(today, inFiveDays);
    }

    public formatter = (date: Date) => {
        return `${this.dayFormatter.format(date)}, ${date.getDate()} ${this.monthFormatter.format(date)}, ${date.getFullYear()}`;
    }

    public toggleSingleInputDisplay(): void {
        this.showSingleInput = !this.showSingleInput;
    }
}
