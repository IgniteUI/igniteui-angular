import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { IgxCheckboxComponent } from 'igniteui-angular/checkbox';
import { IgxButtonDirective } from 'igniteui-angular/directives';
import {
    IGX_INPUT_GROUP_DIRECTIVES,
} from 'igniteui-angular/input-group';
import { IGX_RADIO_GROUP_DIRECTIVES } from 'igniteui-angular/radio';
import { IgxSwitchComponent } from 'igniteui-angular/switch';

@Component({
    selector: 'app-form',
    imports: [
        IgxCheckboxComponent,
        IgxSwitchComponent,
        IGX_RADIO_GROUP_DIRECTIVES,
        IgxButtonDirective,
        IGX_INPUT_GROUP_DIRECTIVES,
        ReactiveFormsModule
    ],
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
