import { Component } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl, ValidatorFn, AbstractControl } from '@angular/forms';
import { DateRange, IChangeRadioEventArgs } from 'igniteui-angular';

@Component({
    selector: 'app-date-range',
    templateUrl: './date-range.sample.html',
    styleUrls: ['./date-range.sample.scss']
})
export class DateRangeSampleComponent {
    public range: DateRange = { start: new Date('2000,10,1'), end: new Date('2000,10,20') };
    public range1: DateRange = { start: new Date(), end: new Date(new Date().setDate(new Date().getDate() + 5)) };
    public range2: DateRange;
    public range3: DateRange = { start: new Date(), end: new Date(new Date().setDate(new Date().getDate() + 5)) };
    public range4: DateRange;
    public range5: DateRange = { start: new Date(), end: new Date(new Date().setDate(new Date().getDate() + 5)) };
    public range6Start = null;
    public range6End = null;
    public range6: DateRange = { start: this.range6Start, end: this.range6End };
    public minDate: Date = new Date();
    public maxDate: Date = new Date(new Date().setDate(new Date().getDate() + 25));

    public reactiveForm: FormGroup;

    public updateOnOptions: string[] = ['change', 'blur', 'submit'];
    public updateOn = 'blur';

    constructor(fb: FormBuilder) {
        const today = new Date();
        const in5days = new Date();
        in5days.setDate(today.getDate() + 5);
        const r1: DateRange = { start: new Date(today.getTime()), end: new Date(in5days.getTime()) };
        const r2: DateRange = { start: new Date(today.getTime()), end: new Date(in5days.getTime()) };
        this.reactiveForm = fb.group({
            dp1: [r1, { validators: Validators.required, updateOn: this.updateOn }],
            dp2: ['', { validators: Validators.required, updateOn: this.updateOn }],
            dp3: [r2, { validators: [Validators.required, minDateValidator(this.minDate)] }],
            dp4: ['', { validators: Validators.required, updateOn: this.updateOn }],
            start5: [r2.start, { validators: Validators.required, updateOn: this.updateOn }],
            end5: [r2.end, { validators: Validators.required, updateOn: this.updateOn }],
            start6: ['', { validators: Validators.required, updateOn: this.updateOn }],
            end6: ['', { validators: Validators.required, updateOn: this.updateOn }],
        });
    }

    public updateOnChange(e: IChangeRadioEventArgs) {
        Object.keys(this.reactiveForm.controls).forEach(name => {
            const control = this.reactiveForm.controls[name];
            const value = control.value;
            const newControl = new FormControl(
                value,
                { updateOn: e.value, validators: Validators.required }
            );
            this.reactiveForm.setControl(name, newControl);
        });
    }
}
const minDateValidator = (minValue: Date): ValidatorFn => (control: AbstractControl): { [key: string]: any } | null => {
    if (control.value && (control.value.start as Date).getTime() < minValue.getTime()) {
        return { minValue: true };
    }

    return null;
};
