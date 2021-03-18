import { Component, ChangeDetectionStrategy } from '@angular/core';
import { IChangeRadioEventArgs } from 'igniteui-angular';

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'app-input-sample',
    styleUrls: ['input.sample.css'],
    templateUrl: 'input.sample.html'
})
export class InputSampleComponent {
    public placeholder = 'Please enter a value';
    public selected = 'option1';

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
}
