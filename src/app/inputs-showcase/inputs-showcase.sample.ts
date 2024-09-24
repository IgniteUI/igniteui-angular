import { Component, ChangeDetectionStrategy } from '@angular/core';
import { NgFor } from '@angular/common';
import { UntypedFormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IChangeCheckboxEventArgs, IGX_INPUT_GROUP_DIRECTIVES, IGX_LIST_DIRECTIVES, IgxAvatarComponent, IgxButtonDirective, IgxCheckboxComponent, IgxIconComponent, IgxRadioComponent, IgxSwitchComponent } from 'igniteui-angular';
import { defineComponents, IgcRadioComponent, IgcRadioGroupComponent, IgcSwitchComponent, IgcCheckboxComponent} from "igniteui-webcomponents";

defineComponents(IgcRadioComponent, IgcRadioGroupComponent, IgcSwitchComponent, IgcCheckboxComponent);


@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'app-input-showcase-sample',
    styleUrls: ['inputs-showcase.sample.scss'],
    templateUrl: 'inputs-showcase.sample.html',
    standalone: true,
    imports: [FormsModule, NgFor, ReactiveFormsModule, IGX_INPUT_GROUP_DIRECTIVES, IGX_LIST_DIRECTIVES, IgxSwitchComponent, IgxIconComponent, IgxCheckboxComponent, IgxAvatarComponent, IgxRadioComponent, IgxButtonDirective]
})
export class InputsShowcaseSampleComponent {
    public placeholder = 'Please enter a value';
    public placeholderDate = new Date();
    public selected = 'option1';
    public airplaneMode = false;
    public isToggled = false;
    public isToggledWC = false; // Initial state

    public myForm = this.fb.group({
        checkbox: [],
        switch: []
    });

    public user = {
        comment: '',
        firstName: 'John',
        gender: 'Male',
        lastName: 'Doe',
        password: '1337s3cr3t',
        registered: false,
        subscribed: false,
        dateOfBirth: new Date('07 July, 1987')
    };
    public user2 = {
        comment: '',
        firstName: 'John',
        gender: 'Male',
        lastName: 'Doe',
        password: '1337s3cr3t',
        registered: true,
        subscribed: false,
        dateOfBirth: new Date('01 July, 1954')
    };

    constructor(private fb: UntypedFormBuilder) {}

    public onClick(event: MouseEvent) {
        console.log(event);
    }

    public onChange(value: string) {
        console.log(value);
    }

    public onRadioChanged(event: IChangeCheckboxEventArgs) {
        console.log(event);
    }
}
