import { Component, ChangeDetectionStrategy } from '@angular/core';
import { NgFor } from '@angular/common';
import { UntypedFormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IgxButtonDirective } from '../../../projects/igniteui-angular/src/lib/directives/button/button.directive';
import { IgxCheckboxComponent } from '../../../projects/igniteui-angular/src/lib/checkbox/checkbox.component';
import { IgxAvatarComponent } from '../../../projects/igniteui-angular/src/lib/avatar/avatar.component';
import { IgxSwitchComponent } from '../../../projects/igniteui-angular/src/lib/switch/switch.component';
import { IgxIconComponent } from '../../../projects/igniteui-angular/src/lib/icon/icon.component';
import { IgxListItemComponent } from '../../../projects/igniteui-angular/src/lib/list/list-item.component';
import { IgxListComponent, IgxListThumbnailDirective, IgxListLineTitleDirective, IgxListActionDirective } from '../../../projects/igniteui-angular/src/lib/list/list.component';
import { IChangeRadioEventArgs, IgxRadioComponent } from '../../../projects/igniteui-angular/src/lib/radio/radio.component';
import { IgxLabelDirective } from '../../../projects/igniteui-angular/src/lib/directives/label/label.directive';
import { IgxInputDirective } from '../../../projects/igniteui-angular/src/lib/directives/input/input.directive';
import { IgxInputGroupComponent } from '../../../projects/igniteui-angular/src/lib/input-group/input-group.component';

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'app-input-sample',
    styleUrls: ['input.sample.css'],
    templateUrl: 'input.sample.html',
    standalone: true,
    imports: [FormsModule, IgxInputGroupComponent, IgxInputDirective, IgxLabelDirective, NgFor, IgxRadioComponent, IgxListComponent, IgxListItemComponent, IgxIconComponent, IgxListThumbnailDirective, IgxListLineTitleDirective, IgxListActionDirective, IgxSwitchComponent, IgxAvatarComponent, IgxCheckboxComponent, ReactiveFormsModule, IgxButtonDirective]
})
export class InputSampleComponent {
    public placeholder = 'Please enter a value';
    public placeholderDate = new Date();
    public selected = 'option1';
    public airplaneMode = false;

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
    public settings = [{
        name: 'WiFi',
        icon: 'wifi',
        active: true,
        disabled: false
    },
    {
        name: 'Bluetooth',
        icon: 'bluetooth',
        active: true,
        disabled: false
    }, {
        name: 'Device Visibility',
        icon: 'visibility',
        active: false,
        disabled: true
    }];

    constructor(private fb: UntypedFormBuilder) {}

    public onClick(event: MouseEvent) {
        console.log(event);
    }

    public onChange(value: string) {
        console.log(value);
    }

    public onRadioChanged(event: IChangeRadioEventArgs) {
        console.log(event);
    }

    public selectSecond() {
        this.selected = 'option2';
    }

    public toggleAirplaneMode() {
        this.settings.forEach(setting => {
            setting.active = !this.airplaneMode;
            setting.disabled = this.airplaneMode;
        });
    }
}
