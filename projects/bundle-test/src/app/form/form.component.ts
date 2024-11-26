import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { IGX_INPUT_GROUP_DIRECTIVES, IGX_RADIO_GROUP_DIRECTIVES, IgxButtonDirective, IgxCheckboxComponent, IgxSwitchComponent } from 'igniteui-angular';

@Component({
    selector: 'app-form',
    imports: [IgxCheckboxComponent, IgxSwitchComponent, IGX_RADIO_GROUP_DIRECTIVES, IgxButtonDirective, IGX_INPUT_GROUP_DIRECTIVES, ReactiveFormsModule],
    templateUrl: './form.component.html',
    styleUrls: ['./form.component.scss']
})
export class FormComponent {
    public form: FormGroup;

    constructor(private fb: FormBuilder) {
        this.form = this.fb.group({
            'radio': [2, Validators.required],
            'checkbox': [false, Validators.required],
            'switch': [false, Validators.required],
            'input': ['', Validators.required],
        });
    }
}
